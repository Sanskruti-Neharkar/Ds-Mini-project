import { motion } from "framer-motion";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreCircle = ({ score, size = 56, strokeWidth = 4 }: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return "hsl(var(--success))";
    if (s >= 70) return "hsl(var(--info))";
    if (s >= 50) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <motion.span
        className="absolute text-sm font-bold"
        style={{ color: getColor(score) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score}%
      </motion.span>
    </div>
  );
};
