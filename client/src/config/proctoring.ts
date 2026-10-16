import { ProctoringConfig } from '../types';

export const PROCTORING_CONFIG: ProctoringConfig = {
  maxTabSwitches: 1,            // 1 switch -> WARNING, 2nd -> DISQUALIFICATION
  maxFullscreenExits: 1,        // 1 exit -> WARNING, 2nd -> DISQUALIFICATION
  maxCameraInterruptions: 1,    // 1 camera disruption allowed within grace period
  maxMicrophoneInterruptions: 1,// 1 mic disruption allowed within grace period
  gracePeriodSeconds: 15,       // 15 seconds grace period to restore video/audio
  autoSaveIntervalSeconds: 5,   // Save answers every 5 seconds
  maxAllowedViolations: 1,      // 1 warning permitted, 2nd violation automatically disqualifies
};

export const PROCTORING_MESSAGES = {
  fullscreenRequired: "Fullscreen mode is required for this proctored assessment.",
  fullscreenExitWarning: "Fullscreen mode was exited. This event has been recorded as a proctoring violation.",
  tabSwitchWarning: "Assessment page was left. This activity has been recorded as a proctoring violation.",
  cameraInterrupted: "Camera connection was interrupted. Please ensure your camera is connected and not blocked.",
  micInterrupted: "Microphone connection was interrupted. Please ensure your microphone is active.",
  networkInterrupted: "Connection interrupted. Your assessment state is being preserved.",
  disqualifiedTitle: "ASSESSMENT DISQUALIFIED",
  disqualifiedNotice: "Your assessment attempt was disqualified due to a proctoring violation.",
  validScoreUnavailable: "Valid Score: Not Available",
  cheatingDisclaimer: "Proctored assessment session. Anti-malpractice telemetry monitors camera status, microphone availability, fullscreen locks, and tab switches according to the institutional assessment policy."
};
