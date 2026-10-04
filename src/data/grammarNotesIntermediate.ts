import { GrammarRule } from '../types';

export const INTERMEDIATE_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'gr-geot-gatda',
    title: 'Phỏng đoán dường như: -(으)ㄴ/는 것 같다',
    category: 'conjecture',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Quá khứ: ĐT + -(으)ㄴ 것 같다 | Hiện tại: ĐT + -는 것 같다 / TT + -(으)ㄴ 것 같다 | Tương lai: -(으)ㄹ 것 같다',
    explanationVi: 'Ngữ pháp phỏng đoán thông dụng nhất trong tiếng Hàn đời sống. Dùng để biểu đạt ý kiến cá nhân một cách khiêm tốn, lịch sự, tránh khẳng định quá gay gắt.',
    mistakeExample: 'Hôm nay trời mưa -> 비가 오는 것 같아요 nói thành 비가 온 것 같아요 (nhầm thì)',
    correctExample: '비가 오는 것 같아요. (⭕ Dường như trời đang mưa đấy)',
    mistakeWhyVi: 'Hiện tại động từ dùng -는 것 같다, quá khứ dùng -(으)ㄴ 것 같다, tương lai dùng -(으)ㄹ 것 같다.',
    realLifeUsage: [
      { ko: '오늘 날씨가 좀 추운 것 같아요.', vi: 'Dường như hôm nay thời tiết hơi lạnh.' },
      { ko: '민수 씨가 벌써 집에 간 것 같아요.', vi: 'Hình như Minsu đã về nhà rồi.' },
      { ko: '내일 비가 올 것 같아요.', vi: 'Có lẽ ngày mai trời sẽ mưa.' }
    ],
    proTip: 'Người Hàn khi nêu ý kiến luôn nói "- 것 같아요" thay vì nói thẳng thừng để giữ phép lịch sự!'
  },
  {
    id: 'gr-eoya-hada-doeda',
    title: 'Bắt buộc & Cần thiết: -아/어야 하다 / 되다 (Phải làm gì)',
    category: 'obligation',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Gốc ĐT/TT + -아/어야 하다 hoặc -아/어야 되다',
    explanationVi: 'Biểu thị sự bắt buộc phải thực hiện nghĩa vụ hoặc hành động cần thiết. Khẩu ngữ chuộng "되다", văn viết chuộng "하다".',
    mistakeExample: '내일 일찍 일어나야 싶어요. (❌ Ghép sai ngữ pháp)',
    correctExample: '내일 일찍 일어나야 해요. (⭕ Ngày mai tôi phải dậy sớm)',
    mistakeWhyVi: 'Phải làm gì bắt buộc dùng -아/어야 하다/되다.',
    realLifeUsage: [
      { ko: '한국에서 살려면 한국어를 열심히 공부해야 해요.', vi: 'Nếu muốn sống ở Hàn Quốc thì phải học chăm chỉ tiếng Hàn.' },
      { ko: '약속 시간에 늦지 말아야 돼요.', vi: 'Bạn không được đến trễ giờ hẹn.' },
      { ko: '지금 은행에 가야 돼요.', vi: 'Bây giờ tôi phải đến ngân hàng.' }
    ],
    proTip: 'Dạng câu hỏi xin phép: "-아/어야 돼요?" (Tôi có phải làm việc này không?).'
  },
  {
    id: 'gr-eodo-doeda-vs-myeon-andoeda',
    title: 'Cho phép vs Cấm đoán: -아/어도 되다 vs -(으)면 안 되다',
    category: 'obligation',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Được phép: -아/어도 되다 (Được làm) vs Cấm đoán: -(으)면 안 되다 (Không được làm)',
    explanationVi: '• -아/어도 되다: Cho phép làm gì, hoặc dùng để hỏi xin phép (Tôi làm việc này có được không?).\n• -(으)면 안 되다: Cấm đoán nghiêm ngặt (không được phép làm gì).',
    mistakeExample: '여기에서 담배를 피우지 마세요 -> dùng 피우면 안 돼요 khi có biển báo quy định',
    correctExample: '여기에서 담배를 피우면 안 됩니다. (⭕ Cấm hút thuốc ở đây)',
    mistakeWhyVi: '-(으)면 안 되다 mang tính quy tắc cấm chỉ mang tính pháp lý hoặc nội quy.',
    realLifeUsage: [
      { ko: '여기 앉아도 돼요? - 네, 앉으세요.', vi: 'Tôi ngồi ở đây được không? - Vâng, xin mời ngồi.' },
      { ko: '도서관에서 시끄럽게 떠들면 안 돼요.', vi: 'Trong thư viện không được phép làm ồn.' },
      { ko: '사진을 찍어도 돼요?', vi: 'Tôi có thể chụp ảnh ở đây được không?' }
    ],
    proTip: 'Hỏi xin phép lịch sự: ĐT + -아/어도 괜찮아요? hoặc -아/어도 될까요?'
  },
  {
    id: 'gr-neunde-eunde',
    title: 'Liên từ tiền đề & Tương phản: -(으)ㄴ/는데 (Nhưng mà, Vậy thì...)',
    category: 'connector',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'ĐT hiện tại: -는데 | TT: -(으)ㄴ데 | Quá khứ: -았/었는데 | Danh từ: -인데',
    explanationVi: 'Một trong những ngữ pháp phổ biến nhất trong tiếng Hàn với 2 nghĩa:\n1. Tương phản nhẹ nhàng: Nhưng mà (thời tiết lạnh nhưng tôi vẫn đi chơi).\n2. Giới thiệu hoàn cảnh nền trước khi đưa ra đề nghị, câu hỏi hoặc nhờ vả (Tôi đang đi chợ nè, bạn cần mua gì không?).',
    mistakeExample: 'Tôi đang rảnh nhưng bạn lại bận -> dùng -지만 khi muốn mở lời nhờ vả (hơi cứng)',
    correctExample: '지금 시간 있는데 같이 영화 볼래요? (⭕ Tự nhiên 100%)',
    mistakeWhyVi: 'Mở lời dẫn dắt cho câu hỏi hoặc lời mời luôn dùng -(으)ㄴ/는데.',
    realLifeUsage: [
      { ko: '한국어 공부를 하는데 정말 재미있어요.', vi: 'Tôi đang học tiếng Hàn nè, thấy thú vị lắm.' },
      { ko: '밖에는 비가 오는데 우산이 없어요.', vi: 'Ngoài trời đang mưa mà tôi lại không có ô.' },
      { ko: '지금 바쁜데 조금 있다가 전화할게요.', vi: 'Bây giờ tôi đang bận, lát nữa tôi gọi lại nhé.' }
    ],
    proTip: 'Đuôi câu lấp lửng từ chối khéo: "저도 가고 싶은데요..." (Mình cũng muốn đi lắm nhưng mà...).'
  },
  {
    id: 'gr-eumyeonseo',
    title: 'Hành động đồng thời -(으)면서 (Vừa... Vừa...)',
    category: 'connector',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Gốc Động từ + -(으)면서 (Chủ ngữ 2 vế phải là MỘT người)',
    explanationVi: 'Diễn tả chủ ngữ thực hiện cùng một lúc hai hành động (vừa ăn cơm vừa xem tivi, vừa nghe nhạc vừa học bài).',
    mistakeExample: '동생이 밥을 먹으면서 내가 청소해요. (❌ Sai vì 2 người khác nhau)',
    correctExample: '저는 음악을 들으면서 청소해요. (⭕ Cùng một người thực hiện)',
    mistakeWhyVi: '-(으)면서 bắt buộc chủ ngữ 2 vế câu phải là cùng một đối tượng.',
    realLifeUsage: [
      { ko: '음악을 들으면서 공부해요.', vi: 'Tôi vừa nghe nhạc vừa học bài.' },
      { ko: '커피를 마시면서 이야기를 나눴어요.', vi: 'Chúng tôi vừa uống cà phê vừa trò chuyện.' },
      { ko: '운전하면서 스마트폰을 보면 안 돼요.', vi: 'Không được vừa lái xe vừa nhìn điện thoại.' }
    ],
    proTip: 'Nếu 2 người khác nhau cùng làm việc khác nhau, dùng "ĐT + -는 동안에" (trong khi).'
  },
  {
    id: 'gr-gi-jeone-vs-eun-hue',
    title: 'Trình tự thời gian: -기 전에 vs -(으)ㄴ 후에 (Trước khi vs Sau khi)',
    category: 'tense',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Trước khi: ĐT + -기 전에 | Sau khi: ĐT + -(으)ㄴ 후에 / 뒤에 / 다음에',
    explanationVi: 'Xác định thứ tự trước sau của 2 hành động:\n• -기 전에: Trước khi làm hành động này (nhớ là luôn để nguyên thể + -기 전에, không chia quá khứ).\n• -(으)ㄴ 후에: Sau khi đã làm xong hành động này.',
    mistakeExample: '밥을 먹은 전에 손을 씻어요. (❌ Sai thì)',
    correctExample: '밥을 먹기 전에 손을 씻어요. (⭕ Trước khi ăn cơm phải rửa tay)',
    mistakeWhyVi: 'Trước -기 전에 luôn là động từ nguyên thể gắn -기, không chia thì.',
    realLifeUsage: [
      { ko: '자기 전에 양치질을 해요.', vi: 'Trước khi đi ngủ tôi đánh răng.' },
      { ko: '식사한 후에 커피를 마셨어요.', vi: 'Sau khi dùng bữa xong tôi đã uống cà phê.' },
      { ko: '수업이 끝난 후에 만나요.', vi: 'Sau khi tan học chúng mình gặp nhau nhé.' }
    ],
    proTip: 'Với danh từ: Danh từ + 전에 (식사 전에 = trước bữa ăn), Danh từ + 후에 (졸업 후에 = sau khi tốt nghiệp).'
  },
  {
    id: 'gr-a-eo-jida',
    title: 'Sự biến đổi trạng thái: -아/어지다 (Trở nên, Dần trở nên...)',
    category: 'tense',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'Tính từ + -아/어지다 (Quá khứ: -아/어졌어요)',
    explanationVi: 'Diễn tả tính chất, trạng thái chuyển biến dần dần theo thời gian (thời tiết trở nên ấm áp, tiếng Hàn ngày càng giỏi lên, giá cả đắt đỏ hơn).',
    mistakeExample: '날씨가 따뜻해요 khi muốn nói về sự thay đổi từ lạnh sang ấm',
    correctExample: '날씨가 따뜻해졌어요. (⭕ Thời tiết đã trở nên ấm áp hơn rồi)',
    mistakeWhyVi: 'Biểu thị sự biến chuyển bắt buộc dùng -아/어지다.',
    realLifeUsage: [
      { ko: '한국어 실력이 점점 좋아지고 있어요.', vi: 'Khả năng tiếng Hàn của tôi đang ngày càng tốt lên.' },
      { ko: '날씨가 많이 추워졌어요. 감기 조심하세요.', vi: 'Thời tiết đã trở nên lạnh nhiều rồi, hãy cẩn thận kẻo cảm lạnh.' },
      { ko: '밤이 되니까 거리가 조용해졌어요.', vi: 'Về đêm nên đường phố đã trở nên yên tĩnh.' }
    ],
    proTip: 'Động từ ghép -아/어지다 sẽ mang nghĩa bị động (tạo thành: 만들어지다, viết ra: 써지다).'
  },
  {
    id: 'gr-ge-doeda',
    title: 'Biến chuyển do hoàn cảnh: -게 되다 (Được / Bị / Trở nên...)',
    category: 'passive_causative',
    level: 'intermediate',
    levelLabel: 'Trung cấp 4',
    formula: 'Gốc Động từ + -게 되다 (Quá khứ: -게 되었어요 / 됐어요)',
    explanationVi: 'Diễn tả một sự việc diễn ra không phải do ý chí chủ quan ban đầu của người nói, mà do hoàn cảnh, cơ duyên hoặc quyết định của tập thể đưa đẩy.',
    mistakeExample: 'Tôi được chuyển công tác sang Hàn Quốc -> 한국에 가요 (không nêu bật hoàn cảnh)',
    correctExample: '다음 달에 한국으로 출장 가게 되었어요. (⭕ Tôi được cử đi công tác Hàn Quốc)',
    mistakeWhyVi: '-게 되다 nhấn mạnh sự sắp đặt khách quan.',
    realLifeUsage: [
      { ko: '회사 일 때문에 서울에 살게 되었어요.', vi: 'Do công việc công ty nên tôi đã chuyển đến sống ở Seoul.' },
      { ko: '친구 덕분에 그 가수를 알게 되었어요.', vi: 'Nhờ có bạn mà tôi đã biết đến ca sĩ đó.' },
      { ko: '장학금을 받게 되었어요.', vi: 'Tôi đã được nhận học bổng.' }
    ],
    proTip: 'Mẫu câu lịch sự khi tự giới thiệu: "만나 뵙게 되어 반갑습니다" (Thật vinh dự được biết quý vị).'
  },
  {
    id: 'gr-gi-ddaemune',
    title: 'Nguyên nhân nhấn mạnh: -기 때문에 (Bởi vì...)',
    category: 'connector',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'ĐT/TT + -기 때문에 | Danh từ + (이)기 때문에 | Danh từ + 때문에',
    explanationVi: 'Nhấn mạnh nguyên nhân, lý do một cách rõ ràng, trang trọng, dùng nhiều trong văn viết, báo chí và phỏng vấn.',
    mistakeExample: 'Vế sau là câu rủ rê lại dùng -기 때문에 (❌)',
    correctExample: '비가 오기 때문에 길이 많이 막혀요. (⭕ Đúng vì vế sau là câu trần thuật)',
    mistakeWhyVi: '-기 때문에 không đi với câu mệnh lệnh hoặc rủ rê.',
    realLifeUsage: [
      { ko: '시험이 있기 때문에 열심히 공부해요.', vi: 'Bởi vì có kỳ thi nên tôi học tập rất chăm chỉ.' },
      { ko: '비 때문에 약속이 취소되었어요.', vi: 'Vì cơn mưa mà cuộc hẹn đã bị hủy bỏ.' },
      { ko: '가족이 제게 가장 소중하기 때문에 열심히 살아요.', vi: 'Bởi vì gia đình là điều quý giá nhất nên tôi luôn cố gắng sống tốt.' }
    ],
    proTip: 'Nếu lý do đem lại kết quả tốt: Dùng Danh từ + 덕분에 (nhờ có...). Kết quả xấu: Danh từ + 탓에 (tại vì...).'
  },
  {
    id: 'gr-eul-bbunman-anira',
    title: 'Không những mà còn: -(으)ㄹ 뿐만 아니라',
    category: 'connector',
    level: 'intermediate',
    levelLabel: 'Trung cấp 4',
    formula: 'ĐT/TT + -(으)ㄹ 뿐만 아니라 | Danh từ + 뿐만 아니라',
    explanationVi: 'Biểu thị sự bổ sung tăng tiến: không chỉ có sự việc ở vế trước mà vế sau cũng còn có thêm nội dung tương tự.',
    mistakeExample: 'Vế trước tích cực, vế sau lại tiêu cực (nghe lệch pha)',
    correctExample: '그 사람은 친절할 뿐만 아니라 일도 잘해요. (⭕ Đúng: Vừa tốt bụng vừa làm việc giỏi)',
    mistakeWhyVi: 'Cả hai vế câu phải cùng hướng tích cực hoặc cùng hướng tiêu cực.',
    realLifeUsage: [
      { ko: '한국어는 재미있을 뿐만 아니라 취업에도 도움이 돼요.', vi: 'Tiếng Hàn không những thú vị mà còn giúp ích cho việc xin việc.' },
      { ko: '그 식당은 맛이 좋을 뿐만 아니라 가격도 저렴해요.', vi: 'Nhà hàng đó không những ngon mà giá cả còn rất rẻ.' },
      { ko: '영어뿐만 아니라 한국어도 유창해요.', vi: 'Không chỉ tiếng Anh mà tiếng Hàn cũng rất lưu loát.' }
    ],
    proTip: 'Ngữ pháp vàng ăn điểm trong bài viết TOPIK II (Câu 53, 54)!'
  },
  {
    id: 'gr-daesine',
    title: 'Bù lại & Thay vì: -(으)ㄴ/는 대신에',
    category: 'contrast',
    level: 'intermediate',
    levelLabel: 'Trung cấp 4',
    formula: 'ĐT hiện tại: -는 대신에 | TT: -(으)ㄴ 대신에 | Danh từ + 대신에',
    explanationVi: 'Có 2 sắc thái ý nghĩa:\n1. Thay thế hành động này bằng hành động khác (Thay vì đi cà phê thì chúng mình ở nhà nấu ăn).\n2. Bù lại khuyết điểm (Căn phòng này hơi nhỏ nhưng bù lại tiền thuê rất rẻ).',
    mistakeExample: 'Nói về bù trừ mà lại quên dùng -(으)ㄴ với tính từ',
    correctExample: '방이 작은 대신에 월세가 싸요. (⭕ Căn phòng nhỏ nhưng bù lại tiền nhà rẻ)',
    mistakeWhyVi: 'Tính từ dùng đuôi -(으)ㄴ 대신에.',
    realLifeUsage: [
      { ko: '커피 대신에 따뜻한 차를 마셔요.', vi: 'Thay vì uống cà phê tôi uống trà ấm.' },
      { ko: '주말에 일하는 대신에 평일에 하루 쉬어요.', vi: 'Bù lại việc đi làm cuối tuần thì được nghỉ một ngày trong tuần.' },
      { ko: '제가 밥을 사는 대신에 커피는 네가 사줘.', vi: 'Tớ mời cơm rồi thì bù lại cậu mua cà phê nhé.' }
    ],
    proTip: 'Được dùng rất nhiều khi đàm phán, thương lượng công việc và cuộc sống.'
  },
  {
    id: 'gr-eun-pyeon-ida',
    title: 'Thuộc diện / Khá là...: -(으)ㄴ/는 편이다',
    category: 'conjecture',
    level: 'intermediate',
    levelLabel: 'Trung cấp 3',
    formula: 'ĐT hiện tại: -는 편이다 | TT: -(으)ㄴ 편이다 | ĐT quá khứ: -(으)ㄴ 편이다',
    explanationVi: 'Diễn tả xu hướng thiên về một bên nào đó hơn khi so với mặt bằng chung (tôi thuộc dạng cao ráo, quán này đồ ăn thuộc diện ngon rẻ).',
    mistakeExample: '키가 커요 (Khẳng định tuyệt đối) vs 키가 큰 편이에요 (Khiêm tốn, thuộc dạng cao)',
    correctExample: '저는 키가 좀 큰 편이에요. (⭕ Tôi thuộc diện người khá cao)',
    mistakeWhyVi: 'Giúp câu nói giảm tính áp đặt chủ quan, nghe tự nhiên hơn.',
    realLifeUsage: [
      { ko: '저는 매운 음식을 잘 먹는 편이에요.', vi: 'Tôi thuộc diện ăn đồ cay khá là giỏi.' },
      { ko: '이 동네는 조용하고 살기 편한 편이에요.', vi: 'Khu này thuộc diện yên tĩnh và sống khá thoải mái.' },
      { ko: '주말에는 주로 집에서 쉬는 편이에요.', vi: 'Cuối tuần tôi thường có xu hướng ở nhà nghỉ ngơi.' }
    ],
    proTip: 'Khi phỏng vấn xin việc, dùng "-는 편입니다" để nói về điểm mạnh một cách khiêm nhường rất được ưa chuộng.'
  }
];
