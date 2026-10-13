import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CROPS_DATA, FISH_SPECIES_DATA } from '../data/farmAndFishing';
import { CropType, FarmPlot, FishSpecies } from '../types';
import {
  Fish,
  Sprout,
  Coins,
  Sparkles,
  Volume2,
  Droplet,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Share2,
  HelpCircle,
  Zap,
  Target,
  Trophy,
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

// Additional treasure chest for the Gold Miner game!
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
  vx: number; // velocity x
  direction: 1 | -1; // 1 = moving right, -1 = moving left
  depthLayer: 'shallow' | 'mid' | 'deep';
  width: number;
  height: number;
  radius: number; // collision hit radius
  weight: number; // higher weight = reels in slower like Gold Miner!
  bobPhase: number;
}

export const FarmAndFishingView: React.FC<FarmAndFishingViewProps> = ({
  onAddXp,
  onShareToFeed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fishing' | 'farm'>('fishing');

  // Currency & Inventory state
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_coins`);
    return saved ? parseInt(saved, 10) : 150;
  });

  const [fishInventory, setFishInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_fish`);
    return saved ? JSON.parse(saved) : {};
  });

  const [cropInventory, setCropInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_crop`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_coins`, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_fish`, JSON.stringify(fishInventory));
  }, [fishInventory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_INVENTORY_KEY}_crop`, JSON.stringify(cropInventory));
  }, [cropInventory]);

  // Audio pronunciation helper
  const handlePronounce = (text: string) => {
    speakKorean(text, 0.85);
  };

  // -------------------------------------------------------------
  // 1. GOLD MINER FISHING GAME ENGINE (CÂU CÁ ĐÀO VÀNG)
  // -------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hook Physics State
  // Origin of hook at top boat: (width / 2, 45)
  const [hookState, setHookState] = useState<
    'swinging' | 'shooting' | 'reeling_empty' | 'reeling_caught'
  >('swinging');
  const hookAngleRef = useRef<number>(0); // radians
  const hookLengthRef = useRef<number>(40); // length of line
  const hookDirectionRef = useRef<number>(1); // swing direction
  const hookStateRef = useRef<'swinging' | 'shooting' | 'reeling_empty' | 'reeling_caught'>('swinging');
  const hookedFishRef = useRef<SwimmingFish | null>(null);

  // Catch stats & celebration modal
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

  // Initialize abundant swimming fish (Cá thì có nhiều!)
  const initFishArmy = useCallback(
    (width: number, height: number) => {
      const newFish: SwimmingFish[] = [];
      const totalCount = 15; // 15 swimming fish at once!

      for (let i = 0; i < totalCount; i++) {
        // Pick species based on depth layer
        let layer: 'shallow' | 'mid' | 'deep' = 'shallow';
        let yMin = 100;
        let yMax = 180;

        if (i >= 5 && i < 11) {
          layer = 'mid';
          yMin = 190;
          yMax = 300;
        } else if (i >= 11) {
          layer = 'deep';
          yMin = 310;
          yMax = height - 50;
        }

        // Filter suitable species
        let candidates = ALL_FISHING_TARGETS;
        if (layer === 'shallow') {
          candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'common');
        } else if (layer === 'mid') {
          candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'rare');
        } else {
          candidates = ALL_FISHING_TARGETS.filter(
            (f) => f.rarity === 'legendary' || f.id === 'treasure-chest' || f.coinReward >= 80
          );
        }
        if (candidates.length === 0) candidates = ALL_FISHING_TARGETS;

        const species = candidates[Math.floor(Math.random() * candidates.length)];
        const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const speed = (0.6 + Math.random() * 1.2) * (species.speed || 1);

        // Weight factor determines reel resistance
        let weight = 1.0;
        if (species.rarity === 'rare') weight = 1.6;
        if (species.rarity === 'legendary') weight = 2.4;
        if (species.id === 'fish-legend-whale' || species.id === 'treasure-chest') weight = 3.0;

        // Radius for collision hit
        const radius = species.rarity === 'legendary' ? 34 : species.rarity === 'rare' ? 26 : 20;

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
    },
    []
  );

  useEffect(() => {
    initFishArmy(canvasDim.width, canvasDim.height);
  }, [canvasDim.width, canvasDim.height, initFishArmy]);

  // Sync ref with state
  useEffect(() => {
    hookStateRef.current = hookState;
  }, [hookState]);

  // Shoot Hook trigger (like Gold Miner button or click)
  const shootHook = useCallback(() => {
    if (hookStateRef.current !== 'swinging') return;
    setHookState('shooting');
    hookStateRef.current = 'shooting';
    playHookShotSound();
  }, []);

  // Keyboard shortcut: Spacebar or ArrowDown shoots the hook!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSubTab !== 'fishing') return;
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        if (!caughtModalFish && hookStateRef.current === 'swinging') {
          e.preventDefault();
          shootHook();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, caughtModalFish, shootHook]);

  // Respawn a fish that was caught
  const respawnFish = useCallback((width: number, height: number, layer: 'shallow' | 'mid' | 'deep') => {
    let yMin = 100;
    let yMax = 180;
    let candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'common');

    if (layer === 'mid') {
      yMin = 190;
      yMax = 300;
      candidates = ALL_FISHING_TARGETS.filter((f) => f.rarity === 'rare');
    } else if (layer === 'deep') {
      yMin = 310;
      yMax = height - 50;
      candidates = ALL_FISHING_TARGETS.filter(
        (f) => f.rarity === 'legendary' || f.id === 'treasure-chest' || f.coinReward >= 80
      );
    }
    if (candidates.length === 0) candidates = ALL_FISHING_TARGETS;

    const species = candidates[Math.floor(Math.random() * candidates.length)];
    const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    const speed = (0.7 + Math.random() * 1.1) * (species.speed || 1);

    let weight = 1.0;
    if (species.rarity === 'rare') weight = 1.6;
    if (species.rarity === 'legendary') weight = 2.4;
    if (species.id === 'fish-legend-whale' || species.id === 'treasure-chest') weight = 3.0;

    const radius = species.rarity === 'legendary' ? 34 : species.rarity === 'rare' ? 26 : 20;

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
  }, []);

  // Gold Miner Game Loop (requestAnimationFrame)
  useEffect(() => {
    if (activeSubTab !== 'fishing') return;

    let animId: number;
    let lastTime = performance.now();

    const originX = canvasDim.width / 2;
    const originY = 46; // bottom of boat
    const maxSwingAngle = 1.18; // ~68 degrees swing
    const swingSpeed = 1.6; // radians per second
    const shootSpeed = 12; // px per frame
    const baseReelSpeed = 9; // px per frame

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

      // Clear & Draw Ocean Canvas
      ctx.clearRect(0, 0, canvasDim.width, canvasDim.height);

      // --- 1. Background Ocean Gradient ---
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvasDim.height);
      oceanGrad.addColorStop(0, '#38bdf8'); // Sky/surface turquoise
      oceanGrad.addColorStop(0.18, '#0284c7'); // Clear blue
      oceanGrad.addColorStop(0.55, '#0369a1'); // Mid sea
      oceanGrad.addColorStop(0.85, '#1e3a8a'); // Deep navy
      oceanGrad.addColorStop(1, '#0f172a'); // Seabed
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvasDim.width, canvasDim.height);

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

      // Shimmering Light Rays
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const rayX = (canvasDim.width * (i + 1)) / 5 + Math.sin(time * 0.001 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(rayX - 30, 0);
        ctx.lineTo(rayX + 30, 0);
        ctx.lineTo(rayX + 90, canvasDim.height);
        ctx.lineTo(rayX - 90, canvasDim.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Sea Bed Sand & Marine Grass
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

      // Decorative Seaweeds at bottom
      for (let sx = 40; sx < canvasDim.width; sx += 85) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx, canvasDim.height);
        const sway = Math.sin(time * 0.002 + sx) * 12;
        ctx.quadraticCurveTo(sx + sway, canvasDim.height - 25, sx + sway * 1.5, canvasDim.height - 50);
        ctx.stroke();
      }

      // --- 2. Update and Draw Swimming Fish ---
      const currentFishList = fishListRef.current;
      for (let i = 0; i < currentFishList.length; i++) {
        const fish = currentFishList[i];

        // If this fish is currently hooked, its position is tracked by hook
        if (hookedFishRef.current && hookedFishRef.current.instanceId === fish.instanceId) {
          // Will be drawn attached to hook
          continue;
        }

        // Move swimming fish
        fish.x += fish.vx;
        fish.bobPhase += dt * 2.5;
        const visualY = fish.y + Math.sin(fish.bobPhase) * 4;

        // Wrap around boundaries
        if (fish.vx > 0 && fish.x > canvasDim.width + fish.radius * 2) {
          fish.x = -fish.radius * 2;
        } else if (fish.vx < 0 && fish.x < -fish.radius * 2) {
          fish.x = canvasDim.width + fish.radius * 2;
        }

        // Draw Fish Body & Emoji
        ctx.save();
        ctx.translate(fish.x, visualY);

        // Flip if moving left
        if (fish.direction === -1) {
          ctx.scale(-1, 1);
        }

        // Glow for legendary
        if (fish.species.rarity === 'legendary') {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
        }

        // Bubble trailing
        if (Math.random() < 0.08) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(-fish.radius - 6, (Math.random() - 0.5) * 6, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Emoji
        ctx.font = `${Math.floor(fish.radius * 1.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fish.species.emoji, 0, 0);

        ctx.restore();

        // Draw Korean Name Tag Pill above fish (Great for learning!)
        ctx.save();
        ctx.font = 'bold 10px monospace';
        const tagText = fish.species.nameKo;
        const textWidth = ctx.measureText(tagText).width;
        const pillW = textWidth + 10;
        const pillH = 15;
        const pillX = fish.x - pillW / 2;
        const pillY = visualY - fish.radius - 12;

        ctx.fillStyle =
          fish.species.rarity === 'legendary'
            ? 'rgba(245, 158, 11, 0.9)'
            : fish.species.rarity === 'rare'
            ? 'rgba(147, 51, 234, 0.85)'
            : 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 7);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, fish.x, pillY + pillH / 2);
        ctx.restore();
      }

      // --- 3. Hook Physics & State Machine ---
      let hx = originX;
      let hy = originY;

      if (hookStateRef.current === 'swinging') {
        // Smooth sine wave pendulum swing
        hookAngleRef.current += hookDirectionRef.current * swingSpeed * dt;
        if (hookAngleRef.current > maxSwingAngle) {
          hookAngleRef.current = maxSwingAngle;
          hookDirectionRef.current = -1;
        } else if (hookAngleRef.current < -maxSwingAngle) {
          hookAngleRef.current = -maxSwingAngle;
          hookDirectionRef.current = 1;
        }
        hookLengthRef.current = 42;

        hx = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
        hy = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;

        // Draw trajectory targeting guideline (faint laser guide)
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        const guideLen = 280;
        ctx.lineTo(
          originX + Math.sin(hookAngleRef.current) * guideLen,
          originY + Math.cos(hookAngleRef.current) * guideLen
        );
        ctx.stroke();
        ctx.restore();
      } else if (hookStateRef.current === 'shooting') {
        // Hook is traveling outward fast
        hookLengthRef.current += shootSpeed;
        hx = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
        hy = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;

        // Collision Check with Swimming Fish
        let hitFish: SwimmingFish | null = null;
        for (let i = 0; i < currentFishList.length; i++) {
          const fish = currentFishList[i];
          const dist = Math.hypot(hx - fish.x, hy - fish.y);
          if (dist < fish.radius + 14) {
            hitFish = fish;
            break;
          }
        }

        if (hitFish) {
          // Latch onto fish!
          hookedFishRef.current = hitFish;
          hookStateRef.current = 'reeling_caught';
          setHookState('reeling_caught');
          playHookHitSound();
        } else {
          // Boundary Check (hit seabed or walls)
          if (hy >= canvasDim.height - 15 || hx <= 15 || hx >= canvasDim.width - 15) {
            hookStateRef.current = 'reeling_empty';
            setHookState('reeling_empty');
          }
        }
      } else if (hookStateRef.current === 'reeling_empty') {
        // Reeling back empty line fast
        hookLengthRef.current -= baseReelSpeed * 1.5;
        if (hookLengthRef.current <= 42) {
          hookLengthRef.current = 42;
          hookStateRef.current = 'swinging';
          setHookState('swinging');
        }
        hx = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
        hy = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;
      } else if (hookStateRef.current === 'reeling_caught') {
        // Reeling back with fish attached! Speed depends on fish weight
        const fish = hookedFishRef.current;
        const resistance = fish ? fish.weight : 1.0;
        const actualReelSpeed = Math.max(3.0, baseReelSpeed / resistance);

        hookLengthRef.current -= actualReelSpeed;
        hx = originX + Math.sin(hookAngleRef.current) * hookLengthRef.current;
        hy = originY + Math.cos(hookAngleRef.current) * hookLengthRef.current;

        // If reached the boat: CAUGHT!
        if (hookLengthRef.current <= 42) {
          hookLengthRef.current = 42;
          const caught = hookedFishRef.current;
          hookedFishRef.current = null;
          hookStateRef.current = 'swinging';
          setHookState('swinging');

          if (caught) {
            // Trigger Catch celebration!
            playSplashSound();
            playSuccessSound();
            speakKorean(caught.species.nameKo);

            // Confetti
            try {
              confetti({
                particleCount: 45,
                spread: 60,
                origin: { y: 0.3 },
              });
            } catch (_) {}

            // Rewards
            const rewardCoins = caught.species.coinReward;
            setCoins((c) => c + rewardCoins);
            onAddXp(caught.species.xpReward);

            // Add to Bag
            setFishInventory((prev) => ({
              ...prev,
              [caught.species.id]: (prev[caught.species.id] || 0) + 1,
            }));

            // Stats
            setSessionCatchCount((c) => c + 1);
            setComboCount((c) => c + 1);

            // Set Caught Modal
            setCaughtModalFish(caught.species);

            // Generate fun optional booster question
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

            // Respawn that fish back into the ocean
            fishListRef.current = fishListRef.current
              .filter((f) => f.instanceId !== caught.instanceId)
              .concat([respawnFish(canvasDim.width, canvasDim.height, caught.depthLayer)]);
          }
        }
      }

      // --- 4. Draw Fishing Line & Hook ---
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Hook anchor / Claw graphic
      ctx.translate(hx, hy);
      ctx.rotate(hookAngleRef.current);

      // Steel Claw/Hook graphic
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      // Left claw
      ctx.beginPath();
      ctx.arc(-6, 8, 8, -Math.PI * 0.2, Math.PI * 0.6);
      ctx.stroke();
      // Right claw
      ctx.beginPath();
      ctx.arc(6, 8, 8, Math.PI * 0.4, Math.PI * 1.2);
      ctx.stroke();

      // If a fish is hooked, draw it directly on the hook tip!
      if (hookedFishRef.current) {
        const hFish = hookedFishRef.current;
        ctx.save();
        ctx.rotate(-hookAngleRef.current); // keep fish horizontal/natural
        ctx.font = `${Math.floor(hFish.radius * 1.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(hFish.species.emoji, 0, 8);
        ctx.restore();
      }

      ctx.restore();

      // --- 5. Draw Fisherman Boat & Dock at Top Center ---
      ctx.save();
      // Wooden Boat Hull
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(originX - 48, 16, 96, 26, [4, 4, 14, 14]);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Fisherman character 🎣
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚣‍♂️', originX, 22);

      // Crane Pulley / Winch
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
  }, [activeSubTab, canvasDim.width, canvasDim.height, onAddXp, respawnFish]);

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
  // 2. FARMING LOGIC (GIEO HẠT BẤT KỲ - KHÔNG CHỌN CÂY)
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
    // Default 6 plots
    return [
      { id: 1, cropId: 'crop-baechu', stage: 'ready' },
      { id: 2, cropId: 'crop-mu', stage: 'growing', needsAction: 'water' },
      { id: 3, cropId: null, stage: 'empty' },
      { id: 4, cropId: null, stage: 'empty' },
      { id: 5, cropId: null, stage: 'empty' },
      { id: 6, cropId: null, stage: 'empty' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_FARM_KEY, JSON.stringify(plots));
  }, [plots]);

  // Mystery seed planting cost (flat friendly fee)
  const SEED_COST = 10;

  // Selected plot for water quiz
  const [activeFarmQuizCrop, setActiveFarmQuizCrop] = useState<CropType | null>(null);
  const [activeFarmQuizPlotId, setActiveFarmQuizPlotId] = useState<number | null>(null);
  const [farmQuizFeedback, setFarmQuizFeedback] = useState<string | null>(null);
  const [mysteryRevealCrop, setMysteryRevealCrop] = useState<CropType | null>(null);

  /**
   * GIEO HẠT BẤT KỲ (RANDOM SEED PLANTING)
   * Người dùng nhấn gieo hạt là trồng NGAY một hạt giống bất kỳ ngẫu nhiên
   * Không có bảng chọn loại cây trồng theo yêu cầu của học viên!
   */
  const handlePlantRandomSeed = (plotId: number) => {
    // Pick a completely random Korean crop from CROPS_DATA
    const randomCrop = CROPS_DATA[Math.floor(Math.random() * CROPS_DATA.length)];

    // Deduct coins if has enough, else grant starter discount
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
          };
        }
        return p;
      })
    );
  };

  /**
   * GIEO TẤT CẢ Ô TRỐNG BẰNG HẠT NGẪU NHIÊN (QUICK PLANT ALL)
   */
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
          };
        }
        return p;
      })
    );
  };

  // Water plot triggers Korean quiz to care & sprout the mystery seed
  const handleWaterPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;
    setActiveFarmQuizPlotId(plot.id);
    setActiveFarmQuizCrop(crop);
    setFarmQuizFeedback(null);
  };

  // Submit care quiz
  const handleFarmQuizAnswer = (selectedIndex: number) => {
    if (!activeFarmQuizCrop || activeFarmQuizPlotId === null) return;

    if (selectedIndex === activeFarmQuizCrop.correctIndex) {
      playSuccessSound();
      speakKorean(activeFarmQuizCrop.nameKo);
      setMysteryRevealCrop(activeFarmQuizCrop);
      setFarmQuizFeedback(
        `Chính xác! Hạt giống bí ẩn đã nảy mầm thành ${activeFarmQuizCrop.nameVi} (${activeFarmQuizCrop.nameKo}) tươi tốt! 🌱✨`
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

  // Harvest plot
  const handleHarvestPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;

    playSuccessSound();
    speakKorean(crop.nameKo);
    setCoins((c) => c + crop.coinReward);
    onAddXp(crop.xpReward);

    setCropInventory((prev) => ({
      ...prev,
      [crop.id]: (prev[crop.id] || 0) + 1,
    }));

    // Reset plot to empty
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plot.id) {
          return {
            ...p,
            cropId: null,
            stage: 'empty',
            needsAction: null,
          };
        }
        return p;
      })
    );
  };

  // Harvest all ready plots at once
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
        totalCoins += crop.coinReward;
        totalXp += crop.xpReward;
        addedCrops[crop.id] = (addedCrops[crop.id] || 0) + 1;
      }
    });

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
        p.stage === 'ready' ? { ...p, cropId: null, stage: 'empty', needsAction: null } : p
      )
    );

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}
  };

  const handleShareCatch = () => {
    if (!caughtModalFish) return;
    if (onShareToFeed) {
      onShareToFeed(
        `부산 바다에서 ${caughtModalFish.nameKo}(${caughtModalFish.nameVi})를 낚았어요! 🎣✨`,
        `Mình vừa bắn trúng và kéo thành công ${caughtModalFish.nameVi} (${caughtModalFish.nameKo}) trong game câu vàng Busan! +${caughtModalFish.coinReward} K-Coins!`,
        'fishing'
      );
      setShareSuccessNotice(true);
      setTimeout(() => setShareSuccessNotice(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="farm-and-fishing-container">
      {/* 1. HERO GAME HEADER WITH CURRENCY & VOICE TOGGLE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-indigo-50 to-emerald-100 border border-sky-200/80 p-5 sm:p-6 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-4xl shadow-md border-3 border-white">
                🎣
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[11px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-2xs">
                GOLD
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-200 text-sky-800 border border-sky-300">
                  한국어 낚시 & 텃밭
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Câu vàng Busan & Nông trại hạt giống
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {activeSubTab === 'fishing'
                  ? 'Bến Câu Cá Busan • Trò Chơi Câu Vàng'
                  : 'Vườn Rau Kimchi • Gieo Hạt Bí Ẩn'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                {activeSubTab === 'fishing'
                  ? 'Ngắm góc lắc cần câu và bắn lưỡi câu như trò chơi đào vàng kinh điển! Có hàng chục loài cá biển Busan đang bơi lội dưới nước.'
                  : 'Gieo hạt giống ngẫu nhiên bất kỳ - tưới nước bằng câu đố từ vựng để hồi hộp khám phá cây trồng bí ẩn và thu hoạch bội thu!'}
              </p>
            </div>
          </div>

          {/* Status Coins & Voice Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-900 font-extrabold text-sm shadow-xs border border-amber-300">
              <Coins className="w-4 h-4 text-amber-900" />
              <span>{coins} K-Coins</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/90 text-slate-700 font-bold text-xs shadow-xs border border-slate-200">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {Object.values(fishInventory).reduce((a: number, b: number) => a + b, 0)} Cá •{' '}
                {Object.values(cropInventory).reduce((a: number, b: number) => a + b, 0)} Nông sản
              </span>
            </div>

            <VoiceGenderToggle className="shadow-xs" />
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
          <span>Vườn gieo hạt bí ẩn (농장)</span>
        </button>
      </div>

      {/* 3. FISHING VIEW: GOLD MINER STYLE (CÂU CÁ ĐÀO VÀNG NHIỀU CÁ) */}
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
                <span className="text-base">🌊</span>
                <span>
                  Các loài sinh vật biển bơi tự do: Tầng mặt (cá nhỏ), Tầng giữa (mực, cua, cá hồi),
                  Đáy biển (cá chép vàng, rương báu 🪙💎)!
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
                        className="p-1.5 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer"
                        title="Nghe phát âm tiếng Hàn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-mono font-bold text-sky-600">
                      [{caughtModalFish.romanization}]
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">
                      {caughtModalFish.nameVi}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    {caughtModalFish.descriptionVi}
                  </p>
                  <p className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl inline-block">
                    💡 {caughtModalFish.habitKo}
                  </p>
                </div>

                {/* Rewards Earned */}
                <div className="grid grid-cols-2 gap-2 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold">Tiền thưởng nhận</span>
                    <p className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4" /> +{caughtModalFish.coinReward} K-Coins
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold">Kinh nghiệm</span>
                    <p className="text-sm font-black text-sky-600 flex items-center justify-center gap-1">
                      <Sparkles className="w-4 h-4" /> +{caughtModalFish.xpReward} XP
                    </p>
                  </div>
                </div>

                {/* Optional Instant Bonus Vocabulary Boost */}
                {quickBonusQuestion && !quickBonusQuestion.answered && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-sky-700 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Thử thách phiên âm (+50% xu):
                      </span>
                      <span className="text-[10px] font-bold text-amber-600">
                        +{Math.round(caughtModalFish.coinReward * 0.5)} 🪙
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {quickBonusQuestion.promptVi}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {quickBonusQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAnswerBonus(opt)}
                          className="py-1.5 px-2 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 font-mono text-[11px] font-bold text-slate-700 text-center transition-all cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {quickBonusQuestion && quickBonusQuestion.answered && (
                  <p
                    className={`text-xs font-bold py-1.5 px-3 rounded-xl ${
                      quickBonusQuestion.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {quickBonusQuestion.isCorrect
                      ? `🎉 Xuất sắc! Nhận thêm +${Math.round(
                          caughtModalFish.coinReward * 0.5
                        )} K-Coins!`
                      : 'Lần sau cố gắng nhé! Hãy tiếp tục câu cá nào!'}
                  </p>
                )}

                {/* Modal Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareCatch}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{shareSuccessNotice ? 'Đã chia sẻ!' : 'Khoe bạn bè'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCaughtModalFish(null)}
                    className="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-md shadow-amber-400/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Câu tiếp ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fish Collection / Aquarium Log */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐟</span>
                <h3 className="font-extrabold text-base text-slate-800">
                  Túi lưới hải sản đã câu (어획 도감)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {Object.keys(fishInventory).length} / {ALL_FISHING_TARGETS.length} loài sinh vật
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {ALL_FISHING_TARGETS.map((fish) => {
                const count = fishInventory[fish.id] || 0;
                const isCaught = count > 0;

                return (
                  <div
                    key={fish.id}
                    className={`rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                      isCaught
                        ? 'bg-sky-50/50 border-sky-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{isCaught ? fish.emoji : '❓'}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white text-slate-600 shadow-2xs">
                        x{count}
                      </span>
                    </div>

                    <div className="mt-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 truncate">
                          {isCaught ? fish.nameKo : 'Chưa câu được'}
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

      {/* 4. FARMING VIEW: GIEO HẠT BẤT KỲ - KHÔNG CHỌN CÂY TRỒNG */}
      {activeSubTab === 'farm' && (
        <div className="space-y-6">
          {/* Farm Plots Grid */}
          <div className="bg-gradient-to-br from-amber-50/90 via-emerald-50/60 to-green-50 rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/70 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <span>🌾</span>
                  <span>Vườn rau Kimchi bí ẩn (비밀 씨앗 텃밭)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Quy tắc: <strong>Gieo hạt giống ngẫu nhiên bất kỳ</strong> (không chọn trước loại
                  cây). Chăm sóc bằng câu đố để cây đơm hoa kết trái bất ngờ!
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
                    <span>Gieo hạt tất cả ô trống ({SEED_COST}🪙/ô)</span>
                  </button>
                )}
              </div>
            </div>

            {/* 6 Plots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {plots.map((plot) => {
                const crop = CROPS_DATA.find((c) => c.id === plot.cropId);

                return (
                  <div
                    key={plot.id}
                    className="relative rounded-3xl bg-amber-100/70 border-3 border-amber-300/80 p-4 min-h-[175px] flex flex-col justify-between items-center text-center shadow-xs hover:border-emerald-400 transition-all"
                  >
                    <span className="absolute top-2 left-3 text-[10px] font-mono font-bold text-amber-800/60">
                      Ô đất #{plot.id}
                    </span>

                    {/* Stage 1: Empty Plot -> GIEO HẠT NGẪU NHIÊN BẤT KỲ */}
                    {plot.stage === 'empty' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-200/60 flex items-center justify-center text-2xl text-amber-700">
                          🌱
                        </div>
                        <span className="text-xs font-extrabold text-amber-900">Đất sẵn sàng</span>
                        <button
                          type="button"
                          onClick={() => handlePlantRandomSeed(plot.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>+ Gieo hạt bất kỳ</span>
                          <span className="text-[10px] opacity-90">({SEED_COST}🪙)</span>
                        </button>
                      </div>
                    )}

                    {/* Stage 2: Mystery Seed Stage */}
                    {plot.stage === 'seed' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2">
                        <span className="text-3xl animate-bounce">🌰</span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 inline-block">
                            Hạt giống bí ẩn
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

          {/* Water & Care Quiz Modal: Reveals the mystery plant! */}
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

                {/* Multiple choice options */}
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
                  Kho nông sản Hàn Quốc (농산물 창고)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {Object.values(cropInventory).reduce((a: number, b: number) => a + b, 0)} sản phẩm đã
                thu hoạch
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {CROPS_DATA.map((crop) => {
                const count = cropInventory[crop.id] || 0;

                return (
                  <div
                    key={crop.id}
                    className="rounded-2xl p-3 bg-slate-50 border border-slate-200 flex flex-col justify-between"
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
    </div>
  );
};
