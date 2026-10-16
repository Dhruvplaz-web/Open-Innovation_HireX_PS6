import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';

interface FloatingCopilotButtonProps {
  onOpenAgent: (initialPrompt?: string) => void;
  disabled?: boolean;
}

export const FloatingCopilotButton: React.FC<FloatingCopilotButtonProps> = ({ onOpenAgent, disabled = false }) => {
  const { isAssessmentActive } = useAssessment();

  // The global Placement Co-Pilot must NOT appear during active proctored assessments
  if (isAssessmentActive || disabled) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <button
        onClick={() => onOpenAgent()}
        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-900 dark:hover:bg-slate-800 text-white text-xs font-semibold shadow-lg hover:shadow-xl flex items-center gap-2.5 transition-all duration-150 border border-slate-700/80 dark:border-slate-700/60 active:scale-98 group"
        title="Open HireX Placement AI Co-Pilot (Ctrl+K / ⌘K)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
        <span className="tracking-tight">Placement Co-Pilot</span>
        <kbd className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700/50">
          ⌘K
        </kbd>
      </button>
    </div>
  );
};
