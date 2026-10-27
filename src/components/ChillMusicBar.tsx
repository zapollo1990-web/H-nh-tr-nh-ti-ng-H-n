import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles, Sliders, Waves, ChevronDown, ChevronUp } from 'lucide-react';
import { chillMusic, CHILL_TRACKS } from '../utils/chillMusic';

interface ChillMusicBarProps {
  className?: string;
  defaultOpen?: boolean;
}

export const ChillMusicBar: React.FC<ChillMusicBarProps> = ({ className = '', defaultOpen = false }) => {
  const [status, setStatus] = useState(chillMusic.getStatus());
  const [isExpanded, setIsExpanded] = useState(defaultOpen);

  useEffect(() => {
    const unsubscribe = chillMusic.subscribe(() => {
      setStatus(chillMusic.getStatus());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleTogglePlay = () => {
    chillMusic.toggle();
  };

  const handleSelectTrack = (trackId: string) => {
    chillMusic.setTrack(trackId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    chillMusic.setVolume(val);
  };

  const handleToggleMute = () => {
    if (status.volume > 0) {
      chillMusic.setVolume(0);
    } else {
      chillMusic.setVolume(0.45);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-xs ${
        status.isPlaying
          ? 'bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-cyan-900/90 border-emerald-400/40 text-white shadow-emerald-500/10'
          : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-xs'
      } ${className}`}
    >
      <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Play/Pause button and Track info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all transform cursor-pointer ${
              status.isPlaying
                ? 'bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-400/30 scale-105 active:scale-95 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-105 active:scale-95'
            }`}
            title={status.isPlaying ? 'Tạm dừng nhạc chill' : 'Bật nhạc chill thư giãn khi câu cá & trồng trọt'}
          >
            {status.isPlaying ? '⏸' : '▶'}
          </button>

          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1 opacity-90">
                <Music className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Nhạc Chill Thư Giãn</span>
              </span>
              {status.isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-teal-300 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            <p className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 ${status.isPlaying ? 'text-white' : 'text-slate-900'}`}>
              <span>{status.track.emoji}</span>
              <span className="truncate max-w-[200px] sm:max-w-[280px]">{status.track.name}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick actions, Volume slider & Expanded toggle */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Quick Track Switcher Pills on Desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
            {CHILL_TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTrack(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  status.currentTrackId === t.id
                    ? status.isPlaying
                      ? 'bg-white text-emerald-950 shadow-xs'
                      : 'bg-emerald-600 text-white'
                    : status.isPlaying
                    ? 'text-emerald-100 hover:bg-white/10'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.emoji} {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                status.isPlaying ? 'text-emerald-200 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={status.volume > 0 ? 'Tắt tiếng' : 'Bật tiếng'}
            >
              {status.volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={status.volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 accent-emerald-400 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
              title={`Âm lượng: ${Math.round(status.volume * 100)}%`}
            />
          </div>

          {/* Expand / Customize Details Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold cursor-pointer transition-all ${
              status.isPlaying
                ? 'border-emerald-500/50 bg-white/10 text-white hover:bg-white/20'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Tùy chỉnh giai điệu & hiệu ứng thiên nhiên"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chọn bản nhạc</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Track & Nature Sound Selector */}
      {isExpanded && (
        <div
          className={`border-t px-3.5 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 transition-all ${
            status.isPlaying ? 'border-emerald-800/60 bg-black/20' : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          {CHILL_TRACKS.map((track) => {
            const isSelected = status.currentTrackId === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  handleSelectTrack(track.id);
                  if (!status.isPlaying) {
                    chillMusic.start(track.id);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? status.isPlaying
                      ? 'bg-emerald-500/30 border-emerald-300 text-white shadow-xs'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : status.isPlaying
                    ? 'border-white/10 hover:bg-white/10 text-emerald-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{track.emoji}</span>
                  <div className="truncate">
                    <p className="text-xs font-black truncate">{track.name}</p>
                    <p className={`text-[10px] ${status.isPlaying ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {track.mood}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                  <span className="opacity-80">
                    {track.ambientSound === 'ocean' ? '🌊 Sóng biển' : track.ambientSound === 'rain' ? '🌧️ Tiếng mưa' : track.ambientSound === 'crickets' ? '🦗 Côn trùng đêm' : '🍃 Gió đồng quê'}
                  </span>
                  {isSelected && status.isPlaying && (
                    <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Đang phát
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div
            className={`sm:col-span-2 md:col-span-4 mt-1 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs font-bold ${
              status.isPlaying ? 'border-white/10 text-emerald-200' : 'border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Hiệu ứng âm thanh thiên nhiên (Gió, sóng biển, tiếng mưa ambient):</span>
              <button
                type="button"
                onClick={() => chillMusic.toggleAmbient()}
                className={`px-2 py-0.5 rounded-md text-[11px] font-black cursor-pointer transition-all ${
                  status.ambientEnabled
                    ? 'bg-emerald-500 text-white'
                    : status.isPlaying
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {status.ambientEnabled ? 'Đang bật ✓' : 'Đã tắt ✗'}
              </button>
            </div>
            <p className="text-[11px] opacity-80">
              * Nhạc được tạo tự động êm dịu giúp tập trung ghi nhớ từ vựng và giải trí thư thái.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
