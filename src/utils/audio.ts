/**
 * Audio synthesis & sound effects for Korean Learning App
 * Supports Voice Gender Customization (Female 👩 / Male 👨)
 */

export type VoiceGender = 'female' | 'male';

const VOICE_GENDER_STORAGE_KEY = 'korean_voice_gender_pref';

export function getVoiceGender(): VoiceGender {
  if (typeof window === 'undefined') return 'female';
  try {
    const saved = localStorage.getItem(VOICE_GENDER_STORAGE_KEY);
    if (saved === 'male' || saved === 'female') return saved;
  } catch (_) {}
  return 'female';
}

export function setVoiceGender(gender: VoiceGender): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_GENDER_STORAGE_KEY, gender);
    window.dispatchEvent(new CustomEvent('voice-gender-changed', { detail: gender }));
  } catch (_) {}
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Korean Text-to-Speech using Web Speech API with gender adaptation
export function speakKorean(text: string, rate = 0.85, genderOverride?: VoiceGender) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const gender = genderOverride || getVoiceGender();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;

  // Modulate pitch according to gender preference
  if (gender === 'male') {
    utterance.pitch = 0.78; // Deep, clear masculine pitch
  } else {
    utterance.pitch = 1.12; // Bright, natural feminine pitch
  }

  // Pick suitable Korean voice if available
  const voices = window.speechSynthesis.getVoices();
  const koVoices = voices.filter((v) => v.lang === 'ko-KR' || v.lang.startsWith('ko'));

  if (koVoices.length > 0) {
    if (gender === 'male') {
      const maleVoice = koVoices.find(
        (v) =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('injoon') ||
          v.name.toLowerCase().includes('minho') ||
          v.name.toLowerCase().includes('man')
      );
      utterance.voice = maleVoice || koVoices[koVoices.length - 1];
    } else {
      const femaleVoice = koVoices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('yuna') ||
          v.name.toLowerCase().includes('heami') ||
          v.name.toLowerCase().includes('sunhi') ||
          v.name.toLowerCase().includes('woman')
      );
      utterance.voice = femaleVoice || koVoices[0];
    }
  }

  window.speechSynthesis.speak(utterance);
}

// Soft bubbly click sound
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Ignore audio error
  }
}

// Correct answer chime (pleasant C5 -> G5)
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.15, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  } catch (e) {
    // Ignore
  }
}

// Gentle incorrect sound
export function playIncorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    // Ignore
  }
}

// Victory fanfare for completed quiz or milestone
export function playFanfareSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startTime = now + index * 0.1;
      const duration = index === notes.length - 1 ? 0.4 : 0.15;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    // Ignore
  }
}
