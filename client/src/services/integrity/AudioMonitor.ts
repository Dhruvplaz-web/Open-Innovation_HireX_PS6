/**
 * AudioMonitor - Real-time Web Audio API voice activity and multi-speaker spectrum analyzer
 * Privacy-conscious: processes numerical frequency bins only; never stores or transmits raw audio.
 */
import { IntegrityConfig, IntegrityEvent } from './types';

export interface AudioMonitorCallbacks {
  onEvent: (event: Omit<IntegrityEvent, 'id' | 'assessmentAttemptId' | 'userId'>) => void;
  onAudioStateChange: (state: 'ACTIVE' | 'INTERRUPTED' | 'ANOMALY' | 'DISCONNECTED') => void;
  onVoiceActivity: (isSpeaking: boolean, multipleVoicesLikely: boolean, confidence: number) => void;
}

export class AudioMonitor {
  private config: IntegrityConfig;
  private callbacks: AudioMonitorCallbacks;
  private stream: MediaStream | null = null;
  private isRunning = false;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;

  private multiVoiceStart: number | null = null;
  private isMultiVoiceReported = false;
  private lastReportedAudioState: 'ACTIVE' | 'INTERRUPTED' | 'ANOMALY' | 'DISCONNECTED' = 'DISCONNECTED';

  constructor(config: IntegrityConfig, callbacks: AudioMonitorCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  public setConfig(config: IntegrityConfig) {
    this.config = config;
  }

  public start(stream: MediaStream) {
    this.stream = stream;
    this.isRunning = true;
    this.multiVoiceStart = null;
    this.isMultiVoiceReported = false;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.onended = () => this.handleTrackEnded();
      audioTrack.onmute = () => this.handleTrackMute();
      audioTrack.onunmute = () => this.handleTrackUnmute();

      this.updateState('ACTIVE');
      this.callbacks.onEvent({
        eventType: 'MIC_CONNECTED',
        severity: 'LOW',
        confidence: 1.0,
        timestamp: Date.now(),
        status: 'RECORDED',
        message: 'Microphone audio feed successfully connected.'
      });
    } else {
      this.updateState('DISCONNECTED');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.8;

        this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
        this.sourceNode.connect(this.analyser);

        this.sampleAudioLoop();
      }
    } catch {
      // AudioContext policy restriction - basic track monitoring continues
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.stream = null;
    this.updateState('DISCONNECTED');
  }

  private updateState(newState: 'ACTIVE' | 'INTERRUPTED' | 'ANOMALY' | 'DISCONNECTED') {
    if (this.lastReportedAudioState !== newState) {
      this.lastReportedAudioState = newState;
      this.callbacks.onAudioStateChange(newState);
    }
  }

  private handleTrackEnded() {
    this.updateState('DISCONNECTED');
    this.callbacks.onEvent({
      eventType: 'MIC_DISCONNECTED',
      severity: 'HIGH',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Microphone audio track was disconnected.'
    });
  }

  private handleTrackMute() {
    this.updateState('INTERRUPTED');
    this.callbacks.onEvent({
      eventType: 'MIC_INTERRUPTED',
      severity: 'LOW',
      confidence: 0.95,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Microphone hardware stream muted.'
    });
  }

  private handleTrackUnmute() {
    this.updateState('ACTIVE');
    this.callbacks.onEvent({
      eventType: 'MIC_RESTORED',
      severity: 'LOW',
      confidence: 1.0,
      timestamp: Date.now(),
      status: 'RECORDED',
      message: 'Microphone audio stream unmuted and restored.'
    });
  }

  private sampleAudioLoop = () => {
    if (!this.isRunning || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    if (this.config.audioVoiceAnalysisEnabled) {
      this.analyzeSpectrum(dataArray);
    }

    // Run every ~200ms using setTimeout or throttle inside RAF
    setTimeout(() => {
      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(this.sampleAudioLoop);
      }
    }, 200);
  };

  /**
   * Spectral Formant and Multi-Harmonic Analysis
   * Human fundamental frequencies span 85Hz-255Hz, formants span 300Hz-3400Hz
   */
  private analyzeSpectrum(freqData: Uint8Array) {
    let vocalEnergy = 0;
    let highFreqEnergy = 0;
    const sampleRate = this.audioCtx?.sampleRate || 44100;
    const binSize = sampleRate / 512;

    const vocalStartBin = Math.floor(300 / binSize);
    const vocalEndBin = Math.floor(3000 / binSize);

    // Collect vocal band peaks
    const peaks: number[] = [];
    for (let i = vocalStartBin; i < vocalEndBin; i++) {
      const val = freqData[i];
      vocalEnergy += val;
      if (val > 110) {
        if (i > 1 && val > freqData[i - 1] && val > freqData[i + 1]) {
          peaks.push(i * binSize);
        }
      }
    }

    for (let i = vocalEndBin; i < freqData.length; i++) {
      highFreqEnergy += freqData[i];
    }

    const avgVocal = vocalEnergy / (vocalEndBin - vocalStartBin);
    const isSpeaking = avgVocal > 35.0;

    // Detect distinct dual vocal harmonic series (evidence of overlapping voices)
    let multipleSpeakersLikely = false;
    let confidence = 0.5;

    if (isSpeaking && peaks.length >= 4) {
      // Check for two distinct fundamental clusters (e.g. low pitch 100-150Hz + higher pitch 200-260Hz)
      const lowPeaks = peaks.filter(p => p < 1200);
      const midPeaks = peaks.filter(p => p >= 1200 && p < 2500);

      if (lowPeaks.length >= 3 && midPeaks.length >= 2 && avgVocal > 60.0) {
        multipleSpeakersLikely = true;
        confidence = Math.min(0.88, 0.65 + (peaks.length / 20));
      }
    }

    this.callbacks.onVoiceActivity(isSpeaking, multipleSpeakersLikely, confidence);

    const now = Date.now();
    if (multipleSpeakersLikely && confidence >= this.config.audioConfidenceThreshold) {
      if (!this.multiVoiceStart) {
        this.multiVoiceStart = now;
      }
      const duration = (now - this.multiVoiceStart) / 1000;
      if (duration >= this.config.audioVoicePersistenceSeconds && !this.isMultiVoiceReported) {
        this.isMultiVoiceReported = true;
        this.callbacks.onEvent({
          eventType: 'MULTIPLE_VOICES_DETECTED',
          severity: 'MEDIUM',
          confidence,
          durationSeconds: Math.round(duration),
          timestamp: now,
          status: 'RECORDED',
          message: 'Possible multiple voices or conversational audio detected in acoustic environment.',
          metadata: {
            confidence,
            persistenceSeconds: this.config.audioVoicePersistenceSeconds,
            peakCount: peaks.length
          }
        });
      }
    } else {
      if (this.isMultiVoiceReported && !multipleSpeakersLikely) {
        this.isMultiVoiceReported = false;
        this.callbacks.onEvent({
          eventType: 'AUDIO_SPEECH_NORMAL',
          severity: 'LOW',
          confidence: 0.8,
          timestamp: now,
          status: 'RECORDED',
          message: 'Audio environment returned to single-speaker/baseline levels.'
        });
      }
      this.multiVoiceStart = null;
    }
  }
}
