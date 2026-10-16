import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  FolderGit2, 
  Award, 
  Clock, 
  FileText, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info
} from 'lucide-react';
import { apiService } from '../../services/api';

interface EvidenceMatrixDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  onEvidenceAdded?: () => void;
}

export const EvidenceMatrixDrawer: React.FC<EvidenceMatrixDrawerProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName = "Dhruv Patil",
  onEvidenceAdded
}) => {
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNSUPPORTED'>('ALL');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // New Evidence Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formType, setFormType] = useState<string>("PROJECT");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formUrl, setFormUrl] = useState<string>("");
  const [formSkills, setFormSkills] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await apiService.getEvidenceMatrix(studentId);
      if (res && res.status === "success") {
        setMatrixData(res.matrix);
      }
    } catch (e) {
      console.warn("Failed to load evidence matrix:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMatrix();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);

    const skillsArray = formSkills
      ? formSkills.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      const res = await apiService.submitEvidence({
        student_id: studentId,
        title: formTitle,
        type: formType,
        description: formDesc,
        url_or_repo: formUrl,
        extracted_skills: skillsArray
      });

      if (res && res.status === "success") {
        setSubmitSuccess(`Evidence incorporated! ${res.skills_affected?.join(', ')} confidence scores updated.`);
        setFormTitle("");
        setFormDesc("");
        setFormUrl("");
        setFormSkills("");
        setShowAddForm(false);
        fetchMatrix();
        if (onEvidenceAdded) onEvidenceAdded();
      }
    } catch (err: any) {
      console.warn("Error submitting evidence:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillsList = matrixData?.skills || [];
  const filteredSkills = skillsList.filter((s: any) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                ESCO & O*NET CANONICAL TAXONOMY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                MULTI-TIER EVIDENCE LEDGER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Evidence-to-Skill Verification Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every skill is a verified claim, not just a resume keyword. Evaluated with multi-tier weights (Projects 1.0, Assessments 0.85, Certificates 0.70) and exponential time decay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancel" : "Add Evidence"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white block">{matrixData?.total_skills || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">{matrixData?.summary?.verified_count || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fully Verified (&gt;=75%)</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-xl font-black text-amber-500 block">{matrixData?.summary?.partial_count || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partially Verified</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-xl font-black text-rose-500 block">{matrixData?.summary?.unsupported_count || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unsupported Claims</span>
          </div>
        </div>

        {/* Add Evidence Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleSubmitEvidence} className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-200 dark:border-indigo-900/50 space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Link Concrete Evidence to Skill Registry</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Artifact Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Redis Caching & Pub-Sub Microservice Project"
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Evidence Tier</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="PROJECT">Project / Working Code (Weight 1.0)</option>
                  <option value="ASSESSMENT">Proctored Assessment (Weight 0.85)</option>
                  <option value="INTERNSHIP">Internship Letter (Weight 0.80)</option>
                  <option value="CERTIFICATE">Certificate / NPTEL (Weight 0.70)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Repository or Verification URL</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://github.com/dhruvpatil/project-name"
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Associated Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="e.g. Redis, Python, Docker, Caching"
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Brief Technical Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                placeholder="Architected Redis in-memory cache layer for FastAPI endpoints..."
                className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{isSubmitting ? "Linking..." : "Commit Evidence & Re-Index"}</span>
              </button>
            </div>
          </form>
        )}

        {submitSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1">Filter:</span>
            {(['ALL', 'VERIFIED', 'PARTIALLY_VERIFIED', 'UNSUPPORTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filter === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400">
            Showing {filteredSkills.length} skills
          </span>
        </div>

        {/* Skills Matrix List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Computing Skill Evidence Confidence...</p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No skills found under the selected filter.
            </div>
          ) : (
            filteredSkills.map((sk: any, idx: number) => {
              const isExpanded = expandedSkill === sk.skill;
              const isVer = sk.status === 'VERIFIED';
              const isPart = sk.status === 'PARTIALLY_VERIFIED';

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div
                    onClick={() => setExpandedSkill(isExpanded ? null : sk.skill)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isVer ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                      ) : isPart ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4.5 h-4.5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4.5 h-4.5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sk.skill}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                            isVer
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isPart
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {sk.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {sk.category} • {sk.canonical_code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {sk.confidence_score}% Confidence
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              isVer ? 'bg-emerald-500' : isPart ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${sk.confidence_score}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {sk.evidence_count} {sk.evidence_count === 1 ? 'Proof' : 'Proofs'}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Trace: Linked Evidence Artifacts */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Source Evidence Trace & Cryptographic Artifacts:</span>
                      </span>

                      {sk.evidence_items && sk.evidence_items.length > 0 ? (
                        <div className="space-y-2">
                          {sk.evidence_items.map((ev: any, evIdx: number) => (
                            <div
                              key={evIdx}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {ev.type}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {ev.title}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                                  {ev.description}
                                </p>
                                {ev.url_or_repo && (
                                  <span className="text-[10px] font-mono text-indigo-500 truncate block max-w-md">
                                    Ref: {ev.url_or_repo}
                                  </span>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                                  Quality: {Math.round((ev.strength || 0.8) * 100)}%
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {ev.created_at || 'Recent'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No evidence artifacts submitted yet. Claim is unverified.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Compliant with National Higher Education Qualifications Framework (NHEQF).</span>
          </div>
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
