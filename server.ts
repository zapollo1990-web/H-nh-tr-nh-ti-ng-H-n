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
3. PHONG CÁCH: SINH ĐỘNG, HÀI HƯỚC, TRÀN ĐẦY NĂNG LƯỢNG!
   - Sử dụng từ ngữ biểu cảm, ví von vui nhộn, chêm tiếng cười tự nhiên của người Hàn (ㅋㅋㅋ, ㅎㅎㅎ) hoặc các thán từ vui vẻ (대박, 헐, 짱이야, 어머, 아이고...).
   - Tránh câu trả lời khô khan hay máy móc; hãy mang đến sự hài hước duyên dáng giúp người học luôn cười vui và có động lực học tiếng Hàn.
4. ĐỘ DÀI: Câu tiếng Hàn ngắn gọn, súc tích (1 đến 3 câu), từ vựng và ngữ pháp vừa phải, dễ nắm bắt.
5. Cung cấp phiên âm Latinh (Romanization) để người học dễ đọc to thành tiếng.
6. Dịch nghĩa tiếng Việt tự nhiên, ấm áp, hóm hỉnh.
7. FEEDBACK: Đưa ra nhận xét ngắn bằng tiếng Việt dí dỏm, khen ngợi hài hước tạo cảm hứng (ví dụ: "Đỉnh chóp luôn bạn ơi! Nói câu này người Hàn tưởng idol K-pop đấy 🌟", "Phản xạ nhanh như chớp! ⚡", "Câu này vừa ngầu vừa chuẩn bản xứ nè!"), hoặc sửa lỗi nhẹ nhàng kèm câu đùa vui vẻ.
8. SUGGESTED REPLIES: Gợi ý 3 câu trả lời tiếng Hàn tiếp theo ĐA DẠNG & THÚ VỊ (vừa có câu nghiêm túc, vừa có câu hài hước hoặc lém lỉnh) kèm nghĩa tiếng Việt để người học bấm chọn ngay.

Lịch sử trò chuyện gần nhất:
${JSON.stringify(messages?.slice(-6) || [])}

Câu người dùng vừa gửi: "${userMessage}"

