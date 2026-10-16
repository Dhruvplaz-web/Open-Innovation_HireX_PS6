import React, { useState } from 'react';
import { Trophy, Medal, Flame, ArrowRight } from 'lucide-react';
import { PeerScore } from '../../types';

interface FriendsScoreCardProps {
  peers: PeerScore[];
  role: string;
  onNavigateTab?: (tab: string) => void;
}

export const FriendsScoreCard: React.FC<FriendsScoreCardProps> = ({ peers, role, onNavigateTab }) => {
  const [cohortMode, setCohortMode] = useState<'college' | 'national'>('college');

  const cardTitle = role === 'student' ? 'National & Campus Leaderboard' : role === 'recruiter' ? 'Top Shortlisted Talent' : 'Department Rankers';
  const cardSubtitle = role === 'student' ? 'Real-time verified standings across Indian engineering institutes' : 'Verified score benchmarks across Pan-India cohorts';

  const collegePeers = [
    { name: "Sophia Bennett", college: "JSPM RSCOE", score: 94, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia", role: "AI & Cloud", rank: 1, streak: 8 },
    { name: "Jack Brown", college: "JSPM RSCOE", score: 89, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", role: "Frontend Dev", rank: 2, streak: 6 },
    { name: "Dhruv Patil (You)", college: "JSPM RSCOE", score: 88, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv", role: "Full-Stack AI", rank: 3, streak: 5, isUser: true },
    { name: "Charlotte Anderson", college: "JSPM RSCOE", score: 82, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte", role: "Data Analyst", rank: 4, streak: 4 }
  ];

  const nationalPeers = [
    { name: "Aarav Sharma", college: "IIT Bombay", score: 98, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav", role: "Algorithmic Systems", rank: 1, streak: 14 },
    { name: "Priya Nair", college: "BITS Pilani", score: 95, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", role: "Full-Stack AI", rank: 2, streak: 11 },
    { name: "Rohan Verma", college: "IIIT Hyderabad", score: 92, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", role: "Backend Architect", rank: 3, streak: 8 },
    { name: "Dhruv Patil (You)", college: "JSPM RSCOE", score: 88, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv", role: "Full-Stack AI", rank: 4, streak: 5, isUser: true },
    { name: "Sneha Rao", college: "RVCE Bengaluru", score: 86, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", role: "Cloud & DevOps", rank: 5, streak: 6 }
  ];

  const activeList = cohortMode === 'college' ? collegePeers : nationalPeers;

  return (
    <div className="card-clay p-6 flex flex-col justify-between bg-white dark:bg-card-dark h-full border border-slate-200/80 dark:border-slate-800 shadow-soft">
      {/* 1. Header with Segmented Cohort Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{cardTitle}</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {cohortMode === 'college' ? 'Top 1% Campus' : 'Top 2% India'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cardSubtitle}</p>
        </div>

        {/* Cohort Toggle */}
        <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center gap-0.5 text-xs font-semibold">
          <button
            onClick={() => setCohortMode('college')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              cohortMode === 'college'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            My Campus
          </button>
          <button
            onClick={() => setCohortMode('national')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              cohortMode === 'national'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Pan-India
          </button>
        </div>
      </div>

      {/* 2. Relative Percentile Highlight Callout (Clean Monolithic Surface) */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Rank <strong className="font-mono tabular-nums">#{cohortMode === 'college' ? '3 of 240' : '4 of 12,450'}</strong> in {cohortMode === 'college' ? 'Department' : 'All-India Cohort'}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
          96.4% Percentile
        </span>
      </div>

      {/* 3. Peer Leaderboard List */}
      <div className="space-y-1.5 my-2">
        {activeList.map((peer) => (
          <div
            key={peer.name}
            className={`flex items-center justify-between gap-3 p-2.5 rounded-lg transition-all ${
              peer.isUser
                ? 'bg-slate-100/80 dark:bg-slate-850/80 border-l-2 border-slate-900 dark:border-white'
                : 'hover:bg-slate-50 dark:hover:bg-slate-850/40'
            }`}
          >
            {/* Avatar, Rank & College */}
            <div className="flex items-center gap-2.5 min-w-[140px] shrink-0">
              <div className="relative">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700"
                />
                <span
                  className={`absolute -top-1 -right-1 w-3.5 h-3.5 text-[8px] font-black rounded flex items-center justify-center text-white ${
                    peer.rank === 1
                      ? 'bg-amber-500'
                      : peer.rank === 2
                      ? 'bg-slate-400'
                      : peer.rank === 3
                      ? 'bg-amber-700'
                      : 'bg-slate-700'
                  }`}
                >
                  {peer.rank}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                  {peer.name}
                  {peer.isUser && (
                    <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1 rounded">
                      YOU
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {peer.college} • {peer.role}
                </span>
              </div>
            </div>

            {/* Score Progress Bar (Clean Solid Bar, No Purple AI Gradient) */}
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-1 hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  peer.isUser
                    ? 'bg-slate-900 dark:bg-slate-100'
                    : 'bg-slate-400 dark:bg-slate-600'
                }`}
                style={{ width: `${peer.score}%` }}
              />
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{peer.streak}d</span>
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white font-mono tabular-nums min-w-[34px] text-right">
                {peer.score}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Gamified Peer Duel Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">
          Want to pass Rank #2?
        </span>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('aptitude')}
            className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1 group"
          >
            <span>Challenge in Code Lab & AST Duel</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </button>
        )}
      </div>
    </div>
  );
};
