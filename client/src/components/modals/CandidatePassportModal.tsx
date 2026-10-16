import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Clock, ExternalLink, Award, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

interface CandidatePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName?: string;
}

export const CandidatePassportModal: React.FC<CandidatePassportModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName = 'Student Candidate'
}) => {
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !candidateId) return;

    let mounted = true;
    const fetchPassport = async () => {
      setLoading(true);
      try {
        const res = await apiService.getRecruiterCandidatePassport(candidateId);
        if (mounted && res.status === 'success') {
          setCandidateData(res.candidate);
        }
      } catch (err) {
        console.error('Failed to load candidate passport:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPassport();
    return () => { mounted = false; };
  }, [isOpen, candidateId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              PRIVACY-PRESERVING RECRUITER VIEW
            </span>
            <h3 className="text-xl font-black text-white">
              {candidateData?.candidateName || candidateName}
            </h3>
            <p className="text-xs text-indigo-200/80">
              {candidateData?.department} • {candidateData?.college} ({candidateData?.year})
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading verified skill credentials...
            </div>
          ) : candidateData ? (
            <>
              {/* Score telemetry banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-center">
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {candidateData.overallVerifiedScore}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Verified Index
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {candidateData.verifiedSkills?.length || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Verified Skills
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                    {candidateData.projectsCount || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Verified Projects
                  </div>
                </div>
              </div>

              {/* Verified Skills List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verified Skills & Evidence Trace
                </h4>
                <div className="space-y-2">
                  {candidateData.verifiedSkills?.map((vs: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/15 dark:bg-emerald-950/10 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {vs.skillName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            {vs.score}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {vs.hasProjectEvidence && <span>✓ Project Evidence</span>}
                          {vs.hasGithubEvidence && <span>✓ GitHub Code Commits</span>}
                          {vs.hasCertification && <span>✓ Accredited Cert</span>}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {vs.badgeType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Areas / Improvement */}
              {candidateData.improvementSkills?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Developing Skills (Gaps Below 70% Cutoff)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {candidateData.improvementSkills.map((is: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-950/10 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{is.skillName}</span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold">{is.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Candidate passport unavailable.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-102 transition"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
