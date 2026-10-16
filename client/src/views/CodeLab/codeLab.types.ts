/**
 * Algorithmic Code Lab & AST Auditor — TypeScript Type Definitions
 */

export type CodeLabMode =
  | 'prove_my_skills'
  | 'practice'
  | 'standard_coding'
  | 'debugging'
  | 'optimization'
  | 'code_review'
  | 'sql'
  | 'interview'
  | 'missions'
  | 'matrix';

export type ChallengeType =
  | 'STANDARD_CODING'
  | 'FUNCTION_IMPLEMENTATION'
  | 'DEBUGGING'
  | 'CODE_REVIEW'
  | 'OPTIMIZATION'
  | 'SQL'
  | 'PROJECT'
  | 'INTERVIEW';

export interface CodingTestCase {
  test_case_id: number;
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
  is_hidden: boolean;
  description?: string;
  category: 'visible' | 'hidden' | 'edge' | 'performance';
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  language: string;
  category: string;
  topic: string;
  skills: string[];
  subskills?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Hard' | 'Expert';
  estimated_time_minutes: number;
  starter_code: string;
  visible_tests: CodingTestCase[];
  hidden_tests_count?: number;
  edge_tests_count?: number;
  expected_time_complexity?: string;
  expected_space_complexity?: string;
  rubric?: Record<string, number>;
  hints?: string[];
  broken_code?: string;
  review_checklist?: string[];
  sql_schema?: string;
  interview_questions?: string[];
}

export interface AnalyzedSkillItem {
  skill: string;
  claimed_or_observed_score: number | null;
  sources: string[];
  evidence_strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNASSESSED';
  status_badge: string;
  status_color: string;
  validation_priority: string;
  is_career_target: boolean;
}

export interface ProveMySkillsAnalysis {
  student_id: string;
  student_name: string;
  target_career: string;
  total_skills_detected: number;
  strongly_supported_count: number;
  requires_validation_count: number;
  headline: string;
  skills: AnalyzedSkillItem[];
}

export interface MultiDimensionalScores {
  correctness: number;
  efficiency: number;
  code_quality: number;
  edge_cases: number;
  problem_solving: number;
}

export interface CodeLabSubmissionResult {
  id: string;
  student_id: string;
  challenge_id: string;
  challenge_title: string;
  primary_skill: string;
  challenge_type: ChallengeType;
  language: string;
  mode: string;
  all_passed: boolean;
  visible_tests_passed: string;
  hidden_tests_passed: string;
  edge_tests_passed: string;
  composite_score: number;
  multi_dimensional_scores: MultiDimensionalScores;
  ast_report: {
    language: string;
    cyclomatic_complexity: number;
    maintainability_index: number;
    time_complexity: string;
    space_complexity: string;
    complexity_rating: string;
    code_quality_score: number;
    security_issues?: string[];
    code_smells?: string[];
    loop_depth?: number;
    recursion_detected?: boolean;
    recommendations?: string[];
  };
  execution_duration_ms: number;
  sha256_proof: string;
  submitted_at: string;
  test_results: CodingTestCase[];
}

export interface CodingMissionStep {
  step_number: number;
  title: string;
  challenge_id: string;
  completed: boolean;
}

export interface CodingMission {
  id: string;
  title: string;
  track: string;
  description: string;
  skills_awarded: string[];
  steps: CodingMissionStep[];
  progress_pct: number;
}

export interface MistakePattern {
  category: string;
  status: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  recommended_action: string;
}

export interface SkillTestingMatrixRow {
  skill: string;
  resume_claim: string;
  aptitude_score: number | null;
  code_lab_score: number | null;
  project_evidence: string;
  github_evidence: string;
  evidence_strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNASSESSED';
}

export interface CodeLabOverview {
  student_id: string;
  overall_readiness: number;
  skill_breakdown: Record<string, number>;
  strongest_skill: string;
  biggest_gap: string;
  total_challenges_completed: number;
  evidence_analysis: ProveMySkillsAnalysis;
  recommended_challenge: {
    selected_challenge: CodingChallenge;
    recommendation_score: number;
    primary_skill: string;
    reason: string;
    metrics: Record<string, number>;
    mode: string;
  };
  missions: CodingMission[];
  mistake_patterns: MistakePattern[];
}
