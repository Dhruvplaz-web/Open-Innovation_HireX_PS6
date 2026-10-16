import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Cookie, Eye } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: 'privacy' | 'terms' | 'cookies' | 'accessibility';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultSection = 'privacy' }) => {
  const [section, setSection] = useState<'privacy' | 'terms' | 'cookies' | 'accessibility'>(defaultSection);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Legal, Privacy & Compliance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compliant with India's Digital Personal Data Protection Act (DPDP Act 2023) & AICTE guidelines.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-4 shrink-0 overflow-x-auto border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setSection('privacy')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              section === 'privacy' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setSection('terms')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              section === 'terms' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setSection('cookies')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              section === 'cookies' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cookie Policy
          </button>
          <button
            onClick={() => setSection('accessibility')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              section === 'accessibility' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Accessibility
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          {section === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Data Sovereignty & Indian Residency</h3>
              <p>
                HireX strictly adheres to India's DPDP Act 2023. All student educational records, proctored assessment logs, and institutional syllabi data are processed locally within Indian national borders. No identifiable student data is exported to foreign third-party commercial LLM providers without explicit opt-in consent.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Objective Skill Verification</h3>
              <p>
                Student skill ratings are calibrated through automated AST code analysis, algorithmic benchmarks, and GitHub portfolio analysis. Personal data is never sold or used for targeted commercial advertising.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Your Rights as a Data Principal</h3>
              <p>
                Students have the unconditional right to access, verify, export, or permanently purge their competency profiles from the HireX registry at any time.
              </p>
            </div>
          )}

          {section === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Authorized Academic Use</h3>
              <p>
                HireX is provided for legitimate academia-industry collaboration between verified engineering institutions, bona fide recruiters, and enrolled students.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Integrity & Anti-Fraud Guarantee</h3>
              <p>
                Recruiters agree that all internship postings represent genuine, funded openings. Phantom/ghost job postings or misleading placement guarantees are strictly prohibited and subject to institutional blacklisting.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. NEP 2020 Credit Equivalence</h3>
              <p>
                Academic credit recommendations generated by the platform are subject to final ratification by the student's affiliating university or college academic council.
              </p>
            </div>
          )}

          {section === 'cookies' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Minimal Essential Cookies</h3>
              <p>
                HireX uses strictly essential cookies required to authenticate your verified session and store your preferred aesthetic mode (Dark/Light mode).
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Zero Third-Party Ad Trackers</h3>
              <p>
                We do NOT deploy invasive third-party cross-site advertising cookies or commercial tracking pixels.
              </p>
            </div>
          )}

          {section === 'accessibility' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. WCAG 2.1 Level AA Commitment</h3>
              <p>
                HireX is architected according to Web Content Accessibility Guidelines (WCAG 2.1 AA):
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>High contrast color tokens with minimum 4.5:1 text-to-background contrast.</li>
                <li>Full keyboard navigation with visible focus rings.</li>
                <li>Semantic HTML elements (`button`, `header`, `nav`, `aside`, `main`).</li>
                <li>Accessible ARIA labels for non-text chart controls.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Last reviewed: October 2026 • JSPM RSCOE Legal & Compliance Desk
        </div>
      </div>
    </div>
  );
};
