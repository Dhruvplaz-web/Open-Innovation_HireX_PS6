import React from 'react';
import { 
  Briefcase, 
  Check, 
  AlertTriangle, 
  Calendar, 
  ArrowRight, 
  Maximize2 
} from 'lucide-react';
import { MatchedOpportunity, StudentProfile } from '../../types';

interface MatchedOpportunitiesCardProps {
  opportunities?: MatchedOpportunity[];
  student?: StudentProfile;
  onNavigateTab: (tab: string) => void;
  onSelectOpportunity?: (opp: MatchedOpportunity) => void;
  className?: string;
}

export const MatchedOpportunitiesCard: React.FC<MatchedOpportunitiesCardProps> = ({
  opportunities = [],
  student,
  onNavigateTab,
  onSelectOpportunity,
  className = ''
}) => {
  const isNewUser = (student?.verified_score || 0) === 0 && Object.keys(student?.skills || {}).length === 0;

  // Use provided opportunities or high-fidelity matching reference data
  const displayOpportunities: MatchedOpportunity[] = opportunities.length > 0 ? opportunities.slice(0, 4) : [
    {
      opportunity_id: 'opp_barclays',
      title: 'Full-Stack AI Developer Intern',
      company: 'Barclays India Innovation...',
      stipend: '₹45,000 / month',
      match_percentage: 97,
      matched_skills: ['Python', 'React'],
      missing_skills: [],
      deadline: '2026-10-30',
      color_theme: 'indigo',
      location: 'Pune Tech Centre',
      duration: '6 Months',
      explanation: 'Top calibrated AST verified match.'
    },
    {
      opportunity_id: 'opp_techcorp',
      title: 'Junior Machine Learning Engineer',
      company: 'TechCorp Innovations',
      stipend: '₹50,000 / month',
      match_percentage: 81,
      matched_skills: ['Python', 'Machine Learning'],
      missing_skills: ['PyTorch'],
      deadline: '2026-11-15',
      color_theme: 'pink',
      location: 'Bengaluru / Remote',
      duration: '6 Months',
      explanation: 'Eligible with Python & ML verification.'
    },
    {
      opportunity_id: 'opp_flipkart',
      title: 'High-Throughput Distributed Systems Intern',
      company: 'Flipkart Commerce Labs',
      stipend: '₹65,000 / month',
      match_percentage: 51,
      matched_skills: ['Data Structures', 'Python'],
      missing_skills: ['Java'],
      deadline: '2026-11-20',
      color_theme: 'sky',
      location: 'Bengaluru Head Office',
      duration: '6 Months',
      explanation: 'Core DSA verified; Java gap identified.'
    }
  ];

  // Helper to extract company initials
  const getInitials = (name: string) => {
    return name
      .replace(/[^a-zA-Z ]/g, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'BI';
  };

  return (
    <div className={`hub-card p-6 md:p-7 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all select-none flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Matched Opportunities
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isNewUser ? '0 Live' : `${displayOpportunities.length} Live`}</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calibrated against verified AST and aptitude scores.
            </p>
          </div>

          {/* Maximize Icon */}
          <button
            type="button"
            onClick={() => onNavigateTab('opportunities')}
            title="View all opportunities"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Opportunity Items List */}
        <div className="mt-4 space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
          {isNewUser ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No verified matches yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Complete your first diagnostic test in the Code Lab to match with institutional Tier-1 hiring drives.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('codelab')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Take Diagnostic Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            displayOpportunities.map((opp, idx) => {
              const initials = getInitials(opp.company);
              const isTopMatch = opp.match_percentage >= 90;

              return (
                <div
                  key={opp.opportunity_id || `opp_${idx}`}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar Badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs' 
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}>
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {opp.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {opp.company} • <span className="font-semibold text-slate-700 dark:text-slate-300">{opp.stipend}</span>
                        </p>
                      </div>
                    </div>

                    {/* Match Percentage */}
                    <div className="text-right shrink-0">
                      <span className={`text-base font-black font-mono leading-none ${
                        isTopMatch 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : opp.match_percentage >= 75 
                          ? 'text-cyan-600 dark:text-cyan-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {opp.match_percentage}%
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold tracking-tight mt-0.5">
                        {isTopMatch ? 'Top Match' : 'Match'}
                      </span>
                    </div>
                  </div>

                  {/* Skill Badges & Gaps */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {/* Matched Verified Skills */}
                    {opp.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}

                    {/* Missing Gap Skills */}
                    {opp.missing_skills.map((gap) => (
                      <span
                        key={gap}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Gap: {gap}</span>
                      </span>
                    ))}
                  </div>

                  {/* Footer Row: Deadline & Action Button */}
                  <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due {opp.deadline || '2026-10-30'}</span>
                    </span>

                    {isTopMatch ? (
                      <button
                        type="button"
                        onClick={() => onSelectOpportunity ? onSelectOpportunity(opp) : onNavigateTab('opportunities')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-102 active:scale-98"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectOpportunity ? onSelectOpportunity(opp) : onNavigateTab('opportunities')}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
