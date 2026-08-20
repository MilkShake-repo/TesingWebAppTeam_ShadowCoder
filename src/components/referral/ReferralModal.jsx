import { Check, Route, ShieldCheck, X } from "lucide-react";
import { Glass } from "../ui";

export default function ReferralModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <Glass className="referral-modal">
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
            {Array.from({ length: 64 }, (_, index) => (
              <i
                key={index}
                className={
                  (index * 7 + (index % 5)) % 11 < 5 || index % 13 === 0
                    ? "black"
                    : ""
                }
              />
            ))}
          </div>
        </div>
        <div className="token">
          <ShieldCheck size={16} /> Opaque token · expires in 20 minutes
        </div>
        <div className="referral-meta">
          <span>
            Sending hospital<strong>St. Catherine Trauma Centre</strong>
          </span>
          <span>
            Receiving hospital<strong>Riverside General Hospital</strong>
          </span>
        </div>
        <button className="send-button" onClick={onClose}>
          <Check size={18} /> Done
        </button>
      </Glass>
    </div>
  );
}
