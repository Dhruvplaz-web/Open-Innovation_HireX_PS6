/**
 * SkillBridge AI Proctoring Subsystem — Temporal Violation Engine (Phase 13 & 14)
 * Consumes raw computer vision signals, enforces temporal grace windows, applies hysteresis & cooldowns,
 * and manages event lifecycles (PENDING -> CONFIRMED -> ACTIVE -> ENDED).
 */

import {
  PROCTOR_CONFIG,
  ProctorConfig,
  ProctorEventType,
  ProctorViolationEvent,
  FrameDiagnosticResult,
  EventLifecycleState
} from './proctoringConfig';

interface OngoingSignalTrack {
  eventType: ProctorEventType;
  startedAt: number;
  lastSeenAt: number;
  highestConfidence: number;
  confirmed: boolean;
  eventRecord?: ProctorViolationEvent;
}

export interface EngineUpdateResult {
  activeSignals: string[];
  newlyConfirmedViolations: ProctorViolationEvent[];
  endedEvents: ProctorViolationEvent[];
  riskScore: number;
  integrityScore: number;
}

export class ProctoringViolationEngine {
  private config: ProctorConfig;
  private attemptId: string;
  private studentId: string;

  private ongoingTracks: Map<ProctorEventType, OngoingSignalTrack> = new Map();
  private eventCooldowns: Map<ProctorEventType, number> = new Map();
  private confirmedEvents: ProctorViolationEvent[] = [];

  constructor(attemptId: string, studentId: string = 'std_1', config: Partial<ProctorConfig> = {}) {
    this.attemptId = attemptId;
    this.studentId = studentId;
    this.config = { ...PROCTOR_CONFIG, ...config };
  }

  public setAttemptId(attemptId: string) {
    this.attemptId = attemptId;
  }

  public getConfirmedEvents(): ProctorViolationEvent[] {
    return [...this.confirmedEvents];
  }

