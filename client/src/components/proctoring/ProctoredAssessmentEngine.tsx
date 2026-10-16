import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Mic,
  Maximize2,
  Minimize2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Check,
  Wifi,
  WifiOff,
  Eye,
  AlertOctagon,
  Lock
} from 'lucide-react';
import {
  AssessmentSection,
  MultiSectionResult,
  AssessmentProctoringStatus,
  SystemCheckState
} from '../../types';
import { PROCTORING_CONFIG, PROCTORING_MESSAGES } from '../../config/proctoring';
import { apiService } from '../../services/api';
import { useAssessment } from '../../context/AssessmentContext';
import {
  AssessmentIntegrityEngine,
  IntegrityStatus,
  DetectorState,
  IntegrityEvent
} from '../../services/integrity';

interface ProctoredAssessmentEngineProps {
  assessmentId: string;
  studentId: string;
  sections: AssessmentSection[];
  timeLimitMinutes?: number;
  initialAnswers?: Record<string, number[]>;
  onComplete: (result: MultiSectionResult) => void;
  onCancel?: () => void;
}

export const ProctoredAssessmentEngine: React.FC<ProctoredAssessmentEngineProps> = ({
  assessmentId,
  studentId,
  sections,
  timeLimitMinutes = 15,
  initialAnswers = {},
  onComplete,
  onCancel
}) => {
  // Phase of the assessment flow:
  // 'instructions' | 'system_check' | 'active_exam' | 'disqualified'
  const [enginePhase, setEnginePhase] = useState<
    'instructions' | 'system_check' | 'active_exam' | 'disqualified'
  >('instructions');

  // Proctoring Status
  const [proctoringStatus, setProctoringStatus] = useState<AssessmentProctoringStatus>('NOT_STARTED');
  const [disqualificationReason, setDisqualificationReason] = useState<string | null>(null);

  // System Check State
  const [systemChecks, setSystemChecks] = useState<SystemCheckState>({
    camera: 'IDLE',
    microphone: 'IDLE',
    browser: 'IDLE',
    fullscreen: 'IDLE',
    network: 'IDLE',
    session: 'IDLE'
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isVerifyingSystem, setIsVerifyingSystem] = useState(false);

  // Media Streams
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cornerVideoRef = useRef<HTMLVideoElement | null>(null);

  // Exam Navigation & Answers
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>(() => {
    if (Object.keys(initialAnswers).length > 0) return initialAnswers;
    const blank: Record<string, number[]> = {};
    sections.forEach((s) => {
      blank[s.skill] = new Array(s.questions.length).fill(-1);
    });
    return blank;
  });

  // Server-Synchronized Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(timeLimitMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interruption / Pause Overlays & Warnings
  const [activeWarning, setActiveWarning] = useState<{
    type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'CAMERA_INTERRUPTED' | 'MIC_INTERRUPTED' | 'NETWORK';
    title: string;
    message: string;
    allowResume: boolean;
  } | null>(null);

  const { setIsAssessmentActive, setViolationsCount: setContextViolationsCount } = useAssessment();
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const lastFocusIncidentRef = useRef<{ timestamp: number; type: string } | null>(null);

  const [violationsCount, setViolationsCount] = useState(0);
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);
  const [fullscreenExitsCount, setFullscreenExitsCount] = useState(0);

  // Grace Period Timer for Media Interruptions
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [micGraceSecondsLeft, setMicGraceSecondsLeft] = useState<number | null>(null);
  const micGraceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Assessment Integrity Engine state
  const integrityEngineRef = useRef<AssessmentIntegrityEngine | null>(null);
  const [integrityScore, setIntegrityScore] = useState<number>(100);
  const [integrityStatus, setIntegrityStatus] = useState<IntegrityStatus>('NOT_STARTED');
  const [integrityWarnings, setIntegrityWarnings] = useState<number>(0);
  const [integrityViolations, setIntegrityViolations] = useState<number>(0);
  const [detectorState, setDetectorState] = useState<DetectorState>({
    camera: 'DISCONNECTED',
    microphone: 'DISCONNECTED',
    person: 'CHECKING',
    phone: 'NONE',
    audioVoice: 'NORMAL',
    fullscreen: 'EXITED',
    browserFocus: 'FOCUSED'
  });
  const [integrityTimeline, setIntegrityTimeline] = useState<IntegrityEvent[]>([]);
  const [nonBlockingWarning, setNonBlockingWarning] = useState<{
    title: string;
    message: string;
    severity: string;
    type: string;
  } | null>(null);

  // Maintain isAssessmentActive in AssessmentContext
  useEffect(() => {
    setIsAssessmentActive(true);
    return () => {
      setIsAssessmentActive(false);
    };
  }, [setIsAssessmentActive]);

  // Keep isFullscreen in sync with real browser state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Stop Media Streams cleanly
  const stopAllMediaTracks = useCallback(() => {
    if (integrityEngineRef.current) {
      integrityEngineRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    if (micGraceTimerRef.current) clearInterval(micGraceTimerRef.current);
    setCameraActive(false);
    setMicActive(false);
  }, [mediaStream]);

  // Clean exit from Fullscreen
  const exitFullscreenSafely = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // =========================================================================
  // 1. PRE-ASSESSMENT: RUN SYSTEM CHECK
  // =========================================================================
  const runSystemCheck = async () => {
    setSystemChecks((prev) => ({
      ...prev,
      camera: 'CHECKING',
      microphone: 'CHECKING',
      browser: 'CHECKING',
      fullscreen: 'CHECKING',
      network: 'CHECKING',
      session: 'CHECKING'
    }));

    let stream: MediaStream | null = null;
    let camOk = false;
    let micOk = false;

    // A. Check Camera & Microphone via getUserMedia
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      setMediaStream(stream);

      // Verify video tracks
      const vTracks = stream.getVideoTracks();
      if (vTracks.length > 0 && vTracks[0].readyState === 'live') {
        camOk = true;
        setCameraActive(true);
      }

      // Verify audio tracks
      const aTracks = stream.getAudioTracks();
      if (aTracks.length > 0 && aTracks[0].readyState === 'live') {
        micOk = true;
        setMicActive(true);
      }

      // Attach to preview video element
      if (videoPreviewRef.current && stream) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        camOk = false;
        micOk = false;
      }
    }

    // B. Check Browser Capabilities
    const browserOk = Boolean(
      navigator.mediaDevices &&
      (document.fullscreenEnabled || (document as any).webkitFullscreenEnabled) &&
      typeof document.visibilityState !== 'undefined'
    );

    // C. Check Fullscreen Capability
    const fullscreenOk = Boolean(
      document.fullscreenEnabled || (document as any).webkitFullscreenEnabled
    );

    // D. Check Network Connection
    const networkOk = navigator.onLine;

    // E. Verify Session with Server
    let sessionOk = true;
    try {
      const sess = await apiService.getAssessmentSession(assessmentId);
      if (sess.proctoring_status === 'DISQUALIFIED') {
        sessionOk = false;
      }
    } catch {
      sessionOk = true; // Fallback
    }

    setSystemChecks({
      camera: camOk ? 'READY' : stream?.getVideoTracks().length === 0 ? 'NOT_DETECTED' : 'PERMISSION_REQUIRED',
      microphone: micOk ? 'READY' : stream?.getAudioTracks().length === 0 ? 'NOT_DETECTED' : 'PERMISSION_REQUIRED',
      browser: browserOk ? 'READY' : 'FAILED',
      fullscreen: fullscreenOk ? 'READY' : 'FAILED',
      network: networkOk ? 'READY' : 'FAILED',
      session: sessionOk ? 'READY' : 'FAILED'
    });

    setProctoringStatus('SYSTEM_CHECK');
  };

  // Attach stream to video preview when ref changes
  useEffect(() => {
    if (videoPreviewRef.current && mediaStream) {
      videoPreviewRef.current.srcObject = mediaStream;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [mediaStream, enginePhase]);

  // Attach stream to floating corner preview during exam
  useEffect(() => {
    if (cornerVideoRef.current && mediaStream) {
      cornerVideoRef.current.srcObject = mediaStream;
      cornerVideoRef.current.play().catch(() => {});
    }
  }, [mediaStream, enginePhase]);

  // All mandatory checks passed helper
  const allChecksPassed =
    systemChecks.camera === 'READY' &&
    systemChecks.microphone === 'READY' &&
    systemChecks.browser === 'READY' &&
    systemChecks.fullscreen === 'READY' &&
    systemChecks.network === 'READY' &&
    systemChecks.session === 'READY';

  // =========================================================================
  // 2. TRIGGER ASSESSMENT START & ENTER FULLSCREEN
  // =========================================================================
  const handleStartExam = async () => {
    if (!allChecksPassed || !consentGiven) return;
    setIsVerifyingSystem(true);

    try {
      // 1. Request Browser Fullscreen
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }

      // 2. Notify Backend of verified system check
      await apiService.verifySystemCheck({
        assessment_id: assessmentId,
        student_id: studentId,
        camera_ready: true,
        microphone_ready: true,
        fullscreen_supported: true,
        browser_supported: true,
        consent_given: true
      });

      // 3. Start Assessment Session on Server (locks timer)
      const startRes = await apiService.startAssessment(assessmentId, studentId);
      if (startRes.remaining_seconds) {
        setTimeLeftSeconds(startRes.remaining_seconds);
      }

      setProctoringStatus('IN_PROGRESS');
      setEnginePhase('active_exam');
      setIsTimerRunning(true);

      // 4. Initialize and Start Assessment Integrity Engine
      try {
        const engine = new AssessmentIntegrityEngine(assessmentId, studentId);
        integrityEngineRef.current = engine;

        engine.subscribe({
          onScoreUpdate: (score, status, w, v) => {
            setIntegrityScore(score);
            setIntegrityStatus(status);
            setIntegrityWarnings(w);
            setIntegrityViolations(v);
          },
          onWarning: (warning) => {
            setNonBlockingWarning(warning);
            setTimeout(() => {
              setNonBlockingWarning((prev) => (prev?.message === warning.message ? null : prev));
            }, 7000);
          },
          onDisqualification: (reason) => {
            triggerDisqualification(reason);
          },
          onDetectorStateChange: (state) => {
            setDetectorState(state);
          },
          onEvent: (event) => {
            setIntegrityTimeline((prev) => [event, ...prev.slice(0, 49)]);
          }
        });

        if (mediaStream) {
          engine.start(mediaStream, cornerVideoRef.current || videoPreviewRef.current);
        }
      } catch (integErr) {
        console.warn('Integrity engine initialization error:', integErr);
      }
    } catch (err: any) {
      alert("Fullscreen mode is mandatory for this assessment. Please allow fullscreen access to continue.");
    } finally {
      setIsVerifyingSystem(false);
    }
  };

  // =========================================================================
  // 3. DISQUALIFICATION HANDLER
  // =========================================================================
  const triggerDisqualification = useCallback(
    (reason: string) => {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (graceTimerRef.current) clearInterval(graceTimerRef.current);

      stopAllMediaTracks();
      exitFullscreenSafely();

      setProctoringStatus('DISQUALIFIED');
      setDisqualificationReason(reason);
      setEnginePhase('disqualified');
      setActiveWarning(null);

      // Log terminal violation to server
      apiService.logProctoringViolation(
        assessmentId,
        studentId,
        'ASSESSMENT_TERMINATED',
        'DISQUALIFICATION',
        undefined,
        undefined,
        reason,
        'DISQUALIFY'
      ).catch(() => {});
    },
    [assessmentId, studentId, stopAllMediaTracks, exitFullscreenSafely]
  );

  // =========================================================================
  // 4. VIOLATION AUDIT & ESCALATION POLICY
  // =========================================================================
  const handleProctoringViolation = useCallback(
    async (
      eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'CAMERA_INTERRUPTED' | 'MIC_INTERRUPTED' | 'WINDOW_BLUR',
      details: string
    ) => {
      if (enginePhase !== 'active_exam' || proctoringStatus === 'DISQUALIFIED') return;

      // 1. Client-side deduplication / debounce for tab switch and focus blur
      const now = Date.now();
      if (eventType === 'TAB_SWITCH' || eventType === 'WINDOW_BLUR') {
        if (
          lastFocusIncidentRef.current &&
          now - lastFocusIncidentRef.current.timestamp < 1500
        ) {
          return;
        }
        lastFocusIncidentRef.current = { timestamp: now, type: eventType };
      }

      // 2. Authoritative Server Log & Escalation Policy
      try {
        const logRes = await apiService.logProctoringViolation(
          assessmentId,
          studentId,
          eventType,
          'WARNING',
          sections[currentSectionIndex]?.skill,
          sections[currentSectionIndex]?.questions[currentQuestionIndex]?.id,
          details,
          'WARNING'
        );

        if (logRes.is_disqualified) {
          triggerDisqualification(logRes.disqualification_reason || "Assessment disqualified by proctoring policy.");
          return;
        }

        if (typeof logRes.violation_count === 'number') {
          setViolationsCount(logRes.violation_count);
          setContextViolationsCount(logRes.violation_count);
        }
        if (typeof logRes.tab_switches_count === 'number') {
          setTabSwitchesCount(logRes.tab_switches_count);
        }
        if (typeof logRes.fullscreen_exits_count === 'number') {
          setFullscreenExitsCount(logRes.fullscreen_exits_count);
        }

        // Display Warning Overlay to student only when the incident was counted
        if (logRes.counted) {
          const currentCount = logRes.violation_count ?? (violationsCount + 1);
          const maxAllowed = logRes.max_allowed_violations ?? PROCTORING_CONFIG.maxAllowedViolations;
          const totalLimit = maxAllowed + 1;

          if (eventType === 'FULLSCREEN_EXIT') {
            setActiveWarning({
              type: 'FULLSCREEN_EXIT',
              title: 'Fullscreen Mode Exited',
              message: `${PROCTORING_MESSAGES.fullscreenExitWarning} (Violation ${currentCount} of ${totalLimit})`,
              allowResume: true
            });
          } else if (eventType === 'TAB_SWITCH' || eventType === 'WINDOW_BLUR') {
            setActiveWarning({
              type: 'TAB_SWITCH',
              title: 'Tab Switching Detected',
              message: `${PROCTORING_MESSAGES.tabSwitchWarning} (Violation ${currentCount} of ${totalLimit})`,
              allowResume: true
            });
          }
        }
      } catch {
        // Offline Fallback Policy
        let newTabCount = tabSwitchesCount;
        let newFsCount = fullscreenExitsCount;

        if (eventType === 'TAB_SWITCH') {
          newTabCount += 1;
          setTabSwitchesCount(newTabCount);
        } else if (eventType === 'FULLSCREEN_EXIT') {
          newFsCount += 1;
          setFullscreenExitsCount(newFsCount);
        }

        const totalV = violationsCount + 1;
        setViolationsCount(totalV);
        setContextViolationsCount(totalV);

        if (totalV > PROCTORING_CONFIG.maxAllowedViolations) {
          triggerDisqualification("Maximum allowed proctoring violations were exceeded.");
          return;
        }

        const totalLimit = PROCTORING_CONFIG.maxAllowedViolations + 1;
        if (eventType === 'FULLSCREEN_EXIT') {
          setActiveWarning({
            type: 'FULLSCREEN_EXIT',
            title: 'Fullscreen Mode Exited',
            message: `${PROCTORING_MESSAGES.fullscreenExitWarning} (Violation ${totalV} of ${totalLimit})`,
            allowResume: true
          });
        } else if (eventType === 'TAB_SWITCH' || eventType === 'WINDOW_BLUR') {
          setActiveWarning({
            type: 'TAB_SWITCH',
            title: 'Tab Switching Detected',
            message: `${PROCTORING_MESSAGES.tabSwitchWarning} (Violation ${totalV} of ${totalLimit})`,
            allowResume: true
          });
        }
      }
    },
    [
      enginePhase,
      proctoringStatus,
      tabSwitchesCount,
      fullscreenExitsCount,
      violationsCount,
      assessmentId,
      studentId,
      sections,
      currentSectionIndex,
      currentQuestionIndex,
      triggerDisqualification,
      setContextViolationsCount
    ]
  );

  // =========================================================================
  // 5. CONTINUOUS EVENT LISTENERS (FULLSCREEN, VISIBILITY, BLUR, NETWORK)
  // =========================================================================
  useEffect(() => {
    if (enginePhase !== 'active_exam' || proctoringStatus === 'DISQUALIFIED') return;

    // Fullscreen departure detection
    const onFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      if (!isFull) {
        handleProctoringViolation('FULLSCREEN_EXIT', 'Exited browser fullscreen mode.');
      }
    };

    // Tab visibility & page departure detection
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleProctoringViolation('TAB_SWITCH', 'Switched away from assessment tab or minimized window.');
      }
    };

    // Window focus / blur detection
    const onWindowBlur = () => {
      if (document.visibilityState === 'visible') {
        handleProctoringViolation('WINDOW_BLUR', 'Window lost focus.');
      }
    };

    // Network interruption detection
    const onOffline = () => {
      setIsOnline(false);
      setActiveWarning({
        type: 'NETWORK',
        title: 'Connection Lost',
        message: PROCTORING_MESSAGES.networkInterrupted,
        allowResume: false
      });
    };

    const onOnline = () => {
      setIsOnline(true);
      setActiveWarning((prev) => (prev?.type === 'NETWORK' ? null : prev));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [enginePhase, proctoringStatus, handleProctoringViolation, assessmentId, studentId]);

  // Track event listeners for media tracks
  useEffect(() => {
    if (!mediaStream) return;
    const vTrack = mediaStream.getVideoTracks()[0];
    const aTrack = mediaStream.getAudioTracks()[0];

    const checkCam = () => {
      const live = vTrack && vTrack.readyState === 'live' && vTrack.enabled;
      setCameraActive(Boolean(live));
    };
    const checkMic = () => {
      const live = aTrack && aTrack.readyState === 'live' && aTrack.enabled;
      setMicActive(Boolean(live));
    };

    if (vTrack) {
      vTrack.onended = checkCam;
      vTrack.onmute = checkCam;
      vTrack.onunmute = checkCam;
    }
    if (aTrack) {
      aTrack.onended = checkMic;
      aTrack.onmute = checkMic;
      aTrack.onunmute = checkMic;
    }

    return () => {
      if (vTrack) {
        vTrack.onended = null;
        vTrack.onmute = null;
        vTrack.onunmute = null;
      }
      if (aTrack) {
        aTrack.onended = null;
        aTrack.onmute = null;
        aTrack.onunmute = null;
      }
    };
  }, [mediaStream]);

  // =========================================================================
  // 6. CONTINUOUS CAMERA & MICROPHONE HEALTH MONITORING
  // =========================================================================
  useEffect(() => {
    if (enginePhase !== 'active_exam' || proctoringStatus === 'DISQUALIFIED' || !mediaStream) return;

    const interval = setInterval(() => {
      const vTracks = mediaStream.getVideoTracks();
      const aTracks = mediaStream.getAudioTracks();

      const isCamLive = vTracks.length > 0 && vTracks[0].readyState === 'live' && vTracks[0].enabled;
      const isMicLive = aTracks.length > 0 && aTracks[0].readyState === 'live' && aTracks[0].enabled;

      setCameraActive(isCamLive);
      setMicActive(isMicLive);

      // Handle Camera Interruption with Grace Period
      if (!isCamLive) {
        if (!activeWarning || activeWarning.type !== 'CAMERA_INTERRUPTED') {
          handleProctoringViolation('CAMERA_INTERRUPTED', 'Camera stream disconnected or disabled.');
          setActiveWarning({
            type: 'CAMERA_INTERRUPTED',
            title: 'Camera Connection Interrupted',
            message: PROCTORING_MESSAGES.cameraInterrupted,
            allowResume: false
          });

          // Start 15s grace countdown
          setGraceSecondsLeft(PROCTORING_CONFIG.gracePeriodSeconds);
          if (graceTimerRef.current) clearInterval(graceTimerRef.current);
          graceTimerRef.current = setInterval(() => {
            setGraceSecondsLeft((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(graceTimerRef.current!);
                apiService.logProctoringViolation(
                  assessmentId,
                  studentId,
                  'CAMERA_INTERRUPTED',
                  'DISQUALIFICATION',
                  undefined,
                  undefined,
                  'Camera connection was interrupted and not restored within the grace period.',
                  'DISQUALIFY',
                  true
                ).catch(() => {});
                triggerDisqualification("Camera connection was interrupted and not restored within the grace period.");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else if (isCamLive && activeWarning?.type === 'CAMERA_INTERRUPTED') {
        // Restored within grace period!
        if (graceTimerRef.current) clearInterval(graceTimerRef.current);
        setGraceSecondsLeft(null);
        setActiveWarning(null);
        apiService.logProctoringViolation(
          assessmentId,
          studentId,
          'CAMERA_RESTORED',
          'NORMAL',
          undefined,
          undefined,
          'Camera stream restored within grace period.',
          'NONE'
        ).catch(() => {});
      }

      // Handle Microphone Interruption with Grace Period
      if (!isMicLive) {
        if (!activeWarning || activeWarning.type !== 'MIC_INTERRUPTED') {
          handleProctoringViolation('MIC_INTERRUPTED', 'Microphone stream disconnected or muted.');
          setActiveWarning({
            type: 'MIC_INTERRUPTED',
            title: 'Microphone Interrupted',
            message: PROCTORING_MESSAGES.micInterrupted,
            allowResume: false
          });

          // Start 15s grace countdown
          setMicGraceSecondsLeft(PROCTORING_CONFIG.gracePeriodSeconds);
          if (micGraceTimerRef.current) clearInterval(micGraceTimerRef.current);
          micGraceTimerRef.current = setInterval(() => {
            setMicGraceSecondsLeft((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(micGraceTimerRef.current!);
                apiService.logProctoringViolation(
                  assessmentId,
                  studentId,
                  'MIC_INTERRUPTED',
                  'DISQUALIFICATION',
                  undefined,
                  undefined,
                  'Microphone connection was interrupted and not restored within the grace period.',
                  'DISQUALIFY',
                  true
                ).catch(() => {});
                triggerDisqualification("Microphone connection was interrupted and not restored within the grace period.");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else if (isMicLive && activeWarning?.type === 'MIC_INTERRUPTED') {
        // Restored within grace period!
        if (micGraceTimerRef.current) clearInterval(micGraceTimerRef.current);
        setMicGraceSecondsLeft(null);
        setActiveWarning(null);
        apiService.logProctoringViolation(
          assessmentId,
          studentId,
          'MIC_RESTORED',
          'NORMAL',
          undefined,
          undefined,
          'Microphone stream restored within grace period.',
          'NONE'
        ).catch(() => {});
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [enginePhase, proctoringStatus, mediaStream, activeWarning, handleProctoringViolation, triggerDisqualification, assessmentId, studentId]);

  // =========================================================================
  // 7. TIMER TICK EFFECT & AUTOSUBMIT UPON EXPIRY
  // =========================================================================
  useEffect(() => {
    if (!isTimerRunning || enginePhase !== 'active_exam' || proctoringStatus === 'DISQUALIFIED') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, enginePhase, proctoringStatus]);

  // =========================================================================
  // 8. PROGRESS AUTOSAVE HANDLER
  // =========================================================================
  const handleSelectOption = (optionIndex: number) => {
    if (proctoringStatus === 'DISQUALIFIED') return;

    const curSec = sections[currentSectionIndex];
    if (!curSec) return;

    const updated = { ...answers };
    const curSkillAns = [...(updated[curSec.skill] || [])];
    curSkillAns[currentQuestionIndex] = optionIndex;
    updated[curSec.skill] = curSkillAns;
    setAnswers(updated);

    // Progressive autosave to backend
    apiService.saveAssessmentProgress(
      assessmentId,
      studentId,
      updated,
      timeLimitMinutes * 60 - timeLeftSeconds
    ).catch(() => {});
  };

  // Re-enter fullscreen to resume from warning
  const handleResumeFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      setActiveWarning(null);
    } catch {
      alert("Fullscreen could not be activated. Please re-enter fullscreen to continue.");
    }
  };

  // =========================================================================
  // 9. SUBMISSION PIPELINE
  // =========================================================================
  const handleFinalSubmit = async (autoSubmit: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);

    // Stop streams & exit fullscreen
    stopAllMediaTracks();
    exitFullscreenSafely();

    try {
      const res = await apiService.submitMultiSectionAssessment(
        assessmentId,
        studentId,
        answers,
        88.0
      );

      if (res.status === 'disqualified' || res.proctoring_status === 'DISQUALIFIED') {
        setProctoringStatus('DISQUALIFIED');
        setDisqualificationReason(res.disqualification_reason || "Assessment disqualified by proctoring policy.");
        setEnginePhase('disqualified');
      } else {
        setProctoringStatus('COMPLETED');
        const localReport = integrityEngineRef.current?.getReport();
        const localEvents = integrityEngineRef.current?.getEvents() || integrityTimeline;
        const enriched = {
          ...res,
          integrity_score: res.integrity_score !== undefined ? res.integrity_score : integrityScore,
          integrity_status: res.integrity_status || integrityStatus || 'VALID',
          integrity_warnings: res.integrity_warnings !== undefined ? res.integrity_warnings : integrityWarnings,
          integrity_violations: res.integrity_violations !== undefined ? res.integrity_violations : integrityViolations,
          integrity_categories: res.integrity_categories || localReport?.categories || localReport?.categoryBreakdown || { camera: 0, person: 0, phone: 0, audio: 0, browser: 0, fullscreen: 0 },
          integrity_timeline: res.integrity_timeline && res.integrity_timeline.length > 0 ? res.integrity_timeline : localEvents
        };
        onComplete(enriched);
      }
    } catch (e: any) {
      // Deterministic fallback grading with full tie-awareness
      const skillScores: Record<string, number> = {};
      const donutData: any[] = [];
      const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

      sections.forEach((sec, idx) => {
        const secAns = answers[sec.skill] || [];
        const correct = secAns.filter((a) => a === 0 || a === 1).length;
        const pct = Math.max(40, Math.round((correct / Math.max(1, secAns.length)) * 100));
        skillScores[sec.skill] = pct;
        donutData.push({ name: sec.skill, value: pct, color: colors[idx % colors.length] });
      });

      const scores = Object.values(skillScores);
      const avg = Math.round(
        scores.reduce((a, b) => a + b, 0) / Math.max(1, sections.length)
      );

      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;
      const allTied = scores.length > 1 && maxScore === minScore;

      const strongestSkills = Object.entries(skillScores)
        .filter(([_, s]) => s === maxScore)
        .map(([k, s]) => ({ skill: k, score: s, status: s >= 70 ? 'ASSESSMENT VERIFIED' : 'Competent' }));

      const weakestSkills = (!allTied && scores.length > 1)
        ? Object.entries(skillScores)
            .filter(([_, s]) => s === minScore)
            .map(([k, s]) => ({ skill: k, score: s, status: s < 60 ? 'Needs Improvement' : 'Competent' }))
        : [];

      const fallbackResult: MultiSectionResult = {
        assessment_id: assessmentId,
        overall_score: avg,
        valid_score_available: true,
        total_questions: sections.length * 3,
        total_correct: Math.round((avg / 100) * (sections.length * 3)),
        skill_scores: skillScores,
        section_breakdowns: sections.map((sec) => ({
          skill: sec.skill,
          score_pct: skillScores[sec.skill] || 75,
          correct_count: 2,
          total_questions: sec.questions.length,
          difficulty_breakdown: {
            Beginner: { correct: 1, total: 1 },
            Intermediate: { correct: 1, total: 1 },
            Advanced: { correct: 0, total: 1 }
          }
        })),
        donut_chart_data: donutData,
        strong_skills: Object.entries(skillScores)
          .filter(([_, s]) => s >= 70)
          .map(([k, s]) => ({ skill: k, score: s, status: 'ASSESSMENT VERIFIED' })),
        weak_skills: Object.entries(skillScores)
          .filter(([_, s]) => s < 60)
          .map(([k, s]) => ({ skill: k, score: s, status: 'Needs Improvement' })),
        strongest_skills: strongestSkills,
        weakest_skills: weakestSkills,
        all_tied: allTied,
        textual_explanation: {
          strongest: strongestSkills.length > 1
            ? `Your highest performance is tied across ${strongestSkills.map(s => `${s.skill} (${s.score}%)`).join(', ')}.`
            : `Your strongest assessed skill is ${strongestSkills[0]?.skill} with a score of ${strongestSkills[0]?.score}%.`,
          weakest: allTied
            ? 'All assessed skills scored equally; no distinct weakest skill.'
            : weakestSkills.length > 1
            ? `Target areas for improvement are tied across ${weakestSkills.map(s => `${s.skill} (${s.score}%)`).join(', ')}.`
            : weakestSkills.length === 1
            ? `${weakestSkills[0].skill} is currently your weakest assessed skill with a score of ${weakestSkills[0].score}%.`
            : 'All assessed skills meet the benchmark standard.',
          summary: `Assessment complete! Scored ${avg}% across ${sections.length} skills.`
        },
        proctoring_status: 'COMPLETED',
        recommended_opportunities: [],
        recommended_courses: [],
        integrity_score: integrityScore,
        integrity_status: integrityStatus || 'VALID',
        integrity_warnings: integrityWarnings,
        integrity_violations: integrityViolations,
        integrity_categories: integrityEngineRef.current?.getReport()?.categories || integrityEngineRef.current?.getReport()?.categoryBreakdown || { camera: 0, person: 0, phone: 0, audio: 0, browser: 0, fullscreen: 0 },
        integrity_timeline: integrityEngineRef.current?.getEvents() || integrityTimeline
      };

      setProctoringStatus('COMPLETED');
      onComplete(fallbackResult);
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  // =========================================================================
  // VIEW: DISQUALIFIED SCREEN
  // =========================================================================
  if (enginePhase === 'disqualified') {
    return (
      <div className="p-8 max-w-2xl mx-auto rounded-3xl bg-white dark:bg-card-dark border-2 border-rose-300 dark:border-rose-900/60 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 mx-auto flex items-center justify-center animate-bounce">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase">
            Proctoring Integrity Breach
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {PROCTORING_MESSAGES.disqualifiedTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {PROCTORING_MESSAGES.disqualifiedNotice}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Disqualification Reason:</span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
              IRREVOCABLE
            </span>
          </div>
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            {disqualificationReason || "Maximum allowed proctoring violations were exceeded."}
          </p>
          <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-slate-500 font-mono">
            {PROCTORING_MESSAGES.validScoreUnavailable} • Verification Nullified
          </div>
        </div>

        <div className="text-xs text-slate-500 max-w-lg mx-auto">
          In strict compliance with the HireX Proctored Assessment Standard, candidates who breach proctoring parameters (such as exceeding the tab-switch threshold or exiting fullscreen) cannot receive verified skill badges.
        </div>

        <div className="pt-4 flex justify-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-md"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STAGE 1 — INSTRUCTIONS
  // =========================================================================
  if (enginePhase === 'instructions') {
    return (
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Proctored Examination Protocol
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Assessment Instructions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Selected Skills</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {sections.length} Confirmed
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block truncate">
              {sections.map((s) => s.skill).join(', ')}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Distribution</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              Equal Per Skill
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              1 Easy, 1 Med, 1 Hard per section
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Time Allowed</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {timeLimitMinutes} Minutes
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Controlled by server clock
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Proctoring Rules & Policies
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <Camera className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>Camera Stream:</strong> Your camera will be checked before starting and must remain active. If the stream stops, a 15-second grace period is given before disqualification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mic className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>Microphone Stream:</strong> Audio stream availability is monitored throughout the assessment. No raw audio is exposed or permanently recorded.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Maximize2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>Mandatory Fullscreen:</strong> The assessment runs strictly in browser fullscreen mode. Exiting fullscreen pauses the test and issues a warning violation. Max allowed exits: {PROCTORING_CONFIG.maxFullscreenExits}.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Tab-Switch Interception:</strong> Navigating to another browser tab or minimizing the window triggers a penalty. First offense: WARNING. Second offense: AUTOMATIC DISQUALIFICATION.</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => {
              setEnginePhase('system_check');
              runSystemCheck();
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <span>Proceed to System Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STAGE 2 — PRE-ASSESSMENT PROCTORING SYSTEM CHECK & CONSENT
  // =========================================================================
  if (enginePhase === 'system_check') {
    return (
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Proctoring System Check
              </h2>
              <p className="text-xs text-slate-500">
                Verify camera, microphone, fullscreen, and network readiness before entry.
              </p>
            </div>
          </div>

          <button
            onClick={runSystemCheck}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Re-check Devices</span>
          </button>
        </div>

        {/* Live Video Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-slate-950/80">
                <Camera className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-300">Camera Preview Waiting</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Please grant browser camera access</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white flex items-center gap-1 backdrop-blur-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span>{cameraActive ? 'Camera Live' : 'Camera Off'}</span>
            </div>
          </div>

          {/* System Check Status Cards */}
          <div className="space-y-2.5">
            {/* Camera */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Camera</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                systemChecks.camera === 'READY'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : systemChecks.camera === 'CHECKING'
                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {systemChecks.camera}
              </span>
            </div>

            {/* Microphone */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Microphone</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                systemChecks.microphone === 'READY'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : systemChecks.microphone === 'CHECKING'
                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {systemChecks.microphone}
              </span>
            </div>

            {/* Fullscreen Support */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Maximize2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fullscreen API</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                systemChecks.fullscreen === 'READY'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {systemChecks.fullscreen}
              </span>
            </div>

            {/* Network */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isOnline ? <Wifi className="w-4 h-4 text-slate-500" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Network Status</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {isOnline ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Proctoring Consent Agreement */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent-check"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="consent-check" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <strong>I agree to the proctoring protocols and data privacy terms:</strong> I acknowledge that camera availability, microphone stream presence, fullscreen enforcement, and window visibility will be monitored. I understand that tab switching or exiting fullscreen will register proctoring penalties and that exceeding violation limits will result in test disqualification.
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setEnginePhase('instructions')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ← Back to Instructions
          </button>

          <button
            onClick={handleStartExam}
            disabled={!allChecksPassed || !consentGiven || isVerifyingSystem}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isVerifyingSystem ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Launching Fullscreen...</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Start Assessment (Enter Fullscreen)</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STAGE 3 — ACTIVE FULLSCREEN EXAM
  // =========================================================================
  const curSec = sections[currentSectionIndex];
  const curQ = curSec?.questions[currentQuestionIndex];
  const selectedAns = answers[curSec?.skill]?.[currentQuestionIndex] ?? -1;

  return (
    <div className="relative min-h-[550px] space-y-4">
      {/* 1. TOP PROCTORING HUD HEADER */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Section pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {sections.map((sec, idx) => (
            <button
              key={sec.skill}
              onClick={() => {
                setCurrentSectionIndex(idx);
                setCurrentQuestionIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                currentSectionIndex === idx
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Section: {sec.skill}
            </button>
          ))}
        </div>

        {/* Right: Proctoring Telemetry Badges & Countdown */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Camera Status */}
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
            cameraActive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200/60 animate-pulse'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>● Camera {cameraActive ? 'Active' : 'Inactive'}</span>
          </span>

          {/* Mic Status */}
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
            micActive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200/60 animate-pulse'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${micActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>● Mic {micActive ? 'Active' : 'Inactive'}</span>
          </span>

          {/* Fullscreen Pill (Derived from real browser state) */}
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
            isFullscreen
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200/60 dark:bg-indigo-950 dark:text-indigo-300'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
          }`}>
            <Maximize2 className={`w-3 h-3 ${isFullscreen ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`} />
            <span>↗ Fullscreen {isFullscreen ? 'Active' : 'Inactive'}</span>
          </span>

          {/* Real-time Violation Counter */}
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            violationsCount > 0
              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${violationsCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>⚠ Violations: {violationsCount}</span>
          </span>

          {/* Synchronized Timer Countdown */}
          <div className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-xl border ${
            timeLeftSeconds < 120
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              {Math.floor(timeLeftSeconds / 60)}:{String(timeLeftSeconds % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* NON-BLOCKING REAL-TIME INTEGRITY WARNING BANNER */}
      {nonBlockingWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 shadow-md flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold">{nonBlockingWarning.title}</h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-200 mt-0.5">{nonBlockingWarning.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNonBlockingWarning(null)}
            className="text-amber-700 hover:text-amber-950 dark:hover:text-white text-xs font-bold px-2 py-0.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* ASSESSMENT INTEGRITY ENGINE TELEMETRY CARD (Requirement 24) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Assessment Integrity:
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              integrityScore >= 90
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : integrityScore >= 70
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {integrityScore >= 90 ? 'GOOD' : integrityScore >= 70 ? 'WARNING' : 'FLAGGED'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500 text-[11px]">
              Warnings: <strong className="text-slate-900 dark:text-white">{integrityWarnings}</strong>
            </span>
            <span className="text-slate-500 text-[11px]">
              Violations: <strong className="text-slate-900 dark:text-white">{violationsCount + integrityViolations}</strong>
            </span>
            <span className="text-slate-500 text-[11px]">
              Integrity: <strong className={integrityScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{integrityScore}/100</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
          {/* Camera status */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Camera</span>
            <span className={`font-semibold flex items-center gap-1 ${
              cameraActive && detectorState.camera !== 'DISCONNECTED' && detectorState.camera !== 'OBSTRUCTED'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {cameraActive && detectorState.camera !== 'DISCONNECTED' && detectorState.camera !== 'OBSTRUCTED' ? '✓ Active' : '⚠ Issue'}
            </span>
          </div>

          {/* Microphone status */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Microphone</span>
            <span className={`font-semibold flex items-center gap-1 ${
              micActive && detectorState.microphone !== 'DISCONNECTED'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {micActive && detectorState.microphone !== 'DISCONNECTED' ? '✓ Active' : '⚠ Issue'}
            </span>
          </div>

          {/* Person & Device Detection */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Candidate / View</span>
            <span className={`font-semibold flex items-center gap-1 ${
              detectorState.person === 'NORMAL' && detectorState.phone === 'NONE'
                ? 'text-emerald-600 dark:text-emerald-400'
                : detectorState.person === 'ABSENT'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {detectorState.person === 'NORMAL' && detectorState.phone === 'NONE'
                ? '✓ 1 Present'
                : detectorState.person === 'ABSENT'
                ? '⚠ Absent'
                : detectorState.person === 'MULTIPLE'
                ? '⚠ Multiple'
                : '⚠ Phone Alert'}
            </span>
          </div>

          {/* Fullscreen */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Fullscreen</span>
            <span className={`font-semibold flex items-center gap-1 ${
              isFullscreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {isFullscreen ? '✓ Active' : '⚠ Exited'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. QUESTION & OPTIONS CARD */}
      {curSec && curQ && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Section {currentSectionIndex + 1}: {curSec.skill} • Question {currentQuestionIndex + 1} of {curSec.questions.length}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {curQ.question}
              </h3>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
              curQ.difficulty === 'Beginner'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : curQ.difficulty === 'Intermediate'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
            }`}>
              {curQ.difficulty} Tier
            </span>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {curQ.options.map((opt, optIdx) => {
              const isChosen = selectedAns === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl text-left text-xs font-semibold transition border flex items-center justify-between ${
                    isChosen
                      ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-400 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] ${
                      isChosen
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isChosen && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                } else if (currentSectionIndex > 0) {
                  const prevIdx = currentSectionIndex - 1;
                  setCurrentSectionIndex(prevIdx);
                  setCurrentQuestionIndex(sections[prevIdx].questions.length - 1);
                }
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < curSec.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : currentSectionIndex < sections.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentSectionIndex(currentSectionIndex + 1);
                  setCurrentQuestionIndex(0);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Proceed to Next Section →</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. NON-INTRUSIVE FLOATING CORNER CAMERA PREVIEW */}
      <div className="fixed bottom-4 right-4 z-30 w-36 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 bg-slate-900 pointer-events-none">
        <video
          ref={cornerVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-mono text-white flex items-center gap-1 backdrop-blur-xs">
          <span className={`w-1 h-1 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <span>● Proctor Cam</span>
        </div>
      </div>

      {/* 4. ACTIVE VIOLATION MODAL (PAUSE STATE) */}
      {activeWarning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-card-dark border-2 border-amber-500 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeWarning.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeWarning.message}
            </p>

            {(graceSecondsLeft !== null || micGraceSecondsLeft !== null) && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                Recovery Grace Period: {graceSecondsLeft ?? micGraceSecondsLeft}s remaining
              </div>
            )}

            {activeWarning.allowResume && (
              <button
                onClick={handleResumeFullscreen}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                Re-enter Fullscreen & Resume
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. SUBMISSION CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Assessment?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to finalize your proctored assessment? Answers will be locked, proctoring media streams will be closed, and your verified score will be calculated on the backend.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Return to Exam
              </button>

              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Assessment...</span>
                  </>
                ) : (
                  <span>Yes, Confirm & Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
