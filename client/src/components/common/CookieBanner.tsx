import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck, Check, Settings2 } from 'lucide-react';
import { analytics } from '../../services/analytics';

interface CookieConsentState {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

interface CookieBannerProps {
  openLegalModal?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ openLegalModal }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Check existing stored consent
    const stored = localStorage.getItem('skillbridge_cookie_consent');
    if (!stored) {
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(stored) as CookieConsentState;
        if (parsed.analytics) {
          analytics.init();
        }
      } catch (e) {
        // Fallback
      }
    }

    // Global listener for "Manage Cookie Preferences" links from footer
    const handleOpenPreferences = () => {
      const currentStored = localStorage.getItem('skillbridge_cookie_consent');
      if (currentStored) {
        try {
          const parsed = JSON.parse(currentStored) as CookieConsentState;
          setAnalyticsEnabled(parsed.analytics || false);
        } catch {}
      }
      setShowPreferences(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenPreferences);
    return () => window.removeEventListener('open-cookie-preferences', handleOpenPreferences);
  }, []);

  const saveConsent = (analyticsChoice: boolean) => {
    const consent: CookieConsentState = {
      essential: true,
      analytics: analyticsChoice,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('skillbridge_cookie_consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowPreferences(false);

    if (analyticsChoice) {
      analytics.init();
    }
  };

  const handleAcceptAll = () => saveConsent(true);
  const handleRejectNonEssential = () => saveConsent(false);

  return (
    <>
      {/* 1. Non-Intrusive Bottom Banner */}
      {showBanner && (
        <div 
          role="region" 
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-white dark:bg-card-dark p-4 md:p-5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cookie className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  We use cookies to keep HireX secure and improve your experience.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Essential cookies ensure authentication and AST code auditor integrity. Analytics cookies help evaluate platform performance.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 md:flex-none px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 md:flex-none px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Manage Preferences</span>
              </button>
              <button
                onClick={handleAcceptAll}
                className="w-full md:w-auto px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Accessible Preference Modal */}
      {showPreferences && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="cookie-pref-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 relative">
            <button
              onClick={() => setShowPreferences(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close preferences"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 id="cookie-pref-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-500" />
              Cookie Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select which cookie categories you permit SkillBridge to utilize on your device.
            </p>

            <div className="mt-5 space-y-3">
              {/* Category 1: Essential Cookies */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Essential Cookies</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Required for core security, session tokens, CSRF protection, and role navigation. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Category 2: Analytics Cookies */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Analytics Cookies</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Help us aggregate anonymous metrics on popular skill challenges and placement drive engagement.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Toggle analytics cookies"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-slate-100"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => saveConsent(analyticsEnabled)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
