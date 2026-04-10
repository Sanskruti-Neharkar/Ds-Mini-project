import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  minScore: number;
  onMinScoreChange: (val: number) => void;
}

export const FilterBar = ({ search, onSearchChange, sortBy, onSortChange, minScore, onMinScoreChange }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search candidates, skills..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">Min:</span>
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-12 bg-transparent text-center font-medium focus:outline-none"
          />
          <span className="text-muted-foreground text-xs">%</span>
        </div>

        <button
          onClick={() => onSortChange(sortBy === "score-desc" ? "score-asc" : sortBy === "score-asc" ? "exp-desc" : "score-desc")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm hover:bg-secondary transition-colors"
        >
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            {sortBy === "score-desc" ? "Score ↓" : sortBy === "score-asc" ? "Score ↑" : "Exp ↓"}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
