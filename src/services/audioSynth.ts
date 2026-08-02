// Web Audio API Procedural Synthesizer for Cyberpunk Racing Game

class AudioSynthService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;

  private masterVol: number = 0.8;
  private musicVol: number = 0.6;
  private sfxVol: number = 0.9;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVol;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVol;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVol;
      this.sfxGain.connect(this.masterGain);

      this.setupEngineSynth();
    } catch (e) {
      console.warn('Web Audio API initialized with restriction:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(master: number, music: number, sfx: number) {
    this.masterVol = master;
    this.musicVol = music;
    this.sfxVol = sfx;

    if (this.masterGain) this.masterGain.gain.value = this.isMuted ? 0 : master;
    if (this.musicGain) this.musicGain.gain.value = music;
    if (this.sfxGain) this.sfxGain.gain.value = sfx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVol;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Engine sound oscillator loop
  private setupEngineSynth() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(300, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc.start();
    } catch {
      // Ignore initial auto-start restrictions
    }
  }

  public updateEngine(speedRatio: number, isRacing: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.engineFilter) return;

    if (!isRacing) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }

    const clampedRatio = Math.max(0.1, Math.min(2.5, speedRatio));
    const baseFreq = 45 + clampedRatio * 180;
    const filterFreq = 200 + clampedRatio * 1200;
    const targetGain = 0.12 + clampedRatio * 0.08;

    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
  }

  // SFX: UI Button Click
  public playButtonClick() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  // SFX: Nitro Boost Thrust
  public playNitroSound() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.3);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start();
  }

  // SFX: Coin Pick Up
  public playCoinSound() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(1975.53, t);
    osc2.frequency.setValueAtTime(2637.02, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.23);
    osc2.stop(t + 0.23);
  }

  // SFX: Power Up Activation
  public playPowerUpSound() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // SFX: Crash Explosion
  public playCrashSound() {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    // Sub-bass thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 0.5);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);

    noise.start(t);
    sub.start(t);
    sub.stop(t + 0.6);
  }

  // Procedural Synthwave Music Loop
  public startMusic() {
    this.init();
    this.resume();
    if (this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;

    const bpm = 125;
    const stepTime = (60 / bpm) / 4; // 16th note step
    let step = 0;

    const bassLine = [110, 110, 130.81, 110, 146.83, 110, 130.81, 98.00]; // A2, C3, D3, G2
    const leadNotes = [440, 0, 523.25, 659.25, 0, 587.33, 440, 0, 659.25, 783.99, 0, 659.25, 523.25, 440, 0, 392.00];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime;

      // Kick drum on 1, 5, 9, 13
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(150, t);
        kick.frequency.exponentialRampToValueAtTime(35, t + 0.08);
        kickGain.gain.setValueAtTime(0.25, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        kick.connect(kickGain);
        kickGain.connect(this.musicGain);
        kick.start(t);
        kick.stop(t + 0.1);
      }

      // Synth Bassline on 16th notes
      const bassFreq = bassLine[(step / 2) % bassLine.length];
      if (bassFreq) {
        const bass = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        const bFilter = this.ctx.createBiquadFilter();

        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(bassFreq / 2, t);

        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(450, t);

        bGain.gain.setValueAtTime(0.08, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 1.5);

        bass.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.musicGain);

        bass.start(t);
        bass.stop(t + stepTime * 1.5);
      }

      // Synth Lead
      const leadFreq = leadNotes[step % leadNotes.length];
      if (leadFreq && leadFreq > 0) {
        const lead = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();

        lead.type = 'square';
        lead.frequency.setValueAtTime(leadFreq, t);

        lGain.gain.setValueAtTime(0.04, t);
        lGain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 2);

        lead.connect(lGain);
        lGain.connect(this.musicGain);

        lead.start(t);
        lead.stop(t + stepTime * 2);
      }

      step = (step + 1) % 16;
    }, stepTime * 1000);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const audioSynth = new AudioSynthService();
