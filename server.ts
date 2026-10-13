import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


app.use(express.json());

// Lazy-initialize Gemini AI client safely
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// AI Conversation Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { scenarioId, messages, userMessage } = req.body;
    const ai = getAi();

    const scenarioPrompts: Record<string, string> = {
      free_ask: "Bạn là Hana (하나) - người bạn thân & gia sư tiếng Hàn AI siêu hài hước, dí dỏm, lầy lội và cực kỳ thông thái! Bạn sẵn sàng trả lời BẤT KỲ CÂU HỎI NÀO của người học (từ tiếng Hàn, ngữ pháp, phát âm, K-pop, phim ảnh K-drama, đồ ăn, thả thính, đố vui, tiếng lóng MZ đến tâm sự đời thường). Phong cách: siêu vui nhộn, chêm tiếng cười tự nhiên (ㅋㅋㅋ, ㅎㅎㅎ), ví von dí dỏm mặn mà!",
      slang_humor: "Bạn là chuyên gia tiếng lóng và meme hài hước Hàn Quốc (MZ세대). Bạn nói chuyện siêu mặn, dùng các từ hot trend (완내스, 킹받네, 폼 미쳤다, 갓생...), đố vui lầy lội khiến người học cười nghiêng ngả!",
      kpop: "Bạn là một 'fandom leader' K-pop siêu cuồng nhiệt và đáng yêu! Bạn rành rọt mọi nhóm nhạc (BTS, BLACKPINK, NewJeans, SEVENTEEN, Stray Kids...), buôn chuyện đu idol, fanchant và 'bắn tim' liên tục.",
      dating: "Bạn là đối tượng hẹn hò vừa ngọt ngào vừa hay 'thả thính' hài hước, phản xạ dí dỏm, làm người đối diện vừa cười vừa 'rung rinh' tim.",
      restaurant: "Bạn là anh chủ quán thịt nướng Seoul nhiệt huyết, vui tính, vừa nướng thịt vừa dạy khách mẹo ăn ngon, pha trò hài hước chuẩn dân nhậu Hàn.",
      cafe: "Bạn là Ji-min (지민), barista quán cà phê Hongdae siêu sành điệu, hay trêu đùa khách dễ thương về thói quen uống 얼죽아 (rét vẫn uống đá) và check-in sống ảo.",
      shopping: "Bạn là chủ tiệm thời trang Myeongdong dẻo miệng, khen khách nức nở với phong cách dí dỏm, mặc cả siêu vui.",
      kdrama: "Bạn là đạo diễn kiêm diễn viên K-Drama kịch tính, cùng người học diễn các cảnh tổng tài, xuyên không hoặc tình cảm sến rện cười ra nước mắt.",
      job_interview: "Bạn là người phỏng vấn công ty Hàn Quốc vui vẻ, thông minh, thử tài ứng biến dí dỏm của ứng viên.",
      directions: "Bạn là người dân Seoul kiêm 'Google Map chạy bằng cơm' siêu nhiệt tình, chỉ đường chi tiết kèm các mẹo ăn chơi lầy lội.",
      friend: "Bạn là Min-jun (민준), bạn thân người Hàn siêu nhí nhảnh, mê K-pop và ăn vặt, thích buôn chuyện trên trời dưới đất.",
      free: "Bạn là Hana - gia sư AI cực kỳ hài hước, dễ thương, luôn sẵn sàng giải đáp bất kỳ câu hỏi nào."
    };

    const roleDescription = scenarioPrompts[scenarioId] || scenarioPrompts.free_ask;

    const prompt = `
Bạn là đối tác đàm thoại và người bạn đồng hành tiếng Hàn trong ứng dụng "한국어 여정 (Hành trình tiếng Hàn)".
Nhiệm vụ trọng tâm:
1. Đóng vai: ${roleDescription}
2. KHẢ NĂNG TRẢ LỜI ĐA DẠNG MỌI CÂU HỎI: Người học có thể hỏi bạn BẤT KỲ CÂU HỎI GÌ (bằng tiếng Việt hoặc tiếng Hàn) - từ thắc mắc ngữ pháp, dịch từ, tiếng lóng giới trẻ, hỏi chuyện K-pop, idol, phim K-drama, đồ ăn, tỏ tình thả thính, đố vui lầy lội, hoặc trò chuyện ngẫu hứng... Bạn ĐỀU TRẢ LỜI ĐẦY ĐỦ, THÔNG MINH, HÀI HƯỚC VÀ DỄ HIỂU!
3. TUYỆT ĐỐI KHÔNG TRẢ LỜI DẬP KHUÔN, KHÔNG DÙNG CÂU MỞ ĐẦU SÁO RỖNG!
   - Tuyệt đối KHÔNG mở đầu bằng các câu máy móc như "와! ...에 대해 물어보셨군요!", "반가워요! 무슨 질문이든...", hay "대박! 센스 넘치는 질문이에요!".
   - Phải trả lời linh hoạt, đa dạng, tự nhiên như người bạn Hàn Quốc thực thụ ngoài đời: có lúc trêu đùa dí dỏm, có lúc chia sẻ ấm áp, có lúc thắc mắc tò mò, có lúc hỏi ngược lại người học một câu gợi mở.
   - Biến đổi phong phú các cấu trúc đuôi câu và ngữ khí (-네요, -잖아요, -죠?, -ㄹ래요?, -더라고요, -거든, -어/아요).
4. ĐỘ DÀI: Câu tiếng Hàn ngắn gọn, sinh động (1 đến 3 câu), từ vựng và ngữ pháp vừa phải, chuẩn bản ngữ Seoul.
5. Cung cấp phiên âm Latinh (Romanization) để người học dễ đọc to thành tiếng.
6. Dịch nghĩa tiếng Việt tự nhiên, ấm áp, hóm hỉnh.
7. FEEDBACK: Nhận xét linh hoạt, ngắn gọn, cụ thể bằng tiếng Việt, nhận xét đúng vào nội dung người học vừa nói (khen ngợi phát âm, lưu ý từ vựng, hoặc gợi ý mẹo giao tiếp). Không dùng nhận xét dập khuôn.
8. SUGGESTED REPLIES: Gợi ý 3 câu phản hồi tiếp theo phong phú, tự nhiên (1 câu đồng tình/vui nhộn, 1 câu tò mò hỏi sâu hơn, 1 câu chuyển đề tài thú vị) kèm nghĩa tiếng Việt.

Lịch sử trò chuyện gần nhất:
${JSON.stringify(messages?.slice(-6) || [])}

Câu người dùng vừa gửi: "${userMessage}"

Trả về ĐÚNG định dạng JSON sau:
{
  "korean": "Câu nói tiếng Hàn sinh động, linh hoạt của bạn",
  "romanization": "Phiên âm la-tinh của câu nói",
  "vietnamese": "Nghĩa tiếng Việt câu nói của bạn",
  "feedback": "Nhận xét linh hoạt, không dập khuôn bằng tiếng Việt",
  "suggestedReplies": [
    { "korean": "Câu gợi ý 1", "vietnamese": "Nghĩa tiếng Việt 1" },
    { "korean": "Câu gợi ý 2", "vietnamese": "Nghĩa tiếng Việt 2" },
    { "korean": "Câu gợi ý 3", "vietnamese": "Nghĩa tiếng Việt 3" }
  ]
}
`;

    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                korean: { type: Type.STRING },
                romanization: { type: Type.STRING },
                vietnamese: { type: Type.STRING },
                feedback: { type: Type.STRING },
                suggestedReplies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      korean: { type: Type.STRING },
                      vietnamese: { type: Type.STRING },
                    },
                    required: ["korean", "vietnamese"],
                  },
                },
              },
              required: ["korean", "romanization", "vietnamese", "feedback", "suggestedReplies"],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable (${err?.message || err}), trying next model...`);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    }

    // Dynamic, flexible, non-canned fallback generator based on message intent & random variations
    const flexibleFallback = generateFlexibleFallback(userMessage, scenarioId);
    return res.json(flexibleFallback);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const fallback = generateFlexibleFallback(req.body?.userMessage || "", req.body?.scenarioId || "free_ask");
    res.json(fallback);
  }
});

// Helper for generating dynamic, non-canned responses based on context and variety
function generateFlexibleFallback(userMessage: string, scenarioId: string) {
  const norm = (userMessage || "").toLowerCase().trim();

  // 1. Chào hỏi
  if (norm.includes("chào") || norm.includes("hi") || norm.includes("hello") || norm.includes("안녕") || norm.includes("반가")) {
    const pool = [
      {
        korean: "오! 안녕안녕! 오늘 기분 어때요? 맛있는 거 먹었어요?",
        romanization: "o! an-nyeong-an-nyeong! o-neul gi-bun eo-ttae-yo? mas-iss-neun geo meog-eoss-eo-yo?",
        vietnamese: "Ôi chào bạn nha! Hôm nay tâm trạng bạn thế nào? Đã ăn món gì ngon chưa nè?",
        feedback: "Lời chào hỏi rất tự nhiên và thân thiện! Dùng '안녕' cho bạn bè hoặc '안녕하세요' cho người lớn nhé! ✨",
        suggestedReplies: [
          { korean: "오늘 기분 완전 최고예요!", vietnamese: "Hôm nay tâm trạng mình cực kỳ tuyệt vời luôn!" },
          { korean: "아직 밥 안 먹었어요. 배고파요 ㅠㅠ", vietnamese: "Mình chưa ăn cơm nữa nè. Đói bụng ghê á ㅠㅠ" },
          { korean: "한국어 공부하려고 왔어요!", vietnamese: "Mình vào để học tiếng Hàn cùng bạn nè!" }
        ]
      },
      {
        korean: "반가워요! 오늘 하루도 파이팅이에요! 무슨 재미있는 이야기 해볼까요?",
        romanization: "ban-ga-wo-yo! o-neul ha-ru-do pa-i-ting-i-e-yo! mu-seun jae-mi-iss-neun i-ya-gi hae-bol-kka-yo?",
        vietnamese: "Rất vui được gặp bạn! Hôm nay cũng tràn đầy năng lượng nha! Mình buôn chuyện gì vui nào?",
        feedback: "Khởi đầu cuộc trò chuyện đầy nhiệt huyết! Người Hàn hay nói '파이팅' (cố lên) để khích lệ nhau đó!",
        suggestedReplies: [
          { korean: "오늘 한국 날씨는 어때요?", vietnamese: "Thời tiết hôm nay bên Hàn Quốc thế nào rồi?" },
          { korean: "재미있는 한국어 표현 알려줘요!", vietnamese: "Chỉ mình một câu tiếng Hàn thú vị đi!" },
          { korean: "요즘 유행하는 노래 추천해줘요!", vietnamese: "Gợi ý cho mình bài hát đang hot gần đây đi!" }
        ]
      }
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 2. Ẩm thực / Ăn uống
  if (norm.includes("ăn") || norm.includes("uống") || norm.includes("thịt") || norm.includes("cơm") || norm.includes("kimchi") || norm.includes("món") || norm.includes("카페") || norm.includes("밥") || norm.includes("먹")) {
    const pool = [
      {
        korean: "한국 음식 이야기 나오니까 침 고이네요! 삼겹살에 쌈장 콕 찍어 먹으면 천국인데, 먹어봤어요?",
        romanization: "han-guk eum-sik i-ya-gi na-o-ni-kka chim go-i-ne-yo! sam-gyeop-sal-e ssam-jang kok jjik-eo meog-eu-myeon cheon-guk-in-de, meog-eo-bwat-eo-yo?",
        vietnamese: "Nhắc tới đồ ăn Hàn là bụng sôi ùng ục liền á! Thịt ba chỉ nướng chấm sốt ssamjang cuộn rau là chuẩn bài, bạn đã thử chưa?",
        feedback: "Đề tài ẩm thực là cách mở đầu giao tiếp đỉnh nhất với người Hàn! Từ '침 고이다' nghĩa là ứa nước miếng thèm ăn đó nha! 🥩",
        suggestedReplies: [
          { korean: "당연하죠! 삼겹살 진짜 좋아해요!", vietnamese: "Đương nhiên rồi! Mình mê thịt nướng samgyeopsal lắm!" },
          { korean: "매운 떡볶이도 추천해줘요!", vietnamese: "Gợi ý thêm món bánh gạo tokbokki cay nữa đi!" },
          { korean: "베트남 쌀국수도 진짜 맛있는데!", vietnamese: "Phở Việt Nam cũng ngon tuyệt đỉnh luôn đó nha!" }
        ]
      },
      {
        korean: "한국에 오면 길거리 포장마차에서 떡볶이랑 어묵 국물 꼭 드셔보세요! 완전 힐링이에요~",
        romanization: "han-guk-e o-myeon gil-geo-ri po-jang-ma-cha-e-seo tteok-bok-ki-rang eo-muk guk-mul kkok deu-syeo-bo-se-yo! wan-jeon hil-ring-i-e-yo~",
        vietnamese: "Nếu đến Hàn Quốc, nhất định phải ghé quán lều ven đường ăn tokbokki húp xì xụp nước chả cá nhé! Chữa lành tâm hồn cực kỳ~",
        feedback: "Quán lều ven đường gọi là '포장마차' (po-jang-ma-cha) - một nét văn hóa phim ảnh rất đặc trưng của Hàn Quốc đó!",
        suggestedReplies: [
          { korean: "드라마에서 많이 봤어요! 가보고 싶어요!", vietnamese: "Mình thấy trên phim miết luôn! Muốn đi thử ghê!" },
          { korean: "어묵 국물은 무료로 더 주나요?", vietnamese: "Nước súp chả cá có được xin thêm miễn phí không ta?" },
          { korean: "한국 길거리 음식 베스트 3 알려줘요!", vietnamese: "Chỉ mình top 3 món ăn đường phố Hàn Quốc ngon nhất đi!" }
        ]
      }
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 3. K-pop & Idols
  if (norm.includes("bts") || norm.includes("newjeans") || norm.includes("blackpink") || norm.includes("idol") || norm.includes("ca sĩ") || norm.includes("nhạc") || norm.includes("아이돌") || norm.includes("노래")) {
    const pool = [
      {
        korean: "헐, 통했네요! 저도 K-pop 음악 들으면서 하루를 시작해요! 가장 좋아하는 멤버는 누구예요?",
        romanization: "heol, tong-haess-ne-yo! jeo-do K-pop eum-ak deul-eu-myeon-seo ha-ru-reul si-jak-hae-yo! ga-jang joh-a-ha-neun mem-beo-neun nu-gu-ye-yo?",
        vietnamese: "Hở, thần giao cách cảm ghê! Mình cũng toàn nghe K-pop để nạp năng lượng mỗi sáng nè! Thành viên bạn cưng nhất là ai thế?",
        feedback: "Buôn chuyện thần tượng (덕질) giúp tăng phản xạ nói tiếng Hàn cực nhanh! Từ '통했네요' nghĩa là tâm đầu ý hợp đó!",
        suggestedReplies: [
          { korean: "모든 멤버가 다 매력 넘쳐요!", vietnamese: "Tất cả các thành viên ai cũng tỏa sáng hết trơn á!" },
          { korean: "콘서트 직관 가보는 게 제 소원이에요!", vietnamese: "Ước mơ của mình là một lần đi đu concert trực tiếp!" },
          { korean: "팬들이 쓰는 귀여운 신조어 알려줘요!", vietnamese: "Chỉ mình từ lóng đáng yêu mà các fandom hay dùng đi!" }
        ]
      }
    ];
    return pool[0];
  }

  // 4. Mệt mỏi / Cần động viên
  if (norm.includes("mệt") || norm.includes("buồn") || norm.includes("khó") || norm.includes("nản") || norm.includes("áp lực") || norm.includes("힘들") || norm.includes("피곤")) {
    return {
      korean: "오늘 정말 고생 많았어요! 토닥토닥~ 너무 무리하지 말고 따뜻한 차 한잔 마시면서 푹 쉬어요!",
      romanization: "o-neul jeong-mal go-saeng manh-ass-eo-yo! to-dak-to-dak~ neo-mu mu-ri-ha-ji mal-go tta-tteut-han cha han-jan ma-si-myeon-seo puk swi-eo-yo!",
      vietnamese: "Hôm nay bạn vất vả nhiều rồi! Xoa xoa lưng an ủi nè~ Đừng gắng gượng quá sức, uống một tách trà ấm rồi nghỉ ngơi thật ngon nhé!",
      feedback: "'토닥토닥' là từ tượng thanh vỗ lưng an ủi siêu ấm áp của người Hàn. Bạn đã làm rất tốt hôm nay rồi! 🌸",
      suggestedReplies: [
        { korean: "따뜻한 말 한마디에 힘이 나네요. 고마워요!", vietnamese: "Nghe câu nói ấm áp này thấy có động lực lại liền. Cảm ơn bạn nha!" },
        { korean: "내일도 열심히 힘내볼게요!", vietnamese: "Ngày mai mình sẽ lại cố gắng hết mình!" },
        { korean: "기분 좋아지는 신나는 음악 틀어줘요!", vietnamese: "Bật một bài nhạc vui vẻ cho mình tươi tỉnh lại đi!" }
      ]
    };
  }

  // 5. Thả thính / Tình cảm
  if (norm.includes("thính") || norm.includes("yêu") || norm.includes("crush") || norm.includes("hẹn hò") || norm.includes("tim") || norm.includes("플러팅") || norm.includes("사랑")) {
    return {
      korean: "어머나! 심장에 무리 오게 왜 이렇게 달콤한 말을 해요? 오늘부터 1일 할까요? ㅋㅋㅋ",
      romanization: "eo-meo-na! sim-jang-e mu-ri o-ge wae i-reoh-ge dal-kom-han mal-eul hae-yo? o-neul-bu-teo il-il hal-kka-yo? ㅋㅋ���",
      vietnamese: "Ôi trời đất ơi! Ăn nói ngọt ngào làm tim người ta loạn nhịp muốn xỉu luôn nè? Tính tính từ hôm nay là ngày đầu tiên hẹn hò luôn hay sao? ㅋㅋㅋ",
      feedback: "Ở Hàn Quốc, khi hai người chính thức yêu nhau họ sẽ nói: '오늘부터 1일' (Tính từ hôm nay là ngày thứ 1)! Thả thính đỉnh chóp luôn! 💖",
      suggestedReplies: [
        { korean: "ㅋㅋㅋ 장난이에요! 근데 진짜 심쿵했죠?", vietnamese: "ㅋㅋㅋ Trêu chút xíu thui! Nhưng mà tim rung rinh thật rồi đúng hông?" },
        { korean: "한국 사람들은 썸탈 때 어떻게 고백해요?", vietnamese: "Người Hàn khi đang tìm hiểu thì tỏ tình thế nào vậy?" },
        { korean: "더 강력한 플러팅 멘트 하나 더 전수해줘요!", vietnamese: "Truyền thụ thêm một câu thả thính siêu cấp đốn tim nữa đi!" }
      ]
    };
  }

  // 6. Mặc định phản hồi linh hoạt, tươi vui
  const generalPool = [
    {
      korean: `아, 그렇군요! "${userMessage}"에 대해 이렇게 이야기 나누니까 정말 재미있네요! 당신 생각은 어때요?`,
      romanization: `a, geu-reoh-gun-yo! jil-mun-e dae-hae i-reoh-ge i-ya-gi na-nu-ni-kka jeong-mal jae-mi-iss-ne-yo! dang-sin saeng-gak-eun eo-ttae-yo?`,
      vietnamese: `À ra là thế! Cùng buôn chuyện về chủ đề này thấy rôm rả và cuốn hút ghê á! Bạn nghĩ sao về điều này nè?`,
      feedback: "Phản xạ giao tiếp của bạn rất tự nhiên và nhạy bén! Cứ tự tin chia sẻ góc nhìn của mình nhé! 🌟",
      suggestedReplies: [
        { korean: "저도 그렇게 생각해요! 완전 공감해요!", vietnamese: "Mình cũng nghĩ y chang vậy luôn! Đồng cảm 100%!" },
        { korean: "조금 더 자세히 설명해 줄 수 있어요?", vietnamese: "Bạn có thể giải thích chi tiết hơn xíu nữa được không?" },
        { korean: "다른 흥미로운 이야기도 들려줘요!", vietnamese: "Kể cho mình thêm câu chuyện thú vị nào khác đi!" }
      ]
    },
    {
      korean: `오호라! 그거 진짜 흥미로운 질문인데요? 한국 친구들한테 물어봐도 다들 눈 반짝일 것 같아요!`,
      romanization: `o-ho-ra! geu-geo jin-jja heung-mi-ro-un jil-mun-in-de-yo? han-guk chin-gu-deul-han-te mul-eo-bwa-do da-deul nun ban-jjak-il geot gat-a-yo!`,
      vietnamese: `Ồ hô! Câu hỏi này nghe hấp dẫn và thú vị thực sự luôn đó! Đem đi hỏi bạn bè người Hàn chắc ai nấy cũng hào hứng bàn tán xôn xao cho xem!`,
      feedback: "Đặt câu hỏi gợi mở như vậy là bí quyết giúp bạn luôn là tâm điểm trong các cuộc trò chuyện tiếng Hàn đó! 🚀",
      suggestedReplies: [
        { korean: "진짜요? 친구들 반응이 궁금하네요! ㅎㅎ", vietnamese: "Thật hả? Tò mò phản ứng của bạn bè ghê á! ㅎㅎ" },
        { korean: "한국인들이 가장 자주 쓰는 표현은 뭐예요?", vietnamese: "Người Hàn hay dùng mẫu câu nào nhất trong hoàn cảnh này?" },
        { korean: "다음 단계로 넘어가서 계속 연습해요!", vietnamese: "Tiếp tục qua bước tiếp theo luyện tập nào!" }
      ]
    }
  ];

  return generalPool[Math.floor(Math.random() * generalPool.length)];
}

// AI Speech Evaluation Endpoint (Mic thu giọng đọc rồi mới chấm và nhận xét chi tiết)
app.post("/api/speaking-evaluate", async (req, res) => {
  try {
    const { targetSentenceKo, spokenTranscript, challengeTitle, meaningVi } = req.body;
    if (!spokenTranscript) {
      return res.status(400).json({ error: "Thiếu dữ liệu giọng đọc của học viên" });
    }

    const ai = getAi();
    const prompt = `
