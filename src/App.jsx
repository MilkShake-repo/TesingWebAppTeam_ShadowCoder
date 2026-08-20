import { useEffect, useState } from "react";
import {
  Activity,
  Ambulance,
  Bell,
  Clock3,
  HeartPulse,
  Hospital,
  Navigation,
  Radio,
  Route,
  ShieldCheck,
} from "lucide-react";
import "./index.css";
import "./brand.css";
import Brand from "./components/Brand";
import { Pill } from "./components/ui";
import AmbulanceView from "./components/ambulance/AmbulanceView";
import HospitalView from "./components/hospital/HospitalView";
import ReferralModal from "./components/referral/ReferralModal";
import TrafficView from "./components/traffic/TrafficView";
import HospitalAdminLogin from "./pages/auth/HospitalAdminLogin";
import ProfilePage from "./pages/profile/ProfilePage";

export default function App() {
  const [role, setRole] = useState("ambulance"),
    [view, setView] = useState("dashboard"),
    [active, setActive] = useState("command"),
    [tracking, setTracking] = useState(false),
    [listening, setListening] = useState(false),
    [sent, setSent] = useState(false),
    [broadcast, setBroadcast] = useState(false),
    [showReferral, setShowReferral] = useState(false),
    [phase, setPhase] = useState("pickup"),
    [selectedHospital, setSelectedHospital] = useState(null);
  const [vitals, setVitals] = useState({
      heartRate: "118",
      spo2: "93",
      bp: "104/68",
    }),
    [chips, setChips] = useState(["Bleeding", "Head injury"]),
    [consciousness, setConsciousness] = useState("Conscious");
  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setListening(false);
      setChips(["Bleeding", "Head injury", "Breathing difficulty"]);
    }, 2600);
    return () => clearTimeout(t);
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
      <aside className="sidebar">
        <Brand />
        <div className="role-switch">
          <button
            className={role === "ambulance" ? "selected" : ""}
            onClick={() => {
              setRole("ambulance");
              setActive("command");
              setView("dashboard");
            }}
          >
            <Ambulance size={16} />
            Crew
          </button>
          <button
            className={role === "hospital" ? "selected" : ""}
            onClick={() => setView("hospital-login")}
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
            className={role === "traffic" ? "traffic-active" : ""}
            onClick={() => {
              setRole("traffic");
              setActive("traffic");
              setView("dashboard");
            }}
          >
            <Radio size={18} />
            Traffic control
            <span className="selection-pulse" />
          </button>
          <div className="secure">
            <ShieldCheck size={15} />
            Secure session · ASVA-1248
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {phase === "pickup" && role === "ambulance"
                ? "DISPATCH · EN ROUTE TO PATIENT"
                : "LIVE EMERGENCY CASE"}
            </p>
            <h1>
              {view === "profile"
                ? "Crew profile dashboard"
                : view === "hospital-login"
                  ? "Hospital admin access"
                  : role === "hospital"
                    ? "Incoming patient command"
                    : role === "traffic"
                      ? "Traffic coordination centre"
                      : phase === "pickup"
                        ? "Pickup navigation"
                        : "Emergency response command"}
            </h1>
          </div>
          <div className="header-actions">
            <Pill tone={tracking ? "live" : "warning"}>
              <span className="live-dot" />
              {tracking ? "Tracking active" : "Pickup navigation"}
            </Pill>
            <button className="icon-button">
              <Bell size={19} />
            </button>
            <button
              className="avatar"
              onClick={() => setView("profile")}
              title="Open crew profile"
              type="button"
            >
              AK
            </button>
          </div>
        </header>
        {view === "profile" ? (
          <ProfilePage
            role="crew"
            onBack={() => setView("dashboard")}
            onSave={() => setView("dashboard")}
          />
        ) : view === "hospital-login" ? (
          <HospitalAdminLogin
            onBack={() => setView("dashboard")}
            onLogin={() => {
              setRole("hospital");
              setActive("intake");
              setView("dashboard");
            }}
          />
        ) : role === "hospital" ? (
          <HospitalView
            sent={sent}
            vitals={vitals}
            consciousness={consciousness}
            setShowReferral={setShowReferral}
          />
        ) : role === "traffic" ? (
          <TrafficView />
        ) : (
          <AmbulanceView
            {...{
              tracking,
              setTracking,
              listening,
              setListening,
              sent,
              setSent,
              vitals,
              setVitals,
              chips,
              setChips,
              consciousness,
              setConsciousness,
              broadcast,
              setBroadcast,
              phase,
              setPhase,
              selectedHospital,
              setSelectedHospital,
            }}
          />
        )}
      </main>
      {showReferral && <ReferralModal onClose={() => setShowReferral(false)} />}
    </div>
  );
}
