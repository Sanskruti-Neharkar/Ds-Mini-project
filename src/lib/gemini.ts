import { GoogleGenAI } from '@google/genai';
import { Candidate } from '../data/mockData';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function analyzeResume(resumeText: string, jobDescription: string, fileName: string): Promise<Candidate> {
  const prompt = `You are an advanced ATS Resume Analyzer.

Analyze the given resume text and return ONLY valid JSON (no explanation).

Resume:
${resumeText}

Extract and generate structured data in this exact format:

{
  "name": "Full name from resume (do not guess)",
  "title": "Professional headline or role",
  "location": "City, Country if available",
  "experience": "Total years of experience (estimate if needed)",
  "email": "Extract email",
  
  "skills": {
    "technical": [],
    "tools": [],
    "soft": []
  },

  "projects": [
    {
      "name": "",
      "description": "",
      "tech_stack": []
    }
  ],

  "atsScore": 85,

  "scoreBreakdown": {
    "skills": 85,
    "experience": 90,
    "formatting": 80,
    "keywords": 75
  },

  "strengths": [
    "Short bullet points"
  ],

  "weaknesses": [
    "Short bullet points"
  ],

  "grammarIssues": [
    "Specific issue with correction"
  ],

  "aiDetectionScore": 20,

  "bulletImprovements": [
    {
      "original": "",
      "improved": "",
      "reason": ""
    }
  ],

  "skillRadar": [
    { "category": "Frontend", "score": 85 },
    { "category": "Backend", "score": 70 },
    { "category": "DevOps", "score": 50 },
    { "category": "Communication", "score": 90 },
    { "category": "Architecture", "score": 60 }
  ]
}

Rules:
- Do NOT hallucinate missing data
- If data is missing, return empty string or empty array
- Keep output clean and structured
- ATS Score must be realistic:
  90+ -> exceptional (rare)
  75-89 -> strong
  60-74 -> average
  40-59 -> weak
  below 40 -> poor
- Do NOT give high scores unless clearly justified
- Only include skills explicitly mentioned in the resume
- Do NOT infer or assume skills
- AI Detection:
  - High score (>70) only if text is overly generic, repetitive, or unnatural
  - Low score (<30) if resume feels human-written with specific details
- Weaknesses must be critical and actionable (not generic)
- Grammar issues must be real, not fabricated
- Bullet improvements must:
  - Add measurable impact (numbers, results)
  - Use strong action verbs
  - Be concise and professional`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2, // Low temp for more deterministic JSON
          responseMimeType: 'application/json',
        }
      });
    } catch (apiError) {
      console.warn("Gemini 2.5 flash failed, trying fallback to lite:", apiError);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      });
    }

    const text = response?.text || "{}";
    const cleanedText = text.replace(/```(?:json|JSON)?\n?/gi, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);
    
    // Auto-generate missing properties to satisfy Candidate interface strictly
    
    // Map the user's nested skills structure into a flat array for the UI
    let flatSkills: string[] = [];
    if (result.skills) {
       flatSkills = [
         ...(result.skills.technical || []),
         ...(result.skills.tools || []),
         ...(result.skills.soft || [])
       ];
    }
    
    const candidate: Candidate = {
      id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: result.name || fileName.split('.')[0] || 'Unknown Candidate',
      email: result.email || 'Not provided',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(result.name || fileName)}&backgroundColor=0f1115,1e1e2e&fontFamily=Inter&textColor=ffffff`,
      title: result.title || 'Applicant',
      
      // Parse experience (handle string "Total years..." or numbers)
      experience: parseInt(String(result.experience).replace(/[^0-9]/g, '')) || 0,
      
      skills: flatSkills.length > 0 ? flatSkills : [],
      matchedSkills: flatSkills.slice(0, 3) || [],
      missingSkills: [],
      
      matchScore: typeof result.atsScore === 'number' ? result.atsScore : 0,
      
      // Create a dynamic summary since it was removed from the prompt
      summary: `A candidate matching ${result.atsScore}% of typical technical requirements. Brings ${result.experience} of history with strengths in ${result.strengths?.[0] || 'various domains'}.`,
      
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      education: 'Not specified',
      location: result.location || 'Not specified',
      
      scoreBreakdown: result.scoreBreakdown || { skills: 0, experience: 0, formatting: 0, keywords: 0 },
      aiDetectionScore: typeof result.aiDetectionScore === 'number' ? result.aiDetectionScore : 0,
      grammarIssues: Array.isArray(result.grammarIssues) ? result.grammarIssues : [],
      
      // Default section feedback since it was removed from the new prompt
      sectionFeedback: { 
        education: "N/A based on current ATS rules.", 
        skills: flatSkills.length > 0 ? "Strong technical keyword diversity detected." : "Consider adding more explicit keywords.", 
        experience: "Focus on adding quantified metrics.", 
        projects: Array.isArray(result.projects) && result.projects.length > 0 ? "Great projects listed." : "Add a projects portfolio to stand out." 
      },
      
      bulletImprovements: Array.isArray(result.bulletImprovements) ? result.bulletImprovements : [],
      skillRadar: Array.isArray(result.skillRadar) ? result.skillRadar : [{ category: "General", score: 50 }],
      profileSummary: `ATS scan completed with a final score of ${result.atsScore}. Review bullet improvements and red flags.`
    };

    return candidate;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Best-effort manual extraction fallback if JSON fails
    let fallbackName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const lines = resumeText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0 && lines[0].split(' ').length <= 4) {
      fallbackName = lines[0].trim(); // Guess first line is name
    }

    return {
      id: `error-${Date.now()}`,
      name: fallbackName,
      email: 'Unknown',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Error&backgroundColor=ef4444&fontFamily=Inter`,
      title: 'Applicant (Parse Failed)',
      experience: 0,
      skills: [],
      matchedSkills: [],
      missingSkills: [],
      matchScore: 0,
      summary: `Failed to analyze resume via AI. Check file content or API limits.`,
      strengths: [],
      weaknesses: ["AI Parsing Failed", "Could not read structure"],
      education: 'Unknown',
      location: 'Unknown',
      scoreBreakdown: { skills: 0, experience: 0, formatting: 0, keywords: 0 },
      aiDetectionScore: 0,
      grammarIssues: ["Analysis failed."],
      sectionFeedback: { education: "", skills: "", experience: "", projects: "" },
      bulletImprovements: [],
      skillRadar: [],
      profileSummary: "We encountered a network or formatting error preventing AI analysis."
    };
  }
}
