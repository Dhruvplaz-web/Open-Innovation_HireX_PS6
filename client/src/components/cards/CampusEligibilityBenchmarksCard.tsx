import React from 'react';
import { StudentProfile, CampusBenchmarkCompany } from '../../types';

interface CampusEligibilityBenchmarksCardProps {
  student?: StudentProfile;
  benchmarks?: CampusBenchmarkCompany[];
  onNavigateTab?: (tab: string) => void;
}

export const CampusEligibilityBenchmarksCard: React.FC<CampusEligibilityBenchmarksCardProps> = ({
  student,
  benchmarks,
  onNavigateTab
}) => {
  const verifiedScore = student?.verified_score || 88;

  const defaultCompanies: CampusBenchmarkCompany[] = [
    {
      id: 'barclays',
      name: 'Barclays',
      industry: 'Global FinTech',
      cutoff: 80,
      package: '₹12.5 - 14.0 LPA',
      rounds: '4 Rounds',
      is_cleared: verifiedScore >= 80
    },
    {
      id: 'persistent',
      name: 'Persistent',
      industry: 'Digital Engineering',
      cutoff: 75,
      package: '₹9.0 - 11.5 LPA',
      rounds: '3 Rounds',
      is_cleared: verifiedScore >= 75
    },
    {
      id: 'tatatech',
      name: 'Tata Tech',
      industry: 'Mobility Tech',
      cutoff: 70,
      package: '₹7.5 - 9.0 LPA',
      rounds: '3 Rounds',
      is_cleared: verifiedScore >= 70
    },
    {
      id: 'nvidia',
      name: 'NVIDIA Tier-1',
      industry: 'Accelerated Compute',
      cutoff: 95,
      package: '₹22.0 - 28.0 LPA',
      rounds: '5 Rounds',
      is_cleared: verifiedScore >= 95
    }
  ];

  const companies = benchmarks && benchmarks.length > 0 ? benchmarks : defaultCompanies;

  return (
    <div className="card-clay p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          National Campus Drive Eligibility Benchmarks
        </h3>
        <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          Verified Student Score: {verifiedScore}%
        </span>
      </div>

      {/* 4 Company Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden mt-4">
        {companies.map((c) => {
          const isCleared = verifiedScore >= c.cutoff;

          return (
            <div
              key={c.id}
              onClick={() => onNavigateTab ? onNavigateTab('opportunities') : null}
              className="p-4 transition-all flex flex-col justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer group"
              title={`View ${c.name} campus drive details & eligible openings`}
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCleared
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                    }`}
                  >
                    {isCleared ? 'Cleared' : 'Gap'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {c.industry}
                </p>
              </div>

              {/* Progress and score ratio */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  <span>Score / Cutoff</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {verifiedScore}% / {c.cutoff}%
                  </span>
                </div>

                <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCleared ? 'bg-slate-900 dark:bg-slate-100' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (verifiedScore / c.cutoff) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {c.package}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                    {c.rounds}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
