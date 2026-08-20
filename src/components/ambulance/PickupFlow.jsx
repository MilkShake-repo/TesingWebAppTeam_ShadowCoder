import {
  ArrowRight,
  ChevronRight,
  Hospital,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { Glass, Pill } from "../ui";
import MapCard from "../map/MapCard";
import { hospitals } from "../../data/hospitals";

export default function PickupFlow(p) {
  const choose = (hospital) => {
    p.setSelectedHospital(hospital);
    p.setTracking(true);
    p.setPhase("capture");
  };

  if (p.phase === "shortlist") {
    return (
      <div className="shortlist-page">
        <Glass className="shortlist-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">PATIENT CONTACT RECORDED</p>
              <h2>Nearest hospitals</h2>
              <span className="subcopy">
                Five destinations ranked by route time, capability and live
                availability.
              </span>
            </div>
            <Pill tone="live">5 found</Pill>
          </div>
          {hospitals.map((hospital) => (
            <button
              className="shortlist-row"
              key={hospital.name}
              onClick={() => choose(hospital)}
            >
              <div className={`hospital-icon ${hospital.accent}`}>
                <Hospital size={18} />
              </div>
              <div>
                <strong>{hospital.name}</strong>
                <span>
                  {hospital.status} · {hospital.beds} ER beds
                </span>
              </div>
              <b>
                {hospital.distance}
                <small>{hospital.eta}</small>
              </b>
              <ChevronRight size={19} />
            </button>
          ))}
        </Glass>
      </div>
    );
  }

  return (
    <div className="pickup-page">
      <Glass className="pickup-map">
        <MapCard />
        <div className="pickup-overlay">
          <Pill tone="live">
            <Navigation size={13} /> EN ROUTE TO PICKUP
          </Pill>
          <h2>Patient pickup</h2>
          <p>80 ft Road, Koramangala · 1.1 km away</p>
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
        <ShieldCheck size={16} /> Hospital matching, patient capture, and
        emergency tracking begin only after patient contact.
      </p>
    </div>
  );
}
