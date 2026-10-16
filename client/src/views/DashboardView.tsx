import React from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, Lock, FolderGit2 } from 'lucide-react';
import { HeroPerformanceCard } from '../components/cards/HeroPerformanceCard';
import { StudentProgressCard } from '../components/cards/StudentProgressCard';
import { FriendsScoreCard } from '../components/cards/FriendsScoreCard';
import { RightSidePanel } from '../components/cards/RightSidePanel';
import { SEOHead } from '../components/common/SEOHead';
import { StudentProfile, TrendChartData, PeerScore, MatchedOpportunity } from '../types';

interface DashboardViewProps {
  student: StudentProfile;
  chartData: TrendChartData;
  peers: PeerScore[];
  opportunities: MatchedOpportunity[];
  learningStats: any;
  onNavigateTab: (tab: string) => void;
  onOpenAssessment: () => void;
  onSelectOpportunity?: (opp: MatchedOpportunity) => void;
  onOpenModal?: (modal: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  chartData,
  peers,
  opportunities,
  learningStats,
  onNavigateTab,
  onOpenAssessment,
  onSelectOpportunity,
  onOpenModal
}) => {
  const topOpp = opportunities[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <SEOHead
        title="HireX | Bridge Skills to Opportunities"
        description="HireX connects students, academia and recruiters through verified skill assessments, explainable AI matching, internships, jobs and placement analytics."
        path="/"
      />

      {/* Main 2/3 Left Column + 1/3 Right Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column: 2/3 width (Hero Command Hub + Academic Bridge Alert + 2 Bottom Cards) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Master Visual Anchor: Hero Performance Command Telemetry with Integrated Readiness Ledger */}
          <HeroPerformanceCard
            chartData={chartData}
            role="student"
            student={student}
            onNavigateTab={onNavigateTab}
            onOpenAssessment={onOpenAssessment}
          />

          {/* Curriculum Desynchronization Diagnostic Bar (Clean, Non-Intrusive) */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  National University Curriculum Desynchronization Index
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  500,000+ Pan-India tech vacancies across Bengaluru, Hyderabad, Pune, and Delhi-NCR demand <span className="font-semibold text-slate-900 dark:text-white">FastAPI (+184%)</span> and <span className="font-semibold text-slate-900 dark:text-white">Docker (+142%)</span>. Complete micro-labs to bridge this gap.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('codelab')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-900 text-xs font-semibold transition shrink-0 self-start sm:self-center"
            >
              Solve Gap Labs →
            </button>
          </div>

          {/* Two-Column Bottom Cards: Student Progress (Daily Quest) & Friends Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <StudentProgressCard
              stats={learningStats}
              role="student"
              onOpenAssessment={onOpenAssessment}
              onNavigateTab={onNavigateTab}
            />
            <FriendsScoreCard
              peers={peers}
              role="student"
              onNavigateTab={onNavigateTab}
            />
          </div>
        </div>

        {/* Right Column: 1/3 width (Executive Placement Feed + User Skills Pie Chart + 3 Linking Function Hubs) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <RightSidePanel
            opportunities={opportunities}
            role="student"
            student={student}
            learningStats={learningStats}
            onNavigateTab={onNavigateTab}
            onApply={(opp) => {
              if (onSelectOpportunity) {
                onSelectOpportunity(opp);
              } else {
                onNavigateTab('opportunities');
              }
            }}
            openModal={(m) => {
              if (onOpenModal) {
                onOpenModal(m);
              } else {
                onNavigateTab('opportunities');
              }
            }}
          />

          {/* 3 Linking Functionalities: Incognito, Collaboration & Skill Verification (Below User Skills Proficiency) */}
          <div className="flex flex-col gap-4">
            {/* Card 1: Incognito Talent Matching (Purple) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/95 via-slate-900 to-slate-950 text-white shadow-soft border border-purple-500/40 hover:border-purple-400/70 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/25 text-purple-300 border border-purple-400/30 flex items-center gap-1.5 shrink-0">
                    <Lock className="w-3.5 h-3.5 text-purple-300" />
                    Incognito Talent Matching
                  </span>
                  <span className="text-[11px] text-purple-300/80 font-mono font-semibold">SB-TALENT-10482</span>
                </div>
                <h4 className="text-sm font-black text-white leading-snug tracking-tight">
                  Privacy-Preserving Recruiter Discovery
                </h4>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Allow enterprise recruiters to discover your verified scores without exposing your personal PII until you accept invitations.
                </p>
              </div>
              <div className="pt-1 mt-auto relative z-10">
                <button
                  onClick={() => onNavigateTab('incognito')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-98"
                >
                  <span>Manage Incognito & Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
            </div>

            {/* Card 2: Collaboration Hub (Amber) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/95 via-slate-900 to-slate-950 text-white shadow-soft border border-amber-500/40 hover:border-amber-400/70 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shrink-0">
                    <FolderGit2 className="w-3.5 h-3.5 text-amber-300" />
                    Collaboration Hub
                  </span>
                  <span className="text-[11px] text-amber-300/90 font-bold">Research & Capstone</span>
                </div>
                <h4 className="text-sm font-black text-white leading-snug tracking-tight">
                  Research & Capstone Project Hub
                </h4>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Join AI/ML projects, submit deliverables, and get verified project evidence credited directly to your skill passport.
                </p>
              </div>
              <div className="pt-1 mt-auto relative z-10">
                <button
                  onClick={() => onNavigateTab('collaboration')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-98"
                >
                  <span>Browse Projects & Teams</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-amber-500/10 blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            </div>

            {/* Card 3: Skill Verification Engine (Emerald) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/95 via-slate-900 to-slate-950 text-white shadow-soft border border-emerald-500/40 hover:border-emerald-400/70 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Skill Verification Engine
                  </span>
                  <span className="text-[11px] text-emerald-300/80 font-semibold">• 3-Tier Proctoring</span>
                </div>
                <h4 className="text-sm font-black text-white leading-snug tracking-tight">
                  Verify Your Skills with Objective AI-Proctored Assessments
                </h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Assess competencies extracted from your Resume, GitHub, or LinkedIn across Easy, Intermediate, and Hard levels under strict biometric anti-cheating guards.
                </p>
              </div>
              <div className="pt-1 mt-auto relative z-10">
                <button
                  onClick={() => onNavigateTab('passport')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-98"
                >
                  <span>Verify Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Placement Drive Pipeline Teaser Bar */}
      {topOpp && (
        <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Top Recommendation
              </span>
              {topOpp.urgency_label && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800 flex items-center gap-1">
                  {topOpp.urgency_label}
                </span>
              )}
              {topOpp.verified_source_badge && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800">
                  {topOpp.verified_source_badge}
                </span>
              )}
              <span className="text-xs text-slate-400">• JSPM RSCOE Direct Pipeline</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
              {topOpp.title} — {topOpp.company}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {topOpp.explanation}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('opportunities')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
          >
            <span>View TPO Drive Pipeline ({opportunities.filter(o => !o.is_expired).length} Live)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
