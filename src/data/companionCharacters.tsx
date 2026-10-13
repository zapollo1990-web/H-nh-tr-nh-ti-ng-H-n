import React from 'react';

export type CompanionId = 'na' | 'min' | 'sora' | 'rin' | 'lumi';

export type CompanionMood = 'happy' | 'explaining' | 'thinking' | 'cheering' | 'proud';

export interface CompanionCharacter {
  id: CompanionId;
  name: string;
  role: string;
  shortDesc: string;
  colorName: string;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  tagEmoji: string;
  specialty: string;
  catchphrase: string;
  learningPrompt: string;
  quizPrompt: string;
  successCheer: string;
  encouragement: string;
}

export const COMPANION_CHARACTERS: Record<CompanionId, CompanionCharacter> = {
  na: {
    id: 'na',
    name: 'Na',
    role: 'Gia sư tiếng Hàn',
    shortDesc: 'Giải thích ngữ pháp, từ vựng, phát âm...',
    colorName: 'Hồng pastel',
    primaryColor: '#F43F5E',
    accentColor: '#FDA4AF',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    tagEmoji: '🌸',
    specialty: 'Phát âm chuẩn Seoul & Công thức ngữ pháp',
    catchphrase: 'Đừng lo, Na sẽ giảng thật dễ hiểu cho bạn nhé!',
    learningPrompt: 'Na giải thích: Chú ý khẩu hình môi và cách ghép âm này nhé!',
    quizPrompt: 'Na nhắc nhỏ: Đọc kỹ từ vựng trước khi chọn nha!',
    successCheer: 'Giỏi quá! Phát âm và hiểu nghĩa chuẩn 100% luôn!',
    encouragement: 'Không sao đâu, nghe lại một lần nữa cùng Na là nhớ ngay!',
  },
  min: {
    id: 'min',
    name: 'Min',
    role: 'Chuyên gia luyện đề',
    shortDesc: 'Luyện tập, kiểm tra, đánh giá tiến độ...',
    colorName: 'Xanh công nghệ',
    primaryColor: '#0284C7',
    accentColor: '#7DD3FC',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeBorder: 'border-sky-200 dark:border-sky-800',
    tagEmoji: '💻',
    specialty: 'Luyện đề trắc nghiệm & Bấm giờ phản xạ',
    catchphrase: 'Luyện đề đều tay - Tự tin đạt điểm tuyệt đối!',
    learningPrompt: 'Min phân tích: Đây là dạng bài xuất hiện thường xuyên trong đề thi!',
    quizPrompt: 'Min bấm giờ: Tập trung phản xạ nhanh và chính xác nào!',
    successCheer: 'Xuất sắc! Phản xạ chuẩn xác như cao thủ TOPIK!',
    encouragement: 'Ghi chú lại câu này vào sổ tay để Min cùng bạn ôn lại sau nhé!',
  },
  sora: {
    id: 'sora',
    name: 'Sora',
    role: 'Quản lý thời gian',
    shortDesc: 'Lập kế hoạch học tập, nhắc nhở deadline...',
    colorName: 'Xanh lá mầm',
    primaryColor: '#10B981',
    accentColor: '#6EE7B7',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    tagEmoji: '🌿',
    specialty: 'Quản lý lịch học & Giữ vững chuỗi Streak',
    catchphrase: 'Chỉ cần 10 phút mỗi ngày, mầm tri thức sẽ lớn lên!',
    learningPrompt: 'Sora ghi lịch: Bạn đang tiến đúng tiến độ của tuần này đó!',
    quizPrompt: 'Sora đồng hành: Cố thêm 1 chút là hoàn thành mục tiêu hôm nay!',
    successCheer: 'Mục tiêu hôm nay đã hoàn thành! Chuỗi ngày học tăng lên rồi!',
    encouragement: 'Nghỉ ngơi uống nước 1 phút rồi chúng ta tiếp tục nhé!',
  },
  rin: {
    id: 'rin',
    name: 'Rin',
    role: 'Trợ lý bài tập',
    shortDesc: 'Giải đáp thắc mắc, hướng dẫn chi tiết...',
    colorName: 'Vàng năng động',
    primaryColor: '#D97706',
    accentColor: '#FDE68A',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    tagEmoji: '🧢',
    specialty: 'Mẹo nhớ nhanh & Giải đáp thắc mắc bài tập',
    catchphrase: 'Có Rin ở đây rồi, bài tập khó mấy cũng xong tuốt!',
    learningPrompt: 'Rin mách mẹo: Hãy liên tưởng hình ảnh để nhớ từ này siêu nhanh!',
    quizPrompt: 'Rin gợi ý: Hãy loại trừ đáp án không khớp với ngữ cảnh nhé!',
    successCheer: 'Chuẩn không cần chỉnh! Bạn tiếp thu nhanh thật đấy!',
    encouragement: 'Đừng nản lòng, Rin có mẹo nhớ này sẽ giúp bạn lần sau!',
  },
  lumi: {
    id: 'lumi',
    name: 'Lumi',
    role: 'Động lực & thư giãn',
    shortDesc: 'Truyền cảm hứng, giúp bạn cân bằng...',
    colorName: 'Tím mộng mơ',
    primaryColor: '#9333EA',
    accentColor: '#E9D5FF',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    tagEmoji: '💜',
    specialty: 'Nạp năng lượng tích cực & Chữa lành áp lực',
    catchphrase: 'Bạn đang làm rất tốt rồi! Hãy tin vào chính mình nha! 💕',
    learningPrompt: 'Lumi thì thầm: Thả lỏng vai, hít một hơi thật sâu và bắt đầu nào!',
    quizPrompt: 'Lumi gửi tim: Tự tin lên, bạn thông minh hơn bạn nghĩ nhiều!',
    successCheer: 'Tuyệt vời ông mặt trời! Lumi tặng bạn một triệu trái tim! 💖',
    encouragement: 'Thất bại là mẹ thành công, Lumi luôn bên cạnh cổ vũ bạn nè! 🥰',
  },
};

