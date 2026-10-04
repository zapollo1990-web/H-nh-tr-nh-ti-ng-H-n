import React, { useState, useEffect } from 'react';
import { CROPS_DATA, FISH_SPECIES_DATA, FISHING_CHALLENGES } from '../data/farmAndFishing';
import { CropType, FarmPlot, FishSpecies, FishingChallenge } from '../types';
import {
  Fish,
  Sprout,
  Coins,
  Sparkles,
  Volume2,
  Droplet,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Share2,
} from 'lucide-react';

interface FarmAndFishingViewProps {
  onAddXp: (amount: number) => void;
  onShareToFeed?: (contentKo: string, contentVi: string, type: string) => void;
}

const STORAGE_FARM_KEY = 'korean_journey_farm_plots_v1';
const STORAGE_INVENTORY_KEY = 'korean_journey_game_inv_v1';

export const FarmAndFishingView: React.FC<FarmAndFishingViewProps> = ({
  onAddXp,
  onShareToFeed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fishing' | 'farm'>('fishing');

  // Currency & Inventory state
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_coins`);
    return saved ? parseInt(saved, 10) : 150; // Starting bonus coins
  });

  const [fishInventory, setFishInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_fish`);
    return saved ? JSON.parse(saved) : {};
  });

  const [cropInventory, setCropInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`${STORAGE_INVENTORY_KEY}_crop`);
    return saved ? JSON.parse(saved) : {};
  });

  // Save inventory changes
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
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // -------------------------------------------------------------
  // 1. FISHING LOGIC
  // -------------------------------------------------------------
  const [fishingState, setFishingState] = useState<'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught'>('idle');
  const [currentFish, setCurrentFish] = useState<FishSpecies | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<FishingChallenge | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [shareSuccessNotice, setShareSuccessNotice] = useState(false);

  // Cast the line
  const handleCastLine = () => {
    setFishingState('waiting');
    setChallengeFeedback(null);
    setCurrentFish(null);

    // Random wait between 2-4 seconds for bite
    const biteTime = 2000 + Math.random() * 2000;
    setTimeout(() => {
      // Pick fish based on weighted rarity
      const roll = Math.random() * 100;
      let available: FishSpecies[];
      if (roll < 10) {
        // 10% Legendary
        available = FISH_SPECIES_DATA.filter((f) => f.rarity === 'legendary');
      } else if (roll < 40) {
        // 30% Rare
        available = FISH_SPECIES_DATA.filter((f) => f.rarity === 'rare');
      } else {
        // 60% Common
        available = FISH_SPECIES_DATA.filter((f) => f.rarity === 'common');
      }

      const fish = available[Math.floor(Math.random() * available.length)];
      setCurrentFish(fish);

      // Pick a random challenge
      const chal = FISHING_CHALLENGES[Math.floor(Math.random() * FISHING_CHALLENGES.length)];
      setCurrentChallenge(chal);

      setFishingState('hooked');
    }, biteTime);
  };

  // Reeling in answer click
  const handleAnswerFishing = (isCorrect: boolean) => {
    if (!currentFish) return;

    if (isCorrect) {
      setFishingState('caught');
      setChallengeFeedback('Chính xác! Giật cần thành công! 🎉');
      playAudio(currentFish.nameKo);

      // Reward
      const newCoins = coins + currentFish.coinReward;
      setCoins(newCoins);
      onAddXp(currentFish.xpReward);

      // Save to bag
      setFishInventory((prev) => ({
        ...prev,
        [currentFish.id]: (prev[currentFish.id] || 0) + 1,
      }));
    } else {
      setChallengeFeedback('Tiếc quá! Cá đã vùng vẫy thoát mất rồi! Hãy thử lại nhé.');
      setTimeout(() => {
        setFishingState('idle');
      }, 1800);
    }
  };

  // -------------------------------------------------------------
  // 2. FARMING LOGIC
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

  // Selected plot for planting or quiz
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [isSeedShopOpen, setIsSeedShopOpen] = useState(false);
  const [activeFarmQuizCrop, setActiveFarmQuizCrop] = useState<CropType | null>(null);
  const [farmQuizFeedback, setFarmQuizFeedback] = useState<string | null>(null);

  // Plant a seed
  const handleBuyAndPlant = (crop: CropType) => {
    if (coins < crop.seedCost) {
      alert('Bạn không đủ K-Coins để mua hạt giống này! Hãy câu cá hoặc làm quiz để nhận thêm vàng nhé.');
      return;
    }

    if (selectedPlotId === null) return;

    setCoins((c) => c - crop.seedCost);
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === selectedPlotId) {
          return {
            ...p,
            cropId: crop.id,
            stage: 'seed',
            plantedAt: Date.now(),
            needsAction: 'water',
          };
        }
        return p;
      })
    );

    setIsSeedShopOpen(false);
    setSelectedPlotId(null);
  };

  // Water plot triggers a quick Korean quiz
  const handleWaterPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;
    setSelectedPlotId(plot.id);
    setActiveFarmQuizCrop(crop);
    setFarmQuizFeedback(null);
  };

  // Submit farm quiz answer
  const handleFarmQuizAnswer = (selectedIndex: number) => {
    if (!activeFarmQuizCrop || selectedPlotId === null) return;

    if (selectedIndex === activeFarmQuizCrop.correctIndex) {
      setFarmQuizFeedback('Tuyệt vời! Cây đã được tưới nước và lớn nhanh nở hoa kết trái! 🌸✨');
      playAudio(activeFarmQuizCrop.nameKo);

      setTimeout(() => {
        setPlots((prev) =>
          prev.map((p) => {
            if (p.id === selectedPlotId) {
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
        setSelectedPlotId(null);
        setFarmQuizFeedback(null);
      }, 1500);
    } else {
      setFarmQuizFeedback('Chưa đúng rồi! Hãy suy nghĩ thêm một chút nhé!');
    }
  };

  // Harvest plot
  const handleHarvestPlot = (plot: FarmPlot) => {
    const crop = CROPS_DATA.find((c) => c.id === plot.cropId);
    if (!crop) return;

    playAudio(crop.nameKo);
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

  const handleShareCatch = () => {
    if (!currentFish) return;
    if (onShareToFeed) {
      onShareToFeed(
        `부산 바다에서 ${currentFish.nameKo}(${currentFish.nameVi})를 낚았어요! 🎣✨`,
        `Mình vừa câu thành công ${currentFish.nameVi} (${currentFish.nameKo}) ở biển Busan! Nhận được ${currentFish.coinReward} K-Coins!`,
        'fishing'
      );
      setShareSuccessNotice(true);
      setTimeout(() => setShareSuccessNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="farm-and-fishing-container">
      {/* 1. HERO GAME HEADER WITH CURRENCY & BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-emerald-50 to-amber-100 border border-sky-200/80 p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <img
                src="/src/assets/images/farm_and_fishing_1789549455542.jpg"
                alt="Korean Farm and Fishing"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-white shadow-md shadow-sky-200/50"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-xs px-1.5 py-0.5 rounded-full border border-sky-200 shadow-xs">
                🎣
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-200 text-sky-800 border border-sky-300">
                  한국어 낚시 & 농장 • Farm & Fishing
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                K-Farm Nông Trại & Câu Cá Tiếng Hàn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Giải đố từ vựng để trồng rau củ Kimchi tươi tốt và giật cần câu những loài cá biển Busan quý hiếm!
              </p>
            </div>
          </div>

          {/* Status Coins & Bag Summary */}
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
          </div>
        </div>
      </div>

      {/* 2. MODE SELECTOR TABS */}
      <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveSubTab('fishing')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeSubTab === 'fishing'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Fish className="w-4 h-4" />
          <span>Bến câu Busan (낚시터)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('farm')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeSubTab === 'farm'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Vườn rau Kimchi (농장)</span>
        </button>
      </div>

      {/* 3. FISHING VIEW */}
      {activeSubTab === 'fishing' && (
        <div className="space-y-6">
          {/* Main Fishing Stage */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-700 p-6 sm:p-8 text-white min-h-[360px] flex flex-col items-center justify-center text-center shadow-lg border-4 border-sky-300/40">
            {/* Ambient Water Particles & Waves */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute top-10 left-10 text-4xl animate-pulse">🌊</div>
              <div className="absolute bottom-10 right-10 text-4xl animate-bounce">🫧</div>
              <div className="absolute top-20 right-20 text-3xl animate-pulse">🐟</div>
              <div className="absolute bottom-14 left-1/4 text-3xl">🦑</div>
            </div>

            {/* Fishing Stage Statuses */}
            {fishingState === 'idle' && (
              <div className="relative z-10 space-y-4 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/30 animate-bounce">
                  🎣
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    Bến tàu biển xanh Busan (부산 바다)
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-100">
                    Làn nước trong veo đang có nhiều chú cá bơi lội. Hãy thả cần và sẵn sàng giải đố để bắt cá nhé!
                  </p>
                </div>
                <button
                  onClick={handleCastLine}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Thả cần câu cá (낚싯대 던지기) ➔
                </button>
              </div>
            )}

            {fishingState === 'waiting' && (
              <div className="relative z-10 space-y-4 max-w-md animate-pulse">
                <div className="text-5xl">🌊 🪱 🎣</div>
                <h3 className="text-lg sm:text-xl font-black">Đang nhử mồi dưới nước...</h3>
                <p className="text-xs text-sky-200">
                  Hãy giữ yên lặng và quan sát phao câu nhé! (잠시만 기다려 주세요...)
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-mono">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>
            )}

            {fishingState === 'hooked' && currentChallenge && currentFish && (
              <div className="relative z-10 bg-white text-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-amber-400 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 animate-bounce">
                    💥 CÁ CẮN CÂU! (입질이다!)
                  </span>
                  <span className="text-xs font-bold text-slate-400">Trả lời đúng để giật cần</span>
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-sky-600 font-mono">
                    Câu hỏi tiếng Hàn:
                  </span>
                  <h4 className="text-lg font-black text-slate-800">
                    {currentChallenge.questionKo}
                  </h4>
                  <p className="text-xs text-slate-500">{currentChallenge.questionVi}</p>
                </div>

                {/* Answer Options */}
                <div className="space-y-2 pt-1">
                  {currentChallenge.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerFishing(opt.isCorrect)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 font-bold text-xs sm:text-sm text-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span>{opt.text}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>

                {challengeFeedback && (
                  <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl">
                    {challengeFeedback}
                  </p>
                )}
              </div>
            )}

            {fishingState === 'caught' && currentFish && (
              <div className="relative z-10 bg-white text-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-4 border-emerald-400 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      currentFish.rarity === 'legendary'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : currentFish.rarity === 'rare'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}
                  >
                    ★ {currentFish.rarity}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Bắt thành công!
                  </span>
                </div>

                <div className="text-center space-y-2 py-2">
                  <div className="text-6xl sm:text-7xl animate-bounce">{currentFish.emoji}</div>
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl font-black text-slate-800">{currentFish.nameKo}</h3>
                      <button
                        onClick={() => playAudio(currentFish.nameKo)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-sky-100 text-sky-600 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-sky-600 font-bold">
                      [{currentFish.romanization}]
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-1">
                      {currentFish.nameVi}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">
                    {currentFish.descriptionVi}
                  </p>
                  <p className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl inline-block">
                    💡 {currentFish.habitKo}
                  </p>
                </div>

                {/* Rewards Won */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">Tiền thưởng</span>
                    <p className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4" /> +{currentFish.coinReward} K-Coins
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">Kinh nghiệm</span>
                    <p className="text-sm font-black text-sky-600 flex items-center justify-center gap-1">
                      <Sparkles className="w-4 h-4" /> +{currentFish.xpReward} XP
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleShareCatch}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{shareSuccessNotice ? 'Đã chia sẻ!' : 'Khoe lên Feed bạn bè'}</span>
                  </button>

                  <button
                    onClick={() => setFishingState('idle')}
                    className="flex-1 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Câu tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

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
                {Object.keys(fishInventory).length} / {FISH_SPECIES_DATA.length} loài sinh vật
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FISH_SPECIES_DATA.map((fish) => {
                const count = fishInventory[fish.id] || 0;
                const isCaught = count > 0;

                return (
                  <div
                    key={fish.id}
                    className={`rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                      isCaught
                        ? 'bg-sky-50/50 border-sky-200'
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
                        <span className="font-extrabold text-xs text-slate-800">
                          {isCaught ? fish.nameKo : 'Chưa câu được'}
                        </span>
                        {isCaught && (
                          <button
                            onClick={() => playAudio(fish.nameKo)}
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

      {/* 4. FARMING VIEW */}
      {activeSubTab === 'farm' && (
        <div className="space-y-6">
          {/* Farm Plots Grid */}
          <div className="bg-gradient-to-br from-amber-50/80 via-emerald-50/50 to-green-50 rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/70 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <span>🌾</span>
                  <span>Vườn rau Kimchi của bạn (나의 김치 텃밭)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chạm vào ô đất để gieo hạt giống, tưới nước bằng câu đố từ vựng và thu hoạch nông sản tươi ngon.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                  {plots.filter((p) => p.stage === 'ready').length} ô sẵn sàng thu hoạch!
                </span>
              </div>
            </div>

            {/* 6 Plots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {plots.map((plot) => {
                const crop = CROPS_DATA.find((c) => c.id === plot.cropId);

                return (
                  <div
                    key={plot.id}
                    className="relative rounded-3xl bg-amber-100/70 border-3 border-amber-300/80 p-4 min-h-[170px] flex flex-col justify-between items-center text-center shadow-xs hover:border-emerald-400 transition-all"
                  >
                    <span className="absolute top-2 left-3 text-[10px] font-mono font-bold text-amber-800/60">
                      Ô đất #{plot.id}
                    </span>

                    {/* Empty Plot */}
                    {plot.stage === 'empty' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-200/60 flex items-center justify-center text-2xl text-amber-700">
                          🌱
                        </div>
                        <span className="text-xs font-extrabold text-amber-900">Đất trống</span>
                        <button
                          onClick={() => {
                            setSelectedPlotId(plot.id);
                            setIsSeedShopOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          + Gieo hạt
                        </button>
                      </div>
                    )}

                    {/* Seed Stage */}
                    {plot.stage === 'seed' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2">
                        <span className="text-3xl animate-bounce">🌰</span>
                        <span className="text-xs font-black text-slate-800">{crop.nameKo}</span>
                        <span className="text-[11px] text-slate-500">Mới gieo mầm</span>
                        <button
                          onClick={() => handleWaterPlot(plot)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Droplet className="w-3 h-3" />
                          <span>Tưới nước</span>
                        </button>
                      </div>
                    )}

                    {/* Growing Stage */}
                    {plot.stage === 'growing' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2">
                        <span className="text-3xl animate-pulse">🌿</span>
                        <span className="text-xs font-black text-slate-800">{crop.nameKo}</span>
                        <span className="text-[11px] text-slate-500">Đang trổ lá non</span>
                        <button
                          onClick={() => handleWaterPlot(plot)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Droplet className="w-3 h-3" />
                          <span>Chăm sóc</span>
                        </button>
                      </div>
                    )}

                    {/* Ready to Harvest */}
                    {plot.stage === 'ready' && crop && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 py-2 animate-scale-in">
                        <span className="text-4xl animate-bounce">{crop.emoji}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800">{crop.nameKo}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{crop.nameVi}</p>
                        </div>
                        <button
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

          {/* Seed Store Modal / Selection */}
          {isSeedShopOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏪</span>
                    <h3 className="font-extrabold text-lg text-slate-800">
                      Cửa hàng hạt giống Hàn Quốc (씨앗 상점)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSeedShopOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Chọn loại hạt giống bạn muốn gieo vào ô đất #{selectedPlotId}:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {CROPS_DATA.map((crop) => (
                    <div
                      key={crop.id}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/40 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crop.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-slate-800">{crop.nameKo}</h4>
                            <button
                              onClick={() => playAudio(crop.nameKo)}
                              className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold">{crop.nameVi}</p>
                          <p className="text-[10px] text-slate-400">
                            Thu hoạch: +{crop.coinReward} 🪙 / +{crop.xpReward} XP
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyAndPlant(crop)}
                        disabled={coins < crop.seedCost}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                          coins >= crop.seedCost
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3 h-3" />
                        <span>{crop.seedCost}</span>
                      </button>
                    </div>
                  ))}
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
                    <Droplet className="w-3.5 h-3.5" /> Chăm sóc cây: {activeFarmQuizCrop.nameKo}
                  </span>
                  <button
                    onClick={() => setActiveFarmQuizCrop(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center space-y-2 py-2">
                  <span className="text-5xl animate-bounce">{activeFarmQuizCrop.emoji}</span>
                  <h4 className="text-base font-black text-slate-800">
                    {activeFarmQuizCrop.quizQuestionKo}
                  </h4>
                  <p className="text-xs text-slate-500">{activeFarmQuizCrop.quizQuestionVi}</p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {activeFarmQuizCrop.options.map((opt, idx) => (
                    <button
                      key={idx}
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
                {Object.values(cropInventory).reduce((a: number, b: number) => a + b, 0)} sản phẩm đã thu hoạch
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CROPS_DATA.map((crop) => {
                const count = cropInventory[crop.id] || 0;

                return (
                  <div
                    key={crop.id}
                    className="rounded-2xl p-3 bg-slate-50 border border-slate-200 flex items-center gap-3"
                  >
                    <span className="text-3xl">{crop.emoji}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-slate-800">{crop.nameKo}</span>
                        <button
                          onClick={() => playAudio(crop.nameKo)}
                          className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">{crop.nameVi}</p>
                      <p className="text-[10px] font-black text-emerald-700">Đã thu hoạch: {count}</p>
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
