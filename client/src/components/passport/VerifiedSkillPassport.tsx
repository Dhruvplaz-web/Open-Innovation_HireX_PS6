import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Layers,
  FileText,
  FolderGit2,
  Linkedin,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { SkillPassportItem, CareerPathway, SkillHistoryAttempt } from '../../types';
import { apiService } from '../../services/api';

interface VerifiedSkillPassportProps {
  studentId?: string;
  studentName?: string;
  college?: string;
  department?: string;
  readOnly?: boolean;
  onNavigateTab?: (tab: string) => void;
  onTakeAssessment?: (skillName?: string) => void;
}

export const VerifiedSkillPassport: React.FC<VerifiedSkillPassportProps> = ({
  studentId = 'std_1',
  studentName = 'Dhruv Patil',
  college = 'JSPM RSCOE, Pune',
  department = 'Computer Engineering',
  readOnly = false,
  onNavigateTab,
  onTakeAssessment
}) => {
  const [activeTab, setActiveTab] = useState<'passport' | 'pathway' | 'progression'>('passport');
  const [passportData, setPassportData] = useState<any>(null);
  const [careerPathway, setCareerPathway] = useState<CareerPathway | null>(null);
  const [skillHistory, setSkillHistory] = useState<Record<string, SkillHistoryAttempt[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gold' | 'silver' | 'bronze' | 'verified' | 'improvement'>('all');

  useEffect(() => {
    let mounted = true;
    const loadPassport = async () => {
      setLoading(true);
      try {
        const [passRes, pathRes, histRes] = await Promise.all([
          apiService.getStudentSkillPassport(studentId),
          apiService.getStudentCareerPathway(studentId),
          apiService.getStudentSkillHistory(studentId)
        ]);

        if (mounted) {
          setPassportData(passRes);
          setCareerPathway(pathRes.career_pathway || null);
          setSkillHistory(histRes.history_by_skill || {});
        }
      } catch (err) {
        console.error('Failed to load skill passport:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPassport();
    return () => { mounted = false; };
  }, [studentId]);

  const getBadgeTierMeta = (badgeType: string = '', score: number = 0) => {
    const lower = (badgeType || '').toLowerCase();
    if (lower.includes('gold') || score >= 88) {
      return {
        tier: 'Gold',
        label: 'Gold • Industry Ready',
        sublabel: 'Top 5% Forensic Benchmark',
        containerBorder: 'border-amber-400/80 dark:border-amber-500/50 bg-gradient-to-br from-amber-50/40 via-white to-yellow-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-yellow-950/10 shadow-sm shadow-amber-500/5',
        badgePill: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border border-amber-300 shadow-xs font-black',
        textGrad: 'text-amber-600 dark:text-amber-400',
        progressBar: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
        tierIcon: '🥇'
      };
    }
    if (lower.includes('silver') || score >= 75) {
      return {
        tier: 'Silver',
        label: 'Silver • Proficient',
        sublabel: 'Placement-Cleared Standard',
        containerBorder: 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50/60 via-white to-slate-100/40 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-800/10',
        badgePill: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 border border-slate-300 shadow-xs font-black',
        textGrad: 'text-slate-700 dark:text-slate-300',
        progressBar: 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500',
        tierIcon: '🥈'
      };
    }
    if (lower.includes('bronze') || score >= 60) {
      return {
        tier: 'Bronze',
        label: 'Bronze • Competent',
        sublabel: 'Foundational Competency',
        containerBorder: 'border-amber-700/30 dark:border-amber-700/40 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 dark:from-orange-950/20 dark:via-slate-900 dark:to-amber-950/10',
        badgePill: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border border-amber-500/40 shadow-xs font-black',
        textGrad: 'text-amber-700 dark:text-amber-400',
        progressBar: 'bg-gradient-to-r from-amber-500 to-orange-600',
        tierIcon: '🥉'
      };
    }
    return {
      tier: 'Foundation',
      label: badgeType || 'Foundation',
      sublabel: 'Needs Verification',
      containerBorder: 'border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10',
      badgePill: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold',
      textGrad: 'text-slate-500',
      progressBar: 'bg-slate-400',
      tierIcon: '⚡'
    };
  };

  const passportItems: SkillPassportItem[] = passportData?.passport || [];

  const goldItems = passportItems.filter(item => (item.badgeType || '').toLowerCase().includes('gold') || item.assessmentScore >= 88);
  const silverItems = passportItems.filter(item => (item.badgeType || '').toLowerCase().includes('silver') || (item.assessmentScore >= 75 && item.assessmentScore < 88));
  const bronzeItems = passportItems.filter(item => (item.badgeType || '').toLowerCase().includes('bronze') || (item.assessmentScore >= 60 && item.assessmentScore < 75));

  const filteredItems = passportItems.filter(item => {
    const score = item.assessmentScore;
    const badge = (item.badgeType || '').toLowerCase();
    if (selectedFilter === 'gold') return badge.includes('gold') || score >= 88;
    if (selectedFilter === 'silver') return badge.includes('silver') || (score >= 75 && score < 88);
    if (selectedFilter === 'bronze') return badge.includes('bronze') || (score >= 60 && score < 75);
    if (selectedFilter === 'verified') return score >= 70;
    if (selectedFilter === 'improvement') return score < 70;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 text-white overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                VERIFIED SKILL PASSPORT
              </span>
              <span className="text-xs text-indigo-200/70 font-semibold">• Objective Employability Identity</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {passportData?.student_name || studentName}
            </h2>
            <p className="text-sm text-indigo-200/80">
              {passportData?.department || department} • {passportData?.college || college}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-2xl font-black text-indigo-300">
                {passportData?.verified_score || 88}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/70">
                Verified Index
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-2xl font-black text-emerald-400">
                {passportData?.verified_skills_count || passportItems.length || 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                Verified Skills
              </div>
            </div>

            {/* Verified Badge Tiers Pill */}
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1">
                  <span>🥇</span>
                  <span>{goldItems.length}</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-200/70">
                  Gold Tier
                </div>
              </div>
              <div className="h-6 w-px bg-white/15" />
              <div className="text-center">
                <div className="text-xs font-black text-slate-200 flex items-center justify-center gap-1">
                  <span>🥈</span>
                  <span>{silverItems.length}</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-300/70">
                  Silver Tier
                </div>
              </div>
              <div className="h-6 w-px bg-white/15" />
              <div className="text-center">
                <div className="text-xs font-black text-orange-300 flex items-center justify-center gap-1">
                  <span>🥉</span>
                  <span>{bronzeItems.length}</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-orange-200/70">
                  Bronze Tier
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
        <div className="flex items-center gap-1 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'passport'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Skill Evidence Passport ({passportItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pathway')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'pathway'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Target Role Career Pathway</span>
          </button>

          <button
            onClick={() => setActiveTab('progression')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'progression'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Skill Progression History</span>
          </button>
        </div>

        {/* Filters if on passport tab */}
        {activeTab === 'passport' && (
          <div className="flex flex-wrap items-center gap-1.5 py-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              All ({passportItems.length})
            </button>
            <button
              onClick={() => setSelectedFilter('gold')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                selectedFilter === 'gold'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-400/40'
              }`}
            >
              <span>🥇 Gold</span>
              <span className="text-[10px]">({goldItems.length})</span>
            </button>
            <button
              onClick={() => setSelectedFilter('silver')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                selectedFilter === 'silver'
                  ? 'bg-slate-300 text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>🥈 Silver</span>
              <span className="text-[10px]">({silverItems.length})</span>
            </button>
            <button
              onClick={() => setSelectedFilter('bronze')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                selectedFilter === 'bronze'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-amber-700/40'
              }`}
            >
              <span>🥉 Bronze</span>
              <span className="text-[10px]">({bronzeItems.length})</span>
            </button>
            <button
              onClick={() => setSelectedFilter('verified')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                selectedFilter === 'verified'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Verified (≥70%)
            </button>
            <button
              onClick={() => setSelectedFilter('improvement')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                selectedFilter === 'improvement'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Gaps (&lt;70%)
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Loading Verified Skill Passport telemetry...
          </div>
        ) : activeTab === 'passport' ? (
          /* TAB 1: VERIFIED SKILL PASSPORT ITEMS */
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">Multi-Signal Ridge Calibration Model:</span> Verified competency badges (Gold, Silver, Bronze) are computed from calibrated proctored assessments, AST code analysis, GitHub proof-of-work, and accredited certifications.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item, idx) => {
                const tierMeta = getBadgeTierMeta(item.badgeType, item.assessmentScore);
                const isVerified = item.assessmentScore >= 70;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${tierMeta.containerBorder}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{tierMeta.tierIcon}</span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {item.skillName}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{tierMeta.sublabel}</span>
                          {item.lastVerifiedAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(item.lastVerifiedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right">
                        <div
                          className={`text-2xl font-black ${tierMeta.textGrad}`}
                        >
                          {item.assessmentScore}%
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] ${tierMeta.badgePill}`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{tierMeta.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${tierMeta.progressBar}`}
                        style={{ width: `${Math.min(100, Math.max(5, item.assessmentScore))}%` }}
                      />
                    </div>

                    {/* Granular Evidence Points */}
                    <div className="space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Verified Evidence Trace
                      </div>
                      {item.evidencePoints.map((ev, eIdx) => {
                        const isVerifiedEv = ev.status === 'VERIFIED';
                        return (
                          <div
                            key={eIdx}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/70 dark:bg-slate-800/40"
                          >
                            <div className="flex items-center gap-2">
                              {isVerifiedEv ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1 mr-1" />
                              )}
                              <span className={isVerifiedEv ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}>
                                {ev.label}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                isVerifiedEv
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {ev.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Remediation Action if not verified */}
                    {!isVerified && !readOnly && (
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                          Below 70% threshold
                        </span>
                        <button
                          onClick={() => onTakeAssessment ? onTakeAssessment(item.skillName) : onNavigateTab?.('workflow')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>Retake Assessment</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'pathway' ? (
          /* TAB 2: TARGET ROLE CAREER PATHWAY */
          careerPathway ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/20 via-slate-900/20 to-purple-900/20 border border-indigo-200/60 dark:border-indigo-800/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Target Career Role
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {careerPathway.targetRole}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Continuously mapped against live recruiter postings and campus hiring benchmarks.
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shrink-0">
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {careerPathway.overallReadinessPct}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Current Readiness
                    </div>
                  </div>
                </div>
              </div>

              {/* Pathway Visual Stages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Verified Strengths */}
                <div className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Strengths Ready for Deployment
                  </h4>
                  <div className="space-y-2">
                    {careerPathway.verifiedStrengths.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold"
                      >
                        <span className="text-slate-800 dark:text-slate-200">{s.skill}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                          {s.score}% Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remaining Skill Gaps */}
                <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-950/10">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Target Role Skill Gaps (Interventions Recommended)
                  </h4>
                  <div className="space-y-2">
                    {careerPathway.identifiedGaps.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 text-xs font-semibold"
                      >
                        <div>
                          <span className="text-slate-800 dark:text-slate-200">{g.skill}</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            Current: {g.current_score}%
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold">
                          Bridge {g.gap} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Remediation Courses */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Recommended Interventions to Bridge Identified Gaps
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {careerPathway.recommendedCourses.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {c.skill} Intervention
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {c.duration}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                          {c.courseTitle}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {c.expectedImprovement}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {c.provider}
                        </span>
                        <button
                          onClick={() => onNavigateTab?.('codelab')}
                          className="px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-102 transition flex items-center gap-1"
                        >
                          <span>Solve Labs</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No career pathway data available.
            </div>
          )
        ) : (
          /* TAB 3: SKILL PROGRESSION (VERSIONED ATTEMPTS LINE CHART) */
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Versioned Longitudinal Skill Progression
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every assessment attempt is versioned and preserved to show real skill trajectory over semesters.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(skillHistory).map(([skillName, attempts]) => (
                <div
                  key={skillName}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {skillName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {attempts.length} Attempts
                      </span>
                    </div>

                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Latest: {attempts[attempts.length - 1]?.score}%
                    </div>
                  </div>

                  {/* Horizontal Visual Timeline of Attempts */}
                  <div className="flex items-center gap-3 overflow-x-auto py-2">
                    {attempts.map((att, aIdx) => (
                      <div
                        key={aIdx}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-center min-w-[100px]">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Attempt #{att.attempt}
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white my-0.5">
                            {att.score}%
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {att.date}
                          </div>
                        </div>

                        {aIdx < attempts.length - 1 && (
                          <div className="flex items-center text-emerald-500 font-bold text-xs shrink-0">
                            <span>+{attempts[aIdx + 1].score - att.score}%</span>
                            <ChevronRight className="w-4 h-4 ml-0.5 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
