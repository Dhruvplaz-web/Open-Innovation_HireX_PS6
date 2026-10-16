import React from 'react';
import { Shield, ChevronRight, Lock, Eye, CheckCircle2, UserCheck, AlertTriangle, Mail } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface PrivacyPolicyViewProps {
  onNavigateTab: (tab: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="HireX Privacy Policy"
        description="Learn how HireX collects, verifies, and protects student skills, recruiter postings, and algorithmic matching data under privacy best practices."
        path="/privacy-policy"
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
          Privacy Policy
        </span>
      </nav>

      {/* Header Banner */}
      <header className="space-y-2 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          HireX Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: October 5, 2026 • Effective Version 3.0 • Applicable Jurisdiction: {SITE_CONFIG.organization.jurisdiction}
        </p>
      </header>

      {/* Decision-Support Critical Callout */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-bold">Algorithmic Decision-Support Notice: </span>
          <span>
            HireX utilizes machine learning algorithms for skill gap analysis and explainable career matching. All AI-generated fit scores and recommendations are strictly decision-support indicators. <strong>HireX does not guarantee employment, internship offers, or recruitment selection.</strong>
          </span>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Information We Collect
          </h2>
          <p>
            HireX collects information strictly necessary to provide objective skill verification, transparent candidate matching, and placement telemetry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Student Data
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Account details (Full name, institutional/personal email, role).</li>
                <li>Academic records (College name, department, year of study, CGPA, university PRN).</li>
                <li>Skill credentials (Self-reported skills, proctored test results, AST code complexity metrics).</li>
                <li>Applications submitted to corporate campus drives.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Recruiter & Institution Data
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Corporate profile (Company name, work email, office location, designation).</li>
                <li>Internship and job postings (Required skill criteria, cutoffs, deadlines).</li>
                <li>Institutional affiliation (College HOD/TPO verification credentials).</li>
                <li>Candidate pipeline review logs and interview schedules.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Technical Telemetry Collected
          </h2>
          <p>
            When you access the HireX platform, we collect limited technical information strictly for security, rate-limiting, and error diagnosis:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li>Browser type and version, operating system environment.</li>
            <li>IP address for proctoring integrity and suspicious session deterrence.</li>
            <li>Essential session tokens and user cookie preferences stored locally on your device.</li>
            <li>Aggregated, anonymous usage telemetry if analytics cookies are explicitly permitted.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. How Information Is Used
          </h2>
          <p>Your data is processed for the following explicit educational and placement purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li><strong>Objective Skill Calibration:</strong> Our local Ridge regression model normalizes objective assessment scores and code AST loop complexity into a standardized score.</li>
            <li><strong>Explainable Opportunity Matching:</strong> Vector overlap algorithms calculate transparent alignment scores between student verified skills and recruiter requirements.</li>
            <li><strong>TPO Gatekeeper Verification:</strong> Automatically checks institutional criteria (10th, 12th, CGPA, active backlogs) before routing an application to employers.</li>
            <li><strong>Curriculum Desynchronization Analysis:</strong> Aggregates skill market trends to provide academic departments with actionable curriculum gap audits.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Who May See Your Information
          </h2>
          <p>
            We adhere to strict data compartmentalization principles:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li><strong>Employers / Recruiters:</strong> Recruiters only receive access to student profiles after the student explicitly applies to their opportunity or enters an active campus drive funnel.</li>
            <li><strong>College Placement Officers (TPO / HOD):</strong> Institutional authorities can view student verified competency scores and drive application statuses within their verified department.</li>
            <li><strong>Third-Party Processors:</strong> We do not sell or rent personal information to data brokers or advertising networks. External infrastructure partners (such as cloud hosting and Firebase authentication) process tokens strictly under service agreements.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Data Retention, Security & Deletion
          </h2>
          <p>
            Student skill transcripts and assessment logs are retained for the duration of the student's active degree program and subsequent placement lifecycle. Security measures include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li>HTTPS TLS 1.3 transport encryption across all client-server communications.</li>
            <li>Cryptographic SHA-256 anti-tamper hashes sealing verified achievement certificates.</li>
            <li>Role-Based Access Control (RBAC) ensuring unauthorized personas cannot view confidential student backlogs.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            6. Your Rights & Account Deletion
          </h2>
          <p>
            Users retain full rights to inspect, update, or purge their profile information. Students may export their verified skill transcript or submit a complete data deletion request by contacting the institutional privacy officer at <a href={`mailto:${SITE_CONFIG.organization.privacyEmail}`} className="font-semibold underline text-slate-900 dark:text-white">{SITE_CONFIG.organization.privacyEmail}</a>.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            7. Contact Information
          </h2>
          <p>
            For privacy inquiries, grievance redressal, or data audit requests regarding {SITE_CONFIG.name}:
          </p>
          <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-mono space-y-1">
            <p>Institutional Entity: {SITE_CONFIG.organization.legalName}</p>
            <p>Privacy Inquiries: {SITE_CONFIG.organization.privacyEmail}</p>
            <p>Grievance Officer: {SITE_CONFIG.organization.grievanceEmail}</p>
            <p>Jurisdiction: {SITE_CONFIG.organization.jurisdiction}</p>
          </div>
        </section>
      </div>
    </div>
  );
};
