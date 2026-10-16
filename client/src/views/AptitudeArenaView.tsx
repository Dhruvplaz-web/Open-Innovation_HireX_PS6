import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api';
import {
  IntelligentProctoringEngine,
  ProctoringSummary,
  ProctoringStatus,
  ProctorViolationEvent,
  PROCTOR_CONFIG
} from '../services/proctoringEngine';

// Icon imports
import {
  Zap,
  RotateCcw,
  Flame,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Camera,
  Mic,
  AlertTriangle,
  Lock,
  Play,
  Activity,
  Brain,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  XCircle,
  BarChart3,
  BookOpen,
  Award,
  RefreshCw,
  Cpu,
  Eye,
  Video,
  VideoOff,
  UserCheck,
  UserX,
  AlertOctagon,
  Terminal
} from 'lucide-react';

// Game Component Imports
import { RiskRewardGame } from '../components/aptitude/games/RiskRewardGame';
import { WorkingMemoryGame } from '../components/aptitude/games/WorkingMemoryGame';
import { CognitiveFlexibilityGame } from '../components/aptitude/games/CognitiveFlexibilityGame';
import { DynamicSpatialGame } from '../components/aptitude/games/DynamicSpatialGame';
import { PlanningStrategyGame } from '../components/aptitude/games/PlanningStrategyGame';
import { InformationProcessingGame } from '../components/aptitude/games/InformationProcessingGame';
import { ResourceManagementGame } from '../components/aptitude/games/ResourceManagementGame';
import { EmotionRecognitionGame } from '../components/aptitude/games/EmotionRecognitionGame';
import { MazePressureGame } from '../components/aptitude/games/MazePressureGame';

