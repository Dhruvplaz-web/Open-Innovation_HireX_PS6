/**
 * FullscreenMonitor - Browser Fullscreen API integrity monitor
 */
import { IntegrityConfig, IntegrityEvent } from './types';

export interface FullscreenMonitorCallbacks {
  onEvent: (event: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>) => void;
  onFullscreenChange: (isFullscreen: boolean) => void;
}

export class FullscreenMonitor {
  private config: IntegrityConfig;
  private callbacks: FullscreenMonitorCallbacks;
  private isRunning = false;

  private exitStart: number | null = null;
  private lastIncidentAt = 0;

  constructor(config: IntegrityConfig, callbacks: FullscreenMonitorCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  public setConfig(config: IntegrityConfig) {
    this.config = config;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.exitStart = null;

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);

    this.callbacks.onFullscreenChange(Boolean(document.fullscreenElement));
  }

  public stop() {
    this.isRunning = false;
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
  }

  public async requestFullscreen(): Promise<boolean> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      }
      return true;
    } catch {
      return false;
    }
  }

  private handleFullscreenChange = () => {
    if (!this.isRunning || !this.config.fullscreenMonitoringEnabled) return;
    const isFull = Boolean(document.fullscreenElement);
    const now = Date.now();

    this.callbacks.onFullscreenChange(isFull);

    if (!isFull) {
      this.exitStart = now;
      if (now - this.lastIncidentAt > this.config.dedupWindowSeconds * 1000) {
        this.lastIncidentAt = now;
        this.callbacks.onEvent({
          eventType: 'FULLSCREEN_EXIT',
          severity: 'MEDIUM',
          confidence: 1.0,
          timestamp: now,
          status: 'RECORDED',
          message: 'Fullscreen mode was exited. Examination environment must remain full screen.',
          metadata: { reEntryGraceSeconds: this.config.fullscreenReentryGraceSeconds }
        });
      }
    } else {
      if (this.exitStart) {
        const exitDuration = (now - this.exitStart) / 1000;
        this.callbacks.onEvent({
          eventType: 'FULLSCREEN_RESTORED',
          severity: 'LOW',
          confidence: 1.0,
          durationSeconds: Math.round(exitDuration),
          timestamp: now,
          status: 'RECORDED',
          message: `Fullscreen lock re-established after ${Math.round(exitDuration)}s.`
        });
        this.exitStart = null;
      }
    }
  };
}
