export type Role = 'student' | 'recruiter' | 'academician' | 'admin';

export interface VerifiedSkill {
  skill: string;
  score: number;
  level: string;
  verified: boolean;
}

export interface StudentProfile {
  id: string;
  student_id?: string;
  name: string;
  email: string;
  college: string;
  department: string;
  year: string;
  cgpa: number;
  avatar: string;
  verified_score: number;
  skills: Record<string, { level: string; score: number; verified: boolean }>;
  projects_count: number;
  assessments_completed: number;
  rank_in_college: number;
  target_role: string;
  bio: string;
}

export interface MatchedOpportunity {
  id?: string;
  opportunity_id: string;
  title: string;
  company: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  stipend: string;
  location: string;
  duration: string;
  deadline: string;
  color_theme: 'indigo' | 'pink' | 'peach' | 'sky';
  explanation: string;
  // Time-Aware Lifecycle additions (Pillars 1, 2, 4)
  is_expired?: boolean;
  lifecycle_status?: 'ACTIVE' | 'CLOSING_SOON' | 'EXPIRED';
  days_remaining?: number;
  urgency_label?: string;
  can_apply?: boolean;
  formatted_deadline?: string;
  source_type?: 'ATS_DIRECT' | 'CAMPUS_TPO' | 'SCRAPED_EXTERNAL' | string;
  verified_source_badge?: string;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  // Step 2 & 4 Additive JD Fit Fields
  skillRequirements?: SkillRequirement[];
  skill_requirements?: SkillRequirement[];
  jdFit?: {
    overallFit: number;
    verdict: JDFitVerdict;
    summary?: JDFitSummary;
  };
  jd_fit?: {
    overallFit: number;
    verdict: JDFitVerdict;
    summary?: JDFitSummary;
  };
}

export type RequirementImportance = 'MUST_HAVE' | 'NICE_TO_HAVE';
export type JDFitVerdict = 'STRONG_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NEEDS_WORK';

export interface SkillRequirement {
  skill: string;
  importance: RequirementImportance;
  targetLevel?: number;
  targetScore?: number;
  min_score?: number;
  min_level?: string;
  score?: number;
}

export interface JDFitSkillDetail {
  skill: string;
  importance: RequirementImportance;
  targetLevel: number;
  targetScore?: number;
  min_score?: number;
  studentScore: number | null;
  effectiveScore?: number | null;
  matchedVia: 'EXACT' | 'ALIAS' | 'RELATED' | 'NONE';
  matchedSkill?: string | null;
  coverage: number;
  status: 'MET' | 'PARTIAL' | 'GAP' | 'NOT_ASSESSED';
  gap: number;
}

export interface JDFitSummary {
  mustHaveCoverage: number;
  niceToHaveCoverage: number;
  topGaps: string[];
  metCount: number;
  totalCount: number;
}

export interface JDFitAnalysisResult {
  overallFit: number;
  mustHaveCoverage: number;
  niceToHaveCoverage: number;
  verdict: JDFitVerdict;
  verdictExplanation?: string;
  skills: JDFitSkillDetail[];
  topGaps: JDFitSkillDetail[];
  criticalGaps?: JDFitSkillDetail[];
  summary?: JDFitSummary;
  explanation: string[];
}

export interface ChartSeries {
  name: string;
  data: number[];
  color: string;
}

export interface TrendChartData {
  months: string[];
  series_a: ChartSeries;
  series_b: ChartSeries;
  stat_badge: {
    value: string;
    label: string;
  };
  tagline: string;
  top_growing_skills: Array<{
    name: string;
    growth: string;
    category: string;
  }>;
}

export interface PeerScore {
  name: string;
  score: number;
  avatar: string;
  role: string;
}

export interface RecruiterDashboardData {
  profile: {
    name: string;
    title: string;
    company: string;
    active_listings: number;
    total_applicants: number;
    verified_shortlisted: number;
    interviews_scheduled: number;
  };
  active_jobs: any[];
  top_candidates: Array<{
    student_id: string;
    name: string;
    college: string;
    cgpa: number;
    avatar: string;
    verified_score: number;
    match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    explanation: string;
  }>;
  chart_data: TrendChartData;
}

export interface AcademicianDashboardData {
  profile: {
    name: string;
    title: string;
    college: string;
    total_students: number;
    placement_rate_pct: number;
    average_package_lpa: number;
    industry_partnerships: number;
  };
  curriculum: {
    college_name: string;
    department: string;
    taught_modules: Array<{ subject: string; skills: string[]; hours: number }>;
    missing_industry_skills: Array<{ skill: string; market_demand_increase: string; urgency: string }>;
    overall_curriculum_sync_score: number;
    action_plan: string[];
  };
  chart_data: TrendChartData;
  top_performing_students: StudentProfile[];
}

