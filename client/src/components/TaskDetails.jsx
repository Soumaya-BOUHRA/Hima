import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
import ErrorState from './ErrorState.jsx';
import Icon from './Icon.jsx';
import * as api from '../services/api.js';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
  isOverdue,
} from '../utils/task.js';

export default function TaskDetails({ taskId, onClose, onEdit, onDelete, onAuthError }) {
  const [result, setResult] = useState({ id: null, task: null, error: null });

  useEffect(() => {
    if (!taskId) return undefined;
    let cancelled = false;

    api
      .fetchTask(taskId)
      .then((task) => {
        if (!cancelled) setResult({ id: taskId, task, error: null });
      })
      .catch((err) => {
        if (cancelled || (onAuthError && onAuthError(err))) return;
        setResult({ id: taskId, task: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [taskId, onAuthError]);

  const isCurrent = Boolean(taskId) && result.id === taskId;
  const loading = Boolean(taskId) && !isCurrent;
  const task = isCurrent ? result.task : null;
  const error = isCurrent ? result.error : null;
  const overdue = task ? isOverdue(task) : false;

  return (
    <Modal
      open={Boolean(taskId)}
      onClose={onClose}
      title="Détails de la tâche"
      size="md"
      footer={
        task ? (
          <>
            <button
              type="button"
              className="btn btn-outline btn-danger-outline"
              onClick={() => onDelete(task)}
            >
              <Icon name="trash" size={16} />
              Supprimer
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onEdit(task)}
            >
              <Icon name="edit" size={16} />
              Modifier
            </button>
          </>
        ) : null
      }
    >
      {loading ? (
        <div className="modal-state">
          <Spinner size="md" label="Chargement de la tâche…" />
        </div>
      ) : error ? (
        <ErrorState title="Tâche introuvable" message={error} actionLabel="Fermer" onAction={onClose} />
      ) : task ? (
        <div className="task-details">
          <div className="task-badges">
            <span className={`badge badge-status badge-${task.status}`}>
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
            <span className={`badge badge-priority priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </span>
          </div>

          <h3 className="task-details-title">{task.title}</h3>

          <p className="task-details-description">
            {task.description || 'Aucune description renseignée.'}
          </p>

          <dl className="details-grid">
            <div className="details-item">
              <dt>Échéance</dt>
              <dd className={overdue ? 'is-overdue' : undefined}>
                {task.dueDate ? formatDate(task.dueDate) : 'Aucune échéance'}
                {overdue ? <strong className="overdue-tag">En retard</strong> : null}
              </dd>
            </div>
            <div className="details-item">
              <dt>Statut</dt>
              <dd>{STATUS_LABELS[task.status] ?? task.status}</dd>
            </div>
            <div className="details-item">
              <dt>Priorité</dt>
              <dd>{PRIORITY_LABELS[task.priority] ?? task.priority}</dd>
            </div>
            <div className="details-item">
              <dt>Créée le</dt>
              <dd>{formatDate(task.createdAt) || '—'}</dd>
            </div>
            <div className="details-item">
              <dt>Dernière mise à jour</dt>
              <dd>{formatDate(task.updatedAt) || '—'}</dd>
            </div>
            <div className="details-item">
              <dt>Identifiant</dt>
              <dd className="details-id">{task._id}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </Modal>
  );
}
