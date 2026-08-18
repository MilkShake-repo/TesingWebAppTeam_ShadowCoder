// Golden Hour — Application Engine & Simulation Logic

// --- 1. State & Data Models ---
const state = {
  activeMode: 'split', // 'split', 'paramedic', 'er', 'hospital-admin', 'patient-admin'
  patient: {
    id: 'GH-2048',
    age: 42,
    gcs: 15,
    hr: 84,
    spo2: 98,
    sbp: 122,
    rr: 16,
    temp: 36.8,
    injuryType: 'trauma',
    history: 'Roadside accident. Patient conscious, complaining of acute localized pain. No known drug allergies.'
  },
  selectedHospitalIndex: 0,
  // Patient-facing directory. Availability is published from hospital-admin data;
  // this area never owns or edits hospital capacity.
  hospitalDirectory: [
    {
      name: 'CityCare Trauma Centre',
      specialty: 'trauma',
      desc: 'Trauma · ICU · Emergency Surgery',
      beds: 7,
      eta: '08 min',
      routeSvg: 'M 60 160 L 200 160 L 200 60 L 400 60 L 520 60',
      ambPos: { x: 300, y: 60 }
    },
    {
      name: 'Northside Medical',
      specialty: 'cardiology',
      desc: 'Emergency · Cardiology · CT',
      beds: 3,
      eta: '11 min',
      routeSvg: 'M 60 160 L 200 160 L 400 160',
      ambPos: { x: 300, y: 160 }
    },
    {
      name: 'Green Valley Hospital',
      specialty: 'neurology',
      desc: 'Emergency · Neurology · ICU',
      beds: 5,
      eta: '14 min',
      routeSvg: 'M 60 160 L 200 160 L 200 210',
      ambPos: { x: 200, y: 185 }
    }
  ],
  // Hospital-only operational data. Bed updates are allowed only from this model.
  hospitalAdmin: {
    departments: [
      { name: 'Emergency Trauma Bay', specialty: 'trauma', beds: 7, status: 'AVAILABLE' },
      { name: 'Intensive Care Unit (ICU)', specialty: 'general', beds: 3, status: 'HIGH OCCUPANCY' },
      { name: 'Cardiology Resus', specialty: 'cardiology', beds: 3, status: 'AVAILABLE' },
      { name: 'Stroke & Neurology Unit', specialty: 'neurology', beds: 5, status: 'AVAILABLE' }
    ]
  }
};

// --- 2. Initial Setup & View Switcher ---
document.addEventListener('DOMContentLoaded', () => {
  setupViewSwitcher();
  setupPresets();
  setupVoiceInput();
  setupOCR();
  setupFormListeners();
  setupQRAndHandoff();
  setupAdminForms();
  startCountdownTimers();
  
  // Initial render & sync
  renderHospitals();
  renderERCapacity();
  renderHospitalAdminBeds();
  syncParamedicToER();
});

function setupViewSwitcher() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      state.activeMode = mode;
      document.body.className = `mode-${mode}`;
      showToast(`Switched view to ${btn.textContent}`);
    };
  });
}

// --- 3. NEWS2 & Clinical Scoring Engine ---
function calculateNEWS2(vitals) {
  let score = 0;

  // Respiration Rate
  if (vitals.rr <= 8) score += 3;
  else if (vitals.rr >= 9 && vitals.rr <= 11) score += 1;
  else if (vitals.rr >= 21 && vitals.rr <= 24) score += 2;
  else if (vitals.rr >= 25) score += 3;

  // SpO2
  if (vitals.spo2 <= 91) score += 3;
  else if (vitals.spo2 === 92 || vitals.spo2 === 93) score += 2;
  else if (vitals.spo2 === 94 || vitals.spo2 === 95) score += 1;

  // Systolic BP
  if (vitals.sbp <= 90) score += 3;
  else if (vitals.sbp >= 91 && vitals.sbp <= 100) score += 2;
  else if (vitals.sbp >= 101 && vitals.sbp <= 110) score += 1;
  else if (vitals.sbp >= 220) score += 3;

  // Heart Rate
  if (vitals.hr <= 40) score += 3;
  else if (vitals.hr >= 41 && vitals.hr <= 50) score += 1;
  else if (vitals.hr >= 91 && vitals.hr <= 110) score += 1;
  else if (vitals.hr >= 111 && vitals.hr <= 130) score += 2;
  else if (vitals.hr >= 131) score += 3;

  // Temperature
  if (vitals.temp <= 35.0) score += 3;
  else if (vitals.temp >= 35.1 && vitals.temp <= 36.0) score += 1;
  else if (vitals.temp >= 38.1 && vitals.temp <= 39.0) score += 1;
  else if (vitals.temp >= 39.1) score += 2;

  // Consciousness / GCS
  if (vitals.gcs < 15) score += 3;

  return score;
}

