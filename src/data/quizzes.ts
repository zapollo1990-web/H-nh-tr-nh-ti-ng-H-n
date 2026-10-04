import { QuizQuestion, MatchPair } from '../types';

export const PRACTICE_QUIZZES: QuizQuestion[] = [
  // 1. Multiple Choice Questions
  {
    id: 'qz-1',
    type: 'choice',
    category: 'Chào hỏi',
    prompt: 'Khi bạn là người ra về trước, còn bạn của bạn ở lại nhà, bạn nên nói câu tạm biệt nào?',
    audioText: '안녕히 계세요',
    options: [
      '안녕히 가세요 (Đi về bình an nhé)',
      '안녕히 계세요 (Ở lại bình an nhé)',
      '만나서 반갑습니다 (Rất vui được gặp bạn)',
      '죄송합니다 (Tôi xin lỗi)'
    ],
    answer: '안녕히 계세요 (Ở lại bình an nhé)',
    explanation: 'Khi mình là người rời đi và đối phương ở lại, hãy dùng "안녕히 계세요" (nguyên mẫu 계시다 là kính ngữ của 있다 - ở lại).'
  },
  {
    id: 'qz-2',
    type: 'choice',
    category: 'Ngữ pháp',
    prompt: 'Điền tiểu từ thích hợp vào chỗ trống: "저는 지금 도서관(____) 책을 읽어요."',
    audioText: '저는 지금 도서관에서 책을 읽어요',
    options: ['에', '에서', '을', '는'],
    answer: '에서',
    explanation: '"책을 읽다" (đọc sách) là một hành động cụ thể đang diễn ra, vì vậy nơi chốn diễn ra hành động phải đi kèm với tiểu từ "에서".'
  },
  {
    id: 'qz-3',
    type: 'choice',
    category: 'Ẩm thực',
    prompt: 'Từ nào sau đây có nghĩa là "Ngon miệng / Ngon lắm"?',
    audioText: '맛있어요',
    options: ['비싸요', '맛있어요', '어려워요', '재미있어요'],
    answer: '맛있어요',
    explanation: '"맛있어요" (mas-iss-eo-yo) là ngon. Trong khi đó "비싸요" là đắt, "어려워요" là khó, và "재미있어요" là thú vị.'
  },
  {
    id: 'qz-4',
    type: 'choice',
    category: 'Ngữ pháp',
    prompt: 'Điền tiểu từ tân ngữ đúng: "아침에 사과(___) 먹었어요."',
    audioText: '사과를 먹었어요',
    options: ['을', '를', '이', '에'],
    answer: '를',
    explanation: 'Từ "사과" (quả táo) kết thúc bằng nguyên âm 과, không có phụ âm cuối (patchim), nên ta kết hợp với "를".'
  },
  {
    id: 'qz-5',
    type: 'choice',
    category: 'Mua sắm',
    prompt: 'Khi muốn hỏi "Cái này bao nhiêu tiền vậy ạ?", người Hàn sẽ nói câu nào?',
    audioText: '이거 얼마예요?',
    options: [
      '이거 뭐예요? (Cái này là cái gì?)',
      '이거 얼마예요? (Cái này bao nhiêu tiền?)',
      '어디에 가요? (Bạn đi đâu đấy?)',
      '몇 시예요? (Mấy giờ rồi?)'
    ],
    answer: '이거 얼마예요? (Cái này bao nhiêu tiền?)',
    explanation: '"얼마예요?" bắt nguồn từ "얼마" (bao nhiêu). Mẫu câu "이거 얼마예요?" cực kỳ thông dụng khi đi mua sắm.'
  },

  // 2. Sentence Arranging (Ghép từ thành câu)
  {
    id: 'arr-1',
    type: 'arrange',
    category: 'Ghép câu',
    prompt: 'Sắp xếp các từ sau thành câu: "Tôi là người Việt Nam."',
    audioText: '저는 베트남 사람입니다',
    scrambleWords: ['사람입니다', '저는', '베트남'],
    answer: ['저는', '베트남', '사람입니다'],
    explanation: 'Cấu trúc tiếng Hàn: Chủ ngữ (Chủ đề) + Tân ngữ/Bổ ngữ + Vị ngữ (Động từ/Tính từ cuối câu).'
  },
  {
    id: 'arr-2',
    type: 'arrange',
    category: 'Ghép câu',
    prompt: 'Sắp xếp các từ sau thành câu: "Tôi uống nước ở quán cà phê."',
    audioText: '카페에서 물을 마셔요',
    scrambleWords: ['물을', '마셔요', '카페에서'],
    answer: ['카페에서', '물을', '마셔요'],
    explanation: 'Thứ tự tự nhiên: Nơi chốn (카페에서) + Tân ngữ (물을) + Động từ vị ngữ (마셔요).'
  },
  {
    id: 'arr-3',
    type: 'arrange',
    category: 'Ghép câu',
    prompt: 'Sắp xếp các từ sau thành câu: "Hôm nay thời tiết rất đẹp."',
    audioText: '오늘 날씨가 정말 좋아요',
    scrambleWords: ['정말', '오늘', '좋아요', '날씨가'],
    answer: ['오늘', '날씨가', '정말', '좋아요'],
    explanation: 'Thời gian (오늘) -> Chủ ngữ (날씨가) -> Trạng từ nhấn mạnh (정말) -> Vị ngữ (좋아요).'
  },
  {
    id: 'arr-4',
    type: 'arrange',
    category: 'Ghép câu',
    prompt: 'Sắp xếp các từ sau thành câu: "Làm ơn cho tôi 1 ly cà phê."',
    audioText: '커피 한 잔 주세요',
    scrambleWords: ['주세요', '한 잔', '커피'],
    answer: ['커피', '한 잔', '주세요'],
    explanation: 'Tên món (커피) + Lượng từ (한 잔 - 1 ly) + Động từ cầu khiến lịch sự (주세요 - xin hãy cho).'
  }
];