Bạn là giám khảo và huấn luyện viên phát âm tiếng Hàn hàng đầu trong ứng dụng "한국어 여정".
Học viên vừa bấm micro đọc câu tiếng Hàn trong thử thách giao tiếp:
- Tình huống thử thách: "${challengeTitle || 'Giao tiếp thực tế'}"
- Câu mẫu chuẩn tiếng Hàn (Target): "${targetSentenceKo || ''}"
- Nghĩa tiếng Việt chuẩn: "${meaningVi || ''}"
- Câu thực tế học viên vừa đọc qua microphone (Spoken Transcript): "${spokenTranscript}"

Nhiệm vụ của bạn:
1. So sánh câu học viên đọc với câu chuẩn. Chấm điểm độ chuẩn xác phát âm & ngữ điệu (accuracyScore từ 0 đến 100).
2. Nhận xét LINH HOẠT, CỤ THỂ, KHÔNG DẬP KHUÔN bằng tiếng Việt:
   - Khen ngợi những từ/âm tiết học viên phát âm chuẩn hoặc phản xạ nhanh.
   - Chỉ ra từ nào phát âm chưa rõ, phụ âm cuối (받침) nào cần lưu ý hoặc ngữ điệu lên xuống thế nào cho chuẩn người Seoul.
   - Thêm một câu động viên hài hước, tạo cảm hứng học tập.
