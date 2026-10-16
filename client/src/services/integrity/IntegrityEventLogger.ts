/**
 * IntegrityEventLogger - Synchronizes integrity events with the backend audit system
 */
import { IntegrityEvent } from './types';
import { API_BASE } from '../api';

export class IntegrityEventLogger {
  private queue: IntegrityEvent[] = [];
  private isFlushing = false;

  public async logEvent(event: IntegrityEvent): Promise<any> {
    this.queue.push(event);
    return this.flush();
  }

  private async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    this.isFlushing = true;

    while (this.queue.length > 0) {
      const event = this.queue[0];
      try {
        const res = await fetch(`${API_BASE}/assessments/integrity/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        if (res.ok) {
          this.queue.shift();
        } else {
          // If server error, preserve event in queue
          break;
        }
      } catch {
        // Network offline - leave in queue for subsequent sync
        break;
      }
    }

    this.isFlushing = false;
  }
}
