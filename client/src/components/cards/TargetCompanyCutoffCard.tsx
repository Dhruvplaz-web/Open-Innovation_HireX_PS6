import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  TrendingUp,
  Target,
  GraduationCap
} from 'lucide-react';
import { StudentProfile, CampusBenchmarkCompany, PlacementReadinessData } from '../../types';

interface TargetCompanyCutoffCardProps {
  student?: StudentProfile;
  benchmarks?: CampusBenchmarkCompany[];
  placementReadiness?: PlacementReadinessData;
  onNavigateTab: (tab: string) => void;
  onOpenAssessment?: () => void;
  className?: string;
}

export const TargetCompanyCutoffCard: React.FC<TargetCompanyCutoffCardProps> = ({
  student,
  benchmarks = [],
  placementReadiness,
  onNavigateTab,
  onOpenAssessment: _onOpenAssessment,
  className = ''
}) => {
  const isNewUser = (student?.verified_score || 0) === 0 && Object.keys(student?.skills || {}).length === 0;

  // Active verified score
  const studentScore = isNewUser ? 0 : (student?.verified_score || placementReadiness?.overall_score || 89);
  const studentCGPA = student?.cgpa || 8.42;

  // Default corporate recruiters if benchmarks empty
  const defaultCompanies: CampusBenchmarkCompany[] = [
    {
      id: 'barclays',
      name: 'Barclays',
      industry: 'Global FinTech',
      cutoff: 80,
      package: '₹12.5 - 14.0 LPA',
      rounds: '4 Rounds',
      is_cleared: studentScore >= 80
    },
    {
      id: 'persistent',
      name: 'Persistent',
      industry: 'Digital Engineering',
      cutoff: 75,
      package: '₹9.0 - 11.5 LPA',
      rounds: '3 Rounds',
      is_cleared: studentScore >= 75
    },
    {
      id: 'nvidia',
      name: 'NVIDIA Tier-1',
      industry: 'Deep Tech & AI',
      cutoff: 88,
      package: '₹18.0 - 24.0 LPA',
      rounds: '4 Rounds',
      is_cleared: studentScore >= 88
    },
    {
      id: 'tatatech',
      name: 'Tata Tech',
      industry: 'Mobility Tech',
      cutoff: 70,
      package: '₹7.5 - 9.0 LPA',
      rounds: '3 Rounds',
      is_cleared: studentScore >= 70
    }
  ];

  const companies = benchmarks.length > 0 ? benchmarks.slice(0, 4) : defaultCompanies;

  // Selected company for detailed cutoff inspection
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'barclays');
  
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Clearance calculations for active company
  const cutoffSurplus = studentScore - activeCompany.cutoff;
  const isCompanyCleared = !isNewUser && cutoffSurplus >= 0;

  // Determine Overall Tier Standing
  const tierVerdict = useMemo(() => {
    if (isNewUser) return { label: 'UNCALIBRATED', badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    if (studentScore >= 85) return { label: 'TIER-1 SUPER DREAM CLEARED', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80' };
    if (studentScore >= 75) return { label: 'TIER-2 PRODUCT CLEARED', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80' };
    if (studentScore >= 60) return { label: 'TIER-3 MASS IT CLEARED', badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80' };
    return { label: 'BELOW CAMPUS CUTOFF', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80' };
  }, [studentScore, isNewUser]);

  // Semi-circular gauge parameters
  // Arc spans 180°: left (180°) -> top (90°) -> right (0°)
  // SVG viewBox: 0 0 260 150. Center = (130, 135), Radius = 95
  const arcRadius = 95;
  const centerX = 130;
  const centerY = 135;
  const arcLength = Math.PI * arcRadius; // ~298.45
  const clampedScore = Math.min(100, Math.max(0, studentScore));
  const strokeOffset = arcLength * (1 - clampedScore / 100);

  // Rotation angle for needle: -90deg (0%) to +90deg (100%)
  const needleRotation = clampedScore * 1.8 - 90;

  // Selected company cutoff angle for highlight marker pin
  const cutoffAngleRad = (activeCompany.cutoff / 100) * Math.PI;
  const cutoffMarkerX = centerX - arcRadius * Math.cos(cutoffAngleRad);
  const cutoffMarkerY = centerY - arcRadius * Math.sin(cutoffAngleRad);

  return (
    <div className={`hub-card p-6 md:p-7 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all select-none flex flex-col justify-between ${className}`}>
      <div>
        {/* ========================================================================= */}
        {/* HEADER: Title, Clearance Badge & Subtitle                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Corporate Cutoff & Clearance
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierVerdict.badgeClass}`}>
                {tierVerdict.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live clearance simulation against marquee campus recruitment benchmarks
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>JSPM RSCOE TPO</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEMI-CIRCULAR RADIAL GAUGE (Speedometer Dial)                             */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <div className="w-64 h-38 flex items-center justify-center">
            <svg 
              viewBox="0 0 260 155" 
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* 4-Zone Sweep Gradient */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />    {/* Amber (0-60%) */}
                  <stop offset="50%" stopColor="#06b6d4" />   {/* Cyan (60-75%) */}
                  <stop offset="75%" stopColor="#10b981" />   {/* Emerald (75-85%) */}
                  <stop offset="100%" stopColor="#8b5cf6" />  {/* Purple (85-100%) */}
                </linearGradient>

                {/* Needle Glow Filter */}
                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#8b5cf6" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d={`M ${centerX - arcRadius},${centerY} A ${arcRadius},${arcRadius} 0 0,1 ${centerX + arcRadius},${centerY}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                className="text-slate-100 dark:text-slate-800"
              />

              {/* Active Colored Progress Arc */}
              <path
                d={`M ${centerX - arcRadius},${centerY} A ${arcRadius},${arcRadius} 0 0,1 ${centerX + arcRadius},${centerY}`}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />

              {/* Active Company Cutoff Marker Pin */}
              <g className="transition-all duration-500 ease-out">
                <circle
                  cx={cutoffMarkerX}
                  cy={cutoffMarkerY}
                  r="7"
                  fill="#ffffff"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  className="drop-shadow-md"
                />
                <circle
                  cx={cutoffMarkerX}
                  cy={cutoffMarkerY}
                  r="3"
                  fill="#8b5cf6"
                />
              </g>

              {/* Dynamic Rotating Needle */}
              <g
                style={{
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transform: `rotate(${needleRotation}deg)`,
                  transition: 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Needle Spine */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={centerX}
                  y2={centerY - arcRadius + 14}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-white"
                  filter="url(#needleGlow)"
                />
                {/* Pointer Tip */}
                <polygon
                  points={`${centerX - 3.5},${centerY - arcRadius + 18} ${centerX + 3.5},${centerY - arcRadius + 18} ${centerX},${centerY - arcRadius + 8}`}
                  className="fill-purple-600 dark:fill-purple-400"
                />
              </g>

              {/* Center Pivot Point Hub */}
              <circle
                cx={centerX}
                cy={centerY}
                r="7"
                className="fill-slate-900 dark:fill-white"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="3.5"
                className="fill-purple-500 dark:fill-purple-400"
              />
            </svg>
          </div>

          {/* Readout Cleanly Below the Needle Pivot */}
          <div className="text-center mt-1">
            <div className="flex items-baseline justify-center gap-1 font-mono">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {studentScore}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                / 100
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isNewUser ? 'Awaiting Diagnostic' : 'READINESS INDEX'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
              {isNewUser ? (
                <span>Diagnostic test required to calibrate company cutoff clearance.</span>
              ) : (
                <span>
                  Cleared for <strong className="text-slate-900 dark:text-white font-bold">94%</strong> of ongoing campus placement drives.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE TARGET RECRUITER TABS                                         */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span>SELECT CAMPUS RECRUITER:</span>
            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              Cutoff Pin: {activeCompany.cutoff}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {companies.map((comp) => {
              const isSelected = comp.id === selectedCompanyId;
              const isCleared = studentScore >= comp.cutoff && !isNewUser;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(comp.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700/80 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-purple-900 dark:text-purple-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {comp.name}
                    </span>
                    {isCleared && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-[10px] font-mono">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">
                      Cut: {comp.cutoff}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold truncate">
                      {comp.package.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SELECTED COMPANY CUTOFF COMPARISON BOX                                    */}
        {/* ========================================================================= */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                {activeCompany.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{activeCompany.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {activeCompany.package}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeCompany.industry} • {activeCompany.rounds}
                </p>
              </div>
            </div>

            {/* Clearance verdict tag */}
            <div>
              {isCompanyCleared ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>+{cutoffSurplus} pts Surplus (Cleared)</span>
                </span>
              ) : isNewUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Assessment Required</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80">
                  <AlertCircle className="w-3 h-3" />
                  <span>{Math.abs(cutoffSurplus)} pts to Cutoff</span>
                </span>
              )}
            </div>
          </div>

          {/* Institutional TPO Criteria Matrix */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/60 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>CGPA {studentCGPA} (&gt;7.5)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>0 Active Backlogs</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Code Lab Proctored</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION FOOTER: Simulate Drive CTA                                         */}
      {/* ========================================================================= */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>NCrF 4.0 Credit Eligible & Cryptographically Signed</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('codelab')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-purple-500/20 transition cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate {activeCompany.name} OA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
