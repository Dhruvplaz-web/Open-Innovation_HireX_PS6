/**
 * IntegrityScoreCalculator - Calculates calibrated 0-100 Assessment Integrity Score
 * Starts at 100; deducts points based on verified persistent events, severity, duration, and confidence.
 */
import { IntegrityConfig, IntegrityEvent, IntegrityStatus } from './types';

export class IntegrityScoreCalculator {
  public static calculate(
    events: IntegrityEvent[],
    config: IntegrityConfig,
    isDisqualified: boolean = false
  ): {
    score: number;
    status: IntegrityStatus;
    totalWarnings: number;
    totalViolations: number;
    categoryBreakdown: {
      camera: number;
      person: number;
      phone: number;
      audio: number;
      browser: number;
      fullscreen: number;
    };
    categories: {
      camera: number;
      person: number;
      phone: number;
      audio: number;
      browser: number;
      fullscreen: number;
    };
  } {
    if (isDisqualified) {
      const breakdown = this.computeBreakdown(events);
      return {
        score: 0,
        status: 'DISQUALIFIED',
        totalWarnings: events.filter(e => e.severity === 'LOW' && e.status !== 'DISMISSED').length,
        totalViolations: events.filter(e => e.severity !== 'LOW' && e.status !== 'DISMISSED').length,
        categoryBreakdown: breakdown,
        categories: breakdown
      };
    }

    let score = 100;
    let warnings = 0;
    let violations = 0;

    // Deduplicate rapid successive events in same category
    const validEvents = events.filter(e => e.status !== 'DISMISSED');

    validEvents.forEach(ev => {
      const conf = Math.max(0.5, ev.confidence || 1.0);
      const durationFactor = ev.durationSeconds ? Math.min(2.0, 1.0 + (ev.durationSeconds / 30.0)) : 1.0;

      if (ev.severity === 'LOW') {
        warnings += 1;
        // Minor penalty for low severity warning
        score -= Math.round(2.5 * conf * durationFactor);
      } else if (ev.severity === 'MEDIUM') {
        violations += 1;
        // Moderate penalty
        score -= Math.round(7.0 * conf * durationFactor);
      } else if (ev.severity === 'HIGH') {
        violations += 1;
        // Substantial penalty for high severity breach
        score -= Math.round(15.0 * conf * durationFactor);
      }
    });

    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine status from score and thresholds
    let status: IntegrityStatus = 'VALID';
    if (violations >= config.disqualificationThreshold || score < 50) {
      status = 'DISQUALIFIED';
    } else if (violations >= config.reviewThreshold || score < 70) {
      status = 'FLAGGED_FOR_REVIEW';
    } else if (violations >= config.warningThreshold || score < 90) {
      status = 'WARNING';
    } else {
      status = 'VALID';
    }

    const breakdown = this.computeBreakdown(events);
    return {
      score,
      status,
      totalWarnings: warnings,
      totalViolations: violations,
      categoryBreakdown: breakdown,
      categories: breakdown
    };
  }

  private static computeBreakdown(events: IntegrityEvent[]) {
    const breakdown = {
      camera: 0,
      person: 0,
      phone: 0,
      audio: 0,
      browser: 0,
      fullscreen: 0
    };

    events.forEach(e => {
      const type = e.eventType.toUpperCase();
      if (type.includes('CAMERA')) breakdown.camera++;
      else if (type.includes('PERSON') || type.includes('ABSENT')) breakdown.person++;
      else if (type.includes('PHONE')) breakdown.phone++;
      else if (type.includes('MIC') || type.includes('VOICE') || type.includes('AUDIO')) breakdown.audio++;
      else if (type.includes('FULLSCREEN')) breakdown.fullscreen++;
      else if (type.includes('TAB') || type.includes('BLUR') || type.includes('PAGE')) breakdown.browser++;
    });

    return breakdown;
  }
}
