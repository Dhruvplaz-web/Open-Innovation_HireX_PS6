import React, { useMemo } from 'react';
import { 
  Maximize2, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart as PieIcon, 
  Award,
  ExternalLink
} from 'lucide-react';
import { MatchedOpportunity, Role, StudentProfile } from '../../types';

interface RightSidePanelProps {
  opportunities: MatchedOpportunity[];
  role: Role;
  onApply: (item: any) => void;
  openModal: (modal: string) => void;
  student?: StudentProfile;
  learningStats?: any;
  onNavigateTab?: (tab: string) => void;
}

interface SkillItem {
  name: string;
  score: number;
  level: string;
  verified: boolean;
  color: string;
}

const PALETTE = [
  '#3B82F6', // Blue (Python)
  '#06B6D4', // Cyan (React)
  '#10B981', // Emerald (FastAPI)
  '#8B5CF6', // Violet (ML / AI)
  '#F59E0B', // Amber (SQL)
  '#EC4899', // Pink (Spring Boot / Git)
  '#6366F1', // Indigo
];

export const RightSidePanel: React.FC<RightSidePanelProps> = ({
  opportunities,
  role,
  onApply,
  openModal,
  student,
  learningStats,
  onNavigateTab
}) => {
  const panelTitle = role === 'student' 
    ? 'Matched Opportunities' 
    : role === 'recruiter' 
    ? 'Top Verified Candidates' 
    : role === 'academician'
    ? 'Curriculum Skill Gaps'
    : 'System Approvals';

  const panelSubtitle = role === 'student'
    ? 'Calibrated against verified AST and aptitude scores.'
    : role === 'recruiter'
    ? 'Objective assessment shortlist for Pan-India tech vacancies.'
    : 'Critical tech missing in current college syllabus.';

  const getCompanyMonogram = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Extract skills breakdown for the Pie/Donut Chart
  const parsedSkills: SkillItem[] = useMemo(() => {
    // 1. From student.skills object if available
    if (student?.skills && Object.keys(student.skills).length > 0) {
      return Object.entries(student.skills).map(([name, data], idx) => ({
        name,
        score: data.score || 75,
        level: data.level || 'Intermediate',
        verified: data.verified !== false,
        color: PALETTE[idx % PALETTE.length]
      }));
    }
    // 2. From learningStats.skills_breakdown array if available
    if (learningStats?.skills_breakdown && Array.isArray(learningStats.skills_breakdown) && learningStats.skills_breakdown.length > 0) {
      return learningStats.skills_breakdown.map((item: any, idx: number) => ({
        name: item.skill || item.name,
        score: item.score || 80,
        level: item.level || 'Intermediate',
        verified: item.verified !== false,
        color: PALETTE[idx % PALETTE.length]
      }));
    }
    // 3. Realistic fallback data for demo profile
    return [
      { name: 'Python', score: 92, level: 'Advanced', verified: true, color: '#3B82F6' },
      { name: 'React', score: 89, level: 'Advanced', verified: true, color: '#06B6D4' },
      { name: 'FastAPI', score: 84, level: 'Intermediate', verified: true, color: '#10B981' },
      { name: 'Machine Learning', score: 82, level: 'Intermediate', verified: true, color: '#8B5CF6' },
      { name: 'SQL', score: 75, level: 'Intermediate', verified: true, color: '#F59E0B' }
    ];
  }, [student, learningStats]);

  const verifiedScore = student?.verified_score || learningStats?.verified_score || 88;

  // Compute SVG Donut Chart Slices
  const totalScoreSum = useMemo(() => {
    return parsedSkills.reduce((acc: number, curr: SkillItem) => acc + curr.score, 0) || 100;
  }, [parsedSkills]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.761

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ========================================================================= */}
      {/* UPPER BLOCK: MATCHED OPPORTUNITIES (SCROLLABLE FEED)                      */}
      {/* ========================================================================= */}
      <div className="card-clay p-5 flex flex-col bg-white dark:bg-card-dark shadow-soft border border-slate-200/80 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {panelTitle}
              </h2>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {opportunities.length} Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{panelSubtitle}</p>
          </div>
          <button 
            onClick={() => openModal('opportunities')}
            title="View All Opportunities in TPO Explorer"
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Opportunities List: all fit jobs are scrollable in this block */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto max-h-[360px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {opportunities.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching opportunities yet. Complete assessments to unlock calibrated campus drives.
            </div>
          ) : (
            opportunities.map((opp, idx) => {
              const isTopMatch = idx === 0;

              return (
                <div
                  key={opp.opportunity_id || idx}
                  className="py-3.5 first:pt-2 last:pb-1 transition-all group flex flex-col justify-between gap-2.5"
                >
                  {/* Item Header: Monogram, Title, Match Metric */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-2xs ${
                        isTopMatch
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                      }`}>
                        {getCompanyMonogram(opp.company)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {opp.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{opp.company}</span>
                          <span>•</span>
                          <span className="shrink-0">{opp.stipend || '₹12.5 - 14 LPA'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Metric */}
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black font-mono tabular-nums block leading-tight ${
                        opp.match_percentage >= 90
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {opp.match_percentage}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium block">
                        {isTopMatch ? 'Top Match' : 'Match'}
                      </span>
                    </div>
                  </div>

                  {/* Skills Criteria Row */}
                  <div className="flex flex-wrap items-center gap-1 pl-11.5">
                    {opp.matched_skills?.slice(0, 2).map((sk) => (
                      <span key={sk} className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        {sk}
                      </span>
                    ))}
                    {opp.missing_skills?.[0] && (
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                        Gap: {opp.missing_skills[0]}
                      </span>
                    )}
                  </div>

                  {/* Action & Deadline Row */}
                  <div className="flex items-center justify-between pt-0.5 pl-11.5">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Due {opp.deadline || 'Nov 22, 2026'}</span>
                    </div>

                    <button
                      onClick={() => onApply(opp)}
                      className={`text-[11px] flex items-center gap-1 transition-all active:scale-95 ${
                        isTopMatch
                          ? 'px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold shadow-xs'
                          : 'px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold'
                      }`}
                    >
                      <span>{role === 'student' ? (isTopMatch ? 'Apply Now' : 'Inspect') : 'Review'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOWER BLOCK: USER SKILLS PROFICIENCY PIE / DONUT CHART                   */}
      {/* ========================================================================= */}
      <div className="card-clay p-5 flex flex-col bg-white dark:bg-card-dark shadow-soft border border-slate-200/80 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                User Skills Proficiency
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Shared record verified proficiency distribution
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 px-2 py-0.5 rounded-full shrink-0">
            {parsedSkills.length} Skills
          </span>
        </div>

        {/* Visual SVG Donut / Pie Chart */}
        <div className="pt-4 pb-2 flex flex-col items-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circular track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="15"
                className="dark:stroke-slate-800"
              />
              {/* Dynamic Slices */}
              {(() => {
                let cumulativePct = 0;
                return parsedSkills.map((sk: SkillItem, idx: number) => {
                  const slicePct = (sk.score / totalScoreSum) * 100;
                  const strokeDasharray = `${(slicePct * circumference) / 100} ${circumference}`;
                  const strokeDashoffset = -((cumulativePct * circumference) / 100);
                  cumulativePct += slicePct;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={sk.color}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700 ease-out hover:opacity-85"
                    />
                  );
                });
              })()}
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
                {verifiedScore}%
              </span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Color-coded Skill Breakdown Pills */}
        <div className="grid grid-cols-2 gap-1.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {parsedSkills.slice(0, 6).map((sk: SkillItem) => (
            <div 
              key={sk.name} 
              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: sk.color }} 
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">
                  {sk.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                  {sk.score}%
                </span>
                {sk.verified && (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Shortcut to full assessment ledger */}
        <div className="mt-3 pt-2 text-center">
          <button
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('assessment');
              } else {
                openModal('skills');
              }
            }}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <span>Inspect Full Skill Ledger</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
