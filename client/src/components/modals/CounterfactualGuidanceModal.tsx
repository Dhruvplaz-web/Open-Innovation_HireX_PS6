import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  HelpCircle, 
  Send, 
  RefreshCw,
  Building,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/api';

interface CounterfactualGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  studentId?: string;
  opportunityTitle?: string;
  companyName?: string;
}

export const CounterfactualGuidanceModal: React.FC<CounterfactualGuidanceModalProps> = ({
  isOpen,
  onClose,
  opportunityId,
  studentId = "std_1",
  opportunityTitle = "Full-Stack AI Engineer",
  companyName = "Enterprise Placement Partner"
}) => {
  const [guidance, setGuidance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Dispute form state
  const [showDisputeForm, setShowDisputeForm] = useState<boolean>(false);
  const [disputedSkill, setDisputedSkill] = useState<string>("");
  const [disputeArgument, setDisputeArgument] = useState<string>("");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState<boolean>(false);
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !opportunityId) return;

    let mounted = true;
    const fetchGuidance = async () => {
      setLoading(true);
      try {
        const res = await apiService.getOpportunityCounterfactual(opportunityId, studentId);
        if (mounted && res && res.status === "success") {
          setGuidance(res.guidance);
          if (res.guidance.missing_skills?.[0]) {
            setDisputedSkill(res.guidance.missing_skills[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load counterfactual guidance:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchGuidance();
    return () => { mounted = false; };
  }, [isOpen, opportunityId, studentId]);

  if (!isOpen) return null;

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeArgument.trim() || !disputedSkill.trim()) return;

    setIsSubmittingDispute(true);
    setDisputeSuccess(null);

    try {
      const res = await apiService.fileOpportunityDispute(opportunityId, {
        student_id: studentId,
        disputed_skill: disputedSkill,
        student_argument: disputeArgument,
        supporting_evidence_url: evidenceUrl
      });

      if (res && res.status === "success") {
        setDisputeSuccess(res.message);
        setDisputeArgument("");
        setEvidenceUrl("");
        setShowDisputeForm(false);
      }
    } catch (err: any) {
      console.warn("Dispute error:", err);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const fitScore = guidance?.overall_fit || 75;
  const verdict = guidance?.verdict || "GOOD_FIT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI EXPLAINABILITY ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                COUNTERFACTUAL GUIDANCE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Why You Match & How to Bridge the Gap
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{guidance?.company || companyName}</span>
              <span>•</span>
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{guidance?.role || opportunityTitle}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Generating Counterfactual Match Analysis...</p>
            </div>
          ) : (
            <>
              {/* Overall Verdict Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-slate-400 uppercase">
                      Current Eligibility Verdict:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase font-mono ${
                      verdict === 'STRONG_FIT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : verdict === 'GOOD_FIT'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {verdict.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed max-w-xl">
                    {guidance?.natural_language_explanation}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 p-3 sm:p-0 rounded-xl bg-white dark:bg-slate-900 sm:bg-transparent border sm:border-none border-slate-200 dark:border-slate-700">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 block">{fitScore}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Fit Score</span>
                </div>
              </div>

              {/* Counterfactual Advice (Minimal-Effort Bridge) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Shortest Path to Qualify (Minimal-Effort Bridge)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Target: 85%+ Direct Shortlist
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {guidance?.counterfactual_advice}
                </p>

                {/* Minimal Effort Action Cards */}
                <div className="space-y-2 pt-1">
                  {(guidance?.minimal_effort_actions || []).map((action: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                            {action.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {action.action}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
                          {action.rationale}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                            +{action.projected_fit_lift}% Fit Lift
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            <span>{action.estimated_hours} hrs</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Review / Dispute Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Disagree with this Evaluation? Request Human Review</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Contest any skill interpretation. Prof. S. R. Deshmukh (TPO Incharge) will manually inspect your evidence.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDisputeForm(!showDisputeForm)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    {showDisputeForm ? "Close Form" : "Dispute Fit"}
                  </button>
                </div>

                {disputeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{disputeSuccess}</span>
                  </div>
                )}

                {showDisputeForm && (
                  <form onSubmit={handleDisputeSubmit} className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Disputed Skill</label>
                        <input
                          type="text"
                          required
                          value={disputedSkill}
                          onChange={(e) => setDisputedSkill(e.target.value)}
                          placeholder="e.g. Redis or Docker"
                          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Supporting Evidence Link (optional)</label>
                        <input
                          type="text"
                          value={evidenceUrl}
                          onChange={(e) => setEvidenceUrl(e.target.value)}
                          placeholder="https://github.com/my-repo"
                          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Your Justification</label>
                      <textarea
                        required
                        value={disputeArgument}
                        onChange={(e) => setDisputeArgument(e.target.value)}
                        rows={2}
                        placeholder="Explain why your project or coursework fulfills this requirement..."
                        className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingDispute}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSubmittingDispute ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Submit to Faculty Review Queue</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>AICTE & APAAR Transparent Evaluation Standards.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
