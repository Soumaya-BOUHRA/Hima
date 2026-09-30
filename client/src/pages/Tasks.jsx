import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from '../context/TasksContext.jsx';
import { STATUS_FILTERS, groupByProject, isOverdue } from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskSheet from '../components/TaskSheet.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const SORTS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'due', label: 'Échéance proche' },
  { value: 'priority', label: 'Priorité' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Tasks() {
  const {
    tasks,
    loading,
    loadError,
    reload,
    openCreate,
    updateTask,
    toggleComplete,
    deleteTask,
    handleAuthError,
  } = useTasks();

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [editingTask, setEditingTask] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const projectSuggestions = useMemo(
    () => groupByProject(tasks).map((g) => g.name).filter((n) => n !== 'Sans projet'),
    [tasks]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = filter === 'all' ? [...tasks] : tasks.filter((t) => t.status === filter);
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.project || '').toLowerCase().includes(q)
      );
    }
    if (sort === 'due') {
      list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sort === 'priority') {
      list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return list;
  }, [tasks, filter, query, sort]);

  const overdueCount = useMemo(() => tasks.filter(isOverdue).length, [tasks]);

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
            Mes tâches
          </motion.h1>
          <p className="page-subtitle">
            {tasks.length} tâche{tasks.length > 1 ? 's' : ''} au total.
            {overdueCount > 0 ? (
              <span className="overdue-summary">
                <Icon name="alert" size={14} />
                {overdueCount} en retard
              </span>
            ) : null}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Nouvelle tâche
        </button>
      </header>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filtrer par statut">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${filter === option.value ? 'is-active' : ''}`}
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label className="search-input">
            <span className="search-input-icon" aria-hidden="true">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              className="input"
              placeholder="Rechercher…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher une tâche"
            />
          </label>
          <select
            className="input select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Trier les tâches"
            style={{ width: 'auto' }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <section aria-label="Liste des tâches" aria-busy={loading}>
        {loading ? (
          <div className="task-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="task-card" key={i}>
                <div className="skeleton-line skeleton-line-sm" />
                <div className="skeleton-line skeleton-line-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-md" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <ErrorState title="Impossible de charger vos tâches" message={loadError} actionLabel="Réessayer" onAction={reload} />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Aucune tâche pour le moment"
            message="Créez votre première tâche pour commencer à organiser votre journée."
            actionLabel="Créer une tâche"
            onAction={openCreate}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search"
            title="Aucun résultat 🎯"
            message="Essayez un autre mot-clé ou changez de filtre pour retrouver vos tâches."
            actionLabel="Réinitialiser"
            onAction={() => {
              setQuery('');
              setFilter('all');
            }}
          />
        ) : (
          <motion.div className="task-grid" layout>
            <AnimatePresence initial={false}>
              {visible.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onView={() => setViewingId(task._id)}
                  onToggle={toggleComplete}
                  onEdit={() => {
                    setFormError(null);
                    setEditingTask(task);
                  }}
                  onDelete={() => {
                    setDeleteError(null);
                    setDeletingTask(task);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

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
        onEdit={(task) => {
          setViewingId(null);
          setFormError(null);
          setEditingTask(task);
        }}
        onDelete={(task) => {
          setViewingId(null);
          setDeleteError(null);
          setDeletingTask(task);
        }}
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
