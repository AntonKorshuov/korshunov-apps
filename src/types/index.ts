export type TopicId = 
  | 'stellenwert'
  | 'runden'
  | 'schriftlich_plus_minus'
  | 'schriftlich_mal'
  | 'schriftlich_geteilt'
  | 'groessen_laengen'
  | 'groessen_gewichte_geld'
  | 'groessen_zeit'
  | 'geometrie'
  | 'sachaufgaben_fussball';

export type TaskType = 'number' | 'choice' | 'place_value' | 'conversion';

export interface Exercise {
  id: string;
  topicId: TopicId;
  title: string;
  question: string;
  taskType: TaskType;
  options?: string[];
  correctAnswer: string | number;
  unit?: string;
  hint: string;
  explanation: string;
  footballStory?: string;
  stepData?: {
    num1?: number;
    num2?: number;
    operator?: '+' | '-' | '*' | '/';
    placeValueDigits?: Record<string, number>;
  };
}

export interface TopicInfo {
  id: TopicId;
  title: string;
  subTitle: string;
  category: 'Arithmetik' | 'Größen' | 'Geometrie' | 'Sachaufgaben';
  iconName: string;
  order: number;
  unlockedStarsRequired: number;
  description: string;
  standardFormula?: string;
}

export interface UserStats {
  name: string;
  favoriteClub: string;
  goalsScored: number;
  championshipPoints: number;
  currentStreak: number;
  lastPlayedDate: string;
  parentPin?: string; // PIN for parent menu
  topicProgress: Record<string, {
    stars: number; // 0, 1, 2, 3
    correctCount: number;
    totalAttempted: number;
    highScore: number;
  }>;
  trophies: {
    id: string;
    title: string;
    description: string;
    unlockedAt?: string;
  }[];
  geminiApiKey?: string;
}

export interface MessageFeedback {
  type: 'hint' | 'explanation' | 'encouragement';
  text: string;
  isAiGenerated?: boolean;
}
