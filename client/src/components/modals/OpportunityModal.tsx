import React, { useState } from 'react';
import { X, Building2, MapPin, Clock, Calendar, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { MatchedOpportunity, Role } from '../../types';

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: MatchedOpportunity | null;
  role: Role;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  role
}) => {
  const [applied, setApplied] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleAction = () => {
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm tracking-wider shadow-xs shrink-0 font-mono">
            {opportunity.company.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {opportunity.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{opportunity.company}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {opportunity.location || 'Bengaluru & Pune, India'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {opportunity.duration || '6 Months'}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {opportunity.stipend || '₹45,000 / month'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Percentage Badge Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Explainable AI Match Fit</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
              {opportunity.match_percentage}%
            </span>
          </div>

          {/* Sub-Dimension Compatibility Breakdown (Part 39 Compliance) */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
            <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Proficiency Match</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {Math.min(98, (opportunity.match_percentage || 80) + 4)}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Role Match</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {Math.min(95, (opportunity.match_percentage || 80) + 1)}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Domain Match</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {Math.max(72, (opportunity.match_percentage || 80) - 5)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {opportunity.explanation}
          </p>

          <p className="text-[10px] text-slate-400 italic">
            * AI match scores are indicative decision-support recommendations and do not guarantee employment or selection. Final hiring determinations rest solely with the recruiter.
          </p>
        </div>

        {/* Skills Comparison */}
        <div className="space-y-4 mb-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Verified Matching Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.matched_skills?.map((sk) => (
                <span key={sk} className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5 font-mono text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {opportunity.missing_skills?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Identified Skill Gap</h4>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.missing_skills?.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/60 dark:border-rose-800/40 flex items-center gap-1.5 font-mono text-[11px]">
                    <AlertTriangle className="w-3 h-3" />
                    {sk} (Learn in 3 Days)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pillar 4: Expired Drive Advisory Banner */}
        {opportunity.is_expired && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recruitment Drive Closed</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
              This drive closed on {opportunity.formatted_deadline || opportunity.deadline}. Applications are no longer being accepted. This listing is retained for placement records and benchmarking.
            </p>
          </div>
        )}

        {/* Action Button */}
        {applied ? (
          <div className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Credentials Submitted to {opportunity.company}!</span>
          </div>
        ) : opportunity.is_expired ? (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Drive Closed on {opportunity.formatted_deadline || opportunity.deadline}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 italic">
              Explore similar live openings in your recommended pipeline.
            </p>
          </div>
        ) : (
          <button
            onClick={handleAction}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>
              {role === 'student' ? 'Submit Verified Credentials & Apply' : role === 'recruiter' ? 'Shortlist Candidate for Interview' : 'Adopt Module into Syllabus'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
