import { IntegrityConfig } from './types';

export const DEFAULT_INTEGRITY_CONFIG: IntegrityConfig = {
  warningThreshold: 1,
  reviewThreshold: 2,
  disqualificationThreshold: 3,

  absenceGracePeriodSeconds: 6.0,
  multiplePersonPersistenceSeconds: 3.0,
  phonePersistenceSeconds: 2.0,
  audioVoicePersistenceSeconds: 3.0,
  cameraGracePeriodSeconds: 15.0,
  micGracePeriodSeconds: 15.0,
  fullscreenReentryGraceSeconds: 10.0,
  dedupWindowSeconds: 2.0,

  confidenceThreshold: 0.70,
  phoneConfidenceThreshold: 0.75,
  audioConfidenceThreshold: 0.65,

  personDetectionEnabled: true,
  phoneDetectionEnabled: true,
  audioVoiceAnalysisEnabled: true,
  cameraObstructionEnabled: true,
  browserFocusMonitoringEnabled: true,
  fullscreenMonitoringEnabled: true
};
