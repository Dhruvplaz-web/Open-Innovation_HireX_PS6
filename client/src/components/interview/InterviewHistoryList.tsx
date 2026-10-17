import React from 'react';
import { 
  History, 
  Calendar, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  PlusCircle
} from 'lucide-react';
import type { InterviewSession } from '../../types/interview';

interface InterviewHistoryListProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
  onNewInterview: () => void;
}

export const InterviewHistoryList: React.FC<InterviewHistoryListProps> = ({
  sessions,
  onSelectSession,
  onNewInterview,
}) => {
  const getScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Incomplete
        </span>
      );
    }
    if (score >= 8.5) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          {score.toFixed(1)} / 10 &bull; Ready
        </span>
      );
    }
    if (score >= 7.0) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
          {score.toFixed(1)} / 10 &bull; Competent
        </span>
      );
    }
    if (score >= 5.0) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
          {score.toFixed(1)} / 10 &bull; Needs Practice
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
        {score.toFixed(1)} / 10 &bull; Needs Work
      </span>
    );
  };

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark p-12 text-center shadow-sm">
        <div className="inline-flex p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 mb-3">
          <History className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Past Simulations Recorded</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          You haven't completed any AI mock interviews yet. Launch your first session to test your knowledge against real industry interview questions.
        </p>
        <button
          onClick={onNewInterview}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs shadow-xs transition"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Launch New Simulation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            Interview History & Progression
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track your performance improvements across past simulated interviews.
          </p>
        </div>
        <button
          onClick={onNewInterview}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs transition shadow-xs"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Simulation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sessions.map((sess) => {
          const isCompleted = sess.status === 'COMPLETED' && !!sess.overall_evaluation;
          const score = sess.overall_evaluation?.overall_score;
          const answeredCount = sess.questions.filter(q => !!q.student_answer).length;
          const dateStr = new Date(sess.created_at * 1000).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={sess.id}
              className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                    {sess.role}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                    {sess.round}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
                    {sess.difficulty}
                  </span>
                  {sess.target_company && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Target: <span className="text-slate-800 dark:text-slate-200 font-semibold">{sess.target_company}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {dateStr}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                    {answeredCount} of {sess.questions.length} answered
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {sess.duration_minutes} min limit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div>{getScoreBadge(score)}</div>

                <button
                  onClick={() => onSelectSession(sess)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                >
                  <span>{isCompleted ? 'View Full Audit' : 'Resume Session'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