export interface AdminDashboardData {
  stats: {
    total_verified_students: number;
    registered_colleges: number;
    corporate_partners: number;
    active_internships: number;
    verified_skill_badges_issued: number;
    average_time_to_hire_days: number;
  };
  chart_data: TrendChartData;
  recent_verifications: Array<{ student: string; skill: string; score: number; status: string }>;
  colleges_overview: Array<{ name: string; students: number; placed: number; sync_score: string }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionData?: any;
}

// Workflow & Skill Assessment System Types
export interface ProjectDocFile {
  id?: string;
  file_name: string;
  file_type?: string;
  content: string;
}

export interface ProjectItem {
  id?: string;
  name?: string;
  title?: string;
  description: string;
  github_repo_url: string;
  technologies: string[];
  documentation_files: ProjectDocFile[];
}

export interface ExtractedSkill {
  skill: string;
  sources: string[];
  state: 'DETECTED' | 'SELF_DECLARED' | 'CONFIRMED' | 'ASSESSMENT_VERIFIED';
  is_verified: boolean;
  note?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AssessmentSection {
  skill: string;
  total_questions: number;
  difficulty_distribution: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
  questions: AssessmentQuestion[];
}

export interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

export interface SectionBreakdown {
  skill: string;
  score_pct: number;
  correct_count: number;
  total_questions: number;
  difficulty_breakdown: Record<string, { correct: number; total: number }>;
}

export interface SkillClassification {
  skill: string;
  score: number;
  status: string;
}

export interface CourseRecommendation {
  id: string;
  title: string;
  skill: string;
  provider: string;
  level: string;
  duration: string;
  rating?: number;
  link: string;
}

export type AssessmentProctoringStatus =
  | 'NOT_STARTED'
  | 'SYSTEM_CHECK'
  | 'READY'
  | 'IN_PROGRESS'
  | 'WARNING'
  | 'PAUSED'
  | 'DISQUALIFIED'
  | 'SUBMITTED'
  | 'COMPLETED';

export interface ProctoringConfig {
  maxTabSwitches: number;
  maxFullscreenExits: number;
  maxCameraInterruptions: number;
  maxMicrophoneInterruptions: number;
  gracePeriodSeconds: number;
  autoSaveIntervalSeconds: number;
  maxAllowedViolations: number;
}

export interface AssessmentProctoringEvent {
  id: string;
  assessmentAttemptId: string;
  studentId: string;
  eventType: string;
  timestamp: number;
  severity: 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'DISQUALIFICATION';
  metadata?: Record<string, any>;
  actionTaken: string;
}

export interface SystemCheckState {
  camera: 'IDLE' | 'CHECKING' | 'READY' | 'PERMISSION_REQUIRED' | 'NOT_DETECTED' | 'FAILED';
  microphone: 'IDLE' | 'CHECKING' | 'READY' | 'PERMISSION_REQUIRED' | 'NOT_DETECTED' | 'FAILED';
  browser: 'IDLE' | 'CHECKING' | 'READY' | 'FAILED';
  fullscreen: 'IDLE' | 'CHECKING' | 'READY' | 'FAILED';
  network: 'IDLE' | 'CHECKING' | 'READY' | 'FAILED';
  session: 'IDLE' | 'CHECKING' | 'READY' | 'FAILED';
}

export interface MultiSectionResult {
  status?: string;
  assessment_id: string;
  student_id?: string;
  overall_score: number | null;
  valid_score_available?: boolean;
  proctoring_status?: AssessmentProctoringStatus | string;
  disqualification_reason?: string | null;
  violations?: any[];
  message?: string;
  total_questions: number;
  total_correct: number;
  skill_scores: Record<string, number>;
  section_breakdowns: SectionBreakdown[];
  donut_chart_data: DonutChartItem[];
  strong_skills: SkillClassification[];
  weak_skills: SkillClassification[];
  strongest_skills?: SkillClassification[];
  weakest_skills?: SkillClassification[];
  all_tied?: boolean;
  aggregate_score?: number;
  violation_count?: number;
  max_allowed_violations?: number;
  skills?: any[];
  textual_explanation?: {
    strongest: string;
    weakest: string;
    summary: string;
  };
  recommended_opportunities: MatchedOpportunity[];
  recommended_courses: CourseRecommendation[];
  integrity_score?: number;
  integrity_status?: string;
  integrity_warnings?: number;
  integrity_violations?: number;
  integrity_categories?: {
    camera: number;
    person: number;
    phone: number;
    audio: number;
    browser: number;
    fullscreen: number;
  };
  integrity_timeline?: any[];
}

export interface JobApplication {
  id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  opportunity_id: string;
  company: string;
  title: string;
  match_percentage: number;
  matched_skills?: string[];
  status: string;
  applied_at: string;
  status_history?: Array<{ status: string; updated_at: string; note: string }>;
}

export interface CohortStudent {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  year: string;
  cgpa: number;
  avatar: string;
  verified_score: number;
  assessments_completed: number;
  projects_count: number;
  skills: Record<string, { level: string; score: number; verified: boolean }>;
  strong_skills: string[];
  weak_skills: string[];
  application_status: string;
  target_role: string;
}

export interface CohortSkillGap {
  skill: string;
  average_proficiency: number;
  benchmark_cutoff: number;
  gap_percentage: number;
  status: 'Strong' | 'Medium' | 'Critical Gap';
  students_assessed: number;
}

export interface IndustrySkillDemand {
  skill: string;
  active_postings_requiring: number;
  demand_level: string;
  cohort_average_score: number;
  priority: 'Critical Priority' | 'High Priority' | 'Adequate';
  is_high_priority_gap: boolean;
}

export interface AcademicianRecommendation {
  id: string;
  academician_id: string;
  academician_name: string;
  college: string;
  institution_id: string;
  department_id: string;
  target_type: 'individual' | 'year' | 'cohort';
  target_id: string;
  target_label: string;
  skill: string;
  course_id: string;
  course_title: string;
  provider: string;
  duration: string;
  link: string;
  note: string;
  created_at: string;
}

export interface RecruiterApplicant {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  college: string;
  department: string;
  year: string;
  cgpa: number;
  opportunity_id: string;
  company: string;
  title: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  status: string;
  applied_at: string;
  status_history?: Array<{ status: string; updated_at: string; note: string }>;
  // Step 2 & 4 Additive Cached Snapshot Fields
  jdFitScore?: number | null;
  jdFitVerdict?: JDFitVerdict | string | null;
  jdFitSummary?: JDFitSummary | null;
  jdFitComputedAt?: string | null;
  criticalGaps?: string[];
  critical_gaps?: string[];
  verdictExplanation?: string;
  verdict_explanation?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  department: string;
  status: string;
  is_verified: boolean;
}

export interface AdminInstitution {
  id: string;
  name: string;
  code?: string;
  city: string;
  state: string;
  departments: Array<{ id: string; name: string; institution_id: string; code?: string }>;
  total_students: number;
  total_academicians: number;
}

export interface PostJobPayload {
  title: string;
  company?: string;
  domain?: string;
  location: string;
  work_mode?: string;
  experience?: string;
  stipend: string;
  duration: string;
  type: string;
  required_skills: string[];
  min_skill_proficiencies?: Record<string, number>;
  good_to_have?: string[];
  min_verified_score: number;
  openings: number;
  deadline: string;
  color_theme: 'indigo' | 'pink' | 'peach' | 'sky';
  description: string;
  eligible_streams?: string[];
  eligible_years?: string[];
  skill_requirements?: SkillRequirement[];
  skillRequirements?: SkillRequirement[];
}

// ====================================================
// SKILL INTELLIGENCE & CLOSED LOOP ECOSYSTEM TYPES
// ====================================================

export interface SkillEvidencePoint {
  type: 'ASSESSMENT' | 'CERTIFICATION' | 'GITHUB' | 'PROJECT' | 'RESUME' | 'LINKEDIN' | 'ACADEMIC_RECORD' | 'RECRUITER_FEEDBACK' | string;
  status: 'VERIFIED' | 'EVIDENCE_ONLY' | 'NOT_VERIFIED' | 'PENDING' | 'EXPIRED';
  label: string;
  verified: boolean;
}

export interface SkillPassportItem {
  skillName: string;
  assessmentScore: number;
  assessmentStatus: 'VERIFIED' | 'NOT_VERIFIED';
  overallSkillStatus: string;
  badgeType: 'ASSESSMENT VERIFIED' | 'IMPROVEMENT REQUIRED' | 'PENDING' | string;
  evidencePoints: SkillEvidencePoint[];
  evidenceCounts: {
    assessment: number;
    projects: number;
    github: number;
    certification: number;
    linkedin: number;
    academic: number;
  };
  category: string;
  domain: string;
  lastVerifiedAt?: string | null;
}

export interface CareerPathway {
  targetRole: string;
  overallReadinessPct: number;
  verifiedStrengths: Array<{ skill: string; score: number }>;
  identifiedGaps: Array<{ skill: string; current_score: number; target_score: number; gap: number }>;
  recommendedCourses: Array<{
    skill: string;
    courseTitle: string;
    provider: string;
    duration: string;
    expectedImprovement: string;
  }>;
  targetOpportunities: Array<{ id: string; title: string; company: string; stipend: string }>;
}

export interface SkillHistoryAttempt {
  student_id: string;
  skill: string;
  attempt: number;
  score: number;
  date: string;
}

export interface InstitutionalReadinessComponent {
  name: string;
  score: number;
  weight_pct: number;
  description: string;
}

export interface InstitutionalReadinessIndex {
  has_sufficient_data: boolean;
  overall_index: number;
  overall_score?: number;
  label: string;
  status_label?: string;
  disclaimer: string;
  components: any;
}

export interface CohortComparativeGap {
  skill: string;
  industry_demand_pct: number;
  student_readiness_pct: number;
  gap_percentage_points: number;
  assessed_students: number;
  total_cohort: number;
  is_critical_gap: boolean;
  urgency: string;
}

export interface CohortSkillGapAnalysisResult {
  has_sufficient_data: boolean;
  message?: string;
  cohort_size: number;
  year_filter: string;
  skills: Array<{
    skill: string;
    average_score: number;
    students_assessed: number;
    verified_students_count: number;
    verified_rate_pct: number;
    status: string;
  }>;
  strongest_skills: any[];
  weakest_skills: any[];
  intervention_candidates_count: number;
  intervention_candidates: any[];
  year_comparison_matrix: Array<Record<string, any>>;
}

export interface TrainingInterventionItem {
  id: string;
  institution_id: string;
  college: string;
  department_id: string;
  department: string;
  target_year: string;
  target_cohort?: string;
  skill: string;
  course_title: string;
  provider: string;
  enrolled_students: number;
  students_enrolled?: number;
  before_score: number;
  after_score?: number | null;
  improvement_points?: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  completed_at?: string | null;
  note?: string;
}

export interface RecruitmentOutcomeItem {
  id: string;
  application_id: string;
  opportunity_id?: string;
  candidate_id: string;
  candidate_name: string;
  recruiter_id: string;
  recruiter_name: string;
  company: string;
  role: string;
  outcome: 'SELECTED' | 'REJECTED' | 'SHORTLISTED' | 'OFFERED' | string;
  important_skills: string[];
  skill_readiness?: string;
  interview_readiness?: string;
  technical_gap?: string;
  notes?: string;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: string | null;
  new_value?: string | null;
  timestamp: string;
}

export interface InstitutionSubscriptionItem {
  institution_id: string;
  name: string;
  plan: string;
  status: string;
  entitlements: Record<string, boolean | number>;
  usage_metrics: Record<string, number>;
}

// ====================================================
// FEATURE 1: ANONYMOUS / INCOGNITO TALENT MATCHING
// ====================================================

export type TalentVisibilityMode = 'NORMAL' | 'INCOGNITO' | 'HIDDEN';

export interface TalentVisibilitySettings {
  student_id: string;
  talent_id: string;
  mode: TalentVisibilityMode;
  allow_recruiter_discovery: boolean;
  hide_identity_until_accepted: boolean;
  allow_recruiter_invitations: boolean;
  show_projects_anonymously: boolean;
  show_research_anonymously: boolean;
  research_interests: string[];
  availability: string;
  achievements: string[];
  updated_at?: string;
}

export interface IncognitoTalentCandidate {
  talent_id: string;
  verified_score: number;
  skills: Array<{
    skill: string;
    score: number;
    level: string;
    verified: boolean;
    project_verified?: boolean;
  }>;
  project_experience: Array<{
    project_id?: string;
    project_title: string;
    project_type?: string;
    domain?: string;
    role?: string;
    contribution: string;
    verified_skills_awarded?: string[];
    status?: string;
  }>;
  research_interests: string[];
  education_level: string;
  stream?: string;
  year?: string;
  cgpa?: number;
  institution?: string;
  privacy_safe_location?: string;
  availability: string;
  achievements: string[];
  target_role?: string;
  ai_match?: {
    opportunity_id: string;
    opportunity_title: string;
    company: string;
    match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    proficiency_gaps: Array<{
      skill: string;
      required_score: number;
      student_score: number;
      gap: number;
    }>;
    explanation: string;
  };
  invitation_status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | null;
  invitation_id?: string | null;
  identity_revealed: boolean;
  student_id?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

export interface TalentInvitation {
  id: string;
  talent_id: string;
  student_id?: string;
  recruiter_id: string;
  recruiter_name?: string;
  recruiter_email?: string;
  company: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_location?: string;
  opportunity_stipend?: string;
  opportunity_type?: string;
  match_percentage: number;
  matched_skills: string[];
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  created_at: string;
  responded_at?: string | null;
  identity_revealed?: boolean;
  student_name?: string | null;
  student_email?: string | null;
  student_college?: string | null;
}

export interface IdentityRevealConsent {
  id: string;
  student_id: string;
  talent_id: string;
  recruiter_id: string;
  recruiter_email?: string;
  opportunity_id: string;
  student_consent: boolean;
  identity_reveal_requested_at: string;
  identity_revealed_at?: string;
}

// ====================================================
// FEATURE 2: PROJECT & RESEARCH COLLABORATION HUB
// ====================================================

export type CollaborationProjectType = 
  | 'Research Project'
  | 'Capstone Project'
  | 'Industry Project'
  | 'Innovation Project'
  | 'Open Challenge'
  | 'Internship Project';

export interface ProjectTeamMember {
  student_id?: string | null;
  talent_id: string;
  student_name?: string | null;
  student_avatar?: string;
  role: string;
  joined_at?: string;
  contribution?: string;
  verified_skills_awarded?: string[];
  evaluated?: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  deliverable?: string | null;
  feedback?: string | null;
  completed_at?: string | null;
}

export interface ProjectEvidence {
  id: string;
  student_id: string;
  talent_id?: string;
  title: string;
  github_url?: string;
  description: string;
  file_url?: string;
  submitted_at: string;
}

export interface ProjectEvaluation {
  student_id: string;
  talent_id?: string;
  evaluated_by: string;
  grade: string;
  skills_verified: string[];
  feedback: string;
  timestamp: string;
}

export interface ProjectJoinRequest {
  id: string;
  student_id: string;
  talent_id?: string;
  student_name?: string;
  student_email?: string;
  department?: string;
  year?: string;
  cgpa?: number;
  verified_score?: number;
  role: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  requested_at: string;
}

export interface ProjectSponsorshipInterest {
  id: string;
  recruiter_id: string;
  company: string;
  recruiter_name?: string;
  recruiter_email?: string;
  type: string;
  message: string;
  status: 'Requested' | 'Under Review' | 'Accepted' | 'Rejected' | 'Completed';
  created_at: string;
}

export interface CollaborationProject {
  id: string;
  title: string;
  type: CollaborationProjectType | string;
  description: string;
  problem_statement: string;
  research_area: string;
  domain: string;
  academician_id?: string;
  academician_name?: string;
  mentor_email?: string;
  college: string;
  institution_id?: string;
  department: string;
  department_id?: string;
  required_skills: string[];
  preferred_skills: string[];
  team_size: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  start_date: string;
  expected_end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'INSTITUTION_ONLY';
  expected_deliverables: string;
  team: ProjectTeamMember[];
  join_requests?: ProjectJoinRequest[];
  milestones: ProjectMilestone[];
  evidence_submissions?: ProjectEvidence[];
  evaluations?: ProjectEvaluation[];
  sponsorship_interests?: ProjectSponsorshipInterest[];
  created_at?: string;
  
  // Dynamic client/UI computed attributes
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  matched_preferred_skills?: string[];
  progress_percentage?: number;
  is_team_member?: boolean;
  has_pending_request?: boolean;
  team_spots_left?: number;
  explanation?: string;
}

// ====================================================
// LINKEDIN OAUTH 2.0 / OPENID CONNECT TYPES
// ====================================================

export type LinkedInConnectionStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';

export interface LinkedInConnectionProfile {
  student_id: string;
  linkedin_subject_id: string;
  linkedin_profile_url?: string;
  linkedin_name: string;
  linkedin_email?: string;
  linkedin_email_verified: boolean;
  linkedin_picture_url?: string;
  linkedin_connected_at: number;
  linkedin_updated_at: number;
  connection_status: LinkedInConnectionStatus;
  scope: string;
}

export interface LinkedInStatusData {
  student_id: string;
  connected: boolean;
  status: LinkedInConnectionStatus;
  connection?: LinkedInConnectionProfile | null;
  last_synchronized?: string | null;
  granted_scopes: string[];
  available_fields: string[];
  unavailable_fields: {
    skills: string;
    experience: string;
    education: string;
    certifications: string;
  };
  evidence_source_status: string;
}
