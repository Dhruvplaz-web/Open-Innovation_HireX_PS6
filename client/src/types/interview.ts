export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewQuestion {
  index: number;
  question: string;
  category: string;
  hints?: string[];
  expected_concepts?: string[];
  model_answer?: string;
  interviewer_note?: string;
  student_answer?: string;
  answered_at?: number;
  audio_duration_seconds?: number;
  evaluation?: AnswerEvaluation;
}

export interface AnswerEvaluation {
  technical_score: number;
  problem_solving_score: number;
  relevance_score: number;
  communication_score: number;
  practical_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  keywords_detected: string[];
  concepts_missed: string[];
  model_answer?: string;
}

export interface DailyPrepTask {
  day: string;
  focus: string;
  action: string;
}

export interface FinalInterviewReport {
  overall_score: number;
  max_score: number;
  verdict: string;
  total_questions_answered: number;
  category_scores: {
    technical_depth: number;
    problem_solving: number;
    relevance: number;
    communication: number;
    industry_knowledge: number;
  };
  strengths: string[];
  areas_for_improvement: string[];
  recommended_topics: string[];
  personalized_preparation_plan: DailyPrepTask[];
  ai_engine_used: string;
}

export interface InterviewSession {
  id: string;
  student_id: string;
  role: string;
  round: string;
  difficulty: InterviewDifficulty;
  experience_level: string;
  duration_minutes: number;
  target_company: string;
  job_description?: string;
  resume_text?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  current_question_index: number;
  target_question_count: number;
  questions: InterviewQuestion[];
  overall_evaluation?: FinalInterviewReport | null;
  created_at: number;
  updated_at: number;
  ai_engine?: string;
}

export interface InterviewConfig {
  status: string;
  has_live_llm: boolean;
  active_provider: string;
  model: string;
  fallback_mode: string;
  supported_roles: string[];
  supported_rounds: string[];
  supported_difficulties: string[];
  supported_durations: number[];
}
