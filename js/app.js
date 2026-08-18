// ==========================================================================
// Golden Hour — Application Master Engine Bootstrapper
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚑 Initializing Golden Hour Smart Emergency Platform...');

  // Initialize UI & Core Modules
  window.UI.init();
  window.TriageEngine;
  window.ECGMonitor.init();
  window.AudioEngine.init();
  window.VoiceEngine.init();
  window.OCREngine.init();
  window.RoutingEngine.init();
  window.HospitalAdmin.init();
  window.FleetOps.init();
  window.TelemetryEngine.init();

  // Initial Sync & First Render
  window.UI.syncParamedicToER();
  window.AppState.setMode('paramedic');

  console.log('✓ Golden Hour Platform Ready.');
});
