export type Difficulty = 'easy' | 'medium' | 'hard';

export type DiagramType = 'chart' | 'family_tree' | 'direction_compass' | 'svg' | 'table';

export interface Question {
  id: string;
  topic: string;
  topicName: string;
  subTopic: string;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  shortcut?: string;
  diagramType?: DiagramType;
  diagramData?: any;
  source: string;
}

export interface UserProgress {
  userId: string;
  topic: string;
  attemptedIds: string[];
  correct: number;
  total: number;
  avgTime: number; // in seconds
  bookmarkedIds?: string[];
}

export interface TopicInfo {
  id: string;
  title: string;
  shortDescription: string;
  subTopics: string[];
  icon: string;
  color: string;
  accentBg: string;
  totalQuestions: number;
}

export interface CognitiveSkillScores {
  memory: number; // 0-100
  speed: number;  // 0-100
  logic: number;  // 0-100
  focus: number;  // 0-100
  risk: number;   // 0-100
  spatial: number;// 0-100
}

export interface GameMetadata {
  id: string;
  name: string;
  skill: string;
  skillCategory: 'Memory' | 'Speed' | 'Logic' | 'Focus' | 'Risk' | 'Spatial';
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Fast-Paced' | 'Challenging';
  description: string;
  mncReference: string; // e.g. "pymetrics / Arctic Shores / Cubiks"
  skillsEvaluated: string[];
  bestScore?: number;
  iconName: string;
}

export interface GameResult {
  gameId: string;
  gameName: string;
  score: number;
  accuracyPct: number;
  reactionTimeMs?: number;
  roundsCompleted: number;
  percentile: number;
  skills: CognitiveSkillScores;
  tips: string[];
  roleMatches: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
