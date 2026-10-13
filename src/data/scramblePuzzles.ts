import { ScramblePuzzle } from '../types';
import rawVocabData from './massiveVocab.json';

export interface CategoryInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}

export const CATEGORY_MAP: Record<string, { label: string; icon: string; color: string }> = {
  food: { label: 'Ẩm thực & Món ăn', icon: '🍲', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  daily: { label: 'Đời sống sinh hoạt', icon: '🏠', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  travel: { label: 'Du lịch & Giao thông', icon: '✈️', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  shopping: { label: 'Mua sắm & Giá cả', icon: '🛍️', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  greetings: { label: 'Chào hỏi & Giao tiếp', icon: '💬', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  family: { label: 'Gia đình & Quan hệ', icon: '👨‍👩‍👧', color: 'text-pink-600 bg-pink-50 border-pink-200' },
  emotions: { label: 'Cảm xúc & Tâm trạng', icon: '💖', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  work: { label: 'Công sở & Học tập', icon: '💼', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  verbs: { label: 'Động từ hành động', icon: '🏃', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  adjectives: { label: 'Tính từ miêu tả', icon: '✨', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  numbers: { label: 'Số đếm & Thời gian', icon: '🔢', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  hangeul: { label: 'Chữ cái & Căn bản', icon: '🔤', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

// Common Korean distractor syllables
const DISTRACTOR_SYLLABLES = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하',
  '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호',
  '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후',
  '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히',
  '과', '국', '글', '말', '밥', '물', '집', '산', '문', '길', '방', '표', '생', '력',
  '식', '원', '당', '관', '장', '대', '전', '소', '중', '일', '월', '년', '시', '분'
];

/**
 * Fisher-Yates shuffle algorithm that guarantees uniform randomness
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick N random distractor syllables that are NOT in the target syllable set
 */
function getDistractors(targetChars: string[], count = 2): string[] {
  const targetSet = new Set(targetChars);
  const candidates = DISTRACTOR_SYLLABLES.filter((s) => !targetSet.has(s));
  const shuffled = shuffleArray(candidates);
  return shuffled.slice(0, count);
}

/**
 * Clean punctuation from sentence
 */
function cleanSentence(sentence: string): string {
  return sentence.replace(/[.!?~"']/g, '').trim();
}

/**
 * Pre-generate the complete pool of 1000+ scramble puzzles
 */
function buildMasterPuzzleBank(): ScramblePuzzle[] {
  const bank: ScramblePuzzle[] = [];

  rawVocabData.forEach((item, index) => {
    const cat = item.category || 'daily';
    const catMeta = CATEGORY_MAP[cat] || {
      label: 'Đa chủ đề',
      icon: '🎯',
      color: 'text-slate-600 bg-slate-50 border-slate-200',
    };

    const hangul = (item.hangul || '').trim();
    // Exclude single standalone vowels or consonants (ㄱ, ㄴ, ㅏ, etc.) for word puzzles
    const isSingleChar = hangul.length === 1 && /^[ㄱ-ㅎㅏ-ㅣ]$/.test(hangul);

    // 1. WORD SCRAMBLE PUZZLE
    if (hangul.length >= 2 && !isSingleChar) {
      const correctTokens = hangul.split('');
      const distractors = getDistractors(correctTokens, Math.min(3, Math.max(2, 6 - correctTokens.length)));
      const scrambledTokens = shuffleArray([...correctTokens, ...distractors]);

      // Ensure scrambled is not accidentally identical to correct
      let attempts = 0;
      let finalScrambled = scrambledTokens;
      while (
        attempts < 5 &&
        finalScrambled.slice(0, correctTokens.length).join('') === hangul &&
        finalScrambled.length > 1
      ) {
        finalScrambled = shuffleArray(finalScrambled);
        attempts++;
      }

      bank.push({
        id: `scramble-word-${item.id || index}`,
        type: 'word',
        category: cat,
        categoryLabelVi: catMeta.label,
        categoryIcon: catMeta.icon,
        promptVi: `Đảo chữ ghép từ: "${item.vietnamese}"`,
        koreanText: hangul,
        romanization: item.romanization,
        meaningVi: item.vietnamese,
        correctTokens,
        scrambledTokens: finalScrambled,
        distractors,
        exampleSentence: item.exampleKo || undefined,
        exampleSentenceVi: item.exampleVi || undefined,
      });
    }

    // 2. SENTENCE SCRAMBLE PUZZLE (if exampleKo exists and has at least 2 distinct words)
    if (item.exampleKo) {
      const cleanedKo = cleanSentence(item.exampleKo);
      const tokens = cleanedKo.split(/\s+/).filter(Boolean);

      if (tokens.length >= 2 && tokens.length <= 6) {
        let scrambledTokens = shuffleArray([...tokens]);
        let attempts = 0;
        // Make sure the scrambled order is actually different from the original sentence
        while (
          attempts < 5 &&
          scrambledTokens.join(' ') === tokens.join(' ') &&
          tokens.length > 1
        ) {
          scrambledTokens = shuffleArray(tokens);
          attempts++;
        }

        bank.push({
          id: `scramble-sent-${item.id || index}`,
          type: 'sentence',
          category: cat,
          categoryLabelVi: catMeta.label,
          categoryIcon: catMeta.icon,
          promptVi: `Đảo từ ghép câu: "${item.exampleVi || item.vietnamese}"`,
          koreanText: cleanedKo,
          romanization: item.romanization,
          meaningVi: item.exampleVi || item.vietnamese,
          correctTokens: tokens,
          scrambledTokens,
          exampleSentence: item.exampleKo,
          exampleSentenceVi: item.exampleVi,
        });
      }
    }
  });

  return bank;
}

// Master collection (contains 1,900+ puzzles!)
export const MASTER_SCRAMBLE_PUZZLES: ScramblePuzzle[] = buildMasterPuzzleBank();

/**
 * Get distinct categories with puzzle counts
 */
export function getAvailableCategories(): CategoryInfo[] {
  const counts: Record<string, number> = {};
  MASTER_SCRAMBLE_PUZZLES.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const categories: CategoryInfo[] = [
    {
      id: 'all',
      label: 'Tất cả chủ đề',
      icon: '🌈',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      count: MASTER_SCRAMBLE_PUZZLES.length,
    },
  ];

  Object.entries(CATEGORY_MAP).forEach(([key, val]) => {
    if (counts[key]) {
      categories.push({
        id: key,
        label: val.label,
        icon: val.icon,
        color: val.color,
        count: counts[key],
      });
    }
  });

  return categories;
}

/**
 * Returns a COMPLETELY RANDOMIZED list of puzzles
 * CRITICAL REQUIREMENT: "không để thứ tự đố" - Question order is randomized every time
 */
export function getRandomizedScramblePuzzles(options?: {
  category?: string;
  type?: 'all' | 'word' | 'sentence';
  limit?: number;
}): ScramblePuzzle[] {
  const { category = 'all', type = 'all', limit } = options || {};

  let filtered = MASTER_SCRAMBLE_PUZZLES;

  if (category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (type !== 'all') {
    filtered = filtered.filter((p) => p.type === type);
  }

  // Pure random shuffle (no fixed order)
  const randomized = shuffleArray(filtered);

  if (limit && limit > 0) {
    return randomized.slice(0, limit);
  }

  return randomized;
}