  /**
   * Primary Signal Consumer
   * Process a single diagnostic frame and evaluate all temporal rules
   */
  public update(frame: FrameDiagnosticResult): EngineUpdateResult {
    const now = Date.now();
    const newlyConfirmed: ProctorViolationEvent[] = [];
    const endedEvents: ProctorViolationEvent[] = [];

    // 1. Evaluate Current Frame Conditions
    const currentConditions: Map<ProctorEventType, { active: boolean; confidence: number; message: string }> = new Map();

    // Condition 1: Face Missing
    const isMissing = !frame.faceDetected && !frame.isObstructed;
    currentConditions.set('FACE_MISSING', {
      active: isMissing,
      confidence: frame.primaryConfidence,
      message: 'Candidate face missing from camera view.'
    });

    // Condition 2: Multiple Faces
    const isMultiple = frame.faceDetected && frame.faceCount > 1;
    currentConditions.set('MULTIPLE_FACES', {
      active: isMultiple,
      confidence: 0.95,
      message: 'Multiple faces detected in candidate camera frame.'
    });

    // Condition 3: Identity Mismatch
    const isMismatch = frame.faceDetected && frame.identityConfidence < this.config.IDENTITY_CONFIDENCE_THRESHOLD;
    currentConditions.set('FACE_IDENTITY_MISMATCH', {
      active: isMismatch,
      confidence: 1.0 - frame.identityConfidence,
      message: 'Candidate face identity mismatch detected.'
    });

    // Condition 4: Mobile Phone Detected
    const isPhone = frame.phoneDetected && frame.phoneConfidence >= this.config.PHONE_DETECTION_CONFIDENCE;
    currentConditions.set('MOBILE_PHONE_DETECTED', {
      active: isPhone,
      confidence: frame.phoneConfidence,
      message: 'Mobile phone or unauthorized device detected in camera frame.'
    });

    // Condition 5: Sustained Head Turn
    const isHeadTurn = frame.faceDetected && (
      Math.abs(frame.yawDeg) > this.config.HEAD_YAW_THRESHOLD_DEG ||
      Math.abs(frame.pitchDeg) > this.config.HEAD_PITCH_THRESHOLD_DEG
    );
    currentConditions.set('SUSTAINED_HEAD_TURN', {
      active: isHeadTurn,
      confidence: 0.90,
      message: `Sustained head orientation deviation (${frame.headTurnDirection}).`
    });

    // Condition 6: Sustained Gaze Deviation
    const isGazeDev = frame.faceDetected && frame.gazeDirection !== 'CENTER' && frame.gazeDirection !== 'UNKNOWN';
    currentConditions.set('SUSTAINED_GAZE_DEVIATION', {
      active: isGazeDev,
      confidence: 0.88,
      message: `Sustained gaze deviation (${frame.gazeDirection}).`
    });

    // Condition 7: Camera Obstructed
    currentConditions.set('CAMERA_OBSTRUCTED', {
      active: frame.isObstructed,
      confidence: 0.98,
      message: 'Camera lens covered or severely obstructed.'
    });

    // Condition 8: Unexpected Audio Activity
    currentConditions.set('UNEXPECTED_AUDIO_ACTIVITY', {
      active: frame.hasAudioActivity,
      confidence: Math.min(1.0, frame.audioEnergy),
      message: 'High-energy audio activity detected.'
    });

    // 2. Temporal State Machine Processing across active conditions
    currentConditions.forEach((cond, eventType) => {
      const requiredDurationMs = this.getRequiredDuration(eventType);
      const track = this.ongoingTracks.get(eventType);

      if (cond.active) {
        if (!track) {
          // Start PENDING signal track
          this.ongoingTracks.set(eventType, {
            eventType,
            startedAt: now,
            lastSeenAt: now,
            highestConfidence: cond.confidence,
            confirmed: false
          });
        } else {
          // Update ongoing track
          track.lastSeenAt = now;
          if (cond.confidence > track.highestConfidence) {
            track.highestConfidence = cond.confidence;
          }

          const elapsed = now - track.startedAt;
          const cooldownExpiry = this.eventCooldowns.get(eventType) || 0;

          // Transition PENDING -> CONFIRMED & ACTIVE if duration threshold met & cooldown clear
          if (!track.confirmed && elapsed >= requiredDurationMs && now >= cooldownExpiry) {
            track.confirmed = true;
            
            const confirmedEvent: ProctorViolationEvent = {
              id: `evt_${now}_${Math.random().toString(36).substring(2, 8)}`,
              attemptId: this.attemptId,
              studentId: this.studentId,
              eventType,
              severity: this.getSeverity(eventType),
              confidence: track.highestConfidence,
              lifecycle: 'CONFIRMED',
              startedAt: track.startedAt,
              durationMs: elapsed,
              message: cond.message
            };

            track.eventRecord = confirmedEvent;
            this.confirmedEvents.push(confirmedEvent);
            newlyConfirmed.push(confirmedEvent);

            // Set cooldown
            this.eventCooldowns.set(eventType, now + this.config.EVENT_COOLDOWN_MS);
          } else if (track.confirmed && track.eventRecord) {
            // Update active duration
            track.eventRecord.durationMs = elapsed;
            track.eventRecord.lifecycle = 'ACTIVE';
          }
        }
      } else {
        // Condition no longer active -> End track if present
        if (track) {
          if (track.confirmed && track.eventRecord) {
            track.eventRecord.lifecycle = 'ENDED';
            track.eventRecord.endedAt = now;
            track.eventRecord.durationMs = now - track.startedAt;
            endedEvents.push(track.eventRecord);
          }
          this.ongoingTracks.delete(eventType);
        }
      }
    });

    // 3. Compute Analytical Risk Score (0-100)
    let totalRiskPoints = 0;
    const weights: Record<ProctorEventType, number> = {
      FACE_MISSING: 4,
      MULTIPLE_FACES: 8,
      FACE_IDENTITY_MISMATCH: 10,
      MOBILE_PHONE_DETECTED: 10,
      SUSTAINED_HEAD_TURN: 4,
      SUSTAINED_GAZE_DEVIATION: 4,
      CAMERA_OBSTRUCTED: 6,
      UNEXPECTED_AUDIO_ACTIVITY: 3,
      TAB_SWITCH: 5,
      WINDOW_BLUR: 3,
      FULLSCREEN_EXIT: 5,
      COPY_ATTEMPT: 4,
      PASTE_ATTEMPT: 4,
      CUT_ATTEMPT: 4,
      CONTEXT_MENU_ATTEMPT: 2
    };

    this.confirmedEvents.forEach((evt) => {
      totalRiskPoints += weights[evt.eventType] || 3;
    });

    const integrityScore = Math.max(0, Math.min(100, Math.round(100 - (totalRiskPoints * 3.5))));

    const activeSignals: string[] = [];
    this.ongoingTracks.forEach((tr, ev) => {
      if (tr.confirmed) {
        const dur = Math.round((now - tr.startedAt) / 1000);
        activeSignals.push(`${ev.replace(/_/g, ' ')} (${dur}s)`);
      }
    });

    return {
      activeSignals,
      newlyConfirmedViolations: newlyConfirmed,
      endedEvents,
      riskScore: totalRiskPoints,
      integrityScore
    };
  }

