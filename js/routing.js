// ==========================================================================
// Golden Hour — Intelligent Capability-Matched Hospital Routing & Corridor
// ==========================================================================

const RoutingEngine = {
  init() {
    this.renderParamedicHospitals();
    this.renderOverviewHospitals();
    this.renderERCapacity();
    this.renderSignals();
  },

  autoSelectBestHospital() {
    const state = window.AppState.get();
    const requiredSpecialty = state.patient.injuryType;
    let bestIdx = 0;

    const matchIdx = state.hospitalDirectory.findIndex(h => h.specialty === requiredSpecialty && h.beds > 0);
    if (matchIdx !== -1) {
      bestIdx = matchIdx;
    }

    this.selectHospital(bestIdx, false);
  },

  selectHospital(idx, userInitiated = true) {
    const state = window.AppState.get();
    state.selectedHospitalIndex = idx;
    const target = state.hospitalDirectory[idx];
    if (!target) return;

    // Update SVG Route Maps
    const svgPath = document.getElementById('svg-active-route');
    const svgDash = document.getElementById('svg-active-route-dash');
    const svgAmb = document.getElementById('svg-ambulance-marker');

    const overviewPath = document.getElementById('overview-active-route');
    const overviewDash = document.getElementById('overview-active-route-dash');
    const overviewAmb = document.getElementById('overview-ambulance-marker');

    if (svgPath) svgPath.setAttribute('d', target.routeSvg);
    if (svgDash) svgDash.setAttribute('d', target.routeSvg);
    if (svgAmb) svgAmb.setAttribute('transform', `translate(${target.ambPos.x}, ${target.ambPos.y})`);

    if (overviewPath) overviewPath.setAttribute('d', target.routeSvg);
    if (overviewDash) overviewDash.setAttribute('d', target.routeSvg);
    if (overviewAmb) overviewAmb.setAttribute('transform', `translate(${target.ambPos.x}, ${target.ambPos.y})`);

    // Update ER Destination details
    const erTarget = document.getElementById('er-target-hospital-name');
    const erEta = document.getElementById('er-eta-countdown');
    if (erTarget) erTarget.textContent = target.name;
    if (erEta) erEta.textContent = `${target.eta} 12s`;

    // Update Overview details
    const ovTarget = document.getElementById('overview-target-hospital');
    const ovEta = document.getElementById('overview-eta');
    const ovName = document.getElementById('overview-hospital-name');
    const ovHospEta = document.getElementById('overview-hospital-eta');
    const ovSpec = document.getElementById('overview-hospital-specialty');
    const ovBeds = document.getElementById('overview-hospital-beds');
    const ovDesc = document.getElementById('overview-hospital-desc');

    if (ovTarget) ovTarget.textContent = target.name;
    if (ovEta) ovEta.textContent = `${target.eta} 12s`;
    if (ovName) ovName.textContent = target.name;
    if (ovHospEta) ovHospEta.textContent = target.eta;
    if (ovSpec) ovSpec.textContent = target.specialty.toUpperCase();
    if (ovBeds) ovBeds.textContent = `${target.beds} available`;
    if (ovDesc) ovDesc.textContent = target.desc;

    // Update Registry Active Destination
    const regDest = document.getElementById('registry-active-destination');
    if (regDest) regDest.textContent = target.name;

    this.renderParamedicHospitals();
    this.renderOverviewHospitals();

    if (userInitiated) {
      window.UI && window.UI.showToast(`Corridor rerouted to ${target.name}`);
      window.AudioEngine && window.AudioEngine.playChime(600, 0.1);
    }
  },

  renderParamedicHospitals() {
    const container = document.getElementById('hospital-list-paramedic');
    if (!container) return;

    const state = window.AppState.get();
    container.innerHTML = state.hospitalDirectory.map((h, i) => {
      const isSelected = i === state.selectedHospitalIndex;
      const isMatch = h.specialty === state.patient.injuryType;

      return `
        <div class="hospital-card ${isSelected ? 'selected' : ''}" onclick="RoutingEngine.selectHospital(${i})">
          <div class="hospital-info">
            <h4>
              ${h.name}
              ${isMatch ? '<span class="badge badge-teal">CAPABILITY MATCH</span>' : ''}
            </h4>
            <p>${h.desc}</p>
          </div>
          <div class="hospital-meta">
            <strong>${h.beds} beds</strong>
            <span class="badge ${h.beds > 0 ? 'badge-orange' : 'badge-red'}">${h.eta}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderOverviewHospitals() {
    const container = document.getElementById('overview-hospital-list');
    if (!container) return;

    const state = window.AppState.get();
    container.innerHTML = state.hospitalDirectory.map((h, i) => {
      const isSelected = i === state.selectedHospitalIndex;
      return `
        <div class="overview-hospital-row ${isSelected ? 'selected' : ''}" onclick="RoutingEngine.selectHospital(${i})">
          <div>
            <strong>${h.name}</strong>
            <span>${h.desc}</span>
          </div>
          <div style="text-align: right;">
            <strong style="color: var(--teal-light);">${h.beds} beds</strong>
            <span>${h.eta}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderERCapacity() {
    const container = document.getElementById('er-bed-status-list');
    if (!container) return;

    const state = window.AppState.get();
    container.innerHTML = state.hospitalDirectory.map(h => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 8px;">
        <span style="font-size: 0.875rem; font-weight: 600;">${h.name}</span>
        <div style="text-align: right;">
          <strong style="display: block; color: var(--teal-light); font-size: 0.95rem;">${h.beds} beds</strong>
          <span class="badge ${h.beds > 0 ? 'badge-teal' : 'badge-red'}">${h.beds > 0 ? 'AVAILABLE' : 'FULL'}</span>
        </div>
      </div>
    `).join('');
  },

  renderSignals() {
    const containers = [document.getElementById('er-signals-container'), document.getElementById('overview-signals-container')];
    const state = window.AppState.get();

    containers.forEach(container => {
      if (!container) return;
      container.innerHTML = state.signals.map((sig, idx) => `
        <button class="signal-btn ${sig.status}" onclick="RoutingEngine.toggleSignal(${idx})">
          <span>🚦</span> ${sig.name}: <strong>${sig.status.toUpperCase()}</strong>
        </button>
      `).join('');
    });
  },

  toggleSignal(idx) {
    const state = window.AppState.get();
    const sig = state.signals[idx];
    if (!sig) return;

    sig.status = sig.status === 'cleared' ? 'pending' : 'cleared';
    this.renderSignals();
    window.UI && window.UI.showToast(`Traffic ${sig.name} updated to ${sig.status.toUpperCase()}!`);
    window.AudioEngine && window.AudioEngine.playChime(700, 0.1);
  },

  overrideAllSignals() {
    const state = window.AppState.get();
    state.signals.forEach(s => s.status = 'cleared');
    this.renderSignals();
    window.UI && window.UI.showToast('🚨 GREEN CORRIDOR ACTIVATED: All intersection signals CLEARED!');
    window.AudioEngine && window.AudioEngine.playCriticalAlarm();
  }
};

window.RoutingEngine = RoutingEngine;
