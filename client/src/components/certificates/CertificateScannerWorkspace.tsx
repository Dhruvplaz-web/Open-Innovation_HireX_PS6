import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Sparkles,
  Award,
  Fingerprint,
  Layers,
  ArrowRight,
  Cpu,
  RefreshCw,
  ExternalLink,
  Info,
  Calendar,
  KeyRound,
  FileCheck,
  Building2,
  TrendingUp,
  Clock,
  Copy,
  Check,
  FileText,
  BadgeCheck,
  Briefcase
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { apiService } from '../../services/api';

interface CertificateScannerWorkspaceProps {
  student: StudentProfile;
  onProfileUpdated?: (updatedStudent: any) => void;
}

interface PresetCertificate {
  label: string;
  badge: string;
  issuer: string;
  providerType: 'microsoft' | 'aws' | 'nptel' | 'coursera' | 'anomaly';
  type: 'valid' | 'fraud_name' | 'expired' | 'collision';
  text: string;
  description: string;
}

const PRESET_CERTIFICATES: PresetCertificate[] = [
  {
    label: "Microsoft Certified: Azure AI Engineer Associate",
    badge: "Microsoft Certified",
    issuer: "Microsoft Learn",
    providerType: "microsoft",
    type: "valid",
    description: "AI-102 Azure Cognitive Services, Azure OpenAI, Machine Learning, Computer Vision",
    text: `Microsoft Certified Professional
This acknowledges that
Dhruv Patil
has successfully achieved the certification
Microsoft Certified: Azure AI Engineer Associate
Certification Number: MS-AI102-984210
Issue Date: October 14, 2024
Valid Through: October 14, 2026
Verified via Microsoft Learn Credential Registry: learn.microsoft.com/en-us/users/credentials/verification?credentialId=MS-AI102-984210
Official Issuer API: Microsoft Graph Credential Verification`
  },
  {
    label: "Microsoft Certified: Power BI Data Analyst",
    badge: "Microsoft Certified",
    issuer: "Microsoft Learn",
    providerType: "microsoft",
    type: "valid",
    description: "PL-300 Data Modeling, DAX, Power BI, Advanced SQL, Business Intelligence",
    text: `Microsoft Certified Professional
This is to certify that
Dhruv Patil
has demonstrated competency and achieved
Microsoft Certified: Power BI Data Analyst Associate
Credential ID: MS-PL300-449102
Issue Date: November 05, 2024
Valid Through: November 05, 2026
Verify at learn.microsoft.com/en-us/users/credentials/verification?credentialId=MS-PL300-449102`
  },
  {
    label: "AWS Certified Solutions Architect – Associate",
    badge: "AWS Certified",
    issuer: "Amazon Web Services",
    providerType: "aws",
    type: "valid",
    description: "Cloud Architecture, AWS Microservices, Distributed Systems, High Availability",
    text: `Amazon Web Services Training and Certification
This acknowledges that
Dhruv Patil
has successfully achieved the AWS Certified Solutions Architect - Associate certification
Validation Number: AWS-SAA-902184-2024
Issue Date: August 15, 2024
Verify at aws.amazon.com/verification
Issued by Amazon Web Services Training and Certification.`
  },
  {
    label: "NPTEL / IIT Cloud Computing (Elite + Gold)",
    badge: "NPTEL / SWAYAM",
    issuer: "Ministry of Education & IIT",
    providerType: "nptel",
    type: "valid",
    description: "Cloud Computing, Distributed Systems, Linux Kernel, Consolidated Score: 88%",
    text: `NATIONAL PROGRAMME ON TECHNOLOGY ENHANCED LEARNING (NPTEL)
Course: Cloud Computing & Distributed Systems
This is to certify that DHRUV PATIL
has successfully completed the 12-week course with a consolidated score of 88%
Elite + Gold Certificate
Roll No: NPTEL24CS71S345
Issued: October 2024
Verified via Swayam Portal with AICTE Approval.`
  },
  {
    label: "Fraud Demo: KYC Name Mismatch",
    badge: "Anti-Fraud Trigger",
    issuer: "NPTEL / IIT",
    providerType: "anomaly",
    type: "fraud_name",
    description: "Tampered candidate name 'Rohan Deshmukh' vs authenticated student 'Dhruv Patil'",
    text: `NATIONAL PROGRAMME ON TECHNOLOGY ENHANCED LEARNING (NPTEL)
Course: Advanced Deep Learning & Computer Vision
This is to certify that ROHAN DESHMUKH
has successfully completed the 8-week course with a consolidated score of 91%
Elite Certificate
Roll No: NPTEL24CS88M102
Issued: September 2024.`
  },
  {
    label: "Anomaly Demo: Expired Credential",
    badge: "Temporal Anomaly",
    issuer: "AWS Certification",
    providerType: "anomaly",
    type: "expired",
    description: "Expired certification (expired January 2025) requiring active professional renewal",
    text: `Amazon Web Services Training and Certification
Dhruv Patil
AWS Certified Developer - Associate
Validation Number: AWS-DEV-192837
Issue Date: January 10, 2022
Expiration Date: January 10, 2025
Status: Expired`
  }
];

