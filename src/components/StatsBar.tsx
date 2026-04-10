import { Users, Target, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Candidate } from "@/data/mockData";

interface Props {
  candidates: Candidate[];
}

export const StatsBar = ({ candidates }: Props) => {
  const avgScore = Math.round(candidates.reduce((a, c) => a + c.matchScore, 0) / candidates.length);
  const topScore = Math.max(...candidates.map(c => c.matchScore));
  const strongCandidates = candidates.filter(c => c.matchScore >= 75).length;

  const stats = [
    { icon: Users, label: "Total Candidates", value: candidates.length, color: "text-primary" },
    { icon: Target, label: "Avg Match", value: `${avgScore}%`, color: "text-info" },
    { icon: TrendingUp, label: "Top Score", value: `${topScore}%`, color: "text-success" },
    { icon: Award, label: "Strong Matches", value: strongCandidates, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
};
