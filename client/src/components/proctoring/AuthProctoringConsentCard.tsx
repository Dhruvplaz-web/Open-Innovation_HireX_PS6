import React, { useState } from 'react';
import {
  Shield,
  Camera,
  Mic,
  Maximize2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  X
} from 'lucide-react';

interface AuthProctoringConsentCardProps {
  agreed: boolean;
  onToggle: (checked: boolean) => void;
  isDark?: boolean;
}

export const AuthProctoringConsentCard: React.FC<AuthProctoringConsentCardProps> = ({
  agreed,
  onToggle,
  isDark = true
}) => {
  const [showRulesInfoModal, setShowRulesInfoModal] = useState<boolean>(false);

  return (
    <>
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          agreed
            ? isDark
              ? 'bg-indigo-950/20 border-indigo-500/30 shadow-sm'
              : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
            : isDark
            ? 'bg-slate-900/40 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              agreed
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Proctoring &amp; Assessment Integrity Consent
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Required
              </span>
            </div>

            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              HireX requires <strong>camera and microphone permission</strong> to verify candidate identity and ensure 3-strike proctoring integrity across all corporate assessments.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-indigo-400" /> Webcam Verification
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-indigo-400" /> Audio Analysis
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" /> 3-Strike Rule
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRulesInfoModal(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer ml-auto"
              >
                View Rules
              </button>
            </div>

            <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => onToggle(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
              <span className={`text-xs font-medium ${agreed ? (isDark ? 'text-indigo-300' : 'text-indigo-700') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                I grant proctoring permission &amp; commit to the Integrity Code
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Rules Info Modal */}
      {showRulesInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">HireX Academic Integrity &amp; Proctoring Rules</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesInfoModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-0.5">1. Biometric Webcam Telemetry:</strong>
                Candidates must remain solo in the webcam frame throughout assessments. Gaze departure or absence generates violation flags.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-0.5">2. Secure Screen &amp; Focus Locking:</strong>
                Minimizing the window, switching tabs, or using external monitors triggers an instant strike.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-0.5">3. 3-Strike Immediate Dismissal:</strong>
                Any attempt accumulating 3 infractions is immediately terminated and marked DISMISSED_FOR_PROCTORING.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-0.5">4. In-Browser Privacy Protection:</strong>
                Neural inference executes client-side; raw video feeds are never shared with untrusted third parties.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onToggle(true);
                  setShowRulesInfoModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
