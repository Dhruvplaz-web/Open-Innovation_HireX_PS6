import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';
import { StudentProfile, PeerScore } from '../../types';

interface NationalCampusLeaderboardCardProps {
  student?: StudentProfile;
  peers?: PeerScore[];
  onNavigateTab: (tab: string) => void;
  className?: string;
}

export const NationalCampusLeaderboardCard: React.FC<NationalCampusLeaderboardCardProps> = ({
  student,
  peers,
  onNavigateTab,
  className = ''
}) => {
  const [scope, setScope] = useState<'campus' | 'national'>('campus');

  const isNewUser = (student?.verified_score || 0) === 0 && Object.keys(student?.skills || {}).length === 0;

  // Department Standing
  const rankNumber = isNewUser ? '-' : 3;
  const totalInDept = 240;
  const percentile = isNewUser ? 'Unranked' : '96.4% Percentile';

  // Campus Candidates List (Matching Reference Screenshot)
  const campusLeaderboard = [
    {
      id: 'c1',
      rank: 1,
      name: 'Sophia Bennett',
      college: 'JSPM RSCOE',
      department: 'AI & Cloud',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
      streak: '8d',
      score: 94,
      isCurrentUser: false
    },
    {
      id: 'c2',
      rank: 2,
      name: 'Jack Brown',
      college: 'JSPM RSCOE',
      department: 'Frontend Dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
      streak: '6d',
      score: 89,
      isCurrentUser: false
    },
    {
      id: 'c3',
      rank: 3,
      name: isNewUser ? 'Dhruv Patil' : `${student?.name || 'Dhruv Patil'} (You)`,
      college: 'JSPM RSCOE',
      department: student?.target_role || 'Full-Stack AI',
      avatar: student?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv',
      streak: isNewUser ? '0d' : '5d',
      score: student?.verified_score || 88,
      isCurrentUser: !isNewUser
    },
    {
      id: 'c4',
      rank: 4,
      name: 'Charlotte Anderson',
      college: 'JSPM RSCOE',
      department: 'Data Analyst',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte',
      streak: '4d',
      score: 82,
      isCurrentUser: false
    }
  ];

  // Pan-India National Engineering Institutes List
  const nationalLeaderboard = [
    {
      id: 'n1',
      rank: 1,
      name: 'Aarav Sharma',
      college: 'IIT Bombay',
      department: 'Systems Engineering',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
      streak: '19d',
      score: 98,
      isCurrentUser: false
    },
    {
      id: 'n2',
      rank: 2,
      name: 'Ananya Iyer',
      college: 'BITS Pilani',
      department: 'AI & Algorithms',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
      streak: '14d',
      score: 96,
      isCurrentUser: false
    },
    {
      id: 'n3',
      rank: 3,
      name: 'Rohan Kulkarni',
      college: 'COEP Pune',
      department: 'Distributed Systems',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
      streak: '11d',
      score: 93,
      isCurrentUser: false
    },
    {
      id: 'n4',
      rank: 14,
      name: `${student?.name || 'Dhruv Patil'} (You)`,
      college: 'JSPM RSCOE',
      department: student?.target_role || 'Full-Stack AI',
      avatar: student?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv',
      streak: isNewUser ? '0d' : '5d',
      score: student?.verified_score || 88,
      isCurrentUser: !isNewUser
    }
  ];

  const currentList = scope === 'campus' ? campusLeaderboard : nationalLeaderboard;

  return (
    <div className={`hub-card p-6 md:p-7 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all select-none flex flex-col justify-between ${className}`}>
      <div>
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                National & Campus Leaderboard
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 shrink-0">
                Top 1% Campus
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time verified standings across Indian engineering institutes
            </p>
          </div>

          {/* Scope Toggle: My Campus vs Pan-India */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setScope('campus')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === 'campus'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Campus
            </button>
            <button
              type="button"
              onClick={() => setScope('national')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === 'national'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pan-India
            </button>
          </div>
        </div>

        {/* Highlight Banner (Department Standing) */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">
              Rank #{rankNumber} of {totalInDept} in Department
            </span>
          </div>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {percentile}
          </span>
        </div>

        {/* Leaderboard Candidates Rows */}
        <div className="mt-4 space-y-2.5">
          {currentList.map((c) => {
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition ${
                  c.isCurrentUser
                    ? 'bg-purple-50/60 dark:bg-purple-950/25 border-2 border-purple-500/40 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                {/* Left: Rank Badge + Avatar + Candidate Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Square Badge */}
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    c.rank === 1
                      ? 'bg-amber-500 text-white'
                      : c.rank === 2
                      ? 'bg-slate-400 text-white'
                      : c.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {c.rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200/60 dark:border-slate-700 object-cover shrink-0"
                  />

                  {/* Name & Academic Scope */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </span>
                      {c.isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {c.college} • {c.department}
                    </p>
                  </div>
                </div>

                {/* Right: Bar + Streak + Verified Score */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* Inline Bar Indicator */}
                  <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.isCurrentUser
                          ? 'bg-slate-900 dark:bg-white'
                          : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>

                  {/* Streak */}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{c.streak}</span>
                  </span>

                  {/* Score */}
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white w-9 text-right">
                    {c.score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Action Banner */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Want to pass Rank #2?
        </span>
        <button
          type="button"
          onClick={() => onNavigateTab('codelab')}
          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1 transition cursor-pointer"
        >
          <span>Challenge in Code Lab & AST Duel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
