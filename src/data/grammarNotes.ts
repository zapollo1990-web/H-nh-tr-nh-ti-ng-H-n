import { GrammarRule } from '../types';
import { BEGINNER_GRAMMAR_RULES } from './grammarNotesBeginner';
import { INTERMEDIATE_GRAMMAR_RULES } from './grammarNotesIntermediate';
import { ADVANCED_GRAMMAR_RULES } from './grammarNotesAdvanced';

// TỔNG HỢP TOÀN BỘ NGỮ PHÁP TIẾNG HÀN TỪ SƠ CẤP ĐẾN CAO CẤP (TOPIK I - II)
export const GRAMMAR_RULES: GrammarRule[] = [
  ...BEGINNER_GRAMMAR_RULES,
  ...INTERMEDIATE_GRAMMAR_RULES,
  ...ADVANCED_GRAMMAR_RULES,
];

export { BEGINNER_GRAMMAR_RULES, INTERMEDIATE_GRAMMAR_RULES, ADVANCED_GRAMMAR_RULES };

export const GRAMMAR_CATEGORIES = [
  { id: 'all', label: 'Tất cả chủ đề', icon: '📚' },
  { id: 'particle', label: 'Tiểu từ (은/는, 이/가, 을/를, 에/에서, 에게, -(으)로...)', icon: '📍' },
  { id: 'tense', label: 'Thời thì (Hiện tại, Quá khứ, Tương lai, Tiếp diễn -고 있다...)', icon: '⏳' },
  { id: 'negation', label: 'Phủ định (안 vs -지 않다 vs 못 vs -(으)ㄹ 수 없다)', icon: '🚫' },
  { id: 'formality', label: 'Đuôi câu giao tiếp (-아/어요, -ㅂ/습니다, Banmal)', icon: '🗣️' },
  { id: 'connector', label: 'Nối câu & Nguyên nhân (-아/어서, -(으)니까, -기 때문에, -고...)', icon: '🔗' },
  { id: 'contrast', label: 'Tương phản & Nhượng bộ (-(으)ㄴ/는데, -지만, 대신에, -더라도...)', icon: '⚖️' },
  { id: 'condition', label: 'Điều kiện & Giả định (-(으)면, -(으)ㄴ/는다면, -(으)려면...)', icon: '💡' },
  { id: 'purpose', label: 'Mục đích & Dự định (-(으)려고 하다, -(으)러 가다, -고자 하다...)', icon: '🎯' },
  { id: 'intention', label: 'Khả năng & Mong muốn (-고 싶다, -(으)ㄹ 수 있다, -아/어 보다...)', icon: '✨' },
  { id: 'obligation', label: 'Bắt buộc & Cấm đoán (-아/어야 하다, -아/어도 되다, -(으)면 안 되다)', icon: '🛡️' },
  { id: 'conjecture', label: 'Phỏng đoán & Suy đoán (-(으)ㄴ/는 것 같다, -(으)ㄹ 리가 없다...)', icon: '🔮' },
  { id: 'modifier', label: 'Định ngữ danh từ (ĐT -는, TT -(으)ㄴ, Quá khứ -(으)ㄴ, Tương lai -(으)ㄹ)', icon: '🏷️' },
  { id: 'passive_causative', label: 'Bị động & Sai khiến (-이/히/리/기-, -아/어지다, -게 하다...)', icon: '⚙️' },
  { id: 'indirect_speech', label: 'Gián tiếp & Trích dẫn (-(ㄴ/는)다고 하다, -대요, -래요, -재요...)', icon: '💬' },
  { id: 'honorific', label: 'Kính ngữ & Mệnh lệnh (-(으)세요, -지 마세요, 께, 드시다...)', icon: '👑' },
];
