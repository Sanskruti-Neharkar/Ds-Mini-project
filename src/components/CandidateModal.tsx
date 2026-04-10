import { X, MapPin, Mail, Clock, TrendingUp, TrendingDown, Sparkles, AlertTriangle, Download, CheckCircle2, Bot, Info, ThumbsUp, ThumbsDown, HelpCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Candidate } from "@/data/mockData";
import { ScoreCircle } from "./ScoreCircle";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResumeHealthMeter } from "./ResumeHealthMeter";
import { AnimatedCounter } from "./AnimatedCounter";
import { CandidateAvatar } from "./CandidateAvatar";

const playPopSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio context errors if user hasn't interacted yet
  }
};

interface Props {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateModal = ({ candidate, onClose }: Props) => {
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [showImproved, setShowImproved] = useState(false);

  if (!candidate) return null;

  const aiLikelihoodColor = candidate.aiDetectionScore > 75 
    ? "text-destructive bg-destructive/10 border-destructive/20" 
    : candidate.aiDetectionScore > 40 
      ? "text-warning bg-warning/10 border-warning/20"
      : "text-success bg-success/10 border-success/20";

  const getHireRecommendation = () => {
    if (candidate.matchScore >= 85 && candidate.aiDetectionScore < 50) return { text: "Strong Yes", color: "text-success bg-success/10", icon: <ThumbsUp className="h-5 w-5" /> };
    if (candidate.matchScore >= 65) return { text: "Potential Fit", color: "text-warning bg-warning/10", icon: <HelpCircle className="h-5 w-5" /> };
    return { text: "Pass", color: "text-destructive bg-destructive/10", icon: <ThumbsDown className="h-5 w-5" /> };
  };
  const recommendation = getHireRecommendation();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-6xl max-h-[92vh] rounded-[2rem] shadow-2xl flex flex-col border border-border/50 overflow-hidden relative"
        >
          {/* Header Area */}
          <div className="relative pt-12 px-8 pb-8 flex-shrink-0 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
            {/* Top Toolbar */}
            <div className="absolute top-6 left-8 right-6 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-secondary/80 backdrop-blur-xl border border-border/50 px-3 py-1.5 rounded-full">
                <span className={`text-xs ${!isRecruiterMode ? "font-bold text-foreground" : "text-muted-foreground"}`}>Candidate</span>
                <Switch checked={isRecruiterMode} onCheckedChange={(val) => { playPopSound(); setIsRecruiterMode(val); }} />
                <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${isRecruiterMode ? "font-bold bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                  Recruiter View
                </span>
              </div>
              <button onClick={() => { playPopSound(); onClose(); }} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors hover:scale-105 active:scale-95 duration-200">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row mt-6 md:items-end justify-between gap-6 hover-lift transition-transform">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-colors duration-500"></div>
                  <CandidateAvatar name={candidate.name} className="w-24 h-24 rounded-2xl relative z-10 border-2 border-primary/20 shadow-xl group-hover:scale-105 transition-transform duration-300 text-3xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-extrabold tracking-tight">{candidate.name}</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`px-2.5 py-1 flex-shrink-0 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-help ${aiLikelihoodColor}`}>
                          <Bot className="h-3 w-3" />
                          <AnimatedCounter value={candidate.aiDetectionScore} />% AI Generated
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-sm">Probability this resume was written by generating AI tools.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">{candidate.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/80 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{candidate.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{candidate.experience}y exp</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" />{candidate.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-border/50 hover:bg-secondary/70 transition-colors cursor-pointer group">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">ATS Match Score</p>
                  <p className="text-sm font-medium text-foreground">Health Evaluated</p>
                </div>
                <ScoreCircle score={candidate.matchScore} size={70} strokeWidth={6} />
              </div>
            </div>
          </div>

          {/* Body Area */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar bg-secondary/20 scroll-smooth">
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              
              {/* Main Content Column */}
              <div className="space-y-8">
                
                {/* Recruiter View exclusive card */}
                <AnimatePresence mode="popLayout">
                  {isRecruiterMode && (
                    <motion.section 
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="glass-card p-6 rounded-2xl border-l-[6px] border-primary flex items-start gap-6 overflow-hidden"
                    >
                      <div className={`p-4 rounded-xl flex-shrink-0 flex items-center justify-center ${recommendation.color}`}>
                        {recommendation.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Hire Recommendation: {recommendation.text}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{candidate.profileSummary}</p>
                        
                        {(candidate.weaknesses.length > 0 || candidate.grammarIssues.length > 0) && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <h4 className="text-destructive text-xs font-bold uppercase flex items-center gap-1 mb-2">
                              <AlertTriangle className="h-3.5 w-3.5" /> Red Flags Context
                            </h4>
                            <ul className="text-xs text-foreground/80 space-y-1">
                              {candidate.weaknesses.map(w => <li key={w}>- {w}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Score Breakdown Bars & Health Meter */}
                <section className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-semibold text-lg cursor-help flex items-center gap-2">Core Metrics <Info className="h-4 w-4 text-muted-foreground" /></h3>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-sm">Granular breakdown of the ATS score.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="mb-8">
                   <ResumeHealthMeter score={candidate.matchScore} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(candidate.scoreBreakdown).map(([key, val]) => (
                      <div key={key} className="group">
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                          <span className="capitalize">{key}</span>
                          <span className="text-muted-foreground group-hover:text-primary transition-colors"><AnimatedCounter value={val} />%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: `${val}%` }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Interactive Bullet Improvements */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between bg-card p-5 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> {candidate.name.split(" ")[0]}, here's how to improve</h3>
                      <p className="text-xs text-muted-foreground mt-1 tracking-wide">AI-powered optimization for maximum impact.</p>
                    </div>
                    <button 
                      onClick={() => { playPopSound(); setShowImproved(!showImproved); }}
                      className={`group font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 border ${
                        showImproved ? 'bg-secondary border-border text-foreground hover:bg-secondary/80' : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 shadow-lg'
                      }`}
                    >
                      <RefreshCcw className={`h-4 w-4 transition-transform duration-500 ${showImproved ? '-rotate-180 text-muted-foreground' : 'rotate-0 text-primary'}`} /> 
                      {showImproved ? "Revert to Original" : "Reveal Improvements"}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {candidate.bulletImprovements.map((bullet, i) => {
                      const isHighImpact = i === 0; // Highlight the very first result
                      return (
                      <motion.div layout key={i} className={`p-5 rounded-2xl border-l-[6px] relative overflow-hidden transition-all duration-500 ${
                        showImproved 
                          ? isHighImpact ? 'glass-card border-l-accent shadow-xl shadow-accent/20 outline outline-1 outline-accent/40' : 'glass-card border-l-success shadow-lg shadow-success/10' 
                          : 'bg-card border border-border border-l-muted hover:border-l-primary'
                      }`}>
                        <div className="relative z-10">
                          <AnimatePresence mode="wait">
                            {showImproved ? (
                              <motion.div 
                                key="improved"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                              >
                                <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-3">
                                  <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isHighImpact ? 'text-accent' : 'text-success'}`}>
                                    <CheckCircle2 className="h-4 w-4" /> AI Optimized
                                  </p>
                                  {isHighImpact && (
                                    <span className="px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-accent/20 text-accent animate-pulse">
                                      High Impact Fix
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm md:text-base text-foreground font-medium leading-relaxed mb-4 text-pretty tracking-wide">"{bullet.improved}"</p>
                                <motion.div initial={{ opacity:0, height: 0 }} animate={{ opacity:1, height: "auto" }} transition={{ delay: 0.4 }} className={`text-xs p-3 rounded-xl inline-flex flex-col gap-1 items-start ${isHighImpact ? 'bg-accent/5 text-accent-foreground border border-accent/20' : 'bg-success/5 text-success-foreground border border-success/20'}`}>
                                  <span className="font-bold opacity-80 uppercase text-[10px] tracking-wider flex items-center gap-1"><Info className="h-3 w-3" /> Why this works</span>
                                  <p>{bullet.reason}</p>
                                </motion.div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="original"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                              >
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">Original Line</p>
                                <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed">"{bullet.original}"</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )})}
                  </div>
                </section>
                
                {/* Section-wise Feedback Grid */}
                {!isRecruiterMode && (
                  <section className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(candidate.sectionFeedback).map(([section, feedback], i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        key={section} className="glass-card hover-lift p-5 rounded-xl transition-colors group cursor-default"
                      >
                        <h4 className="font-bold capitalize mb-2 group-hover:text-primary transition-colors">{section}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
                      </motion.div>
                    ))}
                  </section>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Radar Chart */}
                <div className="glass-card p-6 rounded-2xl hover:shadow-primary/5 transition-shadow">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-semibold text-sm mb-4 cursor-help flex items-center gap-2">Skill Radar <Info className="h-3.5 w-3.5 text-muted-foreground" /></h3>
                    </TooltipTrigger>
                    <TooltipContent><p>Visual mapping of applicant's strong suit.</p></TooltipContent>
                  </Tooltip>
                  <div className="h-64 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={candidate.skillRadar}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }} />
                        <Radar name="Candidate" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: 'hsl(var(--primary))' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Skills Match */}
                <div className="glass-card p-6 rounded-2xl space-y-5">
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-success">Matched Roles / Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchedSkills.map(s => (
                        <motion.span whileHover={{ scale: 1.05 }} key={s} className="px-2.5 py-1 rounded-md bg-success/15 border border-success/30 text-success text-xs font-semibold cursor-default">
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5 text-destructive">
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missingSkills.map(s => (
                        <motion.span whileHover={{ scale: 1.05 }} key={s} className="px-2.5 py-1 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold cursor-default">
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Issues Warning */}
                {candidate.grammarIssues.length > 0 && (
                  <div className="p-5 rounded-2xl bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors">
                    <h3 className="font-semibold text-warning text-sm mb-3 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Editing Issues</h3>
                    <ul className="space-y-2">
                      {candidate.grammarIssues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" /> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
