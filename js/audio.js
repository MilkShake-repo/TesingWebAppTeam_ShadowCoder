// ==========================================================================
// Golden Hour — Web Audio API Telemetry Synthesizer
// ==========================================================================

const AudioEngine = {
  ctx: null,
  isMuted: true, // muted by default until user interacts / un-mutes
  lastBeep: 0,

  init() {
    // Lazy initialize AudioContext on user action
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.onclick = () => this.toggleAudio();
    }
  },

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleAudio() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isMuted 
        ? '<span class="btn-icon-symbol">🔇</span><span class="btn-label">Audio Muted</span>' 
        : '<span class="btn-icon-symbol">🔊</span><span class="btn-label">Telemetry Live</span>';
      btn.classList.toggle('active', !this.isMuted);
    }
    window.AppState.get().audioMuted = this.isMuted;
    window.UI && window.UI.showToast(this.isMuted ? 'Audio Telemetry Muted' : '🔊 Audio Telemetry Active');
    if (!this.isMuted) {
      this.playChime(660, 0.1);
    }
  },

  playHeartbeat() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastBeep < 300) return; // Debounce
    this.lastBeep = now;

    this.ensureContext();
    if (!this.ctx) return;

    try {
      const state = window.AppState.get();
      const pitch = state.patient.spo2 > 95 ? 880 : 540; // Frequency depends on oxygen saturation
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  },

  playCriticalAlarm() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  },

  playChime(freq = 587.33, dur = 0.15) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
};

window.AudioEngine = AudioEngine;
