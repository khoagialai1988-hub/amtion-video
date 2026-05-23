import { AudioSettings } from '../types';

export class AmbianceEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;

  // Individual volume nodes
  private padGain: GainNode | null = null;
  private pianoGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private fireplaceGain: GainNode | null = null;
  private rainGain: GainNode | null = null;

  // Sound sources & nodes
  private noiseBuffer: AudioBuffer | null = null;
  private padOscillators: OscillatorNode[] = [];
  private windNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private isRunning: boolean = false;
  private pianoTimeout: number | null = null;
  private crackleInterval: number | null = null;

  constructor() {
    // Initialized on request due to Autoplay policies
  }

  public getAudioStream(): MediaStream | null {
    if (this.ctx && this.recordingDestination) {
      return this.recordingDestination.stream;
    }
    return null;
  }

  public async start(settings: AudioSettings) {
    if (this.isRunning) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      // Node for recording canvas output
      this.recordingDestination = this.ctx.createMediaStreamDestination();

      // Master output volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(settings.enabled ? settings.volume : 0, this.ctx.currentTime);

      // Dual-connection: to speaker and to compilation recorder
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.recordingDestination);

      // Create noise buffer for atmospheric overlays (rain, wind, thunder)
      this.noiseBuffer = this.createWhiteNoiseBuffer(this.ctx, 4);

      // Set up sound generators
      this.setupSynthPad();
      this.setupLofiPiano();
      this.setupWindWhispers();
      this.setupFireplaceCrackles();
      this.setupRainHum();

      // Apply initial sub-volumes
      this.updateVolumes(settings);

      this.isRunning = true;
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (err) {
      console.error('Failed to satisfy Audio Context initialization:', err);
    }
  }

  public stop() {
    if (!this.isRunning) return;

    if (this.pianoTimeout) {
      clearTimeout(this.pianoTimeout);
      this.pianoTimeout = null;
    }
    if (this.crackleInterval) {
      clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }

    this.padOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.padOscillators = [];

    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }

    this.isRunning = false;
  }

  public updateVolumes(settings: AudioSettings) {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Master Mute / Unmute
    this.masterGain.gain.setTargetAtTime(settings.enabled ? settings.volume : 0, t, 0.1);

    // Track sub volumes
    if (this.padGain) this.padGain.gain.setTargetAtTime(settings.padVolume, t, 0.2);
    if (this.pianoGain) this.pianoGain.gain.setTargetAtTime(settings.pianoVolume, t, 0.2);
    if (this.windGain) this.windGain.gain.setTargetAtTime(settings.windVolume, t, 0.2);
    if (this.fireplaceGain) this.fireplaceGain.gain.setTargetAtTime(settings.fireplaceVolume, t, 0.1);
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(settings.rainVolume, t, 0.2);
  }

  // Generate White Noise for Wind, Fire, and Rain
  private createWhiteNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const size = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. Lush Synth Ambiance Pad
  private setupSynthPad() {
    if (!this.ctx || !this.masterGain) return;

    this.padGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Chord: Cmaj9 root (C2=65Hz, G2=98Hz, C3=130Hz, E3=164Hz, B3=246Hz, D4=293Hz)
    const pitches = [65.41, 98.0, 130.81, 164.81, 246.94, 293.66];
    
    pitches.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const detune = (Math.random() - 0.5) * 6; // Subtle detuning for analog lushness
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);
      
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Low individual volumes

      // LFO modulation to keep pad pulsing gently
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.05 + idx * 0.02, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.padOscillators.push(osc);
    });

    // Modulate filter cutoff for evolving texture
    const filterLfo = this.ctx.createOscillator();
    const filterLfoGain = this.ctx.createGain();
    filterLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    filterLfoGain.gain.setValueAtTime(120, this.ctx.currentTime);

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);
    filterLfo.start();

    filter.connect(this.padGain);
    this.padGain.connect(this.masterGain);
  }

  // 2. Slow Cinematic Arpeggiated Piano Chords (Procedural)
  private setupLofiPiano() {
    if (!this.ctx || !this.masterGain) return;

    this.pianoGain = this.ctx.createGain();
    this.pianoGain.connect(this.masterGain);

    // Chords database
    // Am9, Cmaj9, Fmaj7, G6
    const chords = [
      [110.0, 130.81, 164.81, 246.94, 293.66], // Am9 (A2, C3, E3, B3, D4)
      [130.81, 164.81, 196.0, 246.94, 293.66],  // Cmaj9 (C3, E3, G3, B3, D4)
      [87.31, 130.81, 174.61, 220.0, 261.63],    // Fmaj7 (F2, C3, F3, A3, C4)
      [98.0, 146.83, 196.0, 246.94, 293.66]      // G6 (G2, D3, G3, B3, D4)
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.pianoGain) return;

      const now = this.ctx.currentTime;
      const pitches = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      // Arpeggiate chord notes mildly (150ms delays)
      pitches.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.pianoGain) return;
        const noteTime = now + noteIdx * 0.18;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, noteTime);

        // Add 2nd overtone for glassy piano shine
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteTime);

        gainNode.gain.setValueAtTime(0, noteTime);
        gainNode.gain.linearRampToValueAtTime(0.12, noteTime + 0.05); // attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 3.8); // release decay

        osc1.connect(filter);
        osc2.connect(filter);
        
        // Connect small subtle resonant overdrive/shaper or distortion for lofi cassette tone
        filter.connect(gainNode);
        gainNode.connect(this.pianoGain);

        osc1.start(noteTime);
        osc2.start(noteTime);
        
        // Cleanup node after finish
        osc1.stop(noteTime + 4.5);
        osc2.stop(noteTime + 4.5);
      });

      // Schedule next chord
      this.pianoTimeout = setTimeout(playNextChord, 8000 + Math.random() * 3000) as unknown as number;
    };

    // Delay start of piano chord cycle slightly
    this.pianoTimeout = setTimeout(playNextChord, 1500) as unknown as number;
  }

  // 3. Ambient Wind Whispers (Filtered Noise)
  private setupWindWhispers() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    this.windGain = this.ctx.createGain();
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime); // High resonant whistle
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    // Wind gust frequency modulator
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(0.07, this.ctx.currentTime); // very slow gusts
    modGain.gain.setValueAtTime(350, this.ctx.currentTime); // sweep range

    modulator.connect(modGain);
    modGain.connect(filter.frequency);
    modulator.start();

    source.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    source.start();
  }

  // 4. Lofi Fireplace Logs Crackling (Stochastic high-passes)
  private setupFireplaceCrackles() {
    if (!this.ctx || !this.masterGain) return;

    this.fireplaceGain = this.ctx.createGain();
    this.fireplaceGain.connect(this.masterGain);

    // Create a continuous small warm static roar
    if (this.noiseBuffer) {
      const roarSrc = this.ctx.createBufferSource();
      roarSrc.buffer = this.noiseBuffer;
      roarSrc.loop = true;

      const roarFilter = this.ctx.createBiquadFilter();
      roarFilter.type = 'bandpass';
      roarFilter.frequency.value = 160;
      roarFilter.Q.value = 0.8;

      const roarGain = this.ctx.createGain();
      roarGain.gain.value = 0.04;

      roarSrc.connect(roarFilter);
      roarFilter.connect(roarGain);
      roarGain.connect(this.fireplaceGain);
      roarSrc.start();
    }

    // Interval to trigger random high-frequency crackles of logs
    this.crackleInterval = setInterval(() => {
      if (!this.ctx || !this.fireplaceGain || Math.random() > 0.16) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1000 + Math.random() * 5000, now);

      filter.type = 'highpass';
      filter.frequency.value = 8000;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.012, now + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.05);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.fireplaceGain);

      osc.start(now);
      osc.stop(now + 0.15);
    }, 45) as unknown as number;
  }

  // 5. Soft Rain Hum
  private setupRainHum() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    this.rainGain = this.ctx.createGain();
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.6;
    filter.frequency.value = 850;

    source.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    source.start();
  }

  // 6. Sudden Thunder Sound Triggered by Screen lightning flashes
  public triggerThunderStrike(intensity: number) {
    if (!this.ctx || !this.masterGain || !this.isRunning || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;
    
    // Low rumble oscillator
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    const rumbleFilter = this.ctx.createBiquadFilter();

    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(45, now);
    
    // Slide frequency down to emulate moving stormy shockwaves
    rumbleOsc.frequency.exponentialRampToValueAtTime(25, now + 4.0);

    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(110, now);
    rumbleFilter.frequency.exponentialRampToValueAtTime(35, now + 3.0);

    // Thunder crack noise burst
    const noiseSrc = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const noiseFilter = this.ctx.createBiquadFilter();

    noiseSrc.buffer = this.noiseBuffer;
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 130;
    noiseFilter.Q.value = 1.0;

    // Fast explosion attack, slow rumble decays
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.4 * intensity, now + 0.06);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.35 * intensity, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Hook up rumble
    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    // Hook up explosive white noise rumble
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Start
    rumbleOsc.start(now);
    noiseSrc.start(now);

    // Cleanup
    rumbleOsc.stop(now + 5.0);
    noiseSrc.stop(now + 5.0);
  }
}
export const ambiance = new AmbianceEngine();
