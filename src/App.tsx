import React, { useState, useEffect } from 'react';
import { Navbar, MainAppTab } from './components/Navbar';
import { LearningRoadmapView } from './components/LearningRoadmapView';
import { VocabularyHubView } from './components/VocabularyHubView';
import { ProfileHubView } from './components/ProfileHubView';
import { StreakModal } from './components/StreakModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { PlayerManagementModal } from './components/PlayerManagementModal';
import { AiConversationView } from './components/AiConversationView';
import { INITIAL_FLASHCARDS } from './data/flashcards';
import { UserProgress, Flashcard, AppUser, SocialAuthProvider } from './types';
import {
  getCurrentUserSession,
  setCurrentUserSession,
  clearCurrentUserSession,
  isDesignatedAdminEmail,
  loginUser,
  registerUser,
  updatePlayer
} from './services/authService';
import { playSuccessSound } from './utils/audio';

const STORAGE_KEY = 'korean_journey_progress_v2';
const FLASHCARDS_STORAGE_KEY = 'korean_journey_custom_cards_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainAppTab>('learning');
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlayerManagementOpen, setIsPlayerManagementOpen] = useState(false);

  // User State: Persisted in localStorage via authService so user doesn't need to log in again on return
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    return getCurrentUserSession();
  });

  // Dynamic Flashcards state (includes 1000+ authentic Korean words)
  const [cards, setCards] = useState<Flashcard[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_FLASHCARDS;
  });

  // Persist flashcards
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards]);

  // Keep session synced
  const handleUserLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentUserSession(user);
  };

  const handleUserLogout = () => {
    clearCurrentUserSession();
    setCurrentUser(null);
  };

  // Quick social login fallback with password verification
  const handleUserSocialLogin = (
    provider: SocialAuthProvider,
    email: string,
    name: string,
    password?: string
  ) => {
    if (!password) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = loginUser(email, password);
    if (res.success && res.user) {
      handleUserLoginSuccess(res.user);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Check admin authorization
  const isAuthorizedAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        currentUser.isServerAdmin ||
        isDesignatedAdminEmail(currentUser.email))
  );

  // Add card by Admin
  const handleAddCard = (newCardData: Omit<Flashcard, 'id'>) => {
    if (!isAuthorizedAdmin) {
      alert('Quyền hạn chế: Chỉ 4 Quản Trị Viên được chỉ định mới có quyền thêm từ vựng mới!');
      return;
    }
    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      ...newCardData,
      isCustomAdmin: true,
      addedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setCards((prev) => [newCard, ...prev]);
    handleAddXp(20);
  };

  // Update card by Admin
  const handleUpdateCard = (updatedCard: Flashcard) => {
    if (!isAuthorizedAdmin) {
      alert('Quyền hạn chế: Chỉ 4 Quản Trị Viên được chỉ định mới có quyền chỉnh sửa từ vựng!');
      return;
    }
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  // Delete card by Admin
  const handleDeleteCard = (cardId: string) => {
    if (!isAuthorizedAdmin) {
      alert('Quyền hạn chế: Chỉ 4 Quản Trị Viên được chỉ định mới có quyền xóa từ vựng!');
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Reset cards back to initial dataset of 1000+ words
  const handleResetCards = () => {
    if (!isAuthorizedAdmin) {
      alert('Chỉ Quản Trị Viên mới có quyền khôi phục mặc định!');
      return;
    }
    setCards(INITIAL_FLASHCARDS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FLASHCARDS_STORAGE_KEY);
    }
  };

  // Initialize progress from LocalStorage or default values
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved progress', e);
        }
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    return {
      streak: 5,
      lastActiveDate: todayStr,
      activeDates: [todayStr],
      totalXp: 1650,
      dailyXp: 45,
      dailyGoalXp: 50,
      masteredCards: ['hg-1', 'gr-1', 'fd-1', 'act-1'],
      reviewedCards: [],
      savedMistakes: [
        {
          id: 'sm-1',
          sentence: '저는 학교에 공부해요.',
          correction: '저는 학교에서 공부해요.',
          note: 'Khi diễn ra hành động học tập (공부하다), phải dùng tiểu từ "에서" thay vì "에".',
          date: 'Hôm qua',
        },
      ],
      bookmarkedRules: ['gr-eun-neun-vs-i-ga', 'gr-e-vs-eseo'],
      completedStageIds: ['stage-1'],
      unlockedBadgeIds: ['badge-newbie'],
      totalQuestionsAnswered: 24,
      correctQuestionsAnswered: 21,
    };
  });

  // Save progress changes to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    // Also sync with user session if logged in
    if (currentUser) {
      updatePlayer(currentUser.id, {
        totalXp: progress.totalXp,
        streak: progress.streak,
      });
    }
  }, [progress.totalXp, progress.streak]);

  // Check and increment daily streak on new day
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (progress.lastActiveDate !== todayStr) {
      setProgress((prev) => ({
        ...prev,
        lastActiveDate: todayStr,
        dailyXp: 0,
        streak: prev.streak + 1,
        activeDates: Array.from(new Set([...prev.activeDates, todayStr])),
      }));
    }
  }, [progress.lastActiveDate]);

  // XP Handler
  const handleAddXp = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      totalXp: prev.totalXp + amount,
      dailyXp: prev.dailyXp + amount,
    }));
  };

  // Record quiz / test questions answered (tracks accuracy % and total count)
  const handleRecordQuizResult = (isCorrect: boolean) => {
    setProgress((prev) => ({
      ...prev,
      totalQuestionsAnswered: (prev.totalQuestionsAnswered || 0) + 1,
      correctQuestionsAnswered: (prev.correctQuestionsAnswered || 0) + (isCorrect ? 1 : 0),
    }));
  };

  // Complete a stage in Learning Roadmap
  const handleCompleteStage = (stageId: string) => {
    setProgress((prev) => {
      const already = prev.completedStageIds?.includes(stageId);
      if (already) return prev;
      return {
        ...prev,
        completedStageIds: [...(prev.completedStageIds || []), stageId],
      };
    });
  };

  // Unlock achievement badge
  const handleUnlockBadge = (badgeId: string) => {
    setProgress((prev) => {
      const already = prev.unlockedBadgeIds?.includes(badgeId);
      if (already) return prev;
      playSuccessSound();
      return {
        ...prev,
        unlockedBadgeIds: [...(prev.unlockedBadgeIds || []), badgeId],
      };
    });
  };

  // Flashcard Mastered Toggle
  const handleToggleMastered = (cardId: string) => {
    setProgress((prev) => {
      const exists = prev.masteredCards.includes(cardId);
      return {
        ...prev,
        masteredCards: exists
          ? prev.masteredCards.filter((id) => id !== cardId)
          : [...prev.masteredCards, cardId],
      };
    });
  };

  // Bookmark Grammar Rule Toggle
  const handleToggleBookmarkRule = (ruleId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarkedRules.includes(ruleId);
      return {
        ...prev,
        bookmarkedRules: exists
          ? prev.bookmarkedRules.filter((id) => id !== ruleId)
          : [...prev.bookmarkedRules, ruleId],
      };
    });
  };

  // Save mistake to personal notebook
  const handleSaveMistake = (mistake: { sentence: string; correction: string; note: string }) => {
    const newEntry = {
      id: `mistake-${Date.now()}`,
      ...mistake,
      date: 'Hôm nay',
    };
    setProgress((prev) => ({
      ...prev,
      savedMistakes: [newEntry, ...prev.savedMistakes],
    }));
  };

  // Delete mistake from notebook
  const handleDeleteMistake = (id: string) => {
    setProgress((prev) => ({
      ...prev,
      savedMistakes: prev.savedMistakes.filter((m) => m.id !== id),
    }));
  };

  // Compute accuracy
  const totalAnswered = progress.totalQuestionsAnswered || 0;
  const correctCount = progress.correctQuestionsAnswered || 0;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-sky-200 selection:text-sky-900">
      {/* Top Navigation Bar with 3 Main Tabs: Học tập, Từ vựng & ngữ pháp, Tôi */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={progress.streak}
        totalXp={progress.totalXp}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPlayerManagement={() => setIsPlayerManagementOpen(true)}
        isAdminLoggedIn={isAuthorizedAdmin}
        accuracyPercent={accuracyPercent}
      />

      {/* Main Content Area: Responsive layout compatible with phone, tablet (iPad), and laptop */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-12">
        {/* TAB 1: HỌC TẬP - LỘ TRÌNH ĐƯỜNG ĐI */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <LearningRoadmapView
              completedStageIds={progress.completedStageIds || []}
              onCompleteStage={handleCompleteStage}
              onAddXp={handleAddXp}
              onRecordQuizResult={handleRecordQuizResult}
              onUnlockBadge={handleUnlockBadge}
            />
          </div>
        )}

        {/* TAB 2: TỪ VỰNG & NGỮ PHÁP (TỪ VỰNG HƠN 1000 TỪ & ÔN TẬP) */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-6">
            <VocabularyHubView
              cards={cards}
              masteredCardIds={progress.masteredCards}
              onToggleMastered={handleToggleMastered}
              onAddXp={handleAddXp}
              onRecordQuizResult={handleRecordQuizResult}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              bookmarkedRuleIds={progress.bookmarkedRules || []}
              onToggleBookmarkRule={handleToggleBookmarkRule}
              savedMistakes={progress.savedMistakes || []}
              onSaveMistake={handleSaveMistake}
              onDeleteMistake={handleDeleteMistake}
            />
          </div>
        )}

        {/* TAB 3: GIAO TIẾP - HỘI THOẠI AI KHÔNG GIỚI HẠN */}
        {activeTab === 'conversation' && (
          <div className="space-y-6">
            <AiConversationView onAddXp={handleAddXp} />
          </div>
        )}

        {/* TAB 4: TÔI (TRÒ CHƠI, THI THỬ, TIẾN ĐỘ, DANH HIỆU, CỘNG ĐỒNG, MẸO HỌC, NGỮ PHÁP) */}
        {activeTab === 'profile' && (
          <ProfileHubView
            progress={progress}
            adminUser={currentUser}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onLogin={handleUserSocialLogin}
            onLogout={handleUserLogout}
            onAddXp={handleAddXp}
            onRecordQuizResult={handleRecordQuizResult}
            onToggleBookmarkRule={handleToggleBookmarkRule}
            onSaveMistake={handleSaveMistake}
            onDeleteMistake={handleDeleteMistake}
            onUnlockBadge={handleUnlockBadge}
            masteredCardsCount={progress.masteredCards.length}
            onOpenPlayerManagement={() => setIsPlayerManagementOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal (Tạo tài khoản / Đăng nhập: Tên, Gmail, không trùng lặp, ghi nhớ đăng nhập) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleUserLoginSuccess}
      />

      {/* Player Management Modal (Dành riêng cho 4 Quản trị viên chỉ định) */}
      <PlayerManagementModal
        isOpen={isPlayerManagementOpen}
        onClose={() => setIsPlayerManagementOpen(false)}
        currentUser={currentUser}
        onUserSessionUpdated={handleUserLoginSuccess}
      />

      {/* Streak Habits Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={progress.streak}
        activeDates={progress.activeDates}
        dailyXp={progress.dailyXp}
        dailyGoalXp={progress.dailyGoalXp}
        onAddXp={handleAddXp}
      />

      {/* Settings & Admin Vocabulary Management Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        cards={cards}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onResetCards={handleResetCards}
        adminUser={currentUser}
        onLogin={handleUserSocialLogin}
        onLogout={handleUserLogout}
        onOpenPlayerManagement={() => setIsPlayerManagementOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}
