import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  Camera,
  Mic,
  Maximize2,
  AlertOctagon,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Sparkles,
  UserCheck,
  UserX,
  Volume2
} from 'lucide-react';

interface ProctoringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  testTitle?: string;
  durationMinutes?: number;
}

export const ProctoringRulesModal: React.FC<ProctoringRulesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  testTitle,
  durationMinutes = 20
}) => {
  const resolvedTitle = title || testTitle || 'Institutional Assessment';
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [isCheckingDevices, setIsCheckingDevices] = useState<boolean>(false);
  const [deviceError, setDeviceError] = useState<string>('');
  const [acknowledgedRules, setAcknowledgedRules] = useState<boolean>(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Initialize and check media devices when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
        setPreviewStream(null);
      }
      return;
    }

    const testDevices = async () => {
      setIsCheckingDevices(true);
      setDeviceError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });
        setPreviewStream(stream);
        setHasCameraPermission(true);
        setHasMicPermission(true);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        setDeviceError(err.message || 'Camera or microphone access denied. Proctoring requires hardware permission.');
        setHasCameraPermission(false);
        setHasMicPermission(false);
      } finally {
        setIsCheckingDevices(false);
      }
    };

    testDevices();

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (previewStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = previewStream;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [previewStream]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(t => t.stop());
      setPreviewStream(null);
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Mandatory AI Proctoring &amp; Assessment Rules</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                  3-Strike Enforced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {resolvedTitle} &bull; {durationMinutes} Minutes &bull; Strict Credential Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Hardware & Live Feed Pre-Check Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Live Camera &amp; Telemetry Pre-Check
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${hasCameraPermission ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hasCameraPermission ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  Webcam
                </span>
                <span className={`flex items-center gap-1 ${hasMicPermission ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hasMicPermission ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  Microphone
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-40 h-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center flex-shrink-0">
                <video
                  ref={videoPreviewRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${hasCameraPermission ? 'block' : 'hidden'}`}
                />
                {!hasCameraPermission && (
                  <div className="text-center p-2 text-slate-500">
                    <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] block leading-tight">No Camera Feed</span>
                  </div>
                )}
                {hasCameraPermission && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1.5 flex-1">
                <p className="text-slate-300 font-medium">Position your face clearly within the frame.</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Lighting must clearly illuminate your face without backlight glare. Ensure no other persons or devices are visible in your webcam background.
                </p>
                {deviceError && (
                  <p className="text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded border border-rose-500/20">
                    {deviceError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 4 Strict Proctoring Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Examination Integrity Code &bull; 4 Golden Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="flex items-center gap-2 mb-1.5 text-indigo-400 font-semibold">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  1. Face Presence &amp; Centering
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Continuous webcam tracking verifies single-candidate attendance. Looking away or leaving the frame incurs a warning strike.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-semibold">
                  <UserX className="w-4 h-4 text-amber-400" />
                  2. No Secondary Persons
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Multiple faces detected in the camera frame immediately generates a High-Severity strike warning.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-semibold">
                  <Maximize2 className="w-4 h-4 text-cyan-400" />
                  3. Fullscreen &amp; Browser Lock
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Tab switching, exiting fullscreen, minimizing the browser, or dual-monitor departure triggers an immediate violation strike.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="flex items-center gap-2 mb-1.5 text-rose-400 font-semibold">
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  4. Audio Environment Analysis
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Real-time microphone RMS detector monitors noise. Multi-speaker conversation or speech assistance is logged as a violation.
                </p>
              </div>
            </div>
          </div>

          {/* 3-Strike Dismissal Alert Callout */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-rose-200">
                Authoritative 3-Strike Session Termination Policy:
              </span>
              <span className="text-rose-300/90 text-[11px] block mt-0.5">
                <strong>Strike 1:</strong> First Audible &amp; Visual Warning &bull; 
                <strong> Strike 2:</strong> Final Escalated Warning &bull; 
                <strong> Strike 3:</strong> Immediate Assessment Dismissal &amp; Attempt Locked.
              </span>
            </div>
          </div>

          {/* Explicit Permission & Consent Agreement */}
          <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledgedRules}
                onChange={(e) => setAcknowledgedRules(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I hereby grant permission for live AI webcam &amp; audio proctoring. I understand and agree that this assessment is strictly monitored and will be dismissed upon 3 infractions.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel &amp; Return
          </button>

          <button
            type="button"
            disabled={!hasCameraPermission || !acknowledgedRules}
            onClick={handleProceed}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
              hasCameraPermission && acknowledgedRules
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Enter Proctored Assessment (Lock Screen)
          </button>
        </div>
      </div>
    </div>
  );
};
