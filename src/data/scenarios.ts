import { ConversationScenario } from '../types';

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  // 1. CHỦ ĐỀ CHÍNH: HỎI GÌ ĐÁP NẤY SIÊU HÀI HƯỚC & SINH ĐỘNG
  {
    id: 'free_ask',
    title: 'Hỏi gì đáp nấy: Siêu hài hước & sinh động',
    koreanTitle: '무엇이든 물어보세요! (유쾌한 하나)',
    icon: '✨',
    badge: 'Hỏi bất kỳ điều gì',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Hỏi Hana bất kỳ câu hỏi nào: từ ngữ pháp, K-pop, phim ảnh, đời sống, thả thính đến đố vui lầy lội!',
    initialMessage: {
      korean: '안녕! 반가워요~ 저는 당신의 유쾌한 한국어 단짝 하나(Hana)예요! ㅋㅋㅋ 오늘 어떤 재미있는 이야기나 궁금한 점이 있나요? 편하게 아무거나 물어봐요!',
      romanization: 'an-nyeong! ban-ga-wo-yo~ jeo-neun dang-sin-ui yu-kwae-han han-guk-eo dan-jjak ha-na-ye-yo! ㅋㅋㅋ o-neul eo-tteon jae-mi-iss-neun i-ya-gi-na gung-geum-han jeom-i iss-na-yo? pyeon-ha-ge a-mu-geo-na mul-eo-bwa-yo!',
      vietnamese: 'Chào bạn nha! Rất vui được gặp bạn~ Mình là Hana - cô bạn thân tiếng Hàn siêu hài hước và nhiệt huyết của bạn đây! ㅋㅋㅋ Hôm nay bạn có thắc mắc gì hay ho hoặc muốn buôn chuyện gì nào? Cứ thoải mái hỏi bất cứ điều gì nhé!',
      suggestedReplies: [
        {
          korean: '한국 젊은이들이 쓰는 가장 웃긴 유행어 알려줘! ㅋㅋㅋ',
          vietnamese: 'Dạy mình từ lóng giới trẻ Hàn (MZ slang) hài nhất đi! ㅋㅋㅋ'
        },
        {
          korean: '한국어로 썸탈 때 심쿵하는 플러팅 멘트 하나만!',
          vietnamese: 'Chỉ mình một câu thả thính làm "rung rinh" bằng tiếng Hàn đi nào!'
        },
        {
          korean: '오늘 너무 피곤한데 재미있는 한국 농담 하나 해줄래?',
          vietnamese: 'Hôm nay mình mệt quá, kể cho mình một câu đùa tiếng Hàn vui vẻ xem nào!'
        }
      ]
    }
  },

  // 2. TIẾNG LÓNG & ĐỐ VUI HÀI HƯỚC MZ
  {
    id: 'slang_humor',
    title: 'Tiếng lóng & Đố vui hài hước MZ',
    koreanTitle: 'MZ세대 신조어와 유머 퀴즈',
    icon: '🤣',
    badge: 'Cực vui nhộn',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Khám phá thế giới từ lóng hot trend, meme cười xỉu và những câu đố chữ tiếng Hàn siêu mặn mà.',
    initialMessage: {
      korean: '오! 유머 감각 넘치는 친구를 만났군요! 요즘 한국에서 유행하는 신조어 "완내스(완전 내 스타일)"나 "분좋카(분위기 좋은 카페)" 아세요? 저랑 퀴즈 한번 풀어볼래요?',
      romanization: 'o! yu-meo gam-gak neom-chi-neun chin-gu-reul man-nat-gun-yo! yo-jeum han-guk-e-seo yu-haeng-ha-neun sin-jo-eo "wan-nae-seu" na "bun-joh-ka" a-se-yo? jeo-rang kwi-jeu han-beon pul-eo-bol-rae-yo?',
      vietnamese: 'Ôi chu choa! Gặp đúng cạ mê cười rồi nè! Bạn có biết mấy từ lóng hot trend của giới trẻ Hàn như "Wan-nae-seu" (chuẩn gu tui) hay "Bun-joh-ka" (quán cà phê view mê ly) chưa? Thử chơi đố vui với mình một hiệp không?',
      suggestedReplies: [
        {
          korean: '완전 좋아요! 재미있는 넌센스 퀴즈 하나 내줘요!',
          vietnamese: 'Thích quá luôn! Đố mình một câu đố vui chữ nghĩa lầy lội đi!'
        },
        {
          korean: '"대박" 말고 요즘 한국 10대, 20대는 감탄할 때 뭐라고 해?',
          vietnamese: 'Ngoài từ "Daebak" thì giới trẻ Hàn bây giờ khen ngợi bằng từ gì vậy?'
        },
        {
          korean: '한국어로 "킹받네"가 무슨 뜻이야? ㅋㅋㅋ',
          vietnamese: 'Từ "King-bat-ne" trong tiếng Hàn có nghĩa là gì vậy? ㅋㅋㅋ'
        }
      ]
    }
  },

  // 3. TÁN GẪU K-POP & IDOL
  {
    id: 'kpop',
    title: 'Tán gẫu cùng fan K-pop & Idol',
    koreanTitle: 'K-pop 덕질 & 아이돌 수다',
    icon: '🎤',
    badge: 'K-pop & Idol',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Trò chuyện về nhóm nhạc yêu thích (BTS, BLACKPINK, NewJeans, SEVENTEEN...), fanchant và văn hóa đu idol.',
    initialMessage: {
      korean: '꺄악! 혹시 K-pop 좋아하세요? 최애(가장 좋아하는) 아이돌이나 요즘 무한 반복해서 듣는 노래가 누구예요? 같이 신나게 덕질 토크 해봐요!',
      romanization: 'kya-ak! hok-si K-pop joh-a-ha-se-yo? choe-ae(ga-jang joh-a-ha-neun) a-i-dol-i-na yo-jeum mu-han ban-bok-hae-seo deud-neun no-rae-ga nu-gu-ye-yo? gat-i sin-na-ge deok-jil to-keu hae-bwa-yo!',
      vietnamese: 'Á á á! Có phải bạn cũng mê K-pop không? "Bias" (idol cưng nhất trần đời) của bạn là ai hay dạo này đang nghe đi nghe lại bài hát nào vậy? Cùng buôn chuyện đu idol với mình đi!',
      suggestedReplies: [
        {
          korean: '저는 방탄소년단과 뉴진스를 정말 좋아해요!',
          vietnamese: 'Mình cực kỳ thích BTS và NewJeans luôn đó!'
        },
        {
          korean: '콘서트 티켓팅에 성공하는 비법 좀 알려줘요! ㅠㅠ',
          vietnamese: 'Chỉ mình bí kíp săn vé concert đi, trượt quài buồn ghê á! ㅠㅠ'
        },
        {
          korean: '좋아하는 최애한테 팬레터 쓸 때 쓰는 예쁜 표현 알려줘!',
          vietnamese: 'Chỉ mình vài câu siêu ngọt ngào để viết thư tay cho idol đi!'
        }
      ]
    }
  },

  // 4. HẸN HÒ LÃNG MẠN & THẢ THÍNH HÀI HƯỚC
  {
    id: 'dating',
    title: 'Hẹn hò lãng mạn & Thả thính hài hước',
    koreanTitle: '달콤살벌 소개팅 & 심쿵 플러팅',
    icon: '💖',
    badge: 'Thả thính ngọt ngào',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Thực hành hội thoại hẹn hò xem mắt, khen đối phương tinh tế và những câu thả thính vừa lãng mạn vừa buồn cười.',
    initialMessage: {
      korean: '어머, 오늘 너무 멋지고 예쁘게 입고 오셨네요! 눈이 부셔요~ ✨ 오늘 첫 데이트인데 긴장하지 마시고 편하게 수다 떨어요. 어떤 음식 좋아하세요?',
      romanization: 'eo-meo, o-neul neo-mu meot-ji-go ye-ppeu-ge ib-go o-syeon-ne-yo! nun-i bu-syeo-yo~ ✨ o-neul cheot de-i-teu-in-de gin-jang-ha-ji ma-si-go pyeon-ha-ge su-da tteol-eo-yo. eo-tteon eum-sik joh-a-ha-se-yo?',
      vietnamese: 'Úi chà, hôm nay ai diện đồ mà bảnh bao/xinh lung linh thế này! Chói lóa cả mắt luôn á~ ✨ Buổi hẹn đầu tiên nên đừng căng thẳng nha, cứ thoải mái trò chuyện cùng tui nè. Bạn thích ăn món gì nào?',
      suggestedReplies: [
        {
          korean: '너랑 같이 먹으면 라면도 스테이크 맛이 날 것 같아~',
          vietnamese: 'Đi ăn cùng bạn thì ăn mì gói cũng thấy ngon như bít tết á~'
        },
        {
          korean: '한국 드라마처럼 한강에서 치맥(치킨+맥주) 할래요?',
          vietnamese: 'Làm giống phim Hàn đi hóng gió sông Hàn ăn gà rán uống bia nha?'
        },
        {
          korean: '혹시 길 좀 알려줄래? 네 마음으로 가는 길! ㅋㅋㅋ',
          vietnamese: 'Chỉ tui đường đi được hông? Đường đi thẳng vào tim bạn á! ㅋㅋㅋ'
        }
      ]
    }
  },

  // 5. NHÀ HÀNG THỊT NƯỚNG & MUKBANG SÔI ĐỘNG
  {
    id: 'restaurant',
    title: 'Nhà hàng thịt nướng & Mukbang sôi động',
    koreanTitle: '맛있는 삼겹살 파티 & 먹방',
    icon: '🥓',
    badge: 'Ẩm thực & Mukbang',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Học cách gọi thịt nướng samgyeopsal, cuộn rau ssam chuẩn người sành ăn và giao lưu cùng chủ quán.',
    initialMessage: {
      korean: '어서오십쇼! 불판 달궈놨습니다! 지글지글 삼겹살 냄새 죽이지요? 몇 인분으로 시작하실랍니까, 손님?!',
      romanization: 'eo-seo-o-sip-syo! bul-pan dal-gwo-nwat-seum-ni-da! ji-geul-ji-geul sam-gyeop-sal naem-sae juk-i-ji-yo? myeot in-bun-eu-ro si-jak-ha-sil-rap-ni-kka, son-nim?!',
      vietnamese: 'Kính chào quý khách! Bếp than đã đỏ rực, vỉ nướng sẵn sàng rồi đây! Mùi thịt ba chỉ xèo xèo thơm nức mũi chịu sao nổi đúng hông? Bàn mình khởi động mấy phần trước đây ạ?!',
      suggestedReplies: [
        {
          korean: '일단 삼겹살 3인분하고 된장찌개 하나 먼저 주세요!',
          vietnamese: 'Trước mắt cứ cho 3 phần thịt ba chỉ với 1 nồi canh đậu tương nha chú!'
        },
        {
          korean: '사장님, 고기 맛있게 쌈 싸먹는 꿀팁 좀 알려주세요!',
          vietnamese: 'Chú ơi, chỉ con bí kíp cuộn rau thịt nướng sao cho chuẩn sành ăn với!'
        },
        {
          korean: '여기 김치랑 마늘 무한 리필 되나요? 너무 맛있어요!',
          vietnamese: 'Ở đây kim chi với tỏi có được gọi thêm tẹt ga hông ạ? Ngon đỉnh chóp!'
        }
      ]
    }
  },

  // 6. GỌI ĐỒ TẠI QUÁN CÀ PHÊ HONGDAE
  {
    id: 'cafe',
    title: 'Gọi đồ tại quán cà phê Hongdae',
    koreanTitle: '홍대 감성 카페에서 주문하기',
    icon: '☕',
    badge: 'Đời sống',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Tập gọi Americano đá (Ah-Ah), trà đào, xin mật ong, mật khẩu wifi và chụp hình check-in sống ảo.',
    initialMessage: {
      korean: '안녕하세요! 홍대 힙한 카페에 오신 걸 환영해요~ 한국인들의 소울 드링크 "얼죽아(얼어 죽어도 아이스 아메리카노)" 드실래요, 아니면 달콤한 시그니처 라떼로 드릴까요?',
      romanization: 'an-nyeong-ha-se-yo! hong-dae hip-han ka-pe-e o-sin geol hwan-yeong-hae-yo~ han-guk-in-deul-ui so-ul deu-ring-keu "eol-juk-a" deu-sil-rae-yo, a-ni-myeon dal-kom-han si-geu-ni-cheo ra-tte-ro deu-ril-kka-yo?',
      vietnamese: 'Xin chào bạn! Chào mừng bạn đến quán cà phê phong cách Hongdae cực chill~ Bạn muốn thử "thức uống quốc dân" 얼죽아 (trời rét căm căm vẫn uống Americano đá) hay một ly latte sữa ngọt ngào signature đây?',
      suggestedReplies: [
        {
          korean: '얼죽아 한 잔 샷 추가해서 시원하게 주세요!',
          vietnamese: 'Cho mình 1 ly Americano đá thêm shot đậm đà giải nhiệt nha!'
        },
        {
          korean: '여기 와이파이 비밀번호랑 화장실 어디예요?',
          vietnamese: 'Cho mình hỏi pass wifi với nhà vệ sinh ở đâu vậy bạn?'
        },
        {
          korean: '사진 잘 나오는 명당자리 어디예요? 인생샷 찍고 싶어요!',
          vietnamese: 'Góc nào chụp hình sống ảo đẹp nhất quán vậy chỉ mình với!'
        }
      ]
    }
  },

  // 7. MUA SẮM & MẶC CẢ MYEONGDONG
  {
    id: 'shopping',
    title: 'Mua sắm & Mặc cả sành điệu Myeongdong',
    koreanTitle: '명동 쇼핑 & 알뜰 흥정하기',
    icon: '🛍️',
    badge: 'Mua sắm',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Hỏi giá áo quần, xin thử đồ, mặc cả dễ thương để được giảm giá hoặc tặng quà kèm (service).',
    initialMessage: {
      korean: '어서오세요~ 눈썰미 대박이시네요! 방금 고르신 옷이 지금 명동에서 가장 핫한 아이템이에요! 입어보시면 진짜 모델 핏 나옵니다!',
      romanization: 'eo-seo-o-se-yo~ nun-sseol-mi dae-bak-i-si-ne-yo! bang-geum go-reu-sin ot-i ji-geum myeong-dong-e-seo ga-jang hat-han a-i-tem-i-e-yo! ib-eo-bo-si-myeon jin-jja mo-del pit na-om-ni-da!',
      vietnamese: 'Mời vào mời vào ạ~ Mắt nhìn của bạn đỉnh thật đấy! Mẫu bạn vừa nhắm trúng là hot trend số 1 Myeongdong tuần này luôn đó! Mặc lên người là chuẩn dáng người mẫu luôn!',
      suggestedReplies: [
        {
          korean: '사장님 너무 말씀 예쁘게 하시네요! 조금만 깎아주세요~ ㅋㅋㅋ',
          vietnamese: 'Chủ tiệm khéo ăn khéo nói ghê á! Bớt cho em chút lộc nha~ ㅋㅋㅋ'
        },
        {
          korean: '이거 사고 친구 것도 사면 서비스 뭐 줘요?',
          vietnamese: 'Em mua cái này rồi mua thêm cho bạn nữa thì có quà khuyến mãi gì hông?'
        },
        {
          korean: '혹시 다른 색상이나 더 큰 사이즈도 입어볼 수 있나요?',
          vietnamese: 'Em thử màu khác hoặc size to hơn một chút được không ạ?'
        }
      ]
    }
  },

  // 8. HÓA THÂN VÀO PHIM TRUYỀN HÌNH K-DRAMA
  {
    id: 'kdrama',
    title: 'Hóa thân vào phim truyền hình K-Drama',
    koreanTitle: 'K-드라마 명대사 & 상황극',
    icon: '🎬',
    badge: 'Hóa thân diễn xuất',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Thử tài nhập vai diễn xuất cùng AI qua các cảnh phim tổng tài, xuyên không hoặc tình cảm sướt mướt.',
    initialMessage: {
      korean: '레디~ 액션! 🎬 "당신... 왜 내 눈앞에 자꾸 나타나는 겁니까? 신경 쓰이게!" 자, 이 드라마틱한 대사에 당신은 어떻게 받아칠 건가요?!',
      romanization: 're-di~ aek-syeon! 🎬 "dang-sin... wae nae nun-ap-e ja-kku na-ta-na-neun geom-ni-kka? sin-gyeong sseu-i-ge!" ja, i deu-ra-ma-tik-han dae-sa-e dang-sin-eun eo-tteo-ke bad-a-chil geon-ga-yo?!',
      vietnamese: 'Chuẩn bị~ Diễn! 🎬 "Cô/Anh kia... Tại sao cứ liên tục lởn vởn trước mắt tôi thế hả? Làm người ta bận tâm muốn chết!" Nào, trước lời thoại tổng tài kịch tính này, bạn sẽ đáp trả thế nào đây?!',
      suggestedReplies: [
        {
          korean: '신경 쓰이라고 나타난 건데요? 왜요, 반하셨어요?',
          vietnamese: 'Cố tình xuất hiện cho anh bận tâm đấy? Sao nào, đổ tui rồi à?'
        },
        {
          korean: '제가 나타난 게 아니라 그쪽이 저만 쳐다보고 계셨잖아요!',
          vietnamese: 'Đâu phải em xuất hiện, mà do anh cứ dán mắt nhìn mỗi mình em thôi chứ!'
        },
        {
          korean: '감독님! 이 대사 너무 오글거려요! 다시 찍어요 ㅋㅋㅋ',
          vietnamese: 'Đạo diễn ơi! Câu thoại này sến rện nổi da gà luôn á! Quay lại đi ㅋㅋㅋ'
        }
      ]
    }
  },

  // 9. PHỎNG VẤN XIN VIỆC THÔNG MINH & DÍ DỎM
  {
    id: 'job_interview',
    title: 'Phỏng vấn xin việc dí dỏm & thông minh',
    koreanTitle: '센스 만점 한국 기업 면접',
    icon: '💼',
    badge: 'Phỏng vấn & Công sở',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Rèn luyện phản xạ đối đáp phỏng vấn bằng tiếng Hàn, vừa tự tin đĩnh đạc vừa có duyên.',
    initialMessage: {
      korean: '지원자님 환영합니다! 긴장 푸시고 편하게 말씀하세요. 우리 회사에 지원하신 아주 솔직하고 기발한 이유가 있을까요?',
      romanization: 'ji-won-ja-nim hwan-yeong-ham-ni-da! gin-jang pu-si-go pyeon-ha-ge mal-sseum-ha-se-yo. u-ri hoe-sa-e ji-won-ha-sin a-ju sol-jik-ha-go gi-bal-han i-yu-ga iss-eul-kka-yo?',
      vietnamese: 'Nhiệt liệt chào mừng ứng viên! Bạn cứ thả lỏng tinh thần nhé. Bạn có thể chia sẻ một lý do thật lòng và độc đáo nhất khiến bạn muốn đầu quân cho công ty chúng tôi không?',
      suggestedReplies: [
        {
          korean: '회사의 복지와 점심 메뉴가 너무 맛있어 보여서 지원했습니다! (웃음)',
          vietnamese: 'Dạ vì thấy phúc lợi công ty xịn với thực đơn cơm trưa ngon quá ạ! (cười)'
        },
        {
          korean: '제 열정과 한국어 실력을 발휘해 회사 매출을 2배로 올리겠습니다!',
          vietnamese: 'Bằng nhiệt huyết và tiếng Hàn của mình, tôi sẽ cùng nâng gấp đôi doanh số công ty!'
        },
        {
          korean: '야근도 칼퇴도 모두 긍정적인 에너지로 해낼 자신이 있습니다!',
          vietnamese: 'Dù tăng ca hay về đúng giờ, tôi đều tự tin hoàn thành bằng năng lượng tích cực nhất!'
        }
      ]
    }
  },

  // 10. HỎI ĐƯỜNG & DU LỊCH BỤI SEOUL / BUSAN
  {
    id: 'directions',
    title: 'Hỏi đường & Du lịch bụi Seoul / Busan',
    koreanTitle: '서울·부산 신나는 길 찾기',
    icon: '🚊',
    badge: 'Du lịch thực tế',
    isVipOnly: false,
    levelCategory: 'free',
    description: 'Hỏi đường tàu điện ngầm, xe buýt, nạp thẻ T-Money và tìm những điểm ăn chơi ẩn giấu của người bản xứ.',
    initialMessage: {
      korean: '길을 잃으셨나요? 걱정 마세요! 제가 인간 내비게이션입니다~ 어디로 가고 싶으세요? 부산 해운대? 서울 남산타워?',
      romanization: 'gil-eul ilh-eu-syeot-na-yo? geok-jeong ma-se-yo! je-ga in-gan nae-bi-ge-i-syeon-im-ni-da~ eo-di-ro ga-go sip-eu-se-yo? bu-san hae-un-dae? seoul nam-san-ta-wo?',
      vietnamese: 'Bạn bị lạc đường hả? Đừng lo lắng chi hết, có "Google Map chạy bằng cơm" ở đây rồi nè~ Bạn muốn đi đâu nào? Bãi biển Haeundae Busan hay Tháp Namsan Seoul?',
      suggestedReplies: [
        {
          korean: '지하철 타고 가장 빠르게 가는 방법 좀 알려주세요!',
          vietnamese: 'Chỉ mình cách đi tàu điện ngầm nhanh nhất đến đó với!'
        },
        {
          korean: '티머니 카드 잔액이 부족한데 어디서 충전해요?',
          vietnamese: 'Thẻ T-money của mình hết tiền rồi nạp ở đâu vậy bạn?'
        },
        {
          korean: '관광객 말고 현지인들이 자주 가는 진짜 맛집 추천해줘요!',
          vietnamese: 'Chỉ mình quán ăn ngon chuẩn người bản địa hay ăn đi chứ đừng chỉ quán du lịch!'
        }
      ]
    }
  }
];
