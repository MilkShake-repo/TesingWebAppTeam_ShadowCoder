// ==========================================================================
// Golden Hour — Hospital Administration & Resource Allocator
// ==========================================================================

const HospitalAdmin = {
  init() {
    this.renderBedsTable();
  },

  renderBedsTable() {
    const tbody = document.getElementById('hospital-admin-beds-tbody');
    const totalBedsEl = document.getElementById('admin-total-beds');
    if (!tbody) return;

    const state = window.AppState.get();
    let totalBeds = 0;

    tbody.innerHTML = state.hospitalAdmin.departments.map((dept, i) => {
      totalBeds += dept.beds;
      return `
        <tr>
          <td><strong>${dept.name}</strong></td>
          <td><span class="badge badge-teal">${dept.specialty.toUpperCase()}</span></td>
          <td><strong style="color: var(--teal-light); font-family: var(--font-mono); font-size: 1.05rem;">${dept.beds} Beds</strong></td>
          <td><span class="badge ${dept.beds > 0 ? 'badge-teal' : 'badge-red'}">${dept.status}</span></td>
          <td>
            <div class="bed-control">
              <button class="bed-btn" onclick="HospitalAdmin.updateBeds(${i}, -1)" title="Decrease Bed Capacity">-</button>
              <button class="bed-btn" onclick="HospitalAdmin.updateBeds(${i}, 1)" title="Increase Bed Capacity">+</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (totalBedsEl) totalBedsEl.textContent = `${totalBeds} Available`;
  },

  updateBeds(idx, delta) {
    const state = window.AppState.get();
    const dept = state.hospitalAdmin.departments[idx];
    if (!dept || !Number.isFinite(delta)) return;

    dept.beds = Math.max(0, dept.beds + delta);
    dept.status = dept.beds > 0 ? 'AVAILABLE' : 'FULL / DIVERT';

    // Sync trauma department directly to CityCare hospital entry
    if (idx === 0) {
      state.hospitalDirectory[0].beds = dept.beds;
    }

    this.renderBedsTable();
    window.RoutingEngine && window.RoutingEngine.renderParamedicHospitals();
    window.RoutingEngine && window.RoutingEngine.renderERCapacity();
    window.RoutingEngine && window.RoutingEngine.renderOverviewHospitals();

    window.UI && window.UI.showToast(`Updated capacity: ${dept.name} (${dept.beds} Beds)`);
    window.AudioEngine && window.AudioEngine.playChime(500, 0.1);
  },

  assignBay(patientId, bayNumber) {
    window.UI && window.UI.showToast(`Assigned Patient ${patientId} to Trauma Bay ${bayNumber} · Notified Dr. Chen`);
    window.AudioEngine && window.AudioEngine.playChime(880, 0.2);
  },

  divertPatient(patientId) {
    window.UI && window.UI.showToast(`Patient ${patientId} rerouted to Northside Medical Center (Cath Lab Active)`);
    window.RoutingEngine && window.RoutingEngine.selectHospital(1, true);
  }
};

window.HospitalAdmin = HospitalAdmin;
