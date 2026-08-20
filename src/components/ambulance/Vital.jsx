export default function Vital({ label, unit, value, set, critical }) {
  return (
    <div className={`vital ${critical ? "vital-critical" : ""}`}>
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          value={value}
          onChange={(event) => set(event.target.value)}
        />
        <em>{unit}</em>
      </div>
      <small>{critical ? "▲ updated now" : "Verified manually"}</small>
    </div>
  );
}
