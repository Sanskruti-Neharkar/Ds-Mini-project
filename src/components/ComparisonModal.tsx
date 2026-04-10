import { X, Award, MapPin, Clock, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Candidate } from "@/data/mockData";
import { ScoreCircle } from "./ScoreCircle";
import { CandidateAvatar } from "./CandidateAvatar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  candidates: Candidate[];
  onClose: () => void;
}

const COLORS = ["hsl(238,73%,62%)", "hsl(262,83%,58%)", "hsl(152,69%,45%)"];

export const ComparisonModal = ({ candidates, onClose }: Props) => {
  if (candidates.length < 2) return null;

  // Build unified skill set for radar
  const allSkills = [...new Set(candidates.flatMap(c => c.skills))].slice(0, 8);
  const radarData = allSkills.map(skill => {
    const entry: Record<string, string | number> = { skill };
    candidates.forEach((c, i) => {
      entry[`c${i}`] = c.matchedSkills.includes(skill)
        ? 70 + Math.random() * 30
        : c.skills.includes(skill)
        ? 30 + Math.random() * 30
        : 5 + Math.random() * 15;
    });
    return entry;
  });

  // Bar chart data
  const barData = [
    { metric: "Match Score", ...Object.fromEntries(candidates.map((c, i) => [`c${i}`, c.matchScore])) },
    { metric: "Experience", ...Object.fromEntries(candidates.map((c, i) => [`c${i}`, c.experience * 8])) },
    { metric: "Skills Count", ...Object.fromEntries(candidates.map((c, i) => [`c${i}`, c.skills.length * 10])) },
    { metric: "Matched Skills", ...Object.fromEntries(candidates.map((c, i) => [`c${i}`, c.matchedSkills.length * 15])) },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="gradient-bg p-5 rounded-t-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-foreground" />
              <h2 className="text-lg font-bold text-primary-foreground">
                Compare Candidates ({candidates.length})
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Candidate headers */}
            <div className={`grid gap-4 ${candidates.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {candidates.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <CandidateAvatar name={c.name} className="w-14 h-14 rounded-2xl ring-2 text-xl" style={{ borderColor: COLORS[i] }} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ backgroundColor: COLORS[i] }}>
                        {i + 1}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                  <div className="flex justify-center mt-2">
                    <ScoreCircle score={c.matchScore} size={52} strokeWidth={3} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick stats comparison */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-muted-foreground font-medium text-xs">Metric</th>
                    {candidates.map((c, i) => (
                      <th key={c.id} className="p-3 text-center font-medium text-xs" style={{ color: COLORS[i] }}>{c.name.split(" ")[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Match Score", icon: Award, get: (c: Candidate) => `${c.matchScore}%` },
                    { label: "Experience", icon: Clock, get: (c: Candidate) => `${c.experience} years` },
                    { label: "Location", icon: MapPin, get: (c: Candidate) => c.location },
                    { label: "Education", icon: GraduationCap, get: (c: Candidate) => c.education.split(",")[0] },
                    { label: "Total Skills", icon: Award, get: (c: Candidate) => `${c.skills.length}` },
                    { label: "Matched Skills", icon: Award, get: (c: Candidate) => `${c.matchedSkills.length}` },
                  ].map((row, ri) => {
                    const Icon = row.icon;
                    return (
                      <tr key={ri} className="border-b border-border/30 last:border-0">
                        <td className="p-3 flex items-center gap-2 text-muted-foreground text-xs">
                          <Icon className="h-3.5 w-3.5" />{row.label}
                        </td>
                        {candidates.map(c => (
                          <td key={c.id} className="p-3 text-center text-xs font-medium">{row.get(c)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Radar */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-2">Skills Comparison</h3>
                <div className="h-56">
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      {candidates.map((c, i) => (
                        <Radar key={c.id} dataKey={`c${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} name={c.name.split(" ")[0]} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-2">Overall Metrics</h3>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                      {candidates.map((c, i) => (
                        <Bar key={c.id} dataKey={`c${i}`} fill={COLORS[i]} radius={[4, 4, 0, 0]} name={c.name.split(" ")[0]} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Skills detail */}
            <div className={`grid gap-4 ${candidates.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {candidates.map((c, i) => (
                <div key={c.id} className="glass-card rounded-2xl p-4">
                  <h4 className="text-xs font-semibold mb-2" style={{ color: COLORS[i] }}>{c.name.split(" ")[0]}'s Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {c.matchedSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-medium">{s}</span>
                    ))}
                    {c.missingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1">
                    {c.strengths.slice(0, 2).map(s => (
                      <p key={s} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-success flex-shrink-0" />{s}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
