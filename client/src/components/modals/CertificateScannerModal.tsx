import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Sparkles, 
  Award, 
  Fingerprint, 
  Layers, 
  ArrowRight, 
  Cpu, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { apiService } from '../../services/api';

interface CertificateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  onCertificateCommitted?: (result: any) => void;
}

const PRESET_CERTIFICATES = [
  {
    label: "NPTEL Elite + Gold (Valid)",
    issuer: "NPTEL / IIT",
    type: "valid",
    text: `NATIONAL PROGRAMME ON TECHNOLOGY ENHANCED LEARNING (NPTEL)
Course: Cloud Computing & Distributed Systems
This is to certify that DHRUV PATIL
has successfully completed the 12-week course with a consolidated score of 84%
Elite + Gold Certificate
Roll No: NPTEL24CS71S345
Issued: October 2024
Verified via Swayam Portal with AICTE Approval.`
  },
  {
    label: "AWS Solutions Architect (Valid)",
    issuer: "Amazon Web Services",
    type: "valid",
    text: `Amazon Web Services Training and Certification
This acknowledges that
Dhruv Patil
has successfully achieved the AWS Certified Solutions Architect - Associate certification
Validation Number: AWS-SAA-902184-2024
Issue Date: August 15, 2024
Issued by Amazon Web Services Training and Certification.`
  },
  {
    label: "Fraud Demo: KYC Name Mismatch",
    issuer: "NPTEL / IIT",
    type: "fraud_name",
    text: `NATIONAL PROGRAMME ON TECHNOLOGY ENHANCED LEARNING (NPTEL)
Course: Advanced Deep Learning & Computer Vision
This is to certify that ROHAN DESHMUKH
has successfully completed the 8-week course with a consolidated score of 91%
Elite Certificate
Roll No: NPTEL24CS88M102
Issued: September 2024.`
  },
  {
    label: "Coursera Python & SQL (Valid)",
    issuer: "Coursera",
    type: "valid",
    text: `Coursera Verified Certificate
This is to certify that Dhruv Patil has successfully completed
Python for Data Science, AI & Development with PostgreSQL & Redis
Authorized by IBM and offered through Coursera
Grade Achieved: 95.5%
Certificate ID: COURSERA-IBM-948271
Issued on: July 2024`
  }
];

