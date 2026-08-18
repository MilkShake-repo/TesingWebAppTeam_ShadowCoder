// ==========================================================================
// Golden Hour — UI Controller & Interaction Engine
// ==========================================================================

const UI = {
  presets: {
    fracture: {
      hr: 88, spo2: 98, sbp: 122, rr: 16, temp: 36.8, gcs: 15,
      injuryType: 'trauma',
      history: 'Roadside collision. Closed limb fracture. Patient conscious, stable vitals. Localized tenderness.'
    },
    chest: {
      hr: 116, spo2: 93, sbp: 154, rr: 22, temp: 37.1, gcs: 15,
      injuryType: 'cardiology',
      history: 'Acute retrosternal chest pain radiating to left jaw. Shortness of breath, diaphoretic. STEMI suspected.'
    },
    unconscious: {
      hr: 128, spo2: 88, sbp: 86, rr: 28, temp: 37.5, gcs: 7,
      injuryType: 'neurology',
      history: 'Unconscious following severe high-speed impact. GCS 7 (Eye 2, Verbal 2, Motor 3). Airway risk.'
    },
    asthma: {
      hr: 110, spo2: 91, sbp: 130, rr: 26, temp: 36.9, gcs: 15,
      injuryType: 'trauma',
      history: 'Acute bronchospasm, severe wheezing and accessory muscle use. Inhaled beta-agonist administered.'
    },
    anaphylaxis: {
      hr: 132, spo2: 89, sbp: 82, rr: 30, temp: 37.8, gcs: 13,
      injuryType: 'trauma',
      history: 'Severe allergic reaction post bee sting. Facial angioedema, stridor, hypotension. Epinephrine given.'
    }
  },

  init() {
    this.setupViewSwitcher();
    this.setupMobileBottomNav();
    this.setupSteppers();
    this.setupPresets();
    this.setupFormListeners();
    this.setupHandoff();
    this.setupThemeToggle();
    this.startGoldenHourCountdown();

    window.AppState.on('patientUpdated', () => this.syncParamedicToER());
  },

  setupViewSwitcher() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.mode;
        window.AppState.setMode(mode);
        const label = btn.querySelector('span:not(.nav-icon-glyph)')?.textContent.trim() || btn.textContent.trim();
        this.showToast(`Switched to ${label}`);
      };
    });
  },

  setupMobileBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.onclick = () => {
        const mode = item.dataset.mode;
        window.AppState.setMode(mode);
        this.showToast(`Switched to ${item.querySelector('span:last-child').textContent}`);
      };
    });
  },

  setupSteppers() {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        const delta = parseFloat(btn.dataset.step || 1) * (btn.dataset.action === 'dec' ? -1 : 1);
        const input = document.getElementById(targetId);
        if (!input) return;

        let val = parseFloat(input.value) || 0;
        val += delta;

        // Bounds
        if (targetId === 'gcs') val = Math.max(3, Math.min(15, val));
        if (targetId === 'spo2') val = Math.max(0, Math.min(100, val));
        if (targetId === 'hr') val = Math.max(0, Math.min(250, val));
        if (targetId === 'temp') val = Math.max(30, Math.min(45, Math.round(val * 10) / 10));

        input.value = val;
        this.syncParamedicToER();
      };
    });
  },

  setupPresets() {
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.onclick = () => this.loadPreset(btn.dataset.preset);
    });
  },

  loadPreset(key) {
    const p = this.presets[key];
    if (!p) return;

    document.querySelectorAll('[data-preset]').forEach(b => {
      b.classList.toggle('active', b.dataset.preset === key);
    });

    const hr = document.getElementById('hr');
    const spo2 = document.getElementById('spo2');
    const sbp = document.getElementById('sbp');
    const rr = document.getElementById('rr');
    const temp = document.getElementById('temp');
    const gcs = document.getElementById('gcs');
    const injury = document.getElementById('injury-type');
    const history = document.getElementById('history');

    if (hr) hr.value = p.hr;
    if (spo2) spo2.value = p.spo2;
    if (sbp) sbp.value = p.sbp;
    if (rr) rr.value = p.rr;
    if (temp) temp.value = p.temp;
    if (gcs) gcs.value = p.gcs;
    if (injury) injury.value = p.injuryType;
    if (history) history.value = p.history;

    this.syncParamedicToER();
    this.showToast(`Preset loaded: ${key.toUpperCase()}`);
    window.AudioEngine && window.AudioEngine.playChime(660, 0.15);
  },

  setupFormListeners() {
    const form = document.getElementById('patient-form');
    if (form) {
      form.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => this.syncParamedicToER());
      });
    }
  },

  syncParamedicToER() {
    const state = window.AppState.get();

    // Read form values
    const pId = document.getElementById('patient-id');
    const age = document.getElementById('age');
    const gcs = document.getElementById('gcs');
    const hr = document.getElementById('hr');
    const spo2 = document.getElementById('spo2');
    const sbp = document.getElementById('sbp');
    const rr = document.getElementById('rr');
    const temp = document.getElementById('temp');
    const injury = document.getElementById('injury-type');
    const history = document.getElementById('history');

    if (pId) state.patient.id = pId.value || 'GH-2048';
    if (age) state.patient.age = +age.value || 42;
    if (gcs) state.patient.gcs = +gcs.value || 15;
    if (hr) state.patient.hr = +hr.value || 84;
    if (spo2) state.patient.spo2 = +spo2.value || 98;
    if (sbp) state.patient.sbp = +sbp.value || 122;
    if (rr) state.patient.rr = +rr.value || 16;
    if (temp) state.patient.temp = parseFloat(temp.value) || 36.8;
    if (injury) state.patient.injuryType = injury.value || 'trauma';
    if (history) state.patient.history = history.value || '';

    const { score } = window.TriageEngine.calculateNEWS2(state.patient);
    const isCritical = score >= 5 || state.patient.gcs <= 8;
    state.patient.triageScore = score;
    state.patient.isCritical = isCritical;

    // Update Paramedic Score Card
    const gcsVal = document.getElementById('gcs-val');
    const newsVal = document.getElementById('news-val');
    const paramScoreBox = document.getElementById('paramedic-score-box');
    const scoreTitle = document.getElementById('score-status-title');
    const scoreDesc = document.getElementById('score-status-desc');

    if (gcsVal) gcsVal.textContent = state.patient.gcs;
    if (newsVal) newsVal.textContent = score;

    if (paramScoreBox) {
      if (isCritical) {
        paramScoreBox.className = 'score-box critical';
        if (newsVal) newsVal.style.color = 'var(--red)';
        if (scoreTitle) scoreTitle.textContent = '🚨 CRITICAL RISK THRESHOLD CROSSED';
        if (scoreDesc) scoreDesc.textContent = `NEWS2 Score ${score} · Immediate ER preparation required!`;
      } else {
        paramScoreBox.className = 'score-box';
        if (newsVal) newsVal.style.color = 'var(--teal-light)';
        if (scoreTitle) scoreTitle.textContent = 'Clinical Risk Assessment';
        if (scoreDesc) scoreDesc.textContent = `NEWS2 Score ${score} (Stable / Low Risk)`;
      }
    }

    // Update ER Dashboard Fields
    const erPatientId = document.getElementById('er-patient-id');
    const erHr = document.getElementById('er-hr');
    const erSpo2 = document.getElementById('er-spo2');
    const erBp = document.getElementById('er-bp');
    const erRr = document.getElementById('er-rr');
    const erTemp = document.getElementById('er-temp');
    const erGcs = document.getElementById('er-gcs-display');
    const erNotes = document.getElementById('er-notes-display');

    if (erPatientId) erPatientId.textContent = state.patient.id;
    if (erHr) erHr.innerHTML = `${state.patient.hr} <small class="unit-label">bpm</small>`;
    if (erSpo2) erSpo2.textContent = `${state.patient.spo2}%`;
    if (erBp) erBp.textContent = `${state.patient.sbp}/80`;
    if (erRr) erRr.textContent = state.patient.rr;
    if (erTemp) erTemp.textContent = state.patient.temp;
    if (erGcs) erGcs.textContent = state.patient.gcs;
    if (erNotes) erNotes.textContent = state.patient.history;

    const erNewsDisplay = document.getElementById('er-news-display');
    if (erNewsDisplay) {
      erNewsDisplay.textContent = isCritical ? `${score} (CRITICAL HIGH RISK)` : `${score} (Low Risk)`;
      erNewsDisplay.style.color = isCritical ? 'var(--red)' : 'var(--teal-light)';
    }

    // Flashing Critical Banner in ER
    const erBanner = document.getElementById('er-critical-banner');
    const erReason = document.getElementById('er-critical-reason');
    if (erBanner) {
      if (isCritical) {
        erBanner.classList.remove('hidden');
        if (erReason) erReason.textContent = `GCS ${state.patient.gcs} · NEWS2 ${score}. Prepare Trauma Bay 1 & Doctor Chen immediately!`;
      } else {
        erBanner.classList.add('hidden');
      }
    }

    // Sync Overview
    this.syncOverview(score, isCritical);

    // Auto Capability Match
    window.RoutingEngine && window.RoutingEngine.autoSelectBestHospital();
  },

  syncOverview(score, isCritical) {
    const state = window.AppState.get();
    const ovId = document.getElementById('overview-patient-id');
    const ovRisk = document.getElementById('overview-risk-badge');
    const ovHr = document.getElementById('overview-hr');
    const ovSpo2 = document.getElementById('overview-spo2');
    const ovBp = document.getElementById('overview-bp');
    const ovGcs = document.getElementById('overview-gcs');
    const ovNews = document.getElementById('overview-news');
    const ovNotes = document.getElementById('overview-notes');

    if (ovId) ovId.textContent = state.patient.id;
    if (ovHr) ovHr.textContent = state.patient.hr;
    if (ovSpo2) ovSpo2.textContent = `${state.patient.spo2}%`;
    if (ovBp) ovBp.textContent = `${state.patient.sbp}/80`;
    if (ovGcs) ovGcs.textContent = state.patient.gcs;
    if (ovNews) ovNews.textContent = `NEWS2 ${score}`;
    if (ovNotes) ovNotes.textContent = state.patient.history;

    if (ovRisk) {
      ovRisk.className = isCritical ? 'badge badge-red' : 'badge badge-teal';
      ovRisk.textContent = isCritical ? 'CRITICAL' : 'STABLE';
    }
  },

  setupHandoff() {
    const genBtn = document.getElementById('generate-qr-btn');
    const scanBtn = document.getElementById('scan-qr-btn');

    if (genBtn) {
      genBtn.onclick = () => this.generateQR();
    }

    if (scanBtn) {
      scanBtn.onclick = () => this.scanQR();
    }
  },

  generateQR() {
    const qrArea = document.getElementById('qr-modal-area');
    const qrSvgHolder = document.getElementById('qr-svg-holder');
    if (!qrArea || !qrSvgHolder) return;

    qrArea.classList.remove('hidden');
    qrSvgHolder.innerHTML = `
      <svg class="qr-svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#ffffff"/>
        <rect x="10" y="10" width="25" height="25" fill="#0f766e"/>
        <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
        <rect x="18" y="18" width="9" height="9" fill="#0f766e"/>
        <rect x="65" y="10" width="25" height="25" fill="#0f766e"/>
        <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
        <rect x="73" y="18" width="9" height="9" fill="#0f766e"/>
        <rect x="10" y="65" width="25" height="25" fill="#0f766e"/>
        <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
        <rect x="18" y="73" width="9" height="9" fill="#0f766e"/>
        <rect x="42" y="42" width="16" height="16" fill="#f97316"/>
        <rect x="65" y="65" width="12" height="12" fill="#0f766e"/>
        <rect x="80" y="80" width="10" height="10" fill="#0f766e"/>
      </svg>
    `;
    this.showToast('Transfer QR Generated! Ready for ER Reception Scan.');
    window.AudioEngine && window.AudioEngine.playChime(800, 0.15);
  },

  scanQR() {
    const scanResult = document.getElementById('scan-result-box');
    if (scanResult) scanResult.classList.remove('hidden');

    const stepArrival = document.getElementById('step-arrival');
    const stepTreat = document.getElementById('step-treatment');
    if (stepArrival) stepArrival.className = 'timeline-step completed';
    if (stepTreat) {
      stepTreat.className = 'timeline-step active';
      const span = stepTreat.querySelector('span');
      if (span) span.textContent = '00:19 (ACTIVE)';
    }

    this.showToast('✓ Patient Data Synced into ER Electronic Health Record!');
    window.AudioEngine && window.AudioEngine.playChime(1000, 0.2);
  },

  setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        window.AppState.toggleDayNight();
      };
    }
    // Apply saved theme on boot
    window.AppState.setTheme(window.AppState.get().theme);
  },

  startGoldenHourCountdown() {
    let seconds = 3585;
    setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      const display = `${m}:${s}`;

      const el = document.getElementById('paramedic-countdown');
      if (el) el.textContent = display;
    }, 1000);
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }
};

window.UI = UI;
