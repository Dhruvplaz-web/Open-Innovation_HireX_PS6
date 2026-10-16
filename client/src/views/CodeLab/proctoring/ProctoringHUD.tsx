import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Camera,
  CameraOff,
  Mic,
  Maximize2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  Lock,
  RotateCcw
} from 'lucide-react';
import { IntelligentProctoringEngine } from './proctoringEngine';
import {
  ProctorViolationEvent,
  ProctoringStatus,
  PROCTOR_CONFIG
} from './proctoringConfig';
import { codeLabApi, apiService } from '../codeLabApi';

interface ProctoringHUDProps {
  isActive: boolean;
  attemptId: string;
  studentId?: string;
  strikeCount: number;
  onStrikeAdded?: (newCount: number, reason: string) => void;
  onDismissed?: (reason: string) => void;
  compact?: boolean;
}

export const ProctoringHUD: React.FC<ProctoringHUDProps> = ({
  isActive,
  attemptId,
  studentId = 'std_1',
  strikeCount,
  onStrikeAdded,
  onDismissed,
  compact = false
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(compact);
  const [proctorStatus, setProctorStatus] = useState<ProctoringStatus>('READY');
  const [audioLevel, setAudioLevel] = useState<number>(12);
  const [lastWarningMsg, setLastWarningMsg] = useState<string>('');
  const [showWarningBanner, setShowWarningBanner] = useState<boolean>(false);
  const [isFaceInFrame, setIsFaceInFrame] = useState<boolean>(true);
  const [faceCount, setFaceCount] = useState<number>(1);
  const [isDismissed, setIsDismissed] = useState<boolean>(strikeCount >= 3);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<IntelligentProctoringEngine | null>(null);
  const analysisIntervalRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Synchronize strikeCount prop
  useEffect(() => {
    if (strikeCount >= 3) {
      setIsDismissed(true);
      onDismissed?.('Maximum proctoring violations reached (3/3 strikes).');
    }
  }, [strikeCount, onDismissed]);

  // Handle reporting event to backend & UI notification
  const handleViolationDetected = useCallback(async (event: ProctorViolationEvent) => {
    // Show instant warning banner
    setLastWarningMsg(event.message || `Proctoring Infraction: ${event.eventType}`);
    setShowWarningBanner(true);
    setTimeout(() => {
      setShowWarningBanner(false);
    }, 6000);

    // Report to backend authoritative proctoring endpoint
    try {
      const res = await codeLabApi.reportProctoringEvent(attemptId, {
        studentId,
        eventType: event.eventType,
        severity: event.severity,
        confidence: event.confidence,
        timestamp: new Date().toISOString(),
        message: event.message
      });

      if (res) {
        const serverViolations = res.violationCount !== undefined ? res.violationCount : strikeCount + 1;
        onStrikeAdded?.(serverViolations, event.message || event.eventType);

        if (res.isDismissed || serverViolations >= 3) {
          setIsDismissed(true);
          onDismissed?.(event.message || 'Session dismissed for excessive proctoring violations.');
        }
      }
    } catch (e) {
      // Local fallback strike count increment
      const localNewStrikes = strikeCount + 1;
      onStrikeAdded?.(localNewStrikes, event.message || event.eventType);
      if (localNewStrikes >= 3) {
        setIsDismissed(true);
        onDismissed?.('Proctoring violation limit reached.');
      }
    }
  }, [attemptId, studentId, strikeCount, onStrikeAdded, onDismissed]);

  // Initialize Proctoring Engine when active
  useEffect(() => {
    if (!isActive) return;

    const engine = new IntelligentProctoringEngine(
      attemptId,
      studentId,
      PROCTOR_CONFIG,
      (evt: ProctorViolationEvent) => {
        handleViolationDetected(evt);
      }
    );
    engine.stateMachine.transitionTo('ACTIVE');
    engineRef.current = engine;

    // Start Webcam Feed
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: true
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        handleViolationDetected({
          id: `evt_cam_${Date.now()}`,
          attemptId,
          studentId,
          eventType: 'CAMERA_OBSTRUCTED',
          severity: 'CRITICAL',
          confidence: 1.0,
          lifecycle: 'CONFIRMED',
          startedAt: Date.now(),
          durationMs: 0,
          message: 'Webcam feed disconnected or access blocked during proctored assessment.'
        });
      });

    // Frame Analysis Loop
    analysisIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && engineRef.current) {
        const frameAnalysis = engineRef.current.analyzeVideoFrame(videoRef.current, canvasRef.current);
        if (frameAnalysis) {
          setIsFaceInFrame(frameAnalysis.faceCount === 1);
          setFaceCount(frameAnalysis.faceCount);
        }
      }
    }, 400);

    // Audio Level Simulation / RMS poll
    audioIntervalRef.current = setInterval(() => {
      setAudioLevel(Math.floor(10 + Math.random() * 25));
    }, 500);

    // Fullscreen Departure & Tab Visibility Listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolationDetected({
          id: `evt_tab_${Date.now()}`,
          attemptId,
          studentId,
          eventType: 'TAB_SWITCH',
          severity: 'HIGH',
          confidence: 1.0,
          lifecycle: 'CONFIRMED',
          startedAt: Date.now(),
          durationMs: 1500,
          message: 'Tab switch or window minimization detected! Screen departure logged.'
        });
      }
    };

    const handleWindowBlur = () => {
      handleViolationDetected({
        id: `evt_blur_${Date.now()}`,
        attemptId,
        studentId,
        eventType: 'WINDOW_BLUR',
        severity: 'HIGH',
        confidence: 0.95,
        lifecycle: 'CONFIRMED',
        startedAt: Date.now(),
        durationMs: 1000,
        message: 'Browser lost focus. Multi-monitor or secondary window focus detected.'
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (engineRef.current) engineRef.current.stop();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isActive, handleViolationDetected]);

  if (!isActive) return null;

  return (
    <>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} width={160} height={120} className="hidden" />

      {/* Floating Proctoring HUD PIP Widget */}
      <div className="fixed top-20 right-5 z-40 animate-fadeIn">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 w-64">
          {/* Header Bar */}
          <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-wide uppercase flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                AI Proctor HUD
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Strikes Indicator Pill */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${
                  strikeCount === 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : strikeCount === 1
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-bounce'
                }`}
              >
                {strikeCount} / 3 Strikes
              </span>
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand HUD' : 'Collapse HUD'}
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Video & Telemetry Body */}
          {!isMinimized && (
            <div className="p-3 space-y-2.5">
              {/* Webcam PIP Container with Face Overlay Border */}
              <div
                className={`relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden border-2 transition-colors ${
                  faceCount === 1
                    ? 'border-emerald-500/50 shadow-emerald-500/10'
                    : 'border-rose-500/80 shadow-rose-500/20'
                }`}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Face Status Tag */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono font-medium flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      faceCount === 1 ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
                    }`}
                  />
                  <span className={faceCount === 1 ? 'text-emerald-300' : 'text-rose-300 font-bold'}>
                    {faceCount === 1 ? '1 Face Verified' : faceCount === 0 ? 'No Face Detected' : `${faceCount} Faces!`}
                  </span>
                </div>

                {/* Telemetry Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-slate-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span>30 FPS</span>
                </div>
              </div>

              {/* Live Signal Gauges */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mic className="w-3 h-3 text-indigo-400" />
                    Audio RMS
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">{audioLevel} dB</span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    Screen
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">Locked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Alert Banner Toast */}
      {showWarningBanner && !isDismissed && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-slideDown max-w-md w-full px-4">
          <div className="p-3.5 rounded-xl bg-amber-500/95 text-slate-950 font-medium text-xs shadow-2xl flex items-center gap-3 border border-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-slate-950" />
            <div className="flex-1">
              <span className="font-bold block uppercase tracking-wide text-[11px]">
                Proctoring Warning &bull; Strike {strikeCount} of 3
              </span>
              <span className="text-[11px] block text-slate-900">{lastWarningMsg}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Strike Dismissal Full-Screen Overlay */}
      {isDismissed && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-5 shadow-2xl shadow-rose-950/50">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-2">
                Session Terminated
              </span>
              <h2 className="text-xl font-bold text-white">Assessment Dismissed</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You have reached the limit of 3 proctoring infractions. To preserve corporate and academic accreditation standards, this session has been locked and flagged for review.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1">
              <div className="text-slate-400 text-[11px]">Audit Details:</div>
              <div className="text-slate-300 font-mono text-[11px]">Attempt ID: {attemptId}</div>
              <div className="text-rose-400 font-mono text-[11px]">Status: DISMISSED_FOR_PROCTORING</div>
              <div className="text-slate-400 text-[11px]">Violations Recorded: 3 / 3</div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Student Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};
