export type VocabCategory =
  | 'hangeul'
  | 'greetings'
  | 'food'
  | 'numbers'
  | 'daily'
  | 'shopping'
  | 'travel'
  | 'family'
  | 'emotions'
  | 'work'
  | 'verbs'
  | 'adjectives';

export interface Flashcard {
  id: string;
  hangul: string;
  romanization: string;
  vietnamese: string;
  category: VocabCategory;
  partOfSpeech?: 'Danh từ' | 'Động từ' | 'Tính từ' | 'Phó từ' | 'Đại từ' | 'Cụm từ';
  topikLevel?: 'Sơ cấp 1' | 'Sơ cấp 2' | 'Trung cấp';
  exampleKo: string;
  exampleVi: string;
  tips?: string;
  isMastered?: boolean;
  isCustomAdmin?: boolean;
  addedAt?: string;
}

export type SocialAuthProvider = 'gmail' | 'facebook' | 'apple' | 'zing_id';

export type UserRole = 'admin' | 'student';
export type AdminLevel = 'main' | 'sub';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: SocialAuthProvider;
  role: UserRole;
  adminLevel?: AdminLevel; // 'main': Admin Chính (Trần Bảo Ngọc), 'sub': Admin Phụ (Yến Nhi, Tuyết Lệ, Gia Linh)
  isServerAdmin: boolean; // True for designated admins
  password?: string; // Mật khẩu đăng nhập của người dùng
  loggedInAt: string;
  totalXp?: number;
  streak?: number;
  status?: 'active' | 'suspended';
  createdAt?: string;
}

// Backward compatibility alias
export type AdminUser = AppUser;

export type VipPackageType = '1month' | '3months' | '12months';

export interface VipSubscription {
  packageType: VipPackageType;
  packageName: string;
  startDate: string;
  expiryDate: string;
  price: number;
  paymentMethod: string;
  isActive: boolean;
  daysRemaining: number;
}

export type QuizType = 'choice' | 'arrange' | 'match';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  category: string;
  prompt: string;
  audioText?: string;
  options?: string[]; // for choice
  answer: string | string[]; // string for choice, array of words in order for arrange
  scrambleWords?: string[]; // for arrange
  explanation: string;
}

