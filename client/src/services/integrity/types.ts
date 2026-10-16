/**
 * Assessment Integrity Engine - Types & Configuration
 * Privacy-conscious integrity monitoring specification
 */

export type IntegritySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type IntegrityStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'WARNING'
  | 'VALID'
  | 'FLAGGED_FOR_REVIEW'
  | 'DISQUALIFIED'
  | 'COMPLETED';

export type IntegrityEventType =
  | 'ASSESSMENT_STARTED'
  | 'CAMERA_CONNECTED'
  | 'CAMERA_INTERRUPTED'
  | 'CAMERA_DISCONNECTED'
  | 'CAMERA_OBSTRUCTED'
  | 'CAMERA_PERMISSION_REVOKED'
  | 'CAMERA_RESTORED'
  | 'MIC_CONNECTED'
  | 'MIC_INTERRUPTED'
  | 'MIC_DISCONNECTED'
  | 'MIC_PERMISSION_REVOKED'
  | 'MIC_ANOMALY'
  | 'MIC_RESTORED'
  | 'CANDIDATE_ABSENT'
  | 'CANDIDATE_RETURNED'
  | 'MULTIPLE_PERSONS_DETECTED'
  | 'PERSON_COUNT_NORMAL'
  | 'PHONE_DETECTED'
  | 'PHONE_REMOVED'
  | 'MULTIPLE_VOICES_DETECTED'
  | 'AUDIO_SPEECH_NORMAL'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'PAGE_HIDDEN'
  | 'PAGE_VISIBLE'
  | 'FULLSCREEN_ENTER'
  | 'FULLSCREEN_EXIT'
  | 'FULLSCREEN_RESTORED'
  | 'ASSESSMENT_SUBMITTED'
  | 'ASSESSMENT_DISQUALIFIED';

export interface IntegrityEvent {
  id: string;
  assessmentAttemptId: string;
  userId: string;
  eventType: IntegrityEventType;
  severity: IntegritySeverity;
  confidence: number; // 0.0 - 1.0
  durationSeconds?: number;
  timestamp: number; // epoch ms
  status: 'RECORDED' | 'DISMISSED' | 'VERIFIED' | 'FLAGGED';
  metadata?: Record<string, any>;
  message?: string;
  countedAsViolation?: boolean;
}

export interface IntegrityConfig {
  // Thresholds
  warningThreshold: number; // e.g. 1
  reviewThreshold: number; // e.g. 2
  disqualificationThreshold: number; // e.g. 3
  
  // Persistence & Grace Periods
  absenceGracePeriodSeconds: number; // e.g. 6.0
  multiplePersonPersistenceSeconds: number; // e.g. 3.0
  phonePersistenceSeconds: number; // e.g. 2.0
  audioVoicePersistenceSeconds: number; // e.g. 3.0
  cameraGracePeriodSeconds: number; // e.g. 15.0
  micGracePeriodSeconds: number; // e.g. 15.0
  fullscreenReentryGraceSeconds: number; // e.g. 10.0
  dedupWindowSeconds: number; // e.g. 2.0

  // Confidence Thresholds
  confidenceThreshold: number; // e.g. 0.70
  phoneConfidenceThreshold: number; // e.g. 0.75
  audioConfidenceThreshold: number; // e.g. 0.65

  // Module Feature Flags
  personDetectionEnabled: boolean;
  phoneDetectionEnabled: boolean;
  audioVoiceAnalysisEnabled: boolean;
  cameraObstructionEnabled: boolean;
  browserFocusMonitoringEnabled: boolean;
  fullscreenMonitoringEnabled: boolean;
}

export interface IntegritySessionSummary {
  assessmentId: string;
  studentId: string;
  integrityScore: number; // 0 - 100
  integrityStatus: IntegrityStatus;
  totalWarnings: number;
  totalViolations: number;
  categories: {
    camera: number;
    person: number;
    phone: number;
    audio: number;
    browser: number;
    fullscreen: number;
  };
  events: IntegrityEvent[];
  startedAt: number;
  lastEventAt?: number;
}

export interface DetectorState {
  camera: 'ACTIVE' | 'INTERRUPTED' | 'OBSTRUCTED' | 'DISCONNECTED';
  microphone: 'ACTIVE' | 'INTERRUPTED' | 'ANOMALY' | 'DISCONNECTED';
  person: 'NORMAL' | 'ABSENT' | 'MULTIPLE' | 'CHECKING';
  phone: 'NONE' | 'DETECTED' | 'CHECKING';
  audioVoice: 'NORMAL' | 'MULTIPLE_VOICES' | 'CHECKING';
  fullscreen: 'ACTIVE' | 'EXITED';
  browserFocus: 'FOCUSED' | 'BLURRED' | 'HIDDEN';
}
