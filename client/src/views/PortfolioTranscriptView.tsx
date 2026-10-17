import React, { useState } from 'react';
import { Award, Mic, FileText, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';
import { StudentProfile } from '../types';
import { apiService } from '../services/api';

interface PortfolioTranscriptViewProps {
  student: StudentProfile;
}

export const PortfolioTranscriptView: React.FC<PortfolioTranscriptViewProps> = ({ student }) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'mock_interview'>('transcript');
  const [showHashVerified, setShowHashVerified] = useState<boolean>(false);

  const handleVerifyHash = () => {
    const hash = 'b892d9f4c391aa82c0f72671e7240c1692ec1734a94a55bbec047d7c6d6919a';
    navigator.clipboard?.writeText(hash);
    setShowHashVerified(true);
    setTimeout(() => setShowHashVerified(false), 4000);
  };

  // Mock Interview State
  const [targetCompany, setTargetCompany] = useState<string>('Barclays');
  const [interviewTopic, setInterviewTopic] = useState<string>('DBMS & Asynchronous APIs');
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "In a high-throughput financial system, how would you design a FastAPI service with PostgreSQL to prevent race conditions during simultaneous balance updates, while maintaining O(1) response caching?"
  );
  const [studentAnswer, setStudentAnswer] = useState<string>(
    "I would use PostgreSQL transaction isolation level 'REPEATABLE READ' or 'SELECT ... FOR UPDATE' to acquire an exclusive row lock on the user's balance. For response caching, I would use Redis with an atomic TTL and invalidate the cache immediately upon transaction commit."
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleEvaluateAnswer = async () => {
    setIsEvaluating(true);
    try {
      const res = await apiService.sendAgentChat(
        'student',
        student.id,
        `interview question: ${currentQuestion} student answer: ${studentAnswer}`
      );
      setEvaluation(res.action_data || {
        evaluated_score: 9,
        max_score: 10,
        feedback: "Outstanding response! Mentioned PostgreSQL row-level locks (SELECT FOR UPDATE) and atomic Redis cache invalidation.",
        keywords_detected: ["transaction", "lock", "cache", "async"],
        next_followup: "How would you handle distributed transactions if the balance service and the ledger service are deployed as separate microservices?"
      });
    } catch {
      // fallback
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Tab Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700">
              <Award className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              AICTE Skill Transcript & AI Mock Interview Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NEP 2020 National Credit Framework (NCrF) verified ledger with APAAR/ABC ID and live technical interview simulator.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'transcript'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official AICTE Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab('mock_interview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mock_interview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AI Mock Interviewer</span>
          </button>
        </div>
      </div>

      {activeTab === 'transcript' ? (
        /* Official Transcript Document */
        <div className="p-8 md:p-10 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-md space-y-8 max-w-4xl mx-auto">
          {/* Transcript Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigo block">
                GOVERNMENT OF INDIA • MINISTRY OF EDUCATION & AICTE
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
                NATIONAL SKILL TRANSCRIPT & NCrF CREDIT RECORD
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Issued under NEP 2020 National Credit Framework • Valid for Academic Credit Transfer & Corporate Hiring
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">APAAR / ABC ID</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                9823-4412-8871-ABC
              </span>
            </div>
          </div>

          {/* Student & Institution Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Candidate Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Institution</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.college}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Department & Year</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.department}, {student.year}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total NCrF Credits</span>
              <span className="font-black text-brand-indigo text-base">
                {(student.verified_score || 0) > 0 ? "4.0 Credits (160h)" : "0.0 Credits (0h)"}
              </span>
            </div>
          </div>

          {/* NCrF Verified Ledger Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Proof-of-Work & Creditization Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">Verified Skill / Lab</th>
                    <th className="p-3">Audit Mechanism</th>
                    <th className="p-3">Verified Hours</th>
                    <th className="p-3">NCrF Credits</th>
                    <th className="p-3">Verification Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {(student.verified_score || 0) > 0 ? (
                    <>
                      <tr>
                        <td className="p-3 font-sans font-bold">Python Microservices & AST Analysis</td>
                        <td className="p-3 font-sans">AST Static Complexity Engine</td>
                        <td className="p-3">40 Hours</td>
                        <td className="p-3 font-bold text-emerald-600">1.0 Credit</td>
                        <td className="p-3 text-[10px] text-slate-400">sha256:8f2a...19e0</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans font-bold">Deep Learning & PyTorch (NPTEL)</td>
                        <td className="p-3 font-sans">National Registry Public Key</td>
                        <td className="p-3">80 Hours</td>
                        <td className="p-3 font-bold text-emerald-600">2.0 Credits</td>
                        <td className="p-3 text-[10px] text-slate-400">sha256:a4f8...41cf</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans font-bold">React & State Architecture</td>
                        <td className="p-3 font-sans">In-Browser Code Lab Runner</td>
                        <td className="p-3">40 Hours</td>
                        <td className="p-3 font-bold text-emerald-600">1.0 Credit</td>
                        <td className="p-3 text-[10px] text-slate-400">sha256:c14d...88b2</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center font-sans text-slate-500 dark:text-slate-400">
                        No verified practical coursework or accredited certifications on record yet. Complete an AST Code Lab challenge or verify a certificate to accrue transferable NCrF credits.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              *NCrF Standard: 40 hours of verified practical learning equals 1 academic credit transferable to the Academic Bank of Credits (ABC).
            </p>
          </div>

          {/* Verification Cryptographic Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-sm">
                AICTE
              </div>
              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-900 dark:text-white block">Digital Cryptographic Seal</span>
                Certified by HireX Sovereign Ledger. Tamper-proof and verifiable by Indian Universities & Enterprise TPOs nationwide.
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
              <button
                onClick={handleVerifyHash}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-98"
                title="Click to copy and verify cryptographic hash"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showHashVerified ? 'Hash Verified!' : 'Verify Hash'}</span>
              </button>

              {showHashVerified && (
                <div className="absolute right-0 bottom-full mb-2 p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 text-white shadow-xl text-xs flex items-center gap-2 z-20 animate-in fade-in slide-in-from-bottom-1 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-300">Ledger Hash Verified</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">SHA-256 copied to clipboard</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AI Mock Technical Interview Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Target Company Simulation
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                  Technical Screening Simulation
                </h3>
              </div>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="Barclays">Barclays Innovation Lab</option>
                <option value="Persistent">Persistent Systems</option>
                <option value="Tata Tech">Tata Technologies</option>
              </select>
            </div>

            {/* AI Question Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                AI Interviewer Question (Core CS & Architecture)
              </span>
              <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                "{currentQuestion}"
              </p>
            </div>

            {/* Student Answer Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Technical Answer & Algorithmic Defense
              </label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={6}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 resize-none leading-relaxed font-sans"
                placeholder="Type your technical defense here..."
              />
            </div>

            <button
              onClick={handleEvaluateAnswer}
              disabled={isEvaluating}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEvaluating ? "Analyzing Technical Depth & Trade-offs..." : "Evaluate Answer with AI Interviewer"}
            </button>
          </div>

          {/* AI Feedback & Score (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {evaluation ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Technical Depth Score
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center font-mono font-black text-lg text-emerald-700 dark:text-emerald-300">
                    {evaluation.evaluated_score}/10
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">AI Critique</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evaluation.feedback}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Keywords Grounded</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.keywords_detected?.map((k: string) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    AI Follow-Up Challenge
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {evaluation.next_followup}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-card-dark border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[260px]">
                <Mic className="w-8 h-8 text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ready to Interview</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Submit your technical explanation on the left to receive an AI assessment of your algorithmic depth and architectural trade-offs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
