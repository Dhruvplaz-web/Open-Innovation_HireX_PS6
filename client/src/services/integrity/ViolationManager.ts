/**
 * ViolationManager - Centralized integrity event orchestrator and warning dispatcher
 */
import { IntegrityConfig, IntegrityEvent, IntegrityStatus } from './types';
import { IntegrityScoreCalculator } from './IntegrityScoreCalculator';

export interface ViolationManagerCallbacks {
  onWarning: (warning: { title: string; message: string; severity: string; type: string }) => void;
  onDisqualification: (reason: string) => void;
  onScoreUpdate: (score: number, status: IntegrityStatus, warnings: number, violations: number) => void;
  onEventRecorded: (event: IntegrityEvent) => void;
}

export class ViolationManager {
  private config: IntegrityConfig;
  private callbacks: ViolationManagerCallbacks;
  private assessmentId: string;
  private studentId: string;

  private events: IntegrityEvent[] = [];
  private isDisqualified = false;
  private disqualificationReason: string | null = null;

  constructor(
    assessmentId: string,
    studentId: string,
    config: IntegrityConfig,
    callbacks: ViolationManagerCallbacks
  ) {
    this.assessmentId = assessmentId;
    this.studentId = studentId;
    this.config = config;
    this.callbacks = callbacks;
  }

  public setConfig(config: IntegrityConfig) {
    this.config = config;
    this.recalculateScore();
  }

  public getEvents(): IntegrityEvent[] {
    return [...this.events];
  }

  public recordEvent(rawEvent: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>): IntegrityEvent {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEvent: IntegrityEvent = {
      ...rawEvent,
      id,
      assessmentAttemptId: this.assessmentId,
      userId: this.studentId,
      status: rawEvent.status || 'RECORDED',
      countedAsViolation: rawEvent.severity !== 'LOW'
    };

    this.events.push(fullEvent);
    this.callbacks.onEventRecorded(fullEvent);

    // Trigger user-facing warning
    if (fullEvent.severity === 'HIGH' || fullEvent.severity === 'MEDIUM') {
      this.callbacks.onWarning({
        title: this.getWarningTitle(fullEvent.eventType),
        message: fullEvent.message || 'Integrity anomaly recorded by monitoring engine.',
        severity: fullEvent.severity,
        type: fullEvent.eventType
      });
    }

    this.recalculateScore();
    return fullEvent;
  }

  public triggerDisqualification(reason: string) {
    if (this.isDisqualified) return;
    this.isDisqualified = true;
    this.disqualificationReason = reason;

    const disqEvent: IntegrityEvent = {
      id: `evt_disq_${Date.now()}`,
      assessmentAttemptId: this.assessmentId,
      userId: this.studentId,
      eventType: 'ASSESSMENT_DISQUALIFIED',
      severity: 'HIGH',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'VERIFIED',
      message: reason,
      countedAsViolation: true
    };
    this.events.push(disqEvent);
    this.callbacks.onEventRecorded(disqEvent);
    this.callbacks.onDisqualification(reason);
    this.recalculateScore();
  }

  public recalculateScore() {
    const report = IntegrityScoreCalculator.calculate(this.events, this.config, this.isDisqualified);

    // If report determined disqualification from cumulative thresholds
    if (report.status === 'DISQUALIFIED' && !this.isDisqualified) {
      this.isDisqualified = true;
      this.disqualificationReason = 'Integrity violation threshold exceeded during assessment.';
      this.callbacks.onDisqualification(this.disqualificationReason);
    }

    this.callbacks.onScoreUpdate(
      report.score,
      report.status,
      report.totalWarnings,
      report.totalViolations
    );

    return report;
  }

  private getWarningTitle(type: string): string {
    switch (type) {
      case 'MULTIPLE_PERSONS_DETECTED':
        return 'Multiple People in Camera View';
      case 'CANDIDATE_ABSENT':
        return 'Candidate Not Visible';
      case 'PHONE_DETECTED':
        return 'Secondary Device Detected';
      case 'MULTIPLE_VOICES_DETECTED':
        return 'Audio Anomaly Detected';
      case 'FULLSCREEN_EXIT':
        return 'Fullscreen Mode Exited';
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR':
        return 'Focus Lost / Tab Switch';
      case 'CAMERA_OBSTRUCTED':
        return 'Camera View Obstructed';
      default:
        return 'Assessment Integrity Notice';
    }
  }
}
