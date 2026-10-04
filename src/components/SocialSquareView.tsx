import React, { useState, useEffect } from 'react';
import {
  INITIAL_STUDY_FRIENDS,
  INITIAL_SOCIAL_POSTS,
  KOREAN_CHEER_PHRASES,
} from '../data/socialNetwork';
import { StudyFriend, SocialPost } from '../types';
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Sparkles,
  Send,
  UserPlus,
  Check,
  Search,
  Volume2,
  Flame,
  Award,
  Smile,
  Coffee,
  ThumbsUp,
} from 'lucide-react';

interface SocialSquareViewProps {
  totalXp: number;
  streak: number;
  onAddXp: (amount: number) => void;
}

const STORAGE_POSTS_KEY = 'korean_journey_social_posts_v1';
const STORAGE_FRIENDS_KEY = 'korean_journey_social_friends_v1';

export const SocialSquareView: React.FC<SocialSquareViewProps> = ({
  totalXp,
  streak,
  onAddXp,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'leaderboard'>('feed');

  // Posts State
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_POSTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_POSTS;
  });

  // Friends State
  const [friends, setFriends] = useState<StudyFriend[]>(() => {
    const saved = localStorage.getItem(STORAGE_FRIENDS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STUDY_FRIENDS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
  }, [friends]);

  // Audio helper
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // -------------------------------------------------------------
  // STATUS COMPOSER
  // -------------------------------------------------------------
  const [newPostKo, setNewPostKo] = useState('');
  const [newPostVi, setNewPostVi] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('study');
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostKo.trim() && !newPostVi.trim()) return;

    setIsPosting(true);
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorId: 'user-me',
      authorName: 'Bạn (나)',
      authorHandle: '@korean_learner',
      authorAvatar: '🐰',
      authorLevel: Math.max(1, Math.floor(totalXp / 300) + 1),
      authorBadge: 'Người học chăm chỉ 🌟',
      contentKo: newPostKo || '오늘도 즐겁게 한국어를 공부하고 있어요!',
      contentVi: newPostVi || 'Hôm nay mình lại tiếp tục học tiếng Hàn thật vui!',
      timestamp: 'Vừa xong',
      likes: 1,
      hasLiked: true,
      cheers: {
        bananaMilk: 1,
        highFive: 0,
        firework: 1,
      },
      comments: [],
      achievement:
        selectedTag === 'streak'
          ? {
              type: 'streak',
              title: `Chuỗi học tập ${streak} ngày bền bỉ! 🔥`,
              icon: '🏆',
            }
          : undefined,
    };

    setTimeout(() => {
      setPosts([newPost, ...posts]);
      setNewPostKo('');
      setNewPostVi('');
      setIsPosting(false);
      onAddXp(20); // Reward for sharing
    }, 400);
  };

  // -------------------------------------------------------------
  // LIKES & CHEERS
  // -------------------------------------------------------------
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentlyLiked = post.hasLiked;
          return {
            ...post,
            likes: currentlyLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !currentlyLiked,
          };
        }
        return post;
      })
    );
  };

  const handleSendCheer = (postId: string, type: 'bananaMilk' | 'highFive' | 'firework') => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const already = post.hasCheered?.[type];
          return {
            ...post,
            cheers: {
              ...post.cheers,
              [type]: already ? post.cheers[type] - 1 : post.cheers[type] + 1,
            },
            hasCheered: {
              ...post.hasCheered,
              [type]: !already,
            },
          };
        }
        return post;
      })
    );
  };

  // -------------------------------------------------------------
  // COMMENTS
  // -------------------------------------------------------------
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `c-${Date.now()}`,
                authorName: 'Bạn (나)',
                authorAvatar: '🐰',
                text,
                time: 'Vừa xong',
              },
            ],
          };
        }
        return post;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    onAddXp(10); // Reward for encouraging friends
  };

  // -------------------------------------------------------------
  // FRIEND ACTIONS
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [friendFilter, setFriendFilter] = useState<'all' | 'friends' | 'recommended'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFriendStatus = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          if (f.friendStatus === 'friend') {
            showToast(`Đã huỷ kết bạn với ${f.name}`);
            return { ...f, friendStatus: 'none' };
          } else if (f.friendStatus === 'pending') {
            showToast(`Đã thu hồi lời mời kết bạn gửi đến ${f.name}`);
            return { ...f, friendStatus: 'none' };
          } else {
            showToast(`Đã gửi lời mời kết bạn tới ${f.name}! 🎉`);
            return { ...f, friendStatus: 'pending' };
          }
        }
        return f;
      })
    );
  };

  const handleSendGiftToFriend = (friend: StudyFriend) => {
    showToast(`Bạn đã gửi tặng 🍌 Sữa chuối cho ${friend.name}! Tăng 10 điểm thân mật!`);
    onAddXp(5);
  };

  const myFriendsCount = friends.filter((f) => f.friendStatus === 'friend').length;

  const filteredFriends = friends.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bioKo?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (friendFilter === 'friends') return f.friendStatus === 'friend';
    if (friendFilter === 'recommended') return f.friendStatus === 'none';
    return true;
  });

  return (
    <div className="space-y-6 pb-12" id="social-square-container">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-slate-700 animate-scale-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SOCIAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-100 via-purple-50 to-sky-100 border border-purple-200/80 p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <img
                src="/src/assets/images/study_buddies_1789549474439.jpg"
                alt="Korean Study Buddies"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-white shadow-md shadow-purple-200/50"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-xs px-1.5 py-0.5 rounded-full border border-purple-200 shadow-xs">
                💖
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-800 border border-purple-300">
                  한국어 친구들 • Study Social Square
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ● 3 bạn bè đang online
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Mạng Xã Hội Bạn Cùng Học Tiếng Hàn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Chia sẻ khoảnh khắc học tập, tặng sữa chuối cổ vũ bạn bè, cùng giữ chuỗi streak và chinh phục tiếng Hàn mỗi ngày!
              </p>
            </div>
          </div>

          {/* User Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 text-slate-800 font-extrabold text-xs shadow-xs border border-purple-200">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>{myFriendsCount} Bạn bè</span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-900 font-extrabold text-xs shadow-xs border border-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-900" />
              <span>Streak {streak} ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Bảng tin (피드)</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'friends'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bạn bè ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>BXH Bạn bè</span>
        </button>
      </div>

      {/* 3. FEED VIEW */}
      {activeTab === 'feed' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Post Composer Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200">
                🐰
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  Hôm nay bạn đã học được câu tiếng Hàn nào hay?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Chia sẻ cùng bạn bè và nhận +20 XP thưởng!
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newPostKo}
                  onChange={(e) => setNewPostKo(e.target.value)}
                  placeholder="Câu tiếng Hàn (VD: 오늘 한국어 문법을 열심히 공부했어요! ✨)"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden transition-all"
                />
                <input
                  type="text"
                  value={newPostVi}
                  onChange={(e) => setNewPostVi(e.target.value)}
                  placeholder="Nghĩa tiếng Việt hoặc cảm nghĩ của bạn..."
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:bg-white text-xs text-slate-700 focus:outline-hidden transition-all"
                />
              </div>

              {/* Tag selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Chủ đề:</span>
                  {[
                    { id: 'study', label: '📖 Học tập' },
                    { id: 'streak', label: '🔥 Chuỗi ngày' },
                    { id: 'farm', label: '🌾 K-Farm' },
                    { id: 'fishing', label: '🎣 Câu cá' },
                  ].map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTag(tag.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        selectedTag === tag.id
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isPosting || (!newPostKo.trim() && !newPostVi.trim())}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPosting ? 'Đang đăng...' : 'Đăng lên Feed (+20 XP)'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Feed Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 transition-all hover:border-purple-200"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-2xs">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {post.authorName}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          Lv.{post.authorLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{post.authorHandle}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {post.authorBadge && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 hidden sm:inline-block">
                      {post.authorBadge}
                    </span>
                  )}
                </div>

                {/* Achievement Highlight */}
                {post.achievement && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 font-bold text-xs">
                    <span className="text-base">{post.achievement.icon}</span>
                    <span>{post.achievement.title}</span>
                  </div>
                )}

                {/* Post Content */}
                <div className="space-y-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-sm sm:text-base text-slate-800 leading-relaxed">
                      {post.contentKo}
                    </p>
                    <button
                      onClick={() => playAudio(post.contentKo)}
                      className="p-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-600 border border-slate-200 shadow-2xs transition-all cursor-pointer flex-shrink-0"
                      title="Nghe phát âm bài viết"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.contentVi}</p>
                </div>

                {/* Interactive Cheer & Like Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {/* Like */}
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      post.hasLiked
                        ? 'bg-rose-100 text-rose-600 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-rose-500' : ''}`} />
                    <span>{post.likes} Yêu thích</span>
                  </button>

                  {/* Cute Korean Cheers */}
                  <div className="flex items-center gap-1.5">
                    {/* Banana Milk */}
                    <button
                      onClick={() => handleSendCheer(post.id, 'bananaMilk')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        post.hasCheered?.bananaMilk
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                      }`}
                      title="Tặng sữa chuối động viên (바나나우유)"
                    >
                      <span>🍌</span>
                      <span className="text-[11px]">{post.cheers.bananaMilk} Sữa chuối</span>
                    </button>

                    {/* High-five */}
                    <button
                      onClick={() => handleSendCheer(post.id, 'highFive')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        post.hasCheered?.highFive
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
                      }`}
                      title="Đập tay khích lệ (하이파이브)"
                    >
                      <span>🙌</span>
                      <span className="text-[11px]">{post.cheers.highFive}</span>
                    </button>

                    {/* Firework */}
                    <button
                      onClick={() => handleSendCheer(post.id, 'firework')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        post.hasCheered?.firework
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
                      }`}
                      title="Pháo hoa chúc mừng (축하)"
                    >
                      <span>🎉</span>
                      <span className="text-[11px]">{post.cheers.firework}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-2 pt-2">
                  {post.comments.length > 0 && (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                          <span className="text-base">{comment.authorAvatar}</span>
                          <div className="flex-1">
                            <span className="font-extrabold text-slate-800 mr-1.5">
                              {comment.authorName}:
                            </span>
                            <span className="text-slate-700">{comment.text}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{comment.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Cheer Phrases */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Gợi ý cổ vũ:</span>
                    {KOREAN_CHEER_PHRASES.slice(0, 3).map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddComment(post.id, `${phrase.ko} (${phrase.vi})`)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all cursor-pointer"
                      >
                        {phrase.ko}
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id, commentInputs[post.id] || '');
                        }
                      }}
                      placeholder="Viết bình luận hoặc lời cổ vũ..."
                      className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 focus:border-purple-400 focus:bg-white text-xs text-slate-800 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleAddComment(post.id, commentInputs[post.id] || '')}
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FRIENDS LIST & ADD BUDDIES */}
      {activeTab === 'friends' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bạn theo tên, handle..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all' as const, label: 'Tất cả' },
                { id: 'friends' as const, label: 'Bạn bè của tôi' },
                { id: 'recommended' as const, label: 'Đề xuất mới' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFriendFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    friendFilter === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Friends Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-2xs relative ${friend.avatarBg}`}
                    >
                      {friend.avatarEmoji}
                      {friend.isOnline && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm text-slate-800">{friend.name}</h4>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          Lv.{friend.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{friend.handle}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{friend.bioKo}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">
                    {friend.isOnline ? 'Đang online' : friend.lastActive}
                  </span>
                </div>

                {/* Status Message & Streak */}
                <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{friend.streak} ngày streak</span>
                    </span>
                    <span className="text-purple-600">{friend.xp} XP</span>
                  </div>
                  <p className="text-slate-600 italic">"{friend.statusMsg}"</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  {friend.friendStatus === 'friend' ? (
                    <>
                      <button
                        onClick={() => handleSendGiftToFriend(friend)}
                        className="flex-1 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>🍌 Tặng sữa chuối</span>
                      </button>

                      <button
                        onClick={() => handleToggleFriendStatus(friend.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs transition-all cursor-pointer"
                        title="Huỷ kết bạn"
                      >
                        Bạn bè ✓
                      </button>
                    </>
                  ) : friend.friendStatus === 'pending' ? (
                    <button
                      onClick={() => handleToggleFriendStatus(friend.id)}
                      className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs cursor-pointer hover:bg-slate-200"
                    >
                      Đã gửi lời mời (Nhấn để huỷ)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleFriendStatus(friend.id)}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Kết bạn cùng học</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BUDDIES LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Bảng Thi Đua Nhóm Bạn Bè (친구 랭킹)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cùng cố gắng tích lũy điểm kinh nghiệm mỗi ngày để leo lên top 1 nhé!
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              Tuần này
            </span>
          </div>

          <div className="space-y-2 pt-2">
            {[
              {
                rank: 1,
                name: 'Park Joon (박준)',
                avatar: '🐻',
                streak: 21,
                xp: 1840,
                badge: '🥇 Quán quân',
              },
              {
                rank: 2,
                name: 'Kim Minji (김민지)',
                avatar: '🐰',
                streak: 14,
                xp: 1250,
                badge: '🥈 Á quân',
              },
              {
                rank: 3,
                name: 'Bạn (나)',
                avatar: '🐰',
                streak: streak,
                xp: totalXp + 450,
                badge: '🥉 Hạng 3',
                isUser: true,
              },
              {
                rank: 4,
                name: 'Lee Jihoon (이지훈)',
                avatar: '🐶',
                streak: 12,
                xp: 1100,
                badge: 'Top 5',
              },
              {
                rank: 5,
                name: 'Quang Trần (광)',
                avatar: '🐯',
                streak: 9,
                xp: 980,
                badge: 'Top 5',
              },
            ].map((item) => (
              <div
                key={item.rank}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  item.isUser
                    ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm w-6 text-center text-slate-700">
                    #{item.rank}
                  </span>
                  <span className="text-2xl">{item.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs sm:text-sm text-slate-800">{item.name}</h4>
                      {item.isUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-600 text-white">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" /> {item.streak} ngày streak
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-purple-700">{item.xp} XP</span>
                  <p className="text-[10px] text-slate-400">{item.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
