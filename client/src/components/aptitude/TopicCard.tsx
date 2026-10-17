import React from 'react';
import { TopicInfo } from '../../types/aptitude';
import {
  Calculator,
  Brain,
  Hash,
  Compass,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface Props {
  topic: TopicInfo;
  accuracyPct: number;
  attemptedCount: number;
  onClick: () => void;
  isSelected?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Calculator,
  Brain,
  Hash,
  Compass,
  BookOpen,
  BarChart3
};

export const TopicCard: React.FC<Props> = ({
  topic,
  accuracyPct,
  attemptedCount,
  onClick,
  isSelected = false
}) => {
  const IconComponent = ICON_MAP[topic.icon] || Brain;
  const progressPct = Math.min(100, Math.round((attemptedCount / topic.totalQuestions) * 100));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${topic.title} practice module`}
      className={`group relative p-6 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isSelected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
          : 'bg-white dark:bg-card-dark border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`p-3 rounded-xl border ${topic.accentBg} ${topic.color} transition-transform group-hover:scale-105`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
              {topic.totalQuestions} Questions
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{accuracyPct}% Accuracy</span>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {topic.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {topic.shortDescription}
        </p>

        {/* Sub-topics Preview Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {topic.subTopics.slice(0, 3).map((st, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {st}
            </span>
          ))}
          {topic.subTopics.length > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
              +{topic.subTopics.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar & Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Progress ({attemptedCount}/{topic.totalQuestions})</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{progressPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
            <span>Practice Topic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          {progressPct === 100 && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
