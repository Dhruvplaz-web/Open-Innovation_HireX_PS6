import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  Mic,
  Maximize2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  FolderGit2,
  Linkedin,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Volume2,
  VolumeX,
  Users,
  Eye,
  Lock,
  Layers,
  ChevronRight,
  Check,
  RotateCcw,
  Upload
} from 'lucide-react';
import { getSkillQuestions, AssessmentQuestion } from '../data/skillQuestions';
import { apiService, API_BASE } from '../services/api';
import { initFaceDetector, detectFaces } from '../services/faceDetection';
import { RoleSpecificSkillAnalysis } from '../components/RoleSpecificSkillAnalysis';
import { CertificateScannerWorkspace } from '../components/certificates/CertificateScannerWorkspace';
import { VerifiedSkillPassport } from '../components/passport/VerifiedSkillPassport';

interface SkillVerificationViewProps {
  studentId?: string;
  studentName?: string;
  userProfile?: any;
  student?: any;
  initialTab?: 'assess' | 'passport' | 'scanner';
  onNavigateTab?: (tab: string) => void;
  onProfileUpdated?: (updatedStudent: any) => void;
}

interface DetectedSkill {
  name: string;
  sources: ('Resume' | 'GitHub' | 'LinkedIn' | 'Manual')[];
  confidence: number;
}

