// ==========================================================================
// Golden Hour — Speech-to-Clinical NLP Voice Parser
// ==========================================================================

const VoiceEngine = {
  recognition: null,
  isListening: false,

  init() {
    const voiceBtn = document.getElementById('voice-btn');
    const simSelect = document.getElementById('simulated-voice-select');
    const simBtn = document.getElementById('sim-voice-btn');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (voiceBtn) {
          voiceBtn.innerHTML = '🔴 Listening… Speak vitals';
          voiceBtn.classList.add('btn-danger');
        }
      };

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        this.resetButton(voiceBtn);
        const matched = this.parseTranscript(transcript);
        window.UI && window.UI.showToast(matched.length ? `Parsed: ${matched.join(', ')}` : `Voice note: "${transcript}"`);
      };

      this.recognition.onerror = (e) => {
        this.resetButton(voiceBtn);
        window.UI && window.UI.showToast('Microphone inactive. Select a test phrase below.');
      };

      this.recognition.onend = () => {
        this.resetButton(voiceBtn);
      };
    }

    if (voiceBtn) {
      voiceBtn.onclick = () => this.toggleListening();
    }

    if (simBtn && simSelect) {
      simBtn.onclick = () => {
        const val = simSelect.value;
        if (!val) {
          window.UI && window.UI.showToast('Please select a test phrase from the dropdown first!');
          return;
        }
        const matched = this.parseTranscript(val);
        window.UI && window.UI.showToast(`Simulated Voice: ${matched.join(', ')}`);
      };
    }
  },

  resetButton(btn) {
    this.isListening = false;
    if (btn) {
      btn.innerHTML = '🎙 Start Voice Dictation';
      btn.classList.remove('btn-danger');
    }
  },

  toggleListening() {
    if (!this.recognition) {
      window.UI && window.UI.showToast('Speech API not supported in browser. Use dropdown test phrases!');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        this.recognition.stop();
      }
    }
  },

  parseTranscript(text) {
    const matched = [];

    // Heart Rate / Pulse
    const hrMatch = text.match(/(?:heart\s*rate|pulse|hr)\s*(?:is|=|:)?\s*(\d+)/i);
    if (hrMatch) {
      const hrInput = document.getElementById('hr');
      if (hrInput) hrInput.value = hrMatch[1];
      matched.push(`HR ${hrMatch[1]}`);
    }

    // Oxygen / SpO2
    const spo2Match = text.match(/(?:oxygen|spo2|o2|sat|saturation)\s*(?:is|=|:)?\s*(\d+)/i);
    if (spo2Match) {
      const spo2Input = document.getElementById('spo2');
      if (spo2Input) spo2Input.value = spo2Match[1];
      matched.push(`SpO2 ${spo2Match[1]}%`);
    }

    // Blood Pressure / SBP
    const bpMatch = text.match(/(?:blood\s*pressure|sbp|bp)\s*(?:is|=|:)?\s*(\d+)(?:\s*(?:over|\/)\s*(\d+))?/i);
    if (bpMatch) {
      const sbpInput = document.getElementById('sbp');
      if (sbpInput) sbpInput.value = bpMatch[1];
      matched.push(`BP ${bpMatch[1]}${bpMatch[2] ? '/' + bpMatch[2] : ''}`);
    }

    // Respiration Rate / Breathing
    const rrMatch = text.match(/(?:respiratory|respiration|breathing|breaths|rr)\s*(?:is|=|:)?\s*(\d+)/i);
    if (rrMatch) {
      const rrInput = document.getElementById('rr');
      if (rrInput) rrInput.value = rrMatch[1];
      matched.push(`RR ${rrMatch[1]}`);
    }

    // Body Temperature
    const tempMatch = text.match(/(?:temperature|temp|fever)\s*(?:is|=|:)?\s*([\d\.]+)/i);
    if (tempMatch) {
      const tempInput = document.getElementById('temp');
      if (tempInput) tempInput.value = tempMatch[1];
      matched.push(`Temp ${tempMatch[1]}°C`);
    }

    // GCS Score / Coma Scale
    const gcsMatch = text.match(/(?:gcs|coma\s*scale|glasgow)\s*(?:is|=|:)?\s*(\d+)/i);
    if (gcsMatch) {
      const gcsInput = document.getElementById('gcs');
      if (gcsInput) gcsInput.value = gcsMatch[1];
      matched.push(`GCS ${gcsMatch[1]}`);
    }

    // Append to Clinical History Notes
    const historyEl = document.getElementById('history');
    if (historyEl) {
      historyEl.value += `\n[Voice Note: ${text}]`;
    }

    // Trigger full app sync
    window.AppState && window.AppState.emit('patientUpdated');

    return matched;
  }
};

window.VoiceEngine = VoiceEngine;