export const CertificateScannerWorkspace: React.FC<CertificateScannerWorkspaceProps> = ({
  student,
  onProfileUpdated
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [rawText, setRawText] = useState<string>(PRESET_CERTIFICATES[0].text);
  const [kycName, setKycName] = useState<string>(student?.name || "Dhruv Patil");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Local vault of committed certificates
  const [committedVault, setCommittedVault] = useState<any[]>([
    {
      id: "vault_1",
      issuer: "Ministry of Education & IIT Madras (NPTEL)",
      issuer_key: "NPTEL",
      course_title: "Deep Learning & Neural Architectures",
      tier: "Elite + Gold",
      score: 92,
      credential_id: "NPTEL24CS10S98765",
      issue_date: "August 2024",
      sha256_hash: "0xa4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf",
      verification_link: "https://nptel.ac.in/noc/Ecertificate/?q=NPTEL24CS10S98765",
      skills: ["Deep Learning", "Machine Learning", "Neural Networks", "Python"],
      ncrf_credits: 3,
      status: "VERIFIED_AUTHENTIC"
    }
  ]);

  const auditSectionRef = useRef<HTMLDivElement>(null);

  // Initialize first scan on mount
  useEffect(() => {
    handleRunScan(PRESET_CERTIFICATES[0].text, student?.name || "Dhruv Patil");
  }, []);

  const handleRunScan = async (textToScan: string, nameToVerify: string) => {
    if (!textToScan.trim()) {
      setScanError("Please provide certificate document text or select a preset scenario.");
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setCommitSuccess(null);

    try {
      const res = await apiService.scanCertificateForensics({
        raw_text: textToScan,
        student_id: student?.id || "std_1",
        student_kyc_name: nameToVerify
      });

      if (res && res.status === "success" && res.audit) {
        setScanResult(res.audit);
      } else {
        setScanError(res?.message || "Certificate forensic scan failed. Please check backend service.");
      }
    } catch (err: any) {
      setScanError(err.message || "An unexpected error occurred during document parsing.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = PRESET_CERTIFICATES[index];
    setRawText(preset.text);
    setCommitSuccess(null);
    setScanError(null);
    handleRunScan(preset.text, kycName);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        handleRunScan(content, kycName);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitToProfile = async () => {
    if (!scanResult || !scanResult.is_authentic) return;
    setIsCommitting(true);
    setScanError(null);

    try {
      const res = await apiService.commitCertificateToProfile({
        student_id: student?.id || "std_1",
        certificate_data: scanResult
      });

      if (res && res.status === "success") {
        setCommitSuccess(
          `Credential officially committed! Verified ${scanResult.skills.length} skills to profile. +${scanResult.ncrf_credits} NCrF Academic Credits assigned.`
        );

        // Add to local vault
        const newEntry = {
          id: `vault_${Date.now()}`,
          ...scanResult
        };
        setCommittedVault((prev) => [newEntry, ...prev.filter((c) => c.credential_id !== scanResult.credential_id)]);

        if (onProfileUpdated && res.student) {
          onProfileUpdated(res.student);
        }
      } else {
        setScanError(res?.message || "Failed to commit verified credential to profile.");
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to commit credential to profile.");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isVerified = scanResult?.is_authentic === true;
  const isSuspicious = scanResult && !scanResult.is_authentic;
  const isExpired = scanResult?.is_expired === true;
  const isDuplicate = scanResult?.status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-brand-indigo flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              AI Parser & OCR Engine
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Multi-Issuer OCR</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Microsoft & Global Trust
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Issuer API Anchors
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Forensic Anti-Fraud
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              SHA-256 & Levenshtein
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Committed in Vault
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {committedVault.length} Verified Credential{committedVault.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Scenarios Quick Picker */}
      <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-indigo" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interactive Scenarios & Vendor Verification Presets
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any card to live-audit Microsoft, AWS, NPTEL, or Fraud anomalies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_CERTIFICATES.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            const isFraud = preset.type === 'fraud_name';
            const isExp = preset.type === 'expired';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 relative ${
                  isSelected
                    ? 'border-brand-indigo bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-brand-indigo/30'
                    : isFraud
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/60'
                    : isExp
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/60'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {preset.providerType === 'microsoft' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    {preset.providerType === 'aws' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    {preset.providerType === 'nptel' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    {preset.providerType === 'anomaly' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {preset.issuer}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isFraud
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isExp
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isFraud ? 'Fraud Flag' : isExp ? 'Expired' : 'Verified'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {preset.label}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Document Ingestion Zone: Upload, KYC Verification & OCR Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: KYC Name & Drag-and-Drop Zone */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Student KYC Legal Name</span>
                <span className="text-[10px] text-indigo-500 font-mono">UIDAI / Institutional ID</span>
              </label>
              <input
                type="text"
                value={kycName}
                onChange={(e) => setKycName(e.target.value)}
                placeholder="e.g. Dhruv Patil"
                className="w-full mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-indigo"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Audited against certificate holder name via Levenshtein distance to prevent unauthorized certificate sharing.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Upload Certificate Document
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-brand-indigo hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition group">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition mb-2">
                  <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-indigo" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Certificate File
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PDF, PNG, JPG, or OCR Text Stream
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => handleRunScan(rawText, kycName)}
              disabled={isScanning || !rawText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-brand-indigo dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Certificate Stream...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Run OCR Forensic Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Raw OCR Stream View / Editor */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Optical Character Recognition (OCR) Payload & Credential Stream</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  Real-time parsed buffer
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={11}
                placeholder="Paste raw certificate text, verification token, or credential transcript..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-indigo leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Supports Microsoft Certifications, AWS, NPTEL, Coursera, HackerRank, and Accredited Universities.</span>
              </span>
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
              >
                Clear Stream
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error / Alert Messages */}
      {scanError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-medium">{scanError}</span>
        </div>
      )}

      {commitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{commitSuccess}</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-mono">
            LIVE SYNCED
          </span>
        </div>
      )}

      {/* 4. Live Forensic Audit Verdict Panel */}
      {scanResult && (
        <div ref={auditSectionRef} className="space-y-6 pt-2 animate-in fade-in duration-300">
          {/* Main Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
              isVerified
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                : isDuplicate
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
                : isExpired
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-100'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : isDuplicate || !isVerified
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                }`}
              >
                {isVerified ? (
                  <ShieldCheck className="w-7 h-7" />
                ) : isDuplicate ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wider uppercase">
                    AUDIT VERDICT: {scanResult.audit_verdict}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700">
                    KYC Match: {Math.round((scanResult.name_match_score || 1) * 100)}%
                  </span>
                  {isVerified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                      Authentic Credential
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium max-w-2xl leading-relaxed">
                  {scanResult.audit_summary}
                </p>
              </div>
            </div>

            {isVerified && !commitSuccess && (
              <button
                type="button"
                onClick={handleCommitToProfile}
                disabled={isCommitting}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition shrink-0 flex items-center gap-2 disabled:opacity-50"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Committing Skills...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit Verified Skills to Profile</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Extracted Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Issuing Organization</span>
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">
                {scanResult.issuer}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {scanResult.badge}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Certification Name</span>
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1" title={scanResult.course_title}>
                {scanResult.course_title}
              </span>
              <span className="text-[10px] font-semibold text-brand-indigo block">
                Tier: {scanResult.tier} {scanResult.score ? `(${scanResult.score_display})` : ''}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Credential ID</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block truncate">
                {scanResult.credential_id}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Issued: {scanResult.issue_date || 'October 2024'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Validity & Credits</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +{scanResult.ncrf_credits} NCrF Credits
                </span>
              </div>
              <span className={`text-[10px] font-bold block ${
                scanResult.is_expired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
              }`}>
                {scanResult.is_expired ? 'EXPIRED' : scanResult.expiry_date ? `Valid Thru ${scanResult.expiry_date}` : 'Lifetime Valid'}
              </span>
            </div>
          </div>

          {/* Verification Channel & Cryptographic Hash */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-brand-indigo shrink-0" />
                <span className="text-xs font-bold">Cryptographic Registry Proof (SHA-256):</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono text-indigo-300 break-all">
                  {scanResult.sha256_hash}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyHash(scanResult.sha256_hash)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {scanResult.verification_link && (
              <a
                href={scanResult.verification_link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 border border-slate-700"
              >
                <span>Verify on Official Issuer Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            )}
          </div>

          {/* 5. Extracted Skills & Industry Competency Matrix */}
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-indigo" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Industry Competency Mapping & Verified Skill Evidence
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Canonical ESCO & O*NET taxonomy mapping linked directly to credential ID <span className="font-mono text-slate-600 dark:text-slate-300">"{scanResult.credential_id}"</span>
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-brand-indigo text-xs font-bold">
                {scanResult.canonical_skills?.length || scanResult.skills?.length || 0} Skills Extracted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(scanResult.canonical_skills || []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-brand-indigo transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.skill}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      +{item.evidence_weight}% Evidence
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{item.category}</span>
                    <span className="font-mono text-indigo-500">Cred: {item.supporting_cert_id.slice(0, 10)}...</span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Verified Profile Endorsement</span>
                    </span>
                    <span className="text-slate-400 font-mono">ESCO Standard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Student's Verified Credential Vault */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-indigo">
              <BadgeCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Candidate Verified Credentials Vault
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tamper-evident record of all audited certifications boosting candidate ranking & recruiters' search
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-brand-indigo">
            {committedVault.length} Credentials Active
          </span>
        </div>

        <div className="space-y-3">
          {committedVault.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {item.issuer_key || 'CERT'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.course_title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    ({item.tier})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Credential ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{item.credential_id}</strong></span>
                  <span>•</span>
                  <span>Issued: {item.issue_date}</span>
                  <span>•</span>
                  <span>NCrF: <strong className="text-emerald-600 dark:text-emerald-400">+{item.ncrf_credits} Credits</strong></span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(item.skills || []).map((sk: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.verification_link && (
                  <a
                    href={item.verification_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                  >
                    <span>Issuer Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => alert(`Verification Proof:\nSHA-256: ${item.sha256_hash}\nIssued to: ${student?.name || 'Dhruv Patil'}\nStatus: Authenticated`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-brand-indigo text-white text-xs font-bold hover:bg-black dark:hover:bg-indigo-600 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify Hash</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