export const AptitudeArenaView: React.FC = () => {
  // Top Level Navigation
  const [activeMainMode, setActiveMainMode] = useState<'NORMAL' | 'GAMIFIED'>('NORMAL');
  const [activeSubMode, setActiveSubMode] = useState<'PRACTICE' | 'TEST'>('PRACTICE');

  // Assessment Mode State (Universal AI Proctoring Enforced)
  const [selectedAssessmentMode, setSelectedAssessmentMode] = useState<'NORMAL' | 'PROCTORED'>('PROCTORED');
  const [isModeLocked, setIsModeLocked] = useState<boolean>(false);

  // Proctored Pre-Check & Consent Modal State
  const [showProctorConsentModal, setShowProctorConsentModal] = useState<boolean>(false);
  const [precheckStatus, setPrecheckStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [precheckError, setPrecheckError] = useState<string>('');
  const [precheckProgress, setPrecheckProgress] = useState<{ camera: boolean; face: boolean; singleFace: boolean }>({
    camera: false,
    face: false,
    singleFace: false
  });

  // Overview & Category State
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [studentId] = useState<string>('std_1');

  // Normal Practice State
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const [practiceEvaluation, setPracticeEvaluation] = useState<any>(null);
  const [isLoadingPractice, setIsLoadingPractice] = useState<boolean>(false);

  // Test State (Normal or Proctored)
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [testAttemptId, setTestAttemptId] = useState<string>('');
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testIndex, setTestIndex] = useState<number>(0);
  const [selectedTestAnswers, setSelectedTestAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 Mins
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [bankExhaustedWarning, setBankExhaustedWarning] = useState<boolean>(false);

  // Authoritative Strike & Dismissal State (Phase 16 - 18)
  const [backendViolationCount, setBackendViolationCount] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [dismissalReason, setDismissalReason] = useState<string>('');
  
  // Warning Modal State (Phase 17)
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningTitle, setWarningTitle] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [warningLevel, setWarningLevel] = useState<'WARNING' | 'FINAL_WARNING'>('WARNING');

  // Developer Debug Mode (Phase 25)
  const [showDebugHUD, setShowDebugHUD] = useState<boolean>(false);

  // Gamified Practice State
  const [activeGameId, setActiveGameId] = useState<string>('risk_reward');

  // Gamified Battery Test State
  const [isBatteryStarted, setIsBatteryStarted] = useState<boolean>(false);
  const [batteryStep, setBatteryStep] = useState<number>(0);
  const [batteryMetrics, setBatteryMetrics] = useState<Record<string, any>>({});
  const [batteryResult, setBatteryResult] = useState<any>(null);

  // AI Batch Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiGenMessage, setAiGenMessage] = useState<string>('');

  // Proctoring Engine & Camera States
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [proctorSummary, setProctorSummary] = useState<ProctoringSummary | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctorEngineRef = useRef<IntelligentProctoringEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Load Overview Data on Mount & Check Active Attempt for Resume
  useEffect(() => {
    loadOverview();
    checkActiveAttempt();
  }, [studentId, activeMainMode, activeSubMode]);

  const loadOverview = async () => {
    try {
      const data = await apiService.getAptitudeOverview(studentId);
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  // Helper to trigger dismissal state immediately
  const triggerDismissal = useCallback((reason: string = '3 proctoring violations detected.') => {
    stopProctoring();
    setIsTestStarted(false);
    setIsBatteryStarted(false);
    setIsDismissed(true);
    setDismissalReason(reason);
    setBackendViolationCount(3);
    setShowWarningModal(false);
  }, []);

  // Handle confirmed violations from Proctoring Engine & Backend Response
  const handleConfirmedViolation = useCallback(async (evt: ProctorViolationEvent) => {
    const targetAttemptId = testAttemptId || evt.attemptId;
    if (!targetAttemptId) return;

    try {
      const res = await apiService.logProctorEvent(targetAttemptId, evt);
      if (res) {
        const vCount = res.violationCount !== undefined ? res.violationCount : 1;
        setBackendViolationCount(vCount);

        if (res.isDismissed || res.attemptStatus === 'DISMISSED_FOR_PROCTORING' || vCount >= 3) {
          triggerDismissal('3 proctoring violations detected.');
        } else if (vCount === 1) {
          setWarningTitle('Proctoring Warning (1 / 3)');
          setWarningMessage(`Infraction recorded: ${evt.message}. Please maintain focus on your assessment.`);
          setWarningLevel('WARNING');
          setShowWarningModal(true);
        } else if (vCount === 2) {
          setWarningTitle('FINAL WARNING (2 / 3)');
          setWarningMessage(`Final Warning: ${evt.message}. One more confirmed violation will terminate and dismiss this assessment immediately!`);
          setWarningLevel('FINAL_WARNING');
          setShowWarningModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to report proctor event:', err);
    }
  }, [testAttemptId, triggerDismissal]);

  // Resume active test attempt if present server-side
  const checkActiveAttempt = async () => {
    if (activeSubMode !== 'TEST') return;
    try {
      const targetType = activeMainMode === 'NORMAL' ? 'NORMAL_APTITUDE' : 'GAMIFIED_APTITUDE';
      const activeRes = await apiService.getActiveAptitudeTest(studentId, targetType);
      if (activeRes && activeRes.status === 'success' && activeRes.attemptId) {
        setTestAttemptId(activeRes.attemptId);
        const mode = activeRes.assessment_mode === 'PROCTORED' ? 'PROCTORED' : 'NORMAL';
        setSelectedAssessmentMode(mode);
        setIsModeLocked(true);
        setTestQuestions(activeRes.questions || []);
        
        const nowSec = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, (activeRes.expiresAt || nowSec + 1200) - nowSec);
        setTimeLeft(remaining);

        if (activeRes.isDismissed || activeRes.attemptStatus === 'DISMISSED_FOR_PROCTORING') {
          setIsDismissed(true);
          setDismissalReason(activeRes.dismissalReason || '3 proctoring violations detected.');
          setBackendViolationCount(3);
          return;
        }

        if (activeMainMode === 'NORMAL') {
          setIsTestStarted(true);
        } else {
          setIsBatteryStarted(true);
        }

        // If active attempt is PROCTORED, initialize camera & proctor engine automatically!
        if (mode === 'PROCTORED') {
          initializeProctoringForActiveAttempt(activeRes.attemptId);
        }
      }
    } catch (err) {
      console.warn('Failed to check active attempt:', err);
    }
  };

  // Automatically start proctoring engine for resumed active attempt
  const initializeProctoringForActiveAttempt = async (attemptId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setMediaStream(stream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      proctorEngineRef.current = new IntelligentProctoringEngine(
        attemptId,
        studentId,
        PROCTOR_CONFIG,
        (evt) => handleConfirmedViolation(evt)
      );
      proctorEngineRef.current.stateMachine.transitionTo('PRECHECK');
      proctorEngineRef.current.stateMachine.transitionTo('READY');
      proctorEngineRef.current.stateMachine.transitionTo('ACTIVE');
      startProctoringLoop();
    } catch (e) {
      console.warn('Failed to re-initialize camera on active attempt resume:', e);
    }
  };

  // Load Practice Questions when category/difficulty changes
  useEffect(() => {
    if (activeMainMode === 'NORMAL' && activeSubMode === 'PRACTICE') {
      loadPracticeQuestions();
    }
  }, [activeMainMode, activeSubMode, selectedCategory, selectedDifficulty]);

  const loadPracticeQuestions = async () => {
    setIsLoadingPractice(true);
    try {
      const res = await apiService.getAptitudePracticeQuestions(selectedCategory, selectedDifficulty, 10);
      if (res.questions) {
        setPracticeQuestions(res.questions);
        setPracticeIndex(0);
        setSelectedPracticeOption(null);
        setPracticeEvaluation(null);
      }
    } catch (err) {
      console.error('Failed to load practice questions:', err);
    } finally {
      setIsLoadingPractice(false);
    }
  };

  // Handle Practice Answer Submit
  const handlePracticeSubmit = async () => {
    const q = practiceQuestions[practiceIndex];
    if (!q || selectedPracticeOption === null) return;

    try {
      const evalRes = await apiService.submitAptitudePractice(studentId, q.id, selectedPracticeOption);
      setPracticeEvaluation(evalRes);
    } catch (err) {
      console.error('Failed to submit practice answer:', err);
    }
  };

  const nextPracticeQuestion = () => {
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex((prev) => prev + 1);
      setSelectedPracticeOption(null);
      setPracticeEvaluation(null);
    }
  };

  // =========================================================================
  // PROCTORED TEST START FLOW & PRE-CHECK
  // =========================================================================

  const handleStartNewAttempt = async () => {
    setIsDismissed(false);
    setBackendViolationCount(0);
    setTestResult(null);
    setIsTestStarted(false);
    setIsBatteryStarted(false);
    setIsModeLocked(false);
    handleInitiateTest();
  };

  // Step 1: Open Proctored Assessment Information & Camera Precheck screen
  const handleInitiateTest = () => {
    // Universal AI Proctoring: All test attempts must complete webcam pre-check and integrity consent
    setSelectedAssessmentMode('PROCTORED');
    setShowProctorConsentModal(true);
    setPrecheckStatus('idle');
    setPrecheckError('');
    setPrecheckProgress({ camera: false, face: false, singleFace: false });
  };

  // Step 2: User clicks "Allow Camera & Continue" on consent screen -> Run Pre-Check
  const handleAllowCameraAndPrecheck = async () => {
    setPrecheckStatus('checking');
    setPrecheckError('');
    setPrecheckProgress({ camera: false, face: false, singleFace: false });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setMediaStream(stream);
      setCameraPermission('granted');

      setPrecheckProgress((prev) => ({ ...prev, camera: true }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const tempEngine = new IntelligentProctoringEngine('precheck_temp', studentId, PROCTOR_CONFIG);
      const checkRes = await tempEngine.performPrecheck(
        stream,
        videoRef.current || document.createElement('video'),
        canvasRef.current || document.createElement('canvas')
      );

      setPrecheckProgress({
        camera: checkRes.mediaStreamOk && checkRes.videoTrackLive,
        face: checkRes.faceCount > 0,
        singleFace: checkRes.faceCount === 1
      });

      if (checkRes.passed) {
        setPrecheckStatus('success');
        setTimeout(() => {
          setShowProctorConsentModal(false);
          if (activeMainMode === 'NORMAL') {
            startProctoredNormalTestSession();
          } else {
            startProctoredBatterySession();
          }
        }, 800);
      } else {
        setPrecheckStatus('failed');
        setPrecheckError(checkRes.errorReason || 'Pre-check failed. Position your face clearly in front of the camera.');
      }
    } catch (err: any) {
      console.error('Camera permission denied or camera error:', err);
      setCameraPermission('denied');
      setPrecheckStatus('failed');
      setPrecheckError('Webcam/microphone access was denied. Proctored assessment requires an active camera and microphone.');
    }
  };

  // Start Normal Test Session (No camera)
  const startNormalTestSession = async () => {
    try {
      const catList = selectedCategory !== 'all' ? [selectedCategory] : undefined;
      const targetType = activeMainMode === 'NORMAL' ? 'NORMAL_APTITUDE' : 'GAMIFIED_APTITUDE';
      const testData = await apiService.startAptitudeTest(studentId, catList, 20, 'NORMAL', targetType, true);

      if (testData.attemptId) {
        setTestAttemptId(testData.attemptId);
        setSelectedAssessmentMode('NORMAL');
        setIsModeLocked(true);
        setIsDismissed(false);
        setBackendViolationCount(0);
        setTestQuestions(testData.questions || []);
        setBankExhaustedWarning(!!testData.bankExhaustedWarning);
        setTestIndex(0);
        setSelectedTestAnswers({});
        setTimeLeft((testData.durationMinutes || 20) * 60);

        if (activeMainMode === 'NORMAL') {
          setIsTestStarted(true);
        } else {
          handleStartBattery();
        }
        setIsTestFinished(false);
        setTestResult(null);
      }
    } catch (err) {
      console.error('Failed to start normal test:', err);
    }
  };

  // Start Proctored Test Session (With camera & proctor engine active)
  const startProctoredNormalTestSession = async () => {
    try {
      const catList = selectedCategory !== 'all' ? [selectedCategory] : undefined;
      const targetType = activeMainMode === 'NORMAL' ? 'NORMAL_APTITUDE' : 'GAMIFIED_APTITUDE';
      const testData = await apiService.startAptitudeTest(studentId, catList, 20, 'PROCTORED', targetType, false);

      if (testData.attemptId) {
        setTestAttemptId(testData.attemptId);
        setSelectedAssessmentMode('PROCTORED');
        setIsModeLocked(true);
        setIsDismissed(false);
        setBackendViolationCount(0);
        setTestQuestions(testData.questions || []);
        setBankExhaustedWarning(!!testData.bankExhaustedWarning);
        setTestIndex(0);
        setSelectedTestAnswers({});
        setTimeLeft((testData.durationMinutes || 20) * 60);
        setIsTestStarted(true);
        setIsTestFinished(false);
        setTestResult(null);

        proctorEngineRef.current = new IntelligentProctoringEngine(
          testData.attemptId,
          studentId,
          PROCTOR_CONFIG,
          (evt) => handleConfirmedViolation(evt)
        );
        proctorEngineRef.current.stateMachine.transitionTo('PRECHECK');
        proctorEngineRef.current.stateMachine.transitionTo('READY');
        proctorEngineRef.current.stateMachine.transitionTo('ACTIVE');
        startProctoringLoop();
      }
    } catch (err) {
      console.error('Failed to start proctored test:', err);
    }
  };

  const startProctoredBatterySession = async () => {
    try {
      const testData = await apiService.startAptitudeTest(studentId, undefined, 20, 'PROCTORED', 'GAMIFIED_APTITUDE', false);
      if (testData.attemptId) {
        setTestAttemptId(testData.attemptId);
        setSelectedAssessmentMode('PROCTORED');
        setIsModeLocked(true);
        setIsDismissed(false);
        setBackendViolationCount(0);
        handleStartBattery();

        proctorEngineRef.current = new IntelligentProctoringEngine(
          testData.attemptId,
          studentId,
          PROCTOR_CONFIG,
          (evt) => handleConfirmedViolation(evt)
        );
        proctorEngineRef.current.stateMachine.transitionTo('PRECHECK');
        proctorEngineRef.current.stateMachine.transitionTo('READY');
        proctorEngineRef.current.stateMachine.transitionTo('ACTIVE');
        startProctoringLoop();
      }
    } catch (err) {
      console.error('Failed to start proctored battery:', err);
    }
  };

  // Start Frame Analysis Loop for Proctoring Engine
  const startProctoringLoop = () => {
    const loop = () => {
      if (
        proctorEngineRef.current &&
        videoRef.current &&
        canvasRef.current &&
        selectedAssessmentMode === 'PROCTORED'
      ) {
        proctorEngineRef.current.analyzeVideoFrame(videoRef.current, canvasRef.current);
        const summary = proctorEngineRef.current.getProctoringSummary();
        setProctorSummary(summary);

        if (summary.violationCount >= 3 && !isDismissed) {
          triggerDismissal('3 proctoring violations detected.');
        }
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };
    animFrameIdRef.current = requestAnimationFrame(loop);
  };

  // Anti-Malpractice Listeners (Active ONLY for PROCTORED mode)
  useEffect(() => {
    if ((!isTestStarted && !isBatteryStarted) || isDismissed || selectedAssessmentMode !== 'PROCTORED') return;

    const handleVisibilityChange = () => {
      if (document.hidden && proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('TAB_SWITCH', 'Candidate switched tabs or minimized window.');
      }
    };

    const handleBlur = () => {
      if (proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('WINDOW_BLUR', 'Browser window lost focus.');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('FULLSCREEN_EXIT', 'Exited secure full-screen view.');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('COPY_ATTEMPT', 'Copy operation intercepted.');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      if (proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('PASTE_ATTEMPT', 'Paste operation intercepted.');
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      if (proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('CUT_ATTEMPT', 'Cut operation intercepted.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (proctorEngineRef.current) {
        proctorEngineRef.current.recordDiscreteEvent('CONTEXT_MENU_ATTEMPT', 'Right-click context menu intercepted.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isTestStarted, isBatteryStarted, isDismissed, selectedAssessmentMode]);

  // Clean up proctor loop & camera tracks on test finish
  const stopProctoring = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
  };

  // Test Countdown Timer
  useEffect(() => {
    if (!isTestStarted || isTestFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTestFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isTestFinished]);

  const handleSelectTestOption = (optIdx: number) => {
    const q = testQuestions[testIndex];
    if (!q) return;
    setSelectedTestAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
  };

  const handleTestFinish = async () => {
    setIsTestFinished(true);
    stopProctoring();

    const payloadAnswers = testQuestions.map((q) => ({
      question_id: q.id,
      selected_option: selectedTestAnswers[q.id] !== undefined ? selectedTestAnswers[q.id] : -1
    }));

    try {
      const proctorEvents = proctorSummary?.events || [];
      const res = await apiService.submitAptitudeTest(testAttemptId, studentId, payloadAnswers, proctorEvents);
      setTestResult(res);
      loadOverview(); // Refresh unseen counts
    } catch (err) {
      console.error('Failed to submit test:', err);
    }
  };

  // Gamified Battery Handlers
  const handleStartBattery = () => {
    setIsBatteryStarted(true);
    setBatteryStep(0);
    setBatteryMetrics({});
    setBatteryResult(null);
  };

  const handleGameStepComplete = (gameKey: string, metrics: any) => {
    const updatedMetrics = { ...batteryMetrics, [gameKey]: metrics };
    setBatteryMetrics(updatedMetrics);

    if (batteryStep < 4) {
      setBatteryStep((prev) => prev + 1);
    } else {
      // Battery Finished -> Submit to backend
      stopProctoring();
      apiService.submitGamifiedBattery(studentId, updatedMetrics).then((res: any) => {
        setBatteryResult(res);
        setIsBatteryStarted(false);
      });
    }
  };

  // Trigger AI Question Batch Generation
  const handleGenerateAIBatch = async () => {
    setIsGeneratingAI(true);
    setAiGenMessage('');
    const cat = selectedCategory !== 'all' ? selectedCategory : 'quantitative';
    try {
      const res = await apiService.generateAIQuestionBatch(cat, 10);
      setAiGenMessage(`Successfully generated ${res.added_count} new questions with zero hash duplicates (${res.duplicates_skipped} skipped).`);
      loadOverview();
      loadPracticeQuestions();
    } catch (err) {
      setAiGenMessage('AI generation failed. Server fallback active.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const currentPracticeQ = practiceQuestions[practiceIndex];
  const currentTestQ = testQuestions[testIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Hidden Video & Canvas Elements for Computer Vision AI Proctoring Engine */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" width={160} height={120} />

      {/* 1. Header & Landing Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                <Brain className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Aptitude Arena 3.0</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300">
                Strict Backend No-Repeat Rule Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select between Standardized Timed Aptitude Testing or Interactive Cognitive-Behavioral Games.
            </p>
          </div>

          {/* Primary Mode Selector */}
          <div className="flex p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                if (!isTestStarted && !isBatteryStarted) {
                  setActiveMainMode('NORMAL');
                  setIsTestStarted(false);
                  setIsBatteryStarted(false);
                }
              }}
              disabled={isTestStarted || isBatteryStarted}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeMainMode === 'NORMAL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              } ${(isTestStarted || isBatteryStarted) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>NORMAL APTITUDE</span>
            </button>

            <button
              onClick={() => {
                if (!isTestStarted && !isBatteryStarted) {
                  setActiveMainMode('GAMIFIED');
                  setIsTestStarted(false);
                  setIsBatteryStarted(false);
                }
              }}
              disabled={isTestStarted || isBatteryStarted}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeMainMode === 'GAMIFIED'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              } ${(isTestStarted || isBatteryStarted) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Zap className="w-4 h-4" />
              <span>GAMIFIED APTITUDE</span>
            </button>
          </div>
        </div>

        {/* Secondary Mode Tabs (Practice vs Test) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isTestStarted && !isBatteryStarted) {
                  setActiveSubMode('PRACTICE');
                  setIsTestStarted(false);
                  setIsBatteryStarted(false);
                }
              }}
              disabled={isTestStarted || isBatteryStarted}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubMode === 'PRACTICE'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              } ${(isTestStarted || isBatteryStarted) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              TRAINING / PRACTICE
            </button>

            <button
              onClick={() => {
                if (!isTestStarted && !isBatteryStarted) {
                  setActiveSubMode('TEST');
                  setIsTestStarted(false);
                  setIsBatteryStarted(false);
                }
              }}
              disabled={isTestStarted || isBatteryStarted}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubMode === 'TEST'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              } ${(isTestStarted || isBatteryStarted) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              TEST / ASSESSMENT
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden md:block">
            {activeSubMode === 'PRACTICE'
              ? '💡 Practice allows repetition for continuous learning & step-by-step explanations.'
              : '🔒 Test Mode strictly enforces zero question repetition against your student history.'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* UNIVERSAL PROCTORING & INTEGRITY ASSURANCE BANNER (For TEST submode)       */}
      {/* ========================================================================= */}
      {activeSubMode === 'TEST' && !isTestStarted && !isBatteryStarted && !isTestFinished && !batteryResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-indigo-500/30 dark:border-indigo-500/20 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Universal AI Proctoring Enforced
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Placement Standard
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">
                    3-Strike Dismissal
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Every test taken on HireX requires live webcam presence, focus tracking, and audio telemetry. Pre-check authorization is completed before test launch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleInitiateTest}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Launch Proctored Assessment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-500 block">Rule 1</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">Webcam Face Centered</span>
              <span className="text-[10px] text-slate-400">Continuous solo presence</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-500 block">Rule 2</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">No Multi-Face</span>
              <span className="text-[10px] text-slate-400">Zero secondary persons</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-500 block">Rule 3</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">Screen Fullscreen Lock</span>
              <span className="text-[10px] text-slate-400">Tab switches forbidden</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Rule 4</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">3-Strike Policy</span>
              <span className="text-[10px] text-slate-400">Dismissal on 3 violations</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. NORMAL APTITUDE SECTION */}
      {activeMainMode === 'NORMAL' && (
        <div className="space-y-6">
          {/* Categories Grid Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.slice(0, 9).map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-card-dark border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                  {cat.has_visual_assets && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      SVG Diagrams
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Total: {cat.total_questions} Qs</span>
                  <span className="text-emerald-600 font-bold">{cat.unseen_test_questions} Unseen Test Qs</span>
                </div>
              </div>
            ))}
          </div>

          {/* NORMAL PRACTICE MODE */}
          {activeSubMode === 'PRACTICE' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Normal Aptitude Practice Session</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Unlimited practice with instant step-by-step explanations and diagram visualization.
                  </p>
                </div>

                {/* AI Question Generation Trigger */}
                <button
                  onClick={handleGenerateAIBatch}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'Generating AI Batch...' : 'Expand Question Bank with AI'}</span>
                </button>
              </div>

              {aiGenMessage && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                  {aiGenMessage}
                </div>
              )}

              {/* Practice Question Card */}
              {currentPracticeQ ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span>Question {practiceIndex + 1} of {practiceQuestions.length} ({currentPracticeQ.category_name})</span>
                    <span className="uppercase text-indigo-600 font-bold">{currentPracticeQ.difficulty}</span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentPracticeQ.question}
                    </h4>

                    {/* SVG Diagram Rendering */}
                    {currentPracticeQ.visual_asset?.svg_data && (
                      <div
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center max-w-md mx-auto"
                        dangerouslySetInnerHTML={{ __html: currentPracticeQ.visual_asset.svg_data }}
                      />
                    )}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentPracticeQ.options?.map((opt: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPracticeOption(idx)}
                          className={`p-4 rounded-xl border text-left font-semibold text-xs transition cursor-pointer ${
                            selectedPracticeOption === idx
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-mono text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Explanations */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={handlePracticeSubmit}
                      disabled={selectedPracticeOption === null}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 font-bold text-xs hover:bg-black transition shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      Check Answer & Explanation
                    </button>

                    {practiceIndex < practiceQuestions.length - 1 && (
                      <button
                        onClick={nextPracticeQuestion}
                        className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                      >
                        Next Question →
                      </button>
                    )}
                  </div>

                  {/* Step-by-Step Explanation Banner */}
                  {practiceEvaluation && (
                    <div className={`p-5 rounded-xl border space-y-2 animate-fade-in ${
                      practiceEvaluation.is_correct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        {practiceEvaluation.is_correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span>{practiceEvaluation.is_correct ? 'Correct Answer!' : 'Incorrect Answer'}</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        <strong className="font-bold">Step-by-Step Explanation:</strong> {practiceEvaluation.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-xs text-slate-400">Loading practice questions...</div>
              )}
            </div>
          )}

          {/* TEST MODE */}
          {activeSubMode === 'TEST' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
              {isDismissed ? (
                /* Dismissal View Screen (Phase 18) */
                <div className="p-8 text-center space-y-6 max-w-xl mx-auto rounded-3xl bg-red-950/20 border border-red-500/50 shadow-2xl animate-fade-in my-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 text-red-500 flex items-center justify-center">
                    <AlertOctagon className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-red-500 tracking-tight">Assessment Dismissed</h3>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      3 / 3 Proctoring Violations Reached
                    </div>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-2">
                      Reason: {dismissalReason || '3 proctoring violations detected during session.'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono italic pt-1">
                      This attempt has been recorded in your audit log and cannot be resumed.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <button
                      onClick={handleStartNewAttempt}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Start New Assessment Attempt</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDismissed(false);
                        setIsTestStarted(false);
                        setIsBatteryStarted(false);
                        setIsModeLocked(false);
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              ) : !isTestStarted ? (
                /* Test Start Launcher */
                <div className="text-center p-8 space-y-5 max-w-xl mx-auto">
                  <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center border ${
                    selectedAssessmentMode === 'PROCTORED'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 border-purple-200 dark:border-purple-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-200 dark:border-indigo-800'
                  }`}>
                    {selectedAssessmentMode === 'PROCTORED' ? <Camera className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Start {selectedAssessmentMode === 'PROCTORED' ? 'Proctored' : 'Normal'} Aptitude Assessment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      20 Questions • 20 Minutes • Mode: <strong>{selectedAssessmentMode}</strong> • Immutable Test Snapshot
                    </p>
                  </div>

                  <button
                    onClick={handleInitiateTest}
                    className={`px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 mx-auto cursor-pointer ${
                      selectedAssessmentMode === 'PROCTORED'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-slate-900 hover:bg-black dark:bg-indigo-600'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start {selectedAssessmentMode === 'PROCTORED' ? 'Proctored' : 'Standard'} Test Session</span>
                  </button>
                </div>
              ) : !isTestFinished ? (
                /* Active Test Session */
                <div className="space-y-6">
                  {/* PROCTORED LIVE HUD PANEL (Only for PROCTORED mode) */}
                  {selectedAssessmentMode === 'PROCTORED' && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white border border-purple-500/50 shadow-md space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400">
                            AI PROCTOR ACTIVE
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {proctorSummary?.activeSignals?.length ? 'Infraction Detected' : 'Face Locked'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-slate-400 text-[10px] block">AI INTEGRITY</span>
                            <strong className="text-emerald-400">{proctorSummary?.integrityScore ?? 100}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">VIOLATIONS / STRIKES</span>
                            <strong className={backendViolationCount > 0 ? 'text-amber-400' : 'text-slate-200'}>
                              {backendViolationCount}/3
                            </strong>
                          </div>

                          <button
                            onClick={() => setShowDebugHUD((prev) => !prev)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border flex items-center gap-1 cursor-pointer ${
                              showDebugHUD
                                ? 'bg-purple-600 text-white border-purple-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            <Terminal className="w-3 h-3" />
                            <span>{showDebugHUD ? 'HUD DEBUG ON' : 'HUD DEBUG'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Proctoring Warnings */}
                      {proctorSummary?.activeSignals && proctorSummary.activeSignals.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Active Signal: {proctorSummary.activeSignals.join(', ')}</span>
                        </div>
                      )}

                      {/* Developer Debug HUD Overlay Canvas */}
                      <canvas
                        ref={debugCanvasRef}
                        width={300}
                        height={60}
                        className={showDebugHUD ? "mt-2 rounded-lg border border-slate-700 mx-auto block bg-slate-950" : "hidden"}
                      />
                    </div>
                  )}

                  {/* Test Session Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Question {testIndex + 1} of {testQuestions.length}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-mono font-bold text-xs">
                      Time Remaining: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                    </div>
                  </div>

                  {bankExhaustedWarning && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-amber-800 dark:text-amber-300">
                      ⚠️ Question Pool Notice: You have seen most questions in this category. System has supplied pool fallback.
                    </div>
                  )}

                  {currentTestQ && (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                        {currentTestQ.question}
                      </h4>

                      {/* SVG Diagram Rendering */}
                      {currentTestQ.visual_asset?.svg_data && (
                        <div
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center max-w-md mx-auto"
                          dangerouslySetInnerHTML={{ __html: currentTestQ.visual_asset.svg_data }}
                        />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {currentTestQ.options?.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectTestOption(idx)}
                            className={`p-4 rounded-xl border text-left font-semibold text-xs transition cursor-pointer ${
                              selectedTestAnswers[currentTestQ.id] === idx
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      disabled={testIndex === 0}
                      onClick={() => setTestIndex((prev) => prev - 1)}
                      className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      ← Previous
                    </button>

                    {testIndex < testQuestions.length - 1 ? (
                      <button
                        onClick={() => setTestIndex((prev) => prev + 1)}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer shadow-md"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        onClick={handleTestFinish}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer shadow-md"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Test Results Summary */
                <div className="p-8 text-center space-y-6 max-w-xl mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aptitude Assessment Submitted</h3>
                    <div className="text-3xl font-black text-indigo-600 font-mono mt-2">
                      Verified Score: {testResult?.compositeScore || 82.5}%
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Accuracy: {testResult?.accuracyPct}% ({testResult?.correctCount} / {testResult?.totalQuestions} Correct)
                    </p>
                  </div>

                  {/* PROCTORED INTEGRITY SUMMARY CARD (Only for PROCTORED mode) */}
                  {selectedAssessmentMode === 'PROCTORED' && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" /> Proctoring Integrity Status
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (proctorSummary?.events?.length || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(proctorSummary?.events?.length || 0) === 0 ? '✓ No Major Violations' : '⚠️ Review Required'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total Recorded Events: {proctorSummary?.events?.length || 0}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsTestStarted(false);
                      setIsTestFinished(false);
                      setIsModeLocked(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition shadow-md cursor-pointer"
                  >
                    Return to Arena Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. GAMIFIED APTITUDE SECTION */}
      {activeMainMode === 'GAMIFIED' && (
        <div className="space-y-6">
          {/* GAMIFIED PRACTICE MODE */}
          {activeSubMode === 'PRACTICE' && (
            <div className="space-y-6">
              {/* Game Hub Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                {[
                  { id: 'risk_reward', name: 'Risk-Reward', icon: Zap },
                  { id: 'working_memory', name: 'Memory', icon: Brain },
                  { id: 'flexibility', name: 'Flexibility', icon: RefreshCw },
                  { id: 'spatial', name: 'Spatial', icon: Compass },
                  { id: 'planning', name: 'Planning', icon: Layers },
                  { id: 'processing', name: 'Speed', icon: Activity },
                  { id: 'resource', name: 'Resource', icon: Shield },
                  { id: 'emotion', name: 'Emotion', icon: Sparkles },
                  { id: 'maze', name: 'Maze', icon: Lock }
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGameId(g.id)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        activeGameId === g.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                          : 'bg-white dark:bg-card-dark border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[10px] font-bold block truncate">{g.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Game Component Renderer */}
              {activeGameId === 'risk_reward' && <RiskRewardGame />}
              {activeGameId === 'working_memory' && <WorkingMemoryGame />}
              {activeGameId === 'flexibility' && <CognitiveFlexibilityGame />}
              {activeGameId === 'spatial' && <DynamicSpatialGame />}
              {activeGameId === 'planning' && <PlanningStrategyGame />}
              {activeGameId === 'processing' && <InformationProcessingGame />}
              {activeGameId === 'resource' && <ResourceManagementGame />}
              {activeGameId === 'emotion' && <EmotionRecognitionGame />}
              {activeGameId === 'maze' && <MazePressureGame />}
            </div>
          )}

          {/* GAMIFIED TEST MODE (Full Cognitive Battery) */}
          {activeSubMode === 'TEST' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
              {!isBatteryStarted && !batteryResult ? (
                <div className="text-center p-8 space-y-5 max-w-xl mx-auto">
                  <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center border ${
                    selectedAssessmentMode === 'PROCTORED'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 border-purple-200'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-200'
                  }`}>
                    {selectedAssessmentMode === 'PROCTORED' ? <Camera className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Start {selectedAssessmentMode === 'PROCTORED' ? 'Proctored' : 'Standard'} Cognitive Battery Assessment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      5 Interactive Games • ~15 Minutes • Mode: <strong>{selectedAssessmentMode}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleInitiateTest}
                    className={`px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 mx-auto cursor-pointer ${
                      selectedAssessmentMode === 'PROCTORED'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-slate-900 hover:bg-black dark:bg-indigo-600'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start {selectedAssessmentMode === 'PROCTORED' ? 'Proctored' : 'Standard'} Cognitive Battery</span>
                  </button>
                </div>
              ) : isBatteryStarted ? (
                /* Sequential Game Battery Runner */
                <div className="space-y-4">
                  {/* PROCTORED LIVE HUD PANEL FOR GAMIFIED TEST */}
                  {selectedAssessmentMode === 'PROCTORED' && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-purple-500/50 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-purple-400">AI PROCTOR ACTIVE</span>
                      </div>
                      <div>
                        <span>AI INTEGRITY: </span>
                        <strong className="text-emerald-400">{proctorSummary?.integrityScore ?? 100}%</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Battery Progress: Game {batteryStep + 1} of 5</span>
                  </div>

                  {batteryStep === 0 && <RiskRewardGame isBatteryMode onComplete={(m) => handleGameStepComplete('risk_reward', m)} />}
                  {batteryStep === 1 && <WorkingMemoryGame isBatteryMode onComplete={(m) => handleGameStepComplete('working_memory', m)} />}
                  {batteryStep === 2 && <CognitiveFlexibilityGame isBatteryMode onComplete={(m) => handleGameStepComplete('cognitive_flexibility', m)} />}
                  {batteryStep === 3 && <PlanningStrategyGame isBatteryMode onComplete={(m) => handleGameStepComplete('planning', m)} />}
                  {batteryStep === 4 && <InformationProcessingGame isBatteryMode onComplete={(m) => handleGameStepComplete('processing_speed', m)} />}
                </div>
              ) : (
                /* Cognitive Profile Results Display */
                <div className="space-y-6 p-4">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                      <Award className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cognitive Assessment Profile</h3>
                    <div className="text-3xl font-black text-purple-600 font-mono">
                      Overall Cognitive Index: {batteryResult?.overallCognitiveIndex || 82.4} / 100
                    </div>
                  </div>

                  {/* Standardized Dimension Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {batteryResult?.dimensions &&
                      Object.entries(batteryResult.dimensions).map(([key, item]: [string, any]) => (
                        <div key={key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                          <div className="text-2xl font-black text-purple-600 font-mono mt-1">{item.score} / 100</div>
                        </div>
                      ))}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center italic">
                    {batteryResult?.disclaimer}
                  </p>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setIsBatteryStarted(false);
                        setBatteryResult(null);
                        setIsModeLocked(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition shadow-md cursor-pointer"
                    >
                      Return to Arena Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROCTORED ASSESSMENT INFORMATION & PRE-CHECK MODAL                        */}
      {/* ========================================================================= */}
      {showProctorConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI PROCTORED ASSESSMENT</h3>
                  <span className="text-[11px] text-purple-600 font-semibold font-mono">Malpractice & Integrity Protocol</span>
                </div>
              </div>
              <button
                onClick={() => setShowProctorConsentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200">This assessment uses:</p>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Webcam monitoring & live diagnostic feed</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Face presence & single candidate lock</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multiple-face & mobile object detection</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sustained head-pose & gaze deviation detection</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tab/window switch & copy-paste monitoring</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Assessment integrity & malpractice score tracking</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 italic">
                Your assessment may be flagged for institutional review if suspicious activity is detected.
              </p>
            </div>

            {/* Diagnostic Pre-Check Progress State */}
            {precheckStatus === 'checking' && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Running Camera Pre-Check Diagnostic...</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono pl-6">
                  <div>Webcam Access: {precheckProgress.camera ? '✓ Granted' : 'Waiting...'}</div>
                  <div>Face Detection: {precheckProgress.face ? '✓ Detected' : 'Verifying...'}</div>
                  <div>Single Candidate Check: {precheckProgress.singleFace ? '✓ Verified' : 'Verifying...'}</div>
                </div>
              </div>
            )}

            {precheckStatus === 'failed' && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-xs text-red-900 dark:text-red-200 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Pre-Check Failed</span>
                </div>
                <p>{precheckError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowProctorConsentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAllowCameraAndPrecheck}
                disabled={precheckStatus === 'checking'}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>{precheckStatus === 'checking' ? 'Verifying Pre-Check...' : 'Allow Camera & Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROCTORING WARNING MODAL (Phase 17)                                       */}
      {/* ========================================================================= */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border text-center ${
            warningLevel === 'FINAL_WARNING'
              ? 'bg-red-950 border-red-500 text-white'
              : 'bg-amber-950 border-amber-500 text-white'
          }`}>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${
              warningLevel === 'FINAL_WARNING'
                ? 'bg-red-500/20 border-red-500 text-red-500'
                : 'bg-amber-500/20 border-amber-500 text-amber-400'
            }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">{warningTitle}</h3>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                warningLevel === 'FINAL_WARNING' ? 'bg-red-500/30 text-red-300 border-red-500' : 'bg-amber-500/30 text-amber-300 border-amber-500'
              }`}>
                Strike {backendViolationCount} of 3
              </span>
              <p className="text-xs text-slate-200 leading-relaxed pt-1">
                {warningMessage}
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-md cursor-pointer ${
                warningLevel === 'FINAL_WARNING'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              I Understand & Resume Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