export const COMPANION_LIST = Object.values(COMPANION_CHARACTERS);

const COMPANION_STORAGE_KEY = 'korean_journey_active_companion';

export function getActiveCompanionId(): CompanionId {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(COMPANION_STORAGE_KEY) as CompanionId;
    if (saved && COMPANION_CHARACTERS[saved]) {
      return saved;
    }
  }
  return 'na';
}

export function setActiveCompanionId(id: CompanionId): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMPANION_STORAGE_KEY, id);
  }
}

/**
 * Vector SVG Avatar for each of the 5 companion penguins.
 * Accurately represents:
 * - Na: Pink penguin + daisy flower on ear + Korean book
 * - Min: Blue penguin + headphones + laptop
 * - Sora: Green penguin + sprout on head + round glasses + notebook
 * - Rin: Yellow penguin + backwards blue cap + waving hand
 * - Lumi: Purple penguin + purple headphones + holding pink heart + winking
 */
export const CompanionAvatar: React.FC<{
  characterId: CompanionId;
  size?: number;
  mood?: CompanionMood;
  className?: string;
  showBadge?: boolean;
}> = ({ characterId, size = 56, mood = 'happy', className = '', showBadge = false }) => {
  const char = COMPANION_CHARACTERS[characterId];

  // Specific SVGs tailored to match the uploaded reference exactly
  const renderSVG = () => {
    switch (characterId) {
      case 'na':
        // Pink penguin + flower + pink book
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Background glow */}
            <circle cx="50" cy="50" r="46" fill="#FFE4E6" />
            {/* Penguin body */}
            <ellipse cx="50" cy="56" rx="34" ry="36" fill="#FB7185" />
            {/* White belly */}
            <ellipse cx="50" cy="62" rx="22" ry="24" fill="#FFFFFF" />
            {/* Blush cheeks */}
            <ellipse cx="32" cy="52" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="68" cy="52" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            {/* Eyes */}
            {mood === 'happy' || mood === 'proud' ? (
              <>
                <path d="M 33 46 Q 38 41 43 46" stroke="#4C0519" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 57 46 Q 62 41 67 46" stroke="#4C0519" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <circle cx="38" cy="45" r="3.5" fill="#4C0519" />
                <path d="M 57 46 Q 62 42 67 46" stroke="#4C0519" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <circle cx="38" cy="45" r="3.8" fill="#4C0519" />
                <circle cx="62" cy="45" r="3.8" fill="#4C0519" />
                <circle cx="39.5" cy="43.5" r="1.3" fill="#FFFFFF" />
                <circle cx="63.5" cy="43.5" r="1.3" fill="#FFFFFF" />
              </>
            )}
            {/* Beak */}
            <polygon points="50,47 44,53 56,53" fill="#F59E0B" />
            {/* Daisy Flower on ear */}
            <g transform="translate(28, 26)">
              <circle cx="0" cy="-6" r="3.5" fill="#FFFFFF" />
              <circle cx="6" cy="0" r="3.5" fill="#FFFFFF" />
              <circle cx="0" cy="6" r="3.5" fill="#FFFFFF" />
              <circle cx="-6" cy="0" r="3.5" fill="#FFFFFF" />
              <circle cx="0" cy="0" r="3.5" fill="#FBBF24" />
            </g>
            {/* Wings / Arms */}
            <path d="M 18 56 Q 14 66 24 68" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
            {/* Book held */}
            <g transform="translate(42, 60)">
              <rect x="0" y="0" width="22" height="18" rx="2" fill="#E11D48" />
              <rect x="2" y="2" width="18" height="14" rx="1" fill="#FFF1F2" />
              <text x="11" y="11" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="#E11D48">한국어</text>
            </g>
            {/* Left waving wing */}
            <path d="M 78 52 Q 88 44 82 36" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
          </svg>
        );

      case 'min':
        // Blue penguin + headphones + laptop
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Background glow */}
            <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
            {/* Penguin body */}
            <ellipse cx="50" cy="56" rx="34" ry="36" fill="#0284C7" />
            {/* White belly */}
            <ellipse cx="50" cy="63" rx="22" ry="24" fill="#FFFFFF" />
            {/* Cheeks */}
            <ellipse cx="32" cy="52" rx="4" ry="2.5" fill="#38BDF8" opacity="0.6" />
            <ellipse cx="68" cy="52" rx="4" ry="2.5" fill="#38BDF8" opacity="0.6" />
            {/* Eyes */}
            <circle cx="38" cy="45" r="4" fill="#0C4A6E" />
            <circle cx="62" cy="45" r="4" fill="#0C4A6E" />
            <circle cx="39.5" cy="43.5" r="1.4" fill="#FFFFFF" />
            <circle cx="63.5" cy="43.5" r="1.4" fill="#FFFFFF" />
            {/* Beak */}
            <polygon points="50,47 44,53 56,53" fill="#F59E0B" />
            {/* White/Silver Over-ear Headphones */}
            <path d="M 22 45 A 28 28 0 0 1 78 45" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <rect x="14" y="40" width="8" height="15" rx="4" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
            <rect x="78" y="40" width="8" height="15" rx="4" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
            {/* Grey laptop */}
            <g transform="translate(32, 60)">
              <polygon points="4,2 32,2 35,16 1,16" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
              <rect x="7" y="3" width="22" height="10" rx="1" fill="#0284C7" />
              {/* Apple/Heart on back of screen */}
              <circle cx="18" cy="8" r="1.8" fill="#FFFFFF" />
            </g>
          </svg>
        );

      case 'sora':
        // Green penguin + sprout on head + round glasses + notebook
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Background glow */}
            <circle cx="50" cy="50" r="46" fill="#D1FAE5" />
            {/* Penguin body */}
            <ellipse cx="50" cy="56" rx="34" ry="36" fill="#10B981" />
            {/* White belly */}
            <ellipse cx="50" cy="63" rx="22" ry="24" fill="#FFFFFF" />
            {/* Cheeks */}
            <ellipse cx="32" cy="53" rx="4" ry="2.5" fill="#6EE7B7" opacity="0.6" />
            <ellipse cx="68" cy="53" rx="4" ry="2.5" fill="#6EE7B7" opacity="0.6" />
            {/* Sprout on head */}
            <g transform="translate(50, 18)">
              <path d="M 0 6 C -6 2 -7 -6 -1 -6 C 1 -1 0 4 0 6" fill="#047857" />
              <path d="M 0 6 C 6 2 7 -6 1 -6 C -1 -1 0 4 0 6" fill="#059669" />
              <line x1="0" y1="6" x2="0" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Round Glasses */}
            <g>
              <circle cx="37" cy="46" r="8" fill="#F0FDF4" stroke="#064E3B" strokeWidth="2" opacity="0.9" />
              <circle cx="63" cy="46" r="8" fill="#F0FDF4" stroke="#064E3B" strokeWidth="2" opacity="0.9" />
              <line x1="45" y1="46" x2="55" y2="46" stroke="#064E3B" strokeWidth="2" />
              {/* Eyes behind glasses */}
              <circle cx="37" cy="46" r="3.2" fill="#064E3B" />
              <circle cx="63" cy="46" r="3.2" fill="#064E3B" />
              <circle cx="38" cy="45" r="1.2" fill="#FFFFFF" />
              <circle cx="64" cy="45" r="1.2" fill="#FFFFFF" />
            </g>
            {/* Beak */}
            <polygon points="50,49 45,54 55,54" fill="#F59E0B" />
            {/* Notebook held */}
            <g transform="translate(40, 60)">
              <rect x="0" y="0" width="20" height="20" rx="2" fill="#1E293B" />
              <line x1="4" y1="4" x2="4" y2="16" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1,1" />
              <rect x="7" y="5" width="10" height="2" fill="#FFFFFF" rx="0.5" />
              <rect x="7" y="9" width="8" height="2" fill="#FFFFFF" rx="0.5" />
            </g>
            {/* Arms holding notebook */}
            <ellipse cx="36" cy="68" rx="4" ry="7" fill="#059669" transform="rotate(25 36 68)" />
            <ellipse cx="64" cy="68" rx="4" ry="7" fill="#059669" transform="rotate(-25 64 68)" />
          </svg>
        );

      case 'rin':
        // Yellow penguin + backwards blue baseball cap + waving hand
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Background glow */}
            <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
            {/* Penguin body */}
            <ellipse cx="50" cy="56" rx="34" ry="36" fill="#F59E0B" />
            {/* White belly */}
            <ellipse cx="50" cy="63" rx="22" ry="24" fill="#FFFFFF" />
            {/* Cheeks */}
            <ellipse cx="32" cy="52" rx="4" ry="2.5" fill="#FDE68A" opacity="0.7" />
            <ellipse cx="68" cy="52" rx="4" ry="2.5" fill="#FDE68A" opacity="0.7" />
            {/* Blue baseball cap turned sideways/backwards */}
            <g transform="translate(50, 26)">
              <ellipse cx="-2" cy="5" rx="20" ry="10" fill="#2563EB" />
              {/* Visor turned left */}
              <path d="M -22 8 Q -32 6 -30 13 Q -20 12 -12 9" fill="#1D4ED8" />
              <circle cx="-2" cy="-1" r="2.5" fill="#FBBF24" />
            </g>
            {/* Cheerful Eyes */}
            <path d="M 33 46 Q 38 41 43 46" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 57 46 Q 62 41 67 46" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Beak */}
            <polygon points="50,47 44,53 56,53" fill="#D97706" />
            {/* Right waving arm */}
            <path d="M 76 56 Q 88 46 84 34" stroke="#D97706" strokeWidth="6.5" strokeLinecap="round" />
            {/* Left arm holding book */}
            <g transform="translate(24, 58)">
              <rect x="0" y="0" width="16" height="20" rx="2" fill="#2563EB" />
              <line x1="3" y1="2" x2="3" y2="18" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'lumi':
        // Purple penguin + purple headphones + winking + hugging pink heart
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Background glow */}
            <circle cx="50" cy="50" r="46" fill="#F3E8FF" />
            {/* Penguin body */}
            <ellipse cx="50" cy="56" rx="34" ry="36" fill="#A855F7" />
            {/* White belly */}
            <ellipse cx="50" cy="63" rx="22" ry="24" fill="#FFFFFF" />
            {/* Cheeks */}
            <ellipse cx="32" cy="52" rx="4" ry="2.5" fill="#E9D5FF" opacity="0.8" />
            <ellipse cx="68" cy="52" rx="4" ry="2.5" fill="#E9D5FF" opacity="0.8" />
            {/* Purple Headphones */}
            <path d="M 22 45 A 28 28 0 0 1 78 45" stroke="#7E22CE" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <rect x="14" y="40" width="8" height="15" rx="4" fill="#6B21A8" />
            <rect x="78" y="40" width="8" height="15" rx="4" fill="#6B21A8" />
            {/* Eyes: One winking, one wide happy */}
            <path d="M 33 46 Q 38 41 43 46" stroke="#3B0764" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <circle cx="62" cy="45" r="3.8" fill="#3B0764" />
            <circle cx="63.5" cy="43.5" r="1.4" fill="#FFFFFF" />
            {/* Beak */}
            <polygon points="50,47 45,52 55,52" fill="#F59E0B" />
            {/* Hugging Big Pink Heart in hands */}
            <g transform="translate(50, 64) scale(0.95)">
              <path
                d="M 0 3 C -8 -7 -18 3 0 16 C 18 3 8 -7 0 3"
                fill="#F43F5E"
                stroke="#FFE4E6"
                strokeWidth="1.2"
              />
            </g>
            {/* Flipper paws holding heart */}
            <ellipse cx="40" cy="66" rx="3.5" ry="5.5" fill="#9333EA" transform="rotate(35 40 66)" />
            <ellipse cx="60" cy="66" rx="3.5" ry="5.5" fill="#9333EA" transform="rotate(-35 60 66)" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 ${className}`}
      title={`${char.name} - ${char.role}: ${char.shortDesc}`}
    >
      {renderSVG()}
      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded-full font-black text-white shadow-xs"
          style={{ backgroundColor: char.primaryColor }}
        >
          {char.name}
        </span>
      )}
    </div>
  );
};