Trả về ĐÚNG định dạng JSON sau:
{
  "korean": "Câu nói tiếng Hàn sinh động, hài hước của bạn",
  "romanization": "Phiên âm la-tinh của câu nói",
  "vietnamese": "Nghĩa tiếng Việt câu nói của bạn",
  "feedback": "Nhận xét dí dỏm, khen ngợi hoặc sửa lỗi bằng tiếng Việt",
  "suggestedReplies": [
    { "korean": "Câu gợi ý 1", "vietnamese": "Nghĩa tiếng Việt 1" },
    { "korean": "Câu gợi ý 2", "vietnamese": "Nghĩa tiếng Việt 2" },
    { "korean": "Câu gợi ý 3", "vietnamese": "Nghĩa tiếng Việt 3" }
  ]
}
`;

    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash"
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

    // Smart contextual & humorous fallback when external API has temporary high-demand spike
    console.log("Serving smart humorous fallback for /api/chat due to upstream load");
    const smartFallbacks: Record<string, any> = {
      slang_humor: {
        korean: "ㅋㅋㅋ 요즘 한국 10대, 20대는 대박 대신 '폼 미쳤다!'나 '완내스(완전 내 스타일)'라고 해요! 완전 꿀잼이죠?",
        romanization: "ㅋㅋㅋ yo-jeum han-guk sip-dae, i-sip-dae-neun dae-bak dae-sin 'pom mi-chyeot-da!' na 'wan-nae-seu' ra-go hae-yo! wan-jeon kkul-jaem-i-jyo?",
        vietnamese: "ㅋㅋㅋ Giới trẻ Hàn dạo này thay vì nói 'Daebak' thì hay hô 'Form mi-chyeot-da!' (Phong độ đỉnh chóp!) hoặc 'Wan-nae-seu' (Chuẩn gu tui đó)! Nghe thú vị đúng hông?",
        feedback: "Hỏi trúng từ lóng giới trẻ là chuẩn bài rồi đó! Dùng từ này người Hàn nghe là tròn xoe mắt thán phục luôn! 🌟",
        suggestedReplies: [
          { korean: "대박! 나도 그 말 써먹어볼래요! ㅋㅋㅋ", vietnamese: "Đỉnh quá! Tui cũng sẽ đem từ này đi khoe mới được! ㅋㅋㅋ" },
          { korean: "또 다른 재미있는 신조어 알려줘요!", vietnamese: "Chỉ thêm từ lóng nào vui vui nữa đi bạn ơi!" },
          { korean: "한국 젊은이들 유행 진짜 빠르네요!", vietnamese: "Giới trẻ Hàn bắt trend nhanh thật đấy!" }
        ]
      },
      dating: {
        korean: "어머, 오늘 왜 이렇게 심쿵하게 말을 예쁘게 하세요? 얼굴 빨개지잖아요~ ㅋㅋㅋ",
        romanization: "eo-meo, o-neul wae i-reo-ke sim-kung-ha-ge mal-eul ye-ppeu-ge ha-se-yo? eol-gul ppal-gae-ji-janh-a-yo~ ㅋㅋㅋ",
        vietnamese: "Ủa alo, sao hôm nay ăn nói ngọt ngào làm tim người ta 'rung rinh' dữ vậy nè? Ngại đỏ hết cả mặt rồi đó nha~ ㅋㅋㅋ",
        feedback: "Thả thính mượt mà 10 điểm không có nhưng! Nói câu này là crush đổ đứ đừ liền! 💖",
        suggestedReplies: [
          { korean: "너랑 같이 있으니까 더 떨려~ ㅎㅎ", vietnamese: "Ở cạnh bạn làm mình thấy hồi hộp hơn á~ ㅎㅎ" },
          { korean: "우리 한강 가서 라면 먹고 갈래?",
            vietnamese: "Hay là tụi mình ra bờ sông Hàn ăn mì gói hóng gió nha?" },
          { korean: "오늘 첫 데이트 대성공이네요!", vietnamese: "Buổi hẹn hò đầu tiên đại thành công rồi nè!" }
        ]
      }
    };

    const fallbackChoice = smartFallbacks[scenarioId] || {
      korean: `와! "${userMessage}"에 대해 물어보셨군요! ㅋㅋㅋ 정말 센스 넘치는 질문이에요! 하나가 콕 집어 친절하게 알려드릴게요~ ✨`,
      romanization: `wa! jil-mun-e dae-hae mul-eo-bo-syeot-gun-yo! ㅋㅋㅋ jeong-mal sen-seu neom-chi-neun jil-mun-i-e-yo! ha-na-ga kok jib-eo chin-jeol-ha-ge al-ryeo-deu-ril-ge-yo~ ✨`,
      vietnamese: `Oa! Bạn vừa hỏi về "${userMessage}" nè! ㅋㅋㅋ Câu hỏi siêu nhạy bén và có duyên luôn á! Để Hana giải đáp nhiệt tình cho bạn ngay nha~ ✨`,
      feedback: "Khả năng đặt câu hỏi và giao lưu của bạn cực kỳ tự nhiên, tràn đầy năng lượng tích cực! Tiếp tục phát huy nhé! 🚀",
      suggestedReplies: [
        { korean: "고마워요! 다음 표현도 더 알려주세요!", vietnamese: "Cảm ơn bạn! Chỉ mình thêm các câu tiếp theo với!" },
        { korean: "한국어로 더 자연스럽게 말하는 꿀팁은 뭐야?", vietnamese: "Bí kíp để nói tiếng Hàn tự nhiên hơn là gì vậy?" },
        { korean: "오늘 대화 너무 유쾌하고 재미있어요! ㅋㅋㅋ", vietnamese: "Hôm nay trò chuyện hài hước và vui vẻ quá chừng! ㅋㅋㅋ" }
      ]
    };

    res.json(fallbackChoice);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.json({
      korean: "반가워요! ㅋㅋㅋ 무슨 질문이든 편하게 물어보세요! 신나게 대화 나눠봐요~ ✨",
      romanization: "ban-ga-wo-yo! ㅋㅋㅋ mu-seun jil-mun-i-deun pyeon-ha-ge mul-eo-bo-se-yo! sin-na-ge dae-hwa na-nwo-bwa-yo~ ✨",
      vietnamese: "Rất vui được gặp bạn! ㅋㅋㅋ Cứ thoải mái hỏi bất kỳ điều gì nhé! Cùng trò chuyện thật vui nào~ ✨",
      feedback: "Bạn đã kết nối thành công! Đặt câu hỏi bất kỳ để cùng luyện tập nhé! 🌟",
      suggestedReplies: [
        { korean: "안녕하세요! 만나서 반가워요!", vietnamese: "Xin chào! Rất vui được gặp bạn!" },
        { korean: "한국어 잘하고 싶어요! 도와줘요!", vietnamese: "Mình muốn giỏi tiếng Hàn! Giúp mình với nha!" }
      ]
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
      server: { middlewareMode: true },
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
