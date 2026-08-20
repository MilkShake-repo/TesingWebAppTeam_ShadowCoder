export function Pill({ children, tone = 'neutral' }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export function Glass({ className = '', children }) {
  return <section className={`glass ${className}`}>{children}</section>
}
