import React, { useState, useEffect } from 'react';
import {
  VoiceGender,
  getVoiceGender,
  setVoiceGender,
  speakKorean,
  playClickSound
} from '../utils/audio';

interface VoiceGenderToggleProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'button';
  onGenderChange?: (gender: VoiceGender) => void;
}

export const VoiceGenderToggle: React.FC<VoiceGenderToggleProps> = ({
  className = '',
  variant = 'compact',
  onGenderChange,
}) => {
  const [currentGender, setCurrentGender] = useState<VoiceGender>(getVoiceGender());

  useEffect(() => {
    const handleVoiceChange = (e: any) => {
      if (e.detail) {
        setCurrentGender(e.detail);
      }
    };
    window.addEventListener('voice-gender-changed', handleVoiceChange);
    return () => window.removeEventListener('voice-gender-changed', handleVoiceChange);
  }, []);

  const handleToggle = (gender: VoiceGender) => {
    if (gender === currentGender) return;
    playClickSound();
    setCurrentGender(gender);
    setVoiceGender(gender);
    if (onGenderChange) {
      onGenderChange(gender);
    }
    // Quick pleasant sample voice demonstration
    speakKorean(gender === 'female' ? '안녕하세요!' : '반갑습니다!', 0.9, gender);
  };

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200 shadow-2xs ${className}`}
      title="Tùy chỉnh giọng đọc tiếng Hàn (Nam / Nữ)"
    >
      <button
        type="button"
        onClick={() => handleToggle('female')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
          currentGender === 'female'
            ? 'bg-rose-500 text-white shadow-xs scale-102'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span>👩</span>
        <span>Nữ</span>
      </button>

      <button
        type="button"
        onClick={() => handleToggle('male')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
          currentGender === 'male'
            ? 'bg-sky-600 text-white shadow-xs scale-102'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span>👨</span>
        <span>Nam</span>
      </button>
    </div>
  );
};
