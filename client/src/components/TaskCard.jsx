import Icon from './Icon.jsx';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
  isOverdue,
} from '../utils/task.js';

export default function TaskCard({ task, onView, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const dueDate = formatDate(task.dueDate);
  const createdAt = formatDate(task.createdAt);

  return (
    <article className="task-card">
      <div className="task-card-top">
        <div className="task-badges">
          <span className={`badge badge-status badge-${task.status}`}>
            {STATUS_LABELS[task.status] ?? task.status}
          </span>
          <span className={`badge badge-priority priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onView}
          aria-label={`Voir les détails de « ${task.title} »`}
        >
          <Icon name="eye" size={17} />
        </button>
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      {task.description ? (
        <p className="task-card-description">{task.description}</p>
      ) : (
        <p className="task-card-description is-empty">Aucune description</p>
      )}

      <div className="task-card-meta">
        <span className={`meta-item ${overdue ? 'is-overdue' : ''}`}>
          <Icon name="calendar" size={14} />
          {dueDate ? (
            <>
              {dueDate}
              {overdue ? <strong className="overdue-tag">En retard</strong> : null}
            </>
          ) : (
            'Sans échéance'
          )}
        </span>
        {createdAt ? (
          <span className="meta-item">
            <Icon name="clock" size={14} />
            Créée le {createdAt}
          </span>
        ) : null}
      </div>

      <div className="task-card-actions">
        <button type="button" className="btn btn-ghost" onClick={onView}>
          <Icon name="eye" size={15} />
          Voir
        </button>
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          <Icon name="edit" size={15} />
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-ghost-danger"
          onClick={onDelete}
        >
          <Icon name="trash" size={15} />
          Supprimer
        </button>
      </div>
    </article>
  );
}
