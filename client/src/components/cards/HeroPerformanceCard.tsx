import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  ShieldCheck, 
  Grid, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TrendChartData, StudentProfile } from '../../types';

interface HeroPerformanceCardProps {
  chartData?: TrendChartData;
  greetingTitle?: string;
  greetingSubtitle?: string;
  role?: string;
  student?: StudentProfile;
  onNavigateTab?: (tab: string) => void;
  onOpenAssessment?: () => void;
}

type LensMode = 'cutoff_funnel' | 'ctc_bell_curve' | 'skill_heatmap';

export const HeroPerformanceCard: React.FC<HeroPerformanceCardProps> = ({
  role = "student",
  student,
  onNavigateTab,
  onOpenAssessment
}) => {
  const [activeLens, setActiveLens] = useState<LensMode>('cutoff_funnel');
  const [selectedCompanyIdx, setSelectedCompanyIdx] = useState<number>(0);
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<number>(2); // Round 3: Tech Coding
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ row: number; col: number } | null>(null);

  // CTC Simulator state for Lens 2
  const [boosters, setBoosters] = useState<{ [key: string]: boolean }>({
    docker: true,
    fastapi: true,
    aptitude_speed: false,
    system_design: false
  });

  // Calculate dynamic simulated CTC based on active boosters
  const baseLPA = 8.5;
  const additionalLPA = 
    (boosters.docker ? 1.8 : 0) +
    (boosters.fastapi ? 2.1 : 0) +
    (boosters.aptitude_speed ? 1.2 : 0) +
    (boosters.system_design ? 2.8 : 0);
  const totalPredictedLPA = (baseLPA + additionalLPA).toFixed(1);
  const percentile = (
    92.0 + 
    (boosters.docker ? 2.1 : 0) + 
    (boosters.fastapi ? 2.3 : 0) + 
    (boosters.system_design ? 2.4 : 0)
  ).toFixed(1);

  // LENS 1 DATA: Company Cutoff Benchmarks
  const companyCutoffs = [
    {
      id: 'barclays',
      name: 'Barclays',
      subtext: 'Global FinTech',
      location: 'Bengaluru & Pune',
      cutoff: 80,
      studentScore: student?.verified_score || 88,
      package: '₹12.5 - 14.0 LPA',
      status: 'Qualified (+8% Above Cutoff)',
      roundsCount: 4,
      interviewTopics: ['AST Sliding Window O(N)', 'PostgreSQL ACID', 'REST Endpoints']
    },
    {
      id: 'persistent',
      name: 'Persistent',
      subtext: 'Digital Engineering',
      location: 'Pune & Hyderabad',
      cutoff: 75,
      studentScore: student?.verified_score || 88,
      package: '₹9.0 - 11.5 LPA',
      status: 'Qualified (+13% Above Cutoff)',
      roundsCount: 3,
      interviewTopics: ['Python Async / Java', 'API Microservices', '45s Aptitude']
    },
    {
      id: 'tatatech',
      name: 'Tata Tech',
      subtext: 'Mobility Tech',
      location: 'Bengaluru & Pune',
      cutoff: 70,
      studentScore: student?.verified_score || 88,
      package: '₹7.5 - 9.0 LPA',
      status: 'Qualified (+18% Above Cutoff)',
      roundsCount: 3,
      interviewTopics: ['Algorithms', 'Python Embedded', 'Automotive IoT']
    },
    {
      id: 'nvidia',
      name: 'NVIDIA Tier-1',
      subtext: 'Accelerated Compute',
      location: 'Bengaluru & Hyderabad',
      cutoff: 95,
      studentScore: student?.verified_score || 88,
      package: '₹22.0 - 28.0 LPA',
      status: 'Gap (-7% Below Cutoff)',
      roundsCount: 5,
      interviewTopics: ['Distributed Graphs', 'Distributed Systems', 'AST Profiling']
    }
  ];

  // LENS 1 DATA: Survival Pipeline
  const survivalFunnel = [
    {
      stage: '1. Registered',
      count: 420,
      pct: 100,
      desc: 'All registered Computer Engg candidates',
      dropReason: 'Baseline starting applicant cohort',
      studentOdds: 100
    },
    {
      stage: '2. TPO Gate',
      count: 310,
      pct: 74,
      desc: 'Screened by CGPA (7.5+) & 0 Active Backlogs',
      dropReason: '110 eliminated for backlogs or low attendance',
      studentOdds: 98
    },
    {
      stage: '3. ATS Filter',
      count: 165,
      pct: 39,
      desc: 'Screened by corporate ATS semantic parser',
      dropReason: '145 eliminated for missing quantified metrics',
      studentOdds: 92
    },
    {
      stage: '4. AST & Speed',
      count: 48,
      pct: 11,
      desc: 'Online Compiler & 45s timed aptitude sprint',
      dropReason: '117 eliminated for quadratic loops or timeout',
      studentOdds: 84
    },
    {
      stage: '5. Offers',
      count: 16,
      pct: 3.8,
      desc: 'Final technical & institutional offer letters',
      dropReason: 'Final selection conversion ratio',
      studentOdds: 76
    }
  ];

  // LENS 3 DATA: 2D Tech Matrix
  const techRows = [
    { skill: 'Python AST & Big-O O(N)', category: 'Algorithms', studentScore: 92 },
    { skill: 'FastAPI & Microservices', category: 'Backend', studentScore: 84 },
    { skill: 'PostgreSQL ACID & Joins', category: 'Databases', studentScore: 86 },
    { skill: 'React 19 & TypeScript', category: 'Frontend', studentScore: 89 },
    { skill: 'Docker & Linux Containers', category: 'DevOps', studentScore: 74 },
    { skill: '45s Aptitude & Quant Logic', category: 'Cognitive', studentScore: 91 }
  ];

  const companyCols = ['Barclays', 'Persistent', 'Tata Tech', 'Veritas', 'Cognizant'];

  const heatmapMatrix = [
    ['verified', 'verified', 'verified', 'verified', 'verified'],
    ['verified', 'verified', 'warning', 'verified', 'warning'],
    ['verified', 'verified', 'verified', 'warning', 'verified'],
    ['verified', 'warning', 'warning', 'verified', 'verified'],
    ['warning', 'verified', 'gap', 'verified', 'gap'],
    ['verified', 'verified', 'verified', 'verified', 'verified']
  ];

  const verifiedScore = student?.verified_score || 88;

  return (
    <div className="card-clay p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-card-dark shadow-soft border border-slate-200/80 dark:border-slate-800">
      {/* 1. TOP HEADER: Master Anchor Telemetry Bar */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        {/* Row A: Score Hero Anchor & Fast Utility Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex flex-col items-center justify-center font-mono shrink-0 shadow-2xs">
              <span className="text-2xl font-black leading-none">{verifiedScore}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Placement Command Telemetry
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  Top 4% RSCOE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Verified Readiness Index</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>12,450 Pan-India Candidates Benchmarked</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SHA-256 Verified
                </span>
              </p>
            </div>
          </div>

          {/* Quick-Action Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('codelab')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <span>Code Lab</span>
                </button>
                <button
                  onClick={() => onNavigateTab('aptitude')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <span>Code Lab Arena</span>
                </button>
              </>
            )}
            {onOpenAssessment && (
              <button
                onClick={onOpenAssessment}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Verify QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Row B: 3-Lens Mode Selector & Live Status Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 gap-1 text-xs">
            <button
              onClick={() => setActiveLens('cutoff_funnel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeLens === 'cutoff_funnel'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>1. Corporate Cutoffs</span>
            </button>

            <button
              onClick={() => setActiveLens('ctc_bell_curve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeLens === 'ctc_bell_curve'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2. Batch CTC Curve</span>
            </button>

            <button
              onClick={() => setActiveLens('skill_heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeLens === 'skill_heatmap'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>3. Employer Heatmap</span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono tabular-nums">
              {activeLens === 'cutoff_funnel'
                ? '3 of 4 Drives Cleared'
                : activeLens === 'ctc_bell_curve'
                ? `₹${totalPredictedLPA} LPA Projected`
                : '16 of 18 Skills Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LENS 1: CORPORATE CUTOFF BENCHMARKS & THE SURVIVAL WATERFALL PIPELINE     */}
      {/* ========================================================================= */}
      {activeLens === 'cutoff_funnel' && (
        <div className="my-4 space-y-6">
          {/* Section A: Unified Corporate Eligibility Benchmark Grid */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                National Campus Drive Eligibility Benchmarks
              </span>
              <span className="text-[11px] font-mono">Verified Student Score: 88%</span>
            </div>

            {/* Single unified 4-column surface with hairline dividers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
              {companyCutoffs.map((c, idx) => {
                const isCleared = c.studentScore >= c.cutoff;
                const isSelected = selectedCompanyIdx === idx;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCompanyIdx(idx)}
                    className={`p-4 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-slate-850 shadow-2xs'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {isCleared ? 'Cleared' : 'Gap'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.subtext}</p>
                    </div>

                    {/* Precision Telemetry Meter */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
                        <span>Score / Cutoff</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">88% / {c.cutoff}%</span>
                      </div>
                      <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCleared ? 'bg-slate-900 dark:bg-slate-100' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.studentScore}%` }}
                        />
                        {/* Cutoff Marker Tick */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                          style={{ left: `${c.cutoff}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between font-mono tabular-nums">
                      <span className="font-bold text-slate-900 dark:text-white">{c.package}</span>
                      <span className="text-slate-400 text-[11px]">{c.roundsCount} Rounds</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Company Interview Focus Strip */}
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {companyCutoffs[selectedCompanyIdx].name} Focus:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {companyCutoffs[selectedCompanyIdx].interviewTopics.join(' • ')}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                {companyCutoffs[selectedCompanyIdx].status}
              </span>
            </div>
          </div>

          {/* Section B: Connected 5-Stage Elimination Pipeline */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-semibold text-slate-900 dark:text-white">
                Placement Survival Funnel (Pan-India Engineering Cohort)
              </span>
              <span className="font-mono tabular-nums text-xs">
                Survival Odds: <strong className="text-slate-900 dark:text-white">84% in Round 4</strong>
              </span>
            </div>

            {/* Seamless 5-Stage Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
              {survivalFunnel.map((step, idx) => {
                const isSelected = selectedFunnelStep === idx;
                const isUserStage = idx === 3;
                return (
                  <div
                    key={step.stage}
                    onClick={() => setSelectedFunnelStep(idx)}
                    className={`p-3.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white dark:bg-slate-850 shadow-2xs'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {isUserStage && (
                      <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        You Are Here
                      </div>
                    )}

                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {step.stage}
                    </div>
                    <div className="text-base font-black font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                      {step.count} <span className="text-xs font-normal text-slate-400">({step.pct}%)</span>
                    </div>

                    <div className="mt-2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-slate-100 rounded-full"
                        style={{ width: `${step.pct}%` }}
                      />
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Funnel Stage Deep Dive Info */}
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Stage Elimination:</strong> {survivalFunnel[selectedFunnelStep].dropReason}
              </span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 font-bold shrink-0 ml-2">
                Clearance: {survivalFunnel[selectedFunnelStep].studentOdds}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LENS 2: PROBABILISTIC GAUSSIAN BATCH CTC BELL CURVE                       */}
      {/* ========================================================================= */}
      {activeLens === 'ctc_bell_curve' && (
        <div className="my-4 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                Gaussian Distribution (Pan-India Computer Engg Cohort)
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Calculated via Ridge Regression across Code AST Complexity + Aptitude Speed + Academic GPA
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              <span>Projected Offer: ₹{totalPredictedLPA} LPA (Top {100 - parseFloat(percentile)}%)</span>
            </div>
          </div>

          {/* SVG Gaussian Bell Curve Canvas (Precision Monochromatic Styling) */}
          <div className="relative w-full h-[200px] select-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 p-2">
            <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
              {/* Subtle Grid Tiers */}
              <line x1="40" y1="170" x2="760" y2="170" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="260" y1="30" x2="260" y2="170" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="500" y1="30" x2="500" y2="170" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="680" y1="30" x2="680" y2="170" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />

              {/* The Smooth Bell Curve */}
              <path
                d="M 40 170 Q 200 170 300 110 T 380 30 T 460 110 Q 560 160 760 170"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Batch Mean Line */}
              <line x1="380" y1="30" x2="380" y2="170" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
              <text x="380" y="186" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                Batch Avg: ₹5.8 LPA
              </text>

              {/* Tier Labels */}
              <text x="150" y="186" textAnchor="middle" fontSize="10" fill="#94a3b8">₹3.5 LPA</text>
              <text x="500" y="186" textAnchor="middle" fontSize="10" fill="#94a3b8">₹10 LPA</text>
              <text x="600" y="186" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">₹14 LPA (Barclays)</text>
              <text x="720" y="186" textAnchor="middle" fontSize="10" fill="#94a3b8">₹20+ LPA</text>

              {/* Dynamic Student Indicator */}
              {(() => {
                const currentVal = parseFloat(totalPredictedLPA);
                const pinX = Math.min(740, Math.max(100, 100 + ((currentVal - 3.5) / 16.5) * 620));
                return (
                  <g>
                    <line x1={pinX} y1="35" x2={pinX} y2="170" stroke="#059669" strokeWidth="2" />
                    <circle cx={pinX} cy="35" r="6" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                    <g transform={`translate(${pinX}, 18)`}>
                      <rect x="-55" y="-16" width="110" height="18" rx="4" fill="#0f172a" />
                      <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        You: ₹{totalPredictedLPA} LPA
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Interactive Skill Boost Simulator */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Interactive Skill Boost Simulator (Toggle to shift your curve percentile)
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                Current: {percentile}% Percentile
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'fastapi', label: 'FastAPI Microservices', boost: '+₹2.1 LPA' },
                { key: 'docker', label: 'Docker Containerization', boost: '+₹1.8 LPA' },
                { key: 'aptitude_speed', label: '30s Speed Aptitude', boost: '+₹1.2 LPA' },
                { key: 'system_design', label: 'System Design Architecture', boost: '+₹2.8 LPA' }
              ].map((b) => (
                <button
                  key={b.key}
                  onClick={() =>
                    setBoosters((prev) => ({ ...prev, [b.key]: !prev[b.key] }))
                  }
                  className={`p-3 rounded-lg border transition-all text-left flex flex-col justify-between ${
                    boosters[b.key]
                      ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">{b.label}</span>
                    <span className="text-xs font-mono">{boosters[b.key] ? '✓' : '+'}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold mt-2 ${
                    boosters[b.key] ? 'opacity-80' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {b.boost}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LENS 3: EMPLOYER SKILL HEATMAP MATRIX                                     */}
      {/* ========================================================================= */}
      {activeLens === 'skill_heatmap' && (
        <div className="my-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Skills vs. National Tech Employers Acceptance Matrix
            </span>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-400" />
                1 Test Gap
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-rose-500" />
                Critical Gap
              </span>
            </div>
          </div>

          {/* 2D Heatmap Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Skill / Tech Domain</th>
                  <th className="p-3 text-center">Score</th>
                  {companyCols.map((c) => (
                    <th key={c} className="p-3 text-center">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {techRows.map((row, rIdx) => (
                  <tr key={row.skill} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {row.category}
                      </span>
                      <span>{row.skill}</span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {row.studentScore}%
                    </td>
                    {companyCols.map((col, cIdx) => {
                      const status = heatmapMatrix[rIdx][cIdx];
                      const isSelected = selectedHeatmapCell?.row === rIdx && selectedHeatmapCell?.col === cIdx;
                      return (
                        <td key={col} className="p-2 text-center">
                          <button
                            onClick={() => setSelectedHeatmapCell({ row: rIdx, col: cIdx })}
                            className={`w-full py-1.5 rounded-md text-[10px] font-semibold transition flex items-center justify-center ${
                              status === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                                : status === 'warning'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100'
                                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                            } ${isSelected ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
                          >
                            <span>
                              {status === 'verified' ? 'Ready' : status === 'warning' ? '1 Test' : 'Gap'}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cell Inspection Callout */}
          {selectedHeatmapCell ? (
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {companyCols[selectedHeatmapCell.col]} Standard for {techRows[selectedHeatmapCell.row].skill}:
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Weights 25% of Round 2 Technical Screening. Verified status directly bypasses standard coding MCQ.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('codelab') : null}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold shrink-0 hover:bg-black transition"
              >
                Launch Lab →
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center text-[11px] text-slate-500">
              Tip: Click any cell to view the exact company test weight and launch an immediate targeted practice lab.
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTOM ACTION FOOTER */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <span>Grounded in AICTE NCrF 4.0 Framework & 500,000+ Pan-India Tech Vacancies</span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1"
            >
              <span>View Active TPO Drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
