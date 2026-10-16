/**
 * BrowserMonitor - Window focus, tab visibility, and navigation attempt monitor
 */
import { IntegrityConfig, IntegrityEvent } from './types';

export interface BrowserMonitorCallbacks {
  onEvent: (event: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>) => void;
  onFocusChange: (state: 'FOCUSED' | 'BLURRED' | 'HIDDEN') => void;
}

export class BrowserMonitor {
  private config: IntegrityConfig;
  private callbacks: BrowserMonitorCallbacks;
  private isRunning = false;

  private lastIncidentAt = 0;
  private lastIncidentType = '';

  constructor(config: IntegrityConfig, callbacks: BrowserMonitorCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  public setConfig(config: IntegrityConfig) {
    this.config = config;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.callbacks.onFocusChange(document.hidden ? 'HIDDEN' : 'FOCUSED');
  }

  public stop() {
    this.isRunning = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  private handleVisibilityChange = () => {
    if (!this.isRunning || !this.config.browserFocusMonitoringEnabled) return;
    const now = Date.now();

    if (document.visibilityState === 'hidden') {
      this.callbacks.onFocusChange('HIDDEN');

      // Debounce focus shifts happening within dedup window
      if (now - this.lastIncidentAt > this.config.dedupWindowSeconds * 1000) {
        this.lastIncidentAt = now;
        this.lastIncidentType = 'TAB_SWITCH';

        this.callbacks.onEvent({
          eventType: 'TAB_SWITCH',
          severity: 'HIGH',
          confidence: 1.0,
          timestamp: now,
          status: 'RECORDED',
          message: 'Browser tab switched or assessment window hidden.',
          metadata: { visibilityState: 'hidden' }
        });
      }
    } else {
      this.callbacks.onFocusChange('FOCUSED');
      this.callbacks.onEvent({
        eventType: 'PAGE_VISIBLE',
        severity: 'LOW',
        confidence: 1.0,
        timestamp: now,
        status: 'RECORDED',
        message: 'Assessment window returned to foreground visibility.'
      });
    }
  };

  private handleBlur = () => {
    if (!this.isRunning || !this.config.browserFocusMonitoringEnabled) return;
    const now = Date.now();

    this.callbacks.onFocusChange('BLURRED');

    // Debounce blur if visibilitychange already fired for this same switch
    if (now - this.lastIncidentAt > this.config.dedupWindowSeconds * 1000) {
      this.lastIncidentAt = now;
      this.lastIncidentType = 'WINDOW_BLUR';

      this.callbacks.onEvent({
        eventType: 'WINDOW_BLUR',
        severity: 'MEDIUM',
        confidence: 0.95,
        timestamp: now,
        status: 'RECORDED',
        message: 'Assessment window lost operating system focus.',
        metadata: { blurEvent: true }
      });
    }
  };

  private handleFocus = () => {
    if (!this.isRunning) return;
    this.callbacks.onFocusChange('FOCUSED');
  };

  private handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!this.isRunning) return;
    e.preventDefault();
    e.returnValue = 'Assessment in progress. Exiting will be recorded as an integrity violation.';
    return e.returnValue;
  };
}