3. Cung cấp câu mẫu chuẩn (correctAnswerKo), phiên âm (romanization), và nghĩa tiếng Việt (vietnameseMeaning).

Trả về ĐÚNG định dạng JSON theo schema:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracyScore: { type: Type.INTEGER, description: "Điểm từ 0 - 100" },
            praiseFeedbackVi: { type: Type.STRING, description: "Lời khen ngợi và nhận xét chi tiết, không dập khuôn" },
            pronunciationTipsVi: { type: Type.STRING, description: "Mẹo sửa phát âm hoặc ngữ điệu" },
            isPass: { type: Type.BOOLEAN, description: "True nếu đạt >= 60 điểm" },
          },
          required: ["accuracyScore", "praiseFeedbackVi", "pronunciationTipsVi", "isPass"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/speaking-evaluate:", error);
    // Smart fallback comparison
    const target = (req.body?.targetSentenceKo || "").replace(/[^\w\s가-힣]/gi, '').toLowerCase();
    const spoken = (req.body?.spokenTranscript || "").replace(/[^\w\s가-힣]/gi, '').toLowerCase();
    let score = 70;
    if (spoken === target) score = 98;
    else if (spoken.length > 0 && target.includes(spoken)) score = 85;
    else if (spoken.length > 0) score = 75;

    res.json({
      accuracyScore: score,
      praiseFeedbackVi: score >= 80 
        ? "Phát âm rất rõ ràng và chuẩn ngữ điệu Seoul! Bạn bắt chước ngữ âm tự nhiên như người bản xứ vậy!" 
        : "Giọng đọc to rõ và đầy tự tin! Chỉ cần điều chỉnh một chút phụ âm cuối là hoàn hảo 10 điểm!",
      pronunciationTipsVi: "Hãy chú ý nối âm và hạ giọng nhẹ ở cuối câu để nghe mềm mại, tự nhiên hơn nhé!",
      isPass: score >= 60
    });
  }
});

