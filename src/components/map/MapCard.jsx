import { Ambulance, ChevronRight, Hospital, Plus } from "lucide-react";
import { Glass, Pill } from "../ui";
import "./MapCard.css";

// MAP LOGIN INTEGRATION: replace map-grid with the authenticated map provider component.
export default function MapCard() {
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
          <Hospital size={17} />
        </div>
        <div className="ambulance-pin">
          <Ambulance size={18} />
        </div>
        <div className="traffic-dot t1" />
        <div className="traffic-dot t2" />
      </div>
      <div className="map-top">
        <Pill tone="live">
          <span className="live-dot" /> LIVE ROUTE
        </Pill>
        <button className="map-expand">
          <Plus size={18} />
        </button>
      </div>
      <div className="route-summary">
        <div>
          <span className="muted">Destination</span>
          <strong>St. Catherine Trauma Centre</strong>
        </div>
        <div>
          <span className="muted">ETA</span>
          <strong className="eta">08 min</strong>
        </div>
        <ChevronRight size={20} />
      </div>
    </Glass>
  );
}
