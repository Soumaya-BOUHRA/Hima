export default function Spinner({ size = 'md', label }) {
  const className = `spinner spinner-${size}`;
  if (label) {
    return (
      <span className="spinner-wrap">
        <span className={className} aria-hidden="true" />
        <span className="spinner-label">{label}</span>
      </span>
    );
  }
  return <span className={className} role="status" aria-label="Chargement" />;
}
