import {
  Activity,
  Ambulance,
  CircleAlert,
  Route,
  UserRound,
} from "lucide-react";
import { Glass, Pill } from "../ui";
import MapCard from "../map/MapCard";

export default function HospitalView({
  sent,
  vitals,
  consciousness,
  setShowReferral,
}) {
  return (
    <div className="hospital-view">
      <div className="stats">
        {[
          ["Incoming", "04", Ambulance, "teal"],
          ["Critical", "01", CircleAlert, "red"],
          ["ER beds", "12", Activity, "lavender"],
          ["Referrals", "02", Route, "amber"],
        ].map(([title, number, Icon, color]) => (
          <Glass className="stat" key={title}>
            <div className={`stat-icon ${color}`}>
              <Icon size={19} />
            </div>
            <span>{title}</span>
            <strong>{number}</strong>
            <small>
              {title === "ER beds" ? "Updated 4 min ago" : "Live today"}
            </small>
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
          {[
            "ASVA-1248 · Unknown patient",
            "ASVA-1239 · R. Kumar",
            "ASVA-1231 · S. Patel",
          ].map((patient, index) => (
            <div className="queue-row" key={patient}>
              <div className={`priority ${index ? "subdued" : ""}`}>
                {index + 1}
              </div>
              <div>
                <strong>{patient}</strong>
                <span>
                  {index
                    ? "Medical emergency"
                    : "Road traffic accident · 34–42 est."}
                </span>
              </div>
              <Pill tone={index ? "warning" : "critical"}>
                {index ? "Review" : "High priority"}
              </Pill>
              <b>{8 + index * 5} min</b>
            </div>
          ))}
        </Glass>
        <Glass className="incoming-detail">
          <div className="section-head">
            <div>
              <p className="eyebrow">SELECTED INCOMING CASE</p>
              <h2>ASVA-1248</h2>
            </div>
            <Pill tone={sent ? "success" : "warning"}>
              {sent ? "Snapshot verified" : "Awaiting snapshot"}
            </Pill>
          </div>
          <div className="critical-alert">
            <CircleAlert size={20} />
            <div>
              <strong>Elevated heart rate</strong>
              <span>118 bpm · reported just now</span>
            </div>
          </div>
          <div className="detail-vitals">
            <div>
              <span>Heart rate</span>
              <strong>
                {vitals.heartRate}
                <small>bpm</small>
              </strong>
            </div>
            <div>
              <span>SpO₂</span>
              <strong>
                {vitals.spo2}
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>BP</span>
              <strong>{vitals.bp}</strong>
            </div>
          </div>
          <div className="incoming-info">
            <div>
              <span>Condition</span>
              <strong>{consciousness}</strong>
            </div>
            <div>
              <span>Injuries</span>
              <strong>Head injury · Bleeding</strong>
            </div>
            <div>
              <span>Ambulance</span>
              <strong>KA 01 AB 7812</strong>
            </div>
          </div>
          <button
            className="send-button referral-btn"
            onClick={() => setShowReferral(true)}
          >
            <Route size={18} /> Create secure referral
          </button>
        </Glass>
      </div>
      <Glass className="hospital-users">
        <div className="section-head">
          <div>
            <p className="eyebrow">AUTHORIZED USERS</p>
            <h2>Who uses this hospital workspace</h2>
          </div>
          <Pill tone="live">4 active</Pill>
        </div>
        <div className="hospital-user-list">
          {[
            ["Dr. Meera Shah", "Emergency physician", "Online"],
            ["Nikhil Rao", "Triage nurse", "Online"],
            ["Arjun Kumar", "Ambulance crew · test access", "Shared"],
            ["Priya Menon", "Hospital administrator", "Online"],
          ].map(([name, title, status]) => (
            <div className="hospital-user" key={name}>
              <div className="hospital-user-avatar">
                <UserRound size={16} />
              </div>
              <div>
                <strong>{name}</strong>
                <span>{title}</span>
              </div>
              <Pill tone={status === "Shared" ? "warning" : "success"}>
                {status}
              </Pill>
            </div>
          ))}
        </div>
      </Glass>
      <MapCard />
    </div>
  );
}
