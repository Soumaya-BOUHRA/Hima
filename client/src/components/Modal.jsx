import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  labelledBy,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const headingId = labelledBy || 'modal-title';

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="modal-header">
          <div className="modal-heading">
            <h2 className="modal-title" id={headingId}>
              {title}
            </h2>
            {description ? <p className="modal-subtitle">{description}</p> : null}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
