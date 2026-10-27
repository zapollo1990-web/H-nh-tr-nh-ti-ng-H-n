// Chill Background Music Synthesizer for Farm & Fishing
// Uses procedural Web Audio API with soothing chords, kalimba, Rhodes, and nature ambiance.

export interface ChillTrack {
  id: string;
  name: string;
  emoji: string;
  mood: string;
  ambientSound: 'breeze' | 'ocean' | 'rain' | 'crickets';
}

export const CHILL_TRACKS: ChillTrack[] = [
  {
    id: 'farm_peace',
    name: 'Giai Điệu Nông Trại Yên Bình',
    emoji: '🌾',
    mood: 'Thanh bình & Mộc mạc',
    ambientSound: 'breeze',
  },
  {
    id: 'jeju_ocean',
    name: 'Bến Câu Đảo Jeju Chiều Lặng',
    emoji: '🎣',
    mood: 'Sóng vỗ êm đềm & Thư thái',
    ambientSound: 'ocean',
  },
  {
    id: 'rainy_cafe',
    name: 'Lo-Fi Cà Phê Seoul Mưa Bay',
    emoji: '☕',
    mood: 'Ấm áp & Hoài niệm',
    ambientSound: 'rain',
  },
  {
    id: 'moonlight_garden',
    name: 'Đêm Trăng Đồng Quê Hàn Quốc',
    emoji: '🌙',
    mood: 'Huyền ảo & Tĩnh lặng',
    ambientSound: 'crickets',
  },
];

// Frequencies in Hz for note names
const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
};

class ChillMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientNode: AudioNode | null = null;

  private isPlaying = false;
  private currentTrackId = 'farm_peace';
  private volume = 0.45;
  private ambientEnabled = true;
  private stepTimer: number | null = null;
  private stepIndex = 0;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('chill_music_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.45;
      }
      const savedTrack = localStorage.getItem('chill_music_track');
      if (savedTrack && CHILL_TRACKS.some((t) => t.id === savedTrack)) {
        this.currentTrackId = savedTrack;
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.ctx = new AudioCtxClass();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music sub-gain
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Ambient sub-gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientEnabled ? 0.35 : 0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Create pinkish ambient noise buffer (for waves, rain, wind)
  private createNoiseBuffer(duration = 4): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Start continuous ambient background (waves, breeze, rain)
  private startAmbientSound(type: 'breeze' | 'ocean' | 'rain' | 'crickets') {
    this.stopAmbientSound();
    if (!this.ctx || !this.ambientGain) return;

    try {
      const noiseBuffer = this.createNoiseBuffer(5);
      if (!noiseBuffer) return;

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();

      if (type === 'ocean') {
        // Slow rhythmic ocean swell
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, this.ctx.currentTime);
        filter.Q.setValueAtTime(2, this.ctx.currentTime);

        // LFO for wave rhythm (swell every 5 seconds)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5s cycle
        lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
        lfo.connect(filter.frequency);
        lfo.start();
      } else if (type === 'rain') {
        // Soft pitter-patter rain
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      } else if (type === 'crickets') {
        // Soft night air
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.0, this.ctx.currentTime);
      } else {
        // Gentle countryside breeze
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
        lfo.connect(filter.frequency);
        lfo.start();
      }

      noiseSource.connect(filter);
      filter.connect(this.ambientGain);
      noiseSource.start();
      this.ambientNode = noiseSource;
    } catch (_) {
      // Audio node error safe fallback
    }
  }

  private stopAmbientSound() {
    if (this.ambientNode) {
      try {
        (this.ambientNode as AudioBufferSourceNode).stop();
        this.ambientNode.disconnect();
      } catch (_) {}
      this.ambientNode = null;
    }
  }

  // Play a soft mellow chord / note with warm lowpass filter
  private playMellowNote(freq: number, time: number, duration: number, type: 'kalimba' | 'rhodes' | 'pad' = 'kalimba') {
    if (!this.ctx || !this.musicGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';

      if (type === 'rhodes') {
        // Warm electric piano: sine + subtle octave overtone + 650Hz filter
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc2.frequency.setValueAtTime(freq * 2, time);

        filter.frequency.setValueAtTime(680, time);
        filter.frequency.exponentialRampToValueAtTime(350, time + duration);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.14, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      } else if (type === 'pad') {
        // Ambient background pad
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc2.frequency.setValueAtTime(freq * 1.002, time); // detune chorus

        filter.frequency.setValueAtTime(450, time);
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.08, time + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      } else {
        // Kalimba / acoustic bell pluck: clear pure sine with swift pluck decay
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc2.frequency.setValueAtTime(freq * 3, time); // chime harmonic

        filter.frequency.setValueAtTime(1400, time);
        filter.frequency.exponentialRampToValueAtTime(500, time + duration);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.18, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      }

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      filter.connect(this.musicGain);

      osc.start(time);
      osc2.start(time);
      osc.stop(time + duration);
      osc2.stop(time + duration);
    } catch (_) {}
  }

  // Musical progressions per track
  private getTrackSequences(trackId: string) {
    if (trackId === 'jeju_ocean') {
      // Jeju Fishing Sunset: Fmaj7 -> Em7 -> Dm7 -> Cmaj7 (64 BPM)
      return {
        stepDuration: 0.65,
        bars: [
          { bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4], arpeggio: [NOTE_FREQS.G4, NOTE_FREQS.A4, NOTE_FREQS.C5, NOTE_FREQS.E5] },
          { bass: NOTE_FREQS.E3, chord: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.D4], arpeggio: [NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.B4, NOTE_FREQS.D5] },
          { bass: NOTE_FREQS.D3, chord: [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.C4], arpeggio: [NOTE_FREQS.D4, NOTE_FREQS.F4, NOTE_FREQS.A4, NOTE_FREQS.C5] },
          { bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.E3, NOTE_FREQS.G3, NOTE_FREQS.B3], arpeggio: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.B4] },
        ],
        style: 'rhodes' as const,
      };
    }

    if (trackId === 'rainy_cafe') {
      // Lo-Fi Seoul Cafe: Ebmaj7 -> Cm7 -> Fm7 -> Bb7 (68 BPM)
      return {
        stepDuration: 0.60,
        bars: [
          { bass: NOTE_FREQS.Eb3, chord: [NOTE_FREQS.G3, NOTE_FREQS.Bb3, NOTE_FREQS.D4], arpeggio: [NOTE_FREQS.F4, NOTE_FREQS.G4, NOTE_FREQS.Bb4, NOTE_FREQS.D5] },
          { bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.Eb3, NOTE_FREQS.G3, NOTE_FREQS.Bb3], arpeggio: [NOTE_FREQS.D4, NOTE_FREQS.Eb4, NOTE_FREQS.G4, NOTE_FREQS.C5] },
          { bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.Ab3, NOTE_FREQS.C4, NOTE_FREQS.Eb4], arpeggio: [NOTE_FREQS.G4, NOTE_FREQS.Ab4, NOTE_FREQS.C5, NOTE_FREQS.Eb5] },
          { bass: NOTE_FREQS.Bb3, chord: [NOTE_FREQS.D4, NOTE_FREQS.F4, NOTE_FREQS.Ab4], arpeggio: [NOTE_FREQS.C5, NOTE_FREQS.Bb4, NOTE_FREQS.F4, NOTE_FREQS.D4] },
        ],
        style: 'rhodes' as const,
      };
    }

    if (trackId === 'moonlight_garden') {
      // Korean Moonlight Garden: Pentatonic A minor (58 BPM)
      return {
        stepDuration: 0.72,
        bars: [
          { bass: NOTE_FREQS.A3, chord: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.A4], arpeggio: [NOTE_FREQS.E4, NOTE_FREQS.A4, NOTE_FREQS.C5, NOTE_FREQS.E5] },
          { bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4], arpeggio: [NOTE_FREQS.C4, NOTE_FREQS.F4, NOTE_FREQS.A4, NOTE_FREQS.C5] },
          { bass: NOTE_FREQS.D3, chord: [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.D4], arpeggio: [NOTE_FREQS.A3, NOTE_FREQS.D4, NOTE_FREQS.F4, NOTE_FREQS.A4] },
          { bass: NOTE_FREQS.E3, chord: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.E4], arpeggio: [NOTE_FREQS.B3, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.B4] },
        ],
        style: 'kalimba' as const,
      };
    }

    // Default: 'farm_peace' (Country Farm Breeze in C Major)
    return {
      stepDuration: 0.62,
      bars: [
        { bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.E3, NOTE_FREQS.G3, NOTE_FREQS.B3], arpeggio: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.B4, NOTE_FREQS.C5] },
        { bass: NOTE_FREQS.A3, chord: [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4], arpeggio: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.A4] },
        { bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4], arpeggio: [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4] },
        { bass: NOTE_FREQS.G3, chord: [NOTE_FREQS.B3, NOTE_FREQS.D4, NOTE_FREQS.F4], arpeggio: [NOTE_FREQS.G3, NOTE_FREQS.B3, NOTE_FREQS.D4, NOTE_FREQS.G4, NOTE_FREQS.B4] },
      ],
      style: 'kalimba' as const,
    };
  }

  // Scheduling loop
  private tick() {
    if (!this.isPlaying || !this.ctx) return;

    const seq = this.getTrackSequences(this.currentTrackId);
    const totalBars = seq.bars.length;
    const currentBarIdx = Math.floor(this.stepIndex / 4) % totalBars;
    const subBeat = this.stepIndex % 4;
    const bar = seq.bars[currentBarIdx];
    const now = this.ctx.currentTime;

    // Sub-beat 0: Play root bass and warm sustained chord pad
    if (subBeat === 0) {
      if (bar.bass) {
        this.playMellowNote(bar.bass, now, seq.stepDuration * 3.6, 'pad');
      }
      bar.chord.forEach((freq, idx) => {
        this.playMellowNote(freq, now + idx * 0.02, seq.stepDuration * 3.5, seq.style);
      });
    }

    // Melodic kalimba / piano arpeggio note
    if (bar.arpeggio && bar.arpeggio.length > 0) {
      const noteIdx = (subBeat * 2) % bar.arpeggio.length;
      const noteFreq = bar.arpeggio[noteIdx];
      this.playMellowNote(noteFreq, now + 0.04, seq.stepDuration * 1.4, seq.style);

      // Subtle sparkle note on beat 2
      if (subBeat === 2 && bar.arpeggio.length > 2) {
        const extraNote = bar.arpeggio[(noteIdx + 2) % bar.arpeggio.length];
        this.playMellowNote(extraNote, now + seq.stepDuration * 0.45, seq.stepDuration * 0.9, 'kalimba');
      }
    }

    this.stepIndex++;
  }

  public start(trackId?: string) {
    if (trackId && CHILL_TRACKS.some((t) => t.id === trackId)) {
      this.currentTrackId = trackId;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.stepIndex = 0;

    const currentTrack = CHILL_TRACKS.find((t) => t.id === this.currentTrackId) || CHILL_TRACKS[0];
    this.startAmbientSound(currentTrack.ambientSound);

    if (this.stepTimer) {
      clearInterval(this.stepTimer);
    }
    const seq = this.getTrackSequences(this.currentTrackId);
    this.stepTimer = window.setInterval(() => {
      this.tick();
    }, seq.stepDuration * 1000);

    // Initial tick right away
    this.tick();
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.stopAmbientSound();
    this.notify();
  }

  public toggle(trackId?: string) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start(trackId || this.currentTrackId);
    }
  }

  public setTrack(trackId: string) {
    if (!CHILL_TRACKS.some((t) => t.id === trackId)) return;
    this.currentTrackId = trackId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chill_music_track', trackId);
    }
    if (this.isPlaying) {
      // Seamlessly restart with new track parameters
      this.start(trackId);
    } else {
      this.notify();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('chill_music_volume', this.volume.toString());
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleAmbient() {
    this.ambientEnabled = !this.ambientEnabled;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientEnabled ? 0.35 : 0, this.ctx.currentTime);
    }
    this.notify();
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      track: CHILL_TRACKS.find((t) => t.id === this.currentTrackId) || CHILL_TRACKS[0],
      volume: this.volume,
      ambientEnabled: this.ambientEnabled,
    };
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (_) {}
    });
  }
}

export const chillMusic = new ChillMusicEngine();
