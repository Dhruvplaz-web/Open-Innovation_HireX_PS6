import React, { useState, useEffect } from 'react';
import { codeLabApi as apiService } from './codeLabApi';
import { ProctoringRulesModal } from './proctoring/ProctoringRulesModal';
import { ProctoringHUD } from './proctoring/ProctoringHUD';
import {
  CodeLabMode,
  ChallengeType,
  CodingChallenge,
  ProveMySkillsAnalysis,
  CodeLabSubmissionResult,
  CodingMission,
  MistakePattern,
  SkillTestingMatrixRow,
  CodeLabOverview
} from './codeLab.types';
import {
  Code2,
  ShieldCheck,
  Github,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Award,
  Flame,
  Zap,
  Brain,
  Compass,
  Database,
  Bug,
  FileSearch,
  Layers,
  TrendingUp,
  Terminal,
  Check,
  RotateCcw,
  HelpCircle,
  Send,
  Clock,
  Cpu,
  History,
  Lock,
  CheckSquare,
  FileCode,
  Info
} from 'lucide-react';

export const CodeLabView: React.FC = () => {
  // Navigation & Mode
  const [activeMode, setActiveMode] = useState<CodeLabMode>('prove_my_skills');
  const [labSubMode, setLabSubMode] = useState<string>('all');

  // Overview & Evidence State
  const [overview, setOverview] = useState<CodeLabOverview | null>(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<ProveMySkillsAnalysis | null>(null);
  const [missions, setMissions] = useState<CodingMission[]>([]);
  const [mistakePatterns, setMistakePatterns] = useState<MistakePattern[]>([]);
  const [skillMatrix, setSkillMatrix] = useState<SkillTestingMatrixRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Challenge Bank & Active Challenge State
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [interviewExplanation, setInterviewExplanation] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [sqlResult, setSqlResult] = useState<any>(null);

  // Execution & Telemetry State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<CodeLabSubmissionResult | null>(null);
  const [telemetryTab, setTelemetryTab] = useState<'tests' | 'ast' | 'proof' | 'sql' | 'hints'>('tests');

  // Legacy DevProof & QR State
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/dhruv-patil/hirex-microservices');
  const [isAuditingRepo, setIsAuditingRepo] = useState<boolean>(false);
  const [repoAuditResult, setRepoAuditResult] = useState<any>(null);
  const [qrPayload, setQrPayload] = useState<string>('NPTEL:2026:CS84:DHRUV_PATIL:SHA256:a4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf');
  const [isVerifyingQR, setIsVerifyingQR] = useState<boolean>(false);
  const [qrResult, setQrResult] = useState<any>(null);

  // Technical Interview Timer State (60 Minutes)
  const [interviewSecondsLeft, setInterviewSecondsLeft] = useState<number>(3600);
  const [isInterviewTimerRunning, setIsInterviewTimerRunning] = useState<boolean>(false);
  const [showProctoringRulesModal, setShowProctoringRulesModal] = useState<boolean>(false);
  const [proctoringStrikes, setProctoringStrikes] = useState<number>(0);
  const [isProctorDismissed, setIsProctorDismissed] = useState<boolean>(false);

  const handleToggleInterview = () => {
    if (!isInterviewTimerRunning) {
      setShowProctoringRulesModal(true);
    } else {
      setIsInterviewTimerRunning(false);
    }
  };

  // Technical Interview Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isInterviewTimerRunning && interviewSecondsLeft > 0) {
      interval = setInterval(() => {
        setInterviewSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (interviewSecondsLeft === 0) {
      setIsInterviewTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isInterviewTimerRunning, interviewSecondsLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, chRes, msRes, miRes, smRes] = await Promise.all([
        apiService.getCodeLabOverview('std_1'),
        apiService.getCodeLabChallenges(),
        apiService.getCodeLabMissions('std_1'),
        apiService.getMistakeIntelligence('std_1'),
        apiService.getCodeLabSkillMatrix('std_1')
      ]);

      setOverview(ovRes);
      setEvidenceAnalysis(ovRes.evidence_analysis);
      setMissions(msRes.missions || ovRes.missions || []);
      setMistakePatterns(miRes.patterns_detected || ovRes.mistake_patterns || []);
      setSkillMatrix(smRes.matrix || []);

      if (chRes.challenges && chRes.challenges.length > 0) {
        setChallenges(chRes.challenges);
        const initialCh = chRes.challenges[0];
        setSelectedChallenge(initialCh);
        setCode(initialCh.starter_code || '');
        if (initialCh.challenge_type === 'SQL') {
          setSqlQuery(initialCh.starter_code || '');
        }
      }
    } catch (err) {
      console.error('Failed to load Code Lab 2.0 data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Select Challenge Handler
  const handleSelectChallenge = (ch: CodingChallenge) => {
    setSelectedChallenge(ch);
    setCode(ch.starter_code || '');
    setSubmissionResult(null);
    setSqlResult(null);
    if (ch.challenge_type === 'SQL') {
      setSqlQuery(ch.starter_code || '');
      setTelemetryTab('sql');
    } else {
      setTelemetryTab('tests');
    }
  };

  // 3. Personalized Auto-Select Handler
  const handleAutoSelectChallenge = async (targetSkill?: string, challengeType?: string) => {
    setIsExecuting(true);
    try {
      const sel = await apiService.selectPersonalizedChallenge({
        student_id: 'std_1',
        mode: activeMode,
        target_skill: targetSkill,
        challenge_type: challengeType
      });

      if (sel.selected_challenge) {
        handleSelectChallenge(sel.selected_challenge);
        setActiveMode('practice');
      }
    } catch (err) {
      console.error('Failed to select personalized challenge:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // 4. Run / Submit Code Handler
  const handleSubmitCode = async () => {
    if (!selectedChallenge) return;
    setIsExecuting(true);
    setSubmissionResult(null);

    try {
      if (selectedChallenge.challenge_type === 'SQL') {
        const sqlRes = await apiService.runSqlQuery({
          challenge_id: selectedChallenge.id,
          student_id: 'std_1',
          sql_query: sqlQuery || code
        });
        setSqlResult(sqlRes);
        setTelemetryTab('sql');
      } else {
        const result = await apiService.submitCodeChallenge({
          challenge_id: selectedChallenge.id,
          student_id: 'std_1',
          source_code: code,
          language: selectedChallenge.language || 'python',
          mode: activeMode,
          interview_explanation: interviewExplanation
        });
        setSubmissionResult(result);
        setTelemetryTab('tests');

        // Refresh overview and skill matrix if score was successful
        if (result.composite_score >= 70) {
          const [freshOv, freshMatrix] = await Promise.all([
            apiService.getCodeLabOverview('std_1'),
            apiService.getCodeLabSkillMatrix('std_1')
          ]);
          setOverview(freshOv);
          setSkillMatrix(freshMatrix.matrix || []);
        }
      }
    } catch (err) {
      console.error('Failed to execute code submission:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // 5. DevProof & QR Verification
  const handleAuditRepo = async () => {
    setIsAuditingRepo(true);
    try {
      const res = await apiService.auditGitHubRepo(repoUrl);
      setRepoAuditResult(res);
    } catch (err) {
      console.error('Failed to audit repo:', err);
    } finally {
      setIsAuditingRepo(false);
    }
  };

  const handleVerifyQR = async () => {
    setIsVerifyingQR(true);
    try {
      const res = await apiService.verifyCredentialQR(qrPayload);
      setQrResult(res);
    } catch (err) {
      console.error('Failed to verify QR:', err);
    } finally {
      setIsVerifyingQR(false);
    }
  };

  // Filtered Challenges for Interactive Lab
  const filteredChallenges = challenges.filter((c) => {
    if (labSubMode === 'all') return true;
    return c.challenge_type.toLowerCase() === labSubMode.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP HEADER & MAIN NAVIGATION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  HireX Code Lab 2.0
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Proof-of-Skill Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalized technical skill validation, AST Big-O complexity auditing, and deterministic evidence generation.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Mode Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('prove_my_skills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'prove_my_skills'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Prove My Skills</span>
          </button>

          <button
            onClick={() => setActiveMode('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'practice'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Interactive Lab</span>
          </button>

          <button
            onClick={() => setActiveMode('missions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'missions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Missions</span>
          </button>

          <button
            onClick={() => setActiveMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Skill Matrix</span>
          </button>

          <button
            onClick={() => setActiveMode('debugging')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'debugging'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>DevProof & QR</span>
          </button>
        </div>
      </div>

      {/* 2. READINESS SCORE & PERSONALIZED RECOMMENDATION BANNER */}
      {overview && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Readiness: {overview.overall_readiness}%
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Strongest: <strong className="text-white">{overview.strongest_skill}</strong>
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Priority Gap: <strong className="text-rose-300">{overview.biggest_gap}</strong>
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Target Career: <strong className="text-indigo-300">{evidenceAnalysis?.target_career || 'Backend Developer'}</strong>
                </span>
              </div>

              {/* Recommendation Callout */}
              {overview.recommended_challenge && (
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Personalized Challenge Recommendation</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">
                      Relevance Score: {overview.recommended_challenge.recommendation_score}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    <strong>{overview.recommended_challenge.selected_challenge?.title}:</strong> {overview.recommended_challenge.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  if (overview.recommended_challenge?.selected_challenge) {
                    handleSelectChallenge(overview.recommended_challenge.selected_challenge);
                    setActiveMode('practice');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Start Recommended Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-Skill Readiness Bar Meters */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            {Object.entries(overview.skill_breakdown || {}).map(([sk, val]) => (
              <div key={sk} className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] font-medium text-slate-300 block truncate">{sk}</span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODE: PROVE MY SKILLS (FLAGSHIP EVIDENCE INTAKE) */}
      {activeMode === 'prove_my_skills' && evidenceAnalysis && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Skill Evidence Classification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {evidenceAnalysis.headline} Claims from resumes and profiles are categorized as <span className="font-semibold text-slate-700 dark:text-slate-300">DETECTED</span> until validated through deterministic Code Lab assessments.
                </p>
              </div>

              <button
                onClick={() => handleAutoSelectChallenge()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-2 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Start Personalized Validation</span>
              </button>
            </div>

            {/* Evidence Classification Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Skill</th>
                    <th className="py-3 px-4">Sources / Provenance</th>
                    <th className="py-3 px-4">Observed Proficiency</th>
                    <th className="py-3 px-4">Evidence Strength</th>
                    <th className="py-3 px-4">Validation Priority</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {evidenceAnalysis.skills.map((item) => (
                    <tr key={item.skill} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.skill}</span>
                        {item.is_career_target && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Career Core
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.sources.join(' + ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {item.claimed_or_observed_score ? `${item.claimed_or_observed_score}%` : 'Unassessed'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.evidence_strength === 'STRONG'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : item.evidence_strength === 'MODERATE'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : item.evidence_strength === 'WEAK'
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.status_badge}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            item.validation_priority.includes('High')
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.validation_priority.includes('Medium')
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.validation_priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleAutoSelectChallenge(item.skill)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                        >
                          Validate Skill →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Evidence Hierarchy Callout */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white">Strict Evidence Hierarchy:</strong>
                <p className="mt-0.5">
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">SELF_DECLARED</span> →{' '}
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">DETECTED</span> →{' '}
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">ASSESSED</span> →{' '}
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">DEMONSTRATED</span> →{' '}
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">VERIFIED</span>.
                  Code Lab elevates assessed claims to demonstrated proofs. It never automatically verifies resume claims without concrete sandboxed test validation.
                </p>
              </div>
            </div>
          </div>

          {/* Mistake Intelligence Section */}
          {mistakePatterns.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mistake Intelligence & Anti-Pattern Diagnosis
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mistakePatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      pat.status === 'warning'
                        ? 'bg-amber-50/60 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                        : pat.status === 'success'
                        ? 'bg-emerald-50/60 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{pat.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10">
                        {pat.category}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{pat.description}</p>
                    <div className="pt-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                      Recommendation: {pat.recommended_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODE: INTERACTIVE LAB (EDITOR & REAL-TIME AST/TEST TELEMETRY) */}
      {activeMode === 'practice' && selectedChallenge && (
        <div className="space-y-4">
          {/* Submode Filter & Challenge Select Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
              {[
                { id: 'all', label: 'All Modes' },
                { id: 'standard_coding', label: 'Standard' },
                { id: 'debugging', label: 'Debugging' },
                { id: 'optimization', label: 'Optimization' },
                { id: 'code_review', label: 'Code Review' },
                { id: 'sql', label: 'SQL Lab' },
                { id: 'project', label: 'Project' },
                { id: 'interview', label: 'Interview' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setLabSubMode(pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    labSubMode === pill.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedChallenge.id}
                onChange={(e) => {
                  const found = challenges.find((c) => c.id === e.target.value);
                  if (found) handleSelectChallenge(found);
                }}
                className="flex-1 md:w-72 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                {filteredChallenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.challenge_type}] {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleAutoSelectChallenge()}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold transition border border-indigo-200 dark:border-indigo-800 shrink-0"
                title="Select next skill-gap challenge"
              >
                ⚡ Next Gap
              </button>
            </div>
          </div>

          {/* Challenge Description & Context Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                  {selectedChallenge.challenge_type}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono">
                  {selectedChallenge.difficulty}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Target: Time <strong className="font-mono">{selectedChallenge.expected_time_complexity || 'O(N)'}</strong>, Space <strong className="font-mono">{selectedChallenge.expected_space_complexity || 'O(N)'}</strong>
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Skills: {selectedChallenge.skills.join(', ')}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedChallenge.description}
            </p>
          </div>

          {/* Technical Interview Mode 60-Minute Live Timer & Protocol Banner */}
          {selectedChallenge.challenge_type === 'INTERVIEW' && (
            <div className="space-y-4">
              {isInterviewTimerRunning && (
                <ProctoringHUD
                  isActive={true}
                  attemptId={`interview_${selectedChallenge.id}`}
                  studentId="std_1"
                  strikeCount={proctoringStrikes}
                  onStrikeAdded={(c) => setProctoringStrikes(c)}
                  onDismissed={() => {
                    setIsProctorDismissed(true);
                    setIsInterviewTimerRunning(false);
                  }}
                />
              )}
              <div className={`p-4 rounded-2xl border transition-all ${
              interviewSecondsLeft < 300
                ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                : 'bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl font-mono text-base font-black flex items-center gap-2 ${
                    interviewSecondsLeft < 300
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}>
                    <Clock className="w-4.5 h-4.5" />
                    <span>{formatTimer(interviewSecondsLeft)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Live 60-Minute Technical Interview Simulation</span>
                      {interviewSecondsLeft < 300 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                          Final 5 Minutes
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Solve the algorithmic challenge, optimize Big-O complexity, and articulate tradeoffs in the reasoning panel below.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" />
                    AI Proctored
                  </span>
                  <button
                    onClick={handleToggleInterview}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isInterviewTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isInterviewTimerRunning ? '⏸ Pause Interview' : '▶ Start Proctored Interview'}
                  </button>
                  <button
                    onClick={() => {
                      setIsInterviewTimerRunning(false);
                      setInterviewSecondsLeft(3600);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* 5-Phase Interview Protocol Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400">
                <div className="p-1.5 rounded bg-white/60 dark:bg-slate-900/60">1. Problem Formulation</div>
                <div className="p-1.5 rounded bg-white/60 dark:bg-slate-900/60">2. Implementation</div>
                <div className="p-1.5 rounded bg-white/60 dark:bg-slate-900/60">3. Big-O Complexity</div>
                <div className="p-1.5 rounded bg-white/60 dark:bg-slate-900/60">4. Edge Case Hardening</div>
                <div className="p-1.5 rounded bg-white/60 dark:bg-slate-900/60">5. Scalability Tradeoffs</div>
              </div>
            </div>
          </div>
        )}

          {/* Editor & Telemetry 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns: Code Editor & Mode Enhancements */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#1e1e2e] text-slate-100 overflow-hidden shadow-xs">
                {/* Editor Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      {selectedChallenge.challenge_type === 'SQL' ? 'query.sql' : 'solution.py'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCode(selectedChallenge.starter_code || '');
                        if (selectedChallenge.challenge_type === 'SQL') {
                          setSqlQuery(selectedChallenge.starter_code || '');
                        }
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Sandboxed Execution
                    </span>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="p-4 font-mono text-xs leading-relaxed min-h-[380px]">
                  {selectedChallenge.challenge_type === 'SQL' ? (
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      rows={16}
                      className="w-full bg-transparent text-emerald-300 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                      spellCheck={false}
                      placeholder="-- Enter your SQL query..."
                    />
                  ) : (
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={16}
                      className="w-full bg-transparent text-emerald-300 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                      spellCheck={false}
                      placeholder="# Write your Python implementation..."
                    />
                  )}
                </div>

                {/* Interview Explanation Input Area */}
                {selectedChallenge.challenge_type === 'INTERVIEW' && (
                  <div className="p-3 bg-[#181825] border-t border-slate-700/60 text-xs space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Interview Reasoning & Tradeoff Explanation (Required for Proof):</span>
                    </label>
                    <textarea
                      value={interviewExplanation}
                      onChange={(e) => setInterviewExplanation(e.target.value)}
                      rows={3}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none font-sans"
                      placeholder="Explain your approach, time/space complexity tradeoffs, and edge cases handled..."
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {selectedChallenge.challenge_type === 'SQL'
                    ? 'Evaluated against SQLite relational database in isolated memory.'
                    : 'Evaluated against visible + hidden tests with AST Big-O inspection.'}
                </div>
                <button
                  onClick={handleSubmitCode}
                  disabled={isExecuting}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isExecuting ? (
                    <span>Evaluating in Sandbox...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Execute & Submit Proof</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Multi-Tab Telemetry Panel */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark overflow-hidden shadow-xs">
                {/* Telemetry Tabs */}
                <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs">
                  <button
                    onClick={() => setTelemetryTab('tests')}
                    className={`flex-1 py-2.5 font-bold text-center transition ${
                      telemetryTab === 'tests'
                        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-card-dark'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => setTelemetryTab('ast')}
                    className={`flex-1 py-2.5 font-bold text-center transition ${
                      telemetryTab === 'ast'
                        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-card-dark'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    AST Big-O
                  </button>
                  <button
                    onClick={() => setTelemetryTab('proof')}
                    className={`flex-1 py-2.5 font-bold text-center transition ${
                      telemetryTab === 'proof'
                        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-card-dark'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Proof Scores
                  </button>
                  {selectedChallenge.challenge_type === 'SQL' && (
                    <button
                      onClick={() => setTelemetryTab('sql')}
                      className={`flex-1 py-2.5 font-bold text-center transition ${
                        telemetryTab === 'sql'
                          ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-card-dark'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      SQL Table
                    </button>
                  )}
                  <button
                    onClick={() => setTelemetryTab('hints')}
                    className={`flex-1 py-2.5 font-bold text-center transition ${
                      telemetryTab === 'hints'
                        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-card-dark'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Hints
                  </button>
                </div>

                <div className="p-4 text-xs space-y-4 min-h-[380px]">
                  {/* TAB: TEST CASES */}
                  {telemetryTab === 'tests' && (
                    <div className="space-y-3">
                      {submissionResult ? (
                        <>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Evaluation Verdict
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                submissionResult.all_passed
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                              }`}
                            >
                              {submissionResult.all_passed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Visible</span>
                              <div className="font-mono font-bold text-slate-900 dark:text-white">
                                {submissionResult.visible_tests_passed}
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hidden</span>
                              <div className="font-mono font-bold text-slate-900 dark:text-white">
                                {submissionResult.hidden_tests_passed}
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Edge Cases</span>
                              <div className="font-mono font-bold text-slate-900 dark:text-white">
                                {submissionResult.edge_tests_passed}
                              </div>
                            </div>
                          </div>

                          {/* Individual Test Results */}
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {submissionResult.test_results?.map((t, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-[11px] ${
                                  t.passed
                                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                                    : 'bg-rose-50/60 border-rose-200/80 text-rose-900 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-300'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold mb-1">
                                  <span>
                                    Test #{idx + 1} ({t.category}): {t.passed ? 'Passed ✓' : 'Failed ✗'}
                                  </span>
                                  <span className="text-[10px] font-mono opacity-80">{t.description}</span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                                  Input: {t.input}
                                </div>
                                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                                  Expected: {t.expected} → Actual: {t.actual}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-slate-500 leading-relaxed">
                            Click <strong>'Execute & Submit Proof'</strong> to test your solution against visible, hidden, and boundary test suites.
                          </p>
                          <div className="space-y-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Visible Test Cases:</span>
                            {selectedChallenge.visible_tests?.map((vt, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                              >
                                <div className="text-slate-500 text-[10px]">Test Case #{i + 1}</div>
                                <div className="text-slate-800 dark:text-slate-200">Input: {vt.input}</div>
                                <div className="text-slate-600 dark:text-slate-400">Expected: {vt.expected}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: AST BIG-O COMPLEXITY */}
                  {telemetryTab === 'ast' && (
                    <div className="space-y-3">
                      {submissionResult?.ast_report ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Detected Time</span>
                              <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                                {submissionResult.ast_report.time_complexity}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Target: {selectedChallenge.expected_time_complexity || 'O(N)'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Detected Space</span>
                              <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                                {submissionResult.ast_report.space_complexity}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Target: {selectedChallenge.expected_space_complexity || 'O(N)'}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span>Rating:</span>
                              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                {submissionResult.ast_report.complexity_rating}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span>Loop Depth:</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {submissionResult.ast_report.loop_depth ?? 1}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span>Code Quality Score:</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {submissionResult.ast_report.code_quality_score}/100
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-500 leading-relaxed">
                          Submit your code to view the Abstract Syntax Tree (AST) static analysis, recursion detection, and Big-O efficiency rating.
                        </p>
                      )}
                    </div>
                  )}

                  {/* TAB: PROOF-OF-SKILL SCORES */}
                  {telemetryTab === 'proof' && (
                    <div className="space-y-3">
                      {submissionResult ? (
                        <>
                          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-300">Composite Score</span>
                              <span className="text-xl font-black font-mono text-emerald-400">
                                {submissionResult.composite_score}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full transition-all duration-500"
                                style={{ width: `${submissionResult.composite_score}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 text-[10px]">Correctness (40%)</span>
                              <div className="font-mono font-bold">{submissionResult.multi_dimensional_scores?.correctness}%</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 text-[10px]">Efficiency (20%)</span>
                              <div className="font-mono font-bold">{submissionResult.multi_dimensional_scores?.efficiency}%</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 text-[10px]">Code Quality (10%)</span>
                              <div className="font-mono font-bold">{submissionResult.multi_dimensional_scores?.code_quality}%</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 text-[10px]">Edge Cases (10%)</span>
                              <div className="font-mono font-bold">{submissionResult.multi_dimensional_scores?.edge_cases}%</div>
                            </div>
                          </div>

                          {/* Cryptographic SHA-256 Stamp */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 font-mono text-[10px] space-y-1">
                            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Cryptographic Proof Fingerprint</span>
                            </div>
                            <div className="text-slate-500 truncate">
                              SHA-256: {submissionResult.sha256_proof}
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Evidence Status: DEMONSTRATED in Skill Matrix
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-500 leading-relaxed">
                          Your code is evaluated against a 5-dimension rubric (Correctness, Problem Solving, Efficiency, Code Quality, and Edge Cases).
                        </p>
                      )}
                    </div>
                  )}

                  {/* TAB: SQL RESULT */}
                  {telemetryTab === 'sql' && (
                    <div className="space-y-3">
                      {sqlResult ? (
                        <>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Query Execution Result
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 font-bold">
                              {sqlResult.execution_time_ms} ms | {sqlResult.row_count} rows
                            </span>
                          </div>

                          {sqlResult.success ? (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                              <table className="w-full text-left font-mono text-[11px]">
                                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                                  <tr>
                                    {sqlResult.columns?.map((col: string) => (
                                      <th key={col} className="p-2 border-b border-slate-200 dark:border-slate-700">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {sqlResult.rows?.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                      {sqlResult.columns?.map((col: string) => (
                                        <td key={col} className="p-2">
                                          {row[col]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-mono">
                              {sqlResult.error}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-slate-500 leading-relaxed">
                            Schema includes: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">departments(id, name)</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">students(id, name, department_id, verified_score)</code>.
                          </p>
                          <p className="text-slate-500">
                            Execute your query to inspect the output rows returned from the isolated SQLite relational sandbox.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: HINTS */}
                  {telemetryTab === 'hints' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Pedagogical Guidance:</h4>
                      {selectedChallenge.hints && selectedChallenge.hints.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                          {selectedChallenge.hints.map((h, i) => (
                            <li key={i} className="leading-relaxed">
                              {h}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">No hints configured for this baseline calibration challenge.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODE: CODING MISSIONS */}
      {activeMode === 'missions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Step Career Coding Missions
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Completing end-to-end multi-step missions produces higher-confidence evidence for recruiters than isolated coding problems.
              </p>
            </div>

            <div className="space-y-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{mission.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono">
                          {mission.track}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {mission.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {mission.progress_pct}% Complete
                      </div>
                      <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-indigo-600 h-full transition-all"
                          style={{ width: `${mission.progress_pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mission Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {mission.steps.map((st) => (
                      <div
                        key={st.step_number}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          st.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-bold text-[10px] text-slate-500 mb-1">
                            <span>Step {st.step_number}</span>
                            {st.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <div className="font-semibold text-xs leading-snug">{st.title}</div>
                        </div>

                        <button
                          onClick={() => {
                            const found = challenges.find((c) => c.id === st.challenge_id);
                            if (found) {
                              handleSelectChallenge(found);
                              setActiveMode('practice');
                            }
                          }}
                          className="mt-3 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[10px] font-bold transition text-center"
                        >
                          {st.completed ? 'Review Step' : 'Attempt Step →'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODE: SKILL TESTING MATRIX */}
      {activeMode === 'matrix' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unified Skill Testing Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-checks Resume Claims, Aptitude Assessments, Code Lab Evidence, Verified Projects, and GitHub Locs.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Audited Provenance
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Skill</th>
                    <th className="py-3 px-4">Resume Claim</th>
                    <th className="py-3 px-4">Aptitude Score</th>
                    <th className="py-3 px-4">Code Lab Score</th>
                    <th className="py-3 px-4">Project Evidence</th>
                    <th className="py-3 px-4">GitHub Repository</th>
                    <th className="py-3 px-4 text-right">Evidence Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {skillMatrix.map((row) => (
                    <tr key={row.skill} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{row.skill}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.resume_claim}</td>
                      <td className="py-3 px-4 font-mono">
                        {row.aptitude_score ? `${row.aptitude_score}%` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {row.code_lab_score ? `${row.code_lab_score}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.project_evidence}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.github_evidence}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.evidence_strength === 'STRONG'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                              : row.evidence_strength === 'MODERATE'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
                              : row.evidence_strength === 'WEAK'
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {row.evidence_strength}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODE: DEVPROOF STUDIO & QR CREDENTIAL VALIDATOR */}
      {activeMode === 'debugging' && (
        <div className="space-y-6">
          {/* GitHub Repo Auditor */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-slate-900 dark:text-white" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    DevProof Studio — GitHub Repository Code Auditor
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Verifies commit frequency cadence, cyclomatic complexity index, and anti-plagiarism originality.
                </p>
              </div>

              <button
                onClick={handleAuditRepo}
                disabled={isAuditingRepo}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isAuditingRepo ? 'Auditing Repo...' : 'Audit GitHub Repo →'}
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                placeholder="https://github.com/username/project"
              />
            </div>

            {repoAuditResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">Authenticity Index</span>
                  <span className="text-xl font-black text-emerald-800 dark:text-emerald-200">{repoAuditResult.authenticity_score}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold block">Scale</span>
                  <span className="text-xl font-black text-indigo-800 dark:text-indigo-200">{repoAuditResult.total_loc} LOC</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold block">Plagiarism / Boilerplate</span>
                  <span className="text-xl font-black text-purple-800 dark:text-purple-200">{repoAuditResult.plagiarism_index}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Test Coverage</span>
                  <span className="text-xl font-black text-amber-800 dark:text-amber-200">{repoAuditResult.test_coverage}</span>
                </div>
              </div>
            )}
          </div>

          {/* QR Credential Validator */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cryptographic Credential Validator
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Anti-Forgery
              </span>
            </div>

            <textarea
              value={qrPayload}
              onChange={(e) => setQrPayload(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
            />

            <button
              onClick={handleVerifyQR}
              disabled={isVerifyingQR}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition disabled:opacity-50"
            >
              {isVerifyingQR ? 'Validating Hash...' : 'Verify Certificate Cryptographic Hash'}
            </button>

            {qrResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Credential Validated: {qrResult.issuer} ({qrResult.skill})</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-1 truncate">
                  Hash: {qrResult.sha256_hash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proctoring Rules & Sensor Pre-Check Modal for Live Interview */}
      <ProctoringRulesModal
        isOpen={showProctoringRulesModal}
        onClose={() => setShowProctoringRulesModal(false)}
        onConfirm={() => {
          setShowProctoringRulesModal(false);
          setIsInterviewTimerRunning(true);
        }}
        title="Technical Interview: AI Proctoring & Rules Pre-Check"
      />
    </div>
  );
};