// --- 4. Synchronize Paramedic Input -> ER & Admin Panels ---
function syncParamedicToER() {
  state.patient.id = document.getElementById('patient-id').value || 'GH-2048';
  state.patient.age = +document.getElementById('age').value || 42;
  state.patient.gcs = +document.getElementById('gcs').value || 15;
  state.patient.hr = +document.getElementById('hr').value || 84;
  state.patient.spo2 = +document.getElementById('spo2').value || 98;
  state.patient.sbp = +document.getElementById('sbp').value || 122;
  state.patient.rr = +document.getElementById('rr').value || 16;
  state.patient.temp = parseFloat(document.getElementById('temp').value) || 36.8;
  state.patient.injuryType = document.getElementById('injury-type').value;
  state.patient.history = document.getElementById('history').value || '';

  const newsScore = calculateNEWS2(state.patient);
  const isCritical = newsScore >= 5 || state.patient.gcs <= 8;

  // Update Paramedic Score Card
  const gcsVal = document.getElementById('gcs-val');
  const newsVal = document.getElementById('news-val');
  const paramScoreBox = document.getElementById('paramedic-score-box');
  const scoreTitle = document.getElementById('score-status-title');
  const scoreDesc = document.getElementById('score-status-desc');

  if (gcsVal) gcsVal.textContent = state.patient.gcs;
  if (newsVal) newsVal.textContent = newsScore;

  if (paramScoreBox) {
    if (isCritical) {
      paramScoreBox.className = 'score-box critical';
      newsVal.style.color = '#dc2626';
      scoreTitle.textContent = '🚨 CRITICAL RISK THRESHOLD CROSSED';
      scoreDesc.textContent = `NEWS2 Score ${newsScore} · Immediate ER preparation required!`;
    } else {
      paramScoreBox.className = 'score-box';
      newsVal.style.color = 'var(--teal)';
      scoreTitle.textContent = 'Clinical Risk Assessment';
      scoreDesc.textContent = `NEWS2 Indicator Score: ${newsScore} (Stable / Low Risk)`;
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
  if (erHr) erHr.innerHTML = `${state.patient.hr} <small style="font-size: 11px; font-weight: normal;">bpm</small>`;
  if (erSpo2) erSpo2.textContent = `${state.patient.spo2}%`;
  if (erBp) erBp.textContent = `${state.patient.sbp}/80`;
  if (erRr) erRr.textContent = state.patient.rr;
  if (erTemp) erTemp.textContent = state.patient.temp;
  if (erGcs) erGcs.textContent = state.patient.gcs;
  if (erNotes) erNotes.textContent = state.patient.history;

  const erNewsDisplay = document.getElementById('er-news-display');
  if (erNewsDisplay) {
    erNewsDisplay.textContent = isCritical ? `${newsScore} (CRITICAL HIGH RISK)` : `${newsScore} (Low Risk)`;
    erNewsDisplay.style.color = isCritical ? '#dc2626' : 'var(--teal-dark)';
  }

  // Flashing Critical Banner
  const erBanner = document.getElementById('er-critical-banner');
  const erReason = document.getElementById('er-critical-reason');
  if (erBanner) {
    if (isCritical) {
      erBanner.style.display = 'flex';
      erReason.textContent = `GCS Score ${state.patient.gcs} · NEWS2 Indicator ${newsScore}. Prepare Trauma Bay 1 & Specialist Unit immediately!`;
    } else {
      erBanner.style.display = 'none';
    }
  }

  // Admin Queue Updates
  const adminQueueSeverity = document.getElementById('admin-queue-severity');
  if (adminQueueSeverity) {
    adminQueueSeverity.className = isCritical ? 'badge badge-red' : 'badge badge-teal';
    adminQueueSeverity.textContent = isCritical ? `NEWS2: ${newsScore} (Critical)` : `NEWS2: ${newsScore} (Stable)`;
  }

  const registryScore = document.getElementById('registry-gh2048-score');
  if (registryScore) {
    registryScore.className = isCritical ? 'badge badge-red' : 'badge badge-teal';
    registryScore.textContent = isCritical ? `${newsScore} (Critical)` : `${newsScore} (Stable)`;
  }

  const registryId = document.getElementById('registry-active-id');
  const registryAge = document.getElementById('registry-active-age');
  const registryInjury = document.getElementById('registry-active-injury');
  const adminQueuePatientId = document.getElementById('admin-queue-patient-id');
  if (registryId) registryId.textContent = state.patient.id;
  if (registryAge) registryAge.textContent = state.patient.age;
  if (registryInjury) registryInjury.textContent = `${state.patient.injuryType} emergency`;
  if (adminQueuePatientId) adminQueuePatientId.textContent = state.patient.id;

  autoSelectBestHospital();
}

function setupFormListeners() {
  const form = document.getElementById('patient-form');
  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', syncParamedicToER);
    });
  }
}

