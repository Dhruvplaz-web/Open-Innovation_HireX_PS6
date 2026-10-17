import React, { useState } from 'react';
import { 
  Flame, 
  QrCode, 
  ChevronDown, 
  Zap, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { StudentProfile } from '../../types';

interface StudentProgressQuestCardProps {
  student?: StudentProfile;
  learningStats?: any;
  onNavigateTab: (tab: string) => void;
  onOpenAssessment?: () => void;
  className?: string;
}

export const StudentProgressQuestCard: React.FC<StudentProgressQuestCardProps> = ({
  student,
  learningStats,
  onNavigateTab,
  onOpenAssessment,
  className = ''
}) => {
  const [semester, setSemester] = useState<string>('Semester 6');
  const [isSemesterOpen, setIsSemesterOpen] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const isNewUser = (student?.verified_score || 0) === 0 && Object.keys(student?.skills || {}).length === 0;

  // Streak & NCrF Credit Values
  const streakDays = isNewUser ? 0 : (student ? 5 : 5);
  const ncrfCredits = isNewUser ? 0.0 : 18.5;
  const ncrfTotal = 20.0;
  const ncrfPercentage = Math.round((ncrfCredits / ncrfTotal) * 100);

  // Top verified skills for footer pills
  const topSkills = [
    { name: 'Python', score: 92 },
    { name: 'React', score: 89 },
    { name: 'FastAPI', score: 84 }
  ];

  return (
    <div className={`hub-card p-6 md:p-7 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all select-none flex flex-col justify-between ${className}`}>
      <div>
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Student Progress &<br />Daily Quest
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Daily streak, NCrF credits & verified milestones
            </p>
          </div>

          {/* Top Actions: Streak, Verify QR, Semester */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Streak Pill */}
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-1.5 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakDays}-Day Streak</span>
            </div>

            {/* Verify QR Button */}
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>Verify QR</span>
            </button>

            {/* Semester Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSemesterOpen(!isSemesterOpen)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>{semester}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSemesterOpen && (
                <div className="absolute right-0 mt-1.5 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {['Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => {
                        setSemester(sem);
                        setIsSemesterOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs transition cursor-pointer ${
                        semester === sem
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Quest & NCrF Progress Container */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60 space-y-3">
          {/* Top Quest Row */}
          <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">
                Daily Placement Quest (1 of 2 Complete)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
              +25 XP toward NCrF Credit
            </span>
          </div>

          {/* Quest Task Buttons Row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Task 1 Completed */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px]">Kadane's O(N) Sol...</span>
            </div>

            {/* Task 2 Active CTA */}
            <button
              type="button"
              onClick={() => onNavigateTab('codelab')}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200/90 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
            >
              <span>Code Lab & AST Duel</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* NCrF 4.0 Sub-Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-400">
              NCrF 4.0 Ledger: <strong className="text-slate-900 dark:text-white">{ncrfCredits}</strong> / {ncrfTotal} Credits
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {ncrfPercentage}% to Exemption
            </span>
          </div>
        </div>

        {/* Dual Progress Bars */}
        <div className="mt-5 space-y-4">
          {/* Bar 1: Finished Modules & Lab Tests */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Finished Modules & Lab Tests
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {isNewUser ? '0%' : '68%'} Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-slate-900 dark:bg-slate-100 transition-all duration-500 ease-out"
                style={{ width: isNewUser ? '0%' : '68%' }}
              />
            </div>
          </div>

          {/* Bar 2: Ongoing Projects & Micro-Credentials */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Ongoing Projects & Micro-Credentials
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {isNewUser ? '0%' : '32%'} In Progress
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: isNewUser ? '0%' : '32%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skills Proofs & CTA */}
      <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Skill Proof Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {topSkills.map((sk) => (
              <span
                key={sk.name}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{sk.name}: {isNewUser ? '0%' : `${sk.score}%`}</span>
              </span>
            ))}
          </div>

          {/* Action Link */}
          <button
            type="button"
            onClick={() => onNavigateTab('codelab')}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>Solve Gap Labs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* QR Code Modal Mock */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cryptographic Skill QR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scan to verify SPPU NCrF 4.0 ledger and AST test proofs.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
              SHA256: 8f4a2b9e1c3d7f0a...
            </div>
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
