// ==========================================================================
// Golden Hour — Central Reactive State Store & Event Bus
// ==========================================================================

const savedTheme = (() => {
  try { return localStorage.getItem('gh_theme') || 'dark'; } catch(e) { return 'dark'; }
})();

const state = {
  activeMode: 'paramedic', // 'overview', 'paramedic', 'er', 'hospital-admin', 'patient-admin', 'split'
  theme: savedTheme, // 'dark', 'light', 'contrast'
  audioMuted: true,
  autoStreamActive: false,

  patient: {
    id: 'GH-2048',
    name: 'Jane Doe',
    age: 42,
    gender: 'Female',
    gcs: 15,
    hr: 84,
    spo2: 98,
    sbp: 122,
    dbp: 80,
    rr: 16,
    temp: 36.8,
    injuryType: 'trauma',
    history: 'Roadside accident. Patient conscious, complaining of acute localized pain. No known drug allergies.',
    medications: [],
    triageScore: 0,
    isCritical: false,
    timestamp: new Date().toLocaleTimeString()
  },

  selectedHospitalIndex: 0,

  hospitalDirectory: [
    {
      id: 'hosp-1',
      name: 'CityCare Trauma Centre',
      specialty: 'trauma',
      desc: 'Trauma · ICU · Emergency Surgery',
      beds: 7,
      eta: '08 min',
      routeSvg: 'M 60 160 L 200 160 L 200 60 L 400 60 L 520 60',
      ambPos: { x: 300, y: 60 }
    },
    {
      id: 'hosp-2',
      name: 'Northside Medical Center',
      specialty: 'cardiology',
      desc: 'Emergency · Cardiology · Cath Lab',
      beds: 3,
      eta: '11 min',
      routeSvg: 'M 60 160 L 200 160 L 400 160',
      ambPos: { x: 300, y: 160 }
    },
    {
      id: 'hosp-3',
      name: 'Green Valley Neurological',
      specialty: 'neurology',
      desc: 'Emergency · Neurology · Stroke ICU',
      beds: 5,
      eta: '14 min',
      routeSvg: 'M 60 160 L 200 160 L 200 210',
      ambPos: { x: 200, y: 185 }
    }
  ],

  hospitalAdmin: {
    departments: [
      { id: 'dept-1', name: 'Emergency Trauma Bay', specialty: 'trauma', beds: 7, status: 'AVAILABLE' },
      { id: 'dept-2', name: 'Intensive Care Unit (ICU)', specialty: 'general', beds: 3, status: 'HIGH OCCUPANCY' },
      { id: 'dept-3', name: 'Cardiology Resus / Cath Lab', specialty: 'cardiology', beds: 3, status: 'AVAILABLE' },
      { id: 'dept-4', name: 'Stroke & Neurology Unit', specialty: 'neurology', beds: 5, status: 'AVAILABLE' }
    ]
  },

  signals: [
    { id: 1, name: 'Signal #1 (Main St & 4th Ave)', status: 'cleared' },
    { id: 2, name: 'Signal #2 (Park Ave Corridor)', status: 'cleared' },
    { id: 3, name: 'Signal #3 (ER Emergency Ramp)', status: 'clearing' }
  ],

  patientRegistry: [
    { id: 'GH-2048', name: 'Jane Doe', age: 42, injury: 'Roadside Accident (Trauma)', news: 0, gcs: 15, severity: 'Stable', hospital: 'CityCare Trauma Centre', status: 'En Route (08m)' },
    { id: 'GH-2047', name: 'Arthur Pendelton', age: 68, injury: 'Acute STEMI / Cardiac', news: 8, gcs: 14, severity: 'Critical', hospital: 'Northside Medical Center', status: 'In ER Cath Lab' },
    { id: 'GH-2046', name: 'Samantha Reed', age: 31, injury: 'Closed Tibia Fracture', news: 1, gcs: 15, severity: 'Stable', hospital: 'Green Valley Neurological', status: 'Admitted' },
    { id: 'GH-2045', name: 'Marcus Brody', age: 55, injury: 'Acute Ischemic Stroke', news: 7, gcs: 8, severity: 'Critical', hospital: 'CityCare Trauma Centre', status: 'ICU Transferred' },
    { id: 'GH-2044', name: 'Leo Martinez', age: 8, injury: 'Pediatric Asthma Exacerbation', news: 5, gcs: 15, severity: 'Moderate', hospital: 'CityCare Trauma Centre', status: 'Observation' }
  ],

  listeners: {}
};

// Event Bus
window.AppState = {
  get: () => state,

  on(event, callback) {
    if (!state.listeners[event]) state.listeners[event] = [];
    state.listeners[event].push(callback);
  },

  emit(event, data) {
    if (state.listeners[event]) {
      state.listeners[event].forEach(cb => {
        try { cb(data); } catch (err) { console.error('Event error:', err); }
      });
    }
  },

  setMode(mode) {
    state.activeMode = mode;
    document.body.className = `mode-${mode} theme-${state.theme}`;
    
    // Update active nav buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.mode === mode);
    });

    this.emit('modeChanged', mode);
  },

  setTheme(theme) {
    state.theme = theme;
    try { localStorage.setItem('gh_theme', theme); } catch(e) {}
    document.body.className = `mode-${state.activeMode} theme-${theme}`;
    
    // Update button text / icon (shows target mode to switch to)
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      if (theme === 'light') {
        themeBtn.innerHTML = '<span class="btn-icon-symbol">🌙</span><span class="btn-label">Night Mode</span>';
        themeBtn.title = 'Switch to Night Mode (D)';
      } else {
        themeBtn.innerHTML = '<span class="btn-icon-symbol">☀️</span><span class="btn-label">Day Mode</span>';
        themeBtn.title = 'Switch to Day Mode (D)';
      }
    }

    this.emit('themeChanged', theme);
  },

  toggleDayNight() {
    const next = state.theme === 'light' ? 'dark' : 'light';
    this.setTheme(next);
    window.UI && window.UI.showToast(`Switched to ${next === 'light' ? '☀️ Day Mode' : '🌙 Night Mode'}`);
  }
};
