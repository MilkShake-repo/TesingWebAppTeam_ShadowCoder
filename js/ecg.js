// ==========================================================================
// Golden Hour — Real-Time Lead II ECG & SpO2 Pleth Canvas Waveform Engine
// ==========================================================================

const ECGMonitor = {
  canvas: null,
  ctx: null,
  animationId: null,
  x: 0,
  lastY: 60,
  history: [],
  maxPoints: 600,

  init() {
    this.canvas = document.getElementById('ecg-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.start();
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
  },

  start() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    let lastTime = performance.now();
    let phase = 0;

    const render = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const state = window.AppState.get();
      const hr = state.patient.hr || 80;
      const isCritical = state.patient.isCritical;
      
      // Calculate ECG Waveform Cycle
      const frequency = hr / 60; // beats per second
      phase = (phase + delta * frequency) % 1; // 0 to 1 in one cardiac cycle

      const h = (this.canvas.height / (window.devicePixelRatio || 1)) || 120;
      const mid = h * 0.55;

      let y = mid;

      // Realistic Lead II P-Q-R-S-T Complex
      if (phase >= 0.10 && phase < 0.18) {
        // P Wave (Atrial Depolarization)
        const pNorm = (phase - 0.10) / 0.08;
        y = mid - Math.sin(pNorm * Math.PI) * (h * 0.12);
      } else if (phase >= 0.22 && phase < 0.25) {
        // Q Wave
        y = mid + (h * 0.08);
      } else if (phase >= 0.25 && phase < 0.28) {
        // R Wave (Ventricular Depolarization Spike)
        const rNorm = (phase - 0.25) / 0.03;
        y = mid - Math.sin(rNorm * Math.PI) * (h * 0.48);
        if (rNorm > 0.45 && rNorm < 0.55 && Math.random() < 0.05) {
          window.AudioEngine && window.AudioEngine.playHeartbeat();
        }
      } else if (phase >= 0.28 && phase < 0.31) {
        // S Wave
        y = mid + (h * 0.15);
      } else if (phase >= 0.38 && phase < 0.52) {
        // T Wave (Ventricular Repolarization)
        const tNorm = (phase - 0.38) / 0.14;
        y = mid - Math.sin(tNorm * Math.PI) * (h * 0.18);
      } else {
        // Isoelectric Baseline with minor physiological jitter
        y = mid + (Math.random() - 0.5) * 1.5;
      }

      this.drawPoint(y, isCritical);

      // Update HUD metrics
      const hrEl = document.getElementById('ecg-live-hr');
      const spo2El = document.getElementById('ecg-live-spo2');
      if (hrEl) hrEl.textContent = `${state.patient.hr} BPM`;
      if (spo2El) spo2El.textContent = `${state.patient.spo2}% SpO2`;

      this.animationId = requestAnimationFrame(render);
    };

    this.animationId = requestAnimationFrame(render);
  },

  drawPoint(y, isCritical) {
    if (!this.ctx || !this.canvas) return;

    const w = (this.canvas.width / (window.devicePixelRatio || 1));
    const h = (this.canvas.height / (window.devicePixelRatio || 1));

    // Advance sweep bar
    const speed = 2.5;
    const oldX = this.x;
    this.x = (this.x + speed) % w;

    if (this.x < oldX) {
      // Wrapped around
      this.lastY = y;
    }

    // Clear head eraser bar
    const clearWidth = 24;
    this.ctx.fillStyle = '#040914';
    this.ctx.fillRect(this.x, 0, clearWidth, h);

    // Draw lead line
    this.ctx.beginPath();
    this.ctx.moveTo(oldX, this.lastY);
    this.ctx.lineTo(this.x, y);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = isCritical ? '#ef4444' : '#2dd4bf';
    this.ctx.shadowColor = isCritical ? 'rgba(239, 68, 68, 0.8)' : 'rgba(45, 212, 191, 0.8)';
    this.ctx.shadowBlur = 8;
    this.ctx.stroke();

    this.lastY = y;
  }
};

window.ECGMonitor = ECGMonitor;
