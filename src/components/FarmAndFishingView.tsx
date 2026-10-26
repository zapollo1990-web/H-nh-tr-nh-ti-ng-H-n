import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CROPS_DATA,
  FISH_SPECIES_DATA,
  WEATHER_CONFIGS,
  FARM_FISHING_SHOP_ITEMS,
  FARM_FISHING_LEADERBOARD,
  FISHING_CHALLENGES,
} from '../data/farmAndFishing';
import { ANIMALS_PLANTS_VOCAB } from '../data/animalsPlantsVocab';
import { CropType, FarmPlot, FishSpecies, WeatherType } from '../types';
import {
  Fish,
  Sprout,
  Coins,
  Sparkles,
  Volume2,
  Droplet,
  CheckCircle2,
  ShoppingBag,
  Share2,
  Target,
  Trophy,
  Swords,
  CloudRain,
  Sun,
  CloudSnow,
  CloudFog,
  Flame,
  Shield,
  Award,
  RefreshCw,
  Gift,
  Package,
  Check,
  Zap,
} from 'lucide-react';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playIncorrectSound,
  playHookShotSound,
  playHookHitSound,
  playSplashSound,
  playPlantSeedSound,
  playFanfareSound,
} from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';

interface FarmAndFishingViewProps {
  onAddXp: (amount: number) => void;
  onShareToFeed?: (contentKo: string, contentVi: string, type: string) => void;
}

const STORAGE_FARM_KEY = 'korean_journey_farm_plots_v2';
const STORAGE_INVENTORY_KEY = 'korean_journey_game_inv_v1';

// Additional treasure chest for Gold Miner game
const GOLDEN_TREASURE: FishSpecies = {
  id: 'treasure-chest',
  nameKo: '황금 보물상자',
  nameVi: 'Rương vàng kho báu hoàng gia',
  romanization: 'hwang-geum bo-mul-sang-ja',
  emoji: '🪙💎',
  rarity: 'legendary',
  xpReward: 120,
  coinReward: 200,
  descriptionVi: 'Rương chứa đầy vàng bạc châu báu chìm dưới đáy biển sâu Busan từ thời kỳ Joseon!',
  habitKo: '깊은 바다 밑바닥에 숨겨진 보물상자!',
  speed: 0.8,
};

const ALL_FISHING_TARGETS: FishSpecies[] = [...FISH_SPECIES_DATA, GOLDEN_TREASURE];

// Swimming Fish Instance for Gold Miner Canvas/Engine
interface SwimmingFish {
  instanceId: string;
  species: FishSpecies;
  x: number;
  y: number;
  vx: number;
  direction: 1 | -1;
  depthLayer: 'shallow' | 'mid' | 'deep';
  width: number;
  height: number;
  radius: number;
  weight: number;
  bobPhase: number;
}

// Weather Particle for Canvas visual effects
interface WeatherParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
  drift: number;
}

// PvP Companion Rivals
interface PvpRival {
  id: string;
  name: string;
  title: string;
  avatar: string;
  difficulty: 'easy' | 'medium' | 'hard';
  speedMs: number; // how often rival scores
  pointsPerTick: number;
  cheerQuotes: string[];
}

const PVP_RIVALS: PvpRival[] = [
  {
    id: 'pororo',
    name: 'Pororo 꼬마 펭귄',
    title: 'Cần thủ Băng Tuyết Nam Cực',
    avatar: '🐧',
    difficulty: 'medium',
    speedMs: 3800,
    pointsPerTick: 120,
    cheerQuotes: [
      '노는 게 제일 좋아! Tớ vừa câu trúng cá lớn rồi!',
      'Gió lạnh thổi qua, mẻ cá tuyết đang cắn câu liên tục!',
      'Cố lên bạn ơi, tớ đang tăng tốc đấy!',
    ],
  },
  {
    id: 'crong',
    name: 'Crong 꼬마 공룡',
    title: 'Khủng long Câu Cá Bờ Biển',
    avatar: '🦖',
    difficulty: 'easy',
    speedMs: 4500,
    pointsPerTick: 100,
    cheerQuotes: [
      '크롱 크롱! Crong tìm thấy tôm hùm khổng lồ!',
      'Nông trại thơm lừng mùi bắp cải chín ngọt!',
      'Crong chuẩn bị thu hoạch thêm 1 giỏ củ cải nữa!',
    ],
  },
  {
    id: 'loopy',
    name: 'Loopy 비버',
    title: 'Phù Thủy Làm Vườn Trái Cây',
    avatar: '🌸',
    difficulty: 'hard',
    speedMs: 3200,
    pointsPerTick: 140,
    cheerQuotes: [
      'Vườn dâu tây pha lê của Loopy vừa nở hoa tuyệt đẹp!',
      'Loopy vừa thu hoạch được dưa hấu sấm sét siêu hiếm!',
      'Tập trung nha, tớ sắp cán mốc điểm số cao kỷ lục rồi!',
    ],
  },
  {
    id: 'poby',
    name: 'Poby 북극곰',
    title: 'Thần Ngư Biển Sâu Busan',
    avatar: '🐻‍❄️',
    difficulty: 'medium',
    speedMs: 3600,
    pointsPerTick: 130,
    cheerQuotes: [
      'Poby luôn kiên nhẫn câu cá voi xanh Ulsan!',
      'Biển lặng sóng êm, cá chép rồng đang bơi tới!',
      'Một mẻ lưới đầy ắp K-Coins cho cả hai chúng ta!',
    ],
  },
];

