/**
 * HireX Global Site Configuration & Production Metadata
 * 
 * Configurable parameters for deployment, legal compliance, and SEO canonical URLs.
 * Real credentials and organization legal entities must be configured via environment variables.
 */

export const SITE_CONFIG = {
  name: "HireX",
  shortName: "HireX",
  tagline: "Bridge Skills to Opportunities",
  taglineSecondary: "Verified Skills • AI Matching • Career Opportunities",
  description: "HireX connects students, academia and recruiters through verified skill assessments, explainable AI matching, internships, jobs and placement analytics.",
  
  // Base Canonical URL (configurable via VITE_PUBLIC_SITE_URL, fallback for demo)
  publicUrl: (import.meta.env.VITE_PUBLIC_SITE_URL || "https://hirex.edu.in").replace(/\/$/, ""),
  
  // Organization and Contact Details (Uses configurable placeholders, no invented entities)
  organization: {
    name: import.meta.env.VITE_ORG_NAME || "[Institution / Deployment Organization Name]",
    legalName: import.meta.env.VITE_ORG_LEGAL_NAME || "[Legal Entity / Placement Directorate Name]",
    contactEmail: import.meta.env.VITE_CONTACT_EMAIL || "support@hirex.edu.in",
    privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || "privacy@hirex.edu.in",
    grievanceEmail: import.meta.env.VITE_GRIEVANCE_EMAIL || "grievance@hirex.edu.in",
    jurisdiction: import.meta.env.VITE_JURISDICTION || "Maharashtra, India"
  },

  // Mandatory Platform Legal & AI Disclaimers
  disclaimers: {
    nonGuarantee: "HireX is a decision-support skill verification and matching platform. HireX does NOT guarantee employment, internship offers, interview callbacks, or candidate selection. Hiring decisions remain the sole prerogative of participating employers.",
    aiRecommendations: "All match percentages, competency scores, and readiness indices are indicative algorithmic estimates designed for career guidance and gap analysis.",
    studentResponsibility: "Students are responsible for the accuracy of academic history, project repositories, and credentials submitted on the platform."
  }
};
