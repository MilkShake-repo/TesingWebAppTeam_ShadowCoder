// ==========================================================================
// Golden Hour — Fleet Dispatch & Global Patient Emergency Registry
// ==========================================================================

const FleetOps = {
  searchQuery: '',
  severityFilter: 'all',

  init() {
    this.setupDispatchForm();
    this.setupRegistryToolbar();
    this.renderPatientRegistry();
  },

  setupDispatchForm() {
    const form = document.getElementById('dispatch-form');
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      const loc = document.getElementById('dispatch-loc').value || 'Highway 101, Marker 42';
      const sev = document.getElementById('dispatch-sev').value;
      const unit = document.getElementById('dispatch-unit').value || 'Unit 01';

      window.UI && window.UI.showToast(`🚨 DISPATCHED ${unit} to ${loc} [${sev.toUpperCase()}]`);
      window.AudioEngine && window.AudioEngine.playCriticalAlarm();

      // Add to patient registry
      const newId = `GH-${Math.floor(2050 + Math.random() * 50)}`;
      window.AppState.get().patientRegistry.unshift({
        id: newId,
        name: 'New Intake (Dispatched)',
        age: 35,
        injury: `Incident at ${loc}`,
        news: sev === 'high' ? 7 : (sev === 'med' ? 4 : 1),
        gcs: sev === 'high' ? 8 : 15,
        severity: sev === 'high' ? 'Critical' : (sev === 'med' ? 'Moderate' : 'Stable'),
        hospital: 'CityCare Trauma Centre',
        status: `${unit} Dispatched`
      });

      this.renderPatientRegistry();
      form.reset();
    };
  },

  setupRegistryToolbar() {
    const searchInput = document.getElementById('registry-search-input');
    const filterSelect = document.getElementById('registry-filter-select');

    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderPatientRegistry();
      };
    }

    if (filterSelect) {
      filterSelect.onchange = (e) => {
        this.severityFilter = e.target.value;
        this.renderPatientRegistry();
      };
    }
  },

  renderPatientRegistry() {
    const tbody = document.getElementById('patient-registry-tbody');
    if (!tbody) return;

    const state = window.AppState.get();
    const filtered = state.patientRegistry.filter(p => {
      const matchSearch = p.id.toLowerCase().includes(this.searchQuery) ||
                          p.name.toLowerCase().includes(this.searchQuery) ||
                          p.injury.toLowerCase().includes(this.searchQuery) ||
                          p.hospital.toLowerCase().includes(this.searchQuery);
      
      const matchSev = this.severityFilter === 'all' || p.severity.toLowerCase() === this.severityFilter.toLowerCase();
      return matchSearch && matchSev;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--ink-muted); padding: 20px;">
            No patient records match the search or filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const isCrit = p.severity === 'Critical';
      const isMod = p.severity === 'Moderate';
      const badgeClass = isCrit ? 'badge badge-red' : (isMod ? 'badge badge-orange' : 'badge badge-teal');

      return `
        <tr>
          <td><strong style="color: var(--teal-light); font-family: var(--font-mono);">${p.id}</strong></td>
          <td>${p.name || 'Anonymous'} (${p.age})</td>
          <td>${p.injury}</td>
          <td><span class="${badgeClass}">NEWS2: ${p.news} (${p.severity})</span></td>
          <td>${p.hospital}</td>
          <td><span class="badge badge-gray">${p.status}</span></td>
          <td>
            <button class="btn-secondary table-action" onclick="ExportReport.generateReport('${p.id}')" title="Export clinical transit EHR report">
              📄 Export EHR
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
};

window.FleetOps = FleetOps;
