// ==========================================================================
// Golden Hour — Clinical Triage & NEWS2 / GCS Engine
// ==========================================================================

const TriageEngine = {
  /**
   * National Early Warning Score 2 (NEWS2) Standard Scoring
   */
  calculateNEWS2(vitals) {
    let score = 0;
    const breakdown = {
      rr: 0,
      spo2: 0,
      sbp: 0,
      hr: 0,
      temp: 0,
      gcs: 0
    };

    // Respiration Rate (breaths/min)
    if (vitals.rr <= 8) { score += 3; breakdown.rr = 3; }
    else if (vitals.rr >= 9 && vitals.rr <= 11) { score += 1; breakdown.rr = 1; }
    else if (vitals.rr >= 12 && vitals.rr <= 20) { score += 0; breakdown.rr = 0; }
    else if (vitals.rr >= 21 && vitals.rr <= 24) { score += 2; breakdown.rr = 2; }
    else if (vitals.rr >= 25) { score += 3; breakdown.rr = 3; }

    // SpO2 (%)
    if (vitals.spo2 <= 91) { score += 3; breakdown.spo2 = 3; }
    else if (vitals.spo2 === 92 || vitals.spo2 === 93) { score += 2; breakdown.spo2 = 2; }
    else if (vitals.spo2 === 94 || vitals.spo2 === 95) { score += 1; breakdown.spo2 = 1; }
    else { score += 0; breakdown.spo2 = 0; }

    // Systolic Blood Pressure (mmHg)
    if (vitals.sbp <= 90) { score += 3; breakdown.sbp = 3; }
    else if (vitals.sbp >= 91 && vitals.sbp <= 100) { score += 2; breakdown.sbp = 2; }
    else if (vitals.sbp >= 101 && vitals.sbp <= 110) { score += 1; breakdown.sbp = 1; }
    else if (vitals.sbp >= 111 && vitals.sbp <= 219) { score += 0; breakdown.sbp = 0; }
    else if (vitals.sbp >= 220) { score += 3; breakdown.sbp = 3; }

    // Heart Rate (bpm)
    if (vitals.hr <= 40) { score += 3; breakdown.hr = 3; }
    else if (vitals.hr >= 41 && vitals.hr <= 50) { score += 1; breakdown.hr = 1; }
    else if (vitals.hr >= 51 && vitals.hr <= 90) { score += 0; breakdown.hr = 0; }
    else if (vitals.hr >= 91 && vitals.hr <= 110) { score += 1; breakdown.hr = 1; }
    else if (vitals.hr >= 111 && vitals.hr <= 130) { score += 2; breakdown.hr = 2; }
    else if (vitals.hr >= 131) { score += 3; breakdown.hr = 3; }

    // Body Temperature (°C)
    if (vitals.temp <= 35.0) { score += 3; breakdown.temp = 3; }
    else if (vitals.temp >= 35.1 && vitals.temp <= 36.0) { score += 1; breakdown.temp = 1; }
    else if (vitals.temp >= 36.1 && vitals.temp <= 38.0) { score += 0; breakdown.temp = 0; }
    else if (vitals.temp >= 38.1 && vitals.temp <= 39.0) { score += 1; breakdown.temp = 1; }
    else if (vitals.temp >= 39.1) { score += 2; breakdown.temp = 2; }

    // Consciousness / GCS Score (AVPU scale mapped)
    if (vitals.gcs < 15) {
      score += 3;
      breakdown.gcs = 3;
    }

    return { score, breakdown };
  },

  getClinicalRiskLevel(newsScore, gcs) {
    if (newsScore >= 7 || gcs <= 8) {
      return {
        level: 'CRITICAL HIGH RISK (Tier 3)',
        color: 'var(--red)',
        badgeClass: 'badge badge-red',
        actionRequired: '🚨 Immediate Emergency Medical Team & Specialist Activation Required!'
      };
    } else if (newsScore >= 5 || newsScore === 3 || (gcs >= 9 && gcs <= 13)) {
      return {
        level: 'MODERATE RISK (Tier 2)',
        color: 'var(--orange)',
        badgeClass: 'badge badge-orange',
        actionRequired: '⚠️ Urgent clinical review and continuous vital telemetry.'
      };
    } else {
      return {
        level: 'LOW RISK (Tier 1)',
        color: 'var(--teal)',
        badgeClass: 'badge badge-teal',
        actionRequired: '✓ Ward / routine emergency triage observation.'
      };
    }
  },

  renderBreakdownModal(patient) {
    const { score, breakdown } = this.calculateNEWS2(patient);
    const risk = this.getClinicalRiskLevel(score, patient.gcs);

    const modalBackdrop = document.getElementById('clinical-modal-backdrop');
    const modalContent = document.getElementById('clinical-modal-body');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.15rem; color: var(--ink-primary);">Clinical Score & NEWS2 Breakdown</h3>
        <span class="${risk.badgeClass}">TOTAL: ${score}</span>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <strong style="color: ${risk.color}; display: block; font-size: 0.95rem;">${risk.level}</strong>
        <p style="font-size: 0.85rem; margin-top: 4px; color: var(--ink-secondary);">${risk.actionRequired}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-medium); text-align: left;">
            <th style="padding: 8px; color: var(--ink-secondary); font-size: 0.75rem;">PARAMETER</th>
            <th style="padding: 8px; color: var(--ink-secondary); font-size: 0.75rem;">PATIENT VALUE</th>
            <th style="padding: 8px; color: var(--ink-secondary); font-size: 0.75rem; text-align: right;">NEWS2 PTS</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px;">Respiration Rate</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.rr} /min</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.rr > 0 ? 'var(--orange)' : 'var(--teal)'};">+${breakdown.rr}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px;">Oxygen Saturation (SpO2)</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.spo2}%</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.spo2 > 0 ? 'var(--orange)' : 'var(--teal)'};">+${breakdown.spo2}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px;">Systolic Blood Pressure</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.sbp} mmHg</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.sbp > 0 ? 'var(--orange)' : 'var(--teal)'};">+${breakdown.sbp}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px;">Heart Rate (Pulse)</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.hr} bpm</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.hr > 0 ? 'var(--orange)' : 'var(--teal)'};">+${breakdown.hr}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px;">Body Temperature</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.temp}°C</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.temp > 0 ? 'var(--orange)' : 'var(--teal)'};">+${breakdown.temp}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Consciousness (GCS)</td>
            <td style="padding: 8px; font-family: var(--font-mono);">${patient.gcs}/15</td>
            <td style="padding: 8px; font-weight: 700; text-align: right; color: ${breakdown.gcs > 0 ? 'var(--red)' : 'var(--teal)'};">+${breakdown.gcs}</td>
          </tr>
        </tbody>
      </table>
    `;

    modalBackdrop.classList.add('active');
  }
};

window.TriageEngine = TriageEngine;
