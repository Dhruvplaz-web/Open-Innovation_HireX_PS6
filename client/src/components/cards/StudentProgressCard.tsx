import React from 'react';
import { ChevronDown, CheckCircle, ShieldCheck, Flame, Zap, ArrowRight } from 'lucide-react';

interface StudentProgressCardProps {
  stats: {
    verified_score: number;
    finished_lessons: number;
    ongoing_lessons: number;
    completed_assessments: number;
    rank: number;
    skills_breakdown: Array<{ skill: string; score: number; level: string; verified: boolean }>;
  };
  role: string;
  onOpenAssessment?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  stats,
  role,
  onOpenAssessment,
  onNavigateTab
}) => {
  const cardTitle = role === 'student' ? 'Student Progress & Daily Quest' : role === 'recruiter' ? 'Candidate Pool Vetting' : 'Batch Placement Readiness';
  const cardSubtitle = role === 'student' ? 'Daily streak, NCrF credits & verified milestones' : 'Integrity and skill verification rates';

  const finishedPct = stats?.finished_lessons || 65;
  const ongoingPct = stats?.ongoing_lessons || 38;

  return (
    <div className="card-clay p-6 flex flex-col justify-between bg-white dark:bg-card-dark h-full border border-slate-200/80 dark:border-slate-800 shadow-soft">
      {/* 1. Header with Assessment Trigger & Semester Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {cardTitle}
            </h3>
            {role === 'student' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                5-Day Streak
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cardSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'student' && onOpenAssessment && (
            <button
              onClick={onOpenAssessment}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Verify QR</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span>Semester 6</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Structured Daily Placement Quest (Clean Monolithic Surface, Zero Rainbow Gradients) */}
      {role === 'student' && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Daily Placement Quest (1 of 2 Complete)
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
              +25 XP toward NCrF Credit
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs my-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                Kadane's O(N) Solved
              </span>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('aptitude') : null}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 hover:border-slate-400 dark:hover:border-slate-600 transition text-left group"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Code Lab & AST Duel</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>NCrF 4.0 Ledger: <strong className="font-mono text-slate-700 dark:text-slate-200">18.5 / 20 Credits</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">92% to Exemption</span>
          </div>
        </div>
      )}

      {/* 3. Precision Linear Gauges (Zero Rainbow Sludge) */}
      <div className="space-y-4 my-2">
        {/* Finished Lessons */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>{role === 'student' ? 'Finished Modules & Lab Tests' : 'Verified Assessments'}</span>
            <span className="text-slate-500 font-bold font-mono tabular-nums">{finishedPct}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-slate-100 transition-all duration-500"
              style={{ width: `${finishedPct}%` }}
            />
          </div>
        </div>

        {/* Ongoing Lessons */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>{role === 'student' ? 'Ongoing Projects & Micro-Credentials' : 'Pending Verification'}</span>
            <span className="text-slate-500 font-bold font-mono tabular-nums">{ongoingPct}% In Progress</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500"
              style={{ width: `${ongoingPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Verified Skills Micro-Tags (Clean Architectural Badges) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 items-center">
          {stats?.skills_breakdown?.slice(0, 3).map((item) => (
            <div
              key={item.skill}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
            >
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
              <span className="font-semibold">{item.skill}:</span>
              <span className="font-mono tabular-nums font-bold">{item.score}%</span>
            </div>
          ))}
        </div>

        {role === 'student' && onNavigateTab && (
          <button
            onClick={() => onNavigateTab('codelab')}
            className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1"
          >
            <span>Solve Gap Labs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