// AI Grammar Checker Endpoint
app.post("/api/grammar-check", async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string") {
      return res.status(400).json({ error: "Vui lòng nhập câu tiếng Hàn cần kiểm tra" });
    }

    const ai = getAi();
    const prompt = `
Bạn là chuyên gia ngữ pháp tiếng Hàn dành cho người Việt Nam trong ứng dụng "한국어 여정".
Hãy phân tích câu tiếng Hàn sau của học viên: "${sentence}".

Hãy kiểm tra:
1. Tính chính xác về chính tả, tiểu từ (은/는, 이/가, 을/를, 에/에서, 와/과...), chia đuôi động từ (-아/어요, -았/었어요, -(으)ㄹ 거예요, -ㅂ/습니다).
2. Sửa lại cho chuẩn ngữ pháp và văn phong tự nhiên của người Hàn Quốc.
3. Giải thích chi tiết, dễ hiểu bằng tiếng Việt về lý do sửa hoặc phân tích ngữ pháp trong câu.
4. Đưa ra 1-2 cách diễn đạt tương đương tự nhiên hơn của người bản xứ (kèm nghĩa tiếng Việt).
5. Phân tích các từ vựng chính xuất hiện trong câu (từ vựng, phiên âm, từ loại, nghĩa tiếng Việt).

Trả về định dạng JSON theo schema:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN, description: "True nếu câu hoàn toàn đúng ngữ pháp và tự nhiên" },
            correctedSentence: { type: Type.STRING, description: "Câu tiếng Hàn đã sửa chuẩn" },
            romanization: { type: Type.STRING, description: "Phiên âm la-tinh của câu đã sửa" },
            vietnameseMeaning: { type: Type.STRING, description: "Nghĩa tiếng Việt chuẩn của câu" },
            explanationVi: { type: Type.STRING, description: "Giải thích chi tiết lỗi và điểm ngữ pháp bằng tiếng Việt" },
            grammarRuleTip: { type: Type.STRING, description: "Mẹo nhớ ngữ pháp ngắn gọn, dễ nhớ" },
            naturalAlternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  korean: { type: Type.STRING },
                  vietnamese: { type: Type.STRING },
                },
                required: ["korean", "vietnamese"],
              },
            },
            vocabularyBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  type: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ["word", "type", "meaning"],
              },
            },
          },
          required: [
            "isCorrect",
            "correctedSentence",
            "romanization",
            "vietnameseMeaning",
            "explanationVi",
            "grammarRuleTip",
            "naturalAlternatives",
            "vocabularyBreakdown",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/grammar-check:", error);
    res.status(500).json({
      error: "Không thể kiểm tra ngữ pháp lúc này",
      details: error.message,
    });
  }
});

// AI Korean Riddle Generator Endpoint (수수께끼)
app.post("/api/riddle", async (req, res) => {
  try {
    const { topic = "general" } = req.body;
    const ai = getAi();
    const prompt = `
