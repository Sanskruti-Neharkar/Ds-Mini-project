import { motion } from "framer-motion";
import { Brain, FileSearch, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { icon: FileSearch, text: "Parsing Resume..." },
  { icon: Brain, text: "Analyzing Skills..." },
  { icon: Sparkles, text: "Checking ATS Compatibility..." },
  { icon: CheckCircle2, text: "Detecting AI-generated content..." },
];

interface Props {
  analysisTask: Promise<any>;
  onComplete: (data: any) => void;
}

export const AnalyzingScreen = ({ analysisTask, onComplete }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Slowly progress through steps while waiting
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 2) {
          return prev; // Stop at the second to last step until promise resolves
        }
        return prev + 1;
      });
    }, 2000);

    analysisTask.then((data) => {
        clearInterval(interval);
        setCurrentStep(steps.length - 1);
        setTimeout(() => onComplete(data), 1000);
    }).catch(err => {
        clearInterval(interval);
        console.error("Analysis task failed", err);
        // Move to completion anyway
        setCurrentStep(steps.length - 1);
        setTimeout(() => onComplete([]), 1000);
    });

    return () => clearInterval(interval);
  }, [analysisTask, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="gradient-bg p-5 rounded-3xl mb-8"
      >
        <Brain className="h-10 w-10 text-primary-foreground" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 gradient-text">Analyzing Resumes</h2>
      <p className="text-muted-foreground text-sm mb-10">Gemini AI is reviewing your candidates</p>

      <div className="space-y-4 w-full max-w-md">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const active = i <= currentStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: active ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`p-2 rounded-xl ${active ? "gradient-bg" : "bg-secondary"}`}>
                <Icon className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm md:text-base font-medium ${active ? "" : "text-muted-foreground"}`}>{step.text}</span>
              {i < currentStep && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 w-64 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full gradient-bg rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};
