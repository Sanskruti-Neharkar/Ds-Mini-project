import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, X, FileSearch } from "lucide-react";
import { Header } from "@/components/Header";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { analyzeResume } from "@/lib/gemini";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateModal } from "@/components/CandidateModal";
import { ComparisonModal } from "@/components/ComparisonModal";
import { Candidate } from "@/data/mockData";
import { ExtractedResume } from "@/components/ResumeUpload";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { CandidateAvatar } from "@/components/CandidateAvatar";

type Stage = "setup" | "analyzing" | "results";

const Index = () => {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score-desc");
  const [minScore, setMinScore] = useState(0);

  // Comparison state
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const compareMode = compareIds.size > 0;

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      } else {
        toast.error("Maximum 3 candidates", { description: "Deselect one to add another." });
      }
      return next;
    });
  }, []);

  const [analysisTask, setAnalysisTask] = useState<Promise<Candidate[]> | null>(null);

  const handleUploadComplete = useCallback((resumes: ExtractedResume[]) => {
    if (resumes.length === 0) return;
    setStage("analyzing");
    
    // Process real AI analysis
    const task = Promise.all(
      resumes.map(resume => analyzeResume(resume.text, jobDescription, resume.fileName))
    );
    
    setAnalysisTask(task);
  }, [jobDescription]);

  const handleAnalysisComplete = useCallback((data: Candidate[]) => {
    if (!data || data.length === 0) {
      toast.error("Analysis failed", { description: "No candidates could be successfully generated." });
      setStage("setup");
      return;
    }
    setCandidates(data);
    setStage("results");
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
    
    toast.success("Analysis Complete ✅", { description: `${data.length} candidates ranked successfully.` });
  }, []);

  const filtered = useMemo(() => {
    let result = candidates.filter(c => c.matchScore >= minScore);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sortBy === "score-desc") return b.matchScore - a.matchScore;
      if (sortBy === "score-asc") return a.matchScore - b.matchScore;
      return b.experience - a.experience;
    });
    return result;
  }, [candidates, search, sortBy, minScore]);

  const comparedCandidates = useMemo(
    () => candidates.filter(c => compareIds.has(c.id)),
    [candidates, compareIds]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {stage === "setup" && (
            <motion.div key="setup" exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12 pb-16">
              <div className="space-y-6 mt-12 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  Gemini-Powered ATS Analyzer
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
                >
                  Your AI Resume Assistant <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">is Ready</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Upload resumes to instantly uncover skill gaps, rewrite weak bullet points, highlight grammar issues, and detect AI-generation.
                </motion.p>
              </div>

              <div className="w-full grid md:grid-cols-2 gap-6 text-left">
                <ResumeUpload onUploadComplete={handleUploadComplete} />
                <JobDescriptionInput
                  jobDescription={jobDescription}
                  onJobDescriptionChange={setJobDescription}
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />
              </div>
            </motion.div>
          )}

          {stage === "analyzing" && analysisTask && (
            <motion.div key="analyzing" exit={{ opacity: 0 }}>
              <AnalyzingScreen analysisTask={analysisTask} onComplete={handleAnalysisComplete} />
            </motion.div>
          )}

          {stage === "results" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Candidate Rankings</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedRole && <span className="font-medium text-primary">{selectedRole}</span>}
                    {selectedRole && " • "}{filtered.length} candidates found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!compareMode && (
                    <button
                      onClick={() => toast.info("Select 2-3 candidates to compare", { description: "Click the checkboxes on candidate cards." })}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg-subtle text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
                    >
                      <GitCompareArrows className="h-4 w-4" />
                      Compare
                    </button>
                  )}
                  <button
                    onClick={() => { setStage("setup"); setCandidates([]); setCompareIds(new Set()); }}
                    className="px-4 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              <StatsBar candidates={candidates} />
              <FilterBar
                search={search} onSearchChange={setSearch}
                sortBy={sortBy} onSortChange={setSortBy}
                minScore={minScore} onMinScoreChange={setMinScore}
              />

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c, i) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    index={i}
                    onClick={() => setSelectedCandidate(c)}
                    compareMode={true}
                    isSelected={compareIds.has(c.id)}
                    onToggleCompare={() => toggleCompare(c.id)}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-[2rem] border-border/50 col-span-full">
                  <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-5 border border-border/50 shadow-inner">
                    <FileSearch className="h-10 w-10 text-muted-foreground/80" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No candidates found</h3>
                  <p className="text-sm text-muted-foreground max-w-[300px] mb-6">We couldn't find any candidates matching your current filters. Try lowering the score threshold.</p>
                  <button onClick={() => { setSearch(""); setMinScore(0); }} className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-sm font-semibold transition-colors">
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating compare bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-card rounded-2xl shadow-2xl border border-border/50 px-5 py-3 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              {comparedCandidates.map(c => (
                <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10">
                  <CandidateAvatar name={c.name} className="w-5 h-5 rounded-md text-[9px]" />
                  <span className="text-xs font-medium">{c.name.split(" ")[0]}</span>
                  <button onClick={() => toggleCompare(c.id)} className="ml-0.5 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{compareIds.size}/3</span>
            <button
              onClick={() => {
                if (compareIds.size < 2) {
                  toast.error("Select at least 2 candidates");
                  return;
                }
                setShowComparison(true);
              }}
              disabled={compareIds.size < 2}
              className="gradient-bg text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Compare
            </button>
            <button onClick={() => setCompareIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      {showComparison && (
        <ComparisonModal candidates={comparedCandidates} onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
};

export default Index;