export interface MatchPair {
  id: string;
  hangul: string;
  vietnamese: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  koreanTitle: string;
  icon: string;
  badge: string;
  description: string;
  isVipOnly?: boolean;
  levelCategory?: 'free' | 'advanced';
  initialMessage: {
    korean: string;
    romanization: string;
    vietnamese: string;
    suggestedReplies: Array<{ korean: string; vietnamese: string }>;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  korean: string;
  romanization?: string;
  vietnamese?: string;
  feedback?: string;
  suggestedReplies?: Array<{ korean: string; vietnamese: string }>;
  timestamp: number;
}

export type GrammarCategory =
  | 'particle'
  | 'tense'
  | 'negation'
  | 'formality'
  | 'connector'
  | 'intention'
  | 'honorific'
  | 'contrast'
  | 'condition'
  | 'purpose'
  | 'obligation'
  | 'conjecture'
  | 'modifier'
  | 'passive_causative'
  | 'indirect_speech';

export type GrammarLevel = 'beginner' | 'intermediate' | 'advanced';

export interface GrammarRule {
  id: string;
  title: string;
  category: GrammarCategory | string;
  level?: GrammarLevel;
  levelLabel?: string;
  formula: string;
  explanationVi: string;
  mistakeExample?: string;
  correctExample?: string;
  mistakeWhyVi?: string;
  realLifeUsage: Array<{ ko: string; vi: string }>;
  proTip?: string;
}

export interface GrammarCheckResult {
  isCorrect: boolean;
  correctedSentence: string;
  romanization: string;
  vietnameseMeaning: string;
  explanationVi: string;
  grammarRuleTip: string;
  naturalAlternatives: Array<{ korean: string; vietnamese: string }>;
  vocabularyBreakdown: Array<{ word: string; type: string; meaning: string }>;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  league: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';
  isUser?: boolean;
  change?: 'up' | 'down' | 'same';
}

export interface UserProgress {
  streak: number;
  lastActiveDate: string;
  activeDates: string[]; // YYYY-MM-DD
  totalXp: number;
  dailyXp: number;
  dailyGoalXp: number;
  masteredCards: string[];
  reviewedCards: string[];
  savedMistakes: Array<{
    id: string;
    sentence: string;
    correction: string;
    note: string;
    date: string;
  }>;
  bookmarkedRules: string[];
  bookmarkedVocabIds?: string[];
  totalQuestionsAnswered: number;
  correctQuestionsAnswered: number;
  completedStageIds: string[];
  unlockedBadgeIds: string[];
}

export interface IllustratedVocab {
  id: string;
  wordKo: string;
  romanization: string;
  meaningVi: string;
  category: 'food' | 'animals' | 'cafe' | 'school' | 'feelings' | 'seasons' | 'daily';
  categoryLabel: string;
  cuteEmoji: string;
  illustrationUrl: string;
  themeColor: string; // e.g., 'rose', 'amber', 'emerald', 'sky', 'purple', 'indigo'
  exampleKo: string;
  exampleVi: string;
  cuteNote: string;
  tags?: string[];
}

export interface KoreanRiddle {
  id: string;
  questionKo: string;
  questionVi: string;
  hint: string;
  answerKo: string;
  romanization: string;
  answerVi: string;
  punExplanation: string;
  category: 'wordplay' | 'daily' | 'culture' | 'funny' | 'nature';
}

export interface EmojiPuzzle {
  id: string;
  emojis: string;
  clueVi: string;
  wordKo: string;
  romanization: string;
  meaningVi: string;
  scrambledLetters: string[];
  category: string;
}

export interface WordGuessPuzzle {
  id: string;
  clueVi: string;
  category: string;
  wordKo: string;
  romanization: string;
  meaningVi: string;
  candidateSyllables: string[];
}

// FARMING & FISHING GAME TYPES
export interface CropType {
  id: string;
  nameKo: string;
  nameVi: string;
  romanization: string;
  emoji: string;
  seedCost: number;
  xpReward: number;
  coinReward: number;
  quizQuestionKo: string;
  quizQuestionVi: string;
  options: string[];
  correctIndex: number;
  factKo: string;
}

export interface FarmPlot {
  id: number;
  cropId: string | null;
  stage: 'empty' | 'seed' | 'growing' | 'ready';
  plantedAt?: number;
  needsAction?: 'water' | 'fertilize' | 'harvest' | null;
}

export interface FishSpecies {
  id: string;
  nameKo: string;
  nameVi: string;
  romanization: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  xpReward: number;
  coinReward: number;
  descriptionVi: string;
  habitKo: string;
  speed: number;
}

export interface FishingChallenge {
  questionKo: string;
  questionVi: string;
  options: Array<{ text: string; isCorrect: boolean }>;
}

// SOCIAL STUDY NETWORK TYPES
export interface StudyFriend {
  id: string;
  name: string;
  handle: string;
  avatarEmoji: string;
  avatarBg: string;
  level: number;
  streak: number;
  xp: number;
  statusMsg: string;
  isOnline: boolean;
  friendStatus: 'friend' | 'pending' | 'none';
  bioKo?: string;
  favoriteWord?: string;
  lastActive: string;
}

export interface SocialComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorLevel: number;
  authorBadge?: string;
  contentKo: string;
  contentVi: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  cheers: {
    bananaMilk: number;
    highFive: number;
    firework: number;
  };
  hasCheered?: {
    bananaMilk?: boolean;
    highFive?: boolean;
    firework?: boolean;
  };
  comments: SocialComment[];
  achievement?: {
    type: string;
    title: string;
    icon: string;
  };
}

// ROADMAP & LEARNING PATH TYPES
export interface RoadmapLesson {
  title: string;
  contentKo: string;
  romanization: string;
  meaningVi: string;
  explanation: string;
}

export interface RoadmapQuizItem {
  question: string;
  audioKo?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  koreanTitle: string;
  icon: string;
  themeColor: string;
  description: string;
  xpReward: number;
  requiredStageId: string | null;
  lessons: RoadmapLesson[];
  checkpointQuiz: RoadmapQuizItem[];
  levelCategory?: 'beginner' | 'intermediate1' | 'intermediate2' | 'advanced';
  levelLabel?: string;
}

// TOPIK TEST TYPES
export interface TopikQuestion {
  id: string;
  category: 'Từ vựng' | 'Ngữ pháp' | 'Đọc hiểu' | 'Hội thoại' | 'Thành ngữ' | 'Điền khuyết' | string;
  questionKo: string;
  questionVi?: string;
  audioText?: string;
  passageKo?: string;
  options: string[];
  correctIndex: number;
  explanationVi: string;
}

export interface TopikTest {
  id: string;
  level: 'topik-1' | 'topik-2' | 'topik-intermediate' | 'topik-advanced' | string;
  levelLabel: string;
  title: string;
  durationMinutes: number;
  targetScore: number;
  description: string;
  questions: TopikQuestion[];
}

// BADGE / DANH HIỆU
export interface AchievementBadge {
  id: string;
  title: string;
  koreanTitle: string;
  icon: string;
  description: string;
  criteria: string;
  category: 'streak' | 'accuracy' | 'vocab' | 'topik' | 'game' | 'community' | 'humor' | 'milestone' | 'culture';
}

// LEARNING TIPS
export interface LearningTip {
  id: string;
  title: string;
  koreanTitle: string;
  icon: string;
  category: 'pronunciation' | 'vocab' | 'topik' | 'grammar';
  summary: string;
  keyPoints: string[];
  exampleKo?: string;
  exampleVi?: string;
}

