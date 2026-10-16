/**
 * SkillBridge AI Proctoring Subsystem — Explicit State Machine (Phase 1)
 * Centralizes proctoring state transitions with strict lifecycle enforcement.
 */

import { ProctoringStatus } from './proctoringConfig';

export type StateChangeListener = (newStatus: ProctoringStatus, oldStatus: ProctoringStatus, payload?: any) => void;

export class ProctoringStateMachine {
  private currentStatus: ProctoringStatus = 'IDLE';
  private listeners: Set<StateChangeListener> = new Set();
  private lastErrorMessage: string = '';

  constructor(initialStatus: ProctoringStatus = 'IDLE') {
    this.currentStatus = initialStatus;
  }

  public getStatus(): ProctoringStatus {
    return this.currentStatus;
  }

  public getErrorMessage(): string {
    return this.lastErrorMessage;
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(oldStatus: ProctoringStatus, payload?: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentStatus, oldStatus, payload);
      } catch (err) {
        console.error('Error in proctoring state machine listener:', err);
      }
    });
  }

  public transitionTo(nextStatus: ProctoringStatus, payload?: any): boolean {
    if (this.currentStatus === nextStatus) return true;

    const validTransitions: Record<ProctoringStatus, ProctoringStatus[]> = {
      IDLE: ['PRECHECK', 'ERROR'],
      PRECHECK: ['READY', 'ERROR', 'IDLE'],
      READY: ['ACTIVE', 'ERROR', 'IDLE'],
      ACTIVE: ['WARNING', 'DISMISSED', 'COMPLETED', 'ERROR'],
      WARNING: ['ACTIVE', 'WARNING', 'DISMISSED', 'COMPLETED', 'ERROR'],
      DISMISSED: [], // Terminal dismissal state
      COMPLETED: [], // Terminal completion state
      ERROR: ['PRECHECK', 'IDLE']
    };

    const allowed = validTransitions[this.currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      console.warn(`[ProctoringStateMachine] Invalid transition attempted: ${this.currentStatus} -> ${nextStatus}`);
      return false;
    }

    const oldStatus = this.currentStatus;
    this.currentStatus = nextStatus;

    if (nextStatus === 'ERROR' && payload?.message) {
      this.lastErrorMessage = payload.message;
    }

    this.notify(oldStatus, payload);
    return true;
  }

  public reset() {
    const oldStatus = this.currentStatus;
    this.currentStatus = 'IDLE';
    this.lastErrorMessage = '';
    this.notify(oldStatus);
  }
}
