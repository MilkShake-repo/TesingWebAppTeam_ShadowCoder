import {
  ArrowLeft,
  Hospital,
  LockKeyhole,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { Glass, Pill } from "../../components/ui";
import "./HospitalAdminLogin.css";

export default function HospitalAdminLogin({ onLogin, onBack }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className="auth-page">
      <Glass className="auth-card">
        <div className="auth-icon">
          <Hospital size={28} />
        </div>
        <Pill tone="success">
          <ShieldCheck size={14} /> Hospital admin access
        </Pill>
        <h1>Sign in to hospital command</h1>
        <p className="auth-copy">
          Use your hospital admin account to manage incoming cases, capacity,
          and authorized staff.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Hospital email
            <input
              defaultValue="admin@stcatherine.example"
              type="email"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              defaultValue="ASVA-demo"
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button className="auth-submit" type="submit">
            <LogIn size={17} /> Sign in to hospital dashboard
          </button>
        </form>
        <p className="auth-demo">
          Demo access: this test user can access both Crew and Hospital views.
        </p>
        <button className="auth-back" onClick={onBack} type="button">
          <ArrowLeft size={16} /> Back to crew access
        </button>
        <LockKeyhole className="auth-lock" size={15} />
      </Glass>
    </main>
  );
}
