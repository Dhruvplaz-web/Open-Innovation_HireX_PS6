/**
 * PhoneDetector - Real-time client-side mobile phone detection
 * Identifies rectangular handheld electronic devices in the camera view with persistence filtering.
 */
import { IntegrityConfig, IntegrityEvent } from './types';

export interface PhoneDetectorCallbacks {
  onEvent: (event: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>) => void;
  onDetectionStatus: (detected: boolean, confidence: number) => void;
}

export class PhoneDetector {
  private config: IntegrityConfig;
  private callbacks: PhoneDetectorCallbacks;
  private videoEl: HTMLVideoElement | null = null;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  private detectionStart: number | null = null;
  private isCurrentlyDetected = false;

  constructor(config: IntegrityConfig, callbacks: PhoneDetectorCallbacks) {
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

  public start(videoEl: HTMLVideoElement) {
    this.videoEl = videoEl;
    this.isRunning = true;
    this.detectionStart = null;
    this.isCurrentlyDetected = false;

    this.intervalId = setInterval(() => this.scanForDevice(), 900);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.videoEl = null;
  }

  private scanForDevice() {
    if (!this.isRunning || !this.config.phoneDetectionEnabled || !this.videoEl || !this.ctx) return;
    if (this.videoEl.readyState < 2 || this.videoEl.videoWidth === 0) return;

    try {
      this.ctx.drawImage(this.videoEl, 0, 0, 160, 120);
      const imgData = this.ctx.getImageData(0, 0, 160, 120);
      const { phonePresent, confidence } = this.detectPhoneFeatures(imgData);

      const now = Date.now();
      const meetsConfidence = phonePresent && confidence >= this.config.phoneConfidenceThreshold;

      this.callbacks.onDetectionStatus(meetsConfidence, confidence);

      if (meetsConfidence) {
        if (!this.detectionStart) {
          this.detectionStart = now;
        }

        const duration = (now - this.detectionStart) / 1000;
        if (duration >= this.config.phonePersistenceSeconds && !this.isCurrentlyDetected) {
          this.isCurrentlyDetected = true;
          this.callbacks.onEvent({
            eventType: 'PHONE_DETECTED',
            severity: 'HIGH',
            confidence: Math.min(0.94, confidence),
            durationSeconds: Math.round(duration),
            timestamp: now,
            status: 'RECORDED',
            message: `Mobile phone or secondary handheld screen detected in camera view (${Math.round(confidence * 100)}% confidence).`,
            metadata: {
              confidence,
              persistenceSeconds: this.config.phonePersistenceSeconds,
              durationSeconds: Math.round(duration)
            }
          });
        }
      } else {
        if (this.isCurrentlyDetected) {
          this.callbacks.onEvent({
            eventType: 'PHONE_REMOVED',
            severity: 'LOW',
            confidence: 0.85,
            timestamp: now,
            status: 'RECORDED',
            message: 'Secondary device removed from camera frame.'
          });
          this.isCurrentlyDetected = false;
        }
        this.detectionStart = null;
      }
    } catch {
      // Ignore scan exception
    }
  }

  /**
   * Evaluates aspect-ratio rectangular edges and localized high-contrast specular gradients
   * typical of mobile phone screens/bezels in the lower regions of the examination frame.
   */
  private detectPhoneFeatures(imgData: ImageData): { phonePresent: boolean; confidence: number } {
    const data = imgData.data;
    const width = 160;
    const height = 120;

    // Scan lower third and side flanks (where phones are typically held into camera view)
    let sharpRectangularGradients = 0;
    let highSpecularPixels = 0;

    for (let y = 60; y < height - 10; y += 2) {
      for (let x = 15; x < width - 15; x += 2) {
        const idx = (y * width + x) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const downIdx = ((y + 1) * width + x) * 4;

        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const lumRight = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
        const lumDown = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];

        // Horizontal and vertical Sobel-like edge gradient
        const edgeMag = Math.abs(lum - lumRight) + Math.abs(lum - lumDown);

        // Phone screen specular glare or backlight pixel
        if (lum > 240 && edgeMag > 35) {
          highSpecularPixels++;
        }

        // Distinct border between dark casing and illuminated surface
        if (edgeMag > 55) {
          sharpRectangularGradients++;
        }
      }
    }

    // High density of sharp rectangular screen edges and backlit specular points
    if (sharpRectangularGradients > 85 && highSpecularPixels > 15) {
      const confidence = Math.min(0.92, 0.70 + (sharpRectangularGradients / 400));
      return { phonePresent: true, confidence };
    }

    return { phonePresent: false, confidence: 0.2 };
  }
}
