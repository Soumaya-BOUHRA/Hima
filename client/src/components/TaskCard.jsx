import { motion } from 'framer-motion';
import Icon from './Icon.jsx';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
  isOverdue,
  projectName,
} from '../utils/task.js';

export default function TaskCard({ task, onView, onEdit, onDelete, onToggle }) {
  const overdue = isOverdue(task);
  const dueDate = formatDate(task.dueDate);
  const done = task.status === 'completed';
  const project = projectName(task);
  const hasProject = project !== 'Sans projet';

  return (
    <motion.article
      className="task-card"
      data-priority={task.priority}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="task-card-top">
        <div className="task-badges">
          <span className={`badge badge-${task.status}`}>
            {STATUS_LABELS[task.status] ?? task.status}
          </span>
          <span className={`badge priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>
          {hasProject ? (
            <span className="badge project-tag">
              <Icon name="folder" size={11} />
              {project}
            </span>
          ) : null}
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

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <button
          type="button"
          className={`hima-check${done ? ' is-checked' : ''}`}
          onClick={() => onToggle?.(task)}
          aria-pressed={done}
          aria-label={done ? `Rouvrir « ${task.title} »` : `Terminer « ${task.title} »`}
          style={{ marginTop: 2 }}
        >
          <Icon name="check" size={14} />
        </button>
        <h3
          className="task-card-title"
          style={
            done
              ? { textDecoration: 'line-through', color: 'var(--text-subtle)' }
              : undefined
          }
        >
          {task.title}
        </h3>
      </div>

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
    </motion.article>
  );
}
