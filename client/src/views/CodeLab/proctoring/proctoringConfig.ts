/**
 * SkillBridge AI Proctoring Subsystem — Production Configuration & Types
 */

export interface ProctorConfig {
  FACE_CONFIDENCE_THRESHOLD: number;
  FACE_MISSING_GRACE_MS: number;
  MULTIPLE_FACE_GRACE_MS: number;
  PHONE_DETECTION_CONFIDENCE: number;
  PHONE_DETECTION_DURATION_MS: number;
  HEAD_YAW_THRESHOLD_DEG: number;
  HEAD_PITCH_THRESHOLD_DEG: number;
  HEAD_TURN_DURATION_MS: number;
  GAZE_DEVIATION_THRESHOLD: number;
  GAZE_DEVIATION_DURATION_MS: number;
  AUDIO_ENERGY_THRESHOLD: number;
  AUDIO_DURATION_MS: number;
  EVENT_COOLDOWN_MS: number;
  MAX_VIOLATIONS: number;
  INFERENCE_INTERVAL_MS: number;
  CAMERA_OBSTRUCTION_LUMINANCE_MIN: number;
  CAMERA_OBSTRUCTION_DURATION_MS: number;
  IDENTITY_CONFIDENCE_THRESHOLD: number;
  IDENTITY_MISMATCH_DURATION_MS: number;
}

export const PROCTOR_CONFIG: ProctorConfig = {
  FACE_CONFIDENCE_THRESHOLD: 0.70,
  FACE_MISSING_GRACE_MS: 2000,
  MULTIPLE_FACE_GRACE_MS: 1000,
  PHONE_DETECTION_CONFIDENCE: 0.70,
  PHONE_DETECTION_DURATION_MS: 1000,
  HEAD_YAW_THRESHOLD_DEG: 24.0,
  HEAD_PITCH_THRESHOLD_DEG: 20.0,
  HEAD_TURN_DURATION_MS: 2500,
  GAZE_DEVIATION_THRESHOLD: 0.38,
  GAZE_DEVIATION_DURATION_MS: 2500,
  AUDIO_ENERGY_THRESHOLD: 0.65,
  AUDIO_DURATION_MS: 3000,
  EVENT_COOLDOWN_MS: 5000,
  MAX_VIOLATIONS: 3,
  INFERENCE_INTERVAL_MS: 150,
  CAMERA_OBSTRUCTION_LUMINANCE_MIN: 12,
  CAMERA_OBSTRUCTION_DURATION_MS: 3000,
  IDENTITY_CONFIDENCE_THRESHOLD: 0.75,
  IDENTITY_MISMATCH_DURATION_MS: 3000
};

export type ProctoringStatus =
  | 'IDLE'
  | 'PRECHECK'
  | 'READY'
  | 'ACTIVE'
  | 'WARNING'
  | 'DISMISSED'
  | 'COMPLETED'
  | 'ERROR';

export type AssessmentMode = 'NORMAL' | 'PROCTORED';

export type ProctorEventType =
  | 'FACE_MISSING'
  | 'MULTIPLE_FACES'
  | 'FACE_IDENTITY_MISMATCH'
  | 'MOBILE_PHONE_DETECTED'
  | 'SUSTAINED_HEAD_TURN'
  | 'SUSTAINED_GAZE_DEVIATION'
  | 'CAMERA_OBSTRUCTED'
  | 'UNEXPECTED_AUDIO_ACTIVITY'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'CUT_ATTEMPT'
  | 'CONTEXT_MENU_ATTEMPT';

export type EventLifecycleState = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'ENDED';

export interface ProctorViolationEvent {
  id: string;
  attemptId: string;
  studentId: string;
  eventType: ProctorEventType;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  confidence: number;
  lifecycle: EventLifecycleState;
  startedAt: number;
  endedAt?: number;
  durationMs: number;
  metadata?: Record<string, any>;
  message: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  confidence?: number;
}

export interface FrameDiagnosticResult {
  timestamp: number;
  faceDetected: boolean;
  faceCount: number;
  faceConfidence: number;
  isObstructed: boolean;
  phoneDetected: boolean;
  phoneConfidence: number;
  phoneBoundingBox?: BoundingBox;
  faceBoxes?: BoundingBox[];
  yawDeg: number;
  pitchDeg: number;
  rollDeg: number;
  ear: number;
  isBlinking: boolean;
  gazeDeviation: number;
  gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'UNKNOWN';
  headTurnDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  primaryConfidence: number;
  identityConfidence: number;
  audioEnergy: number;
  hasAudioActivity: boolean;
  centroidX?: number;
  centroidY?: number;
}

export interface PrecheckDiagnosticResult {
  mediaStreamOk: boolean;
  videoTrackLive: boolean;
  audioTrackLive: boolean;
  faceModelReady: boolean;
  objectModelReady: boolean;
  faceCount: number;
  faceConfidence: number;
  passed: boolean;
  errorReason?: string;
}

export interface ProctoringSummary {
  status: ProctoringStatus;
  violationCount: number;
  maxViolations: number;
  remainingViolations: number;
  riskScore: number;
  integrityScore: number;
  activeSignals: string[];
  events: ProctorViolationEvent[];
  latestFrame: FrameDiagnosticResult | null;
  lastViolation: ProctorViolationEvent | null;
}

