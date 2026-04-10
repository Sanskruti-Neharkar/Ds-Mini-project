import { useMemo, CSSProperties } from "react";

interface Props {
  name: string;
  className?: string;
  style?: CSSProperties;
}

export const CandidateAvatar = ({ name, className = "", style }: Props) => {
  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name.split(" ").filter(p => p.trim() !== "");
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  return (
    <div 
      className={`flex items-center justify-center font-bold tracking-wider text-primary-foreground gradient-bg shadow-inner shadow-black/20 ring-1 ring-white/10 flex-shrink-0 ${className}`}
      style={style}
    >
      {initials}
    </div>
  );
};
