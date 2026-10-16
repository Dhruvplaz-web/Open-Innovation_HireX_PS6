import React from 'react';
import { FileText, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface TermsOfServiceViewProps {
  onNavigateTab: (tab: string) => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="HireX Terms of Service"
        description="Review the terms and conditions governing the use of HireX skill assessments, AI matching, and campus placement modules."
        path="/terms-of-service"
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
          Terms of Service
        </span>
      </nav>

      {/* Header Banner */}
      <header className="space-y-2 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          HireX Terms of Service
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: October 5, 2026 • Effective Version 3.0 • Governing Jurisdiction: {SITE_CONFIG.organization.jurisdiction}
        </p>
      </header>

      {/* Mandatory Employment & Matching Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Essential Terms Summary:
        </span>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
          <li><strong>HireX does not guarantee employment or internship placement.</strong></li>
          <li><strong>AI match scores and readiness indices are strictly indicative recommendations</strong> for self-assessment and gap analysis.</li>
          <li><strong>Recruiters make their own independent hiring decisions.</strong></li>
          <li><strong>Students are solely responsible for the authenticity and accuracy</strong> of their academic, personal, and project submissions.</li>
        </ul>
      </div>

      {/* All 22 Numbered Sections */}
      <div className="space-y-6 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>By accessing or registering with {SITE_CONFIG.name}, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using the platform immediately.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Eligibility</h2>
          <p>Access is provided to enrolled students, authorized corporate recruiters, accredited college faculty/HODs, and placement officers. Users must provide verifiable identity details.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Account Registration</h2>
          <p>Users must maintain the confidentiality of authentication credentials. Sharing accounts across multiple individuals or creating fraudulent personas is strictly prohibited.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. User Responsibilities</h2>
          <p>All users agree to interact respectfully, safeguard platform integrity, and comply with all applicable regional and national educational guidelines.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">5. Student Responsibilities</h2>
          <p>Students must ensure that all self-reported CGPA numbers, active backlog counts, PRN identifiers, and GitHub repository links represent their authentic personal work. Misrepresentation may result in immediate placement disqualification by institutional TPOs.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">6. Recruiter Responsibilities</h2>
          <p>Recruiters agree to post genuine internship and employment opportunities with accurate stipends, locations, and eligibility criteria. Recruiters must not solicit fees or payments from student candidates.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">7. Institution Responsibilities</h2>
          <p>Participating academic institutions (colleges, universities, departments) are responsible for verifying student enrollment rosters, approving gatekeeper NOC status, and maintaining proctoring standards.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">8. Skill Assessments</h2>
          <p>Assessment challenges, quantitative sprints, and AST code audits evaluate programming proficiency at the time of testing. Attempting to bypass timers or submit automated bot solutions violates academic integrity.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">9. Job and Internship Opportunities</h2>
          <p>Job listings on HireX are provided directly by verified corporate partners or campus recruitment cells. HireX acts as a facilitator and does not guarantee the availability or continuity of any posted vacancy.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">10. AI Recommendations</h2>
          <p>All match percentages, vector overlap scores, and readiness curves generated by HireX AI models are advisory decision-support analytics. They do not constitute formal job offers or binding guarantees of hiring.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">11. Applications</h2>
          <p>Submitting an application routes the candidate's verified skill profile and ATS resume to the prospective employer. Employers hold complete discretion over interview shortlisting, technical screenings, and hiring offers.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">12. User Content</h2>
          <p>Users retain ownership of submitted code snippets, resumes, and project portfolios. By submitting content, you grant HireX a limited license to analyze and process it for skill verification and matching.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">13. Prohibited Activities</h2>
          <p>Users may not attempt to reverse engineer the machine learning models, launch Denial of Service (DoS) attacks, scrape candidate data, or upload malicious payloads through code test runners.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">14. Intellectual Property</h2>
          <p>The HireX name, interface design system, AST complexity auditing algorithm, and software codebase are protected intellectual property of {SITE_CONFIG.organization.name}.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">15. Third-Party Services</h2>
          <p>HireX integrates with verified external tools (e.g. Firebase Authentication, DiceBear avatars, GitHub repositories). Your interactions with third-party platforms are subject to their respective terms.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">16. Platform Availability</h2>
          <p>While we strive for high uptime, HireX is provided on an "as is" and "as available" basis without warranties of uninterrupted service during maintenance windows or server restarts.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">17. Disclaimer</h2>
          <p>To the maximum extent permitted by law, HireX disclaims all warranties, express or implied, including fitness for a particular employment objective or recruitment outcome.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">18. Limitation of Liability</h2>
          <p>In no event shall {SITE_CONFIG.organization.name} or project contributors be liable for indirect, incidental, or consequential damages resulting from employment outcomes or platform downtime.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">19. Account Suspension</h2>
          <p>Accounts found submitting fraudulent resumes, plagiarized code repositories, or impersonating institutional officials are subject to immediate suspension.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">20. Termination</h2>
          <p>Users may terminate their account at any time by requesting profile deletion. Upon termination, active drive applications will be archived.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">21. Changes to Terms</h2>
          <p>We may periodically update these terms to reflect feature upgrades or regulatory requirements. Continued usage following updates constitutes acceptance of revised terms.</p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">22. Contact Information</h2>
          <p>Questions regarding these Terms of Service may be addressed to our administration desk at <a href={`mailto:${SITE_CONFIG.organization.contactEmail}`} className="font-semibold underline text-slate-900 dark:text-white">{SITE_CONFIG.organization.contactEmail}</a>.</p>
        </section>
      </div>
    </div>
  );
};