// --- 5. Single-Tap Presets ---
function setupPresets() {
  const presets = {
    fracture: {
      hr: 88, spo2: 98, sbp: 122, rr: 16, temp: 36.8, gcs: 15,
      injuryType: 'trauma',
      history: 'Roadside collision. Suspected limb fracture. Patient conscious, reporting localized pain.'
    },
    chest: {
      hr: 112, spo2: 94, sbp: 148, rr: 22, temp: 37.1, gcs: 15,
      injuryType: 'cardiology',
      history: 'Acute retrosternal chest pain radiating to left shoulder. Shortness of breath reported.'
    },
    unconscious: {
      hr: 126, spo2: 89, sbp: 88, rr: 28, temp: 37.4, gcs: 7,
      injuryType: 'neurology',
      history: 'Unconscious following severe vehicle impact. Airway compromise risk. Critical GCS 7.'
    }
  };

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.onclick = () => {
      const p = presets[btn.dataset.preset];
      if (!p) return;

      document.getElementById('hr').value = p.hr;
      document.getElementById('spo2').value = p.spo2;
      document.getElementById('sbp').value = p.sbp;
      document.getElementById('rr').value = p.rr;
      document.getElementById('temp').value = p.temp;
      document.getElementById('gcs').value = p.gcs;
      document.getElementById('injury-type').value = p.injuryType;
      document.getElementById('history').value = p.history;

      syncParamedicToER();
      showToast(`Preset loaded: ${btn.textContent}`);
    };
  });
}

// --- 6. Voice-to-Vitals Keyword Parser ---
function parseVoiceVitalsText(text) {
  let matched = [];

  const hrMatch = text.match(/(?:heart rate|pulse|hr)\s*(?:is|=|:)?\s*(\d+)/i);
  if (hrMatch) { document.getElementById('hr').value = hrMatch[1]; matched.push(`HR: ${hrMatch[1]}`); }

  const spo2Match = text.match(/(?:oxygen|spo2|o2)\s*(?:is|=|:)?\s*(\d+)/i);
  if (spo2Match) { document.getElementById('spo2').value = spo2Match[1]; matched.push(`SpO2: ${spo2Match[1]}`); }

  const sbpMatch = text.match(/(?:blood pressure|sbp|bp)\s*(?:is|=|:)?\s*(\d+)/i);
  if (sbpMatch) { document.getElementById('sbp').value = sbpMatch[1]; matched.push(`SBP: ${sbpMatch[1]}`); }

  const rrMatch = text.match(/(?:respiratory|respiration|breathing|rr)\s*(?:is|=|:)?\s*(\d+)/i);
  if (rrMatch) { document.getElementById('rr').value = rrMatch[1]; matched.push(`RR: ${rrMatch[1]}`); }

  const tempMatch = text.match(/(?:temperature|temp)\s*(?:is|=|:)?\s*([\d\.]+)/i);
  if (tempMatch) { document.getElementById('temp').value = tempMatch[1]; matched.push(`Temp: ${tempMatch[1]}`); }

  const gcsMatch = text.match(/(?:gcs|coma scale)\s*(?:is|=|:)?\s*(\d+)/i);
  if (gcsMatch) { document.getElementById('gcs').value = gcsMatch[1]; matched.push(`GCS: ${gcsMatch[1]}`); }

  document.getElementById('history').value += ` [Voice Note: ${text}]`;
  syncParamedicToER();
  return matched;
}

