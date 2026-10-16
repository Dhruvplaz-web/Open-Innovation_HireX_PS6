/**
 * CameraMonitor - Real-time camera stream availability, freeze, and obstruction monitor
 */
import { IntegrityConfig, IntegrityEvent } from './types';

export interface CameraMonitorCallbacks {
  onEvent: (event: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>) => void;
  onStateChange: (state: 'ACTIVE' | 'INTERRUPTED' | 'OBSTRUCTED' | 'DISCONNECTED') => void;
}

export class CameraMonitor {
  private config: IntegrityConfig;
  private callbacks: CameraMonitorCallbacks;
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private isRunning = false;

  private obstructionFrames = 0;
  private lastState: 'ACTIVE' | 'INTERRUPTED' | 'OBSTRUCTED' | 'DISCONNECTED' = 'DISCONNECTED';

  constructor(config: IntegrityConfig, callbacks: CameraMonitorCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public setConfig(config: IntegrityConfig) {
    this.config = config;
  }

  public start(stream: MediaStream, videoEl?: HTMLVideoElement | null) {
    this.stream = stream;
    this.videoEl = videoEl || null;
    this.isRunning = true;
    this.obstructionFrames = 0;

    const track = stream.getVideoTracks()[0];
    if (track) {
      track.onended = () => this.handleTrackEnded();
      track.onmute = () => this.handleTrackMute();
      track.onunmute = () => this.handleTrackUnmute();

      this.updateState('ACTIVE');
      this.callbacks.onEvent({
        eventType: 'CAMERA_CONNECTED',
        severity: 'LOW',
        confidence: 1.0,
        timestamp: Date.now(),
        status: 'RECORDED',
        message: 'Camera stream successfully linked.'
      });
    } else {
      this.updateState('DISCONNECTED');
    }

    this.checkInterval = setInterval(() => this.inspectLivenessAndObstruction(), 1000);
  }

  public stop() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.stream = null;
    this.videoEl = null;
    this.updateState('DISCONNECTED');
  }

  private updateState(newState: 'ACTIVE' | 'INTERRUPTED' | 'OBSTRUCTED' | 'DISCONNECTED') {
    if (this.lastState !== newState) {
      this.lastState = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  private handleTrackEnded() {
    this.updateState('DISCONNECTED');
    this.callbacks.onEvent({
      eventType: 'CAMERA_DISCONNECTED',
      severity: 'HIGH',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Camera hardware track ended or was disconnected.'
    });
  }

  private handleTrackMute() {
    this.updateState('INTERRUPTED');
    this.callbacks.onEvent({
      eventType: 'CAMERA_INTERRUPTED',
      severity: 'LOW',
      confidence: 0.95,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Camera stream was muted by device or operating system.'
    });
  }

  private handleTrackUnmute() {
    this.updateState('ACTIVE');
    this.callbacks.onEvent({
      eventType: 'CAMERA_RESTORED',
      severity: 'LOW',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Camera stream unmuted and restored.'
    });
  }

  private inspectLivenessAndObstruction() {
    if (!this.isRunning || !this.stream) return;
    const track = this.stream.getVideoTracks()[0];

    if (!track || track.readyState !== 'live' || !track.enabled) {
      if (this.lastState !== 'DISCONNECTED' && this.lastState !== 'INTERRUPTED') {
        this.updateState('INTERRUPTED');
        this.callbacks.onEvent({
          eventType: 'CAMERA_INTERRUPTED',
          severity: 'MEDIUM',
          confidence: 0.95,
          timestamp: Date.now(),
          status: 'RECORDED',
          message: 'Camera video track is no longer live or enabled.'
        });
      }
      return;
    }

    // Inspect video element pixel frames for obstruction/darkness
    if (this.config.cameraObstructionEnabled && this.videoEl && this.videoEl.readyState >= 2 && this.ctx) {
      try {
        this.ctx.drawImage(this.videoEl, 0, 0, 160, 120);
        const imgData = this.ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        let totalBrightness = 0;
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          // luminance formula
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          totalBrightness += lum;
        }

        const avgBrightness = totalBrightness / totalPixels;

        // Extremely low brightness (< 6) indicates fully covered or obstructed lens
        if (avgBrightness < 6.0) {
          this.obstructionFrames += 1;
          if (this.obstructionFrames >= 4) {
            this.updateState('OBSTRUCTED');
            this.callbacks.onEvent({
              eventType: 'CAMERA_OBSTRUCTED',
              severity: 'LOW',
              confidence: 0.85,
              timestamp: Date.now(),
              status: 'RECORDED',
              message: 'Camera lens appears obstructed, pitch black, or covered.'
            });
          }
        } else {
          if (this.obstructionFrames >= 4 && this.lastState === 'OBSTRUCTED') {
            this.updateState('ACTIVE');
            this.callbacks.onEvent({
              eventType: 'CAMERA_RESTORED',
              severity: 'LOW',
              confidence: 1.0,
              timestamp: Date.now(),
              status: 'RECORDED',
              message: 'Camera view restored to normal illumination.'
            });
          }
          this.obstructionFrames = 0;
          if (this.lastState !== 'ACTIVE') {
            this.updateState('ACTIVE');
          }
        }
      } catch {
        // Video render cross-origin or canvas exception - ignore frame
      }
    }
  }
}
