import Icon from './Icon.jsx';

export default function EmptyState({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-block state-empty">
      <span className="state-icon">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="state-title">{title}</h3>
      {message ? <p className="state-text">{message}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          <Icon name="plus" size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
