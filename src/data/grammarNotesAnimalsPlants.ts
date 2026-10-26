import { GrammarRule } from '../types';

export const ANIMALS_PLANTS_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'gr-anim-boda',
    title: 'So sánh loài vật & tính chất: Danh từ + 보다 (Hơn / Kém)',
    category: 'animals',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Danh từ (đối tượng chuẩn) + 보다 + 더/덜 + Tính từ/Động từ',
    explanationVi: 'Dùng để so sánh giữa hai đối tượng, đặc biệt là khi so sánh đặc tính, tốc độ, kích thước của các loài động vật hoặc cây cối. Từ đứng trước "보다" luôn là mốc so sánh.',
    mistakeExample: '거북이보다 강아지가 느려요. (❌ Nói ngược nghĩa: Chó chậm hơn rùa)',
    correctExample: '강아지가 거북이보다 훨씬 빨라요. (⭕ Đúng: Chó con nhanh hơn rùa rất nhiều)',
    mistakeWhyVi: 'Danh từ gắn với "보다" đóng vai trò là "mốc đem ra so sánh", không phải chủ thể hành động.',
    realLifeUsage: [
      { ko: '강아지가 고양이보다 애교가 많아요.', vi: 'Chó con nũng nịu, quấn người hơn mèo.' },
      { ko: '치타는 호랑이보다 더 빨리 달려요.', vi: 'Báo săn chạy nhanh hơn hổ.' },
      { ko: '코끼리가 사자보다 몸집이 훨씬 커요.', vi: 'Con voi có thân hình to lớn hơn sư tử rất nhiều.' }
    ],
    proTip: 'Cấu trúc vàng nhớ nhanh: [Chủ ngữ 이/가] + [Mốc so sánh 보다] + [Tính từ]. Muốn nhấn mạnh dùng thêm "더" (hơn nữa) hoặc "훨씬" (hơn nhiều).'
  },
  {
    id: 'gr-anim-mari',
    title: 'Số từ đếm loài động vật & thú cưng: 마리 (Con)',
    category: 'animals',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Tên con vật + Số từ thuần Hàn (한, 두, 세, 네, 다섯...) + 마리',
    explanationVi: 'Trong tiếng Hàn, khi đếm số lượng động vật bắt buộc phải dùng danh từ đơn vị "마리" (mari) đi liền với số từ thuần Hàn, không dùng số Hán Hàn.',
    mistakeExample: '고양이 일 마리 (❌ Sai vì dùng số Hán Hàn "일")',
    correctExample: '고양이 한 마리 (⭕ Đúng: Một con mèo)',
    mistakeWhyVi: 'Đếm đơn vị con vật phải dùng số thuần Hàn: 하나->한, 둘->두, 셋->세, 넷->네.',
    realLifeUsage: [
      { ko: '집에서 귀여운 강아지 두 마리를 키워요.', vi: 'Ở nhà tôi đang nuôi hai chú cún con dễ thương.' },
      { ko: '호수에 오리 세 마리가 헤엄치고 있어요.', vi: 'Trên mặt hồ có ba con vịt đang bơi lội.' },
      { ko: '동물원에 판다 한 마리가 새로 왔어요.', vi: 'Một chú gấu trúc mới đến vườn thú.' }
    ],
    proTip: 'Ghi nhớ số thuần Hàn đi với con vật: 한 마리 (1 con), 두 마리 (2 con), 세 마리 (3 con), 네 마리 (4 con), 다섯 마리 (5 con).'
  },
  {
    id: 'gr-anim-cheoreom',
    title: 'So sánh ví von hình tượng: Danh từ + 처럼 / 같이 (Như là...)',
    category: 'animals',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Danh từ (con vật, hoa lá) + 처럼 / 같이 + Tính từ / Động từ',
    explanationVi: 'Dùng để ví von hình ảnh người hoặc sự vật giống như một con vật đáng yêu hoặc loài hoa xinh đẹp (xinh như hoa, lanh lợi như sóc, ngủ say như gấu...).',
    mistakeExample: '꽃처럼로 예뻐요. (❌ Thừa trợ từ)',
    correctExample: '그녀는 활짝 핀 꽃처럼 예뻐요. (⭕ Đúng: Cô ấy xinh đẹp tựa bông hoa rộ nở)',
    mistakeWhyVi: '처럼 và 같이 đã là trợ từ so sánh hoàn chỉnh, gắn trực tiếp ngay sau danh từ.',
    realLifeUsage: [
      { ko: '고양이처럼 사뿐사뿐 걸어요.', vi: 'Bước đi êm ái nhẹ nhàng tựa như bước chân loài mèo.' },
      { ko: '겨울잠 자는 곰처럼 깊이 잠들었어요.', vi: 'Ngủ say sưa như chú gấu đang ngủ đông.' },
      { ko: '우리 아기는 천사처럼, 꽃처럼 사랑스러워요.', vi: 'Em bé của chúng tôi đáng yêu như thiên thần, như đóa hoa.' }
    ],
    proTip: 'Trong giao tiếp thường ngày: "N + 처럼" và "N + 같이" hoàn toàn thay thế được cho nhau.'
  },
  {
    id: 'gr-plt-songi-geuru',
    title: 'Số từ đếm thực vật, hoa lá & cây cối: 송이 vs 그루',
    category: 'plants',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Cây cối + Số thuần Hàn + 그루 | Bông hoa + Số thuần Hàn + 송이',
    explanationVi: '• 송이 (song-i): Đơn vị đếm bông hoa, nụ hoa, chùm hoa (và chùm nho, cây nấm).\n• 그루 (geu-ru): Đơn vị đếm cây cối to lớn, thân gỗ đứng vững trên mặt đất.',
    mistakeExample: '장미 세 개 (❌ Nghe thô ráp thiếu tự nhiên)',
    correctExample: '장미 세 송이 (⭕ Đúng chuẩn: Ba bông hoa hồng)',
    mistakeWhyVi: 'Người Hàn luôn ưu tiên dùng danh từ chỉ đơn vị tự nhiên chuẩn xác: hoa dùng 송이, cây dùng 그루.',
    realLifeUsage: [
      { ko: '정원에 사과나무 두 그루를 심었어요.', vi: 'Tôi đã trồng hai cây táo trong khu vườn.' },
      { ko: '졸업식에서 예쁜 꽃 백 송이를 선물받았어요.', vi: 'Trong lễ tốt nghiệp, tôi được tặng một trăm bông hoa rực rỡ.' },
      { ko: '길가에 벚꽃나무 수십 그루가 줄지어 있어요.', vi: 'Bên đường có hàng chục cây hoa anh đào xếp thẳng hàng.' }
    ],
    proTip: 'Mẹo nhớ: Bông hoa mềm mại nở trên cành -> [송이]; Cây cổ thụ bám rễ sâu -> [그루].'
  },
  {
    id: 'gr-plt-ajida',
    title: 'Biến đổi trạng thái tự nhiên, thời tiết: Tính từ + -아/어지다 (Trở nên...)',
    category: 'plants',
    level: 'beginner',
    levelLabel: 'Sơ cấp 2',
    formula: 'Gốc tính từ miêu tả + -아/어지다 (Hiện tại: -아/어져요, Quá khứ: -아/어졌어요)',
    explanationVi: 'Dùng để diễn tả sự thay đổi của cỏ cây hoa lá và thiên nhiên theo thời gian hoặc mùa vụ (ấm lên, xanh tươi lên, lá phong đổi đỏ...).',
    mistakeExample: '날씨가 따뜻해요 꽃이 피어요. (❌ Thiếu tính biến đổi thời gian)',
    correctExample: '날씨가 따뜻해져서 꽃들이 활짝 피었어요. (⭕ Đúng: Thời tiết trở nên ấm áp nên hoa nở rộ)',
    mistakeWhyVi: 'Dùng -아/어지다 thể hiện quá trình biến đổi từ từ của thiên nhiên.',
    realLifeUsage: [
      { ko: '가을이 되니 나뭇잎이 붉게 붉어졌어요.', vi: 'Mùa thu đến, lá cây dần trở nên đỏ rực.' },
      { ko: '봄바람이 불어 산과 들이 푸르러져요.', vi: 'Gió xuân thổi qua, núi đồi và đồng cỏ trở nên xanh ngát.' },
      { ko: '물을 주니까 시들었던 식물이 건강해졌어요.', vi: 'Nhờ được tưới nước, chậu cây bị héo đã trở nên tươi tốt khỏe mạnh.' }
    ],
    proTip: 'Cấu trúc miêu tả thiên nhiên tuyệt đẹp: Tính từ + -아/어지다 (ấm lên 따뜻해지다, mát mẻ hơn 시원해지다, xanh hơn 푸르러지다).'
  },
  {
    id: 'gr-anim-kiuda',
    title: 'Động từ nuôi thú cưng & chăm sóc cây cảnh: 키우다 / 기르다',
    category: 'plants',
    level: 'beginner',
    levelLabel: 'Sơ cấp 1',
    formula: 'Động vật/Thực vật + 을/를 + 키우다 (hoặc 기르다)',
    explanationVi: 'Trong tiếng Hàn, cả việc nuôi thú cưng (chó, mèo) lẫn trồng chăm sóc cây hoa cảnh đều dùng chung động từ "키우다" (phổ biến trong văn nói) hoặc "기르다" (trang trọng/văn viết).',
    mistakeExample: '집에서 고양이를 먹여요. (❌ Dùng sai từ)',
    correctExample: '집에서 고양이를 키워요. (⭕ Đúng: Nhà tôi nuôi mèo)',
    mistakeWhyVi: 'Nuôi dưỡng một sinh mệnh (động vật, trẻ nhỏ, thực vật) phải dùng 키우다.',
    realLifeUsage: [
      { ko: '베란다에서 작은 화분과 식물을 키우고 있어요.', vi: 'Tôi đang chăm sóc những chậu cây cảnh nhỏ ngoài ban công.' },
      { ko: '반려견을 키우는 것은 큰 책임감이 필요해요.', vi: 'Nuôi một chú cún cưng cần có tinh thần trách nhiệm lớn.' },
      { ko: '부모님께서 시골에서 과일나무를 기르세요.', vi: 'Bố mẹ tôi trồng và chăm sóc những cây ăn quả ở quê.' }
    ],
    proTip: 'Thú cưng trong tiếng Hàn gọi là "반려동물" (bạn đồng hành), cây cảnh là "반려식물" (cây xanh bầu bạn).'
  }
];
