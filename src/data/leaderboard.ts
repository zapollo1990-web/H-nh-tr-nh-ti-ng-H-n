import { LeaderboardEntry } from '../types';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    rank: 1,
    name: 'Kim Min-ah (김민아)',
    avatar: '🌸',
    xp: 2840,
    streak: 28,
    league: 'Kim Cương',
    change: 'same'
  },
  {
    id: 'lb-2',
    rank: 2,
    name: 'Hương Giang',
    avatar: '🦊',
    xp: 2610,
    streak: 21,
    league: 'Kim Cương',
    change: 'up'
  },
  {
    id: 'lb-3',
    rank: 3,
    name: 'Park Seo-jun',
    avatar: '🐯',
    xp: 2450,
    streak: 19,
    league: 'Kim Cương',
    change: 'down'
  },
  {
    id: 'lb-4',
    rank: 4,
    name: 'Tuấn Kiệt',
    avatar: '🐼',
    xp: 1980,
    streak: 14,
    league: 'Vàng',
    change: 'up'
  },
  {
    id: 'user-self',
    rank: 5,
    name: 'Bạn (Người học)',
    avatar: '⭐',
    xp: 1420,
    streak: 5,
    league: 'Vàng',
    isUser: true,
    change: 'up'
  },
  {
    id: 'lb-6',
    rank: 6,
    name: 'Linh Chi',
    avatar: '🐰',
    xp: 1390,
    streak: 9,
    league: 'Vàng',
    change: 'down'
  },
  {
    id: 'lb-7',
    rank: 7,
    name: 'Lee Dong-wook',
    avatar: '🦁',
    xp: 1120,
    streak: 7,
    league: 'Bạc',
    change: 'same'
  },
  {
    id: 'lb-8',
    rank: 8,
    name: 'Thanh Thảo',
    avatar: '🐥',
    xp: 980,
    streak: 4,
    league: 'Bạc',
    change: 'up'
  },
  {
    id: 'lb-9',
    rank: 9,
    name: 'Hữu Phước',
    avatar: '🐨',
    xp: 850,
    streak: 3,
    league: 'Đồng',
    change: 'same'
  },
  {
    id: 'lb-10',
    rank: 10,
    name: 'Minh Khang',
    avatar: '🐸',
    xp: 720,
    streak: 2,
    league: 'Đồng',
    change: 'down'
  }
];

export const MOTIVATIONAL_QUOTES = [
  {
    korean: '시작이 반이다.',
    romanization: 'si-jak-i ban-i-da',
    vietnamese: 'Khởi đầu là đã hoàn thành một nửa chặng đường.'
  },
  {
    korean: '티끌 모아 태산.',
    romanization: 'ti-kkeul mo-a tae-san',
    vietnamese: 'Tích tiểu thành đại (Gom từng hạt cát thành núi Thái Sơn).'
  },
  {
    korean: '천 리 길도 한 걸음부터.',
    romanization: 'cheon ri gil-do han geol-eum-bu-teo',
    vietnamese: 'Đường xa nghìn dặm cũng bắt đầu từ một bước chân.'
  },
  {
    korean: '오늘도 파이팅!',
    romanization: 'o-neul-do pa-i-ting!',
    vietnamese: 'Hôm nay cũng cố lên nhé (Fighting)!'
  },
  {
    korean: '꾸준함이 최고의 재능이다.',
    romanization: 'kku-jun-ham-i choe-go-ui jae-neung-i-da',
    vietnamese: 'Sự kiên trì, bền bỉ chính là tài năng tuyệt vời nhất.'
  }
];
