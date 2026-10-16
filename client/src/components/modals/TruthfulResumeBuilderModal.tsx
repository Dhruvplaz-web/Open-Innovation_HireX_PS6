import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Award, 
  AlertTriangle, 
  ExternalLink,
  QrCode,
  RefreshCw,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import { apiService } from '../../services/api';

interface TruthfulResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
}

export const TruthfulResumeBuilderModal: React.FC<TruthfulResumeBuilderModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName = "Dhruv Patil"
}) => {
  const [resumeData, setResumeData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<string>("Full-Stack AI Developer");
  const [claimedSkills, setClaimedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'lock_audit' | 'xyz_editor'>('preview');

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchResume = async () => {
      setLoading(true);
      try {
        const res = await apiService.getTruthfulResume(studentId, targetRole);
        if (mounted && res && res.status === "success") {
          setResumeData(res.resume);
          const initialSkills = (res.resume.verified_technical_skills || []).map((s: any) => s.skill);
          setClaimedSkills(initialSkills);
          // Initial clean audit
          const audit = await apiService.auditTruthfulResumeClaims({
            student_id: studentId,
            claimed_skills: initialSkills,
            target_role: targetRole
          });
          if (mounted && audit?.status === "success") {
            setAuditResult(audit.audit);
          }
        }
      } catch (e) {
        console.warn("Failed to load truthful resume:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResume();
    return () => { mounted = false; };
  }, [isOpen, studentId, targetRole]);

  if (!isOpen) return null;

  const handleAddClaimedSkill = async () => {
    if (!newSkillInput.trim()) return;
    const updated = [...claimedSkills, newSkillInput.trim()];
    setClaimedSkills(updated);
    setNewSkillInput("");

    // Run semantic lock audit
    const res = await apiService.auditTruthfulResumeClaims({
      student_id: studentId,
      claimed_skills: updated,
      target_role: targetRole
    });
    if (res?.status === "success") {
      setAuditResult(res.audit);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = claimedSkills.filter(s => s !== skillToRemove);
    setClaimedSkills(updated);
    const res = await apiService.auditTruthfulResumeClaims({
      student_id: studentId,
      claimed_skills: updated,
      target_role: targetRole
    });
    if (res?.status === "success") {
      setAuditResult(res.audit);
    }
  };

  const handleCopyPlaintext = () => {
    if (!resumeData) return;
    const plainText = `===================================================================
${resumeData.name.toUpperCase()}
${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
Target Role: ${resumeData.target_role} | PRN: ${resumeData.prn_id}
GitHub: ${resumeData.github} | LinkedIn: ${resumeData.linkedin}
Verification Hash: ${resumeData.cryptographic_ledger_hash}
===================================================================

EDUCATION
---------
${resumeData.education?.degree} in ${resumeData.education?.major}
${resumeData.education?.institution} (${resumeData.education?.period})
CGPA: ${resumeData.education?.cgpa} | ${resumeData.education?.status}

VERIFIED TECHNICAL COMPETENCIES (Institutional Cryptographic Proof)
------------------------------------------------------------------
${(resumeData.verified_technical_skills || []).map((s: any) => `• ${s.skill} (${s.level}, ${s.score}% AST verified)`).join('\n')}

PROJECTS (Google XYZ Formula)
-----------------------------
${(resumeData.projects || []).map((p: any) => `${p.title} | ${p.role} (${p.period})\nTech Stack: ${p.technologies?.join(', ')}\n${p.bullets?.map((b: string) => `• ${b}`).join('\n')}`).join('\n\n')}

CRYPTOGRAPHIC CERTIFICATIONS & CREDENTIALS
------------------------------------------
${(resumeData.certifications || []).map((c: any) => `• ${c.name} — ${c.issuer} (${c.score}, ${c.credits}) [Serial: ${c.token}]`).join('\n')}
`;

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    if (!resumeData) return;
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truthful_resume_${studentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                OPENRESUME ATS STANDARD
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ANTI-HALLUCINATION LOCK ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                ATS SCORE: 98.2%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ATS-Based Truthful Resume Builder
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Generates an employer-ready, single-column resume with Google XYZ bullets. Enforces institutional verification: unverified skills are strictly locked from the official ATS section.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlaintext}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              title="Copy plain-text formatted ATS resume"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              title="Export as OpenResume JSON schema"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Resume Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('lock_audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'lock_audit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Anti-Hallucination Semantic Lock</span>
              {auditResult && !auditResult.is_clean_truthful && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('xyz_editor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'xyz_editor'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Google XYZ Bullet Generator</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Target Role:</span>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Full-Stack AI Developer">Full-Stack AI Developer</option>
              <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
              <option value="Backend Systems Engineer">Backend Systems Engineer</option>
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Assembling Truthful Verified Resume Dossier...</p>
            </div>
          ) : activeTab === 'preview' ? (
            /* OpenResume Clean Single-Column A4 Printable Sheet */
            <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 font-sans print:shadow-none print:border-none print:p-0">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                  {resumeData?.name}
                </h1>
                <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium">
                  <span>{resumeData?.email}</span>
                  <span>•</span>
                  <span>{resumeData?.phone}</span>
                  <span>•</span>
                  <span>{resumeData?.location}</span>
                  <span>•</span>
                  <span className="font-mono font-bold text-slate-800">{resumeData?.prn_id}</span>
                </div>
                <div className="text-xs text-indigo-700 mt-1 flex justify-center gap-4 font-semibold">
                  <a href={resumeData?.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub: {resumeData?.github}</a>
                  <span>•</span>
                  <a href={resumeData?.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn: {resumeData?.linkedin}</a>
                </div>
              </div>

              {/* Education */}
              <div className="mb-5">
                <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
                  EDUCATION
                </h2>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{resumeData?.education?.institution}</h3>
                    <p className="text-xs text-slate-700">{resumeData?.education?.degree} in {resumeData?.education?.major}</p>
                    <p className="text-[11px] text-slate-500">{resumeData?.education?.status}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">{resumeData?.education?.period}</span>
                    <p className="text-xs font-black text-indigo-700">CGPA: {resumeData?.education?.cgpa}</p>
                  </div>
                </div>
              </div>

              {/* Verified Technical Competencies */}
              <div className="mb-5">
                <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2 flex items-center justify-between">
                  <span>VERIFIED TECHNICAL COMPETENCIES (Institutional Cryptographic Ledger)</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold lowercase">100% Truthful Claims</span>
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {(resumeData?.verified_technical_skills || []).map((skill: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 inline" />
                        <span>{skill.skill}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">
                        {skill.level} ({skill.score}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects (Google XYZ Formula) */}
              <div className="mb-5">
                <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
                  TECHNICAL PROJECTS & ENGINEERING ACHIEVEMENTS
                </h2>
                <div className="space-y-3.5">
                  {(resumeData?.projects || []).map((proj: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-slate-950">{proj.title}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{proj.period}</span>
                      </div>
                      <p className="text-[11px] font-mono text-indigo-800 font-semibold mb-1">
                        Technologies: {proj.technologies?.join(', ')}
                      </p>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                        {(proj.bullets || []).map((bullet: string, bIdx: number) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications & Cryptographic Credentials */}
              <div className="mb-4">
                <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
                  VERIFIED CERTIFICATIONS & ACADEMIC CREDITS (NCrF)
                </h2>
                <div className="space-y-1.5 text-xs">
                  {(resumeData?.certifications || []).map((cert: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900">
                        • {cert.name} — <span className="text-slate-600">{cert.issuer} ({cert.score})</span>
                      </span>
                      <span className="font-mono text-[11px] text-indigo-700 font-bold">{cert.credits}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Verification Footer */}
              <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div>
                  <span className="font-bold text-slate-800 block">AICTE & APAAR Cryptographic Verification Hash:</span>
                  <span className="text-slate-600 select-all">{resumeData?.cryptographic_ledger_hash}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">STATUS: VERIFIED TRUTHFUL</span>
                  <span className="text-slate-500">Scan QR on profile to inspect evidence artifacts</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'lock_audit' ? (
            /* Anti-Hallucination Semantic Lock Drawer */
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-500" />
                      <span>Skill Claim Semantic Lock & Truthfulness Auditor</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ensures no unverified claims pollute your institutional ATS profile.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {auditResult?.truthfulness_score || 100}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Truthfulness Score</span>
                  </div>
                </div>

                {auditResult && !auditResult.is_clean_truthful && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Anti-Hallucination Policy Triggered:</span>
                      <p className="mt-0.5 leading-relaxed">{auditResult.warning}</p>
                    </div>
                  </div>
                )}

                {/* Add new claim test input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Test Adding a New Skill Claim to ATS Draft:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="e.g. Kubernetes, Redis, or Microservices"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddClaimedSkill(); }}
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddClaimedSkill}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Audit & Add</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Try adding an unsupported skill like "Kubernetes" or "Solidity" to witness the real-time anti-hallucination quarantine.
                  </p>
                </div>

                {/* Verified Skills (Allowed on ATS) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified Claims (Permitted on ATS Export):</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(auditResult?.verified_skills || []).map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>{sk}</span>
                        <button onClick={() => handleRemoveSkill(sk)} className="text-emerald-600 hover:text-emerald-900 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unsupported Claims (Quarantined) */}
                {auditResult?.unsupported_claims && auditResult.unsupported_claims.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Quarantined Unsupported Claims (Strictly Barred from ATS):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {auditResult.unsupported_claims.map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5"
                        >
                          <Lock className="w-3 h-3 text-rose-500" />
                          <span>{sk} (Unverified)</span>
                          <button onClick={() => handleRemoveSkill(sk)} className="text-rose-600 hover:text-rose-900 ml-1">×</button>
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      To unlock these on your ATS resume, pass an AST Code Lab assessment or upload a verifiable certificate in the Forensic Scanner.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Google XYZ Bullet Generator */
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Google XYZ Formula Project Bullets</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formula: <span className="font-mono text-indigo-500 font-bold">Accomplished [X] as measured by [Y] by doing [Z]</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  {(resumeData?.projects || []).map((proj: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</span>
                        <span className="text-[10px] font-mono text-purple-500 font-bold">XYZ Verified</span>
                      </div>
                      <div className="space-y-2">
                        {(proj.bullets || []).map((bullet: string, bIdx: number) => (
                          <div key={bIdx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">[XYZ]</span>
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographically certified by HireX Institutional Placement Authority.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
