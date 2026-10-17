import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Award,
  Building2,
  CheckCircle2,
  ExternalLink,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import {
  StudentProfile,
  TrendChartData,
  PeerScore,
  MatchedOpportunity,
  PlacementReadinessData,
  CampusBenchmarkCompany
} from '../types';
import { PlacementReadinessCard } from '../components/cards/PlacementReadinessCard';
import { CampusEligibilityBenchmarksCard } from '../components/cards/CampusEligibilityBenchmarksCard';
import { MatchedOpportunitiesCard } from '../components/cards/MatchedOpportunitiesCard';
import { UserSkillsProficiencyCard } from '../components/cards/UserSkillsProficiencyCard';
import { StudentProgressQuestCard } from '../components/cards/StudentProgressQuestCard';
import { NationalCampusLeaderboardCard } from '../components/cards/NationalCampusLeaderboardCard';
import { TargetCompanyCutoffCard } from '../components/cards/TargetCompanyCutoffCard';
import { YourNextBestActionCard } from '../components/cards/YourNextBestActionCard';

interface DashboardViewProps {
  student: StudentProfile;
  chartData: TrendChartData;
  peers: PeerScore[];
  opportunities: MatchedOpportunity[];
  learningStats: any;
  placementReadiness?: PlacementReadinessData;
  campusBenchmarks?: CampusBenchmarkCompany[];
  onNavigateTab: (tab: string) => void;
  onOpenAssessment: () => void;
  onSelectOpportunity?: (opp: MatchedOpportunity) => void;
  onOpenModal?: (modal: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  chartData: _chartData,
  peers = [],
  opportunities,
  learningStats,
  placementReadiness,
  campusBenchmarks,
  onNavigateTab,
  onOpenAssessment,
  onSelectOpportunity,
  onOpenModal: _onOpenModal
}) => {
  const [bottomTab, setBottomTab] = useState<'drives' | 'applications'>('drives');
  const [showDetailedBenchmarks, setShowDetailedBenchmarks] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(
    student?.target_role || placementReadiness?.target_role || 'Full-Stack AI Developer'
  );

  const isDemo = (student?.student_id === 'std_1' || student?.id === 'std_1') && (student?.verified_score || 0) > 0;

  // Fallback / Active Opportunities list
  const activeOpportunities: MatchedOpportunity[] = opportunities.length > 0 ? opportunities.slice(0, 5) : (isDemo ? [
    {
      opportunity_id: 'opp_1',
      title: 'Full-Stack AI Developer Intern',
      company: 'Barclays India Innovation Centre',
      match_percentage: 92,
      matched_skills: ['FastAPI', 'React', 'Docker'],
      missing_skills: ['Kubernetes'],
      stipend: '₹45,000 / month',
      location: 'Pune Tech Centre',
      duration: '6 Months',
      deadline: '2026-10-30',
      color_theme: 'indigo' as const,
      explanation: '92% verified AST and algorithmic match.'
    },
    {
      opportunity_id: 'opp_2',
      title: 'Distributed Systems Engineer',
      company: 'Persistent Systems',
      match_percentage: 86,
      matched_skills: ['Python', 'SQL', 'Git'],
      missing_skills: ['Kafka'],
      stipend: '₹35,000 / month',
      location: 'Pune / Remote',
      duration: '6 Months',
      deadline: '2026-11-05',
      color_theme: 'pink' as const,
      explanation: 'Strong fit for candidate AST verified code lab score.'
    },
    {
      opportunity_id: 'opp_3',
      title: 'Graduate Cloud Architect',
      company: 'Tata Technologies',
      match_percentage: 84,
      matched_skills: ['AWS', 'Linux'],
      missing_skills: ['Terraform'],
      stipend: '₹40,000 / month',
      location: 'Bengaluru / Pune',
      duration: '1 Year Full-Time',
      deadline: '2026-11-12',
      color_theme: 'peach' as const,
      explanation: 'Eligible with SPPU 8.5+ CGPA and NPTEL cloud credentials.'
    }
  ] : []);

  // Applications mock status matching reference image
  const myApplications = isDemo ? [
    {
      id: '#APP-1024',
      company: 'Barclays India',
      role: 'Full-Stack AI Developer Intern',
      stipend: '₹45,000 / mo',
      applied_date: 'Oct 08, 2026',
      status: 'Delivered',
      stage: 'Shortlisted for Round 2'
    },
    {
      id: '#APP-1023',
      company: 'Google Bangalore',
      role: 'Alumni Referral SWE Track',
      stipend: '₹1,20,000 / mo',
      applied_date: 'Oct 12, 2026',
      status: 'Processing',
      stage: 'Interview Scheduled'
    },
    {
      id: '#APP-1022',
      company: 'Persistent Systems',
      role: 'Backend Systems Engineer',
      stipend: '₹35,000 / mo',
      applied_date: 'Sep 29, 2026',
      status: 'Pending',
      stage: 'TPO Verification Cleared'
    },
    {
      id: '#APP-1021',
      company: 'Tata Technologies',
      role: 'Connected Vehicle IoT Intern',
      stipend: '₹30,000 / mo',
      applied_date: 'Sep 24, 2026',
      status: 'Delivered',
      stage: 'Offer Letter Released'
    }
  ] : [];



  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      <SEOHead
        title="Placement Dashboard | HireX JSPM RSCOE"
        description="Modern soft-glassmorphic placement dashboard featuring real-time verified recruitment telemetry, application funnel, and drive matching."
        path="/dashboard"
      />

      {/* Greeting Header & Academic Horizon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Welcome back, {student?.name?.split(' ')[0] || 'Dhruv'} 👋
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Placement Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your campus drives, applications, and verified skill readiness today.
          </p>
        </div>

        {/* Date / Term Capsule */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Oct 17, 2026 • SPPU 2026 Batch</span>
          </div>
        </div>
      </div>

      {/* TIER 1: 4 Soft-Glass KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Verified Drives */}
        <div className="hub-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <span>↑ 14.2%</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
            Total Verified Drives
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            142
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            vs. previous semester
          </p>
        </div>

        {/* Card 2: Active Applications */}
        <div className="hub-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              {(student?.verified_score || 0) > 0 ? "7 In Review" : "0 Active"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
            Active Applications
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {(student?.verified_score || 0) > 0 ? 18 : 0}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {(student?.verified_score || 0) > 0 ? "3 fast-tracked via alumni" : "Ready to apply to campus drives"}
          </p>
        </div>

        {/* Card 3: Verified Match Index */}
        <div className="hub-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
              (student?.verified_score || 0) >= 75
                ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60"
            }`}>
              {(student?.verified_score || 0) >= 75 ? "Top 4% Rank" : "Unverified"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
            Verified Skill Match Index
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {student?.verified_score || 0}%
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {(student?.verified_score || 0) >= 75 ? "Institutional TPO cleared" : "Verification Required"}
          </p>
        </div>

        {/* Card 4: Interviews Scheduled */}
        <div className="hub-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{(student?.verified_score || 0) > 0 ? "Tomorrow 10:00 AM" : "None Scheduled"}</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
            Interviews Scheduled
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {(student?.verified_score || 0) > 0 ? 5 : 0}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {(student?.verified_score || 0) > 0 ? "Barclays & Persistent" : "Pending drive applications"}
          </p>
        </div>
      </div>

      {/* TIER 2: Placement Readiness & Corporate Clearance Meter (Side-by-Side Dual Box) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* Left Box (50%): 5-Pillar Placement Readiness */}
        <PlacementReadinessCard
          student={student}
          placementReadiness={placementReadiness}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onNavigateTab={onNavigateTab}
          onOpenAssessment={onOpenAssessment}
          className="h-full"
        />

        {/* Right Box (50%): Semi-Circular Radial Gauge & Target Company Cutoffs */}
        <TargetCompanyCutoffCard
          student={student}
          benchmarks={campusBenchmarks}
          placementReadiness={placementReadiness}
          onNavigateTab={onNavigateTab}
          onOpenAssessment={onOpenAssessment}
          className="h-full"
        />
      </div>

      {/* TIER 2.1: Your Next Best Action (Full-Width Dedicated Card) */}
      <YourNextBestActionCard
        student={student}
        selectedRole={selectedRole}
        placementReadiness={placementReadiness}
        onNavigateTab={onNavigateTab}
        onOpenAssessment={onOpenAssessment}
      />

      {/* TIER 2.5: Side-by-Side Analytics Section (Matched Opportunities & User Skills Proficiency) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box (50%): Matched Opportunities */}
        <MatchedOpportunitiesCard
          opportunities={activeOpportunities}
          student={student}
          onNavigateTab={onNavigateTab}
          onSelectOpportunity={onSelectOpportunity}
          className="h-full"
        />

        {/* Right Box (50%): User Skills Proficiency */}
        <UserSkillsProficiencyCard
          student={student}
          onNavigateTab={onNavigateTab}
          className="h-full"
        />
      </div>

      {/* TIER 2.6: Student Progress & Leaderboard (Replaced Drive Sources & Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Student Progress & Daily Quest */}
        <StudentProgressQuestCard
          student={student}
          learningStats={learningStats}
          onNavigateTab={onNavigateTab}
          onOpenAssessment={onOpenAssessment}
          className="h-full"
        />

        {/* Right: National & Campus Leaderboard */}
        <NationalCampusLeaderboardCard
          student={student}
          peers={peers}
          onNavigateTab={onNavigateTab}
          className="h-full"
        />
      </div>

      {/* TIER 3: Bottom Section - Tabbed Data Tables (Recent Campus Drives vs My Applications) */}
      <div className="hub-card p-6 space-y-4">
        {/* Table Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBottomTab('drives')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                bottomTab === 'drives'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Active Campus Drives ({activeOpportunities.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('applications')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                bottomTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Applications ({myApplications.length} Active)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('opportunities')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All 142 Postings</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab 1: Campus Job Postings Table */}
        {bottomTab === 'drives' && (
          activeOpportunities.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Matched Campus Drives Yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Verify your skills through assessments or code lab challenges to calculate real match scores against active drives.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('assessment')}
                className="mt-3 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Verify Core Skills</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">#</th>
                    <th className="pb-3">Company & Role</th>
                    <th className="pb-3">Location & Type</th>
                    <th className="pb-3">Compensation</th>
                    <th className="pb-3">HireX Match</th>
                    <th className="pb-3">Deadline</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {activeOpportunities.map((opp, idx) => (
                    <tr key={opp.opportunity_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 pl-1 font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{opp.company}</span>
                          <span className="text-[11px] text-slate-500">{opp.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {opp.location} • {opp.duration || 'Full-Time'}
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {opp.stipend}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${opp.match_percentage}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-emerald-600 text-[11px]">
                            {opp.match_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {opp.deadline}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectOpportunity) onSelectOpportunity(opp);
                            else onNavigateTab('opportunities');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs transition border border-blue-200/50 dark:border-blue-800/50 shadow-2xs cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab 2: My Active Applications Table */}
        {bottomTab === 'applications' && (
          myApplications.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Applications Yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Your profile is starting clean. Verify your core competencies to unlock live applications to corporate and campus drives.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('opportunities')}
                className="mt-3 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Explore Campus Drives</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Application ID</th>
                    <th className="pb-3">Company & Drive</th>
                    <th className="pb-3">Compensation</th>
                    <th className="pb-3">Applied On</th>
                    <th className="pb-3">Recruitment Stage</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {myApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 pl-1 font-mono font-bold text-blue-600 dark:text-blue-400">{app.id}</td>
                      <td className="py-3">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{app.company}</span>
                          <span className="text-[11px] text-slate-500">{app.role}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {app.stipend}
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {app.applied_date}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          app.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60'
                            : app.status === 'Processing'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                        }`}>
                          {app.stage}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('opportunities')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition shadow-2xs hover:opacity-90 cursor-pointer"
                        >
                          Track Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Expandable Section: Institutional TPO Clearance Benchmarks & Placement Readiness */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDetailedBenchmarks(!showDetailedBenchmarks)}
          className="w-full py-3 px-4 rounded-2xl glass-panel text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 flex items-center justify-between transition shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Institutional TPO Clearance & SPPU Corporate Cutoff Benchmarks</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Clearance: Approved
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDetailedBenchmarks ? 'rotate-180' : ''}`} />
        </button>

        {showDetailedBenchmarks && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <CampusEligibilityBenchmarksCard
              student={student}
              benchmarks={campusBenchmarks}
              onNavigateTab={onNavigateTab}
            />
          </div>
        )}
      </div>
    </div>
  );
};
