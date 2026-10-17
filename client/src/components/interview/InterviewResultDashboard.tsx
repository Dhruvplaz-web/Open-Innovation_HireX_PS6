import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  BrainCircuit, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Share2, 
  FileCheck2, 
  Cpu
} from 'lucide-react';
import type { FinalInterviewReport, InterviewSession, InterviewQuestion } from '../../types/interview';

interface InterviewResultDashboardProps {
  report: FinalInterviewReport;
  session: InterviewSession;
  onRetake: () => void;
  onViewHistory: () => void;
}

export const InterviewResultDashboard: React.FC<InterviewResultDashboardProps> = ({
  report,
  session,
  onRetake,
  onViewHistory,
}) => {
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const getScoreBadgeClass = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40';
    if (score >= 7.0) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';
    if (score >= 5.0) return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40';
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40';
  };

  const getScoreProgressBg = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500 dark:bg-emerald-400';
    if (score >= 7.0) return 'bg-blue-500 dark:bg-blue-400';
    if (score >= 5.0) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-rose-500 dark:bg-rose-400';
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestionIndex(expandedQuestionIndex === idx ? null : idx);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const metricCards = [
    { label: 'Technical Depth', score: report.category_scores.technical_depth, max: 10, desc: 'Architecture, core algorithms & domain accuracy' },
    { label: 'Problem Solving', score: report.category_scores.problem_solving, max: 10, desc: 'Approach, edge-case coverage & logical trade-offs' },
    { label: 'Relevance', score: report.category_scores.relevance, max: 10, desc: 'Direct answers addressing exact constraints' },
    { label: 'Communication', score: report.category_scores.communication, max: 10, desc: 'Structure, clarity & articulate terminology' },
    { label: 'Industry Readiness', score: report.category_scores.industry_knowledge, max: 10, desc: 'Production patterns, tooling & best practices' },
  ];

  const dateFormatted = new Date(session.created_at * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Executive Summary Card matching HireX UI */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                Evaluation Complete
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {dateFormatted}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {report.ai_engine_used}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Interview Performance Audit & Assessment
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Role: <span className="font-semibold text-slate-800 dark:text-slate-200">{session.role}</span> &bull; Round: <span className="font-semibold text-slate-800 dark:text-slate-200">{session.round}</span> &bull; Target: <span className="font-semibold text-slate-900 dark:text-white">{session.target_company}</span>
            </p>
          </div>

          {/* Overall Score Dial */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 self-stretch md:self-auto justify-between md:justify-start">
            <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex flex-col items-center justify-center font-mono border border-emerald-200 dark:border-emerald-800">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{report.overall_score.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 -mt-1 font-bold">/{report.max_score}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Readiness Verdict
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-block mt-1 ${getScoreBadgeClass(report.overall_score)}`}>
                {report.verdict}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 font-mono">
                {report.total_questions_answered} of {session.questions.length} questions evaluated
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Simulation</span>
          </button>

          <button
            onClick={onViewHistory}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Past Sessions</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Save as PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 ml-auto"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Audit'}</span>
          </button>
        </div>
      </div>

      {/* 2. 5-Dimensional Core Competencies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            5-Dimensional Core Competencies
          </h3>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Calibrated to Campus Hiring Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {metricCards.map((m, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  {m.label}
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{m.score.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-mono">/{m.max}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full ${getScoreProgressBg(m.score)} transition-all duration-500`}
                    style={{ width: `${(m.score / m.max) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Strengths & Strategic Growth Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 md:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">Demonstrated Strengths</h4>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">Key capabilities highlighted during your screening</p>
            </div>
          </div>
          <ul className="space-y-2 pt-1">
            {report.strengths.map((str: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="p-5 md:p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100">Areas for Strategic Growth</h4>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">Concepts to reinforce before senior corporate drives</p>
            </div>
          </div>
          <ul className="space-y-2 pt-1">
            {report.areas_for_improvement.map((area: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Question-by-Question Detailed Transcript */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              Detailed Session Audit & Transcript
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review your answers, AI critiques, detected terminology, and gold standard model answers.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {session.questions.filter(q => !!q.student_answer).length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {session.questions.map((q: InterviewQuestion, idx: number) => {
            const isExpanded = expandedQuestionIndex === idx;
            const evalItem = q.evaluation;
            const score = evalItem?.overall_score ?? 0;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden transition"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold shrink-0 border border-slate-200 dark:border-slate-700">
                      Q{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                          {q.category || 'Technical'}
                        </span>
                        {evalItem && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              Score: <span className="font-bold text-slate-900 dark:text-white">{score.toFixed(1)}/10</span>
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {evalItem ? (
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getScoreBadgeClass(score)}`}>
                        {score >= 7.5 ? 'Strong' : score >= 5.5 ? 'Adequate' : 'Needs Review'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-800">
                        Unanswered
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-150">
                    {/* Candidate Answer */}
                    <div className="mt-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Your Submitted Defense
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {q.student_answer || '<No answer recorded>'}
                      </div>
                    </div>

                    {/* AI Constructive Critique */}
                    {evalItem && (
                      <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-bold">
                            AI Interviewer Feedback & Evaluation
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {evalItem.feedback}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Gaps for this question */}
                    {evalItem && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evalItem.strengths && evalItem.strengths.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                            <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold block mb-1.5">
                              Key Strengths Highlighted
                            </span>
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                              {evalItem.strengths.map((s: string, i: number) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {evalItem.weaknesses && evalItem.weaknesses.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                            <span className="text-[10px] font-mono uppercase text-amber-800 dark:text-amber-300 font-bold block mb-1.5">
                              Gaps Identified
                            </span>
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                              {evalItem.weaknesses.map((w: string, i: number) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detected & Missed Terminology */}
                    {evalItem && (evalItem.keywords_detected?.length > 0 || evalItem.concepts_missed?.length > 0) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-mono text-slate-400">Technical Concepts:</span>
                        {evalItem.keywords_detected?.map((k: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                            ✓ {k}
                          </span>
                        ))}
                        {evalItem.concepts_missed?.map((m: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold border border-rose-200/60 dark:border-rose-800/40">
                            ✗ {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gold Standard Ideal Model Answer */}
                    {(q.model_answer || evalItem?.model_answer) && (
                      <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold">
                            Gold Standard Technical Answer
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                          {evalItem?.model_answer || q.model_answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 7-Day Personalized Acceleration Roadmap */}
      {report.personalized_preparation_plan && report.personalized_preparation_plan.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Personalized Acceleration Roadmap</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tailored preparation blueprint generated based on gaps detected in your interview session
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.personalized_preparation_plan.map((plan: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 font-mono text-[10px] font-bold inline-block mb-2">
                    {plan.day}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 leading-snug">{plan.focus}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{plan.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recommended Topics */}
      {report.recommended_topics && report.recommended_topics.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-indigo-700 dark:text-indigo-300 font-bold">Recommended Topics:</span>
          {report.recommended_topics.map((top: string, i: number) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold">
              {top}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
