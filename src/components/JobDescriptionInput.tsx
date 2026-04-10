import { Briefcase, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { predefinedRoles } from "@/data/mockData";

interface Props {
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  selectedRole: string;
  onRoleChange: (val: string) => void;
}

export const JobDescriptionInput = ({ jobDescription, onJobDescriptionChange, selectedRole, onRoleChange }: Props) => {
  const [showRoles, setShowRoles] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 md:p-8 rounded-[2rem] border border-border/50 relative z-10">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="h-5 w-5 text-accent" /> Job Description</h2>

      <div className="relative mb-6">
        <button
          onClick={() => setShowRoles(!showRoles)}
          className="w-full flex items-center justify-between bg-secondary/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium hover:bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            {selectedRole || "Select a predefined role..."}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showRoles ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showRoles && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-20 mt-2 w-full glass-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            >
              <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
                {predefinedRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => { onRoleChange(role); setShowRoles(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/10 rounded-xl transition-colors ${
                      selectedRole === role ? "bg-primary/10 text-primary font-bold" : ""
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder="Paste the job description here..."
        rows={6}
        className="w-full rounded-2xl bg-secondary/20 border border-border/50 px-5 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
      />
    </motion.div>
  );
};