export const CertificateScannerModal: React.FC<CertificateScannerModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName = "Dhruv Patil",
  onCertificateCommitted
}) => {
  const [rawText, setRawText] = useState<string>(PRESET_CERTIFICATES[0].text);
  const [kycName, setKycName] = useState<string>(studentName);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanResult]);

  if (!isOpen) return null;

  const handleScan = async (overrideText?: string) => {
    const textToScan = overrideText !== undefined ? overrideText : rawText;
    if (!textToScan.trim()) {
      setScanError("Please enter or paste certificate text or choose a preset.");
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setCommitSuccess(null);
    setScanResult(null);

    try {
      const res = await apiService.scanCertificateForensics({
        raw_text: textToScan,
        student_id: studentId,
        student_kyc_name: kycName
      });

      if (res && res.status === "success") {
        setScanResult(res.audit);
      } else {
        setScanError(res?.message || "Failed to audit certificate. Check server connection.");
      }
    } catch (err: any) {
      setScanError(err.message || "An unexpected error occurred during OCR audit.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommit = async () => {
    if (!scanResult) return;
    setIsCommitting(true);
    setScanError(null);

    try {
      const res = await apiService.commitCertificateToProfile({
        student_id: studentId,
        certificate_data: scanResult
      });

      if (res && res.status === "success") {
        setCommitSuccess(`Credential committed! +${res.credits_added} NCrF Credits, and skills added to your Verified Profile.`);
        if (onCertificateCommitted) {
          onCertificateCommitted(res);
        }
      } else {
        setScanError(res?.message || "Failed to commit credential to profile.");
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to commit credential.");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_CERTIFICATES[0]) => {
    setRawText(preset.text);
    setScanResult(null);
    setScanError(null);
    setCommitSuccess(null);
    handleScan(preset.text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        handleScan(content);
      }
    };
    reader.readAsText(file);
  };

  const isVerified = scanResult?.audit_verdict === "VERIFIED_GENUINE";
  const isSuspicious = scanResult?.audit_verdict?.includes("SUSPICIOUS") || scanResult?.audit_verdict?.includes("FRAUD");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                FORENSIC CREDENTIAL SCANNER
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ANTI-FRAUD KYC GATEWAY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Institutional Certificate & Skill Verifier
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Optical Anchor Extraction for NPTEL, AWS, Coursera, HackerRank & Microsoft certifications. Automatically verifies candidate KYC name similarity, SHA-256 duplicate collision ledger, and canonical ESCO taxonomy mapping.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Buttons for Quick Demo Testing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Interactive Preset Scenarios (Click to Live Audit):</span>
              </span>
              <span className="text-[10px] text-slate-400">Benchmarked for Judge UAT</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_CERTIFICATES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition flex flex-col justify-between gap-1.5 ${
                    preset.type === 'fraud_name'
                      ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] truncate">{preset.issuer}</span>
                    {preset.type === 'fraud_name' ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-200 text-rose-900 dark:bg-rose-900/80 dark:text-rose-100">
                        Fraud Demo
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Valid
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs: Candidate KYC Name & Raw OCR Text / File Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Candidate KYC Legal Name</span>
                  <span className="text-[10px] font-mono text-indigo-500">UIDAI / Student ID</span>
                </label>
                <input
                  type="text"
                  value={kycName}
                  onChange={(e) => setKycName(e.target.value)}
                  placeholder="e.g. Dhruv Patil"
                  className="w-full mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used by Levenshtein distance matcher to detect forged names or certificate sharing fraud.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  Upload Certificate Document
                </span>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Select Certificate File</span>
                  <span className="text-[9px] text-slate-400">PDF, TXT, or scan receipt</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.json,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleScan()}
                disabled={isScanning || !rawText.trim()}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Optical Forensic Audit...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run Forensic Audit & OCR</span>
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Certificate Raw OCR Text Stream</span>
                <span className="text-[10px] font-mono text-slate-400">Extracted OCR Payload</span>
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={9}
                placeholder="Paste raw certificate text, transcript, or credentials..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {scanError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {commitSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{commitSuccess}</span>
            </div>
          )}

          {/* Audit Results View */}
          {scanResult && (
            <div ref={resultsRef} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isVerified
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100'
                    : isSuspicious
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-100'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isVerified ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : isSuspicious ? (
                    <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black tracking-wide uppercase">
                        VERDICT: {scanResult.audit_verdict}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/70 dark:bg-slate-900/60 font-mono">
                        Score: {scanResult.confidence_score}%
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-1 max-w-xl">
                      {scanResult.forensic_notes}
                    </p>
                  </div>
                </div>

                {isVerified && !commitSuccess && (
                  <button
                    type="button"
                    onClick={handleCommit}
                    disabled={isCommitting}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isCommitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Committing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Commit to Verified Profile</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Extracted Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Credential Issuer</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                    {scanResult.issuer}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Extracted Title</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block truncate" title={scanResult.credential_title}>
                    {scanResult.credential_title}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Candidate KYC Match</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xs font-bold ${
                      scanResult.identity_match_ratio >= 0.75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {Math.round(scanResult.identity_match_ratio * 100)}% Match
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">({scanResult.extracted_holder_name})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tier & NCrF Credits</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      +{scanResult.ncrf_credits} Credits
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      ({scanResult.tier})
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Fingerprint */}
              <div className="p-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-white">SHA-256 Collision Ledger Hash:</span>
                </div>
                <span className="font-mono text-[11px] text-indigo-300 break-all select-all">
                  {scanResult.sha256_hash}
                </span>
              </div>

              {/* ESCO Canonical Skills Extracted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extracted & Mapped Skills (ESCO / O*NET Canonical Standard):</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {scanResult.canonical_skills?.length || 0} Skills Discovered
                  </span>
                </div>

                {scanResult.canonical_skills && scanResult.canonical_skills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {scanResult.canonical_skills.map((skill: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {skill.skill}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                            +{skill.evidence_weight} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">{skill.esco_uri || "ESCO Canonical"}</span>
                          <span className="text-slate-500">Tier: {skill.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No direct skills matched canonical taxonomy.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>AICTE & APAAR National Academic Credit Framework compliant.</span>
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
