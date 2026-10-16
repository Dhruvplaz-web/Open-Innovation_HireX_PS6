import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  GitMerge,
  FileCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../../services/api';

interface PasteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess?: (newJobOrMerged: any) => void;
}

const PRESET_SAMPLES = [
  {
    id: 'whatsapp_messy',
    label: 'WhatsApp Forward (Messy SDE)',
    sourceType: 'WHATSAPP_FORWARD',
    submittedBy: 'TPO Placement Coordinators Group',
    text: `[10/16/26, 9:42 AM] Prof. Sharma TPO: 🚨 URGENT CAMPUS OPENING FOR 2026 BATCH 🚨
Company: TechCorp Innovations
Position: Junior Software Developer / React Dev
Package: 8.5 LPA (Fixed + Variables)
Eligibility: BE / BTech 2026 Batch (CS/IT/E&TC) with 60%+ throughout.
Location: Pune / Bengaluru (Hybrid)

Must have skills:
- Strong in py, Reactjs, fast api, and SQL queries
- Good problem solving, DSA, OOPs concepts

Preferred / Good to have:
- Experience with Docker, git, and aws is a plus!

Share resume with your TPO coordinator or reply directly. Do NOT spam!
Contact: +91 98765 43210
Forwarded many times`
  },
  {
    id: 'duplicate_barclays',
    label: 'Duplicate Referral (Barclays Intern)',
    sourceType: 'ALUMNI_REFERRAL',
    submittedBy: 'Alumni Referral - Rohan Deshmukh (Batch 2024)',
    text: `Hey TPO sir, our team at Barclays India Innovation Centre is hiring for the Full-Stack AI Developer Intern role!
Stipend is around 45k per month.
Targeting 2026 passouts.
Required: Python, React, FastAPI, Machine Learning.
Good to have: Docker.
Can you please ask interested candidates to send their verified profiles?`
  },
  {
    id: 'alumni_fintech',
    label: 'Alumni Referral (Fintech Backend)',
    sourceType: 'ALUMNI_REFERRAL',
    submittedBy: 'Alumni Referral - Sneha Gupta (Batch 2022, Razorpay)',
    text: `Hi juniors! Razorpay is looking for Backend Platform Engineers (2025/2026 Batch).
CTC offered: 14 to 18 LPA based on technical rounds.
Mandatory requirements: Go or Python, PostgreSQL, Redis, Microservices architecture, and clean DSA.
Bonus skills: Kubernetes, Kafka, gRPC.
Drop your HireX passport link so I can fast-track your referral directly to the engineering hiring manager!`
  }
];

