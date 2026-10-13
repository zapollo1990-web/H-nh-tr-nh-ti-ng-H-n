export interface SpeakingChallenge {
  id: string;
  category: 'cafe' | 'restaurant' | 'travel' | 'shopping' | 'daily' | 'dating' | 'work' | 'kpop';
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  situationVi: string;
  aiSpeaker: {
    name: string;
    avatar: string;
    role: string;
  };
  aiQuestionKo: string;
  aiQuestionRoma: string;
  aiQuestionVi: string;
  challengePromptVi: string;
  hintKeywordsKo: string[];
  // Target correct answer (HIDDEN until student speaks into mic)
  correctAnswerKo: string;
  correctRomanization: string;
  correctMeaningVi: string;
  grammarTipVi: string;
  alternativeAnswersKo?: string[];
}

export const SPEAKING_CHALLENGES: SpeakingChallenge[] = [
  // 1. Quán cà phê
  {
    id: 'sc-1',
    category: 'cafe',
    categoryLabel: 'Quán Cà Phê',
    categoryIcon: '☕',
    title: 'Gọi cà phê Americano đá tại quán',
    situationVi: 'Bạn vừa bước vào một quán cà phê sành điệu ở Hongdae. Nhân viên tươi cười hỏi bạn muốn dùng gì.',
    aiSpeaker: {
      name: 'Min-ji (민지)',
      avatar: '👩‍🍳',
      role: 'Nhân viên barista'
    },
    aiQuestionKo: '어서 오세요! 주문 도와드릴까요?',
    aiQuestionRoma: 'eo-seo o-se-yo! ju-mun do-wa-deu-ril-kka-yo?',
    aiQuestionVi: 'Xin kính chào quý khách! Em có thể giúp quý khách gọi món gì ạ?',
    challengePromptVi: 'Hãy trả lời: "Cho tôi một ly Americano đá nhé."',
    hintKeywordsKo: ['아이스 아메리카노 (Ice Americano)', '한 잔 (1 ly)', '주세요 (làm ơn cho tôi)'],
    correctAnswerKo: '아이스 아메리카노 한 잔 주세요.',
    correctRomanization: 'a-i-seu a-me-ri-ka-no han jan ju-se-yo.',
    correctMeaningVi: 'Làm ơn cho tôi một ly Americano đá nhé.',
    grammarTipVi: 'Dùng danh từ + "한 잔" (1 ly/tách) + "주세요" (hãy cho tôi...) là cấu trúc chuẩn chỉ nhất khi vào quán uống!',
    alternativeAnswersKo: [
      '아이스 아메리카노 한 잔 부탁드려요.',
      '아이스 아메리카노 하나 주세요.'
    ]
  },
  // 2. Nhà hàng thịt nướng
  {
    id: 'sc-2',
    category: 'restaurant',
    categoryLabel: 'Nhà Hàng',
    categoryIcon: '🥩',
    title: 'Gọi thịt ba chỉ nướng Samgyeopsal',
    situationVi: 'Bạn cùng bạn bè vào quán thịt nướng Gangnam. Anh chủ quán nhiệt tình đến bên bàn hỏi bạn muốn ăn mấy phần.',
    aiSpeaker: {
      name: 'Bác Kim (김 사장님)',
      avatar: '👨‍🍳',
      role: 'Chủ quán nướng Seoul'
    },
    aiQuestionKo: '손님, 삼겹살 몇 인분 준비해 드릴까요?',
    aiQuestionRoma: 'son-nim, sam-gyeop-sal myeot in-bun jun-bi-hae deu-ril-kka-yo?',
    aiQuestionVi: 'Quý khách ơi, bác chuẩn bị mấy phần thịt ba chỉ nướng cho các cháu đây?',
    challengePromptVi: 'Hãy trả lời: "Cho chúng cháu hai phần thịt ba chỉ nướng nhé ạ."',
    hintKeywordsKo: ['삼겹살 (thịt ba chỉ)', '2인분 (2 phần ăn)', '주세요 (hãy cho cháu)'],
    correctAnswerKo: '삼겹살 이인분 주세요.',
    correctRomanization: 'sam-gyeop-sal i-in-bun ju-se-yo.',
    correctMeaningVi: 'Cho chúng cháu hai phần thịt ba chỉ nướng nhé ạ.',
    grammarTipVi: 'Khi đếm phần ăn (인분), dùng số Hán Hàn: 일인분 (1 phần), 이인분 (2 phần), 삼인분 (3 phần).',
    alternativeAnswersKo: [
      '삼겹살 2인분 주세요.',
      '삼겹살 이인분 부탁해요.'
    ]
  },
  // 3. Hỏi đường ga tàu điện ngầm
  {
    id: 'sc-3',
    category: 'travel',
    categoryLabel: 'Hỏi Đường',
    categoryIcon: '🚇',
    title: 'Hỏi đường tới ga tàu điện ngầm gần nhất',
    situationVi: 'Bạn đang đi bộ ở khu Myeongdong và bị lạc lối. Bạn gặp một bạn trẻ đi ngang qua và muốn nhờ chỉ đường.',
    aiSpeaker: {
      name: 'Ji-hoon (지훈)',
      avatar: '🧑',
      role: 'Người dân Seoul thân thiện'
    },
    aiQuestionKo: '네, 혹시 길 찾으시는 중인가요?',
    aiQuestionRoma: 'ne, hok-si gil chat-eu-si-neun jung-in-ga-yo?',
    aiQuestionVi: 'Dạ, có phải bạn đang tìm đường không ạ?',
    challengePromptVi: 'Hãy hỏi: "Xin lỗi, ga tàu điện ngầm ở đâu vậy ạ?"',
    hintKeywordsKo: ['실례지만 (xin lỗi/thất lễ)', '지하철역 (ga tàu điện ngầm)', '어디예요 (ở đâu ạ)'],
    correctAnswerKo: '실례지만, 지하철역이 어디예요?',
    correctRomanization: 'sil-rye-ji-man, ji-ha-cheol-yeok-i eo-di-ye-yo?',
    correctMeaningVi: 'Xin lỗi, ga tàu điện ngầm ở đâu vậy ạ?',
    grammarTipVi: 'Bắt đầu bằng "실례지만" (xin lỗi cho tôi làm phiền một chút) tạo cảm giác cực kỳ lễ phép và lịch sự!',
    alternativeAnswersKo: [
      '지하철역이 어디에 있어요?',
      '가장 가까운 지하철역 어디예요?'
    ]
  },
  // 4. Mua sắm & Hỏi giá tiền
  {
    id: 'sc-4',
    category: 'shopping',
    categoryLabel: 'Mua Sắm',
    categoryIcon: '🛍️',
    title: 'Hỏi giá tiền chiếc áo ấm thời trang',
    situationVi: 'Bạn nhìn thấy một chiếc áo len mùa đông rất đẹp ở cửa hàng thời trang Dongdaemun. Bạn muốn hỏi giá chủ tiệm.',
    aiSpeaker: {
      name: 'Cô Park (박 이모)',
      avatar: '👩‍💼',
      role: 'Chủ tiệm thời trang Dongdaemun'
    },
    aiQuestionKo: '어머, 손님 눈썰미 최고시네! 이 옷 진짜 예쁘죠?',
    aiQuestionRoma: 'eo-meo, son-nim nun-sseol-mi choe-go-si-ne! i ot jin-jja ye-ppeu-jyo?',
    aiQuestionVi: 'Ôi quý khách khéo chọn quá nha! Chiếc áo này mặc lên dáng xinh xỉu luôn đúng không?',
    challengePromptVi: 'Hãy hỏi: "Chiếc áo này giá bao nhiêu tiền vậy ạ?"',
    hintKeywordsKo: ['이 옷 (chiếc áo này)', '얼마예요 (bao nhiêu tiền ạ)'],
    correctAnswerKo: '이 옷 얼마예요?',
    correctRomanization: 'i ot eol-ma-ye-yo?',
    correctMeaningVi: 'Chiếc áo này giá bao nhiêu tiền vậy ạ?',
    grammarTipVi: '"[Danh từ] + 얼마예요?" là mẫu câu hỏi giá tiền bất hủ và thông dụng nhất ở Hàn Quốc!',
    alternativeAnswersKo: [
      '이거 얼마예요?',
      '이 옷 가격이 얼마인가요?'
    ]
  },
  // 5. Làm quen & Giới thiệu bản thân
  {
    id: 'sc-5',
    category: 'daily',
    categoryLabel: 'Giao Lưu',
    categoryIcon: '🤝',
    title: 'Giới thiệu tôi là người Việt Nam',
    situationVi: 'Tại buổi gặp gỡ sinh viên quốc tế ở Seoul, một bạn sinh viên Hàn Quốc tươi cười bắt chuyện với bạn.',
    aiSpeaker: {
      name: 'So-hee (소희)',
      avatar: '👧',
      role: 'Sinh viên đại học Yonsei'
    },
    aiQuestionKo: '반가워요! 혹시 어느 나라에서 오셨어요?',
    aiQuestionRoma: 'ban-ga-wo-yo! hok-si eo-neu na-ra-e-seo o-syeoss-eo-yo?',
    aiQuestionVi: 'Rất vui được làm quen với bạn! Bạn đến từ đất nước nào vậy?',
    challengePromptVi: 'Hãy trả lời: "Tôi là người Việt Nam."',
    hintKeywordsKo: ['저는 (tôi là)', '베트남 사람 (người Việt Nam)', '이에요 (là)'],
    correctAnswerKo: '저는 베트남 사람이에요.',
    correctRomanization: 'jeo-neun be-teu-nam sa-ram-i-e-yo.',
    correctMeaningVi: 'Tôi là người Việt Nam ạ.',
    grammarTipVi: '"사람" có phụ âm cuối (받침) nên ta chia đuôi là "이에요". Ví dụ: 베트남 사람이에요.',
    alternativeAnswersKo: [
      '베트남 사람입니다.',
      '저는 베트남에서 왔어요.'
    ]
  },
  // 6. Thả thính hẹn hò
  {
    id: 'sc-6',
    category: 'dating',
    categoryLabel: 'Hẹn Hò',
    categoryIcon: '💖',
    title: 'Rủ crush đi ngắm hoàng hôn sông Hàn',
    situationVi: 'Trời mùa thu Seoul mát mẻ và lãng mạn. Bạn muốn rủ người bạn đặc biệt cùng đi dạo bờ sông Hàn.',
    aiSpeaker: {
      name: 'Ha-neul (하늘)',
      avatar: '🥰',
      role: 'Người bạn dễ thương'
    },
    aiQuestionKo: '오늘 날씨 진짜 좋다! 주말에 시간 있어요?',
    aiQuestionRoma: 'o-neul nal-ssi jin-jja joh-da! ju-mal-e si-gan iss-eo-yo?',
    aiQuestionVi: 'Thời tiết hôm nay đẹp thật đấy! Cuối tuần này bạn có rảnh không?',
    challengePromptVi: 'Hãy rủ: "Tụi mình cùng đi sông Hàn ngắm cảnh nhé?"',
    hintKeywordsKo: ['우리 (chúng mình)', '한강에 (ở sông Hàn)', '같이 가요 (cùng đi nhé)'],
    correctAnswerKo: '우리 한강에 같이 가요.',
    correctRomanization: 'u-ri han-gang-e gat-i ga-yo.',
    correctMeaningVi: 'Tụi mình cùng nhau đi sông Hàn nhé.',
    grammarTipVi: 'Đuôi câu "-아/어요" khi lên giọng ở cuối câu mang nghĩa rủ rê, đề nghị thân mật và ngọt ngào.',
    alternativeAnswersKo: [
      '우리 같이 한강 갈래요?',
      '주말에 한강에서 만나요.'
    ]
  },
  // 7. Buôn chuyện K-pop
  {
    id: 'sc-7',
    category: 'kpop',
    categoryLabel: 'K-pop Idol',
    categoryIcon: '🎤',
    title: 'Nói về nhóm nhạc K-pop yêu thích nhất',
    situationVi: 'Bạn gặp một người bạn Hàn Quốc cũng là fan cuồng K-pop. Bạn ấy tò mò muốn biết bạn thích nhóm nào nhất.',
    aiSpeaker: {
      name: 'Tae-yang (태양)',
      avatar: '🎧',
      role: 'Fan K-pop chính hiệu'
    },
    aiQuestionKo: '와! 케이팝 좋아한다고요? 최애 그룹이 누구예요?',
    aiQuestionRoma: 'wa! ke-i-pap joh-a-han-da-go-yo? choe-ae geu-rup-i nu-gu-ye-yo?',
    aiQuestionVi: 'Oa! Bạn bảo bạn thích K-pop á? Idol bạn mê nhất là nhóm nhạc nào thế?',
    challengePromptVi: 'Hãy nói: "Tôi thích nhóm nhạc BTS nhất."',
    hintKeywordsKo: ['저는 (tôi)', '방탄소년단을 (BTS)', '가장 좋아해요 (thích nhất)'],
    correctAnswerKo: '저는 방탄소년단을 가장 좋아해요.',
    correctRomanization: 'jeo-neun bang-tan-so-nyeon-dan-eul ga-jang joh-a-hae-yo.',
    correctMeaningVi: 'Tôi thích nhóm BTS nhất ạ.',
    grammarTipVi: '"가장" hoặc "제일" đứng trước tính từ/động từ mang nghĩa "nhất" (nhất quả đất).',
    alternativeAnswersKo: [
      '제 최애는 방탄소년단이에요.',
      '방탄소년단 제일 좋아해요.'
    ]
  },
  // 8. Xin thanh toán hóa đơn
  {
    id: 'sc-8',
    category: 'restaurant',
    categoryLabel: 'Nhà Hàng',
    categoryIcon: '💳',
    title: 'Tính tiền sau bữa ăn ngon miệng',
    situationVi: 'Bạn ăn xong bữa cơm trộn bibimbap thơm lừng tại quán ăn truyền thống. Bạn tiến ra quầy thu ngân để thanh toán.',
    aiSpeaker: {
      name: 'Chị Lee (이모님)',
      avatar: '👩',
      role: 'Thu ngân quán ăn'
    },
    aiQuestionKo: '맛있게 드셨어요? 계산 도와드릴까요?',
    aiQuestionRoma: 'mas-iss-ge deu-syeoss-eo-yo? gye-san do-wa-deu-ril-kka-yo?',
    aiQuestionVi: 'Quý khách ăn ngon miệng chứ ạ? Em tính tiền cho quý khách nhé?',
    challengePromptVi: 'Hãy nói: "Làm ơn tính tiền giúp tôi ạ."',
    hintKeywordsKo: ['계산해 (tính tiền)', '주세요 (hãy làm giúp tôi)'],
    correctAnswerKo: '계산해 주세요.',
    correctRomanization: 'gye-san-hae ju-se-yo.',
    correctMeaningVi: 'Làm ơn tính tiền giúp tôi ạ.',
    grammarTipVi: '"계산" là tính tiền/thanh toán. Cụm từ "계산해 주세요" dùng được ở mọi nhà hàng, siêu thị, quán ăn.',
    alternativeAnswersKo: [
      '계산 부탁드립니다.',
      '여기 계산이요.'
    ]
  },
  // 9. Hỏi mật khẩu Wifi
  {
    id: 'sc-9',
    category: 'cafe',
    categoryLabel: 'Quán Cà Phê',
    categoryIcon: '📶',
    title: 'Hỏi mật khẩu Wifi của quán',
    situationVi: 'Bạn muốn mở laptop học bài tại quán cà phê nhưng không tìm thấy mật khẩu wifi dán trên bàn.',
    aiSpeaker: {
      name: 'Jun-seo (준서)',
      avatar: '🧑‍💻',
      role: 'Nhân viên quán cà phê'
    },
    aiQuestionKo: '손님, 필요한 거 있으신가요?',
    aiQuestionRoma: 'son-nim, pil-yo-han geo iss-eu-sin-ga-yo?',
    aiQuestionVi: 'Quý khách ơi, quý khách có cần em hỗ trợ gì thêm không ạ?',
    challengePromptVi: 'Hãy hỏi: "Mật khẩu Wi-Fi là gì vậy ạ?"',
    hintKeywordsKo: ['와이파이 (Wi-Fi)', '비밀번호가 (mật khẩu)', '뭐예요 (là gì ạ)'],
    correctAnswerKo: '와이파이 비밀번호가 뭐예요?',
    correctRomanization: 'wa-i-pa-i bi-mil-beon-ho-ga mwo-ye-yo?',
    correctMeaningVi: 'Mật khẩu Wi-Fi là gì vậy ạ?',
    grammarTipVi: '"비밀번호" (bí mật phiên hiệu) là mật khẩu. Kết hợp "뭐예요?" (là gì thế ạ?).',
    alternativeAnswersKo: [
      '와이파이 비밀번호 좀 알려주세요.',
      '와이파이 비번이 어떻게 돼요?'
    ]
  },
  // 10. Mặc cả giảm giá vui vẻ
  {
    id: 'sc-10',
    category: 'shopping',
    categoryLabel: 'Mua Sắm',
    categoryIcon: '🏷️',
    title: 'Nhờ cô bán hàng giảm giá thêm chút xíu',
    situationVi: 'Bạn mua 3 đôi tất xinh xắn ở chợ truyền thống Namdaemun và muốn nói khéo xin cô bớt cho một chút.',
    aiSpeaker: {
      name: 'Bác Choi (최 이모)',
      avatar: '👵',
      role: 'Tiểu thương chợ Namdaemun'
    },
    aiQuestionKo: '양말 3켤레에 만 원이에요! 참 예쁘죠?',
    aiQuestionRoma: 'yang-mal se-kyeol-re-e man won-i-e-yo! cham ye-ppeu-jyo?',
    aiQuestionVi: '3 đôi tất cả thảy là mười nghìn won nha! Dễ thương lắm đúng hông?',
    challengePromptVi: 'Hãy nói khéo: "Bác bớt cho cháu một chút được không ạ?"',
    hintKeywordsKo: ['조금만 (chỉ một chút xíu thôi)', '깎아 주세요 (hãy bớt giá cho cháu)'],
    correctAnswerKo: '조금만 깎아 주세요.',
    correctRomanization: 'jo-geum-man kkak-a ju-se-yo.',
    correctMeaningVi: 'Bác bớt cho cháu một chút xíu nhé ạ.',
    grammarTipVi: '"깎다" có nghĩa là gọt, cắt bớt -> "깎아 주세요" là câu mặc cả kinh điển và rất duyên dáng ở chợ Hàn.',
    alternativeAnswersKo: [
      '조금만 깎아 주실 수 있나요?',
      '이모님, 좀 깎아 줘요~ ㅎㅎ'
    ]
  },
  // 11. Xin lỗi vì đến muộn
  {
    id: 'sc-11',
    category: 'daily',
    categoryLabel: 'Đời Sống',
    categoryIcon: '⏰',
    title: 'Xin lỗi bạn vì bị trễ tàu điện ngầm',
    situationVi: 'Do tàu điện ngầm bị chậm chuyến, bạn đến chỗ hẹn muộn 10 phút. Bạn cần xin lỗi người bạn đang đợi.',
    aiSpeaker: {
      name: 'Eun-ji (은지)',
      avatar: '👱‍♀️',
      role: 'Bạn thân'
    },
    aiQuestionKo: '어! 왔어? 어디 있었어?',
    aiQuestionRoma: 'eo! w原创-eo? eo-di iss-eoss-eo?',
    aiQuestionVi: 'Ơ! Đến rồi đó hả? Nãy giờ cậu kẹt ở đâu thế?',
    challengePromptVi: 'Hãy nói: "Xin lỗi vì mình đến muộn nhé."',
    hintKeywordsKo: ['늦어서 (vì đến muộn)', '죄송해요 / 미안해요 (xin lỗi)'],
    correctAnswerKo: '늦어서 정말 죄송해요.',
    correctRomanization: 'neuj-eo-seo jeong-mal joe-song-hae-yo.',
    correctMeaningVi: 'Vì đến muộn nên mình thật sự xin lỗi nhé.',
    grammarTipVi: 'Cấu trúc nguyên nhân "-아서/어서": "늦다" (muộn) -> "늦어서" (vì muộn nên...).',
    alternativeAnswersKo: [
      '늦어서 미안해요!',
      '많이 기다렸죠? 늦어서 죄송해요.'
    ]
  },
  // 12. Khen ngợi món ăn
  {
    id: 'sc-12',
    category: 'restaurant',
    categoryLabel: 'Nhà Hàng',
    categoryIcon: '🍲',
    title: 'Khen món canh kim chi nấu ngon tuyệt',
    situationVi: 'Bạn ăn xong bát canh kim chi hầm thịt heo nóng hổi và cảm thấy quá xuất sắc, muốn khen đầu bếp quán.',
    aiSpeaker: {
      name: 'Đầu bếp Park (박 셰프)',
      avatar: '👨‍🍳',
      role: 'Đầu bếp nhà hàng'
    },
    aiQuestionKo: '찌개 간은 입에 맞으셨나요?',
    aiQuestionRoma: 'jji-gae gan-eun ib-e maj-eu-syeoss-na-yo?',
    aiQuestionVi: 'Món canh hôm nay vị có vừa miệng quý khách không ạ?',
    challengePromptVi: 'Hãy khen: "Món ăn thực sự rất ngon luôn ạ!"',
    hintKeywordsKo: ['음식이 (món ăn)', '정말 (thực sự)', '맛있어요 (rất ngon)'],
    correctAnswerKo: '음식이 정말 맛있어요!',
    correctRomanization: 'eum-sik-i jeong-mal mas-iss-eo-yo!',
    correctMeaningVi: 'Món ăn thực sự ngon tuyệt cú mèo luôn ạ!',
    grammarTipVi: '"맛있다" (ngon) chia đuôi thân mật lịch sự thành "맛있어요". Khen câu này chủ quán thích mê!',
    alternativeAnswersKo: [
      '진짜 맛있게 잘 먹었습니다!',
      '완전 꿀맛이에요!'
    ]
  }
];
