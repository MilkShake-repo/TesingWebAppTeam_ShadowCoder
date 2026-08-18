# Golden Hour — Smart Ambulance-to-ER Emergency Telemetry Corridor

A responsive, modular, mission-critical web platform for Team Aurora's **Golden Hour: Smart Ambulance-to-ER Data Corridor**.

---

## 📁 Clean & Modular Architecture

```
TesingWebAppTeam_ShadowCoder/
├── index.html                  # Accessible, semantic HTML5 application layout
├── README.md                   # Documentation & feature guide
├── styles.css                  # Master CSS loader (clean @import architecture)
├── app.js                      # Root application entry point
├── assets/                     # Logos, medical icons, and diagrams
├── css/
│   ├── variables.css           # Design tokens, themes (Night Mode, Day Mode, Contrast)
│   ├── base.css                # Typography, global animations, keyframes, pulse effects
│   ├── components.css          # Cards, badges, buttons, touch steppers, score boxes, modals, toasts
│   ├── layout.css              # Header, navigation switcher, mobile bottom-bar, PC split-view
│   ├── overview.css            # Command overview layout, telemetry cards, live SVG corridor map
│   ├── paramedic.css           # Paramedic tablet, rapid presets, OCR drug scanner, voice dictation
│   ├── er.css                  # ER trauma monitor, live ECG canvas container, transit timeline
│   ├── admin.css               # Hospital capacity matrix, department bed allocators, on-call doctors
│   ├── advanced.css            # Telemetry Audio, ECG waveforms, EHR printing
│   └── responsive.css          # Viewport optimizations for Mobile (320px-768px), Tablet, Desktop & 4K
└── js/
    ├── state.js                # Centralized reactive state store, localStorage persistence & event bus
    ├── triage.js               # NEWS2 clinical scoring engine & GCS risk breakdown modal
    ├── ecg.js                  # 60 FPS Canvas dynamic Lead II ECG & SpO2 Pleth waveform generator
    ├── audio.js                # Web Audio API telemetry sound synthesizer & critical alarm chimes
    ├── voice.js                # Web Speech API + clinical NLP voice vitals parser
    ├── ocr.js                  # Medication bottle OCR scanner simulation & active compound matching
    ├── routing.js              # SVG corridor map, dynamic ETA countdown & traffic signal override
    ├── hospitalAdmin.js        # Live department bed allocator, on-call doctor roster & queue diversion
    ├── fleetOps.js             # Ambulance fleet matrix, dispatch simulator & patient registry filter
    ├── exportReport.js         # Clinical handoff electronic record generator (Printable / PDF report)
    ├── telemetry.js            # Simulated live ambient corridor data streamer (vitals jitter + GPS progress)
    ├── ui.js                   # UI controllers, thumb steppers (+/-), presets, modals & toast engine
    └── app.js                  # Master application lifecycle bootstrapper
```

---

## 🚑 Key Features

### 🌟 Easy-to-Use Field Tools (Paramedics & First Responders)
- **One-Touch Clinical Case Presets**: Instant loading for Severe Fracture, Acute STEMI / Chest Pain, Traumatic Brain Injury (GCS 7), Severe Asthma, and Anaphylaxis.
- **One-Thumb Vital Steppers (`+` / `-`)**: Mobile-first touch steppers to adjust Heart Rate, SpO2, Blood Pressure, Respiration, GCS, and Temperature without keyboard clutter.
- **Voice Dictation**: Speech-to-text with automatic extraction of physiological keywords (`"Heart rate 118, oxygen 91, breathing 24, temp 38.2"`).
- **Neural OCR Medication Scanner**: Drag-and-drop or tap to scan pill bottle photos for instant active drug compound extraction.
- **Mobile Ergonomic Bottom Navigation Bar**: Fixed bottom thumb bar on mobile with active indicators and instant voice trigger button.
- **Digital Handoff QR Token**: Instant encrypted QR handshake generated on the tablet and scannable at ER arrival.

### ⚡ Advanced & Power-User Tools (ER Clinicians & Dispatch Commanders)
- **Real-Time Lead II ECG & Plethysmograph Canvas (60 FPS)**: Live dynamic ECG waveform trace synchronizing sweep speed and QRS complex to patient heart rate.
- **Simulated Corridor Telemetry Engine**: Live ambient fluctuation streamer that simulates real-time vitals jitter and GPS progression with traffic clearance.
- **Green Corridor Signal Override Controller**: Manually clear traffic signals along the route (Signal #1, #2, #3) to ensure uninterrupted transit.
- **Interactive Clinical NEWS2 Breakdown**: Clickable score badges displaying physiological point breakdown across all 6 clinical parameters.
- **Global Patient Emergency Registry**: Real-time multi-criteria search, severity filter (Critical, Moderate, Stable), and **1-Click Clinical EHR PDF/Print Report Generator**.
- **Web Audio API Telemetry Synthesizer**: Realistic QRS heart beeps, critical alert chimes, and push notifications with 1-click mute control (`M`).
- **Dual Split-View Mode (PC)**: Simultaneous side-by-side Paramedic intake and ER monitoring for desktop command centers (`S`).
- **Night & Day Modes**: Seamless switching between Dark Command Center (`🌙 Night Mode`) and Clean Clinical Light (`☀️ Day Mode`) with persistent memory (`D`).

---

## 🚀 How to Run

Simply open [`index.html`](file:///e:/VSproject/TestApps/Shadow_coder/TesingWebAppTeam_ShadowCoder/index.html) in any modern browser (Chrome, Edge, Safari, Firefox). No build or compile step is required.
