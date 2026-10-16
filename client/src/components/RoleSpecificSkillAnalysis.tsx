import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Target,
  Briefcase,
  BookOpen,
  ShieldAlert,
  Award,
  Zap,
  TrendingUp,
  Check
} from 'lucide-react';
import { apiService, FALLBACK_OPPORTUNITIES, FALLBACK_STUDENT } from '../services/api';
import { analyzeStudentForOpportunity } from '../services/jdSkillAnalysis';
import { JDFitAnalysisResult, MatchedOpportunity } from '../types';

interface RoleSpecificSkillAnalysisProps {
  studentId?: string;
  studentSkills?: any;
  onSelectSkillForVerification?: (skill: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RoleSpecificSkillAnalysis: React.FC<RoleSpecificSkillAnalysisProps> = ({
  studentId = 'std_1',
  studentSkills,
  onSelectSkillForVerification,
  onNavigateTab
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [opportunities, setOpportunities] = useState<MatchedOpportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [analysis, setAnalysis] = useState<JDFitAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load opportunities
  useEffect(() => {
    let mounted = true;
    const fetchOpps = async () => {
      try {
        const res = await apiService.getOpportunities(studentId);
        if (mounted && Array.isArray(res) && res.length > 0) {
          setOpportunities(res);
          setSelectedOppId(res[0].id || res[0].opportunity_id);
          return;
        }
      } catch (err) {
        console.warn("Using fallback opportunities for JD analysis", err);
      }
      if (mounted) {
        setOpportunities(FALLBACK_OPPORTUNITIES);
        setSelectedOppId(FALLBACK_OPPORTUNITIES[0].opportunity_id);
      }
    };
    fetchOpps();
    return () => { mounted = false; };
  }, [studentId]);

  // Compute or fetch JD analysis for selected opportunity
  useEffect(() => {
    if (!selectedOppId) return;
    const opp = opportunities.find(o => (o.id || o.opportunity_id) === selectedOppId);
    if (!opp) return;

    setLoading(true);

    // Try server endpoint first, fall back to pure deterministic client engine
    apiService.getStudentJdAnalysis(studentId, selectedOppId)
      .then(res => {
        if (res && res.overallFit !== undefined) {
          setAnalysis(res);
        } else if (res && Array.isArray(res.analyses)) {
          const match = res.analyses.find((a: any) => (a.opportunityId || a.opportunity_id) === selectedOppId);
          setAnalysis(match || res.analyses[0] || null);
        } else {
          // Client-side deterministic computation
          const effectiveSkills = studentSkills || FALLBACK_STUDENT.skills;
          const result = analyzeStudentForOpportunity(effectiveSkills, opp);
          setAnalysis(result);
        }
      })
      .catch(() => {
        const effectiveSkills = studentSkills || FALLBACK_STUDENT.skills;
        const result = analyzeStudentForOpportunity(effectiveSkills, opp);
        setAnalysis(result);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedOppId, studentId, studentSkills, opportunities]);

  const activeOpp = opportunities.find(o => (o.id || o.opportunity_id) === selectedOppId) || opportunities[0];

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'STRONG_FIT':
        return {
          label: 'Strong Fit',
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          desc: 'High alignment across all primary verified technical benchmarks.'
        };
      case 'GOOD_FIT':
        return {
          label: 'Good Fit',
          bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
          desc: 'Solid core match with minor opportunities for competency expansion.'
        };
      case 'PARTIAL_FIT':
        return {
          label: 'Partial Fit',
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
          desc: 'Partial alignment. Target specific gap labs or skill assessments to raise fit.'
        };
      default:
        return {
          label: 'Needs Work',
          bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
          desc: 'Foundational development required across key role competencies.'
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Met
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Partial
          </span>
        );
      case 'GAP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Gap
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
            <HelpCircle className="w-3 h-3" /> Not Assessed
          </span>
        );
    }
  };

  const verdictInfo = getVerdictBadge(analysis?.verdict);

  return (
    <div className="mt-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 md:p-8 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-transparent data-[expanded=true]:border-slate-100 dark:data-[expanded=true]:border-slate-800"
        data-expanded={isExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Role-Specific Skill Analysis
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                JD Fit Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Deterministic evaluation of your verified skills against open campus placements and job descriptions. Compare your readiness against specific role requirements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {analysis && (
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${verdictInfo.bg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {verdictInfo.label} ({analysis.overallFit}%)
            </span>
          )}
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50/30 dark:bg-slate-900/30">
          {/* Opportunity Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <label htmlFor="jd-role-select" className="text-xs font-bold text-slate-900 dark:text-white block">
                  Target Opportunity / Role
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select an open campus drive to view personalized skill coverage
                </span>
              </div>
            </div>

            <select
              id="jd-role-select"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-w-[280px]"
            >
              {opportunities.map((opp) => (
                <option key={opp.id || opp.opportunity_id} value={opp.id || opp.opportunity_id}>
                  {opp.title} — {opp.company}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Analyzing verified skills against role requirements...
            </div>
          ) : analysis ? (
            <>
              {/* Hero Verdict Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider border ${verdictInfo.bg} shadow-xs`}>
                        {verdictInfo.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Role: <strong className="text-slate-800 dark:text-slate-200">{activeOpp?.title}</strong> at {activeOpp?.company}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {analysis.explanation.map((exp, i) => (
                        <p key={i} className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium flex items-start gap-2">
                          <span className="text-indigo-500 font-bold shrink-0">•</span>
                          <span>{exp}</span>
                        </p>
                      ))}
                    </div>

                    {/* Prominent Capping Callout */}
                    {analysis.verdict === 'PARTIAL_FIT' && analysis.mustHaveCoverage < 100 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 flex items-start gap-3 mt-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 dark:text-amber-200">
                          <strong>Capping Rule Applied:</strong> Even if overall score meets threshold, missing or below-target core must-have requirements cap the verdict at <strong>Partial Fit</strong> until verified.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Circular / Large Score Display */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[180px]">
                    <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {analysis.overallFit}%
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      Overall JD Fit Score
                    </span>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysis.overallFit >= 80 ? 'bg-emerald-500' : analysis.overallFit >= 60 ? 'bg-blue-500' : analysis.overallFit >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${analysis.overallFit}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Must-Have Coverage
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                      {analysis.mustHaveCoverage}%
                    </span>
                    <span className="text-[10px] text-slate-500">Essential core criteria</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Preferred Coverage
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                      {analysis.niceToHaveCoverage}%
                    </span>
                    <span className="text-[10px] text-slate-500">Good-to-have bonus skills</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Requirements Met
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                      {analysis.summary?.metCount || analysis.skills.filter(s => s.status === 'MET').length} / {analysis.skills.length}
                    </span>
                    <span className="text-[10px] text-slate-500">Fully verified skills</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Critical Gaps
                    </span>
                    <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                      {(analysis.criticalGaps || analysis.topGaps).length}
                    </span>
                    <span className="text-[10px] text-slate-500">Skills requiring action</span>
                  </div>
                </div>
              </div>

              {/* Requirements Breakdown Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    Requirement-by-Requirement Breakdown
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {analysis.skills.length} role competencies evaluated
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Required Skill</th>
                        <th className="py-3 px-4">Importance</th>
                        <th className="py-3 px-4">Target Benchmark</th>
                        <th className="py-3 px-4">Your Verified Level</th>
                        <th className="py-3 px-4">Match Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {analysis.skills.map((s, idx) => {
                        const isUnassessed = s.status === 'NOT_ASSESSED' || s.studentScore === null || s.studentScore === undefined;
                        const isRelated = s.matchedVia === 'RELATED';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {s.skill}
                              </span>
                              {isRelated && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5 font-semibold">
                                  Equivalence: matched via {s.matchedSkill} (0.6x factor)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {s.importance === 'MUST_HAVE' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  Must Have
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                  Nice to Have
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                              {s.targetLevel}%
                            </td>

                            <td className="py-3.5 px-4">
                              {isUnassessed ? (
                                <span className="text-[11px] font-semibold text-slate-400 italic">
                                  Not Assessed
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {s.studentScore}%
                                    {isRelated && s.effectiveScore !== undefined && s.effectiveScore !== null && (
                                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                                        (eff: {Math.round(s.effectiveScore)}%)
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className={`h-full ${s.status === 'MET' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                      style={{ width: `${Math.min(100, s.studentScore || 0)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {getStatusBadge(s.status)}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {s.status !== 'MET' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onSelectSkillForVerification) {
                                      onSelectSkillForVerification(s.skill);
                                    }
                                  }}
                                  className="px-3 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition inline-flex items-center gap-1"
                                >
                                  <span>{isUnassessed ? 'Take Assessment' : 'Raise Score'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Gaps & Recommended Next Steps */}
              {(analysis.criticalGaps || analysis.topGaps).length > 0 && (
                <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Targeted Actions to Bridge Role Gaps
                      </h4>
                      <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
                        Closing these prioritized gaps directly elevates your candidacy to <strong>Strong Fit</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(analysis.criticalGaps || analysis.topGaps).map((gap, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800/40 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {gap.skill}
                            </span>
                            <span className="text-[10px] text-rose-500 font-semibold">
                              Deficit: -{gap.gap} pts below target ({gap.targetLevel}%)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-600">
                            {gap.importance}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => onSelectSkillForVerification && onSelectSkillForVerification(gap.skill)}
                            className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                          >
                            <span>Verify {gap.skill}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
