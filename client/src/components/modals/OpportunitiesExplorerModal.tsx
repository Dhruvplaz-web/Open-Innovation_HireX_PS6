import React, { useState } from 'react';
import { X, Search, Filter, MapPin, Clock, Calendar, CheckCircle2, AlertTriangle, ArrowRight, Building2, Briefcase } from 'lucide-react';
import { MatchedOpportunity, Role } from '../../types';

interface OpportunitiesExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: MatchedOpportunity[];
  role: Role;
  onSelectOpportunity: (opp: MatchedOpportunity) => void;
}

export const OpportunitiesExplorerModal: React.FC<OpportunitiesExplorerModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  role,
  onSelectOpportunity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_match' | 'bengaluru' | 'hyderabad' | 'pune' | 'delhi_ncr'>('all');

  if (!isOpen) return null;

  const filteredOpps = opportunities.filter((opp) => {
    const loc = (opp.location || '').toLowerCase();
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.matched_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedFilter === 'high_match') return opp.match_percentage >= 88;
    if (selectedFilter === 'bengaluru') return loc.includes('bengaluru') || loc.includes('bangalore');
    if (selectedFilter === 'hyderabad') return loc.includes('hyderabad');
    if (selectedFilter === 'pune') return loc.includes('pune');
    if (selectedFilter === 'delhi_ncr') return loc.includes('delhi') || loc.includes('gurgaon') || loc.includes('ncr') || loc.includes('noida');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium mb-1 border border-slate-200 dark:border-slate-700">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities & Candidates Explorer</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {role === 'student' ? 'Matched Internships & Placement Tracks' : 'Verified Candidate Pipeline'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated against verified objective assessment scores and academic requirements.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 shrink-0">
          <div className="flex-1 w-full flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or technology (e.g. Python, Barclays)..."
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All India
            </button>
            <button
              onClick={() => setSelectedFilter('high_match')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'high_match' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              High Fit (88%+)
            </button>
            <button
              onClick={() => setSelectedFilter('bengaluru')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'bengaluru' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bengaluru
            </button>
            <button
              onClick={() => setSelectedFilter('hyderabad')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'hyderabad' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Hyderabad
            </button>
            <button
              onClick={() => setSelectedFilter('pune')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'pune' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pune
            </button>
            <button
              onClick={() => setSelectedFilter('delhi_ncr')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === 'delhi_ncr' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Delhi-NCR
            </button>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredOpps.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching listings found. Try adjusting your search query.
            </div>
          ) : (
            filteredOpps.map((opp) => (
              <div
                key={opp.opportunity_id}
                onClick={() => {
                  onSelectOpportunity(opp);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">
                      {opp.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                      {opp.match_percentage}% Fit
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{opp.company}</p>
                  
                  {/* Skill tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {opp.matched_skills?.slice(0, 3).map((sk) => (
                      <span key={sk} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-md font-medium">
                        ✓ {sk}
                      </span>
                    ))}
                    {opp.missing_skills?.[0] && (
                      <span className="text-[10px] bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60 dark:border-red-800/40 px-2 py-0.5 rounded-md font-medium">
                        Gap: {opp.missing_skills[0]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {opp.stipend || '₹45,000 / mo'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {opp.location || 'Pune'}
                  </span>
                  <button className="mt-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs">
                    <span>View & Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
