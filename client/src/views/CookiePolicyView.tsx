import React from 'react';
import { Cookie, ChevronRight, Settings2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface CookiePolicyViewProps {
  onNavigateTab: (tab: string) => void;
}

export const CookiePolicyView: React.FC<CookiePolicyViewProps> = ({ onNavigateTab }) => {
  const handleOpenPreferences = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="HireX Cookie Policy"
        description="Understand how HireX uses essential session cookies and configurable preferences to safeguard your placement portal access."
        path="/cookie-policy"
      />

      {/* Accessible Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
        <button 
          onClick={() => onNavigateTab('dashboard')}
          className="hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Cookie Policy
        </span>
      </nav>

      {/* Header Banner */}
      <header className="space-y-2 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Cookie className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          HireX Cookie Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: October 5, 2026 • Effective Version 3.0
        </p>
      </header>

      {/* Quick Action to Manage Preferences */}
      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Manage Your Cookie Preferences
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            You can customize or revoke non-essential cookie permissions at any time.
          </span>
        </div>
        <button
          onClick={handleOpenPreferences}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Open Preferences</span>
        </button>
      </div>

      {/* Cookie Details */}
      <div className="space-y-6 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies and local storage tokens are small text files placed on your browser or device when you interact with HireX. They allow the platform to maintain secure authenticated sessions and remember user preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Categories of Cookies Used on HireX
          </h2>

          <div className="space-y-3">
            {/* Essential Cookies */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  A. Essential & Authentication Cookies
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                  Strictly Necessary
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                These cookies are required for platform security and navigation. They maintain Firebase authentication state, protect against Cross-Site Request Forgery (CSRF), and verify whether a student or recruiter session is valid. The platform cannot function securely without these cookies.
              </p>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                Examples: <code>__session</code>, <code>firebase:authUser</code>, <code>hirex_cookie_consent</code>
              </div>
            </div>

            {/* Preference Cookies */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  B. Interface & Preference Storage
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                  Functional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Remembers user interface customizations such as Dark Mode / Light Mode toggle state and active workspace view filters.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  C. Performance & Analytics Cookies
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                  Optional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                If enabled, aggregated telemetry measures page load times and user engagement with algorithmic test suites. <strong>HireX does not deploy optional analytics cookies until you explicitly consent via our consent banner.</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. How to Manage Cookies
          </h2>
          <p>
            You can modify your preferences at any time by clicking the <button onClick={handleOpenPreferences} className="font-semibold underline text-slate-900 dark:text-white">Cookie Preferences</button> button in our footer. Additionally, you may configure your browser settings to block or delete cookies; however, blocking essential cookies will disable authenticated access to verified placement workspaces.
          </p>
        </section>
      </div>
    </div>
  );
};
