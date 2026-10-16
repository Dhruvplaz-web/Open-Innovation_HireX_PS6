/**
 * AssessmentIntegrityEngine - Master orchestrator for client-side assessment integrity monitoring
 * Unifies Camera, Person, Phone, Audio, Browser, and Fullscreen sub-monitors.
 */
import {
  IntegrityConfig,
  IntegrityEvent,
  IntegrityStatus,
  DetectorState
} from './types';
import { DEFAULT_INTEGRITY_CONFIG } from './config';
import { CameraMonitor } from './CameraMonitor';
import { PersonDetector } from './PersonDetector';
import { PhoneDetector } from './PhoneDetector';
import { AudioMonitor } from './AudioMonitor';
import { BrowserMonitor } from './BrowserMonitor';
import { FullscreenMonitor } from './FullscreenMonitor';
import { ViolationManager } from './ViolationManager';
import { IntegrityEventLogger } from './IntegrityEventLogger';

export interface IntegrityEngineListener {
  onScoreUpdate?: (score: number, status: IntegrityStatus, warnings: number, violations: number) => void;
  onWarning?: (warning: { title: string; message: string; severity: string; type: string }) => void;
  onDisqualification?: (reason: string) => void;
  onDetectorStateChange?: (state: DetectorState) => void;
  onEvent?: (event: IntegrityEvent) => void;
}

export class AssessmentIntegrityEngine {
  private config: IntegrityConfig;
  private assessmentId: string;
  private studentId: string;

  private cameraMonitor: CameraMonitor;
  private personDetector: PersonDetector;
  private phoneDetector: PhoneDetector;
  private audioMonitor: AudioMonitor;
  private browserMonitor: BrowserMonitor;
  private fullscreenMonitor: FullscreenMonitor;
  private violationManager: ViolationManager;
  private logger: IntegrityEventLogger;

  private listeners: IntegrityEngineListener[] = [];
  private detectorState: DetectorState = {
    camera: 'DISCONNECTED',
    microphone: 'DISCONNECTED',
    person: 'CHECKING',
    phone: 'NONE',
    audioVoice: 'NORMAL',
    fullscreen: 'EXITED',
    browserFocus: 'FOCUSED'
  };

  private isRunning = false;

  constructor(assessmentId: string, studentId: string, customConfig?: Partial<IntegrityConfig>) {
    this.assessmentId = assessmentId;
    this.studentId = studentId;
    this.config = { ...DEFAULT_INTEGRITY_CONFIG, ...customConfig };
    this.logger = new IntegrityEventLogger();

    // Violation Manager
    this.violationManager = new ViolationManager(assessmentId, studentId, this.config, {
      onWarning: (warning) => this.emitWarning(warning),
      onDisqualification: (reason) => this.emitDisqualification(reason),
      onScoreUpdate: (score, status, w, v) => this.emitScoreUpdate(score, status, w, v),
      onEventRecorded: (event) => {
        this.logger.logEvent(event);
        this.emitEvent(event);
      }
    });

    // Sub-monitors
    this.cameraMonitor = new CameraMonitor(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onStateChange: (state) => {
        this.detectorState.camera = state;
        this.emitDetectorState();
      }
    });

    this.personDetector = new PersonDetector(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onCountChange: (count) => {
        this.detectorState.person = count === 0 ? 'ABSENT' : count > 1 ? 'MULTIPLE' : 'NORMAL';
        this.emitDetectorState();
      }
    });

    this.phoneDetector = new PhoneDetector(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onDetectionStatus: (detected) => {
        this.detectorState.phone = detected ? 'DETECTED' : 'NONE';
        this.emitDetectorState();
      }
    });

    this.audioMonitor = new AudioMonitor(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onAudioStateChange: (state) => {
        this.detectorState.microphone = state;
        this.emitDetectorState();
      },
      onVoiceActivity: (_speaking, multipleVoices) => {
        this.detectorState.audioVoice = multipleVoices ? 'MULTIPLE_VOICES' : 'NORMAL';
        this.emitDetectorState();
      }
    });

    this.browserMonitor = new BrowserMonitor(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onFocusChange: (focus) => {
        this.detectorState.browserFocus = focus;
        this.emitDetectorState();
      }
    });

    this.fullscreenMonitor = new FullscreenMonitor(this.config, {
      onEvent: (ev) => this.violationManager.recordEvent(ev),
      onFullscreenChange: (isFull) => {
        this.detectorState.fullscreen = isFull ? 'ACTIVE' : 'EXITED';
        this.emitDetectorState();
      }
    });
  }

  public subscribe(listener: IntegrityEngineListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public start(stream: MediaStream, videoEl?: HTMLVideoElement | null) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.violationManager.recordEvent({
      eventType: 'ASSESSMENT_STARTED',
      severity: 'LOW',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Assessment integrity monitoring session initialized.'
    });

    this.cameraMonitor.start(stream, videoEl);
    this.audioMonitor.start(stream);
    this.browserMonitor.start();
    this.fullscreenMonitor.start();

    if (videoEl) {
      this.personDetector.start(videoEl);
      this.phoneDetector.start(videoEl);
    }
  }

  public attachVideoElement(videoEl: HTMLVideoElement) {
    if (this.isRunning) {
      this.personDetector.start(videoEl);
      this.phoneDetector.start(videoEl);
    }
  }

  public stop() {
    this.isRunning = false;
    this.cameraMonitor.stop();
    this.audioMonitor.stop();
    this.personDetector.stop();
    this.phoneDetector.stop();
    this.browserMonitor.stop();
    this.fullscreenMonitor.stop();
  }

  public async requestFullscreen(): Promise<boolean> {
    return this.fullscreenMonitor.requestFullscreen();
  }

  public getEvents(): IntegrityEvent[] {
    return this.violationManager.getEvents();
  }

  public getDetectorState(): DetectorState {
    return { ...this.detectorState };
  }

  public getReport() {
    return this.violationManager.recalculateScore();
  }

  private emitScoreUpdate(score: number, status: IntegrityStatus, w: number, v: number) {
    this.listeners.forEach(l => l.onScoreUpdate?.(score, status, w, v));
  }

  private emitWarning(warning: { title: string; message: string; severity: string; type: string }) {
    this.listeners.forEach(l => l.onWarning?.(warning));
  }

  private emitDisqualification(reason: string) {
    this.listeners.forEach(l => l.onDisqualification?.(reason));
  }

  private emitDetectorState() {
    const copy = { ...this.detectorState };
    this.listeners.forEach(l => l.onDetectorStateChange?.(copy));
  }

  private emitEvent(event: IntegrityEvent) {
    this.listeners.forEach(l => l.onEvent?.(event));
  }
}