export const FarmAndFishingView: React.FC<FarmAndFishingViewProps> = ({
  onAddXp,
  onShareToFeed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fishing' | 'farm'>('fishing');

  // -------------------------------------------------------------
  // 1. CURRENCY & SHOP INVENTORY STATE (K-COINS PERSISTENCE)
  // -------------------------------------------------------------
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_coins`);
    return saved ? parseInt(saved, 10) : 180;
  });

  const [fishInventory, setFishInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_fish`);
    return saved ? JSON.parse(saved) : {};
  });

  const [cropInventory, setCropInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_crop`);
    return saved ? JSON.parse(saved) : {};
  });

  // Shop Equipped Gear
  const [equippedRod, setEquippedRod] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_INVENTORY_KEY}_rod`) || 'rod-bamboo';
  });
  const [ownedRods, setOwnedRods] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_owned_rods`);
    return saved ? JSON.parse(saved) : ['rod-bamboo'];
  });

  const [equippedHook, setEquippedHook] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_INVENTORY_KEY}_hook`) || null;
  });
  const [ownedHooks, setOwnedHooks] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_owned_hooks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedBait, setEquippedBait] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_INVENTORY_KEY}_bait`) || null;
  });
  const [baitCounts, setBaitCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_baits`);
    return saved ? JSON.parse(saved) : { 'bait-worm': 8 };
  });

  const [toolCounts, setToolCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_tools`);
    return saved ? JSON.parse(saved) : {};
  });

  // Active farm fertilizer boost (+60% coin bonus for next 3 harvests)
  const [fertilizerCharges, setFertilizerCharges] = useState<number>(0);

  // Bonus mutant seeds bag
  const [mutantSeedBag, setMutantSeedBag] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_mutant_seeds`);
    return saved ? JSON.parse(saved) : ['crop-mutant-thunder-subak'];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_coins`, coins.toString());
  }, [coins]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_fish`, JSON.stringify(fishInventory));
  }, [fishInventory]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_crop`, JSON.stringify(cropInventory));
  }, [cropInventory]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_rod`, equippedRod);
  }, [equippedRod]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_owned_rods`, JSON.stringify(ownedRods));
  }, [ownedRods]);
  useEffect(() => {
    if (equippedHook) localStorage.setItem(`${STORAGE_INVENTORY_KEY}_hook`, equippedHook);
    else localStorage.removeItem(`${STORAGE_INVENTORY_KEY}_hook`);
  }, [equippedHook]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_owned_hooks`, JSON.stringify(ownedHooks));
  }, [ownedHooks]);
  useEffect(() => {
    if (equippedBait) localStorage.setItem(`${STORAGE_INVENTORY_KEY}_bait`, equippedBait);
    else localStorage.removeItem(`${STORAGE_INVENTORY_KEY}_bait`);
  }, [equippedBait]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_baits`, JSON.stringify(baitCounts));
  }, [baitCounts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_tools`, JSON.stringify(toolCounts));
  }, [toolCounts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_mutant_seeds`, JSON.stringify(mutantSeedBag));
  }, [mutantSeedBag]);

  // -------------------------------------------------------------
  // 2. WEATHER SYSTEM (THỜI TIẾT BIẾN DỊ THEO MÙA)
  // -------------------------------------------------------------
  const [currentWeather, setCurrentWeather] = useState<WeatherType>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_weather`);
    return (saved as WeatherType) || 'rainy';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_weather`, currentWeather);
  }, [currentWeather]);

  const weatherConfig = WEATHER_CONFIGS[currentWeather] || WEATHER_CONFIGS.sunny;

  // Manual Weather Change with Sound
  const handleSelectWeather = (w: WeatherType) => {
    playClickSound();
    setCurrentWeather(w);
    // Trigger fish army re-init with new weather mutants
    setTimeout(() => {
      initFishArmy(canvasDim.width, canvasDim.height);
    }, 50);
  };

  // -------------------------------------------------------------
  // 3. MODALS VISIBILITY (SHOP, LEADERBOARD, PVP, 5-VOCAB QUEST)
  // -------------------------------------------------------------
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'rod' | 'hook' | 'bait' | 'tool'>('rod');

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'fish' | 'farm'>('all');

  const [isPvpOpen, setIsPvpOpen] = useState(false);
  const [pvpState, setPvpState] = useState<'select' | 'battle' | 'result'>('select');
  const [selectedRival, setSelectedRival] = useState<PvpRival>(PVP_RIVALS[0]);
  const [pvpTimeLeft, setPvpTimeLeft] = useState(60);
  const [userPvpScore, setUserPvpScore] = useState(0);
  const [rivalPvpScore, setRivalPvpScore] = useState(0);
  const [pvpChallengeIndex, setPvpChallengeIndex] = useState(0);
  const [pvpBattleLog, setPvpBattleLog] = useState<string[]>([]);
  const [pvpFeedback, setPvpFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const [isVocabQuestOpen, setIsVocabQuestOpen] = useState(false);
  const [vocabQuestIndex, setVocabQuestIndex] = useState(0);
  const [vocabQuestScore, setVocabQuestScore] = useState(0);
  const [vocabQuestAnswered, setVocabQuestAnswered] = useState(false);
  const [vocabQuestFeedback, setVocabQuestFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [vocabQuestCompleted, setVocabQuestCompleted] = useState(false);

  // Pick 5 random vocabulary questions for the Quest
  const questQuestions = useMemo(() => {
    const list = [...ANIMALS_PLANTS_VOCAB];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 5);
  }, [isVocabQuestOpen]);

  // Audio pronunciation helper
  const handlePronounce = (text: string) => {
    speakKorean(text, 0.85);
  };

  // -------------------------------------------------------------
  // 4. GOLD MINER FISHING GAME ENGINE (CÂU CÁ ĐÀO VÀNG + BIẾN DỊ)
  // -------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hook Physics State
  const [hookState, setHookState] = useState<
    'swinging' | 'shooting' | 'reeling_empty' | 'reeling_caught'
  >('swinging');
  const hookAngleRef = useRef<number>(0);
  const hookLengthRef = useRef<number>(40);
  const hookDirectionRef = useRef<number>(1);
  const hookStateRef = useRef<'swinging' | 'shooting' | 'reeling_empty' | 'reeling_caught'>('swinging');
  const hookedFishRef = useRef<SwimmingFish | null>(null);

  // Catch celebration modal
  const [caughtModalFish, setCaughtModalFish] = useState<FishSpecies | null>(null);
  const [sessionCatchCount, setSessionCatchCount] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [shareSuccessNotice, setShareSuccessNotice] = useState(false);
  const [quickBonusQuestion, setQuickBonusQuestion] = useState<{
    promptKo: string;
    promptVi: string;
    options: string[];
    correctIndex: number;
    answered: boolean;
    isCorrect: boolean;
  } | null>(null);

  // Swimming fish list in the sea
  const fishListRef = useRef<SwimmingFish[]>([]);

  // Weather animated particles
  const weatherParticlesRef = useRef<WeatherParticle[]>([]);

  // Canvas Dimensions
  const [canvasDim, setCanvasDim] = useState({ width: 720, height: 460 });

  // Update canvas sizing responsively
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(840, Math.max(340, containerRef.current.clientWidth));
        const h = Math.max(440, Math.min(520, Math.floor(w * 0.65)));
        setCanvasDim({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize abundant swimming fish including Weather Mutants!
  const initFishArmy = useCallback(
    (width: number, height: number) => {
      const newFish: SwimmingFish[] = [];
      const totalCount = 15;

      for (let i = 0; i < totalCount; i++) {
        let layer: 'shallow' | 'mid' | 'deep' = 'shallow';
        let yMin = 100;
        let yMax = 180;

        if (i >= 5 && i < 11) {
          layer = 'mid';
          yMin = 190;
          yMax = 290;
        } else if (i >= 11) {
          layer = 'deep';
          yMin = 300;
          yMax = height - 50;
        }

        // Candidates selection based on depth and current weather
        let candidates = ALL_FISHING_TARGETS;
        if (layer === 'shallow') {
          candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'common');
        } else if (layer === 'mid') {
          candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'rare');
        } else {
          // Deep layer spawns Legendary, Treasure, and WEATHER MUTANT FISH!
          const mutantCandidates = ALL_FISHING_TARGETS.filter(
            (f) => f.isMutant && (f.weatherRequirement === currentWeather || equippedBait === 'bait-rainbow')
          );
          if (mutantCandidates.length > 0 && Math.random() > 0.3) {
            candidates = mutantCandidates;
          } else {
            candidates = ALL_FISHING_TARGETS.filter(
              (f) => f.rarity === 'legendary' || f.id === 'treasure-chest' || f.isMutant
            );
          }
        }
        if (candidates.length === 0) candidates = ALL_FISHING_TARGETS;

        const species = candidates[Math.floor(Math.random() * candidates.length)];
        const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const speed = (0.6 + Math.random() * 1.2) * (species.speed || 1);

        let weight = 1.0;
        if (species.rarity === 'rare') weight = 1.5;
        if (species.rarity === 'legendary') weight = 2.4;
        if (species.isMutant) weight = 2.0;
        if (species.id === 'fish-legend-whale' || species.id === 'treasure-chest') weight = 3.0;

        const radius = species.rarity === 'legendary' || species.isMutant ? 34 : species.rarity === 'rare' ? 26 : 20;

        newFish.push({
          instanceId: `fish-${i}-${Date.now()}-${Math.random()}`,
          species,
          x: Math.random() * (width - 80) + 40,
          y: yMin + Math.random() * (yMax - yMin),
          vx: dir * speed,
          direction: dir,
          depthLayer: layer,
          width: radius * 2.2,
          height: radius * 1.6,
          radius,
          weight,
          bobPhase: Math.random() * Math.PI * 2,
        });
      }

      fishListRef.current = newFish;

      // Initialize weather particles
      const particles: WeatherParticle[] = [];
      const pCount = currentWeather === 'rainy' ? 45 : currentWeather === 'snowy' ? 35 : 15;
      for (let p = 0; p < pCount; p++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: currentWeather === 'rainy' ? 7 + Math.random() * 6 : 1.2 + Math.random() * 2,
          size: currentWeather === 'snowy' ? 2.5 + Math.random() * 3 : 1.5,
          drift: (Math.random() - 0.5) * 1.5,
        });
      }
      weatherParticlesRef.current = particles;
    },
    [currentWeather, equippedBait]
  );

  useEffect(() => {
    initFishArmy(canvasDim.width, canvasDim.height);
  }, [canvasDim.width, canvasDim.height, initFishArmy]);

  useEffect(() => {
    hookStateRef.current = hookState;
  }, [hookState]);

  // Shoot Hook Trigger
  const shootHook = useCallback(() => {
    if (hookStateRef.current !== 'swinging') return;
    setHookState('shooting');
    hookStateRef.current = 'shooting';
    playHookShotSound();
  }, []);

  // Spacebar / ArrowDown key to shoot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSubTab !== 'fishing') return;
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        if (!caughtModalFish && !isShopOpen && !isLeaderboardOpen && !isPvpOpen && !isVocabQuestOpen) {
          if (hookStateRef.current === 'swinging') {
            e.preventDefault();
            shootHook();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, caughtModalFish, isShopOpen, isLeaderboardOpen, isPvpOpen, isVocabQuestOpen, shootHook]);

  // Respawn single caught fish
  const respawnFish = useCallback(
    (width: number, height: number, layer: 'shallow' | 'mid' | 'deep') => {
      let yMin = 100;
      let yMax = 180;
      let candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'common');

      if (layer === 'mid') {
        yMin = 190;
        yMax = 290;
        candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'rare');
      } else if (layer === 'deep') {
        yMin = 300;
        yMax = height - 50;
        // Prioritize Weather Mutants matching weather
        const mutantList = ALL_FISHING_TARGETS.filter(
          (f) => f.isMutant && (f.weatherRequirement === currentWeather || equippedBait === 'bait-rainbow')
        );
        if (mutantList.length > 0 && Math.random() > 0.35) {
          candidates = mutantList;
        } else {
          candidates = ALL_FISHING_TARGETS.filter(
            (f) => f.rarity === 'legendary' || f.id === 'treasure-chest' || f.isMutant
          );
        }
      }
      if (candidates.length === 0) candidates = ALL_FISHING_TARGETS;

      const species = candidates[Math.floor(Math.random() * candidates.length)];
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const speed = (0.7 + Math.random() * 1.1) * (species.speed || 1);

      let weight = 1.0;
      if (species.rarity === 'rare') weight = 1.5;
      if (species.rarity === 'legendary') weight = 2.4;
      if (species.isMutant) weight = 2.0;
      if (species.id === 'fish-legend-whale' || species.id === 'treasure-chest') weight = 3.0;

      const radius = species.rarity === 'legendary' || species.isMutant ? 34 : species.rarity === 'rare' ? 26 : 20;

      return {
        instanceId: `fish-${Date.now()}-${Math.random()}`,
        species,
        x: dir === 1 ? -radius * 2 : width + radius * 2,
        y: yMin + Math.random() * (yMax - yMin),
        vx: dir * speed,
        direction: dir,
        depthLayer: layer,
        width: radius * 2.2,
        height: radius * 1.6,
        radius,
        weight,
        bobPhase: Math.random() * Math.PI * 2,
      };
    },
    [currentWeather, equippedBait]
  );

  // Active Rod & Hook bonus stats
  const activeRod = useMemo(() => {
    return FARM_FISHING_SHOP_ITEMS.find((i) => i.id === equippedRod) || FARM_FISHING_SHOP_ITEMS[0];
  }, [equippedRod]);

  const activeHook = useMemo(() => {
    return FARM_FISHING_SHOP_ITEMS.find((i) => i.id === equippedHook);
  }, [equippedHook]);

  // Main Canvas Game Loop
  useEffect(() => {
    if (activeSubTab !== 'fishing') return;

    let animId: number;
    let lastTime = performance.now();

    const originX = canvasDim.width / 2;
    const originY = 46;
    const maxSwingAngle = 1.18;
    const swingSpeed = 1.6;
    const shootSpeed = 13;
    const baseReelSpeed = 9 * (activeRod.bonusStats?.reelSpeed || 1.0);

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvasDim.width, canvasDim.height);

      // --- 1. Weather-adapted Ocean Background Gradient ---
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvasDim.height);
      if (currentWeather === 'rainy') {
        oceanGrad.addColorStop(0, '#334155');
        oceanGrad.addColorStop(0.2, '#1e293b');
        oceanGrad.addColorStop(0.6, '#0f172a');
        oceanGrad.addColorStop(1, '#020617');
      } else if (currentWeather === 'snowy') {
        oceanGrad.addColorStop(0, '#93c5fd');
        oceanGrad.addColorStop(0.25, '#3b82f6');
        oceanGrad.addColorStop(0.65, '#1d4ed8');
        oceanGrad.addColorStop(1, '#0f172a');
      } else if (currentWeather === 'rainbow') {
        oceanGrad.addColorStop(0, '#f472b6');
        oceanGrad.addColorStop(0.25, '#38bdf8');
        oceanGrad.addColorStop(0.65, '#0284c7');
        oceanGrad.addColorStop(1, '#0f172a');
      } else if (currentWeather === 'foggy') {
        oceanGrad.addColorStop(0, '#94a3b8');
        oceanGrad.addColorStop(0.3, '#64748b');
        oceanGrad.addColorStop(0.7, '#334155');
        oceanGrad.addColorStop(1, '#0f172a');
      } else {
        // Sunny
        oceanGrad.addColorStop(0, '#38bdf8');
        oceanGrad.addColorStop(0.18, '#0284c7');
        oceanGrad.addColorStop(0.55, '#0369a1');
        oceanGrad.addColorStop(0.85, '#1e3a8a');
        oceanGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvasDim.width, canvasDim.height);

      // Sky Rainbow Arc on Rainbow Weather
      if (currentWeather === 'rainbow') {
        ctx.save();
        ctx.lineWidth = 4;
        const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
        rainbowColors.forEach((color, idx) => {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(canvasDim.width * 0.75, 45, 120 + idx * 5, Math.PI, Math.PI * 1.8);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Surface Water Foam / Waves
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      for (let x = 0; x <= canvasDim.width; x += 30) {
        const waveY = 40 + Math.sin(time * 0.003 + x * 0.05) * 4;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.lineTo(canvasDim.width, 50);
      ctx.lineTo(0, 50);
      ctx.fill();

      // Weather Particles Rendering (Rain / Snow / Fog)
      ctx.save();
      weatherParticlesRef.current.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvasDim.height) {
          p.y = 0;
          p.x = Math.random() * canvasDim.width;
        }
        if (p.x < 0) p.x = canvasDim.width;
        if (p.x > canvasDim.width) p.x = 0;

        if (currentWeather === 'rainy') {
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + 12);
          ctx.stroke();
        } else if (currentWeather === 'snowy') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (currentWeather === 'foggy') {
          ctx.fillStyle = 'rgba(226, 232, 240, 0.12)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Seabed Sand
      ctx.fillStyle = '#fde047';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(0, canvasDim.height - 18);
      ctx.bezierCurveTo(
        canvasDim.width * 0.3,
        canvasDim.height - 30,
        canvasDim.width * 0.7,
        canvasDim.height - 10,
        canvasDim.width,
        canvasDim.height - 22
      );
      ctx.lineTo(canvasDim.width, canvasDim.height);
      ctx.lineTo(0, canvasDim.height);
      ctx.fill();
      ctx.globalAlpha = 1;

      // --- 2. Update & Draw Swimming Fish ---
      fishListRef.current.forEach((fish) => {
        // Move horizontally
        fish.x += fish.vx;

        // Wrap around canvas edges
        if (fish.vx > 0 && fish.x > canvasDim.width + 60) {
          fish.x = -60;
        } else if (fish.vx < 0 && fish.x < -60) {
          fish.x = canvasDim.width + 60;
        }

        // Bob up and down gently
        const bobY = fish.y + Math.sin(time * 0.002 + fish.bobPhase) * 4;

        ctx.save();
        ctx.translate(fish.x, bobY);

        // Weather Mutant Fish Glowing Aura
        if (fish.species.isMutant) {
          ctx.save();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, fish.radius * 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Face movement direction
        if (fish.direction === -1) {
          ctx.scale(-1, 1);
        }

        // Draw fish emoji
        ctx.font = `${Math.floor(fish.radius * 1.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fish.species.emoji, 0, 0);

        // Small Korean name tag below fish
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = fish.species.isMutant ? '#fef08a' : fish.species.rarity === 'legendary' ? '#fde047' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(fish.species.nameKo, 0, fish.radius + 10);

        ctx.restore();
      });

      // --- 3. Hook Physics Update ---
      if (hookStateRef.current === 'swinging') {
        hookAngleRef.current += swingSpeed * dt * hookDirectionRef.current;
        if (hookAngleRef.current > maxSwingAngle) {
          hookAngleRef.current = maxSwingAngle;
          hookDirectionRef.current = -1;
        } else if (hookAngleRef.current < -maxSwingAngle) {
          hookAngleRef.current = -maxSwingAngle;
          hookDirectionRef.current = 1;
        }
      } else if (hookStateRef.current === 'shooting') {
        hookLengthRef.current += shootSpeed;

        const tipX = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
        const tipY = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;

        // Collision Check with Swimming Fish
        let hitFish: SwimmingFish | null = null;
        for (const fish of fishListRef.current) {
          const dx = fish.x - tipX;
          const dy = fish.y - tipY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < fish.radius + 12) {
            hitFish = fish;
            break;
          }
        }

        if (hitFish) {
          playHookHitSound();
          hookedFishRef.current = hitFish;
          hookStateRef.current = 'reeling_caught';
          setHookState('reeling_caught');
        } else if (
          tipY >= canvasDim.height - 15 ||
          tipX <= 15 ||
          tipX >= canvasDim.width - 15 ||
          hookLengthRef.current > canvasDim.height * 1.15
        ) {
          hookStateRef.current = 'reeling_empty';
          setHookState('reeling_empty');
        }
      } else if (
        hookStateRef.current === 'reeling_empty' ||
        hookStateRef.current === 'reeling_caught'
      ) {
        let actualReelSpeed = baseReelSpeed;
        if (hookedFishRef.current) {
          // Weight slows reel down, Titanium hook relieves weight penalty!
          const weightFactor = activeHook?.id === 'hook-steel' ? 0.75 : 1.0;
          actualReelSpeed = Math.max(3.2, baseReelSpeed / (hookedFishRef.current.weight * weightFactor));
        }

        hookLengthRef.current -= actualReelSpeed;

        if (hookLengthRef.current <= 40) {
          hookLengthRef.current = 40;
          const caught = hookedFishRef.current;
          hookedFishRef.current = null;
          hookStateRef.current = 'swinging';
          setHookState('swinging');

          if (caught) {
            playSplashSound();
            playFanfareSound();

            let rewardCoins = caught.species.coinReward;
            // Weather mutant bonus coins
            if (caught.species.isMutant) {
              rewardCoins = Math.round(rewardCoins * 1.25);
            }

            setCoins((c) => c + rewardCoins);
            onAddXp(caught.species.xpReward);

            // Consume 1 equipped bait on successful catch
            if (equippedBait && (baitCounts[equippedBait] || 0) > 0) {
              setBaitCounts((prev) => {
                const nextVal = (prev[equippedBait] || 1) - 1;
                return { ...prev, [equippedBait]: nextVal };
              });
            }

            setFishInventory((prev) => ({
              ...prev,
              [caught.species.id]: (prev[caught.species.id] || 0) + 1,
            }));

            setSessionCatchCount((c) => c + 1);
            setComboCount((c) => c + 1);
            setCaughtModalFish(caught.species);

            // Generate bonus pronunciation question
            setQuickBonusQuestion({
              promptKo: `"${caught.species.nameKo}"의 올바른 한국어 발음은?`,
              promptVi: `Phiên âm chuẩn của "${caught.species.nameKo}" (${caught.species.nameVi}) là gì?`,
              options: [
                caught.species.romanization,
                'kim-chi-jji-gae',
                'an-nyeong-ha-se-yo',
              ].sort(() => Math.random() - 0.5),
              correctIndex: 0,
              answered: false,
              isCorrect: false,
            });

            // Respawn that fish
            fishListRef.current = fishListRef.current
              .filter((f) => f.instanceId !== caught.instanceId)
              .concat([respawnFish(canvasDim.width, canvasDim.height, caught.depthLayer)]);
          }
        }
      }

      // --- 4. Draw Fishing Line & Hook ---
      const hx = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
      const hy = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;

      ctx.save();
      ctx.strokeStyle = activeRod.id === 'rod-golden' ? '#fbbf24' : '#cbd5e1';
      ctx.lineWidth = activeRod.id === 'rod-poseidon' ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Hook Claw graphic
      ctx.translate(hx, hy);
      ctx.rotate(hookAngleRef.current);

      ctx.fillStyle = activeHook?.id === 'hook-glow' ? '#34d399' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = activeHook?.id === 'hook-steel' ? '#94a3b8' : '#d97706';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-6, 8, 8, -Math.PI * 0.2, Math.PI * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, 8, 8, Math.PI * 0.4, Math.PI * 1.2);
      ctx.stroke();

      if (hookedFishRef.current) {
        const hFish = hookedFishRef.current;
        ctx.save();
        ctx.rotate(-hookAngleRef.current);
        ctx.font = `${Math.floor(hFish.radius * 1.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(hFish.species.emoji, 0, 8);
        ctx.restore();
      }

      ctx.restore();

      // --- 5. Draw Fisherman Boat & Character ---
      ctx.save();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(originX - 48, 16, 96, 26, [4, 4, 14, 14]);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚣‍♂️', originX, 22);

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    activeSubTab,
    canvasDim.width,
    canvasDim.height,
    currentWeather,
    activeRod,
    activeHook,
    equippedBait,
    baitCounts,
    onAddXp,
    respawnFish,
  ]);

  // Answer bonus question in Caught Modal
  const handleAnswerBonus = (opt: string) => {
    if (!quickBonusQuestion || quickBonusQuestion.answered || !caughtModalFish) return;
    const isCorrect = opt === caughtModalFish.romanization;
    if (isCorrect) {
      playSuccessSound();
      const bonusCoins = Math.round(caughtModalFish.coinReward * 0.5);
      setCoins((c) => c + bonusCoins);
      onAddXp(20);
      setQuickBonusQuestion((prev) =>
        prev ? { ...prev, answered: true, isCorrect: true } : null
      );
    } else {
      playIncorrectSound();
      setQuickBonusQuestion((prev) =>
        prev ? { ...prev, answered: true, isCorrect: false } : null
      );
    }
  };

  // -------------------------------------------------------------
  // 5. FARMING LOGIC (VƯỜN RAU CỦ & CÂY BIẾN DỊ THỜI TIẾT)
  // -------------------------------------------------------------
  const [plots, setPlots] = useState<FarmPlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_FARM_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, cropId: 'crop-baechu', stage: 'ready' },
      { id: 2, cropId: 'crop-mu', stage: 'growing', needsAction: 'water' },
      { id: 3, cropId: 'crop-mutant-thunder-subak', stage: 'growing', isWeatherMutant: true, needsAction: 'water' },
      { id: 4, cropId: null, stage: 'empty' },
      { id: 5, cropId: null, stage: 'empty' },
      { id: 6, cropId: null, stage: 'empty' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_FARM_KEY, JSON.stringify(plots));
  }, [plots]);

  const SEED_COST = 10;
  const [activeFarmQuizCrop, setActiveFarmQuizCrop] = useState<CropType | null>(null);
  const [activeFarmQuizPlotId, setActiveFarmQuizPlotId] = useState<number | null>(null);
  const [farmQuizFeedback, setFarmQuizFeedback] = useState<string | null>(null);
  const [mysteryRevealCrop, setMysteryRevealCrop] = useState<CropType | null>(null);
  const [isSeedPickerOpen, setIsSeedPickerOpen] = useState<number | null>(null);

  // Plant a specific crop or mystery seed
  const handlePlantSpecificSeed = (plotId: number, crop: CropType) => {
    const cost = crop.seedCost || SEED_COST;
    if (coins < cost) return;

    setCoins((c) => c - cost);
    playPlantSeedSound();

    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId) {
          return {
            ...p,
            cropId: crop.id,
            stage: 'seed',
            plantedAt: Date.now(),
            needsAction: 'water',
            isWeatherMutant: crop.isMutant,
          };
        }
        return p;
      })
    );
    setIsSeedPickerOpen(null);
  };

  // Quick Random Mystery Seed
  const handlePlantRandomSeed = (plotId: number) => {
    const randomCrop = CROPS_DATA[Math.floor(Math.random() * CROPS_DATA.length)];
    if (coins >= SEED_COST) {
      setCoins((c) => c - SEED_COST);
    }
    playPlantSeedSound();

    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId) {
          return {
            ...p,
            cropId: randomCrop.id,
            stage: 'seed',
            plantedAt: Date.now(),
            needsAction: 'water',
            isWeatherMutant: randomCrop.isMutant,
          };
        }
        return p;
      })
    );
  };

  // Plant All Empty Plots
  const handlePlantAllEmptyPlots = () => {
    const emptyCount = plots.filter((p) => p.stage === 'empty').length;
    if (emptyCount === 0) return;

    playPlantSeedSound();
    const totalCost = Math.min(coins, emptyCount * SEED_COST);
    setCoins((c) => Math.max(0, c - totalCost));

    setPlots((prev) =>
      prev.map((p) => {
        if (p.stage === 'empty') {
          const randomCrop = CROPS_DATA[Math.floor(Math.random() * CROPS_DATA.length)];
          return {
            ...p,
            cropId: randomCrop.id,
            stage: 'seed',
            plantedAt: Date.now(),
            needsAction: 'water',
            isWeatherMutant: randomCrop.isMutant,
          };
        }
        return p;
      })
    );
  };

  // Water Plot / Korean Quiz
  const handleWaterPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;
    setActiveFarmQuizPlotId(plot.id);
    setActiveFarmQuizCrop(crop);
    setFarmQuizFeedback(null);
  };

  // Submit Water Quiz
  const handleFarmQuizAnswer = (selectedIndex: number) => {
    if (!activeFarmQuizCrop || activeFarmQuizPlotId === null) return;

    if (selectedIndex === activeFarmQuizCrop.correctIndex) {
      playSuccessSound();
      speakKorean(activeFarmQuizCrop.nameKo);
      setMysteryRevealCrop(activeFarmQuizCrop);
      setFarmQuizFeedback(
        `Chính xác! ${activeFarmQuizCrop.nameVi} (${activeFarmQuizCrop.nameKo}) đã lớn nhanh và sẵn sàng thu hoạch! 🌱✨`
      );

      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
      } catch (_) {}

      setTimeout(() => {
        setPlots((prev) =>
          prev.map((p) => {
            if (p.id === activeFarmQuizPlotId) {
              return {
                ...p,
                stage: 'ready',
                needsAction: 'harvest',
              };
            }
            return p;
          })
        );
        setActiveFarmQuizCrop(null);
        setActiveFarmQuizPlotId(null);
        setFarmQuizFeedback(null);
        setMysteryRevealCrop(null);
      }, 1600);
    } else {
      playIncorrectSound();
      setFarmQuizFeedback('Chưa đúng rồi! Hãy thử suy nghĩ thêm một chút nhé!');
    }
  };

  // Harvest Plot
  const handleHarvestPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;

    playSuccessSound();
    speakKorean(crop.nameKo);

    let earnedCoins = crop.coinReward;
    if (fertilizerCharges > 0) {
      earnedCoins = Math.round(earnedCoins * 1.6);
      setFertilizerCharges((c) => c - 1);
    }
    if (crop.isMutant) {
      earnedCoins = Math.round(earnedCoins * 1.3);
    }

    setCoins((c) => c + earnedCoins);
    onAddXp(crop.xpReward);

    setCropInventory((prev) => ({
      ...prev,
      [crop.id]: (prev[crop.id] || 0) + 1,
    }));

    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plot.id) {
          return {
            ...p,
            cropId: null,
            stage: 'empty',
            needsAction: null,
            isWeatherMutant: false,
          };
        }
        return p;
      })
    );
  };

  // Harvest All Ready Plots
  const handleHarvestAll = () => {
    const readyPlots = plots.filter((p) => p.stage === 'ready');
    if (readyPlots.length === 0) return;

    playFanfareSound();
    let totalCoins = 0;
    let totalXp = 0;
    const addedCrops: Record<string, number> = {};

    readyPlots.forEach((p) => {
      const crop = CROPS_DATA.find((c) => c.id === p.cropId);
      if (crop) {
        let coin = crop.coinReward;
        if (fertilizerCharges > 0) {
          coin = Math.round(coin * 1.6);
        }
        if (crop.isMutant) {
          coin = Math.round(coin * 1.3);
        }
        totalCoins += coin;
        totalXp += crop.xpReward;
        addedCrops[crop.id] = (addedCrops[crop.id] || 0) + 1;
      }
    });

    if (fertilizerCharges > 0) {
      setFertilizerCharges(0);
    }

    setCoins((c) => c + totalCoins);
    onAddXp(totalXp);
    setCropInventory((prev) => {
      const updated = { ...prev };
      Object.entries(addedCrops).forEach(([cid, qty]) => {
        updated[cid] = (updated[cid] || 0) + qty;
      });
      return updated;
    });

    setPlots((prev) =>
      prev.map((p) =>
        p.stage === 'ready'
          ? { ...p, cropId: null, stage: 'empty', needsAction: null, isWeatherMutant: false }
          : p
      )
    );

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}
  };

  // Use Magic Tool in Farm
  const handleUseFarmTool = (toolId: string) => {
    if ((toolCounts[toolId] || 0) <= 0) return;
    playClickSound();

    if (toolId === 'tool-magic-water') {
      // Waters and grows all growing/seed plots to ready!
      setPlots((prev) =>
        prev.map((p) => {
          if (p.stage === 'seed' || p.stage === 'growing') {
            return { ...p, stage: 'ready', needsAction: 'harvest' };
          }
          return p;
        })
      );
      playSuccessSound();
      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch (_) {}
    } else if (toolId === 'tool-super-fertilizer') {
      setFertilizerCharges((prev) => prev + 6);
      playSuccessSound();
    } else if (toolId === 'tool-mutant-potion') {
      // Transforms first non-mutant planted crop into current weather mutant!
      const mutantCrop = CROPS_DATA.find(
        (c) => c.isMutant && (c.weatherRequirement === currentWeather || !c.weatherRequirement)
      ) || CROPS_DATA.find((c) => c.isMutant);

      if (mutantCrop) {
        setPlots((prev) => {
          let transformed = false;
          return prev.map((p) => {
            if (!transformed && p.cropId && p.stage !== 'empty') {
              transformed = true;
              return { ...p, cropId: mutantCrop.id, isWeatherMutant: true, stage: 'ready' };
            }
            return p;
          });
        });
        playFanfareSound();
        try {
          confetti({ particleCount: 60, spread: 80 });
        } catch (_) {}
      }
    }

    setToolCounts((prev) => ({
      ...prev,
      [toolId]: Math.max(0, (prev[toolId] || 1) - 1),
    }));
  };

  // -------------------------------------------------------------
  // 6. K-COINS SHOP PURCHASING & GEAR MANAGEMENT
  // -------------------------------------------------------------
  const handleBuyShopItem = (item: (typeof FARM_FISHING_SHOP_ITEMS)[0]) => {
    if (coins < item.price) return;
    playSuccessSound();
    setCoins((c) => c - item.price);

    if (item.type === 'rod') {
      if (!ownedRods.includes(item.id)) {
        setOwnedRods((prev) => [...prev, item.id]);
      }
      setEquippedRod(item.id);
    } else if (item.type === 'hook') {
      if (!ownedHooks.includes(item.id)) {
        setOwnedHooks((prev) => [...prev, item.id]);
      }
      setEquippedHook(item.id);
    } else if (item.type === 'bait') {
      const quantityToAdd = item.id === 'bait-worm' ? 10 : item.id === 'bait-shrimp' ? 5 : item.id === 'bait-hanwoo' ? 3 : 2;
      setBaitCounts((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + quantityToAdd,
      }));
      setEquippedBait(item.id);
    } else if (item.type === 'tool') {
      const quantityToAdd = item.id === 'tool-magic-water' ? 1 : item.id === 'tool-super-fertilizer' ? 5 : 3;
      setToolCounts((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + quantityToAdd,
      }));
    }
  };

  // -------------------------------------------------------------
  // 7. PVP 1V1 BATTLE LOGIC (CÂU CÁ & TRỒNG CÂY ĐỐI KHÁNG)
  // -------------------------------------------------------------
  // Start PvP Match
  const handleStartPvp = (rival: PvpRival) => {
    playClickSound();
    setSelectedRival(rival);
    setUserPvpScore(0);
    setRivalPvpScore(0);
    setPvpTimeLeft(60);
    setPvpChallengeIndex(0);
    setPvpBattleLog([`Trận đấu 1v1 bắt đầu với ${rival.name}! Hãy trả lời nhanh để câu cá và thu hoạch!`]);
    setPvpState('battle');
  };

  // PvP 60s countdown and rival dynamic scoring
  useEffect(() => {
    if (!isPvpOpen || pvpState !== 'battle') return;

    const timer = setInterval(() => {
      setPvpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPvpState('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Rival AI score interval
    const rivalTimer = setInterval(() => {
      if (Math.random() > 0.15) {
        const rivalGain = selectedRival.pointsPerTick + Math.floor(Math.random() * 30);
        setRivalPvpScore((r) => r + rivalGain);
        const quote = selectedRival.cheerQuotes[Math.floor(Math.random() * selectedRival.cheerQuotes.length)];
        setPvpBattleLog((prev) => [
          `${selectedRival.avatar} ${selectedRival.name}: "${quote}" (+${rivalGain}đ)`,
          ...prev.slice(0, 4),
        ]);
      }
    }, selectedRival.speedMs);

    return () => {
      clearInterval(timer);
      clearInterval(rivalTimer);
    };
  }, [isPvpOpen, pvpState, selectedRival]);

  // PvP Question Answering
  const currentPvpChallenge = FISHING_CHALLENGES[pvpChallengeIndex % FISHING_CHALLENGES.length];

  const handleAnswerPvp = (isCorrect: boolean) => {
    if (pvpFeedback) return;

    if (isCorrect) {
      playSuccessSound();
      const points = 150;
      setUserPvpScore((u) => u + points);
      setPvpFeedback({ text: `Chính xác! Câu trúng cá hiếm +${points} điểm!`, isCorrect: true });
      setPvpBattleLog((prev) => [`🎯 Bạn đã trả lời đúng và kéo được cá lớn! (+${points}đ)`, ...prev.slice(0, 4)]);
      try {
        confetti({ particleCount: 30, spread: 60 });
      } catch (_) {}
    } else {
      playIncorrectSound();
      setPvpFeedback({ text: 'Chưa đúng rồi! Nhanh tay câu tiếp nhé!', isCorrect: false });
    }

    setTimeout(() => {
      setPvpFeedback(null);
      setPvpChallengeIndex((i) => i + 1);
    }, 1100);
  };

  // PvP Victory Claim
  const handleClaimPvpReward = () => {
    playFanfareSound();
    const won = userPvpScore > rivalPvpScore;
    if (won) {
      setCoins((c) => c + 100);
      onAddXp(60);
      try {
        confetti({ particleCount: 70, spread: 90 });
      } catch (_) {}
    }
    setIsPvpOpen(false);
    setPvpState('select');
  };

  // -------------------------------------------------------------
  // 8. 5-VOCAB LEARNING QUEST (HỌC 5 TỪ VỰNG NHẬN HẠT HIẾM BIẾN DỊ)
  // -------------------------------------------------------------
  const currentQuestCard = questQuestions[vocabQuestIndex];

  const handleAnswerQuest = (selectedVi: string) => {
    if (vocabQuestAnswered || !currentQuestCard) return;
    setVocabQuestAnswered(true);

    const isMatch = selectedVi === currentQuestCard.vietnamese;
    if (isMatch) {
      playSuccessSound();
      speakKorean(currentQuestCard.hangul);
      setVocabQuestScore((s) => s + 1);
      setVocabQuestFeedback({ text: `Chính xác! "${currentQuestCard.hangul}" nghĩa là "${currentQuestCard.vietnamese}"! ✨`, isCorrect: true });
    } else {
      playIncorrectSound();
      setVocabQuestFeedback({
        text: `Chưa đúng rồi! "${currentQuestCard.hangul}" (${currentQuestCard.romanization}) nghĩa là "${currentQuestCard.vietnamese}".`,
        isCorrect: false,
      });
    }
  };

  const handleNextQuestCard = () => {
    playClickSound();
    setVocabQuestAnswered(false);
    setVocabQuestFeedback(null);

    if (vocabQuestIndex + 1 < questQuestions.length) {
      setVocabQuestIndex((i) => i + 1);
    } else {
      // Completed 5 cards!
      setVocabQuestCompleted(true);
      playFanfareSound();

      // Reward Weather Mutant Seed matching weather
      const matchingMutant = CROPS_DATA.find((c) => c.isMutant && c.weatherRequirement === currentWeather) ||
        CROPS_DATA.find((c) => c.isMutant) ||
        CROPS_DATA[0];

      setMutantSeedBag((prev) => [...prev, matchingMutant.id]);
      setCoins((c) => c + 80);
      onAddXp(50);

      try {
        confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
      } catch (_) {}
    }
  };

  // Share catch to social feed
  const handleShareCatch = () => {
    if (!caughtModalFish) return;
    if (onShareToFeed) {
      onShareToFeed(
        `부산 바다에서 ${caughtModalFish.nameKo}(${caughtModalFish.nameVi})를 낚았어요! 🎣✨`,
        `Mình vừa bắn trúng và kéo thành công ${caughtModalFish.nameVi} (${caughtModalFish.nameKo}) trong bến câu vàng Busan! +${caughtModalFish.coinReward} K-Coins!`,
        'fishing'
      );
      setShareSuccessNotice(true);
      setTimeout(() => setShareSuccessNotice(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="farm-and-fishing-container">
      {/* 1. HERO GAME HEADER WITH WEATHER SYSTEM & ACTION BUTTONS */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${weatherConfig.bgGradient} border border-sky-200/80 p-5 sm:p-6 shadow-sm transition-all duration-500`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-4xl shadow-md border-3 border-white">
                {weatherConfig.emoji}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-2xs">
                {currentWeather.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/80 text-slate-800 border border-slate-200 backdrop-blur-xs">
                  {weatherConfig.emoji} Thời tiết: {weatherConfig.nameVi} ({weatherConfig.nameKo})
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {weatherConfig.mutantFishBonus}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeSubTab === 'fishing'
                  ? 'Bến Câu Cá Busan • Đào Vàng & Cá Biến Dị'
                  : 'Vườn Rau Củ & Hạt Giống Biến Dị Thời Tiết'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-xl font-medium">
                {activeSubTab === 'fishing'
                  ? 'Bắn móc câu kéo các loài cá biển sâu và cá biến dị thời tiết! Kiếm K-Coins nâng cấp cần câu, lưỡi câu và mồi câu thần thoại.'
                  : 'Trồng rau củ Hàn Quốc, thu hoạch trái cây và chăm sóc cây biến dị thời tiết với bình tưới tiên nữ và phân bón hoàng kim!'}
              </p>
            </div>
          </div>

          {/* Currency HUD, Quick Weather Switcher & Main Feature Buttons */}
          <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {/* K-Coins Balance */}
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-900 font-extrabold text-sm shadow-xs border border-amber-300">
                <Coins className="w-4 h-4 text-amber-900" />
                <span>{coins} K-Coins</span>
              </div>

              {/* Shop Button */}
              <button
                type="button"
                id="btn-open-shop"
                onClick={() => {
                  playClickSound();
                  setIsShopOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-amber-50 text-slate-800 font-extrabold text-xs shadow-xs border border-slate-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Tiệm Bách Hóa 🛒</span>
              </button>

              {/* Leaderboard Button */}
              <button
                type="button"
                id="btn-open-leaderboard"
                onClick={() => {
                  playClickSound();
                  setIsLeaderboardOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-sky-50 text-slate-800 font-extrabold text-xs shadow-xs border border-slate-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Bảng Xếp Hạng 🏆</span>
              </button>

              {/* PvP 1v1 Battle Button */}
              <button
                type="button"
                id="btn-open-pvp"
                onClick={() => {
                  playClickSound();
                  setIsPvpOpen(true);
                  setPvpState('select');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Swords className="w-3.5 h-3.5 text-white" />
                <span>Đấu Đối Kháng ⚔️</span>
              </button>

              {/* 5-Vocab Quest Button */}
              <button
                type="button"
                id="btn-open-vocab-quest"
                onClick={() => {
                  playClickSound();
                  setIsVocabQuestOpen(true);
                  setVocabQuestIndex(0);
                  setVocabQuestScore(0);
                  setVocabQuestCompleted(false);
                  setVocabQuestAnswered(false);
                  setVocabQuestFeedback(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                <span>Học 5 từ lấy hạt hiếm 🎁</span>
              </button>

              <VoiceGenderToggle className="shadow-xs" />
            </div>

            {/* Quick Weather Bar Selector */}
            <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-black text-slate-500 px-1.5">Thời tiết:</span>
              {(['sunny', 'rainy', 'snowy', 'rainbow', 'foggy'] as WeatherType[]).map((w) => {
                const conf = WEATHER_CONFIGS[w];
                const isActive = currentWeather === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSelectWeather(w)}
                    className={`px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs scale-105'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title={conf.nameVi}
                  >
                    <span>{conf.emoji}</span>
                    <span className="hidden sm:inline text-[11px]">{conf.nameVi.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODE SELECTOR TABS */}
      <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('fishing');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeSubTab === 'fishing'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Fish className="w-4 h-4" />
          <span>Bến câu vàng Busan (부산 낚시)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('farm');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeSubTab === 'farm'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Vườn rau củ & Trái cây (텃밭)</span>
        </button>
      </div>

      {/* 3. FISHING VIEW: GOLD MINER STYLE + WEATHER MUTANTS */}
      {activeSubTab === 'fishing' && (
        <div className="space-y-6">
          {/* Main Gold Miner Canvas Stage */}
          <div
            ref={containerRef}
            className="relative rounded-3xl overflow-hidden bg-slate-900 border-4 border-sky-400 shadow-xl flex flex-col items-center select-none"
          >
            {/* Top Game Controls HUD */}
            <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900/80 text-amber-300 border border-amber-400/50 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Đã câu: {sessionCatchCount}</span>
                </span>
                {comboCount > 1 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white animate-bounce shadow-md">
                    Combo x{comboCount}! 🔥
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-900/80 text-sky-200 border border-sky-400/30 backdrop-blur-md">
                  Cần: {activeRod.nameVi.split(' ')[2] || 'Tre'} • Lưỡi: {activeHook ? activeHook.nameVi.split(' ')[2] : 'Cơ bản'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-sky-100 bg-sky-900/80 px-2.5 py-1 rounded-xl backdrop-blur-md border border-sky-400/30">
                  Phím cách [Space] hoặc Nhấp để bắn lưỡi câu!
                </span>
              </div>
            </div>

            {/* Interactive Canvas */}
            <canvas
              ref={canvasRef}
              width={canvasDim.width}
              height={canvasDim.height}
              onClick={shootHook}
              className="cursor-crosshair w-full max-w-[840px] block"
              style={{ touchAction: 'none' }}
            />

            {/* Bottom Action Controls */}
            <div className="w-full bg-slate-900/90 border-t border-sky-500/30 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2 text-xs text-sky-200">
                <span className="text-base">{weatherConfig.emoji}</span>
                <span>
                  {weatherConfig.mutantFishBonus} Cá phát hào quang vàng là Cá Biến Dị đặc biệt hiếm!
                </span>
              </div>

              <button
                type="button"
                onClick={shootHook}
                disabled={hookState !== 'swinging'}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  hookState === 'swinging'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300 hover:to-amber-400 hover:scale-105 active:scale-95 shadow-amber-500/40'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>
                  {hookState === 'swinging'
                    ? '🎯 BẮN LƯỠI CÂU (PHÍM CÁCH)'
                    : hookState === 'shooting'
                    ? 'Đang phóng lưỡi câu...'
                    : 'Đang kéo lên...'}
                </span>
              </button>
            </div>
          </div>

          {/* Caught Modal Celebration */}
          {caughtModalFish && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-scale-in">
              <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-4 border-amber-400 space-y-4 text-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    🎉 BẮT TRÚNG CÁ BIỂN! (잡았다!)
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    ★ {caughtModalFish.rarity.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="text-6xl animate-bounce">{caughtModalFish.emoji}</div>
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl font-black text-slate-800">
                        {caughtModalFish.nameKo}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handlePronounce(caughtModalFish.nameKo)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-600 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-sky-600 mt-0.5">
                      /{caughtModalFish.romanization}/
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-1">
                      {caughtModalFish.nameVi}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-left space-y-1">
                  <p className="text-xs font-bold text-amber-900">
                    💡 Đặc tính: {caughtModalFish.habitKo}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {caughtModalFish.descriptionVi}
                  </p>
                </div>

                {/* Optional Bonus Pronunciation Question */}
                {quickBonusQuestion && (
                  <div className="bg-sky-50 rounded-2xl p-3.5 border border-sky-200 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                      <span>⚡ Thử thách phát âm (+50% Xu):</span>
                      {quickBonusQuestion.answered && (
                        <span className={quickBonusQuestion.isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                          {quickBonusQuestion.isCorrect ? '✓ Đúng!' : '✗ Chưa đúng'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {quickBonusQuestion.promptVi}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                      {quickBonusQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={quickBonusQuestion.answered}
                          onClick={() => handleAnswerBonus(opt)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-100 border border-sky-300 font-bold text-xs text-slate-800 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleShareCatch}
                    className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{shareSuccessNotice ? 'Đã chia sẻ! ✓' : 'Khoe lên bảng tin'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCaughtModalFish(null);
                      setQuickBonusQuestion(null);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    Tiếp tục câu cá ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Aquarium Bag / Fish Inventory */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪣</span>
                <h3 className="font-extrabold text-base text-slate-800">
                  Thùng cá biển Busan (물고기 보관함)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {Object.values(fishInventory).reduce((a: number, b: number) => a + b, 0)} sinh vật đã câu được
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {ALL_FISHING_TARGETS.map((fish) => {
                const count = fishInventory[fish.id] || 0;
                const isCaught = count > 0;

                return (
                  <div
                    key={fish.id}
                    className={`rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                      isCaught
                        ? fish.isMutant
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-sky-50/60 border-sky-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{isCaught ? fish.emoji : '❓'}</span>
                      {isCaught && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white text-slate-600 shadow-2xs">
                          x{count}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 truncate">
                          {isCaught ? fish.nameKo : '???'}
                        </span>
                        {isCaught && (
                          <button
                            type="button"
                            onClick={() => handlePronounce(fish.nameKo)}
                            className="text-slate-400 hover:text-sky-600 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isCaught ? fish.nameVi : '???'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. FARMING VIEW: VƯỜN RAU CỦ & HẠT GIỐNG BIẾN DỊ THỜI TIẾT */}
      {activeSubTab === 'farm' && (
        <div className="space-y-6">
          {/* Farm Plots Grid */}
          <div className="bg-gradient-to-br from-amber-50/90 via-emerald-50/60 to-green-50 rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/70 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <span>🌾</span>
                  <span>Vườn rau củ & Hạt giống biến dị (텃밭)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tưới nước giải đố tiếng Hàn. Thu hoạch rau củ, trái cây và hạt giống biến dị theo thời tiết!
                  {fertilizerCharges > 0 && (
                    <span className="ml-2 font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                      🔥 Phân bón x1.6: còn {fertilizerCharges} lượt!
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Harvest all ready plots */}
                {plots.some((p) => p.stage === 'ready') && (
                  <button
                    type="button"
                    onClick={handleHarvestAll}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-xs transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🧺 Thu hoạch tất cả</span>
                  </button>
                )}

                {/* Quick Plant All Empty Plots with Random Seeds */}
                {plots.some((p) => p.stage === 'empty') && (
                  <button
                    type="button"
                    onClick={handlePlantAllEmptyPlots}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Gieo hạt ngẫu nhiên ({SEED_COST}🪙/ô)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Farm Tool Quick Action Bar (if user owns tools from shop) */}
            {(toolCounts['tool-magic-water'] || toolCounts['tool-super-fertilizer'] || toolCounts['tool-mutant-potion']) ? (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white/80 rounded-2xl border border-emerald-200">
                <span className="text-xs font-black text-emerald-800">Dụng cụ nông nghiệp:</span>
                {toolCounts['tool-magic-water'] ? (
                  <button
                    type="button"
                    onClick={() => handleUseFarmTool('tool-magic-water')}
                    className="px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>💧 Bình tưới tiên nữ (x{toolCounts['tool-magic-water']})</span>
                  </button>
                ) : null}
                {toolCounts['tool-super-fertilizer'] ? (
                  <button
                    type="button"
                    onClick={() => handleUseFarmTool('tool-super-fertilizer')}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🧪 Phân bón hoàng kim (x{toolCounts['tool-super-fertilizer']})</span>
                  </button>
                ) : null}
                {toolCounts['tool-mutant-potion'] ? (
                  <button
                    type="button"
                    onClick={() => handleUseFarmTool('tool-mutant-potion')}
                    className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Thuốc kích biến dị (x{toolCounts['tool-mutant-potion']})</span>
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* 6 Plots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {plots.map((plot) => {
                const crop = CROPS_DATA.find((c) => c.id === plot.cropId);

                return (
                  <div
                    key={plot.id}
                    className={`relative rounded-3xl p-4 min-h-[185px] flex flex-col justify-between items-center text-center shadow-xs transition-all ${
                      plot.isWeatherMutant
                        ? 'bg-amber-100/90 border-3 border-amber-400'
                        : 'bg-amber-100/70 border-3 border-amber-300/80 hover:border-emerald-400'
                    }`}
                  >
                    <span className="absolute top-2 left-3 text-[10px] font-mono font-bold text-amber-800/60">
                      Ô đất #{plot.id} {plot.isWeatherMutant && '⚡ BIẾN DỊ'}
                    </span>

                    {/* Stage 1: Empty Plot */}
                    {plot.stage === 'empty' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-200/60 flex items-center justify-center text-2xl text-amber-700">
                          🌱
                        </div>
                        <span className="text-xs font-extrabold text-amber-900">Đất sẵn sàng</span>
                        <div className="flex flex-col gap-1 w-full max-w-[140px]">
                          <button
                            type="button"
                            onClick={() => handlePlantRandomSeed(plot.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                          >
                            + Gieo ngẫu nhiên ({SEED_COST}🪙)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsSeedPickerOpen(plot.id)}
                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-300 cursor-pointer"
                          >
                            Chọn loại hạt 🌿
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Stage 2: Seed Stage */}
                    {plot.stage === 'seed' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2">
                        <span className="text-3xl animate-bounce">🌰</span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 inline-block">
                            {crop.isMutant ? 'Hạt Giống Biến Dị ⚡' : 'Hạt Giống'}
                          </span>
                          <p className="text-[11px] text-slate-500">Đang chờ tưới nước</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleWaterPlot(plot)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        >
                          <Droplet className="w-3 h-3" />
                          <span>Tưới nước</span>
                        </button>
                      </div>
                    )}

                    {/* Stage 3: Growing Stage */}
                    {plot.stage === 'growing' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2">
                        <span className="text-3xl animate-pulse">🌿</span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-slate-800">{crop.nameKo}</span>
                          <p className="text-[11px] text-slate-500">Đang lớn nhanh</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleWaterPlot(plot)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        >
                          <Droplet className="w-3 h-3" />
                          <span>Chăm sóc</span>
                        </button>
                      </div>
                    )}

                    {/* Stage 4: Ready to Harvest */}
                    {plot.stage === 'ready' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2 animate-scale-in">
                        <span className="text-4xl animate-bounce">{crop.emoji}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800">{crop.nameKo}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{crop.nameVi}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleHarvestPlot(plot)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
                        >
                          Thu hoạch (+{crop.coinReward} 🪙)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seed Picker Modal */}
          {isSeedPickerOpen !== null && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-emerald-300 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <h4 className="font-black text-base text-slate-800">Chọn hạt giống để gieo vào Ô #{isSeedPickerOpen}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSeedPickerOpen(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CROPS_DATA.map((crop) => {
                    const canAfford = coins >= (crop.seedCost || 10);
                    return (
                      <div
                        key={crop.id}
                        onClick={() => canAfford && handlePlantSpecificSeed(isSeedPickerOpen, crop)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          canAfford
                            ? crop.isMutant
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 cursor-pointer'
                              : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 cursor-pointer'
                            : 'bg-slate-100 opacity-50 cursor-not-allowed border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{crop.emoji}</span>
                          <div>
                            <p className="font-extrabold text-xs text-slate-800">{crop.nameKo}</p>
                            <p className="text-[11px] text-slate-500">{crop.nameVi}</p>
                            {crop.isMutant && (
                              <span className="text-[9px] font-black text-amber-700 bg-amber-200 px-1.5 py-0.2 rounded-md">
                                Biến dị {crop.weatherRequirement}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-1 rounded-xl">
                          {crop.seedCost}🪙
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Water & Care Quiz Modal */}
          {activeFarmQuizCrop && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-sky-300 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-xs font-black text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                    <Droplet className="w-3.5 h-3.5" /> Tưới nước & Đố từ vựng để mở hạt bí ẩn
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFarmQuizCrop(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center space-y-2 py-2">
                  <span className="text-5xl animate-bounce">
                    {mysteryRevealCrop ? mysteryRevealCrop.emoji : '🌱'}
                  </span>
                  <h4 className="text-base font-black text-slate-800">
                    {activeFarmQuizCrop.quizQuestionKo}
                  </h4>
                  <p className="text-xs text-slate-500">{activeFarmQuizCrop.quizQuestionVi}</p>
                </div>

                <div className="space-y-2">
                  {activeFarmQuizCrop.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFarmQuizAnswer(idx)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 font-bold text-xs sm:text-sm text-slate-700 transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {farmQuizFeedback && (
                  <p className="text-xs font-bold text-center text-emerald-700 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
                    {farmQuizFeedback}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pantry / Harvest Barn */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧺</span>
                <h3 className="font-extrabold text-base text-slate-800">
                  Kho nông sản & Trái cây (농산물 창고)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {Object.values(cropInventory).reduce((a: number, b: number) => a + b, 0)} sản phẩm đã thu hoạch
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {CROPS_DATA.map((crop) => {
                const count = cropInventory[crop.id] || 0;

                return (
                  <div
                    key={crop.id}
                    className={`rounded-2xl p-3 border flex flex-col justify-between ${
                      crop.isMutant ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{crop.emoji}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white text-slate-600 shadow-2xs">
                        x{count}
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 truncate">
                          {crop.nameKo}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePronounce(crop.nameKo)}
                          className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{crop.nameVi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SHOP MODAL: TIỆM BÁCH HÓA K-COINS (CẦN CÂU, LƯỠI, MỒI, DỤNG CỤ)       */}
      {/* ========================================================================= */}
      {isShopOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-amber-400 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800">Tiệm Bách Hóa K-Coins Cần Thủ & Nông Dân</h3>
                  <p className="text-xs text-slate-500">Dùng K-Coins để mua sắm vật dụng săn cá hiếm và biến dị</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-900 font-black text-xs">
                  {coins} K-Coins
                </span>
                <button
                  type="button"
                  onClick={() => setIsShopOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Shop Category Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              {[
                { id: 'rod', label: 'Cần câu 🎣' },
                { id: 'hook', label: 'Lưỡi câu 🪝' },
                { id: 'bait', label: 'Mồi câu 🪱' },
                { id: 'tool', label: 'Dụng cụ vườn 🧪' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setShopTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    shopTab === tab.id
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Shop Item Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {FARM_FISHING_SHOP_ITEMS.filter((i) => i.type === shopTab).map((item) => {
                const isOwnedRod = item.type === 'rod' && ownedRods.includes(item.id);
                const isEquippedRod = item.type === 'rod' && equippedRod === item.id;
                const isOwnedHook = item.type === 'hook' && ownedHooks.includes(item.id);
                const isEquippedHook = item.type === 'hook' && equippedHook === item.id;
                const baitCount = item.type === 'bait' ? (baitCounts[item.id] || 0) : 0;
                const toolCount = item.type === 'tool' ? (toolCounts[item.id] || 0) : 0;
                const canAfford = coins >= item.price;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-800">{item.nameVi}</h4>
                          <p className="text-[10px] text-slate-400 font-bold">{item.nameKo}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                        {item.price === 0 ? 'Miễn phí' : `${item.price}🪙`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.descriptionVi}</p>
                    <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-xl">
                      ⚡ Hiệu ứng: {item.effectDescription}
                    </p>

                    <div className="pt-1">
                      {item.type === 'rod' ? (
                        isEquippedRod ? (
                          <span className="w-full py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang trang bị
                          </span>
                        ) : isOwnedRod ? (
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setEquippedRod(item.id);
                            }}
                            className="w-full py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Trang bị cần câu này
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => handleBuyShopItem(item)}
                            className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Mua cần câu ({item.price}🪙)
                          </button>
                        )
                      ) : item.type === 'hook' ? (
                        isEquippedHook ? (
                          <span className="w-full py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang trang bị
                          </span>
                        ) : isOwnedHook ? (
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setEquippedHook(item.id);
                            }}
                            className="w-full py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Trang bị lưỡi câu này
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => handleBuyShopItem(item)}
                            className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Mua lưỡi câu ({item.price}🪙)
                          </button>
                        )
                      ) : item.type === 'bait' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => handleBuyShopItem(item)}
                            className="flex-1 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Mua mồi (+Gói)
                          </button>
                          <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-white rounded-xl border border-slate-200">
                            Có: {baitCount}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => handleBuyShopItem(item)}
                            className="flex-1 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-extrabold text-xs cursor-pointer shadow-xs"
                          >
                            Mua dụng cụ
                          </button>
                          <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-white rounded-xl border border-slate-200">
                            Có: {toolCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LEADERBOARD MODAL: BẢNG XẾP HẠNG CẦN THỦ & NÔNG DÂN                     */}
      {/* ========================================================================= */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-amber-300 space-y-4 max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800">Bảng Xếp Hạng Cần Thủ & Nông Dân</h3>
                  <p className="text-xs text-slate-500">Vinh danh các đại cao thủ câu cá biển và trồng trọt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {FARM_FISHING_LEADERBOARD.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-300 shadow-xs'
                      : idx === 1
                      ? 'bg-sky-50 border-sky-200'
                      : idx === 2
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{item.avatar}</span>
                    <div>
                      <p className="font-black text-xs sm:text-sm text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-bold">{item.title}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-xs sm:text-sm text-amber-700">{item.coins}🪙</p>
                    <p className="text-[10px] text-slate-500">
                      {item.rareCatches} Cá hiếm • {item.mutantHarvests} Biến dị
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PVP 1V1 BATTLE MODAL: ĐẤU ĐỐI KHÁNG CÂU CÁ & TRỒNG CÂY                 */}
      {/* ========================================================================= */}
      {isPvpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-rose-400 space-y-4 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800">Đấu Đối Kháng 1v1: Câu Cá & Trồng Cây</h3>
                  <p className="text-xs text-slate-500">Thi đấu 60s tính điểm tốc độ cùng các bạn đồng hành!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPvpOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* State 1: Choose Rival */}
            {pvpState === 'select' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 text-center">
                  Chọn bạn đồng hành để bắt đầu so tài đối kháng:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PVP_RIVALS.map((rival) => (
                    <div
                      key={rival.id}
                      onClick={() => handleStartPvp(rival)}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{rival.avatar}</span>
                        <div>
                          <p className="font-black text-xs text-slate-800">{rival.name}</p>
                          <p className="text-[10px] text-slate-500">{rival.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-rose-100 text-rose-700">
                        Thách đấu ⚔️
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* State 2: Battle Phase */}
            {pvpState === 'battle' && (
              <div className="space-y-4">
                {/* Score & Time HUD */}
                <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-400">BẠN</span>
                    <p className="text-lg font-black text-amber-400">{userPvpScore} đ</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-rose-400">THỜI GIAN</span>
                    <p className="text-2xl font-black text-white">{pvpTimeLeft}s</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400">{selectedRival.name.split(' ')[0]}</span>
                    <p className="text-lg font-black text-sky-400">{rivalPvpScore} đ</p>
                  </div>
                </div>

                {/* Score Ratio Progress Bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{
                      width: `${Math.max(10, Math.min(90, (userPvpScore / Math.max(1, userPvpScore + rivalPvpScore)) * 100))}%`,
                    }}
                  />
                  <div className="bg-sky-500 flex-1" />
                </div>

                {/* Question Challenge Card */}
                {currentPvpChallenge && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="text-center space-y-1">
                      <p className="text-sm font-black text-slate-800">
                        {currentPvpChallenge.questionKo}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        {currentPvpChallenge.questionVi}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {currentPvpChallenge.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerPvp(opt.isCorrect)}
                          className="p-2.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 font-bold text-xs text-slate-800 transition-all cursor-pointer shadow-2xs"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>

                    {pvpFeedback && (
                      <p
                        className={`text-xs font-bold text-center p-2 rounded-xl border ${
                          pvpFeedback.isCorrect
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {pvpFeedback.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Live Commentary Log */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Nhật ký trận đấu:</p>
                  {pvpBattleLog.slice(0, 3).map((log, idx) => (
                    <p key={idx} className="text-[11px] text-slate-700 truncate">
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* State 3: Result Phase */}
            {pvpState === 'result' && (
              <div className="text-center space-y-4 py-3">
                <div className="text-6xl animate-bounce">
                  {userPvpScore > rivalPvpScore ? '👑' : userPvpScore === rivalPvpScore ? '🤝' : '💪'}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    {userPvpScore > rivalPvpScore
                      ? 'CHIẾN THẮNG TUYỆT VỜI!'
                      : userPvpScore === rivalPvpScore
                      ? 'TRẬN ĐẤU BẤT PHÂN THẮNG BẠI!'
                      : 'ĐỐI THỦ QUÁ XUẤT SẮC!'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Điểm số của bạn: <strong>{userPvpScore} đ</strong> • {selectedRival.name}:{' '}
                    <strong>{rivalPvpScore} đ</strong>
                  </p>
                </div>

                {userPvpScore > rivalPvpScore && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 font-extrabold text-xs">
                    🎁 Phần thưởng chiến thắng: +100 K-Coins & +60 XP!
                  </div>
                )}

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartPvp(selectedRival)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                  >
                    Tái đấu 🔄
                  </button>
                  <button
                    type="button"
                    onClick={handleClaimPvpReward}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer shadow-md"
                  >
                    Nhận thưởng & Đóng ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. 5-VOCAB LEARNING QUEST: NHẬN HẠT GIỐNG BIẾN DỊ THỜI TIẾT               */}
      {/* ========================================================================= */}
      {isVocabQuestOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-emerald-400 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800">Thử Thách 5 Từ Vựng Mới</h3>
                  <p className="text-xs text-slate-500">Hoàn thành để nhận ngay Hạt Giống Biến Dị Thời Tiết!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVocabQuestOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!vocabQuestCompleted ? (
              <div className="space-y-4">
                {/* Progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Câu hỏi: {vocabQuestIndex + 1} / {questQuestions.length}</span>
                  <span className="text-emerald-700 font-extrabold">Đúng: {vocabQuestScore}</span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${((vocabQuestIndex + 1) / questQuestions.length) * 100}%` }}
                  />
                </div>

                {currentQuestCard && (
                  <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-slate-900">{currentQuestCard.hangul}</span>
                      <button
                        type="button"
                        onClick={() => handlePronounce(currentQuestCard.hangul)}
                        className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-800 font-bold">/{currentQuestCard.romanization}/</p>
                    <p className="text-xs text-slate-600 font-medium italic">"{currentQuestCard.exampleKo}"</p>

                    <div className="pt-2 text-left">
                      <p className="text-xs font-bold text-slate-700 mb-2">Chọn nghĩa tiếng Việt chính xác:</p>
                      <div className="space-y-2">
                        {[
                          currentQuestCard.vietnamese,
                          'Hoa anh đào mùa xuân',
                          'Cây thông bách xanh tươi',
                          'Con hổ trắng dũng mãnh',
                        ]
                          .sort(() => 0.5 - Math.random())
                          .map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={vocabQuestAnswered}
                              onClick={() => handleAnswerQuest(opt)}
                              className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-200 font-bold text-xs text-slate-800 cursor-pointer disabled:opacity-60 transition-all"
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>

                    {vocabQuestFeedback && (
                      <p
                        className={`text-xs font-bold text-center p-2.5 rounded-xl border ${
                          vocabQuestFeedback.isCorrect
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {vocabQuestFeedback.text}
                      </p>
                    )}
                  </div>
                )}

                {vocabQuestAnswered && (
                  <button
                    type="button"
                    onClick={handleNextQuestCard}
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-all hover:scale-102"
                  >
                    {vocabQuestIndex + 1 === questQuestions.length ? 'Nhận hạt giống biến dị ➔' : 'Từ tiếp theo ➔'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 py-3">
                <span className="text-6xl animate-bounce">⚡🍉</span>
                <h4 className="text-xl font-black text-slate-900">CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH!</h4>
                <p className="text-xs text-slate-600">
                  Bạn đã xuất sắc ghi nhớ 5 từ vựng mới và mở khóa thành công:
                </p>
                <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-left space-y-1">
                  <p className="text-sm font-black text-amber-900 flex items-center gap-1.5">
                    <span>✨ Hạt giống Cây Biến Dị Thời Tiết ({currentWeather.toUpperCase()})</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Hạt giống đã được cất vào túi đồ! Bạn có thể vào "Vườn rau củ" bấm "Chọn loại hạt" để gieo ngay lập tức!
                  </p>
                  <p className="text-xs font-black text-amber-700 pt-1">+80 K-Coins & +50 XP!</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVocabQuestOpen(false)}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Tuyệt vời! Vào vườn gieo hạt ngay ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
