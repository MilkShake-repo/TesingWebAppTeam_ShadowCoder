import {
  Ambulance,
  Check,
  Hospital,
  MapPin,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { Glass, Pill } from "../../components/ui";
import "./ProfilePage.css";

const roles = {
  crew: {
    label: "Ambulance crew",
    icon: Ambulance,
    detail: "Emergency response team",
  },
  hospital: {
    label: "Hospital staff",
    icon: Hospital,
    detail: "Receiving and triage team",
  },
  traffic: {
    label: "Traffic control",
    icon: Radio,
    detail: "Priority corridor operator",
  },
};

export default function ProfilePage({ role = "crew", onSave }) {
  const profileRole = roles[role] || roles.crew;
  const RoleIcon = profileRole.icon;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div>
          <p className="eyebrow">ACCOUNT PROFILE</p>
          <h1>Manage your ASVA profile</h1>
          <p className="profile-subtitle">
            Keep your emergency response identity and access details current.
          </p>
        </div>
        <Pill tone="success">
          <ShieldCheck size={14} /> Secure profile
        </Pill>
      </header>

      <div className="profile-layout">
        <Glass className="profile-summary">
          <div className="profile-avatar">AK</div>
          <h2>Arjun Kumar</h2>
          <span className="profile-id">ASVA-1248</span>
          <div className="profile-role">
            <RoleIcon size={17} />
            <span>
              <strong>{profileRole.label}</strong>
              <small>{profileRole.detail}</small>
            </span>
          </div>
          <div className="profile-location">
            <MapPin size={15} /> Bengaluru, Karnataka
          </div>
        </Glass>

        <Glass className="profile-form">
          <div className="profile-section-heading">
            <div>
              <p className="eyebrow">PERSONAL DETAILS</p>
              <h2>Profile information</h2>
            </div>
            <Pill tone="live">Verified</Pill>
          </div>

          <div className="profile-fields">
            <label>
              Full name
              <input defaultValue="Arjun Kumar" />
            </label>
            <label>
              Phone number
              <input defaultValue="+91 98765 43210" type="tel" />
            </label>
            <label>
              Email address
              <input defaultValue="arjun.kumar@asva.example" type="email" />
            </label>
            <label>
              Base location
              <input defaultValue="Bengaluru, Karnataka" />
            </label>
          </div>

          <div className="profile-actions">
            <span>Last updated today</span>
            <button className="profile-save" onClick={onSave} type="button">
              <Check size={17} /> Save changes
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
}
