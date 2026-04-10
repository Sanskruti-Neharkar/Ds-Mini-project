export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  experience: number;
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  education: string;
  location: string;

  // New advanced fields
  scoreBreakdown: {
    skills: number;
    experience: number;
    formatting: number;
    keywords: number;
  };
  aiDetectionScore: number; // 0 to 100 probability
  grammarIssues: string[];
  sectionFeedback: {
    education: string;
    skills: string;
    experience: string;
    projects: string;
  };
  bulletImprovements: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
  skillRadar: Array<{
    category: string;
    score: number;
  }>;
  profileSummary: string;
}



export const predefinedRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Product Manager",
  "QA Engineer",
  "UI/UX Designer"
];
