import { useEffect, useState } from "react";
import {
  Activity,
  Ambulance,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  HeartPulse,
  Hospital,
  MapPin,
  Mic,
  Navigation,
  Plus,
  Radio,
  Route,
  ShieldCheck,
  Square,
  X,
  Maximize2,
  CheckCircle2,
  Phone,
} from "lucide-react";
import "./index.css";
import "./brand.css";

const hospitals = [
  {
    id: "h1",
    name: "St. Catherine Trauma Centre",
    eta: "8 min",
    distance: "3.2 km",
    beds: 12,
    icuBeds: 4,
    accent: "teal",
    status: "Government · Trauma + ICU",
    capabilities: ["Level 1 Trauma", "Neurosurgery", "Cath Lab"],
  },
  {
    id: "h2",
    name: "Riverside General Hospital",
    eta: "11 min",
    distance: "4.7 km",
    beds: 6,
    icuBeds: 2,
    accent: "lavender",
    status: "Private · Trauma + ICU",
    capabilities: ["Stroke Centre", "Cardiac Care", "CT/MRI"],
  },
  {
    id: "h3",
    name: "City Medical Institute",
    eta: "14 min",
    distance: "6.1 km",
    beds: 2,
    icuBeds: 1,
    accent: "amber",
    status: "Government · Emergency care",
    capabilities: ["General ER", "Burn Unit"],
  },
  {
    id: "h4",
    name: "Green Valley Multispeciality",
    eta: "16 min",
    distance: "7.4 km",
    beds: 8,
    icuBeds: 3,
    accent: "teal",
    status: "Private · Emergency + CT",
    capabilities: ["Pediatric ER", "Orthopedics"],
  },
  {
    id: "h5",
    name: "Bengaluru Civic Hospital",
    eta: "19 min",
    distance: "8.8 km",
    beds: 4,
    icuBeds: 0,
    accent: "lavender",
    status: "Government · Emergency care",
    capabilities: ["General Triage", "Basic ICU"],
  },
];

const mockIncomingCases = [
  {
    id: "ASVA-1248",
    patientName: "Unknown Patient",
    ageEst: "34–42 est.",
    incident: "Road Traffic Accident",
    priority: "High priority",
    eta: "8 min",
    ambulanceReg: "KA 01 AB 7812",
    location: "Koramangala 80ft Rd",
    consciousness: "Conscious",
    injuries: ["Head injury", "Bleeding"],
    vitals: { heartRate: "118", spo2: "93", bp: "104/68" },
    sent: true,
  },
  {
    id: "ASVA-1239",
    patientName: "R. Kumar",
    ageEst: "58 yrs",
    incident: "Acute Cardiac Distress",
    priority: "Critical",
    eta: "13 min",
    ambulanceReg: "KA 03 MF 0912",
    location: "Indiranagar 100ft Rd",
    consciousness: "Conscious",
    injuries: ["Chest pain", "Breathing difficulty"],
    vitals: { heartRate: "132", spo2: "90", bp: "150/95" },
    sent: true,
  },
  {
    id: "ASVA-1231",
    patientName: "S. Patel",
    ageEst: "29 yrs",
    incident: "Fall from height",
    priority: "Review",
    eta: "18 min",
    ambulanceReg: "KA 05 NR 2944",
    location: "HSR Layout Sector 1",
    consciousness: "Unconscious",
    injuries: ["Fracture", "Head injury"],
    vitals: { heartRate: "94", spo2: "97", bp: "118/75" },
    sent: false,
  },
];

const mockFleet = [
  { id: "KA 01 AB 7812", caseId: "ASVA-1248", destination: "St. Catherine Trauma Centre", eta: "08 min", status: "En Route to Hospital", driver: "A. Kumar / P. Singh", speed: "48 km/h" },
  { id: "KA 03 MF 0912", caseId: "ASVA-1239", destination: "Riverside General Hospital", eta: "13 min", status: "En Route to Hospital", driver: "M. Sharma", speed: "52 km/h" },
  { id: "KA 05 NR 2944", caseId: "ASVA-1231", destination: "City Medical Institute", eta: "18 min", status: "En Route to Hospital", driver: "R. Reddy", speed: "42 km/h" },
  { id: "KA 02 ET 4401", caseId: "Idle", destination: "Base Station 4", eta: "--", status: "Available", driver: "V. Nair", speed: "0 km/h" },
];

const mockCorridors = [
  { id: "C1", name: "Green Corridor A: Koramangala -> St. Catherine", distance: "3.2 km", signals: 6, cleared: 4, activeAmbulance: "KA 01 AB 7812", status: "Priority Active" },
  { id: "C2", name: "Green Corridor B: Indiranagar -> Riverside", distance: "4.7 km", signals: 8, cleared: 5, activeAmbulance: "KA 03 MF 0912", status: "Priority Active" },
  { id: "C3", name: "Corridor C: HSR Sector 1 -> City Medical", distance: "6.1 km", signals: 9, cleared: 2, activeAmbulance: "KA 05 NR 2944", status: "Monitoring" },
];

