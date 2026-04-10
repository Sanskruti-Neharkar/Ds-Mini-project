import { motion } from "framer-motion";

interface Props {
  score: number;
}

export const ResumeHealthMeter = ({ score }: Props) => {
  const getQualityText = (s: number) => {
    if (s < 50) return "Weak";
    if (s < 70) return "Average";
    if (s < 85) return "Strong";
    return "Excellent";
  };

  const getQualityColor = (s: number) => {
    if (s < 50) return "text-destructive";
    if (s < 70) return "text-warning";
    if (s < 85) return "text-info";
    return "text-success";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span>Resume Health</span>
        <span className={getQualityColor(score)}>{getQualityText(score)}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
        {/* Subtle background segments for visual guides */}
        <div className="absolute inset-0 flex border-x border-border/20">
          <div className="flex-1 border-r border-border/20"></div>
          <div className="flex-1 border-r border-border/20"></div>
          <div className="flex-1"></div>
        </div>
        {/* The gradient progressive bar */}
        <motion.div
          initial={{ width: "0%" }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-destructive via-warning to-success rounded-full"
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
        <span>Weak</span>
        <span>Average</span>
        <span>Strong</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};
