import { Ambulance, Navigation } from "lucide-react";
import { Glass, Pill } from "../ui";
import MapCard from "../map/MapCard";

export default function TrafficView() {
  return (
    <div className="traffic-view">
      <div className="traffic-map">
        <MapCard />
        <Glass className="ops-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">ACTIVE OPERATIONS</p>
              <h2>3 ambulances en route</h2>
            </div>
            <Pill tone="live">Live feed</Pill>
          </div>
          {[
            ["KA 01 AB 7812", "ASVA-1248 · St. Catherine", "08 min"],
            ["KA 03 MF 0912", "ASVA-1239 · Riverside", "13 min"],
            ["KA 05 NR 2944", "ASVA-1231 · City Medical", "18 min"],
          ].map(([vehicle, destination, eta], index) => (
            <div className="operation" key={vehicle}>
              <span className={`marker ${index ? "soft" : ""}`}>
                <Ambulance size={16} />
              </span>
              <div>
                <strong>{vehicle}</strong>
                <span>{destination}</span>
              </div>
              <b>{eta}</b>
            </div>
          ))}
          <div className="clearance">
            <Navigation size={18} />
            <div>
              <strong>Pre-clearance suggested</strong>
              <span>Koramangala 80 ft Road in 2 min</span>
            </div>
            <button>Notify</button>
          </div>
        </Glass>
      </div>
    </div>
  );
}
