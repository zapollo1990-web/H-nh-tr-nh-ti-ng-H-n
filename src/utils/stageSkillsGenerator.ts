import {
  RoadmapStage,
  StageListeningExercise,
  StageSpeakingExercise,
  StageReadingExercise,
  StageWritingExercise
} from '../types';

/**
 * Get full 4-skill exercises for any given stage.
 * If stage has custom defined exercises, return them.
 * Otherwise, generate rich, authentic exercises from stage lessons and vocabulary.
 */
export function getStageFourSkills(stage: RoadmapStage): {
  listening: StageListeningExercise[];
  speaking: StageSpeakingExercise[];
  reading: StageReadingExercise[];
  writing: StageWritingExercise[];
} {
  const customListening = stage.listeningExercises || [];
  const customSpeaking = stage.speakingExercises || [];
  const customReading = stage.readingExercises || [];
  const customWriting = stage.writingExercises || [];

  const lessons = stage.lessons || [];

  // Extract core Korean phrases & meanings from lessons
  const lessonItems = lessons.map((l, i) => {
    // split phrases if contains comma
    const rawTokens = l.contentKo.split(/[,–-]/).map((s) => s.trim()).filter(Boolean);
    const mainKo = rawTokens[0] || l.contentKo;
    return {
      korean: mainKo,
      romanization: l.romanization,
      meaningVi: l.meaningVi,
      explanation: l.explanation,
      title: l.title,
    };
  });

  // 1. GENERATE LISTENING EXERCISES
  const generatedListening: StageListeningExercise[] = customListening.length > 0 ? customListening : [
    {
      id: `${stage.id}-listen-1`,
      title: `Bài nghe 1: Nhận diện phát âm chuẩn`,
      audioKo: lessonItems[0]?.korean || stage.koreanTitle,
      question: `Hãy lắng nghe phát âm và chọn cụm từ tiếng Hàn chính xác:`,
      options: [
        lessonItems[0]?.korean || stage.koreanTitle,
        lessonItems[1]?.korean || '안녕하세요',
        lessonItems[2]?.korean || '감사합니다',
        '좋은 하루 되세요',
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4),
      correctIndex: 0,
      romanization: lessonItems[0]?.romanization,
      meaningVi: lessonItems[0]?.meaningVi,
      explanation: `Từ bạn vừa nghe là "${lessonItems[0]?.korean || stage.koreanTitle}" có nghĩa là: ${lessonItems[0]?.meaningVi || stage.title}.`,
    },
    {
      id: `${stage.id}-listen-2`,
      title: `Bài nghe 2: Phân biệt từ vựng trong ngữ cảnh`,
      audioKo: lessonItems[1]?.korean || lessonItems[0]?.korean || stage.koreanTitle,
      question: `Lắng nghe và chọn nghĩa tiếng Việt của từ được phát âm:`,
      options: [
        lessonItems[1]?.meaningVi || 'Xin chào',
        'Tạm biệt',
        'Cảm ơn bạn rất nhiều',
        'Rất vui được làm quen',
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4),
      correctIndex: 0,
      romanization: lessonItems[1]?.romanization,
      meaningVi: lessonItems[1]?.meaningVi,
      explanation: `Chính xác! "${lessonItems[1]?.korean || lessonItems[0]?.korean}" mang nghĩa tiếng Việt là: "${lessonItems[1]?.meaningVi || 'Xin chào'}".`,
    },
    {
      id: `${stage.id}-listen-3`,
      title: `Bài nghe 3: Nghe câu ngắn đời sống`,
      audioKo: lessonItems[2]?.korean || `${lessonItems[0]?.korean || stage.koreanTitle} 만나서 반갑습니다`,
      question: `Lắng nghe câu thoại sau đây và xác định câu nói đúng:`,
      options: [
        lessonItems[2]?.korean || `${lessonItems[0]?.korean || stage.koreanTitle} 만나서 반갑습니다`,
        '오늘 날씨가 참 좋아요',
        '한국어 공부가 재미있어요',
        '다음에 또 만나요',
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4),
      correctIndex: 0,
      romanization: lessonItems[2]?.romanization,
      meaningVi: lessonItems[2]?.meaningVi || 'Rất vui được gặp bạn',
      explanation: `Tuyệt vời! Bạn đã bắt kịp câu phát âm chuẩn giọng người bản xứ!`,
    },
  ];

  // 2. GENERATE SPEAKING EXERCISES
  const generatedSpeaking: StageSpeakingExercise[] = customSpeaking.length > 0 ? customSpeaking : [
    {
      id: `${stage.id}-speak-1`,
      title: `Luyện phát âm câu cơ bản`,
      korean: lessonItems[0]?.korean || stage.koreanTitle,
      romanization: lessonItems[0]?.romanization || '',
      meaningVi: lessonItems[0]?.meaningVi || stage.title,
      tips: `Mở rộng khẩu hình tự nhiên, đọc liền mạch không ngắt quãng giữa các âm tiết.`,
      targetWords: [lessonItems[0]?.korean || stage.koreanTitle],
    },
    {
      id: `${stage.id}-speak-2`,
      title: `Luyện nói câu giao tiếp tự tin`,
      korean: lessonItems[1]?.korean || '안녕하세요! 반갑습니다.',
      romanization: lessonItems[1]?.romanization || 'An-nyeong-ha-se-yo! Ban-gap-seum-ni-da.',
      meaningVi: lessonItems[1]?.meaningVi || 'Xin chào! Rất vui được gặp bạn.',
      tips: `Lên giọng nhẹ ở cuối câu chào để thể hiện sự thân thiện, ấm áp.`,
      targetWords: [lessonItems[1]?.korean || '안녕하세요'],
    },
    {
      id: `${stage.id}-speak-3`,
      title: `Thử thách nói phản xạ nhanh`,
      korean: lessonItems[2]?.korean || '한국어 열심히 공부할게요!',
      romanization: lessonItems[2]?.romanization || 'Han-guk-eo yeol-sim-hi gong-bu-hal-ge-yo!',
      meaningVi: lessonItems[2]?.meaningVi || 'Tôi sẽ chăm chỉ học tiếng Hàn!',
      tips: `Nhấn vào âm "열심히" (yeol-sim-hi) để biểu thị sự quyết tâm và năng lượng tích cực.`,
      targetWords: ['한국어', '열심히'],
    },
  ];

  // 3. GENERATE READING EXERCISES
  const generatedReading: StageReadingExercise[] = customReading.length > 0 ? customReading : [
    {
      id: `${stage.id}-read-1`,
      title: `Đoạn đọc 1: Tin nhắn Kakaotalk thân mật`,
      passageType: 'message',
      passageKo: `민수: 안녕하세요! 오늘 시간 있어요?\n지수: 네, 오후에 만나요! 카페에서 커피 마셔요.\n민수: 좋아요! 3시에 만나요~`,
      passageVi: `Minsoo: Xin chào! Hôm nay bạn có rảnh không?\nJisoo: Có, chiều nay gặp nhé! Mình uống cà phê ở quán nhé.\nMinsoo: Tuyệt quá! 3 giờ gặp nha~`,
      vocabularyNotes: [
        { word: '시간', meaning: 'Thời gian, rảnh rỗi' },
        { word: '오후', meaning: 'Buổi chiều' },
        { word: '카페', meaning: 'Quán cà phê' },
        { word: '마셔요', meaning: 'Uống (động từ)' },
      ],
      question: `Hai bạn Minsoo và Jisoo hẹn gặp nhau làm gì và vào lúc mấy giờ?`,
      options: [
        'Uống cà phê lúc 3 giờ chiều',
        'Đi ăn trưa lúc 12 giờ',
        'Đi xem phim lúc 5 giờ chiều',
        'Gặp nhau học bài lúc 9 giờ sáng',
      ],
      correctIndex: 0,
      explanation: `Đoạn tin nhắn ghi rõ: "카페에서 커피 마셔요" (Uống cà phê ở quán) và "3시에 만나요" (Gặp lúc 3 giờ).`,
    },
    {
      id: `${stage.id}-read-2`,
      title: `Đoạn đọc 2: Giới thiệu bản thân ngắn gọn`,
      passageType: 'diary',
      passageKo: `저는 베트남 사람입니다. 이름은 흐엉입니다. 지금 서울에서 한국어를 배웁니다. 한국 음식 중에서 떡볶이를 가장 좋아합니다.`,
      passageVi: `Tôi là người Việt Nam. Tên tôi là Hương. Hiện tại tôi đang học tiếng Hàn ở Seoul. Trong số các món ăn Hàn Quốc, tôi thích nhất món bánh gạo cay Tteokbokki.`,
      vocabularyNotes: [
        { word: '사람', meaning: 'Người' },
        { word: '이름', meaning: 'Tên' },
        { word: '배웁니다', meaning: 'Học' },
        { word: '가장', meaning: 'Nhất' },
      ],
      question: `Bạn Hương thích món ăn Hàn Quốc nào nhất?`,
      options: [
        'Bánh gạo cay 떡볶이 (Tteokbokki)',
        'Cơm trộn 비빔밥 (Bibimbap)',
        'Thịt nướng 삼겹살 (Samgyeopsal)',
        'Canh kim chi 김치찌개 (Kimchi Jjigae)',
      ],
      correctIndex: 0,
      explanation: `Trong bài có câu: "한국 음식 중에서 떡볶이를 가장 좋아합니다" (Thích nhất là Tteokbokki).`,
    },
  ];

  // 4. GENERATE WRITING EXERCISES
  const generatedWriting: StageWritingExercise[] = customWriting.length > 0 ? customWriting : [
    {
      id: `${stage.id}-write-1`,
      type: 'arrange',
      promptVi: `Sắp xếp các từ thành câu hoàn chỉnh: "Tôi là học sinh."`,
      hintKo: `Chủ ngữ + Tiêu ngữ + Động từ là (입니다)`,
      correctSentenceKo: '저는 학생입니다.',
      romanization: 'Jeo-neun hak-saeng-im-ni-da.',
      scrambleTokens: ['학생입니다.', '저는', '선생님입니다.', '한국인'],
      explanation: `Trật tự câu tiếng Hàn là SOV (Chủ ngữ - Bổ ngữ - Vị ngữ). "저는" (Tôi là) đứng đầu, sau đó đến danh từ "학생" (học sinh) ghép đuôi "입니다" (là).`,
    },
    {
      id: `${stage.id}-write-2`,
      type: 'fill_blank',
      promptVi: `Điền từ thích hợp vào chỗ trống để tạo thành câu chào: "Xin chào, rất vui được gặp bạn!"`,
      hintKo: `안녕하세요, 만나서 ________.`,
      correctSentenceKo: '안녕하세요, 만나서 반갑습니다.',
      romanization: 'An-nyeong-ha-se-yo, man-na-seo ban-gap-seum-ni-da.',
      blankPrefix: '안녕하세요, 만나서 ',
      blankSuffix: '.',
      scrambleTokens: ['반갑습니다', '감사합니다', '미안합니다', '잘가요'],
      explanation: `"반갑습니다" nghĩa là rất vui mừng / hân hạnh được gặp gỡ.`,
    },
    {
      id: `${stage.id}-write-3`,
      type: 'arrange',
      promptVi: `Sắp xếp các khối từ thành câu: "Hôm nay thời tiết rất đẹp."`,
      hintKo: `오늘 + 날씨가 + 참 + 좋아요.`,
      correctSentenceKo: '오늘 날씨가 참 좋아요.',
      romanization: 'O-neul nal-ssi-ga cham jo-a-yo.',
      scrambleTokens: ['날씨가', '오늘', '좋아요.', '참', '나빠요.'],
      explanation: `"오늘" (hôm nay) + "날씨가" (thời tiết) + "참" (rất/thật là) + "좋아요" (đẹp/tốt).`,
    },
  ];

  return {
    listening: generatedListening,
    speaking: generatedSpeaking,
    reading: generatedReading,
    writing: generatedWriting,
  };
}

/**
 * Smart speech comparison utility to calculate accuracy score %
 */
export function calculateSpeechAccuracy(target: string, spoken: string): number {
  if (!spoken || !target) return 0;
  const cleanTarget = target.replace(/[^\w\s가-힣]/gi, '').trim().toLowerCase();
  const cleanSpoken = spoken.replace(/[^\w\s가-힣]/gi, '').trim().toLowerCase();

  if (cleanTarget === cleanSpoken) return 100;

  const targetWords = cleanTarget.split(/\s+/);
  const spokenWords = cleanSpoken.split(/\s+/);

  let matchCount = 0;
  targetWords.forEach((word) => {
    if (spokenWords.some((sw) => sw.includes(word) || word.includes(sw))) {
      matchCount++;
    }
  });

  const ratio = matchCount / Math.max(targetWords.length, 1);
  return Math.min(100, Math.max(30, Math.round(ratio * 90 + 10)));
}