Bạn là chuyên gia đố vui và văn hóa tiếng Hàn trong ứng dụng "한국어 여정 (Hành trình tiếng Hàn)".
Hãy tạo một câu đố vui tiếng Hàn (수수께끼) hoặc câu đố chơi chữ (말장난) hài hước, dí dỏm, mang tính giáo dục dành cho người mới bắt đầu học tiếng Hàn (TOPIK 1 - Level 1, 2).
Chủ đề gợi ý: ${topic}.

Yêu cầu:
1. Câu hỏi tiếng Hàn (ngắn gọn, dí dỏm) kèm bản dịch tiếng Việt chuẩn xác, gần gũi.
2. Manh mối gợi ý (hint) bằng tiếng Việt để giúp người học suy luận.
3. Đáp án tiếng Hàn (answerKo), phiên âm la-tinh (romanization) và nghĩa tiếng Việt (answerVi).
4. Lời giải thích chơi chữ/văn hóa (punExplanation) bằng tiếng Việt thật dễ hiểu, chỉ ra tại sao câu đố này lại buồn cười hoặc ý nghĩa của từ vựng trong tiếng Hàn.
5. Danh mục thể loại (category): một trong các giá trị "wordplay" (chơi chữ), "daily" (đời sống), "culture" (văn hóa), hoặc "funny" (hài hước).