function Brand() {
  return (
    <div className="brand">
      <img className="brand-logo" src="/asva-removebg-preview.png" alt="ASVA" />
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

function Glass({ className = "", children }) {
  return <section className={`glass ${className}`}>{children}</section>;
}

export default function App() {
  const [role, setRole] = useState("ambulance");
  const [active, setActive] = useState("command");
  const [tracking, setTracking] = useState(false);
  const [listening, setListening] = useState(false);
  const [sent, setSent] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [phase, setPhase] = useState("pickup"); // 'pickup' | 'shortlist' | 'capture'
  const [selectedHospital, setSelectedHospital] = useState(null);
  
  // Vitals & patient workspace state
  const [vitals, setVitals] = useState({
    heartRate: "118",
    spo2: "93",
    bp: "104/68",
  });
  const [chips, setChips] = useState(["Bleeding", "Head injury"]);
  const [consciousness, setConsciousness] = useState("Conscious");

  // Interaction extras
  const [selectedQueueCase, setSelectedQueueCase] = useState(mockIncomingCases[0]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedMap, setExpandedMap] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([
    { time: "13:32", title: "Emergency Dispatch Assigned", desc: "KA 01 AB 7812 dispatched to Koramangala 80ft Rd.", status: "complete" },
    { time: "13:35", title: "En Route to Patient", desc: "Live navigation started. Pickup ETA 3 min.", status: "complete" },
  ]);

  // Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Dispatch Broadcast Sent", time: "Just now", text: "KA 01 AB 7812 telemetry online.", type: "info" },
    { id: 2, title: "Traffic Alert", time: "2 min ago", text: "Koramangala 80ft Rd junction pre-cleared.", type: "success" },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSetPhase = (newPhase) => {
    setPhase(newPhase);
    if (newPhase === "shortlist") {
      setTimelineEvents((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), title: "Patient Contact Established", desc: "Patient Found tapped by crew. Hospital search initiated.", status: "complete" }
      ]);
      setNotifications((prev) => [
        { id: Date.now(), title: "Patient Found", time: "Just now", text: "Crew made contact with patient.", type: "warning" },
        ...prev
      ]);
    }
  };

  const handleSelectHospital = (h) => {
    setSelectedHospital(h);
    setTracking(true);
    setPhase("capture");
    setTimelineEvents((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), title: "Destination Hospital Confirmed", desc: `Selected ${h.name} (${h.eta}). Transport data shared automatically.`, status: "complete" }
    ]);
    setNotifications((prev) => [
      { id: Date.now(), title: "Hospital Selected", time: "Just now", text: `En route to ${h.name}`, type: "success" },
      ...prev
    ]);
    showToast(`Selected ${h.name}. Route & ETA established.`);
  };

  const handleSendSnapshot = () => {
    setSent(true);
    setTimelineEvents((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), title: "Clinical Snapshot Delivered", desc: `Vitals (HR: ${vitals.heartRate}, SpO2: ${vitals.spo2}%) sent to hospital intake team.`, status: "complete" }
    ]);
    setNotifications((prev) => [
      { id: Date.now(), title: "Vitals Sent", time: "Just now", text: "Hospital intake dashboard updated with verified snapshot.", type: "success" },
      ...prev
    ]);
    showToast("Clinical snapshot successfully sent to hospital ER!");
  };

  // Voice capture simulation & Web Speech API fallback
  useEffect(() => {
    if (!listening) return;

    let recognition = null;
    let timer = null;

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ")
          .toLowerCase();

        if (transcript.includes("unconscious")) setConsciousness("Unconscious");
        if (transcript.includes("conscious") && !transcript.includes("unconscious")) setConsciousness("Conscious");
        if (transcript.includes("breathing") || transcript.includes("shortness of breath")) {
          setChips((prev) => prev.includes("Breathing difficulty") ? prev : [...prev, "Breathing difficulty"]);
        }
        if (transcript.includes("chest pain")) {
          setChips((prev) => prev.includes("Chest pain") ? prev : [...prev, "Chest pain"]);
        }
        if (transcript.includes("fracture")) {
          setChips((prev) => prev.includes("Fracture") ? prev : [...prev, "Fracture"]);
        }
        const hrMatch = transcript.match(/(?:heart rate|pulse|hr)\s*(?:is|=|of)?\s*(\d{2,3})/);
        if (hrMatch && hrMatch[1]) {
          setVitals((prev) => ({ ...prev, heartRate: hrMatch[1] }));
        }
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }

    timer = setTimeout(() => {
      setListening(false);
      setChips((prev) => prev.includes("Breathing difficulty") ? prev : [...prev, "Breathing difficulty"]);
      showToast("Voice capture completed & structured data extracted.");
    }, 4500);

    return () => {
      if (recognition) recognition.stop();
      if (timer) clearTimeout(timer);
    };
  }, [listening]);

  const nav =
    role === "hospital"
      ? [
          ["intake", "Incoming queue", Hospital],
          ["capacity", "Capacity board", Activity],
          ["referrals", "Referrals", Route],
        ]
      : role === "traffic"
        ? [
            ["traffic", "Live operations", Navigation],
            ["corridors", "Priority corridors", Route],
            ["fleet", "Ambulance fleet", Ambulance],
          ]
        : [
            ["command", "Active journey", Ambulance],
            ["patient", "Patient workspace", HeartPulse],
            ["timeline", "Journey timeline", Clock3],
          ];

  return (
    <div className="app-shell">
      {/* Toast popup */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <Brand />
        <div className="role-switch">
          <button
            className={role === "ambulance" ? "selected" : ""}
            onClick={() => {
              setRole("ambulance");
              setActive("command");
            }}
          >
            <Ambulance size={16} />
            Crew
          </button>
          <button
            className={role === "hospital" ? "selected" : ""}
            onClick={() => {
              setRole("hospital");
              setActive("intake");
            }}
          >
            <Hospital size={16} />
            Hospital
          </button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={active === id ? "nav-active" : ""}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={role === "traffic" ? "nav-active" : ""}
            onClick={() => {
              setRole("traffic");
              setActive("traffic");
            }}
          >
            <Radio size={18} />
            Traffic control
          </button>
          <div className="secure">
            <ShieldCheck size={15} />
            Secure session · ASVA-1248
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main>
        {/* Mobile Navigation Header Bar */}
        <div className="mobile-header">
          <img src="/asva-removebg-preview.png" alt="ASVA" className="mobile-logo" />
          <div className="mobile-role-selector">
            <button
              className={role === "ambulance" ? "active-role" : ""}
              onClick={() => { setRole("ambulance"); setActive("command"); }}
            >
              Crew
            </button>
            <button
              className={role === "hospital" ? "active-role" : ""}
              onClick={() => { setRole("hospital"); setActive("intake"); }}
            >
              Hospital
            </button>
            <button
              className={role === "traffic" ? "active-role" : ""}
              onClick={() => { setRole("traffic"); setActive("traffic"); }}
            >
              Traffic
            </button>
          </div>
        </div>

        {/* Mobile Sub-Tab Navigation Bar */}
        <div className="mobile-tabs">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={active === id ? "mobile-tab-active" : ""}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <header className="topbar">
          <div>
            <p className="eyebrow">
              {role === "ambulance"
                ? phase === "pickup"
                  ? "DISPATCH · EN ROUTE TO PATIENT"
                  : phase === "shortlist"
                    ? "PATIENT CONTACT ESTABLISHED · SELECT HOSPITAL"
                    : "EN ROUTE TO DEFINITIVE CARE"
                : role === "hospital"
                  ? "HOSPITAL INTAKE & TRIAGE COMMAND"
                  : "TRAFFIC CORRIDOR CONTROL"}
            </p>
            <h1>
              {role === "hospital"
                ? active === "capacity"
                  ? "Hospital Capacity & Bed Board"
                  : active === "referrals"
                    ? "Inter-Hospital Referrals"
                    : "Incoming Patient Command"
                : role === "traffic"
                  ? active === "corridors"
                    ? "Priority Green Corridors"
                    : active === "fleet"
                      ? "Ambulance Fleet Operations"
                      : "Traffic Coordination Centre"
                  : active === "patient"
                    ? "Patient Assessment & Data Capture"
                    : active === "timeline"
                      ? "Emergency Journey Timeline"
                      : phase === "pickup"
                        ? "Pickup Navigation"
                        : "Emergency Response Command"}
            </h1>
          </div>
          <div className="header-actions">
            <Pill tone={tracking ? "live" : "warning"}>
              <span className="live-dot" />
              {tracking ? "Tracking active" : "Pickup navigation"}
            </Pill>
            <button
              className={`icon-button ${showNotifications ? "active-bell" : ""}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={19} />
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>
            <div className="avatar">AK</div>
          </div>
        </header>

        {/* Notifications Slide-over Drawer */}
        {showNotifications && (
          <NotificationsDrawer
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {/* View Switcher Logic */}
        {role === "hospital" ? (
          active === "capacity" ? (
            <CapacityView showToast={showToast} />
          ) : active === "referrals" ? (
            <ReferralView setShowReferral={setShowReferral} />
          ) : (
            <HospitalView
              sent={sent}
              vitals={vitals}
              consciousness={consciousness}
              chips={chips}
              selectedHospital={selectedHospital}
              setShowReferral={setShowReferral}
              selectedQueueCase={selectedQueueCase}
              setSelectedQueueCase={setSelectedQueueCase}
              onExpandMap={() => setExpandedMap(true)}
            />
          )
        ) : role === "traffic" ? (
          active === "corridors" ? (
            <CorridorsView showToast={showToast} />
          ) : active === "fleet" ? (
            <FleetView showToast={showToast} />
          ) : (
            <TrafficView showToast={showToast} onExpandMap={() => setExpandedMap(true)} />
          )
        ) : (
          /* Crew Role */
          active === "patient" ? (
            <PatientWorkspaceView
              {...{
                listening, setListening,
                sent,
                vitals, setVitals,
                chips, setChips,
                consciousness, setConsciousness,
                selectedHospital,
                handleSendSnapshot,
              }}
            />
          ) : active === "timeline" ? (
            <TimelineView events={timelineEvents} />
          ) : (
            <AmbulanceView
              {...{
                listening, setListening,
                sent,
                vitals, setVitals,
                chips, setChips,
                consciousness, setConsciousness,
                phase,
                setPhase: handleSetPhase,
                selectedHospital,
                setSelectedHospital: handleSelectHospital,
                handleSendSnapshot,
                onExpandMap: () => setExpandedMap(true),
              }}
            />
          )
        )}
      </main>

      {/* Referral QR Code Handoff Modal */}
      {showReferral && <ReferralModal onClose={() => setShowReferral(false)} selectedHospital={selectedHospital} />}

      {/* Expanded Fullscreen Map Modal */}
      {expandedMap && (
        <ExpandedMapModal
          onClose={() => setExpandedMap(false)}
          selectedHospital={selectedHospital}
          phase={phase}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   DYNAMIC MAP COMPONENT
   ========================================================================== */
function MapCard({ selectedHospital, phase = "capture", onExpand }) {
  const isPickup = phase === "pickup";
  const targetName = isPickup
    ? "80ft Road, Koramangala (Patient Location)"
    : selectedHospital
      ? selectedHospital.name
      : "St. Catherine Trauma Centre";
  const targetEta = isPickup ? "03 min" : selectedHospital ? selectedHospital.eta : "08 min";

  return (
    <Glass className="map-card">
      <div className="map-grid">
        <div className="map-road road-a" />
        <div className="map-road road-b" />
        <div className="map-road road-c" />
        <div className="route-line">
          <i />
          <i />
          <i />
        </div>
        <div className="map-label label-a">M.G. ROAD</div>
        <div className="map-label label-b">RING ROAD</div>
        <div className="hospital-pin">
          {isPickup ? <MapPin size={17} /> : <Hospital size={17} />}
        </div>
        <div className="ambulance-pin">
          <Ambulance size={18} />
        </div>
        <div className="traffic-dot t1" />
        <div className="traffic-dot t2" />
      </div>
      <div className="map-top">
        <Pill tone="live">
          <span className="live-dot" /> {isPickup ? "EN ROUTE TO PATIENT" : "LIVE ROUTE TO HOSPITAL"}
        </Pill>
        <button className="map-expand" onClick={onExpand} title="Expand Map">
          <Maximize2 size={16} />
        </button>
      </div>
      <div className="route-summary">
        <div>
          <span className="muted">{isPickup ? "Target Location" : "Destination"}</span>
          <strong>{targetName}</strong>
        </div>
        <div>
          <span className="muted">ETA</span>
          <strong className="eta">{targetEta}</strong>
        </div>
        <ChevronRight size={20} />
      </div>
    </Glass>
  );
}

/* ==========================================================================
   CREW VIEWS
   ========================================================================== */
function AmbulanceView(p) {
  if (p.phase !== "capture") return <PickupFlow {...p} />;

  return (
    <div className="content-grid ambulance-layout">
      <div className="route-column">
        <div className="case-strip">
          <Pill tone="critical">
            <CircleAlert size={14} />
            HIGH PRIORITY
          </Pill>
          <span>ASVA-1248</span>
          <span className="divider" />
          <span>KA 01 AB 7812</span>
          <span className="divider" />
          <span>
            <MapPin size={14} />
            Koramangala, Bengaluru
          </span>
        </div>
        <MapCard selectedHospital={p.selectedHospital} phase={p.phase} onExpand={p.onExpandMap} />
        <Glass className="route-options">
          <div className="section-head">
            <div>
              <p className="eyebrow">DESTINATION CONFIRMED</p>
              <h2>{p.selectedHospital?.name || "St. Catherine Trauma Centre"}</h2>
            </div>
            <Pill tone="success">Transport shared automatically</Pill>
          </div>
          <div className="auto-send">
            <ShieldCheck size={18} />
            <span>
              <strong>Transport data is live</strong>
              Registration, location, route and ETA are now visible to authorized traffic control and hospital staff.
            </span>
          </div>
        </Glass>
      </div>

      <div className="workspace">
        <PatientWorkspaceCard {...p} />
      </div>
    </div>
  );
}

function PatientWorkspaceView(p) {
  return (
    <div className="content-grid single-column-workspace">
      <Glass className="workspace-header-banner">
        <div className="case-strip">
          <Pill tone="critical">
            <CircleAlert size={14} />
            HIGH PRIORITY
          </Pill>
          <span>ASVA-1248</span>
          <span className="divider" />
          <span>Destination: <strong>{p.selectedHospital?.name || "St. Catherine Trauma Centre"}</strong></span>
        </div>
      </Glass>
      <PatientWorkspaceCard {...p} />
    </div>
  );
}

function PatientWorkspaceCard(p) {
  const chip = (x) =>
    p.setChips((a) => (a.includes(x) ? a.filter((i) => i !== x) : [...a, x]));

  return (
    <Glass className="patient-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">PATIENT WORKSPACE</p>
          <h2>Minimum necessary assessment</h2>
        </div>
        <Pill tone={p.sent ? "success" : "warning"}>
          {p.sent ? "Sent to hospital" : "Needs verification"}
        </Pill>
      </div>
      <button
        className={`voice-button ${p.listening ? "listening" : ""}`}
        onClick={() => p.setListening(!p.listening)}
      >
        <span className="mic-orb">
          {p.listening ? (
            <Square size={23} fill="currentColor" />
          ) : (
            <Mic size={25} />
          )}
        </span>
        <span>
          <strong>
            {p.listening ? "Listening (Web Speech Active)…" : "Start voice capture"}
          </strong>
          <small>
            {p.listening
              ? "Speak details (e.g. 'unconscious, breathing difficulty'). Tap to stop."
              : "Capture and structure patient details using voice"}
          </small>
        </span>
        <div className="wave">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <i
              key={n}
              style={{ height: `${p.listening ? 10 + (n % 4) * 9 : 6}px` }}
            />
          ))}
        </div>
      </button>
      <div className="voice-note">
        <Activity size={16} />
        <span>
          {p.listening
            ? "AI voice processing active — updating assessment fields in real time…"
            : "Machine-extracted data requires crew verification before submission."}
        </span>
      </div>
      <div className="assessment">
        <label>Consciousness</label>
        <div className="segment">
          {["Conscious", "Unconscious", "Unknown"].map((x) => (
            <button
              key={x}
              className={p.consciousness === x ? "selected" : ""}
              onClick={() => p.setConsciousness(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <label>Quick select symptoms / injuries</label>
        <div className="chips">
          {[
            "Bleeding",
            "Chest pain",
            "Breathing difficulty",
            "Head injury",
            "Fracture",
            "Burn",
            "Seizure",
            "Unknown",
          ].map((x) => (
            <button
              key={x}
              className={p.chips.includes(x) ? "chip-on" : ""}
              onClick={() => chip(x)}
            >
              {p.chips.includes(x) && <Check size={13} />} {x}
            </button>
          ))}
        </div>
      </div>
      <div className="vital-grid">
        <Vital
          label="Heart rate"
          unit="bpm"
          value={p.vitals.heartRate}
          set={(v) => p.setVitals({ ...p.vitals, heartRate: v })}
          critical={parseInt(p.vitals.heartRate) > 100}
        />
        <Vital
          label="SpO₂"
          unit="%"
          value={p.vitals.spo2}
          set={(v) => p.setVitals({ ...p.vitals, spo2: v })}
          critical={parseInt(p.vitals.spo2) < 95}
        />
        <Vital
          label="Blood pressure"
          unit="mmHg"
          value={p.vitals.bp}
          set={(v) => p.setVitals({ ...p.vitals, bp: v })}
        />
      </div>
      <button className="send-button" onClick={p.handleSendSnapshot}>
        {p.sent ? (
          <>
            <Check size={19} />
            Snapshot delivered · Update hospital
          </>
        ) : (
          <>
            <ShieldCheck size={19} />
            Review & send to hospital
          </>
        )}
        <ArrowRight size={18} />
      </button>
    </Glass>
  );
}

function PickupFlow(p) {
  if (p.phase === "shortlist")
    return (
      <div className="shortlist-page">
        <Glass className="shortlist-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">PATIENT CONTACT RECORDED</p>
              <h2>Nearest candidate hospitals</h2>
              <span className="subcopy">
                Five destinations ranked by route time, capability and live bed availability.
              </span>
            </div>
            <Pill tone="live">5 candidate options</Pill>
          </div>
          {hospitals.map((h) => (
            <button
              className="shortlist-row"
              key={h.id}
              onClick={() => p.setSelectedHospital(h)}
            >
              <div className={`hospital-icon ${h.accent}`}>
                <Hospital size={18} />
              </div>
              <div>
                <strong>{h.name}</strong>
                <span>
                  {h.status} · <strong>{h.beds} ER beds</strong> ({h.icuBeds} ICU)
                </span>
                <small className="capabilities-tag">{h.capabilities.join(" · ")}</small>
              </div>
              <b>
                {h.distance}
                <small>{h.eta}</small>
              </b>
              <ChevronRight size={19} />
            </button>
          ))}
        </Glass>
      </div>
    );

  return (
    <div className="pickup-page">
      <Glass className="pickup-map">
        <MapCard phase="pickup" onExpand={p.onExpandMap} />
        <div className="pickup-overlay">
          <Pill tone="live">
            <Navigation size={13} />
            EN ROUTE TO PICKUP
          </Pill>
          <h2>Patient pickup</h2>
          <p>80ft Road, Koramangala · 1.1 km away</p>
          <button
            className="patient-found"
            onClick={() => p.setPhase("shortlist")}
          >
            <MapPin size={21} />
            Patient found
            <ArrowRight size={18} />
          </button>
        </div>
      </Glass>
      <p className="pickup-note">
        <ShieldCheck size={16} /> Hospital matching, patient capture, and emergency tracking begin only after patient contact.
      </p>
    </div>
  );
}

function Vital({ label, unit, value, set, critical }) {
  return (
    <div className={`vital ${critical ? "vital-critical" : ""}`}>
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        <em>{unit}</em>
      </div>
      <small>{critical ? "▲ Abnormal threshold" : "Verified manually"}</small>
    </div>
  );
}

function TimelineView({ events }) {
  return (
    <div className="timeline-page">
      <Glass className="timeline-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">AUDIT & LOGS</p>
            <h2>Emergency Journey Timeline</h2>
            <span className="subcopy">Complete, timestamped, tamper-evident log for Case ASVA-1248.</span>
          </div>
          <Pill tone="live">Live sync active</Pill>
        </div>
        <div className="timeline-list">
          {events.map((ev, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-marker">
                <CheckCircle2 size={16} />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>{ev.title}</strong>
                  <span className="timeline-time">{ev.time}</span>
                </div>
                <p>{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ==========================================================================
   HOSPITAL VIEWS
   ========================================================================== */
function HospitalView({
  sent,
  vitals,
  consciousness,
  chips,
  selectedHospital,
  setShowReferral,
  selectedQueueCase,
  setSelectedQueueCase,
  onExpandMap,
}) {
  const activeCase = selectedQueueCase.id === "ASVA-1248" && sent
    ? { ...selectedQueueCase, vitals, consciousness, injuries: chips }
    : selectedQueueCase;

  const hrVal = parseInt(activeCase.vitals.heartRate);
  const isHRHigh = hrVal > 100;
  const spo2Val = parseInt(activeCase.vitals.spo2);
  const isSpO2Low = spo2Val < 95;

  return (
    <div className="hospital-view">
      <div className="stats">
        {[
          ["Incoming", "03", Ambulance, "teal"],
          ["Critical", "01", CircleAlert, "red"],
          ["ER beds available", "12", Activity, "lavender"],
          ["Active Referrals", "02", Route, "amber"],
        ].map(([t, n, I, c]) => (
          <Glass className="stat" key={t}>
            <div className={`stat-icon ${c}`}>
              <I size={19} />
            </div>
            <span>{t}</span>
            <strong>{n}</strong>
            <small>{t.includes("beds") ? "Updated 4 min ago" : "Live today"}</small>
          </Glass>
        ))}
      </div>
      <div className="hospital-grid">
        <Glass className="queue">
          <div className="section-head">
            <div>
              <p className="eyebrow">LIVE INTAKE</p>
              <h2>Incoming patient queue</h2>
            </div>
            <Pill tone="critical">1 critical</Pill>
          </div>
          {mockIncomingCases.map((c, i) => (
            <button
              className={`queue-row ${selectedQueueCase.id === c.id ? "queue-row-selected" : ""}`}
              key={c.id}
              onClick={() => setSelectedQueueCase(c)}
            >
              <div className={`priority ${c.priority === "Critical" || c.priority === "High priority" ? "" : "subdued"}`}>
                {i + 1}
              </div>
              <div>
                <strong>{c.id} · {c.patientName}</strong>
                <span>{c.incident} · {c.ageEst}</span>
              </div>
              <Pill tone={c.priority === "Critical" || c.priority === "High priority" ? "critical" : "warning"}>
                {c.priority}
              </Pill>
              <b>{c.eta}</b>
            </button>
          ))}
        </Glass>
        <Glass className="incoming-detail">
          <div className="section-head">
            <div>
              <p className="eyebrow">SELECTED INCOMING CASE</p>
              <h2>{activeCase.id} ({activeCase.patientName})</h2>
            </div>
            <Pill tone={sent || activeCase.sent ? "success" : "warning"}>
              {sent || activeCase.sent ? "Snapshot verified" : "Awaiting snapshot"}
            </Pill>
          </div>

          {(isHRHigh || isSpO2Low) && (
            <div className="critical-alert">
              <CircleAlert size={20} />
              <div>
                <strong>{isHRHigh ? "Tachycardia Alert (Elevated Heart Rate)" : "Low Oxygen Saturation Alert"}</strong>
                <span>
                  {isHRHigh ? `${activeCase.vitals.heartRate} bpm · reported just now` : `${activeCase.vitals.spo2}% SpO2 · reported just now`}
                </span>
              </div>
            </div>
          )}

          <div className="detail-vitals">
            <div className={isHRHigh ? "vital-warning-bg" : ""}>
              <span>Heart rate</span>
              <strong>
                {activeCase.vitals.heartRate}
                <small>bpm</small>
              </strong>
            </div>
            <div className={isSpO2Low ? "vital-warning-bg" : ""}>
              <span>SpO₂</span>
              <strong>
                {activeCase.vitals.spo2}
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>BP</span>
              <strong>{activeCase.vitals.bp}</strong>
            </div>
          </div>
          <div className="incoming-info">
            <div>
              <span>Condition</span>
              <strong>{activeCase.consciousness}</strong>
            </div>
            <div>
              <span>Injuries</span>
              <strong>{Array.isArray(activeCase.injuries) ? activeCase.injuries.join(" · ") : activeCase.injuries}</strong>
            </div>
            <div>
              <span>Ambulance</span>
              <strong>{activeCase.ambulanceReg}</strong>
            </div>
          </div>
          <button
            className="send-button referral-btn"
            onClick={() => setShowReferral(true)}
          >
            <Route size={18} />
            Create secure referral handoff
            <ArrowRight size={18} />
          </button>
        </Glass>
      </div>
      <MapCard selectedHospital={selectedHospital} phase="capture" onExpand={onExpandMap} />
    </div>
  );
}

function CapacityView({ showToast }) {
  const [capacity, setCapacity] = useState([
    { unit: "Emergency Room (ER)", total: 20, available: 12, reserved: 4, status: "Normal" },
    { unit: "Intensive Care Unit (ICU)", total: 10, available: 4, reserved: 2, status: "Normal" },
    { unit: "Trauma Bay", total: 6, available: 2, reserved: 3, status: "High Demand" },
    { unit: "Operating Theatres (OT)", total: 5, available: 1, reserved: 3, status: "Critical" },
    { unit: "Ventilator Units", total: 8, available: 5, reserved: 1, status: "Normal" },
  ]);

  const updateCap = (idx, delta) => {
    setCapacity((prev) =>
      prev.map((c, i) =>
        i === idx ? { ...c, available: Math.max(0, Math.min(c.total, c.available + delta)) } : c
      )
    );
    showToast("Bed capacity updated.");
  };

  return (
    <div className="capacity-page">
      <Glass className="capacity-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">RESOURCE & BED BOARD</p>
            <h2>St. Catherine Capacity Status</h2>
            <span className="subcopy">Real-time availability broadcast to regional emergency dispatchers.</span>
          </div>
          <Pill tone="live">Live sync active</Pill>
        </div>
        <div className="capacity-grid">
          {capacity.map((c, i) => (
            <div className="capacity-item" key={c.unit}>
              <div className="capacity-header">
                <strong>{c.unit}</strong>
                <Pill tone={c.status === "Normal" ? "success" : c.status === "High Demand" ? "warning" : "critical"}>
                  {c.status}
                </Pill>
              </div>
              <div className="capacity-count">
                <span className="big-num">{c.available}</span>
                <span className="total-num">/ {c.total} Available</span>
              </div>
              <div className="capacity-actions">
                <button onClick={() => updateCap(i, -1)}>- Occupy</button>
                <button onClick={() => updateCap(i, 1)}>+ Release</button>
              </div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function ReferralView({ setShowReferral }) {
  const referrals = [
    { id: "REF-9901", patient: "ASVA-1248 (Unknown)", from: "St. Catherine Trauma Centre", to: "Riverside General Hospital", status: "Prepared" },
    { id: "REF-9844", patient: "ASVA-1180 (A. Sharma)", from: "City Medical Institute", to: "St. Catherine Trauma Centre", status: "Completed" },
  ];

  return (
    <div className="referral-page">
      <Glass className="referral-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">INTER-HOSPITAL TRANSFERS</p>
            <h2>Secure Patient Referral Handoffs</h2>
            <span className="subcopy">Cryptographically verified token transfer of medical records.</span>
          </div>
          <button className="small-btn active-btn" onClick={() => setShowReferral(true)}>
            <Plus size={16} /> New Handoff
          </button>
        </div>
        <div className="referral-list">
          {referrals.map((r) => (
            <div className="referral-row" key={r.id}>
              <div className="referral-badge">
                <Route size={18} />
              </div>
              <div>
                <strong>{r.id} · {r.patient}</strong>
                <span>{r.from} ➔ {r.to}</span>
              </div>
              <Pill tone={r.status === "Completed" ? "success" : "live"}>{r.status}</Pill>
              <button className="small-btn" onClick={() => setShowReferral(true)}>
                View QR Token
              </button>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ==========================================================================
   TRAFFIC VIEWS
   ========================================================================== */
function TrafficView({ showToast, onExpandMap }) {
  return (
    <div className="traffic-view">
      <div className="traffic-map">
        <MapCard phase="capture" onExpand={onExpandMap} />
        <Glass className="ops-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">ACTIVE OPERATIONS</p>
              <h2>3 ambulances en route</h2>
            </div>
            <Pill tone="live">Live feed</Pill>
          </div>
          {mockFleet.filter(f => f.status !== "Available").map((x, i) => (
            <div className="operation" key={x.id}>
              <span className={`marker ${i ? "soft" : ""}`}>
                <Ambulance size={16} />
              </span>
              <div>
                <strong>{x.id}</strong>
                <span>{x.caseId} · {x.destination}</span>
              </div>
              <b>{x.eta}</b>
            </div>
          ))}
          <div className="clearance">
            <Navigation size={18} />
            <div>
              <strong>Pre-clearance suggested</strong>
              <span>Koramangala 80ft Road in 2 min</span>
            </div>
            <button onClick={() => showToast("Signal override pre-clearance notification broadcasted to Koramangala junction!")}>
              Notify Signal
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
}

function CorridorsView({ showToast }) {
  const [corridors, setCorridors] = useState(mockCorridors);

  const toggleCorridor = (id) => {
    setCorridors((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Priority Active" ? "Monitoring" : "Priority Active" }
          : c
      )
    );
    showToast("Green corridor signal state toggled.");
  };

  return (
    <div className="corridors-page">
      <Glass className="corridors-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">GREEN CORRIDORS</p>
            <h2>Priority Emergency Corridors</h2>
            <span className="subcopy">Automated signal light pre-clearance and intersection overrides.</span>
          </div>
          <Pill tone="live">Traffic AI Sync</Pill>
        </div>
        <div className="corridor-list">
          {corridors.map((c) => (
            <div className="corridor-row" key={c.id}>
              <div className="corridor-icon">
                <Navigation size={18} />
              </div>
              <div>
                <strong>{c.name}</strong>
                <span>{c.distance} · {c.cleared}/{c.signals} signals pre-cleared · Active: {c.activeAmbulance}</span>
              </div>
              <Pill tone={c.status === "Priority Active" ? "live" : "warning"}>{c.status}</Pill>
              <button
                className={`small-btn ${c.status === "Priority Active" ? "active-btn" : ""}`}
                onClick={() => toggleCorridor(c.id)}
              >
                {c.status === "Priority Active" ? "Deactivate" : "Activate Green Wave"}
              </button>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function FleetView({ showToast }) {
  return (
    <div className="fleet-page">
      <Glass className="fleet-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">FLEET TELEMETRY</p>
            <h2>Ambulance Fleet Status</h2>
            <span className="subcopy">Real-time GPS tracking and vehicle status monitor.</span>
          </div>
          <Pill tone="live">4 Vehicles Online</Pill>
        </div>
        <div className="fleet-grid">
          {mockFleet.map((f) => (
            <div className="fleet-item" key={f.id}>
              <div className="fleet-header">
                <strong>{f.id}</strong>
                <Pill tone={f.status === "Available" ? "success" : "live"}>{f.status}</Pill>
              </div>
              <p>Crew: {f.driver}</p>
              <p>Speed: {f.speed} · Target: {f.destination}</p>
              <button className="small-btn" onClick={() => showToast(`Paging driver of ${f.id}...`)}>
                <Phone size={14} /> Contact Crew
              </button>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ==========================================================================
   MODALS & DRAWERS
   ========================================================================== */
function NotificationsDrawer({ notifications, onClose }) {
  return (
    <div className="notifications-drawer">
      <div className="drawer-header">
        <h3>Emergency Notifications</h3>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="drawer-body">
        {notifications.map((n) => (
          <div className="notification-item" key={n.id}>
            <div className="notification-title">
              <strong>{n.title}</strong>
              <small>{n.time}</small>
            </div>
            <p>{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedMapModal({ onClose, selectedHospital, phase }) {
  const targetName = phase === "pickup"
    ? "80ft Road, Koramangala (Pickup)"
    : selectedHospital
      ? selectedHospital.name
      : "St. Catherine Trauma Centre";

  return (
    <div className="modal-backdrop">
      <div className="expanded-map-modal">
        <div className="expanded-map-header">
          <div>
            <h3>ASVA High-Precision Live Route Map</h3>
            <p>Target: <strong>{targetName}</strong> · Telemetry Latency 24ms</p>
          </div>
          <button className="close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="expanded-map-body">
          <MapCard selectedHospital={selectedHospital} phase={phase} />
        </div>
      </div>
    </div>
  );
}

function ReferralModal({ onClose, selectedHospital }) {
  return (
    <div className="modal-backdrop">
      <div className="referral-modal">
        <button className="close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="referral-icon">
          <Route size={27} />
        </div>
        <p className="eyebrow">SECURE HANDOFF</p>
        <h2>Referral ready</h2>
        <p className="modal-copy">
          ASVA-1248 has been packaged securely for authorized receiving staff.
        </p>
        <div className="qr">
          <div className="qr-code">
            {Array.from({ length: 64 }, (_, i) => (
              <i
                key={i}
                className={
                  (i * 7 + (i % 5)) % 11 < 5 || i % 13 === 0 ? "black" : ""
                }
              />
            ))}
          </div>
        </div>
        <div className="token">
          <ShieldCheck size={16} />
          Opaque token · expires in 20 minutes
        </div>
        <div className="referral-meta">
          <span>
            Sending hospital<strong>St. Catherine Trauma Centre</strong>
          </span>
          <span>
            Receiving hospital<strong>{selectedHospital?.name || "Riverside General Hospital"}</strong>
          </span>
        </div>
        <button className="send-button" onClick={onClose}>
          <Check size={18} />
          Done
        </button>
      </div>
    </div>
  );
}
