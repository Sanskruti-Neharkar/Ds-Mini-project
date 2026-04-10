import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  duration?: number;
}

export const AnimatedCounter = ({ value, duration = 1.5 }: Props) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (val) => setDisplayValue(Math.round(val)),
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, duration]);

  return <span>{displayValue}</span>;
};