// Memory Matching Pairs Game
export const MATCH_PAIRS_SETS: MatchPair[][] = [
  [
    { id: 'mp-1', hangul: '물', vietnamese: 'Nước' },
    { id: 'mp-2', hangul: '밥', vietnamese: 'Cơm' },
    { id: 'mp-3', hangul: '친구', vietnamese: 'Bạn bè' },
    { id: 'mp-4', hangul: '학교', vietnamese: 'Trường học' },
    { id: 'mp-5', hangul: '가족', vietnamese: 'Gia đình' },
    { id: 'mp-6', hangul: '선생님', vietnamese: 'Thầy/Cô giáo' }
  ],
  [
    { id: 'mp-7', hangul: '사과', vietnamese: 'Quả táo' },
    { id: 'mp-8', hangul: '커피', vietnamese: 'Cà phê' },
    { id: 'mp-9', hangul: '식당', vietnamese: 'Nhà hàng' },
    { id: 'mp-10', hangul: '지하철', vietnamese: 'Tàu điện ngầm' },
    { id: 'mp-11', hangul: '돈', vietnamese: 'Tiền' },
    { id: 'mp-12', hangul: '책', vietnamese: 'Sách' }
  ],
  [
    { id: 'mp-13', hangul: '안녕하세요', vietnamese: 'Xin chào' },
    { id: 'mp-14', hangul: '감사합니다', vietnamese: 'Cảm ơn' },
    { id: 'mp-15', hangul: '죄송합니다', vietnamese: 'Xin lỗi' },
    { id: 'mp-16', hangul: '맛있어요', vietnamese: 'Ngon lắm' },
    { id: 'mp-17', hangul: '좋아요', vietnamese: 'Tốt / Thích' },
    { id: 'mp-18', hangul: '예뻐요', vietnamese: 'Xinh đẹp' }
  ]
];
