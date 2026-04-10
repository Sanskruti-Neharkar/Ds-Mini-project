import { Brain, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";

export const Header = () => (
  <motion.header
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl"
  >
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="gradient-bg p-2 rounded-xl">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="gradient-text">HireAI</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            Intelligent Screening
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-bg-subtle text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered
        </div>
        <ThemeToggle />
      </div>
    </div>
  </motion.header>
);