function setupVoiceInput() {
  const voiceBtn = document.getElementById('voice-btn');
  const simSelect = document.getElementById('simulated-voice-select');
  const simBtn = document.getElementById('sim-voice-btn');

  if (voiceBtn) {
    voiceBtn.onclick = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Web Speech API not supported in browser. Use dropdown test phrases!');
        return;
      }

      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      voiceBtn.textContent = '🔴 Listening…';

      rec.onresult = e => {
        const transcript = e.results[0][0].transcript;
        voiceBtn.textContent = '🎙 Start Voice Input';
        const parsed = parseVoiceVitalsText(transcript);
        showToast(parsed.length ? `Voice Parsed: ${parsed.join(', ')}` : 'Captured voice note!');
      };

      rec.onerror = () => {
        voiceBtn.textContent = '🎙 Start Voice Input';
        showToast('Microphone inactive. Test using the phrase dropdown!');
      };

      rec.start();
    };
  }

  if (simBtn) {
    simBtn.onclick = () => {
      const val = simSelect.value;
      if (!val) {
        showToast('Select a phrase from the dropdown first!');
        return;
      }
      const parsed = parseVoiceVitalsText(val);
      showToast(`Simulated Voice Parsed: ${parsed.join(', ')}`);
    };
  }
}

// --- 7. Simulated Medicine Photo OCR ---
function setupOCR() {
  const ocrContainer = document.getElementById('ocr-box-container');
  const ocrInput = document.getElementById('medicine-file');
  const previewArea = document.getElementById('ocr-preview-area');
  const titleEl = document.getElementById('ocr-detected-title');
  const textEl = document.getElementById('ocr-detected-text');

  if (!ocrContainer) return;

  ocrContainer.onclick = () => ocrInput.click();

  ocrInput.onchange = () => {
    if (!ocrInput.files || !ocrInput.files[0]) return;

    ocrContainer.classList.add('scan-active');
    previewArea.style.display = 'flex';
    titleEl.textContent = 'Scanning Medicine Bottle via OCR…';
    textEl.textContent = 'Analyzing text & matching drug database…';

    setTimeout(() => {
      ocrContainer.classList.remove('scan-active');
      const sampleMeds = ['Aspirin 81mg', 'Clopidogrel 75mg', 'Nitroglycerin 0.4mg'];
      const detected = sampleMeds.slice(0, 2).join(', ');

      titleEl.textContent = '✓ OCR Detection Complete';
      textEl.textContent = `Identified: ${detected}`;

      const historyEl = document.getElementById('history');
      historyEl.value += `\n[OCR Meds: ${detected}]`;
      syncParamedicToER();

      showToast(`OCR Scan Extracted: ${detected}`);
    }, 1600);
  };
}

// --- 8. Capability-Matched Routing & Map ---
function autoSelectBestHospital() {
  const requiredSpecialty = state.patient.injuryType;
  let bestIdx = 0;

  const matchIdx = state.hospitalDirectory.findIndex(h => h.specialty === requiredSpecialty && h.beds > 0);
  if (matchIdx !== -1) {
    bestIdx = matchIdx;
  }

  selectHospital(bestIdx, false);
}

function selectHospital(idx, userInitiated = true) {
  state.selectedHospitalIndex = idx;
  const target = state.hospitalDirectory[idx];

  const svgPath = document.getElementById('svg-active-route');
  const svgDash = document.getElementById('svg-active-route-dash');
  const svgAmb = document.getElementById('svg-ambulance-marker');
  const erTargetName = document.getElementById('er-target-hospital-name');
  const erEta = document.getElementById('er-eta-countdown');
  const adminQueueEta = document.getElementById('admin-queue-eta');

  if (svgPath) svgPath.setAttribute('d', target.routeSvg);
  if (svgDash) svgDash.setAttribute('d', target.routeSvg);
  if (svgAmb) svgAmb.setAttribute('transform', `translate(${target.ambPos.x}, ${target.ambPos.y})`);
  if (erTargetName) erTargetName.textContent = target.name;
  if (erEta) erEta.textContent = `${target.eta} 12s`;
  if (adminQueueEta) adminQueueEta.textContent = target.eta;
  const registryDestination = document.getElementById('registry-active-destination');
  if (registryDestination) registryDestination.textContent = target.name;

  renderHospitals();
  if (userInitiated) {
    showToast(`Route updated to ${target.name}`);
  }
}

