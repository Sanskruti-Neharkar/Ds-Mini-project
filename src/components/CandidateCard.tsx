import { MapPin, Clock, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Candidate } from "@/data/mockData";
import { ScoreCircle } from "./ScoreCircle";
import { CandidateAvatar } from "./CandidateAvatar";

interface Props {
  candidate: Candidate;
  index: number;
  onClick: () => void;
  isSelected?: boolean;
  onToggleCompare?: (e: React.MouseEvent) => void;
  compareMode?: boolean;
}

export const CandidateCard = ({ candidate, index, onClick, isSelected, onToggleCompare, compareMode }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 cursor-pointer group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative ${
        isSelected ? "ring-2 ring-primary border-primary/30" : "hover:border-primary/30"
      }`}
    >
      {/* Compare checkbox */}
      {compareMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare?.(e); }}
          className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "gradient-bg border-transparent"
              : "border-border hover:border-primary/50 bg-background"
          }`}
        >
          {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
        </button>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <CandidateAvatar
            name={candidate.name}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-border text-lg"
          />
          <div>
            <h3 className="font-semibold text-sm">{candidate.name}</h3>
            <p className="text-xs text-muted-foreground">{candidate.title}</p>
          </div>
        </div>
        <ScoreCircle score={candidate.matchScore} size={48} strokeWidth={3} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{candidate.experience}y exp</span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1.5">Matched Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {candidate.matchedSkills.slice(0, 4).map(skill => (
            <span key={skill} className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-medium">{skill}</span>
          ))}
          {candidate.matchedSkills.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[11px] font-medium">+{candidate.matchedSkills.length - 4}</span>
          )}
        </div>
      </div>

      {candidate.missingSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1.5">Missing Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.missingSkills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-[11px] font-medium">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View Profile <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
      </div>
    </motion.div>
  );
};
