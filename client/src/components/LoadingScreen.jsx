import Spinner from './Spinner.jsx';

export default function LoadingScreen({ label = 'Chargement…' }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <Spinner size="lg" />
      <p className="loading-screen-label">{label}</p>
    </div>
  );
}