  /**
   * Process a discrete browser event (e.g. Tab Switch, Fullscreen Exit, Copy/Paste)
   */
  public recordDiscreteEvent(
    eventType: ProctorEventType,
    message?: string
  ): ProctorViolationEvent | null {
    const now = Date.now();
    const cooldownExpiry = this.eventCooldowns.get(eventType) || 0;

    if (now < cooldownExpiry) {
      // Ignore rapid repeated browser signal
      return null;
    }

    const messages: Partial<Record<ProctorEventType, string>> = {
      TAB_SWITCH: 'Switched browser tab or minimized window.',
      WINDOW_BLUR: 'Browser window lost focus.',
      FULLSCREEN_EXIT: 'Exited secure full-screen mode.',
      COPY_ATTEMPT: 'Attempted to copy assessment text.',
      PASTE_ATTEMPT: 'Attempted to paste clipboard content.',
      CUT_ATTEMPT: 'Attempted to cut assessment content.',
      CONTEXT_MENU_ATTEMPT: 'Right-click context menu attempted.'
    };

    const confirmedEvent: ProctorViolationEvent = {
      id: `evt_${now}_${Math.random().toString(36).substring(2, 8)}`,
      attemptId: this.attemptId,
      studentId: this.studentId,
      eventType,
      severity: (eventType === 'TAB_SWITCH' || eventType === 'FULLSCREEN_EXIT') ? 'HIGH' : 'WARNING',
      confidence: 1.0,
      lifecycle: 'CONFIRMED',
      startedAt: now,
      endedAt: now,
      durationMs: 1000,
      message: message || messages[eventType] || 'Browser policy violation detected.'
    };

    this.confirmedEvents.push(confirmedEvent);
    this.eventCooldowns.set(eventType, now + this.config.EVENT_COOLDOWN_MS);

    return confirmedEvent;
  }

  private getRequiredDuration(eventType: ProctorEventType): number {
    switch (eventType) {
      case 'FACE_MISSING': return this.config.FACE_MISSING_GRACE_MS;
      case 'MULTIPLE_FACES': return this.config.MULTIPLE_FACE_GRACE_MS;
      case 'MOBILE_PHONE_DETECTED': return this.config.PHONE_DETECTION_DURATION_MS;
      case 'SUSTAINED_HEAD_TURN': return this.config.HEAD_TURN_DURATION_MS;
      case 'SUSTAINED_GAZE_DEVIATION': return this.config.GAZE_DEVIATION_DURATION_MS;
      case 'CAMERA_OBSTRUCTED': return this.config.CAMERA_OBSTRUCTION_DURATION_MS;
      case 'FACE_IDENTITY_MISMATCH': return this.config.IDENTITY_MISMATCH_DURATION_MS;
      case 'UNEXPECTED_AUDIO_ACTIVITY': return this.config.AUDIO_DURATION_MS;
      default: return 1000;
    }
  }

  private getSeverity(eventType: ProctorEventType): 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL' {
    switch (eventType) {
      case 'MOBILE_PHONE_DETECTED':
      case 'MULTIPLE_FACES':
      case 'FACE_IDENTITY_MISMATCH':
        return 'HIGH';
      case 'FACE_MISSING':
      case 'CAMERA_OBSTRUCTED':
      case 'SUSTAINED_HEAD_TURN':
      case 'SUSTAINED_GAZE_DEVIATION':
        return 'WARNING';
      default:
        return 'INFO';
    }
  }

  public reset() {
    this.ongoingTracks.clear();
    this.eventCooldowns.clear();
    this.confirmedEvents = [];
  }
}
