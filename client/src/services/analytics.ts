/**
 * HireX Web Analytics Integration Service
 * 
 * Respects User Cookie Consent:
 * - Only transmits telemetry if the user explicitly opted-in to analytics cookies.
 * - Filters all sensitive information (passwords, answers, resume content).
 * - Operates safely in local/demo mode when no provider is connected.
 */

export type AnalyticsEvent = 
  | 'page_view'
  | 'registration_started'
  | 'registration_completed'
  | 'assessment_started'
  | 'assessment_completed'
  | 'opportunity_viewed'
  | 'opportunity_saved'
  | 'application_submitted'
  | 'opportunity_created'
  | 'candidate_viewed';

interface EventPayload {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

class AnalyticsService {
  private isInitialized = false;
  private providerConfigured = Boolean(import.meta.env.VITE_ANALYTICS_ID);

  private hasConsent(): boolean {
    try {
      const consentStr = localStorage.getItem('hirex_cookie_consent');
      if (!consentStr) return false;
      const parsed = JSON.parse(consentStr);
      return parsed?.analytics === true;
    } catch {
      return false;
    }
  }

  public init() {
    if (this.isInitialized) return;
    
    if (this.hasConsent() && this.providerConfigured) {
      this.isInitialized = true;
      // Integration hook for Google Analytics / Plausible / PostHog
      // Real telemetry provider script can be injected here using VITE_ANALYTICS_ID
    }
  }

  public track(event: AnalyticsEvent, payload: EventPayload = {}) {
    // 1. Strict Privacy Check: Do not track without explicit cookie consent
    if (!this.hasConsent()) {
      return;
    }

    // 2. Sensitive Information Sanitization Guard
    const sanitized = { ...payload };
    delete sanitized.password;
    delete sanitized.answers;
    delete sanitized.resumeText;
    delete sanitized.rawScore;
    delete sanitized.privateNotes;

    // 3. Dispatch to configured analytics provider
    if (this.providerConfigured && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, sanitized);
    }
  }

  public trackPageView(path: string, title: string) {
    this.track('page_view', { page_path: path, page_title: title });
  }
}

export const analytics = new AnalyticsService();
