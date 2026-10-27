import { UserProgress } from '../types';

const STORAGE_PREFIX = 'korean_journey_progress_user_';
const GLOBAL_PROGRESS_KEY = 'korean_journey_progress_v2';

export const getDefaultProgress = (todayStr: string = new Date().toISOString().split('T')[0]): UserProgress => ({
  streak: 1,
  lastActiveDate: todayStr,
  activeDates: [todayStr],
  totalXp: 0,
  dailyXp: 0,
  dailyGoalXp: 50,
  masteredCards: [],
  reviewedCards: [],
  savedMistakes: [],
  bookmarkedRules: [],
  completedStageIds: ['stage-1'],
  unlockedBadgeIds: ['badge-newbie'],
  totalQuestionsAnswered: 0,
  correctQuestionsAnswered: 0,
});

/**
 * Loads learning progress for a specific user.
 * Tries server first, then user-keyed local storage, then default.
 */
export async function loadUserLearningProgress(
  userId: string,
  email?: string
): Promise<UserProgress> {
  const todayStr = new Date().toISOString().split('T')[0];
  const userKey = `${STORAGE_PREFIX}${userId}`;

  // 1. Try local storage for this specific user
  let localProgress: UserProgress | null = null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        localProgress = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local user progress:', e);
      }
    }
  }

  // 2. Try fetching from system server
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.found && data.record?.progress) {
        const serverProgress: UserProgress = data.record.progress;
        // Merge with local if local has higher XP/newer activity
        if (!localProgress || (serverProgress.totalXp >= (localProgress.totalXp || 0))) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(userKey, JSON.stringify(serverProgress));
          }
          return serverProgress;
        }
      }
    }
  } catch (err) {
    console.warn('Could not reach progress server, using local fallback:', err);
  }

  if (localProgress) {
    return localProgress;
  }

  // Fallback to default
  const defaultProg = getDefaultProgress(todayStr);
  if (typeof window !== 'undefined') {
    localStorage.setItem(userKey, JSON.stringify(defaultProg));
  }
  return defaultProg;
}

/**
 * Saves user progress to both local storage (user-keyed) AND the system server.
 */
export async function saveUserLearningProgress(
  userId: string,
  email: string,
  userName: string,
  progress: UserProgress,
  gameData?: any
): Promise<void> {
  const userKey = `${STORAGE_PREFIX}${userId}`;

  // 1. Save to local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(userKey, JSON.stringify(progress));
    localStorage.setItem(GLOBAL_PROGRESS_KEY, JSON.stringify(progress));
  }

  // 2. Save to system backend server asynchronously
  try {
    await fetch('/api/progress/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        userName,
        progress,
        gameData,
      }),
    });
  } catch (err) {
    console.warn('Background sync of user progress to server failed:', err);
  }
}

/**
 * Fetch real active students registered in the system for 1v1 PvP
 */
export async function fetchRealStudentsForPvp(): Promise<any[]> {
  try {
    const res = await fetch('/api/pvp/real-students');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.students)) {
        return data.students;
      }
    }
  } catch (e) {
    console.error('Error fetching real students for PvP:', e);
  }
  return [];
}

/**
 * Record a 1v1 PvP match result
 */
export async function recordPvpMatchResult(matchData: {
  userId: string;
  rivalId: string;
  rivalName: string;
  userScore: number;
  rivalScore: number;
  winner: 'user' | 'rival' | 'draw';
  rewardCoins: number;
}): Promise<void> {
  try {
    await fetch('/api/pvp/record-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    });
  } catch (e) {
    console.error('Error logging PvP match to server:', e);
  }
}