function renderHospitals() {
  const container = document.getElementById('hospital-list-paramedic');
  if (!container) return;

  container.innerHTML = state.hospitalDirectory.map((h, i) => {
    const isSelected = i === state.selectedHospitalIndex;
    const isMatch = h.specialty === state.patient.injuryType;

    return `
      <div class="hospital-card ${isSelected ? 'selected' : ''}" onclick="selectHospital(${i})">
        <div class="hospital-info">
          <h4>${h.name} ${isMatch ? '<span class="badge badge-teal">CAPABILITY MATCH</span>' : ''}</h4>
          <p>${h.desc}</p>
        </div>
        <div style="text-align: right;">
          <strong style="display: block; font-size: 16px; color: var(--teal-dark);">${h.beds} beds</strong>
          <span class="badge badge-orange">${h.eta}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderERCapacity() {
  const container = document.getElementById('er-bed-status-list');
  if (!container) return;

  container.innerHTML = state.hospitalDirectory.map((h, i) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 6px;">
      <span style="font-size: 13px; font-weight: 600;">${h.name}</span>
      <div style="text-align: right;">
        <strong style="display: block; color: var(--teal-dark);">${h.beds} beds</strong>
        <span class="badge ${h.beds > 0 ? 'badge-teal' : 'badge-red'}">${h.beds > 0 ? 'AVAILABLE' : 'FULL'}</span>
      </div>
    </div>
  `).join('');
}

function renderHospitalAdminBeds() {
  const tbody = document.getElementById('hospital-admin-beds-tbody');
  const totalBedsEl = document.getElementById('admin-total-beds');
  if (!tbody) return;

  let totalBeds = 0;
  tbody.innerHTML = state.hospitalAdmin.departments.map((d, i) => {
    totalBeds += d.beds;
    return `
      <tr>
        <td><strong>${d.name}</strong></td>
        <td><span class="badge badge-teal">${d.specialty.toUpperCase()}</span></td>
        <td><strong style="color: var(--teal-dark);">${d.beds} Beds</strong></td>
        <td><span class="badge ${d.beds > 0 ? 'badge-teal' : 'badge-red'}">${d.status}</span></td>
        <td>
          <div class="bed-control">
            <button class="bed-btn" onclick="updateDeptBeds(${i}, -1)">-</button>
            <button class="bed-btn" onclick="updateDeptBeds(${i}, 1)">+</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (totalBedsEl) totalBedsEl.textContent = `${totalBeds} Available`;
}

window.updateDeptBeds = (idx, delta) => {
  const department = state.hospitalAdmin.departments[idx];
  if (!department || !Number.isFinite(delta)) return;
  department.beds = Math.max(0, department.beds + delta);
  department.status = department.beds > 0 ? 'AVAILABLE' : 'FULL / DIVERT';
  
  // Sync to CityCare Trauma in main list
  state.hospitalDirectory[0].beds = state.hospitalAdmin.departments[0].beds;

  renderHospitals();
  renderERCapacity();
  renderHospitalAdminBeds();
  syncParamedicToER();
  showToast(`Hospital capacity updated: ${department.name}`);
};

// --- 9. QR Code Generation & ER Scanner Simulation ---
function setupQRAndHandoff() {
  const genBtn = document.getElementById('generate-qr-btn');
  const qrArea = document.getElementById('qr-modal-area');
  const qrSvgHolder = document.getElementById('qr-svg-holder');

  const scanBtn = document.getElementById('scan-qr-btn');
  const scanResult = document.getElementById('scan-result-box');

  if (genBtn) {
    genBtn.onclick = () => {
      qrArea.style.display = 'block';
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
      showToast('Transfer QR Code generated for GH-2048!');
    };
  }

  if (scanBtn) {
    scanBtn.onclick = () => {
      scanResult.style.display = 'block';
      document.getElementById('step-arrival').className = 'timeline-step completed';
      document.getElementById('step-treatment').className = 'timeline-step active';
      document.getElementById('step-treatment').querySelector('span').textContent = '00:19 (ACTIVE)';

      showToast('✓ ER Scanner: Patient GH-2048 handoff complete!');
    };
  }
}

// --- 10. Admin Forms & Timers ---
function setupAdminForms() {
  const dispatchForm = document.getElementById('dispatch-form');
  if (dispatchForm) {
    dispatchForm.onsubmit = e => {
      e.preventDefault();
      const loc = document.getElementById('dispatch-loc').value;
      const unit = document.getElementById('dispatch-unit').value;
      showToast(`🚨 Dispatched ${unit} to ${loc}!`);
    };
  }
}

function startCountdownTimers() {
  let seconds = 3585;
  setInterval(() => {
    seconds = Math.max(0, seconds - 1);
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    const display = `${m}:${s}`;

    const paramCountdown = document.getElementById('paramedic-countdown');
    if (paramCountdown) paramCountdown.textContent = display;
  }, 1000);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
