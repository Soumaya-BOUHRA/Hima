import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../context/TasksContext.jsx';
import { PRIORITY_LABELS, isOverdue } from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const COLS = [
  { value: 'high', label: 'Haute priorité', hint: 'À traiter en premier' },
  { value: 'medium', label: 'Priorité moyenne', hint: 'À planifier cette semaine' },
  { value: 'low', label: 'Priorité basse', hint: 'Quand vous avez un moment' },
];

export default function Priorities() {
  const { tasks, loading, loadError, reload, openCreate, toggleComplete, handleAuthError } = useTasks();
  const [viewingId, setViewingId] = useState(null);

  const columns = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'completed');
    return COLS.map((col) => ({
      ...col,
      items: open.filter((t) => t.priority === col.value),
    }));
  }, [tasks]);

  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks]);

  return (
    <div>
      <header className="page-header">
        <div>
          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Priorités
          </motion.h1>
          <p className="page-subtitle">
            Commencez par l’essentiel. {doneCount} tâche{doneCount > 1 ? 's' : ''} déjà terminée{doneCount > 1 ? 's' : ''} — bravo.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Nouvelle tâche
        </button>
      </header>

      {loadError ? (
        <ErrorState title="Impossible de charger vos priorités" message={loadError} actionLabel="Réessayer" onAction={reload} />
      ) : loading ? (
        <div className="prio-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="prio-col" key={i}>
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line-md" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="flag"
          title="Aucune priorité à définir 🎯"
          message="Créez des tâches avec différents niveaux de priorité pour les retrouver triées ici."
          actionLabel="Créer une tâche"
          onAction={openCreate}
        />
      ) : (
        <div className="prio-grid">
          {columns.map((col, index) => (
            <motion.section
              key={col.value}
              className="prio-col"
              aria-label={col.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <div className="prio-col-head">
                <span className={`prio-flag ${col.value}`} aria-hidden="true" />
                <div>
                  <h2 className="panel-title" style={{ fontSize: 15 }}>
                    {col.label} · {col.items.length}
                  </h2>
                  <p className="subtle" style={{ fontSize: 12 }}>{col.hint}</p>
                </div>
              </div>
              {col.items.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Rien ici — {col.value === 'high' ? 'profitez-en, aucune urgence.' : 'tout est sous contrôle.'}
                </p>
              ) : (
                <ul className="focus-list">
                  {col.items.map((task) => (
                    <li key={task._id} className="focus-row">
                      <button
                        type="button"
                        className="hima-check"
                        onClick={() => toggleComplete(task)}
                        aria-label={`Terminer « ${task.title} »`}
                      >
                        <Icon name="check" size={14} />
                      </button>
                      <span className="focus-body">
                        <span className="focus-title">{task.title}</span>
                        <span className="focus-meta">
                          {isOverdue(task) ? (
                            <strong style={{ color: 'var(--danger)' }}>En retard</strong>
                          ) : (
                            PRIORITY_LABELS[task.priority] ?? task.priority
                          )}
                        </span>
                      </span>
                      <button type="button" className="icon-btn" onClick={() => setViewingId(task._id)} aria-label={`Voir « ${task.title} »`}>
                        <Icon name="eye" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      )}

      <TaskDetails
        taskId={viewingId}
        onClose={() => setViewingId(null)}
        onAuthError={handleAuthError}
        onEdit={() => setViewingId(null)}
        onDelete={() => setViewingId(null)}
      />
    </div>
  );
}
