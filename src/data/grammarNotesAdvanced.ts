import { GrammarRule } from '../types';

export const ADVANCED_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'gr-indirect-statement',
    title: 'Trích dẫn gián tiếp câu trần thuật: -(ㄴ/는)다고 하다 / -대(요)',
    category: 'indirect_speech',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'ĐT hiện tại: -(ㄴ/는)다고 하다 | TT: -다고 하다 | Quá khứ: -았/었다고 하다 | Danh từ: -(이)라고 하다',
    explanationVi: 'Dùng để thuật lại lời nói của người khác (Anh ấy nói rằng..., Nghe nói là...). Trong khẩu ngữ hàng ngày được rút gọn thành: -대(요).',
    mistakeExample: '민수가 오늘 안 온다고 말했어요 -> văn nói rút gọn thành 안 온대요',
    correctExample: '민수 씨가 오늘 감기 때문에 못 온다고 해요. (⭕ Rút gọn: 못 온대요)',
    mistakeWhyVi: 'Khẩu ngữ người Hàn hầu như 100% dùng đuôi rút gọn -대(요).',
    realLifeUsage: [
      { ko: '친구가 내일 한국으로 떠난다고 해요.', vi: 'Bạn tôi bảo rằng ngày mai sẽ rời đi Hàn Quốc.' },
      { ko: '오늘 날씨가 정말 덥대요.', vi: 'Nghe đài dự báo hôm nay trời nóng lắm đấy.' },
      { ko: '선생님께서 이번 시험이 어렵다고 하셨어요.', vi: 'Thầy giáo bảo rằng kỳ thi đợt này sẽ khó.' }
    ],
    proTip: 'Ghi nhớ đuôi rút gọn: -는대요 (Động từ), -대요 (Tính từ), -(이)래요 (Danh từ).'
  },
  {
    id: 'gr-indirect-question',
    title: 'Trích dẫn gián tiếp câu hỏi: -(느)냐고 하다 / 묻다',
    category: 'indirect_speech',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'ĐT: -(느)냐고 묻다/하다 | TT: -(으)냐고 묻다 | Danh từ: -(이)냐고 묻다',
    explanationVi: 'Dùng khi thuật lại câu hỏi của người khác (Anh ấy hỏi tôi là mấy giờ đến, mẹ hỏi tôi đã ăn cơm chưa).',
    mistakeExample: 'Dùng câu trần thuật thay vì câu hỏi khi thuật lại',
    correctExample: '선생님께서 숙제를 다 했냐고 물어보셨어요. (⭕ Thầy hỏi tôi đã làm xong bài tập chưa)',
    mistakeWhyVi: 'Thuật lại câu hỏi phải dùng đuôi -(느)냐고 묻다/하다.',
    realLifeUsage: [
      { ko: '친구가 저에게 어디에 가느냐고 물었어요.', vi: 'Bạn hỏi tôi là đang đi đâu đấy.' },
      { ko: '어머니께서 밥을 먹었냐고 전화하셨어요.', vi: 'Mẹ gọi điện hỏi tôi đã ăn cơm chưa.' },
      { ko: '면접관이 한국어를 얼마나 공부했느냐고 질문했어요.', vi: 'Người phỏng vấn hỏi tôi đã học tiếng Hàn được bao lâu.' }
    ],
    proTip: 'Khẩu ngữ rút gọn thành: -(느)냬(요) (ví dụ: 언제 가냬요 = Hỏi khi nào đi).'
  },
  {
    id: 'gr-indirect-imperative',
    title: 'Trích dẫn gián tiếp mệnh lệnh: -(으)라고 하다 / -래(요)',
    category: 'indirect_speech',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'ĐT có Patchim + 으라고 하다 | ĐT không Patchim + 라고 하다 | Cấm: -지 말라고 하다',
    explanationVi: 'Thuật lại yêu cầu, mệnh lệnh hoặc lời khuyên của người khác (Bác sĩ bảo tôi hãy uống nhiều nước, sếp bảo hãy làm xong trước 5 giờ). Khẩu ngữ rút gọn thành -래(요).',
    mistakeExample: '선생님이 조용히 하세요라고 했어요 (Trích dẫn trực tiếp thô sơ)',
    correctExample: '선생님께서 조용히 하라고 하셨어요. (⭕ Trích dẫn gián tiếp tự nhiên)',
    mistakeWhyVi: 'Thuật lại lời người khác cần chuyển đổi sang đuôi gián tiếp -(으)라고 하다.',
    realLifeUsage: [
      { ko: '의사 선생님이 물을 많이 마시라고 했어요.', vi: 'Bác sĩ bảo tôi hãy uống nhiều nước.' },
      { ko: '팀장님이 보고서를 내일까지 제출하래요.', vi: 'Trưởng nhóm bảo hãy nộp báo cáo trước ngày mai.' },
      { ko: '엄마가 늦게 다니지 말라고 하셨어요.', vi: 'Mẹ dặn đừng có đi về muộn.' }
    ],
    proTip: 'Đuôi rút gọn: -래요 (Bảo làm gì) / -지 말래요 (Bảo đừng làm gì).'
  },
  {
    id: 'gr-indirect-propositive',
    title: 'Trích dẫn gián tiếp câu rủ rê: -자고 하다 / -재(요)',
    category: 'indirect_speech',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'Gốc Động từ + -자고 하다 (Khẩu ngữ rút gọn: -재요)',
    explanationVi: 'Thuật lại lời rủ rê, đề nghị cùng làm gì đó của người khác (Bạn rủ tôi đi ăn tối, đồng nghiệp rủ đi uống cà phê).',
    mistakeExample: '친구가 같이 가자라고 했어요 (❌)',
    correctExample: '친구가 주말에 같이 영화 보자고 했어요. (⭕ Rút gọn: 영화 보재요)',
    mistakeWhyVi: 'Đề nghị cùng làm dùng đuôi -자고 하다.',
    realLifeUsage: [
      { ko: '친구가 오늘 저녁에 삼겹살 먹자고 해요.', vi: 'Bạn rủ tối nay đi ăn thịt nướng Samgyeopsal.' },
      { ko: '동료가 퇴근 후에 맥주 한잔하재요.', vi: 'Đồng nghiệp rủ tan làm đi uống cốc bia.' },
      { ko: '주말에 등산 가자고 하는데 같이 갈래요?', vi: 'Mọi người rủ cuối tuần đi leo núi, cậu có muốn đi cùng không?' }
    ],
    proTip: 'Nhớ trọn bộ 4 đuôi gián tiếp: -대요 (kể), -냬요 (hỏi), -래요 (bảo), -재요 (rủ)!'
  },
  {
    id: 'gr-barame',
    title: 'Nguyên nhân đột ngột dẫn đến kết quả xấu: -(으)ㄴ/는 바람에',
    category: 'connector',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'Gốc Động từ + -는 바람에 (Luôn dẫn đến KẾT QUẢ TIÊU CỰC)',
    explanationVi: 'Diễn tả một biến cố bất ngờ xảy ra ngoài dự kiến, dẫn đến một kết quả tiêu cực hoặc phiền toái ở vế sau.',
    mistakeExample: '열심히 공부하는 바람에 시험에 합격했어요. (❌ Thi đỗ là kết quả tốt, không được dùng)',
    correctExample: '늦잠을 자는 바람에 비행기를 놓쳤어요. (⭕ Ngủ quên nên bị lỡ chuyến bay)',
    mistakeWhyVi: '-(으)ㄴ/는 바람에 chỉ dùng cho kết quả ngoài ý muốn, tiêu cực.',
    realLifeUsage: [
      { ko: '갑자기 비가 오는 바람에 옷이 다 젖었어요.', vi: 'Đột ngột trời đổ mưa làm quần áo tôi ướt hết sạch.' },
      { ko: '교통사고가 나는 바람에 회의에 늦었어요.', vi: 'Do xảy ra tai nạn giao thông bất ngờ nên tôi bị trễ cuộc họp.' },
      { ko: '태풍이 오는 바람에 비행기가 결항되었어요.', vi: 'Do bão ập đến bất ngờ nên chuyến bay đã bị hủy.' }
    ],
    proTip: 'Đặc trưng: Vế trước luôn dùng -는 바람에 (không chia thì), vế sau luôn chia quá khứ mang nghĩa xấu!'
  },
  {
    id: 'gr-passive-verbs',
    title: 'Thể Bị Động trong tiếng Hàn: -이/히/리/기- & -아/어지다',
    category: 'passive_causative',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6)',
    formula: 'Thêm tiếp từ: -이/히/리/기- hoặc kết hợp ĐT + -아/어지다',
    explanationVi: 'Biểu thị chủ ngữ bị hoặc được hành động tác động vào:\n• 보이다 (được nhìn thấy), 들리다 (được nghe thấy), 닫히다 (bị đóng lại), 잡히다 (bị bắt).\n• 만들다 -> 만들어지다 (được tạo nên), 쓰다 -> 써지다 (được viết ra).',
    mistakeExample: '소리가 들어요 (❌ Tôi nghe thấy nhưng dùng sai chủ ngữ)',
    correctExample: '음악 소리가 들려요. (⭕ Đúng: Âm thanh âm nhạc được nghe thấy)',
    mistakeWhyVi: 'Khi âm thanh tự lọt vào tai dùng thể bị động 들리다.',
    realLifeUsage: [
      { ko: '바람 때문에 문이 저절로 닫혔어요.', vi: 'Do gió thổi nên cửa tự động bị đóng sập lại.' },
      { ko: '멀리서 바다가 보여요.', vi: 'Từ đằng xa biển cả hiện lên trong tầm mắt.' },
      { ko: '도둑이 경찰에게 잡혔어요.', vi: 'Tên trộm đã bị cảnh sát bắt giữ.' }
    ],
    proTip: 'Phân biệt: 보다 (chủ động nhìn) vs 보이다 (tự đập vào mắt), 듣다 (chủ động nghe) vs 들리다 (tiếng vang đến tai).'
  },
  {
    id: 'gr-causative-verbs',
    title: 'Thể Sai Khiến: Khiến / Bảo / Cho ai làm gì (-이/히/리/기/우/추- & -게 하다)',
    category: 'passive_causative',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6)',
    formula: 'Thêm tiếp từ sai khiến hoặc ĐT + -게 하다',
    explanationVi: 'Biểu thị người nói hoặc chủ ngữ tác động, sai khiến, bắt buộc hoặc cho phép người khác thực hiện hành động:\n• 먹이다 (cho ăn), 입히다 (mặc đồ cho ai), 웃기다 (làm cho ai cười), 앉히다 (cho ngồi xuống).\n• 공부하게 하다 (bắt học bài, làm cho học bài).',
    mistakeExample: '아이에게 밥을 먹었어요 (❌)',
    correctExample: '엄마가 아이에게 밥을 먹여요. (⭕ Mẹ bón cơm cho con ăn)',
    mistakeWhyVi: 'Cho người khác ăn phải dùng động từ sai khiến 먹이다.',
    realLifeUsage: [
      { ko: '동생을 웃기려고 재미있는 이야기를 했어요.', vi: 'Tôi kể chuyện cười để làm cho em tôi bật cười.' },
      { ko: '선생님께서 학생들에게 책을 읽게 하셨어요.', vi: 'Thầy giáo yêu cầu các học sinh đọc sách.' },
      { ko: '아이에게 따뜻한 옷을 입혔어요.', vi: 'Mẹ mặc quần áo ấm cho bé.' }
    ],
    proTip: 'Nhớ câu cửa miệng hài hước: "웃기지 마!" = Đừng có làm trò cười / Đừng có đùa!'
  },
  {
    id: 'gr-eun-daneun-myeon',
    title: 'Giả định điều kiện xa xôi: -(으)ㄴ/는다면 (Nếu như...)',
    category: 'condition',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6)',
    formula: 'ĐT hiện tại: -(ㄴ/는)다면 | TT: -다면 | Quá khứ: -았/었다면',
    explanationVi: 'Dùng cho giả định khó có khả năng xảy ra trong thực tế, hoặc tưởng tượng về một tương lai xa xôi (Nếu như tôi trúng vé số 10 tỷ, nếu như được sinh ra một lần nữa).',
    mistakeExample: 'Nếu mai trời mưa dùng -(으)ㄴ/는다면 (Hơi quá kịch tính cho thời tiết bình thường)',
    correctExample: '다시 태어난다면 음악가가 되고 싶어요. (⭕ Nếu được sinh ra lần nữa, tôi muốn làm nhạc sĩ)',
    mistakeWhyVi: '-(으)ㄴ/는다면 chuyên dùng cho tình huống giả định kỳ diệu, khó xảy ra.',
    realLifeUsage: [
      { ko: '복권에 당첨된다면 세계 여행을 떠날 거예요.', vi: 'Nếu như trúng vé số, tôi sẽ lên đường đi du lịch vòng quanh thế giới.' },
      { ko: '내가 새라면 너에게 날아갈 텐데.', vi: 'Nếu như anh là cánh chim thì anh sẽ bay ngay đến bên em.' },
      { ko: '시간을 되돌릴 수 있다면 그 말을 하지 않았을 텐데.', vi: 'Nếu như có thể quay ngược thời gian thì tôi đã không thốt ra lời đó.' }
    ],
    proTip: 'Khác biệt: -(으)면 dùng cho điều kiện thực tế đời thường, còn -(으)ㄴ/는다면 dùng cho tưởng tượng phi thực tế!'
  },
  {
    id: 'gr-deorado',
    title: 'Cho dù... thì vẫn: -더라도 & -(으)ㄹ지라도',
    category: 'contrast',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6)',
    formula: 'Gốc ĐT/TT + -더라도 (Trang trọng văn viết: -(으)ㄹ지라도)',
    explanationVi: 'Biểu thị sự nhượng bộ mạnh mẽ: Giả định tình huống xấu nhất ở vế trước có xảy ra đi chăng nữa thì ý chí, quyết tâm ở vế sau cũng không hề thay đổi.',
    mistakeExample: '비가 와도 가요 (Bình thường) vs 비가 오더라도 꼭 가요 (Quyết tâm mãnh liệt)',
    correctExample: '아무리 힘들더라도 포기하지 않을 거예요. (⭕ Dù có khó khăn đến mấy tôi cũng nhất quyết không bỏ cuộc)',
    mistakeWhyVi: '-더라도 nhấn mạnh mức độ thử thách cao hơn nhiều so với -아/어도.',
    realLifeUsage: [
      { ko: '실패하더라도 다시 도전할 거예요.', vi: 'Dù cho có thất bại đi nữa tôi cũng sẽ thử sức lại lần nữa.' },
      { ko: '바쁘더라도 아침 식사는 꼭 챙겨 드세요.', vi: 'Dù có bận rộn đến đâu thì cũng nhớ phải ăn sáng đầy đủ nhé.' },
      { ko: '비록 멀리 떨어져 있을지라도 마음은 늘 함께해요.', vi: 'Dẫu cho có cách xa muôn trùng thì trái tim đôi ta vẫn luôn hướng về nhau.' }
    ],
    proTip: 'Thường đi kèm phó từ nhấn mạnh: 아무리... -더라도 (Dù cho có... đến mấy).'
  },
  {
    id: 'gr-eumeuro',
    title: 'Nguyên nhân văn viết trang trọng: -(으)므로 (Do, Vì...)',
    category: 'connector',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6 - Viết luận)',
    formula: 'Có Patchim + 으므로 | Không Patchim/Patchim ㄹ + 므로',
    explanationVi: 'Biểu thị nguyên nhân lý do trong văn bản hành chính, pháp luật, thông báo chính thức, bài xã luận báo chí và bài viết luận TOPIK II (Câu 53, 54). Tuyệt đối không dùng trong văn nói hàng ngày.',
    mistakeExample: 'Giao tiếp bạn bè lại nói: 밥을 먹으므로 배불러요 (❌ Quá kỳ cục)',
    correctExample: '공사 중이므로 통행에 주의하시기 바랍니다. (⭕ Thông báo: Vì đang thi công nên xin hãy chú ý đi lại)',
    mistakeWhyVi: '-(으)므로 là ngữ pháp chuyên dụng văn viết trang trọng bậc cao.',
    realLifeUsage: [
      { ko: '내일은 공휴일이므로 휴관합니다.', vi: 'Ngày mai là ngày nghỉ lễ quốc gia nên thư viện đóng cửa.' },
      { ko: '인구가 고령화되므로 사회적 대책이 필요하다.', vi: 'Do dân số đang già hóa nên cần có đối sách xã hội kịp thời.' },
      { ko: '규정을 위반하였으므로 벌금을 부과합니다.', vi: 'Do vi phạm quy định nên cơ quan tiến hành xử phạt.' }
    ],
    proTip: 'Bí kíp TOPIK II: Sử dụng -(으)므로 trong bài văn viết câu 53 và 54 sẽ giúp bạn đạt điểm ngữ pháp tối đa!'
  },
  {
    id: 'gr-goja-hada',
    title: 'Ý định & Mục đích phát biểu: -고자 하다 (Nhằm mục đích...)',
    category: 'purpose',
    level: 'advanced',
    levelLabel: 'Cao cấp (TOPIK 5-6)',
    formula: 'Gốc Động từ + -고자 하다 / -고자',
    explanationVi: 'Dùng trong các bài diễn văn, phát biểu khai mạc, báo cáo hội nghị để thể hiện mục đích trang trọng mà tổ chức hoặc cá nhân hướng tới.',
    mistakeExample: 'Bạn bè rủ nhau đi ăn dùng -고자 해요 (❌)',
    correctExample: '오늘 새로운 프로젝트를 설명해 드리고자 합니다. (⭕ Hôm nay tôi xin phép được giải thích về dự án mới)',
    mistakeWhyVi: '-고자 하다 là thể trang trọng chuyên dụng cho diễn thuyết hội nghị.',
    realLifeUsage: [
      { ko: '환경을 보호하고자 작은 실천을 시작했습니다.', vi: 'Nhằm mục đích bảo vệ môi trường, chúng tôi đã bắt đầu những hành động nhỏ.' },
      { ko: '양국의 우호를 증진하고자 이 행사를 개최합니다.', vi: 'Nhằm thúc đẩy tình hữu nghị hai quốc gia, sự kiện này được tổ chức long trọng.' },
      { ko: '진실을 밝히고자 최선을 다해 취재했습니다.', vi: 'Nhằm làm sáng tỏ sự thật, chúng tôi đã nỗ lực hết mình tác nghiệp.' }
    ],
    proTip: 'Tương đương văn nói là -(으)려고 하다, nhưng mang đẳng cấp trang trọng của hội thảo quốc tế.'
  },
  {
    id: 'gr-eul-riga-eopda',
    title: 'Phủ định phỏng đoán tuyệt đối: -(으)ㄹ 리가 없다 (Không có lý nào lại...)',
    category: 'conjecture',
    level: 'advanced',
    levelLabel: 'Trung-Cao cấp (TOPIK 4-5)',
    formula: 'Gốc ĐT/TT + -(으)ㄹ 리가 없다',
    explanationVi: 'Khẳng định một cách dứt khoát rằng một sự việc nào đó không thể nào xảy ra, không có bất cứ lý lẽ hay cơ sở nào để tin vào điều đó.',
    mistakeExample: 'Người tốt như anh ấy không ăn trộm -> 안 훔쳐요 (yếu ớt)',
    correctExample: '그 정직한 사람이 거짓말을 했을 리가 없어요! (⭕ Người trung thực đó không đời nào lại nói dối!)',
    mistakeWhyVi: 'Thể hiện sự tin tưởng tuyệt đối hoặc phủ nhận hoàn toàn khả năng xảy ra.',
    realLifeUsage: [
      { ko: '그 소문이 사실일 리가 없어요.', vi: 'Tin đồn thất thiệt đó không có lý nào lại là sự thật được.' },
      { ko: '민수가 약속을 잊어버렸을 리가 없어요.', vi: 'Minsu không có lý nào lại quên mất cuộc hẹn quan trọng như thế.' },
      { ko: '내가 그 비밀을 다른 사람에게 말했을 리가 있겠어요?', vi: 'Có lý nào tôi lại đi kể bí mật đó cho người khác cơ chứ?' }
    ],
    proTip: 'Ngược lại, câu hỏi tu từ mang ý phản bác: -(으)ㄹ 리가 있겠어요? (Làm gì có lý nào lại như vậy?).'
  }
];