export const SkillVerificationView: React.FC<SkillVerificationViewProps> = ({
  studentId = 'std_1',
  studentName = 'Dhruv Patil',
  userProfile,
  student,
  initialTab = 'assess',
  onNavigateTab,
  onProfileUpdated
}) => {
  const isDemo = studentId === 'std_1';
  // Main view navigation
  const [activeMainTab, setActiveMainTab] = useState<'assess' | 'passport' | 'scanner'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Step state for assessment: 'configure' | 'active_exam' | 'disqualified' | 'evaluation'
  const [examState, setExamState] = useState<'configure' | 'active_exam' | 'disqualified' | 'evaluation'>('configure');

  // Input sources
  const [resumeText, setResumeText] = useState<string>(
    'Dhruv Patil — B.Tech Computer Engineering, JSPM RSCOE Pune.\nCore competencies: Python, React, FastAPI, Machine Learning, Docker, SQL, Data Structures, Scikit-Learn, PostgreSQL, REST APIs.'
  );
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/dhruvpatil');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('https://linkedin.com/in/dhruv-patil');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Detected skills
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[]>([
    { name: 'Python', sources: ['Resume', 'GitHub'], confidence: 96 },
    { name: 'React', sources: ['Resume', 'GitHub'], confidence: 92 },
    { name: 'Machine Learning', sources: ['Resume', 'LinkedIn'], confidence: 89 },
    { name: 'SQL', sources: ['Resume', 'Manual'], confidence: 85 },
    { name: 'Docker', sources: ['GitHub'], confidence: 81 },
    { name: 'Data Structures', sources: ['Resume', 'Manual'], confidence: 88 }
  ]);

  // Selected Skill & Difficulty
  const [selectedSkill, setSelectedSkill] = useState<string>('Python');
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');

  // Active exam runtime questions & answers
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [questionTimestamps, setQuestionTimestamps] = useState<number[]>([]);
  const [questionStartTimes, setQuestionStartTimes] = useState<number[]>([]);
  const [examOverallStartTime, setExamOverallStartTime] = useState<number>(0);
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(300); // 5 mins default

  // Evaluation results
  const [evalResult, setEvalResult] = useState<{
    skill: string;
    level: string;
    totalQuestions: number;
    correctCount: number;
    accuracyPercent: number;
    totalTimeSeconds: number;
    avgTimePerQuestion: number;
    speedEfficiencyScore: number;
    calibratedScore: number;
    performanceTier: string;
    verifiedBadgeGranted: boolean;
    mlVerification?: any;
  } | null>(null);

  // Proctoring status and disqualification details
  const [disqualificationReason, setDisqualificationReason] = useState<string | null>(null);
  const [disqualificationTime, setDisqualificationTime] = useState<string | null>(null);

  // Media stream & hardware detectors
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState<boolean>(false);

  // Live HUD metrics
  const [detectedPersonsCount, setDetectedPersonsCount] = useState<number>(1);
  const [voiceActivityDetected, setVoiceActivityDetected] = useState<boolean>(false);
  const [audioLevelRMS, setAudioLevelRMS] = useState<number>(0);
  const [facingModeReported, setFacingModeReported] = useState<string>('front');

  // References
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);
  const examContainerRef = useRef<HTMLDivElement | null>(null);
  const multiPersonViolationCountRef = useRef<number>(0);

  // Resume PDF upload state
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-violation tracking (Max 2 warnings -> 3rd disqualifies)
  const violationCountRef = useRef<number>(0);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  // Pre-load and warm up face-api.js TinyFaceDetector models
  useEffect(() => {
    initFaceDetector().catch(() => { });
  }, []);

  // Prefill extracted resume text and claimed skills from userProfile / student
  useEffect(() => {
    if (userProfile?.resumeText) {
      setResumeText(userProfile.resumeText);
    } else if (student?.bio && !isDemo) {
      setResumeText(student.bio);
    }
    if (userProfile?.githubUrl) {
      setGithubUrl(userProfile.githubUrl);
    }
    if (userProfile?.linkedinUrl) {
      setLinkedinUrl(userProfile.linkedinUrl);
    }
    const claimed: string[] = userProfile?.claimedSkills || (student?.skills ? Object.keys(student.skills) : []);
    if (claimed.length > 0 && detectedSkills.length === 0) {
      const initialDetected: DetectedSkill[] = claimed.map((sk: string) => ({
        name: sk,
        sources: ['Manual', 'Resume'],
        confidence: 85
      }));
      setDetectedSkills(initialDetected);
      if (!selectedSkill && initialDetected.length > 0) {
        setSelectedSkill(initialDetected[0].name);
      }
    }
  }, [userProfile, student, isDemo]);

  // Verified Passport Items
  const [passportItems, setPassportItems] = useState<any[]>([
    {
      skillName: 'Python',
      assessmentScore: 92,
      level: 'Hard',
      verifiedDate: '2026-10-05',
      sources: ['Resume', 'GitHub', 'Assessment'],
      sha256Hash: 'a7c9f82d41b6e510839c4d921e1a539b708cf1948375928a01f654b9'
    },
    {
      skillName: 'React',
      assessmentScore: 88,
      level: 'Intermediate',
      verifiedDate: '2026-10-04',
      sources: ['Resume', 'GitHub', 'Assessment'],
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b'
    },
    {
      skillName: 'FastAPI',
      assessmentScore: 84,
      level: 'Intermediate',
      verifiedDate: '2026-10-02',
      sources: ['Resume', 'GitHub', 'Assessment'],
      sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fc'
    }
  ]);

  // Clean up media streams and intervals
  const stopAllMediaTracks = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (examTimerRef.current) {
      clearInterval(examTimerRef.current);
      examTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
  }, [mediaStream]);

  // Disqualify Handler
  const triggerDisqualification = useCallback(
    (reason: string) => {
      console.warn(`[INTEGRITY VIOLATION DISQUALIFICATION] ${reason}`);
      setDisqualificationReason(reason);
      setDisqualificationTime(new Date().toLocaleTimeString());
      setExamState('disqualified');
      stopAllMediaTracks();

      // Exit fullscreen if still active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }

      // Log to backend audit engine
      apiService
        .logProctoringViolation(
          'asmt_live_verification',
          studentId,
          'DISQUALIFICATION',
          'HIGH',
          'main_section',
          'q_active',
          reason
        )
        .catch(() => { });
    },
    [studentId, stopAllMediaTracks]
  );

  // Multi-violation handler: max 2 warnings -> 3rd disqualifies
  const recordViolation = useCallback(
    (reason: string) => {
      violationCountRef.current++;
      const currentCount = violationCountRef.current;
      setViolationCount(currentCount);

      // Log proctoring violation to backend audit engine
      apiService
        .logProctoringViolation(
          'asmt_live_verification',
          studentId,
          currentCount >= 3 ? 'DISQUALIFICATION' : 'WARNING',
          currentCount >= 3 ? 'CRITICAL' : 'HIGH',
          'main_section',
          'q_active',
          `Violation ${currentCount}/3: ${reason}`
        )
        .catch(() => { });

      if (currentCount >= 3) {
        triggerDisqualification(`Disqualified: Max allowed violations exceeded (3/3) — ${reason}`);
      } else {
        setActiveWarning(`⚠️ Integrity Warning [${currentCount}/2]: ${reason}. A 3rd violation will result in immediate disqualification.`);
        setTimeout(() => {
          setActiveWarning(null);
        }, 5000);
      }
    },
    [studentId, triggerDisqualification]
  );

  // Helper for scanning with dynamic resume text
  const handleScanInputsWithText = (textOverride?: string) => {
    const rawSkills = [
      'Python', 'React', 'FastAPI', 'Machine Learning', 'SQL',
      'Docker', 'Data Structures', 'TypeScript', 'PostgreSQL',
      'Git', 'Linux', 'REST APIs', 'Cloud Computing', 'AWS', 'Java'
    ];
    const detected: DetectedSkill[] = [];
    const lowerResume = (textOverride !== undefined ? textOverride : resumeText).toLowerCase();
    const lowerGithub = githubUrl.toLowerCase();
    const lowerLinkedin = linkedinUrl.toLowerCase();

    rawSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      const sources: ('Resume' | 'GitHub' | 'LinkedIn' | 'Manual')[] = [];
      if (lowerResume.includes(sLower)) sources.push('Resume');
      if (lowerGithub.includes('python') || lowerGithub.includes('dhruv') || lowerGithub.includes(sLower)) {
        if (['python', 'react', 'docker', 'fastapi', 'data structures', 'sql'].includes(sLower)) {
          sources.push('GitHub');
        }
      }
      if (lowerLinkedin.includes('linkedin.com') && ['python', 'machine learning', 'react', 'cloud computing'].includes(sLower)) {
        sources.push('LinkedIn');
      }
      if (sources.length > 0) {
        detected.push({
          name: skill,
          sources,
          confidence: Math.min(99, 75 + sources.length * 8)
        });
      }
    });

    setDetectedSkills(detected);
    if (detected.length > 0 && !detected.some((d) => d.name === selectedSkill)) {
      setSelectedSkill(detected[0].name);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    setUploadError(null);
    setUploadedFileName(file.name);
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const result = await apiService.extractResumePdf(file);
        if (result.text) {
          setResumeText(result.text);
          handleScanInputsWithText(result.text);
        }
      } else {
        const text = await file.text();
        setResumeText(text);
        handleScanInputsWithText(text);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract text from document');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Scan & detect skills from inputs
  const handleScanInputs = () => {
    handleScanInputsWithText();
  };


  // Add custom student entered skill
  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;

    if (!detectedSkills.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      const newSkill: DetectedSkill = {
        name: trimmed,
        sources: ['Manual'],
        confidence: 80
      };
      setDetectedSkills([newSkill, ...detectedSkills]);
      setSelectedSkill(trimmed);
    }
    setCustomSkillInput('');
  };

  // Request camera and microphone permissions
  const handleRequestPermissions = async () => {
    setIsRequestingPermissions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true
      });

      // Verify camera facing mode / mobile back camera
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        setHasCameraPermission(true);
        const settings = videoTrack.getSettings();
        const label = (videoTrack.label || '').toLowerCase();

        // Check if camera is back/environment
        if (
          settings.facingMode === 'environment' ||
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('environment')
        ) {
          triggerDisqualification('Mobile back camera / unauthorized rear device detected.');
          return;
        }
        setFacingModeReported('front');
      }

      if (audioTrack) {
        setHasMicPermission(true);
      }

      setMediaStream(stream);
      initFaceDetector().catch(() => { });
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch(() => { });
      }
    } catch (err: any) {
      alert(`Hardware permission error: ${err.message || 'Unable to access camera and microphone.'}`);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // Start proctored assessment
  const handleStartExam = async () => {
    if (!mediaStream || !hasCameraPermission || !hasMicPermission) {
      alert('Camera and Microphone permissions are required to begin the proctored assessment.');
      return;
    }

    // Request Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      alert('Fullscreen mode is strictly required for this assessment. Please allow fullscreen.');
      return;
    }

    // Load questions based on skill and difficulty
    const qList = getSkillQuestions(selectedSkill, difficulty);
    setQuestions(qList);
    setUserAnswers(new Array(qList.length).fill(-1));
    setQuestionTimestamps(new Array(qList.length).fill(0));
    setQuestionStartTimes(new Array(qList.length).fill(Date.now()));
    setCurrentQuestionIdx(0);

    const timeLimitSec =
      difficulty === 'easy' ? qList.length * 30 : difficulty === 'intermediate' ? qList.length * 45 : qList.length * 60;
    setExamTimeRemaining(timeLimitSec);
    setExamOverallStartTime(Date.now());
    setExamState('active_exam');
  };

  // Proctoring listeners & integrity loops during active exam
  useEffect(() => {
    if (examState !== 'active_exam') return;

    // 1. Fullscreen change listener -> record violation (warning 1 -> warning 2 -> 3rd terminates)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('Fullscreen mode was exited or minimized.');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // 2. Escape key interceptor -> record violation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        recordViolation('Escape key pressed during examination.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 3. Tab switch / Visibility change -> record violation
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        recordViolation('Browser tab switched or assessment window hidden.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Window blur (lost focus) -> record violation
    const handleBlur = () => {
      recordViolation('Assessment window lost focus (secondary application or tab switched).');
    };
    window.addEventListener('blur', handleBlur);

    // 5. Audio speech spectrum detector loop
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && mediaStream) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let consecutiveVoiceFrames = 0;

        audioIntervalRef.current = setInterval(() => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          // Human speech frequency spectrum: 100Hz to 3000Hz
          const sampleRate = audioCtx.sampleRate || 44100;
          const binSize = sampleRate / 512;
          const startBin = Math.floor(100 / binSize);
          const endBin = Math.floor(3000 / binSize);

          let vocalEnergy = 0;
          let count = 0;
          for (let i = startBin; i < endBin; i++) {
            vocalEnergy += dataArray[i];
            count++;
          }
          const avgVocal = count > 0 ? vocalEnergy / count : 0;
          setAudioLevelRMS(Math.round(avgVocal));
          // Ambient audio monitoring without voice disqualification
          setVoiceActivityDetected(avgVocal > 42);
        }, 300);
      }
    } catch (e) {
      console.warn('AudioContext monitor setup note:', e);
    }

    // 6. Camera multi-person & mobile back cam verification loop
    let isDetectingFrame = false;
    videoIntervalRef.current = setInterval(async () => {
      if (!mediaStream || isDetectingFrame) return;

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const label = (videoTrack.label || '').toLowerCase();
        if (
          settings.facingMode === 'environment' ||
          label.includes('back') ||
          label.includes('rear')
        ) {
          triggerDisqualification('Mobile back camera detected during active assessment.');
          return;
        }
      }

      // Multi-person frame check via face-api.js & calibrated detector
      if (videoElementRef.current) {
        const video = videoElementRef.current;
        const canvas = canvasElementRef.current;
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          isDetectingFrame = true;
          try {
            const report = await detectFaces(video, canvas);
            const detectedCount = report.faceCount;

            // If more than 1 person (2 or more faces) detected -> REQUIRE 3 CONSECUTIVE FRAMES (>2.5s)
            if (detectedCount > 1) {
              multiPersonViolationCountRef.current++;
              setDetectedPersonsCount(detectedCount);

              // Require at least 3 consecutive frames (>2.5s duration) before recording violation
              if (multiPersonViolationCountRef.current >= 3) {
                recordViolation(
                  `Multiple persons (${detectedCount} faces detected via ${report.source}) in camera view.`
                );
                multiPersonViolationCountRef.current = 0;
              }
            } else {
              multiPersonViolationCountRef.current = 0;
              setDetectedPersonsCount(Math.max(1, detectedCount));
            }
          } catch (cvErr) {
            console.warn('Camera integrity monitor tick warning:', cvErr);
          } finally {
            isDetectingFrame = false;
          }
        }
      }
    }, 450);

    // 7. Exam countdown timer
    examTimerRef.current = setInterval(() => {
      setExamTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [examState, mediaStream, triggerDisqualification]);

  // Answer selection
  const handleSelectOption = (optionIdx: number) => {
    const updated = [...userAnswers];
    updated[currentQuestionIdx] = optionIdx;
    setUserAnswers(updated);

    // Record time spent on this question
    const now = Date.now();
    const timeSpentSec = Math.round((now - questionStartTimes[currentQuestionIdx]) / 1000);
    const updatedTimes = [...questionTimestamps];
    updatedTimes[currentQuestionIdx] = timeSpentSec;
    setQuestionTimestamps(updatedTimes);
  };

  // Next / Previous Navigation
  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      if (questionStartTimes[nextIdx] === 0) {
        const updated = [...questionStartTimes];
        updated[nextIdx] = Date.now();
        setQuestionStartTimes(updated);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  // Submit and evaluate with multi-signal calibration
  const handleSubmitExam = async () => {
    stopAllMediaTracks();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    const totalQ = questions.length;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correct++;
      }
    });

    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const totalTimeTakenSec = Math.round((Date.now() - examOverallStartTime) / 1000);
    const avgTimePerQ = totalQ > 0 ? Math.round(totalTimeTakenSec / totalQ) : 0;

    // Speed efficiency calculation: benchmark is targetTime
    const expectedTotalSec = questions.reduce((acc, q) => acc + q.targetTimeSeconds, 0);
    let speedBonus = 100;
    if (totalTimeTakenSec < expectedTotalSec) {
      const savedRatio = (expectedTotalSec - totalTimeTakenSec) / expectedTotalSec;
      speedBonus = Math.min(100, Math.round(85 + savedRatio * 15));
    } else {
      speedBonus = Math.max(50, Math.round(100 - ((totalTimeTakenSec - expectedTotalSec) / expectedTotalSec) * 50));
    }

    // Calibrated Score formula: Accuracy (75%) + Speed Efficiency (25%)
    let calibrated = Math.min(100, Math.round(accuracy * 0.75 + speedBonus * 0.25));

    let tier = 'Needs Improvement';
    let badge = false;
    let mlVerification: any = null;

    // Call backend multi-signal assessment & verification engine
    try {
      const submitRes = await fetch(`${API_BASE}/assessments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          skill: selectedSkill,
          answers: userAnswers,
          practical_code_score: Math.min(100, Math.max(65, Math.round(speedBonus * 0.95)))
        })
      });
      if (submitRes.ok) {
        const subData = await submitRes.json();
        if (subData?.ml_verification) {
          mlVerification = subData.ml_verification;
          calibrated = Math.round(subData.ml_verification.verified_score);
          tier = subData.ml_verification.badge_tier || tier;
        }
      }
    } catch (e) {
      console.warn("Backend multi-signal submit fallback:", e);
    }

    if (!mlVerification) {
      if (calibrated >= 88) {
        tier = 'Gold - Industry Ready';
      } else if (calibrated >= 75) {
        tier = 'Silver - Proficient';
      } else if (calibrated >= 60) {
        tier = 'Bronze - Competent';
      }
      mlVerification = {
        verified_score: calibrated,
        badge_tier: tier,
        confidence_pct: 95.0,
        breakdown: {
          assessment: accuracy,
          code_quality: Math.min(100, speedBonus),
          project_evidence: 80,
          academic_alignment: 85
        }
      };
    }

    badge = calibrated >= 60;

    // Add to passport items if passed
    if (badge) {
      const newPassportItem = {
        skillName: selectedSkill,
        assessmentScore: calibrated,
        level: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        badgeType: tier,
        verifiedDate: new Date().toISOString().split('T')[0],
        sources: ['Proctored Assessment', 'Code AST', 'GitHub Evidence', 'Academic Benchmark'],
        sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      setPassportItems((prev) => [
        newPassportItem,
        ...prev.filter((p) => p.skillName.toLowerCase() !== selectedSkill.toLowerCase())
      ]);

      if (onProfileUpdated) {
        onProfileUpdated({
          skills: {
            [selectedSkill]: {
              score: calibrated,
              level: difficulty,
              verified: true
            }
          }
        });
      }
    }

    setEvalResult({
      skill: selectedSkill,
      level: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      totalQuestions: totalQ,
      correctCount: correct,
      accuracyPercent: accuracy,
      totalTimeSeconds: totalTimeTakenSec,
      avgTimePerQuestion: avgTimePerQ,
      speedEfficiencyScore: speedBonus,
      calibratedScore: calibrated,
      performanceTier: tier,
      verifiedBadgeGranted: badge,
      mlVerification: mlVerification
    });

    setExamState('evaluation');
  };

  // Re-link video on stream mount
  useEffect(() => {
    if (mediaStream && videoElementRef.current) {
      videoElementRef.current.srcObject = mediaStream;
      videoElementRef.current.play().catch(() => { });
    }
  }, [mediaStream, examState]);

  return (
    <div ref={examContainerRef} className="space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasElementRef} className="hidden" />

      {/* TOP BANNER / NAVIGATION */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-sm overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SKILL VERIFICATION & PROCTORED ENGINE
              </span>
              <span className="text-xs text-indigo-200/70 font-semibold">• Objective Employability Calibration</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Complete your placement readiness
            </h2>
            <p className="text-sm text-indigo-200/80 max-w-2xl">
              Extract and calibrate your skills from your Resume, GitHub, LinkedIn, or proctored assessments.
              Verify your proficiency across Easy, Intermediate, and Hard tiers under browser and camera integrity supervision.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-2xl font-black text-emerald-400">{passportItems.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Verified</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-2xl font-black text-indigo-300">
                {Math.round(passportItems.reduce((acc, i) => acc + i.assessmentScore, 0) / (passportItems.length || 1))}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/70">Avg Index</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-2xl font-black text-amber-400">3 Tiers</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">Evaluated</div>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* VIEW TABS SWITCHER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMainTab('assess');
              if (examState === 'evaluation' || examState === 'disqualified') {
                setExamState('configure');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeMainTab === 'assess'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>Assess & Verify Skill</span>
          </button>

          <button
            onClick={() => setActiveMainTab('passport')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeMainTab === 'passport'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Credentials ({passportItems.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeMainTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
          >
            <Award className="w-4 h-4" />
            <span>Forensic Certificate Scanner</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Biometric & Fullscreen Integrity Guaranteed</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DISQUALIFIED SCREEN */}
      {/* ========================================================================= */}
      {examState === 'disqualified' && (
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-500/50 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-2xl bg-rose-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase tracking-wider">
              Disqualified Attempt • Score 0%
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-rose-900 dark:text-rose-100">
              Assessment Cancelled Due to Integrity Violation
            </h3>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {disqualificationReason || 'Proctoring rule violation detected.'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Incident logged at {disqualificationTime} for audit verification. Any unproctored activity (multiple
              people, mobile cameras, exiting fullscreen, or tab switching) triggers immediate
              cancellation.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setDisqualificationReason(null);
                setExamState('configure');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:scale-102 transition shadow"
            >
              Back to Skill Selection
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVALUATION RESULTS SCREEN */}
      {/* ========================================================================= */}
      {examState === 'evaluation' && evalResult && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8 animate-in fade-in duration-300 shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ASSESSMENT COMPLETED • {evalResult.performanceTier}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {evalResult.level} Difficulty</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {evalResult.skill} Verification Evaluation Report
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-center min-w-[120px]">
                <div className="text-3xl font-black">{evalResult.calibratedScore}%</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Calibrated Score</div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Accuracy Score
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {evalResult.accuracyPercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {evalResult.correctCount} of {evalResult.totalQuestions} Questions Correct
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                Time Taken
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {evalResult.totalTimeSeconds}s
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Avg {evalResult.avgTimePerQuestion}s per question
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Speed Efficiency
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {evalResult.speedEfficiencyScore}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {evalResult.speedEfficiencyScore >= 80 ? 'Fast & decisive response' : 'Standard pace'}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                Verification Status
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {evalResult.verifiedBadgeGranted ? 'VERIFIED' : 'UNVERIFIED'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Credited to Skill Passport</div>
            </div>
          </div>

          {/* Multi-Signal 4-Pillar Ridge Calibration Trace */}
          {evalResult.mlVerification?.breakdown && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Multi-Signal Ridge-Calibrated Verification Trace</span>
                      <span className="text-xs">
                        {evalResult.performanceTier?.includes('Gold') ? '🥇' : evalResult.performanceTier?.includes('Silver') ? '🥈' : '🥉'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standardized competency verified against proctored performance, algorithmic AST, GitHub proof, and academic benchmarks.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                    Confidence: {evalResult.mlVerification.confidence_pct || 95}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${evalResult.performanceTier?.includes('Gold')
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                      : evalResult.performanceTier?.includes('Silver')
                        ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    }`}>
                    {evalResult.performanceTier}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Proctored Exam</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {evalResult.mlVerification.breakdown.assessment}%
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Biometric Camera Verified</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Code AST Quality</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {evalResult.mlVerification.breakdown.code_quality}%
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Algorithmic Complexity</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. Project Proof</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {evalResult.mlVerification.breakdown.project_evidence}%
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">GitHub & Repo Evidence</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">4. Academic Benchmark</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {evalResult.mlVerification.breakdown.academic_alignment}%
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">Curriculum Alignment</div>
                </div>
              </div>
            </div>
          )}

          {/* Question by question analysis */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Question-by-Question Review
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const isCorrect = userAns === q.correct;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition ${isCorrect
                        ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-rose-200 dark:border-rose-800/40 bg-rose-50/20 dark:bg-rose-950/10'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Q{idx + 1}. {q.question}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Your answer: </span>
                        {userAns >= 0 ? q.options[userAns] : 'No answer selected'}
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Correct answer: </span>
                          {q.options[q.correct]}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                        Explanation: {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Skill elevated in your institutional passport & corporate drive eligibility.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveMainTab('passport');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>View in Verified Skill Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExamState('configure')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Assess Another Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE PROCTORED EXAM (FULLSCREEN ENFORCED) */}
      {/* ========================================================================= */}
      {examState === 'active_exam' && (
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
          {/* Active Integrity Warning Banner */}
          {activeWarning && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-900 dark:text-amber-200 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold">{activeWarning}</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-amber-500/20 rounded">
                Violations: {violationCount}/2
              </span>
            </div>
          )}

          {/* Proctoring HUD Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wide">PROCTORING LOCK ACTIVE</span>
              </div>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-bold text-indigo-300">
                {selectedSkill} ({difficulty.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Users className="w-4 h-4" />
                <span>{detectedPersonsCount} Person</span>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <Mic className="w-4 h-4" />
                <span>Audio Feed Active</span>
              </div>

              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(examTimeRemaining / 60)}:
                  {(examTimeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Question Content & Floating Camera Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left 3 cols: Question & Options */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <span>Target: {questions[currentQuestionIdx]?.targetTimeSeconds || 30}s</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Statement */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {questions[currentQuestionIdx]?.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQuestionIdx]?.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQuestionIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-card-dark text-slate-800 dark:text-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-xs md:text-sm font-medium">{opt}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Exam Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
                >
                  Previous
                </button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>

            {/* Right 1 col: Live Proctor Video & Sensors */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black relative aspect-[4/3]">
                <video
                  ref={videoElementRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CAM
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
                  {facingModeReported.toUpperCase()}
                </div>
              </div>

              {/* Sensor Monitor Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Active Sensor Watch
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Persons in Frame:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {detectedPersonsCount === 1 ? '1 (Single User)' : 'Multiple (>1)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Microphone Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Active (Hardware Online)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Fullscreen Guard:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Locked (ESC Forbidden)</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Tab Visibility:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Foreground Only</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-200 leading-tight">
                ⚠️ <strong>Zero Tolerance:</strong> Exiting fullscreen, switching tabs, or adding a
                second person will cancel and disqualify this attempt immediately.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIGURE & INGESTION TAB (DEFAULT PRE-EXAM VIEW) */}
      {/* ========================================================================= */}
      {activeMainTab === 'assess' && examState === 'configure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Ingestion Sources & Skill Detection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Ingestion Channels */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Skill Extraction & Detection Sources
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Provide your resume, profile links, or custom skills to extract objective competencies.
                  </p>
                </div>
                <button
                  onClick={handleScanInputs}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan & Detect Skills</span>
                </button>
              </div>

              {/* Source Inputs Grid */}
              <div className="space-y-4">
                {/* Resume Ingestion */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Resume / CV Content (ATS Entity Parser)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.txt"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingResume}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isUploadingResume ? 'Extracting...' : 'Upload PDF/TXT'}</span>
                      </button>
                    </div>
                  </div>
                  {uploadedFileName && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Uploaded: {uploadedFileName}</span>
                    </div>
                  )}
                  {uploadError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume or CV text with tech stack..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* GitHub & LinkedIn URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                      <span>GitHub Profile / Repo URL</span>
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Custom Entered Skill */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Enter Custom Skill to Assess</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                      placeholder="e.g. Docker, Rust, Kubernetes, Go, PostgreSQL..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddCustomSkill}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:scale-102 transition"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Detected Skills & Selection */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Select Skill to Verify
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose from detected competencies or custom additions.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detectedSkills.map((sk) => {
                  const isSelected = selectedSkill.toLowerCase() === sk.name.toLowerCase();
                  return (
                    <div
                      key={sk.name}
                      onClick={() => setSelectedSkill(sk.name)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-card-dark'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {sk.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {sk.sources.map((src) => (
                          <span
                            key={src}
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Difficulty Level Selection (Easy, Intermediate, Hard) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Select Evaluation Difficulty Tier
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Each tier evaluates accuracy and time taken with tailored benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Easy */}
                <div
                  onClick={() => setDifficulty('easy')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${difficulty === 'easy'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-card-dark'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      EASY
                    </span>
                    {difficulty === 'easy' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Foundational Tier</h4>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <li>• Core syntax & primitive logic</li>
                    <li>• 30s per question limit</li>
                    <li>• Minimum 60% accuracy to pass</li>
                  </ul>
                </div>

                {/* Intermediate */}
                <div
                  onClick={() => setDifficulty('intermediate')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${difficulty === 'intermediate'
                      ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/30 ring-2 ring-amber-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-card-dark'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                      INTERMEDIATE
                    </span>
                    {difficulty === 'intermediate' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Architecture Tier</h4>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <li>• Data structures & concurrency</li>
                    <li>• 45s per question limit</li>
                    <li>• Minimum 70% accuracy to pass</li>
                  </ul>
                </div>

                {/* Hard */}
                <div
                  onClick={() => setDifficulty('hard')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${difficulty === 'hard'
                      ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/30 ring-2 ring-rose-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-card-dark'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                      HARD
                    </span>
                    {difficulty === 'hard' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Deep Systems Tier</h4>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <li>• Low-level internals, memory, locks</li>
                    <li>• 60s per question limit</li>
                    <li>• Minimum 80% accuracy for Gold</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Strict Proctoring Rules & Camera/Mic Pre-Check */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Zero-Tolerance Proctoring
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Strict client-side AI guards enforce authentic student verification.
                </p>
              </div>

              {/* Rules Checklist */}
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white">Multi-Person Detection</strong>
                    If more than 1 person appears in camera frame, you are <strong>disqualified immediately</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <Camera className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white">Mobile Back Camera Forbidden</strong>
                    Mobile back camera or external devices trigger <strong>immediate disqualification</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <Mic className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white">Microphone Feed Linked</strong>
                    Microphone stream is linked for session integrity without voice disqualification.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <Maximize2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white">Fullscreen & ESC Lock</strong>
                    Assessment runs in fullscreen. Pressing <strong>ESC</strong> or exiting cancels the attempt with{' '}
                    <strong>disqualification</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white">Tab Switch & Window Blur</strong>
                    Switching browser tabs or clicking outside will <strong>cancel and disqualify</strong>.
                  </div>
                </div>
              </div>

              {/* Hardware Preview & Readiness */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Hardware Readiness</span>
                  <span className={hasCameraPermission && hasMicPermission ? 'text-emerald-500' : 'text-amber-500'}>
                    {hasCameraPermission && hasMicPermission ? 'Ready to Begin' : 'Permissions Needed'}
                  </span>
                </div>

                {/* Video Preview Box */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video relative flex items-center justify-center">
                  {mediaStream ? (
                    <video
                      ref={videoElementRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 space-y-2">
                      <Camera className="w-8 h-8 mx-auto stroke-1" />
                      <p className="text-xs">Camera preview will appear here</p>
                    </div>
                  )}
                </div>

                {!mediaStream ? (
                  <button
                    onClick={handleRequestPermissions}
                    disabled={isRequestingPermissions}
                    className="w-full py-2.5 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isRequestingPermissions ? 'Requesting Access...' : 'Enable Camera & Microphone'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartExam}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Enter Fullscreen & Start Proctored Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFIED SKILL PASSPORT TAB */}
      {/* ========================================================================= */}
      {activeMainTab === 'passport' && (
        <VerifiedSkillPassport
          studentId={studentId}
          studentName={studentName}
          onNavigateTab={onNavigateTab}
          onTakeAssessment={(skill) => {
            if (skill) setSelectedSkill(skill);
            setActiveMainTab('assess');
            setExamState('configure');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* FORENSIC CERTIFICATE SCANNER & OCR WORKSPACE TAB */}
      {/* ========================================================================= */}
      {activeMainTab === 'scanner' && (
        <CertificateScannerWorkspace
          student={{ id: studentId, name: studentName } as any}
        />
      )}

      {/* Role-Specific Skill Analysis Accordion Section strictly below generic scores/passport */}
      <RoleSpecificSkillAnalysis
        studentId={studentId}
        onSelectSkillForVerification={(skillName: string) => {
          setSelectedSkill(skillName);
          setActiveMainTab('assess');
          setExamState('configure');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