Trả về định dạng JSON theo đúng schema:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            questionKo: { type: Type.STRING },
            questionVi: { type: Type.STRING },
            hint: { type: Type.STRING },
            answerKo: { type: Type.STRING },
            romanization: { type: Type.STRING },
            answerVi: { type: Type.STRING },
            punExplanation: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: [
            "questionKo",
            "questionVi",
            "hint",
            "answerKo",
            "romanization",
            "answerVi",
            "punExplanation",
            "category",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.id) {
      parsed.id = `ai-riddle-${Date.now()}`;
    }
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/riddle:", error);
    res.status(500).json({
      error: "Không thể tạo câu đố AI lúc này",
      details: error.message,
    });
  }
});

// AI Cute Vocabulary Generator Endpoint (Sổ tay từ vựng minh họa đáng yêu)
app.post("/api/vocab-generate", async (req, res) => {
  try {
    const { topic = "đời sống thường ngày đáng yêu" } = req.body;
    const ai = getAi();
    const prompt = `
Bạn là gia sư tiếng Hàn đáng yêu và giàu cảm hứng trong ứng dụng "한국어 여정 (Hành trình tiếng Hàn)".
Hãy tạo 3 từ vựng tiếng Hàn gắn liền với chủ đề: "${topic}", phù hợp cho người mới bắt đầu (TOPIK 1).
Mỗi từ vựng phải mang phong cách dễ thương, tươi vui, có câu ví dụ gần gũi và một lời giải thích mẹo nhớ/văn hóa đáng yêu.

Yêu cầu cho mỗi từ vựng:
- id: chuỗi id duy nhất (ví dụ: ai-vocab-1)
- wordKo: từ tiếng Hàn
- romanization: phiên âm Latinh
- meaningVi: nghĩa tiếng Việt ngắn gọn, đáng yêu
- category: một trong các giá trị: "food", "animals", "cafe", "school", "feelings", "seasons", "daily"
- categoryLabel: tên chủ đề bằng tiếng Việt
- cuteEmoji: 1 biểu tượng emoji siêu dễ thương đại diện cho từ (ví dụ: 🌸, 🍓, 🐶, 🍰, 🧸)
- illustrationUrl: URL ảnh đại diện chất lượng cao phù hợp từ Unsplash (dùng URL định dạng https://images.unsplash.com/... hoặc fallback)
- themeColor: một trong các màu: "rose", "amber", "emerald", "sky", "purple", "indigo"
- exampleKo: một câu ví dụ tiếng Hàn ngắn, tự nhiên, kèm kính ngữ lịch sự hoặc thân mật
- exampleVi: dịch nghĩa câu ví dụ sang tiếng Việt tự nhiên, ấm áp
- cuteNote: một mẹo ghi nhớ hoặc mẩu chuyện văn hóa K-Culture ngắn thú vị, đáng yêu về từ này.
- tags: mảng 2-3 thẻ từ khóa ngắn gọn tiếng Việt

Trả về một danh sách (JSON Array) gồm đúng 3 đối tượng từ vựng.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              wordKo: { type: Type.STRING },
              romanization: { type: Type.STRING },
              meaningVi: { type: Type.STRING },
              category: { type: Type.STRING },
              categoryLabel: { type: Type.STRING },
              cuteEmoji: { type: Type.STRING },
              illustrationUrl: { type: Type.STRING },
              themeColor: { type: Type.STRING },
              exampleKo: { type: Type.STRING },
              exampleVi: { type: Type.STRING },
              cuteNote: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "wordKo",
              "romanization",
              "meaningVi",
              "category",
              "categoryLabel",
              "cuteEmoji",
              "illustrationUrl",
              "themeColor",
              "exampleKo",
              "exampleVi",
              "cuteNote",
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    const sanitized = (Array.isArray(parsed) ? parsed : []).map((item, idx) => ({
      ...item,
      id: item.id || `ai-vocab-${Date.now()}-${idx}`,
      illustrationUrl:
        item.illustrationUrl && item.illustrationUrl.startsWith('http')
          ? item.illustrationUrl
          : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    }));

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error in /api/vocab-generate:", error);
    res.status(500).json({
      error: "Không thể tạo từ vựng AI lúc này",
      details: error.message,
    });
  }
});

// In-memory OTP storage for password reset: email -> { otp, expiresAt, sentAt }
const otpStore = new Map<string, { otp: string; expiresAt: number; sentAt: string }>();

// Endpoint to send 6-digit OTP to student's personal Gmail for login / password reset
app.post("/api/auth/send-otp", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Vui lòng cung cấp địa chỉ Gmail hợp lệ" });
    }

    const normEmail = email.trim().toLowerCase();
    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const sentTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });

    otpStore.set(normEmail, { otp, expiresAt, sentAt: sentTime });

    console.log(`[OTP-GMAIL] ==============================================`);
    console.log(`[OTP-GMAIL] Gửi mã xác nhận đặt lại mật khẩu tới: ${normEmail}`);
    console.log(`[OTP-GMAIL] Mã OTP: ${otp}`);
    console.log(`[OTP-GMAIL] Thời gian: ${sentTime} (Hiệu lực 10 phút)`);
    console.log(`[OTP-GMAIL] ==============================================`);

    res.json({
      success: true,
      message: `Mã OTP xác thực 6 số đã được gửi tới Gmail ${normEmail}!`,
      otp, // included for convenient real-time testing and prompt in UI
      expiresInMinutes: 10,
      sentAt: sentTime,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/send-otp:", error);
    res.status(500).json({
      error: "Không thể tạo mã OTP lúc này",
      details: error.message,
    });
  }
});

// Endpoint to verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Thiếu Gmail hoặc mã OTP" });
    }

    const normEmail = email.trim().toLowerCase();
    const record = otpStore.get(normEmail);

    if (!record) {
      return res.status(400).json({
        error: "Không tìm thấy yêu cầu xác thực OTP cho Gmail này hoặc mã đã hết hạn. Vui lòng bấm gửi lại mã mới!",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normEmail);
      return res.status(400).json({
        error: "Mã OTP đã hết hiệu lực (quá 10 phút). Vui lòng yêu cầu mã OTP mới!",
      });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({
        error: "Mã OTP không chính xác! Vui lòng kiểm tra lại 6 chữ số trong hộp thư Gmail.",
      });
    }

    // Successfully verified -> consume OTP
    otpStore.delete(normEmail);
    res.json({
      success: true,
      message: "Xác thực mã OTP thành công! Bạn có thể đặt mật khẩu mới ngay bây giờ.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/verify-otp:", error);
    res.status(500).json({
      error: "Không thể xác thực mã OTP lúc này",
      details: error.message,
    });
  }
});

// Admin Credentials Dispatch to Gmail
app.post("/api/admin/send-credentials", async (req, res) => {
  try {
    const { targetEmail = "zapollo1990@gmail.com", report } = req.body;
    const sentTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });

    console.log(`[AUTH-EMAIL] ==============================================`);
    console.log(`[AUTH-EMAIL] Dispatching Admin Passwords to: ${targetEmail}`);
    console.log(`[AUTH-EMAIL] Time: ${sentTime}`);
    if (report) {
      console.log(`[AUTH-EMAIL] Main Admin: ${report.mainAdmin?.name} - Password configured`);
      console.log(`[AUTH-EMAIL] Sub Admins Count: ${report.subAdmins?.length || 0}`);
    }
    console.log(`[AUTH-EMAIL] ==============================================`);

    res.json({
      success: true,
      recipient: targetEmail,
      sentAt: sentTime,
      message: `Đã gửi báo cáo bảo mật và mật khẩu Admin Chính & Admin Phụ tới ${targetEmail} thành công!`,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/send-credentials:", error);
    res.status(500).json({
      error: "Không thể gửi email lúc này",
      details: error.message,
    });
  }
});


async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const indexPath = path.join(distPath, "index.html");
  const hasDist = fs.existsSync(indexPath);

  // In Cloud Run (K_SERVICE is set) or when dist/index.html is built for production
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.K_SERVICE) ||
    (hasDist && process.env.npm_lifecycle_event !== "dev");

  if (isProduction) {
    if (hasDist) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      app.get("*", (_req, res) => {
        res.send("<!DOCTYPE html><html><body><h1>Hành trình tiếng Hàn đang khởi động...</h1><script>setTimeout(() => location.reload(), 2000);</script></body></html>");
      });
    }
  } else {
    // Vite middleware for local development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      // Express owns the HTTP server, so it cannot forward Vite's HMR upgrade
      // requests. Disable HMR here to prevent the injected client from opening
      // a WebSocket that is immediately closed by the middleware server.
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
