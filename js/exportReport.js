// ==========================================================================
// Golden Hour — Electronic Health Record (EHR) Clinical Report Generator
// ==========================================================================

const ExportReport = {
  generateReport(patientId) {
    const state = window.AppState.get();
    let patientData = null;

    if (patientId === state.patient.id) {
      patientData = {
        ...state.patient,
        destination: state.hospitalDirectory[state.selectedHospitalIndex].name,
        assignedDoctor: 'Dr. Robert Chen (Trauma Bay 1)'
      };
    } else {
      const found = state.patientRegistry.find(p => p.id === patientId);
      if (found) {
        patientData = {
          id: found.id,
          name: found.name,
          age: found.age,
          gender: 'Unspecified',
          gcs: found.gcs || 15,
          hr: 88,
          spo2: 97,
          sbp: 124,
          dbp: 80,
          rr: 16,
          temp: 36.9,
          injuryType: found.injury,
          history: `Emergency incident record: ${found.injury}`,
          triageScore: found.news,
          destination: found.hospital,
          timestamp: new Date().toLocaleTimeString()
        };
      }
    }

    if (!patientData) {
      window.UI && window.UI.showToast(`Patient record ${patientId} not found.`);
      return;
    }

    const { score, breakdown } = window.TriageEngine.calculateNEWS2(patientData);
    const risk = window.TriageEngine.getClinicalRiskLevel(score, patientData.gcs);

    // Open Modal with Printable Document
    const modalBackdrop = document.getElementById('report-modal-backdrop');
    const modalBody = document.getElementById('report-modal-body');
    if (!modalBackdrop || !modalBody) return;

    modalBody.innerHTML = `
      <div id="printable-handoff-report" style="font-family: var(--font-sans); color: #0f172a; line-height: 1.4; background: #ffffff; padding: 24px; border-radius: 8px;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.35rem; color: #0f766e; margin: 0; font-weight: 800;">GOLDEN HOUR CLINICAL TRANSIT HANDOFF RECORD</h1>
            <span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">Ambulance-to-Emergency Department Electronic Log · Team Aurora</span>
          </div>
          <div style="text-align: right;">
            <strong style="font-family: var(--font-mono); font-size: 1.1rem; color: #0f172a;">${patientData.id}</strong>
            <span style="display: block; font-size: 0.75rem; color: #64748b;">${new Date().toLocaleString()}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.85rem;">
          <div><strong>Patient Name:</strong> ${patientData.name || 'Jane Doe'}</div>
          <div><strong>Age / Gender:</strong> ${patientData.age} yrs / ${patientData.gender || 'F'}</div>
          <div><strong>Transit Unit:</strong> Ambulance 04 (Marcus Vance)</div>
          <div><strong>Destination:</strong> ${patientData.destination || 'CityCare Trauma'}</div>
          <div><strong>Triage Severity:</strong> <span style="font-weight: 700; color: ${score >= 5 ? '#dc2626' : '#0d9488'};">${risk.level}</span></div>
          <div><strong>NEWS2 Score:</strong> ${score} Points (GCS: ${patientData.gcs})</div>
        </div>

        <h3 style="font-size: 0.95rem; color: #0f766e; margin: 14px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">1. PHYSIOLOGICAL TELEMETRY AT HANDOFF</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.825rem; margin-bottom: 14px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 6px 10px;">VITAL SIGN</th>
              <th style="padding: 6px 10px;">MEASURED VALUE</th>
              <th style="padding: 6px 10px;">REFERENCE RANGE</th>
              <th style="padding: 6px 10px;">NEWS2 PTS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px;">Heart Rate (Pulse)</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.hr} bpm</td>
              <td style="padding: 6px 10px; color: #64748b;">51 - 90 bpm</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.hr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px;">Blood Pressure (Systolic)</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.sbp}/${patientData.dbp || 80} mmHg</td>
              <td style="padding: 6px 10px; color: #64748b;">111 - 219 mmHg</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.sbp}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px;">Oxygen Saturation (SpO2)</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.spo2}%</td>
              <td style="padding: 6px 10px; color: #64748b;">96% - 100%</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.spo2}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px;">Respiration Rate</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.rr} /min</td>
              <td style="padding: 6px 10px; color: #64748b;">12 - 20 /min</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.rr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px;">Core Temperature</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.temp}°C</td>
              <td style="padding: 6px 10px; color: #64748b;">36.1 - 38.0°C</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.temp}</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px;">Glasgow Coma Scale (GCS)</td>
              <td style="padding: 6px 10px; font-weight: 700;">${patientData.gcs} / 15</td>
              <td style="padding: 6px 10px; color: #64748b;">15 (Alert)</td>
              <td style="padding: 6px 10px; font-weight: 700;">+${breakdown.gcs}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 0.95rem; color: #0f766e; margin: 14px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">2. INCIDENT NARRATIVE & CLINICAL FIELD NOTES</h3>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 0.85rem; margin-bottom: 16px;">
          ${patientData.history || 'No field notes provided.'}
        </div>

        <div style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b;">
          <div>Paramedic Signature: <u>Marcus Vance, EMT-P #4092</u></div>
          <div>ER Receiving Clinician: <u>Dr. Robert Chen, MD</u></div>
        </div>
      </div>

      <div style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn-secondary" onclick="document.getElementById('report-modal-backdrop').classList.remove('active')">Close</button>
        <button class="btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>
    `;

    modalBackdrop.classList.add('active');
  }
};

window.ExportReport = ExportReport;