export const PasteJobModal: React.FC<PasteJobModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('whatsapp_messy');
  const [sourceType, setSourceType] = useState<string>('WHATSAPP_FORWARD');
  const [submittedBy, setSubmittedBy] = useState<string>('TPO Placement Coordinators Group');
  const [rawText, setRawText] = useState<string>(PRESET_SAMPLES[0].text);

  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESET_SAMPLES.find((p) => p.id === presetId);
    if (preset) {
      setSourceType(preset.sourceType);
      setSubmittedBy(preset.submittedBy);
      setRawText(preset.text);
      setParseResult(null);
      setConfirmSuccess(null);
      setParseError(null);
    }
  };

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseError(null);
    setConfirmSuccess(null);

    try {
      const res = await apiService.parseRawJobOpening(rawText, sourceType, submittedBy);
      if (res && res.status === 'success') {
        setParseResult(res);
      } else {
        setParseError('Failed to parse text. Please check connection to HireX backend.');
      }
    } catch (err: any) {
      setParseError(err.message || 'An error occurred during AI parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmIngest = async (forceSeparate: boolean = false) => {
    if (!parseResult) return;
    setIsConfirming(true);
    setParseError(null);

    const isDuplicate = parseResult.duplicate_analysis?.is_duplicate && !forceSeparate;
    const actionType: 'MERGE_EXISTING' | 'CREATE_CANONICAL' = isDuplicate ? 'MERGE_EXISTING' : 'CREATE_CANONICAL';
    const matchedJobId = isDuplicate ? parseResult.duplicate_analysis.matched_job_id : null;

    try {
      const payload = {
        raw_text: rawText,
        source_type: sourceType,
        submitted_by: submittedBy,
        company: parseResult.extracted_entities.company,
        title: parseResult.extracted_entities.title,
        ctc_display: parseResult.extracted_entities.ctc_display,
        min_ctc: parseResult.extracted_entities.min_ctc,
        max_ctc: parseResult.extracted_entities.max_ctc,
        eligible_batch: parseResult.extracted_entities.eligible_batch,
        required_skills: parseResult.tiered_skills.required,
        preferred_skills: parseResult.tiered_skills.preferred,
        action_type: actionType,
        matched_job_id: matchedJobId
      };

      const res = await apiService.confirmJobIngestion(payload);
      if (res && res.status === 'success') {
        setConfirmSuccess(res);
        if (onIngestSuccess) {
          onIngestSuccess(res.job);
        }
      } else {
        setParseError('Failed to complete job ingestion.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Ingestion confirmation failed.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Banner */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Multi-Source Job Ingestor & WhatsApp Deduplicator
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                Module 1 Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ingests raw WhatsApp forwards, alumni referrals & external postings. Strips forward noise, normalizes skills to canonical ontology, tiers into Required (70%) vs Preferred (30%), and merges duplicates.
            </p>
          </div>
        </div>

        {/* Preset Sample Selector for Quick Evaluation */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Preset Samples:</span>
          </span>
          {PRESET_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectPreset(sample.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedPreset === sample.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Success Banner if Ingested */}
        {confirmSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {confirmSuccess.action === 'MERGED_INTO_EXISTING'
                    ? 'Referral Source Merged Successfully!'
                    : 'Verified Placement Drive Published Live!'}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {confirmSuccess.message}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-emerald-800 dark:text-emerald-400">
                  <span>Job ID: {confirmSuccess.job?.id}</span>
                  <span>•</span>
                  <span>Company: {confirmSuccess.job?.company}</span>
                  <span>•</span>
                  <span>Title: {confirmSuccess.job?.title}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0"
            >
              Done
            </button>
          </div>
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Raw Message Input & Origin Config */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Source Channel:
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="WHATSAPP_FORWARD">WhatsApp Group Forward</option>
                  <option value="ALUMNI_REFERRAL">Alumni Direct Referral</option>
                  <option value="JOB_BOARD">External Job Board / Aggregator</option>
                  <option value="PARTNER_DIRECT">Corporate Partner Posting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Submitted / Forwarded By:
                </label>
                <input
                  type="text"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="e.g. Prof. Kulkarni / Sneha '22"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Raw Message / Opening Text:
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {rawText.length} characters
                </span>
              </div>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the raw WhatsApp message, email, or JD text here..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleParse}
              disabled={isParsing || !rawText.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Entities & Checking Radar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze, Normalize & Check Duplicates</span>
                </>
              )}
            </button>

            {parseError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {parseError}
              </div>
            )}
          </div>

          {/* Right Column: AI Extraction & Deduplication Radar */}
          <div className="space-y-4">
            {!parseResult && !isParsing && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Awaiting Ingestion Analysis
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Paste raw text on the left or click a Preset Sample, then click <strong>Analyze, Normalize & Check Duplicates</strong>.
                  </p>
                </div>
              </div>
            )}

            {isParsing && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Executing Token Sanitizer, Ontology Mapper & Deduplication Radar...
                </p>
              </div>
            )}

            {parseResult && !isParsing && (
              <div className="space-y-4 animate-in fade-in">
                {/* 1. Deduplication Radar Card */}
                {(() => {
                  const dup = parseResult.duplicate_analysis;
                  const isDup = dup?.is_duplicate;
                  const scorePct = Math.round((dup?.composite_score || 0) * 100);

                  return (
                    <div
                      className={`p-4 rounded-2xl border ${
                        isDup
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {isDup ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                {isDup ? 'Duplicate Drive Detected' : 'Verified Unique Opening'}
                              </h4>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                  isDup
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                Match Score: {scorePct}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                              {dup?.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Formula Disclosure for Judges */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>
                          S<sub>comp</sub> = 0.40·S<sub>co</sub> + 0.35·S<sub>title</sub> + 0.25·J(Skills)
                        </span>
                        <span className="font-bold">
                          Threshold: ≥ 80.0%
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Extracted Entities Grid */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Auto-Extracted Entities
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      <span>WhatsApp Noise Stripped</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Company</span>
                      <strong className="text-slate-900 dark:text-white truncate block">
                        {parseResult.extracted_entities.company}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Role Title</span>
                      <strong className="text-slate-900 dark:text-white truncate block">
                        {parseResult.extracted_entities.title}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">CTC Package</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 truncate block font-mono">
                        {parseResult.extracted_entities.ctc_display}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Eligible Batch</span>
                      <strong className="text-slate-900 dark:text-white truncate block font-mono">
                        {parseResult.extracted_entities.eligible_batch}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Skill Ontology Normalizer & Tiering */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Canonical Skill Ontology & Tiering
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                      150+ Aliases Mapped
                    </span>
                  </div>

                  {/* Required Skills (70%) */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Required Skills (Hard Criteria - 70% weight):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {parseResult.tiered_skills.required.map((sk: string) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-mono font-bold"
                        >
                          {sk}
                        </span>
                      ))}
                      {parseResult.tiered_skills.required.length === 0 && (
                        <span className="text-xs text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Preferred Skills (30%) */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Preferred Skills (Bonus Criteria - 30% weight):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {parseResult.tiered_skills.preferred.map((sk: string) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 text-xs font-mono font-bold"
                        >
                          {sk}
                        </span>
                      ))}
                      {parseResult.tiered_skills.preferred.length === 0 && (
                        <span className="text-xs text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Ingestion Action Execution Button */}
                <div className="pt-2">
                  {parseResult.duplicate_analysis?.is_duplicate ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConfirmIngest(false)}
                        disabled={isConfirming || !!confirmSuccess}
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        {isConfirming ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Merging Referral Source...</span>
                          </>
                        ) : (
                          <>
                            <GitMerge className="w-4 h-4" />
                            <span>Merge Referral Source into Active Drive (Prevent Duplicate)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleConfirmIngest(true)}
                        disabled={isConfirming || !!confirmSuccess}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
                      >
                        Force Ingest as Separate Opening
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirmIngest(false)}
                      disabled={isConfirming || !!confirmSuccess}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isConfirming ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing Live Drive...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Ingest Verified Drive (Broadcast to Students)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
