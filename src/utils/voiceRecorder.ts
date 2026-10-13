/**
 * Voice Recorder & Audio Visualizer Utility
 * Supports real MediaRecorder audio capture, live volume level analysis,
 * playback URL generation, and Web Speech API transcription.
 */

export interface RecordedAudioResult {
  blob: Blob;
  audioUrl: string;
  durationSeconds: number;
  transcript: string;
  hadSpeechEnergy: boolean;
}

export interface VoiceRecorderOptions {
  lang?: string;
  maxDurationSeconds?: number;
  onVolumeChange?: (volumePercent: number) => void;
  onInterimTranscript?: (text: string) => void;
  onMaxDurationReached?: () => void;
}

export class VoiceRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private speechRecognition: any = null;
  private detectedTranscript: string = '';
  private startTime: number = 0;
  private isRecordingActive: boolean = false;
  private maxDurationTimer: any = null;
  private maxVolumeObserved: number = 0;

  public isRecording(): boolean {
    return this.isRecordingActive;
  }

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      navigator?.mediaDevices?.getUserMedia ||
      (navigator as any)?.webkitGetUserMedia ||
      (window as any)?.MediaRecorder ||
      (window as any)?.SpeechRecognition ||
      (window as any)?.webkitSpeechRecognition
    );
  }

  public async start(options: VoiceRecorderOptions = {}): Promise<void> {
    if (this.isRecordingActive) {
      this.stop();
    }

    this.audioChunks = [];
    this.detectedTranscript = '';
    this.maxVolumeObserved = 0;
    this.startTime = Date.now();
    this.isRecordingActive = true;

    const lang = options.lang || 'ko-KR';

    // 1. Start Web Speech Recognition if available
    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let full = '';
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript;
          }
          if (full.trim()) {
            this.detectedTranscript = full.trim();
            if (options.onInterimTranscript) {
              options.onInterimTranscript(this.detectedTranscript);
            }
          }
        };

        recognition.onerror = (_err: any) => {
          // Keep recording audio even if SpeechRecognition encounters an error
        };

        recognition.onend = () => {
          // Will restart if still recording
          if (this.isRecordingActive) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        this.speechRecognition = recognition;
        recognition.start();
      }
    } catch (_) {
      // Speech recognition fallback
    }

    // 2. Request real microphone access via getUserMedia
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } else {
        const legacyGetUserMedia =
          (navigator as any).getUserMedia ||
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia;
        if (legacyGetUserMedia) {
          this.mediaStream = await new Promise((resolve, reject) => {
            legacyGetUserMedia.call(
              navigator,
              { audio: true },
              (stream: MediaStream) => resolve(stream),
              (err: any) => reject(err)
            );
          });
        }
      }

      if (this.mediaStream) {
        // 3. AudioContext for live volume visualization
        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtxClass) {
            const ctx = new AudioCtxClass();
            this.audioContext = ctx;
            if (ctx.state === 'suspended') {
              await ctx.resume();
            }
            const source = ctx.createMediaStreamSource(this.mediaStream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            source.connect(analyser);
            this.analyser = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
              if (!this.isRecordingActive || !this.analyser) return;
              this.analyser.getByteFrequencyData(dataArray);

              // Calculate average volume
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              const volumePercent = Math.min(100, Math.round((average / 128) * 100));

              if (volumePercent > this.maxVolumeObserved) {
                this.maxVolumeObserved = volumePercent;
              }

              if (options.onVolumeChange) {
                options.onVolumeChange(volumePercent);
              }

              this.animFrameId = requestAnimationFrame(checkVolume);
            };

            this.animFrameId = requestAnimationFrame(checkVolume);
          }
        } catch (_) {
          // AudioContext visualizer optional
        }

        // 4. MediaRecorder setup
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          '',
        ];

        let selectedMime = '';
        if (typeof MediaRecorder !== 'undefined') {
          for (const mime of mimeTypes) {
            if (!mime || MediaRecorder.isTypeSupported(mime)) {
              selectedMime = mime;
              break;
            }
          }

          const recorder = selectedMime
            ? new MediaRecorder(this.mediaStream, { mimeType: selectedMime })
            : new MediaRecorder(this.mediaStream);

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };

          recorder.start(100); // 100ms slice
          this.mediaRecorder = recorder;
        }
      }
    } catch (err: any) {
      console.warn('Microphone access warning:', err);
      // Even if mic hardware permission fails in this environment, don't crash
    }

    // Set auto max-duration cutoff (default 20 seconds)
    const maxSecs = options.maxDurationSeconds || 20;
    this.maxDurationTimer = setTimeout(() => {
      if (this.isRecordingActive) {
        if (options.onMaxDurationReached) {
          options.onMaxDurationReached();
        }
      }
    }, maxSecs * 1000);
  }

  public async stop(): Promise<RecordedAudioResult> {
    this.isRecordingActive = false;
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Stop SpeechRecognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.onend = null;
        this.speechRecognition.stop();
      } catch (_) {}
      this.speechRecognition = null;
    }

    // Stop MediaRecorder
    let blob: Blob = new Blob([], { type: 'audio/webm' });
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!this.mediaRecorder) return resolve();
        this.mediaRecorder.onstop = () => resolve();
        try {
          this.mediaRecorder.stop();
        } catch (_) {
          resolve();
        }
      });
    }

    if (this.audioChunks.length > 0) {
      blob = new Blob(this.audioChunks, {
        type: this.mediaRecorder?.mimeType || 'audio/webm',
      });
    }

    // Stop MediaStream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      this.mediaStream = null;
    }

    // Close AudioContext
    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }
      } catch (_) {}
      this.audioContext = null;
    }
    this.analyser = null;

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    let audioUrl = '';
    if (blob.size > 0 && typeof URL !== 'undefined') {
      try {
        audioUrl = URL.createObjectURL(blob);
      } catch (_) {}
    }

    return {
      blob,
      audioUrl,
      durationSeconds,
      transcript: this.detectedTranscript,
      hadSpeechEnergy: this.maxVolumeObserved > 10 || blob.size > 1000,
    };
  }

  public cleanup(): void {
    if (this.isRecordingActive) {
      this.stop();
    }
  }
}
