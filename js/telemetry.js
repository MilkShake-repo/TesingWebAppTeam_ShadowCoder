// ==========================================================================
// Golden Hour — Live Telemetry Streamer & Corridor Simulator
// ==========================================================================

const TelemetryEngine = {
  intervalId: null,
  active: false,
  etaSeconds: 492, // ~8m 12s

  init() {
    const btn = document.getElementById('autostream-btn');
    if (btn) {
      btn.onclick = () => this.toggleAutoStream();
    }
  },

  toggleAutoStream() {
    this.active = !this.active;
    const btn = document.getElementById('autostream-btn');
    if (btn) {
      btn.innerHTML = this.active ? '⚡ Telemetry: STREAMING LIVE' : '📡 Simulated Corridor Telemetry';
      btn.classList.toggle('btn-danger', this.active);
      btn.classList.toggle('btn-secondary', !this.active);
    }

    window.AppState.get().autoStreamActive = this.active;
    window.UI && window.UI.showToast(this.active ? '⚡ Real-time Telemetry Feed Activated' : 'Telemetry Stream Paused');

    if (this.active) {
      this.intervalId = setInterval(() => this.tick(), 2000);
    } else {
      if (this.intervalId) clearInterval(this.intervalId);
    }
  },

  tick() {
    const state = window.AppState.get();
    
    // Add small physiological fluctuations
    const hrJitter = Math.floor((Math.random() - 0.48) * 3);
    const spo2Jitter = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    const sbpJitter = Math.floor((Math.random() - 0.5) * 2);

    state.patient.hr = Math.max(40, Math.min(180, state.patient.hr + hrJitter));
    state.patient.spo2 = Math.max(70, Math.min(100, state.patient.spo2 + spo2Jitter));
    state.patient.sbp = Math.max(60, Math.min(220, state.patient.sbp + sbpJitter));

    // Decrement ETA
    if (this.etaSeconds > 10) {
      this.etaSeconds -= 2;
      const m = String(Math.floor(this.etaSeconds / 60)).padStart(2, '0');
      const s = String(this.etaSeconds % 60).padStart(2, '0');
      const etaStr = `${m} min ${s}s`;

      const erEta = document.getElementById('er-eta-countdown');
      const ovEta = document.getElementById('overview-eta');
      if (erEta) erEta.textContent = etaStr;
      if (ovEta) ovEta.textContent = etaStr;
    }

    // Auto-clear signals as ambulance moves closer
    if (this.etaSeconds < 400 && state.signals[0].status !== 'cleared') {
      state.signals[0].status = 'cleared';
      window.RoutingEngine && window.RoutingEngine.renderSignals();
    }
    if (this.etaSeconds < 250 && state.signals[1].status !== 'cleared') {
      state.signals[1].status = 'cleared';
      window.RoutingEngine && window.RoutingEngine.renderSignals();
    }
    if (this.etaSeconds < 100 && state.signals[2].status !== 'cleared') {
      state.signals[2].status = 'cleared';
      window.RoutingEngine && window.RoutingEngine.renderSignals();
      window.UI && window.UI.showToast('🚦 Signal #3 (ER Ramp) CLEARED FOR AMBULANCE 04');
    }

    // Push updates to UI inputs and ER
    const hrIn = document.getElementById('hr');
    const spo2In = document.getElementById('spo2');
    const sbpIn = document.getElementById('sbp');
    if (hrIn) hrIn.value = state.patient.hr;
    if (spo2In) spo2In.value = state.patient.spo2;
    if (sbpIn) sbpIn.value = state.patient.sbp;

    window.UI && window.UI.syncParamedicToER();
  }
};

window.TelemetryEngine = TelemetryEngine;
