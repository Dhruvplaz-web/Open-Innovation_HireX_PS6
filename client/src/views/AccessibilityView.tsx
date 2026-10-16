import React from 'react';
import { Eye, ChevronRight, CheckCircle2, Keyboard, Sun, Layers, HelpCircle } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface AccessibilityViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AccessibilityView: React.FC<AccessibilityViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="HireX Accessibility Statement"
        description="Discover how HireX implements accessible web design, keyboard navigation, high-contrast tokens, and screen-reader semantics."
        path="/accessibility"
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
          Accessibility
        </span>
      </nav>

      {/* Header Banner */}
      <header className="space-y-2 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Eye className="w-5 h-5 text-emerald-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          HireX Accessibility Statement
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: October 5, 2026 • Commitment to Universal Access
        </p>
      </header>

      {/* Overview */}
      <section className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Our Commitment to Digital Accessibility
        </h2>
        <p>
          At {SITE_CONFIG.name}, we believe that verified career skill mapping, algorithmic code practice, and campus placement opportunities must be accessible to all students, academicians, and recruiters regardless of physical ability, device constraints, or assistive technology setup.
        </p>
        <p>
          While we do not claim formal third-party WCAG certification, our engineering team actively designs, audits, and builds user interfaces in accordance with established accessibility best practices.
        </p>
      </section>

      {/* Implemented Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Implemented Engineering Standards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Keyboard Navigation
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All interactive elements, buttons, tabs, and test challenge controls are reachable and operable via keyboard. Modals can be dismissed using the <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Escape</kbd> key.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Semantic HTML & Hierarchy
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pages are structured using semantic elements (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code>) with a strictly ordered heading hierarchy (H1 $\rightarrow$ H2 $\rightarrow$ H3).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                High Contrast & Dark Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Color palettes utilize high-contrast surfaces (Slate 900 text on porcelain light surfaces; Slate 100 on dark surfaces) ensuring legibility for users with visual impairments.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Focus Rings & ARIA States
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive triggers maintain visible <code>:focus-visible</code> indicators and ARIA labels. A skip-to-content shortcut enables direct jumping past navigation bars.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback & Assistive Contact */}
      <section className="space-y-2 border-t border-slate-200/90 dark:border-slate-800 pt-6 text-xs text-slate-600 dark:text-slate-300">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Accessibility Feedback & Remediation
        </h2>
        <p>
          If you encounter any accessibility barrier or difficulties navigating HireX with a screen reader, please notify our accessibility coordinator:
        </p>
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-mono space-y-0.5">
          <p>Email: <a href={`mailto:${SITE_CONFIG.organization.contactEmail}`} className="underline text-slate-900 dark:text-white">{SITE_CONFIG.organization.contactEmail}</a></p>
          <p>Subject: "Accessibility Barrier Report - HireX"</p>
        </div>
      </section>
    </div>
  );
};
