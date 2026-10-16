import React from 'react';
import { ShieldCheck, Cookie, Award, Heart, HelpCircle, FileText, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';

interface GlobalFooterProps {
  onNavigateTab: (tab: string) => void;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({ onNavigateTab }) => {
  const currentYear = new Date().getFullYear();

  const handleOpenCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  };

  return (
    <footer className="mt-12 border-t border-slate-200/90 dark:border-slate-800 pt-8 pb-12 text-slate-500 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            Decision-Support & Matching Notice
          </p>
          <p>
            {SITE_CONFIG.disclaimers.nonGuarantee} {SITE_CONFIG.disclaimers.aiRecommendations}
          </p>
        </div>

        {/* Links Navigation Grid */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {SITE_CONFIG.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                v3.0 Production Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              {SITE_CONFIG.taglineSecondary}
            </p>
          </div>

          {/* Legal, Support & Compliance Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-semibold">
            <button
              onClick={() => onNavigateTab('about')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              About HireX
            </button>

            <button
              onClick={() => onNavigateTab('contact')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Contact Support
            </button>

            <button
              onClick={() => onNavigateTab('privacy-policy')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Privacy Policy
            </button>

            <button
              onClick={() => onNavigateTab('terms-of-service')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Terms of Service
            </button>

            <button
              onClick={() => onNavigateTab('cookie-policy')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Cookie Policy
            </button>

            <button
              onClick={() => onNavigateTab('accessibility')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Accessibility Statement
            </button>

            <button
              onClick={handleOpenCookiePreferences}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <Cookie className="w-3.5 h-3.5 text-amber-500" />
              <span>Cookie Preferences</span>
            </button>
          </nav>
        </div>

        {/* Bottom Copyright & Configurable Entity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <p>
            © {currentYear} {SITE_CONFIG.organization.name}. All rights reserved.
          </p>
          <p>
            Deployment Entity: <span className="font-mono">{SITE_CONFIG.organization.legalName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
