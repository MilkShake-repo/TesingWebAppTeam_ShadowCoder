import {
  Activity,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Hospital,
  MapPin,
  Mic,
  ShieldCheck,
  Square,
} from "lucide-react";
import { Glass, Pill } from "../ui";
import MapCard from "../map/MapCard";
import PickupFlow from "./PickupFlow";
import Vital from "./Vital";

export default function AmbulanceView(p) {
  if (p.phase !== "capture") return <PickupFlow {...p} />;

  const chip = (value) =>
    p.setChips((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <div className="content-grid ambulance-layout">
      <div className="route-column">
        <div className="case-strip">
          <Pill tone="critical">
            <CircleAlert size={14} /> HIGH PRIORITY
          </Pill>
          <span>ASVA-1248</span>
          <span className="divider" />
          <span>KA 01 AB 7812</span>
          <span className="divider" />
          <span>
            <MapPin size={14} /> Koramangala, Bengaluru
          </span>
        </div>
        <MapCard />
        <Glass className="route-options">
          <div className="section-head">
            <div>
              <p className="eyebrow">DESTINATION CONFIRMED</p>
              <h2>{p.selectedHospital?.name}</h2>
            </div>
            <Pill tone="success">Transport shared automatically</Pill>
          </div>
          <div className="auto-send">
            <ShieldCheck size={18} />
            <span>
              <strong>Transport data is live</strong>Registration, location,
              route and ETA are now visible to authorized traffic control and
              hospital staff.
            </span>
          </div>
        </Glass>
      </div>
      <div className="workspace">
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
                {p.listening ? "Listening…" : "Start voice capture"}
              </strong>
              <small>
                {p.listening
                  ? "Speak naturally — tap to stop"
                  : "Capture and structure patient details"}
              </small>
            </span>
            <div className="wave">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <i
                  key={number}
                  style={{
                    height: `${p.listening ? 10 + (number % 4) * 9 : 6}px`,
                  }}
                />
              ))}
            </div>
          </button>
          <div className="voice-note">
            <Activity size={16} />
            <span>
              {p.listening
                ? "Listening for assessment details…"
                : "Machine-extracted data needs helper verification."}
            </span>
          </div>
          <div className="assessment">
            <label>Consciousness</label>
            <div className="segment">
              {["Conscious", "Unconscious", "Unknown"].map((value) => (
                <button
                  key={value}
                  className={p.consciousness === value ? "selected" : ""}
                  onClick={() => p.setConsciousness(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <label>Quick select</label>
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
              ].map((value) => (
                <button
                  key={value}
                  className={p.chips.includes(value) ? "chip-on" : ""}
                  onClick={() => chip(value)}
                >
                  {p.chips.includes(value) && <Check size={13} />} {value}
                </button>
              ))}
            </div>
          </div>
          <div className="vital-grid">
            <Vital
              label="Heart rate"
              unit="bpm"
              value={p.vitals.heartRate}
              set={(value) => p.setVitals({ ...p.vitals, heartRate: value })}
              critical
            />
            <Vital
              label="SpO₂"
              unit="%"
              value={p.vitals.spo2}
              set={(value) => p.setVitals({ ...p.vitals, spo2: value })}
              critical
            />
            <Vital
              label="Blood pressure"
              unit="mmHg"
              value={p.vitals.bp}
              set={(value) => p.setVitals({ ...p.vitals, bp: value })}
            />
          </div>
          <button className="send-button" onClick={() => p.setSent(true)}>
            {p.sent ? (
              <>
                <Check size={19} /> Snapshot delivered · Update hospital
              </>
            ) : (
              <>
                <ShieldCheck size={19} /> Review & send to hospital
              </>
            )}
            <ArrowRight size={18} />
          </button>
        </Glass>
        <div className="status-strip">
          <span>
            <span className="live-dot" /> Traffic sharing active
          </span>
          <span>
            <Hospital size={15} /> Hospital channel ready
          </span>
          <span>
            <Clock3 size={15} /> Last update just now
          </span>
        </div>
      </div>
    </div>
  );
}
