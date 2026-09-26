import Icon from './Icon.jsx';

export default function ErrorState({
  title = 'Une erreur est survenue',
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-block state-error" role="alert">
      <span className="state-icon state-icon-error">
        <Icon name="alert" size={22} />
      </span>
      <h3 className="state-title">{title}</h3>
      {message ? <p className="state-text">{message}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-outline" onClick={onAction}>
          <Icon name="refresh" size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
