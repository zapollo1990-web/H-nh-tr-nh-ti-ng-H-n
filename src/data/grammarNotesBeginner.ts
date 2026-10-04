import { GrammarRule } from '../types';

export const BEGINNER_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'gr-eun-neun-vs-i-ga',
    title: 'Phân biệt 은/는 và 이/가 (Chủ đề vs Chủ ngữ)',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'N + 은/는 (Chủ đề/So sánh) vs N + 이/가 (Chủ ngữ/Tiêu điểm)',
    explanationVi: '• 은/는: Dùng giới thiệu chủ đề đã biết, so sánh đối chiếu, nhấn mạnh vị ngữ phía sau.\n• 이/가: Dùng nhấn mạnh chính chủ thể (trả lời Ai? Cái gì?), thông tin mới xuất hiện, hoặc miêu tả hiện tượng tự nhiên.',
    mistakeExample: '비는 와요. (❌ Nghe như "Mưa thì rơi, còn cái khác thì không")',
    correctExample: '비가 와요. (⭕ Đúng: Trời đang mưa)',
    mistakeWhyVi: 'Miêu tả tự nhiên khách quan bắt buộc dùng 이/가.',
    realLifeUsage: [
      { ko: '저는 베트남 사람입니다.', vi: 'Tôi là người Việt Nam.' },
      { ko: '누가 민수예요? - 제가 민수예요.', vi: 'Ai là Minsu? - Tôi chính là Minsu.' },
      { ko: '사과는 맛있지만 바나나는 맛없어요.', vi: 'Táo thì ngon nhưng chuối thì dở.' }
    ],
    proTip: 'Hỏi "누가 (Ai)?" -> Trả lời dùng [이/가]. Giới thiệu "Tôi là..." -> Dùng [은/는] (저는...).'
  },
  {
    id: 'gr-eul-leul',
    title: 'Tiểu từ tân ngữ 을 / 를 (Tác động hành động)',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Danh từ có Patchim + 을 | Không Patchim + 를',
    explanationVi: 'Gắn sau danh từ để biến danh từ đó thành tân ngữ trực tiếp chịu tác động của ngoại động từ (ăn cơm, đọc sách, học tiếng Hàn...).',
    mistakeExample: '사과을 먹어요. (❌ Sai vì 사과 không có patchim)',
    correctExample: '사과를 먹어요. (⭕ Đúng: Tôi ăn táo)',
    mistakeWhyVi: '사과 kết thúc bằng nguyên âm nên phải đi với 를.',
    realLifeUsage: [
      { ko: '밥을 먹어요.', vi: 'Ăn cơm.' },
      { ko: '한국어를 공부해요.', vi: 'Học tiếng Hàn.' },
      { ko: '영화를 봐요.', vi: 'Xem phim.' }
    ],
    proTip: 'Dưới đáy chữ có phụ âm (patchim) -> dùng "을"; chân chữ trống trơn -> dùng "를".'
  },
  {
    id: 'gr-e-vs-eseo',
    title: 'Phân biệt 에 và 에서 (Điểm đến/Thời gian vs Nơi hành động)',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Nơi chốn + 에 (tĩnh/hướng đến) vs Nơi chốn + 에서 (hành động)',
    explanationVi: '• 에: Đi kèm 있다/없다 (ở đâu), 가다/오다 (đi đến đâu), hoặc mốc thời gian (vào lúc mấy giờ).\n• 에서: Nơi chốn diễn ra hành động tích cực (học, ăn, chơi, làm việc...).',
    mistakeExample: '도서관에 공부해요. (❌ Sai)',
    correctExample: '도서관에서 공부해요. (⭕ Đúng: Học bài ở thư viện)',
    mistakeWhyVi: '공부하다 là hành động năng động nên nơi chốn phải gắn 에서.',
    realLifeUsage: [
      { ko: '지금 집에 있어요.', vi: 'Bây giờ tôi đang ở nhà.' },
      { ko: '내일 한국에 가요.', vi: 'Ngày mai tôi đi Hàn Quốc.' },
      { ko: '카페에서 친구를 만나요.', vi: 'Tôi gặp bạn ở quán cà phê.' }
    ],
    proTip: 'Có 있다/없다/가다/오다 -> Chọn [에]. Có hành động ăn/học/gặp -> Chọn [에서].'
  },
  {
    id: 'gr-wa-gwa-irang-hago',
    title: 'Liên từ "Và / Cùng với": 하고, (이)랑, 와/과',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Đa dụng: 하고 | Thân mật khẩu ngữ: (이)랑 | Trang trọng văn viết: 와/과',
    explanationVi: '• 하고: Dễ nhất, dùng cả nói và viết, không cần phân biệt patchim.\n• (이)랑: Văn nói hàng ngày rất tự nhiên (có patchim + 이랑, không patchim + 랑).\n• 와/과: Sách báo, văn viết (có patchim + 과, không patchim + 와).',
    mistakeExample: '친구와 밥 먹었어요 khi nhắn tin đùa vui (hơi cứng nhắc)',
    correctExample: '친구랑 밥 먹었어요. (⭕ Tự nhiên 100%)',
    mistakeWhyVi: 'Giao tiếp đời thường người Hàn chuộng (이)랑 hoặc 하고.',
    realLifeUsage: [
      { ko: '빵하고 우유를 샀어요.', vi: 'Tôi đã mua bánh mì và sữa.' },
      { ko: '가족이랑 여행 가요.', vi: 'Đi du lịch cùng gia đình.' },
      { ko: '경제와 문화의 발전', vi: 'Sự phát triển của kinh tế và văn hóa.' }
    ],
    proTip: 'Lúc mới học hãy dùng "하고" vì không lo chia patchim!'
  },
  {
    id: 'gr-euro-ro',
    title: 'Tiểu từ -(으)로 (Phương tiện, Phương thức, Hướng đi)',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Có Patchim (trừ ㄹ) + 으로 | Không Patchim hoặc có ㄹ + 로',
    explanationVi: 'Chỉ 3 mục đích:\n1. Phương tiện/công cụ: 버스로 (bằng xe buýt), 펜으로 (bằng bút).\n2. Phương hướng: 앞으로 (về phía trước), 서울로 (về phía Seoul).\n3. Ngôn ngữ: 한국어로 (bằng tiếng Hàn).',
    mistakeExample: '지하철으로 가요. (❌ Sai quy tắc patchim ㄹ)',
    correctExample: '지하철로 가요. (⭕ Đúng vì patchim ㄹ chỉ cộng 로)',
    mistakeWhyVi: 'Patchim ㄹ là ngoại lệ, đi thẳng với 로.',
    realLifeUsage: [
      { ko: '한국어로 말씀해 주세요.', vi: 'Xin hãy nói bằng tiếng Hàn.' },
      { ko: '오른쪽으로 가세요.', vi: 'Xin hãy đi về phía bên phải.' },
      { ko: '비행기로 왔어요.', vi: 'Tôi đã đến bằng máy bay.' }
    ],
    proTip: 'Phương tiện, ngôn ngữ, phương hướng -> Gắn ngay -(으)로!'
  },
  {
    id: 'gr-ege-hante-kke',
    title: 'Tiểu từ "Cho ai, với ai": 에게 / 한테 / 께',
    category: 'particle',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Văn viết: 에게 | Khẩu ngữ: 한테 | Kính ngữ bề trên: 께',
    explanationVi: 'Gắn sau danh từ chỉ người/động vật để biểu thị đối tượng nhận hành động:\n• 에게: Trung tính, dùng cả nói và viết.\n• 한테: Dùng trong khẩu ngữ thân mật.\n• 께: Kính ngữ cao cấp khi gửi/cho ông bà, cha mẹ, thầy cô.',
    mistakeExample: '선생님한테 선물을 드려요. (Hơi thiếu kính cẩn)',
    correctExample: '선생님께 선물을 드려요. (⭕ Chuẩn kính ngữ)',
    mistakeWhyVi: 'Với người bề trên kính trọng, bắt buộc dùng 께 thay vì 에게/한테.',
    realLifeUsage: [
      { ko: '친구한테 전화를 걸었어요.', vi: 'Tôi đã gọi điện thoại cho bạn.' },
      { ko: '동생에게 책을 줬어요.', vi: 'Tôi đã cho em quyển sách.' },
      { ko: '부모님께 편지를 써요.', vi: 'Tôi viết thư gửi cho bố mẹ.' }
    ],
    proTip: 'Ngược lại, nhận "từ ai đó": 에게서 / 한테서 (ví dụ: 친구한테서 받았어요 = nhận từ bạn).'
  },
  {
    id: 'gr-ayo-eoyo',
    title: 'Đuôi câu thân mật lịch sự -아/어요 & Trang trọng -ㅂ/습니다',
    category: 'formality',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Gốc từ ㅏ/ㅗ + -아요 | Gốc từ khác + -어요 | 하다 -> 해요',
    explanationVi: '• -아/어요: Lịch sự thân mật, dùng trong 90% giao tiếp cuộc sống hàng ngày.\n• -ㅂ/습니다: Rất trang trọng, phỏng vấn, thời sự, thuyết trình quân đội.',
    mistakeExample: 'Nói chuyện bạn bè: "밥을 먹었습니다! 날씨가 좋습니다!" (Quá cứng)',
    correctExample: '밥 먹었어요. 날씨가 좋아요! (Tự nhiên, gần gũi)',
    mistakeWhyVi: 'Dùng -습니다 trong sinh hoạt tạo khoảng cách xa lạ.',
    realLifeUsage: [
      { ko: '지금 뭐 해요? - 음악 들어요.', vi: 'Bạn đang làm gì thế? - Mình đang nghe nhạc.' },
      { ko: '처음 뵙겠습니다. 반갑습니다.', vi: 'Hân hạnh lần đầu gặp quý vị.' }
    ],
    proTip: 'Nhớ quy tắc: Âm ㅏ hoặc ㅗ -> cộng 아요. Còn lại -> cộng 어요. Đuôi 하다 luôn thành 해요.'
  },
  {
    id: 'gr-past-tense',
    title: 'Thì quá khứ -았/었어요 (Đã diễn ra)',
    category: 'tense',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Gốc từ ㅏ/ㅗ + -았어요 | Gốc từ khác + -었어요 | 하다 -> 했어요',
    explanationVi: 'Biểu thị hành động hoặc trạng thái đã hoàn thành trong quá khứ.',
    mistakeExample: '어제 영화를 봐요. (❌ Thiếu thì quá khứ)',
    correctExample: '어제 영화를 봤어요. (⭕ Đúng: Hôm qua tôi đã xem phim)',
    mistakeWhyVi: 'Có từ chỉ quá khứ như 어제 (hôm qua), 지난주 (tuần trước) phải chia thì quá khứ.',
    realLifeUsage: [
      { ko: '어제 친구를 만났어요.', vi: 'Hôm qua tôi đã gặp bạn.' },
      { ko: '아침에 빵을 먹었어요.', vi: 'Buổi sáng tôi đã ăn bánh mì.' },
      { ko: '주말에 운동을 많이 했어요.', vi: 'Cuối tuần tôi đã tập thể dục nhiều.' }
    ],
    proTip: '가다 -> 갔어요, 오다 -> 왔어요, 보다 -> 봤어요, 하다 -> 했어요.'
  },
  {
    id: 'gr-future-tense',
    title: 'Thì tương lai -(으)ㄹ 거예요 (Sẽ / Dự định làm gì)',
    category: 'tense',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Có Patchim + 을 거예요 | Không Patchim hoặc có ㄹ + ㄹ 거예요',
    explanationVi: 'Diễn tả kế hoạch dự định trong tương lai hoặc phỏng đoán tình huống sắp xảy ra.',
    mistakeExample: '갈 것예요 (❌ Viết sai chính tả đuôi)',
    correctExample: '갈 거예요 (⭕ Luôn viết là 거예요)',
    mistakeWhyVi: '거예요 là dạng nói rút gọn của 것이에요.',
    realLifeUsage: [
      { ko: '내일 뭐 할 거예요? - 푹 쉴 거예요.', vi: 'Ngày mai bạn sẽ làm gì? - Tôi sẽ nghỉ ngơi.' },
      { ko: '내년에 한국에 갈 거예요.', vi: 'Năm sau tôi sẽ đi Hàn Quốc.' },
      { ko: '오후에 비가 올 거예요.', vi: 'Buổi chiều chắc là trời sẽ mưa đấy.' }
    ],
    proTip: 'Khẳng định ý chí quyết tâm đanh thép: Dùng "-겠어요" (ví dụ: 열심히 하겠습니다 = Tôi nhất định sẽ làm chăm chỉ).'
  },
  {
    id: 'gr-present-continuous',
    title: 'Hiện tại tiếp diễn -고 있다 (Đang làm gì)',
    category: 'tense',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Gốc ĐT + -고 있어요 (Kính ngữ: -고 계세요)',
    explanationVi: 'Diễn tả một hành động đang trong quá trình thực hiện tại thời điểm nói.',
    mistakeExample: '선생님이 책을 읽고 있어요. (Chưa tôn kính với giáo viên)',
    correctExample: '선생님께서 책을 읽고 계세요. (⭕ Kính ngữ chuẩn mực)',
    mistakeWhyVi: 'Với người bề trên, dạng tiếp diễn tôn kính là -고 계시다.',
    realLifeUsage: [
      { ko: '지금 공부하고 있어요.', vi: 'Bây giờ tôi đang học bài.' },
      { ko: '전화 받을 수 없어요. 운전하고 있어요.', vi: 'Không nghe máy được, tôi đang lái xe.' },
      { ko: '비가 계속 오고 있어요.', vi: 'Trời vẫn đang tiếp tục mưa.' }
    ],
    proTip: 'Hành động mặc đồ/đeo kính duy trì trạng thái: 옷을 입고 있다, 안경을 쓰고 있다.'
  },
  {
    id: 'gr-an-vs-ji-anta',
    title: 'Phủ định "Không": 안 + V vs V + -지 않다',
    category: 'negation',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: '안 + ĐT/TT (Phủ định ngắn) vs Gốc V/A + -지 않다 (Phủ định dài)',
    explanationVi: '• 안: Phổ biến trong văn nói, tiện lợi, đứng trước động từ/tính từ.\n• -지 않다: Trang trọng, văn viết, bài thi TOPIK.\n• Chú ý động từ dạng [N + 하다]: Tách ra "N + 안 하다" (ví dụ: 공부 안 해요).',
    mistakeExample: '안 공부해요. (❌ Sai cách ghép)',
    correctExample: '공부 안 해요 hoặc 공부하지 않아요. (⭕ Đúng)',
    mistakeWhyVi: 'Động từ gốc Hán ghép 하다 phải đặt "안" vào giữa.',
    realLifeUsage: [
      { ko: '오늘 학교에 안 가요.', vi: 'Hôm nay tôi không đến trường.' },
      { ko: '김치가 전혀 맵지 않아요.', vi: 'Kimchi hoàn toàn không cay.' },
      { ko: '오늘 운동 안 했어요.', vi: 'Hôm nay tôi không tập thể dục.' }
    ],
    proTip: 'Đừng nhầm "안" (tự mình không muốn làm) với "못" (không thể làm do hoàn cảnh).'
  },
  {
    id: 'gr-mot-vs-eul-su-eopda',
    title: 'Phủ định "Không thể": 못 + V vs -(으)ㄹ 수 없다',
    category: 'negation',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: '못 + ĐT vs Gốc ĐT + -(으)ㄹ 수 없다',
    explanationVi: 'Diễn tả không thể làm được do thiếu năng lực, bệnh tật hoặc hoàn cảnh khách quan cản trở.',
    mistakeExample: '안 갈 수 있어요? (❌ Câu tối nghĩa)',
    correctExample: '갈 수 없어요 / 못 가요. (⭕ Tôi không thể đi được)',
    mistakeWhyVi: 'Diễn đạt sự bất khả kháng bắt buộc dùng 못 hoặc -(으)ㄹ 수 없다.',
    realLifeUsage: [
      { ko: '매운 음식을 못 먹어요.', vi: 'Tôi không thể ăn được đồ cay.' },
      { ko: '다리를 다쳐서 운동할 수 없어요.', vi: 'Bị đau chân nên tôi không thể tập thể thao.' },
      { ko: '바빠서 파티에 못 갔어요.', vi: 'Vì bận nên tôi đã không thể đến bữa tiệc.' }
    ],
    proTip: 'Trong khẩu ngữ người Hàn nói "못 가요, 못 먹어요" nhanh hơn nhiều so với "갈 수 없어요".'
  },
  {
    id: 'gr-go-sipda',
    title: 'Mong muốn -고 싶다 (Muốn làm gì đó)',
    category: 'intention',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Ngôi 1 & 2: -고 싶어요 | Ngôi 3: -고 싶어해요',
    explanationVi: 'Diễn tả ước muốn làm hành động gì đó. Rất quan trọng khi nói về người khác (ngôi 3) phải dùng -고 싶어하다.',
    mistakeExample: '제 친구는 한국에 가고 싶어요. (❌ Ngôi 3 dùng sai)',
    correctExample: '제 친구는 한국에 가고 싶어해요. (⭕ Đúng)',
    mistakeWhyVi: 'Cảm xúc mong muốn của người khác được nhìn nhận từ bên ngoài nên dùng 싶어하다.',
    realLifeUsage: [
      { ko: '한국 음식을 먹고 싶어요.', vi: 'Tôi muốn ăn món Hàn Quốc.' },
      { ko: '어디에 가고 싶어요? - 바다에 가고 싶어요.', vi: 'Bạn muốn đi đâu? - Tôi muốn đi biển.' },
      { ko: '동생이 새 옷을 사고 싶어해요.', vi: 'Em gái tôi đang muốn mua áo mới.' }
    ],
    proTip: 'Phủ định: -고 싶지 않아요 (Tôi không muốn làm).'
  },
  {
    id: 'gr-eul-su-itda',
    title: 'Khả năng -(으)ㄹ 수 있다 / 없다 (Có thể / Không thể)',
    category: 'intention',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Có Patchim + 을 수 있다/없다 | Không Patchim/có ㄹ + ㄹ 수 있다/없다',
    explanationVi: 'Biểu thị có năng lực hoặc có điều kiện để thực hiện một hành động nào đó.',
    mistakeExample: '수영할 수 안 있어요. (❌ Sai)',
    correctExample: '수영할 수 없어요. (⭕ Đúng: Tôi không biết bơi)',
    mistakeWhyVi: 'Phủ định của 있다 luôn là 없다.',
    realLifeUsage: [
      { ko: '한국어를 읽을 수 있어요.', vi: 'Tôi có thể đọc được tiếng Hàn.' },
      { ko: '운전할 수 있어요? - 네, 할 수 있어요.', vi: 'Bạn biết lái xe không? - Vâng, tôi lái được.' },
      { ko: '지금은 통화할 수 없어요.', vi: 'Bây giờ tôi không thể nghe điện thoại được.' }
    ],
    proTip: 'Đồng nghĩa về năng lực: -(으)ㄹ 줄 알다 / 모르다 (biết / không biết cách làm).'
  },
  {
    id: 'gr-euseyo',
    title: 'Mệnh lệnh lịch sự -(으)세요 & Cấm đoán -지 마세요',
    category: 'honorific',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Hãy làm: Gốc ĐT + -(으)세요 | Đừng làm: Gốc ĐT + -지 마세요',
    explanationVi: 'Dùng khi yêu cầu, khuyên nhủ hoặc hướng dẫn ai đó làm (hoặc không làm) việc gì một cách lịch sự.',
    mistakeExample: '선생님, 밥 먹으세요! (Thiếu kính ngữ với người lớn)',
    correctExample: '선생님, 식사하세요! hoặc 진지 잡수세요! (⭕ Đúng)',
    mistakeWhyVi: 'Với người lớn tuổi, dùng từ vựng kính ngữ đặc biệt thay vì 먹다.',
    realLifeUsage: [
      { ko: '여기에 이름을 쓰세요.', vi: 'Xin hãy viết tên vào đây.' },
      { ko: '걱정하지 마세요. 다 잘될 거예요.', vi: 'Đừng lo lắng nhé, mọi chuyện sẽ ổn thôi.' },
      { ko: '천천히 말씀해 주세요.', vi: 'Xin hãy nói chậm lại một chút.' }
    ],
    proTip: '안녕히 가세요 (Đi bình an) / 안녕히 계세요 (Ở lại bình an) đều xuất phát từ đuôi -(으)세요 này!'
  },
  {
    id: 'gr-a-eo-se-vs-nikka',
    title: 'Nguyên nhân: -아/어서 vs -(으)니까 (Vì... Nên...)',
    category: 'connector',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: '-아/어서 (khách quan, cảm ơn/xin lỗi) vs -(으)니까 (chủ quan, mệnh lệnh/rủ rê)',
    explanationVi: '• -아/어서: Phía sau KHÔNG ĐƯỢC đi với câu mệnh lệnh (-(으)세요) hoặc rủ rê (-(으)ㅂ시다), phía trước không chia quá khứ.\n• -(으)니까: Chuyên đi cùng câu mệnh lệnh, rủ rê, phía trước được chia quá khứ.',
    mistakeExample: '비가 와서 우산을 쓰세요. (❌ Sai nghiêm trọng TOPIK)',
    correctExample: '비가 오니까 우산을 쓰세요. (⭕ Chuẩn xác vì vế sau là mệnh lệnh)',
    mistakeWhyVi: 'Có mệnh lệnh / rủ rê ở vế sau bắt buộc phải dùng -(으)니까.',
    realLifeUsage: [
      { ko: '만나서 반갑습니다.', vi: 'Rất vui vì được gặp bạn. (Luôn dùng -아/어서)' },
      { ko: '날씨가 좋으니까 산책하러 가요.', vi: 'Vì thời tiết đẹp nên chúng mình đi dạo nào!' },
      { ko: '늦어서 죄송합니다.', vi: 'Tôi xin lỗi vì đã đến muộn.' }
    ],
    proTip: 'Cảm ơn, xin lỗi, gặp gỡ -> 100% dùng "-아/어서"!'
  },
  {
    id: 'gr-eu-myeon',
    title: 'Điều kiện & Giả định -(으)면 (Nếu... Thì...)',
    category: 'condition',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Có Patchim + 으면 | Không Patchim/Patchim ㄹ + 면',
    explanationVi: 'Diễn tả điều kiện giả định ở hiện tại/tương lai, hoặc thói quen cứ hễ xảy ra A thì B.',
    mistakeExample: '어제 비가 오면 좋았어요. (❌ Sai thì quá khứ)',
    correctExample: '비가 오면 집에서 쉴 거예요. (⭕ Đúng)',
    mistakeWhyVi: '-(으)면 chỉ dùng cho giả định tương lai hoặc hiện tại.',
    realLifeUsage: [
      { ko: '시간이 있으면 같이 커피 마셔요.', vi: 'Nếu có thời gian thì cùng uống cà phê nhé.' },
      { ko: '모르는 단어가 있으면 물어보세요.', vi: 'Nếu có từ nào không biết thì hãy hỏi tôi.' },
      { ko: '한국에 가면 연락하세요.', vi: 'Nếu đến Hàn Quốc hãy liên lạc với tôi.' }
    ],
    proTip: 'Mẫu câu ước muốn: "-(으)면 좋겠다" nghĩa là "Ước gì / Giá như... thì thật tốt".'
  },
  {
    id: 'gr-euryeogo-hada',
    title: 'Dự định -(으)려고 하다 (Định làm gì đó)',
    category: 'purpose',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Có Patchim + 으려고 하다 | Không Patchim + 려고 하다',
    explanationVi: 'Diễn tả kế hoạch dự định trong tâm trí người nói. Khi làm liên từ "-(으)려고": mang nghĩa làm A để đạt mục đích B.',
    mistakeExample: '비가 오려고 해요 với nghĩa "Mưa định rơi" (❌)',
    correctExample: '비가 올 것 같아요. (⭕ Trời có vẻ sắp mưa)',
    mistakeWhyVi: '-(으)려고 하다 chỉ dùng cho hành động có ý chí chủ quan của con người.',
    realLifeUsage: [
      { ko: '이번 주말에 새 옷을 사려고 해요.', vi: 'Cuối tuần này tôi định mua quần áo mới.' },
      { ko: '살을 빼려고 매일 운동해요.', vi: 'Tôi tập thể dục mỗi ngày để giảm cân.' },
      { ko: '한국에서 일하려고 한국어를 배워요.', vi: 'Tôi học tiếng Hàn để làm việc tại Hàn Quốc.' }
    ],
    proTip: 'Định làm trong quá khứ mà chưa xong: "-(으)려고 했어요" (Tôi đã định... nhưng mà...).'
  },
  {
    id: 'gr-eureo-gada-oda',
    title: 'Mục đích di chuyển -(으)러 가다/오다 (Đi/Đến để làm gì)',
    category: 'purpose',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Gốc ĐT + -(으)러 가다 / 오다 / 다니다',
    explanationVi: 'Biểu thị mục đích của hành động di chuyển đi đâu đó để thực hiện việc gì.',
    mistakeExample: '밥을 먹으러 공부해요. (❌ Vế sau không phải động từ di chuyển)',
    correctExample: '밥을 먹으러 식당에 가요. (⭕ Đi đến quán ăn để ăn cơm)',
    mistakeWhyVi: '-(으)러 chỉ kết hợp với các động từ di chuyển như 가다, 오다, 다니다, 나가다.',
    realLifeUsage: [
      { ko: '친구를 만나러 카페에 가요.', vi: 'Tôi đi đến quán cà phê để gặp bạn.' },
      { ko: '책을 빌리러 도서관에 왔어요.', vi: 'Tôi đến thư viện để mượn sách.' },
      { ko: '수영을 배우러 수영장에 다녀요.', vi: 'Tôi đến hồ bơi để học bơi.' }
    ],
    proTip: 'So sánh: -(으)러 chỉ đi với động từ di chuyển, còn -(으)려고 có thể đi với bất kỳ động từ nào!'
  },
  {
    id: 'gr-a-eo-boda',
    title: 'Trải nghiệm & Thử làm: -아/어 보다 (Thử làm / Đã từng làm)',
    category: 'intention',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Thử làm: -아/어 보다 | Đã từng/chưa từng: -아/어 본 적이 있다/없다',
    explanationVi: 'Dùng khi khuyên ai đó thử làm một điều mới lạ, hoặc chia sẻ về trải nghiệm cuộc sống.',
    mistakeExample: '한복을 신어 보세요. (❌ Sai động từ mặc đồ)',
    correctExample: '한복을 입어 보세요. (⭕ Hãy mặc thử Hanbok xem)',
    mistakeWhyVi: 'Quần áo dùng 입다, giày dép dùng 신다.',
    realLifeUsage: [
      { ko: '한국에 가 본 적이 있어요?', vi: 'Bạn đã từng đến Hàn Quốc bao giờ chưa?' },
      { ko: '이 음식 한번 먹어 보세요. 정말 맛있어요!', vi: 'Hãy thử ăn món này một lần xem, ngon lắm!' },
      { ko: '제주도에 가 봤어요.', vi: 'Tôi đã từng đi đảo Jeju rồi.' }
    ],
    proTip: 'Cứ muốn nói về "Trải nghiệm" trong đời sống hãy nghĩ ngay đến "-아/어 보다"!'
  },
  {
    id: 'gr-modifier-present',
    title: 'Định ngữ hiện tại cho Động từ: V + -는 + Danh từ',
    category: 'modifier',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Gốc Động từ + -는 + Danh từ',
    explanationVi: 'Biến động từ thành thành phần bổ nghĩa cho danh từ đứng sau ở thì hiện tại (Người đang đi, món ăn hay ăn, bài hát đang nghe).',
    mistakeExample: '가는 사람 -> ghi thành 간 사람 (quá khứ)',
    correctExample: '지금 저기 가는 사람이 제 친구예요. (⭕ Người đang đi đằng kia là bạn tôi)',
    mistakeWhyVi: 'Hành động đang diễn ra ở hiện tại dùng đuôi -는 cho mọi động từ.',
    realLifeUsage: [
      { ko: '제가 좋아하는 음식은 떡볶이예요.', vi: 'Món ăn mà tôi thích là Tteokbokki.' },
      { ko: '지금 듣는 노래가 뭐예요?', vi: 'Bài hát bạn đang nghe là bài gì thế?' },
      { ko: '한국어를 배우는 학생이 많아요.', vi: 'Học sinh học tiếng Hàn rất đông.' }
    ],
    proTip: 'Với động từ ở hiện tại, dù có patchim hay không đều đi thẳng với "-는"!'
  },
  {
    id: 'gr-modifier-adjective',
    title: 'Định ngữ Tính từ: Tính từ + -(으)ㄴ + Danh từ',
    category: 'modifier',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Tính từ có Patchim + 은 + N | Tính từ không Patchim + ㄴ + N',
    explanationVi: 'Dùng tính từ để miêu tả đặc điểm tính chất của danh từ đứng sau (cô gái đẹp, căn phòng to, thời tiết tốt).',
    mistakeExample: '예쁘는 꽃 (❌ Sai đuôi động từ)',
    correctExample: '예쁜 꽃 (⭕ Bông hoa đẹp)',
    mistakeWhyVi: 'Tính từ phải dùng đuôi -(으)ㄴ, không dùng -는 của động từ (trừ tính từ có 있다/없다 như 맛있는).',
    realLifeUsage: [
      { ko: '좋은 하루 보내세요!', vi: 'Chúc bạn một ngày tốt lành!' },
      { ko: '따뜻한 차를 마시고 싶어요.', vi: 'Tôi muốn uống một tách trà ấm.' },
      { ko: '맛있는 음식을 먹었어요.', vi: 'Tôi đã ăn món ăn ngon (맛있다 đi với -는).' }
    ],
    proTip: 'Ngoại lệ vàng: Tính từ kết thúc bằng 있다/없다 (như 맛있다, 재미있다) luôn gắn "-는"!'
  }
];
