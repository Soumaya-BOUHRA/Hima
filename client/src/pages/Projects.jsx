import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from '../context/TasksContext.jsx';
import { groupByProject } from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskSheet from '../components/TaskSheet.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const PALETTES = [
  { g: 'linear-gradient(135deg,#7E80D8,#CD49AA)', glow: 'rgba(150,90,190,0.22)' },
  { g: 'linear-gradient(135deg,#CD49AA,#67CECB)', glow: 'rgba(160,90,180,0.20)' },
  { g: 'linear-gradient(135deg,#67CECB,#7E80D8)', glow: 'rgba(103,206,203,0.20)' },
  { g: 'linear-gradient(135deg,#5b5dd1,#37a8a5)', glow: 'rgba(91,93,209,0.20)' },
  { g: 'linear-gradient(135deg,#b0449b,#f59e0b)', glow: 'rgba(205,73,170,0.18)' },
  { g: 'linear-gradient(135deg,#3b82f6,#67CECB)', glow: 'rgba(59,130,246,0.18)' },
];

export default function Projects() {
  const { tasks, loading, loadError, reload, openCreate, updateTask, toggleComplete, deleteTask, handleAuthError } = useTasks();
  const [selected, setSelected] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const groups = useMemo(() => groupByProject(tasks), [tasks]);
  const active = groups.find((g) => g.name === selected) ?? null;
  const projectSuggestions = useMemo(
    () => groups.map((g) => g.name).filter((n) => n !== 'Sans projet'),
    [groups]
  );

  const startEdit = (task) => {
    setViewingId(null);
    setFormError(null);
    setEditingTask(task);
  };

  const startDelete = (task) => {
    setViewingId(null);
    setDeleteError(null);
    setDeletingTask(task);
  };

  const handleUpdate = async (values) => {
    if (!editingTask) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      await updateTask(editingTask._id, values);
      setEditingTask(null);
    } catch (error) {
      if (handleAuthError(error)) {
        setEditingTask(null);
        return;
      }
      setFormError(error.message);
      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await deleteTask(deletingTask._id);
      setDeletingTask(null);
    } catch (error) {
      if (handleAuthError(error)) {
        setDeletingTask(null);
        return;
      }
      setDeleteError(error.message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

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
            Projets
          </motion.h1>
          <p className="page-subtitle">
            {groups.length} projet{groups.length > 1 ? 's' : ''} · regroupez vos tâches par projet depuis le formulaire.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Nouvelle tâche
        </button>
      </header>

      {loading ? (
        <div className="project-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="project-card" key={i}>
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line-sm" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <ErrorState title="Impossible de charger vos projets" message={loadError} actionLabel="Réessayer" onAction={reload} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Aucun projet pour l’instant 📁"
          message="Ajoutez un nom de projet à vos tâches et retrouvez-les regroupées ici, avec leur progression."
          actionLabel="Créer une tâche"
          onAction={openCreate}
        />
      ) : (
        <>
          <div className="project-grid">
            {groups.map((group, index) => {
              const palette = PALETTES[index % PALETTES.length];
              const isSelected = selected === group.name;
              return (
                <motion.button
                  key={group.name}
                  type="button"
                  className="project-card"
                  style={{ '--proj-g': palette.g, '--proj-glow': palette.glow }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * index }}
                  onClick={() => setSelected(isSelected ? null : group.name)}
                  aria-pressed={isSelected}
                  aria-label={`${group.name} — ${group.done} sur ${group.total} tâches terminées`}
                >
                  <span className="project-card-glow" aria-hidden="true" />
                  <span className="project-card-top">
                    <span className="project-glyph" aria-hidden="true">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="project-name" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {group.name}
                      </span>
                      <span className="project-count">
                        {group.done} / {group.total} tâche{group.total > 1 ? 's' : ''}
                      </span>
                    </span>
                  </span>
                  <span className="project-bar" role="progressbar" aria-valuenow={group.rate} aria-valuemin="0" aria-valuemax="100" aria-label={`Progression ${group.name}`}>
                    <span className="project-bar-fill" style={{ width: `${group.rate}%` }} />
                  </span>
                  <span className="project-foot">
                    <span>{group.rate}% terminé</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary-strong)' }}>
                      {isSelected ? 'Masquer' : 'Voir les tâches'}
                      <Icon name="chevronDown" size={14} />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {active ? (
              <motion.section
                key={active.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                aria-label={`Tâches du projet ${active.name}`}
              >
                <h2 className="panel-title" style={{ margin: '26px 0 14px' }}>
                  {active.name} — {active.items.length} tâche{active.items.length > 1 ? 's' : ''}
                </h2>
                <div className="task-grid">
                  {active.items.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onView={() => setViewingId(task._id)}
                      onToggle={toggleComplete}
                      onEdit={() => startEdit(task)}
                      onDelete={() => startDelete(task)}
                    />
                  ))}
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </>
      )}

      <TaskSheet
        open={Boolean(editingTask)}
        mode="edit"
        task={editingTask}
        submitting={formSubmitting}
        error={formError}
        projectSuggestions={projectSuggestions}
        onClose={() => {
          if (!formSubmitting) setEditingTask(null);
        }}
        onSubmit={handleUpdate}
      />

      <TaskDetails
        taskId={viewingId}
        onClose={() => setViewingId(null)}
        onAuthError={handleAuthError}
        onEdit={startEdit}
        onDelete={startDelete}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Supprimer la tâche ?"
        message={deletingTask ? `« ${deletingTask.title} » sera définitivement supprimée. Cette action est irréversible.` : ''}
        loading={deleteSubmitting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleteSubmitting) setDeletingTask(null);
        }}
      />
    </div>
  );
}
