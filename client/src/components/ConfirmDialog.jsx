import Modal from './Modal.jsx';
import Icon from './Icon.jsx';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  loading = false,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Suppression…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-body">
        <span className="confirm-icon">
          <Icon name="alert" size={20} />
        </span>
        <p className="confirm-text">{message}</p>
      </div>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
