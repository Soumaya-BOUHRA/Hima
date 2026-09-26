import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import * as api from '../services/api.js';
import { isAuthError } from '../services/api.js';
import { STATUS_FILTERS, isOverdue } from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import TaskForm from '../components/TaskForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const STATS = [
  { key: 'total', label: 'Tâches totales', icon: 'layers', tone: '' },
  { key: 'pending', label: 'En attente', icon: 'circle', tone: 'tone-amber' },
  { key: 'inProgress', label: 'En cours', icon: 'clock', tone: 'tone-blue' },
  { key: 'completed', label: 'Terminées', icon: 'check', tone: 'tone-green' },
];

function TaskCardSkeleton() {
  return (
    <div className="task-card skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line-sm" />
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-md" />
      <div className="skeleton-line skeleton-line-sm" />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, sessionError, setSessionError } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleAuthError = useCallback(
    (error) => {
      if (isAuthError(error)) {
        logout();
        navigate('/login', { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadTasks = useCallback(
    () =>
      api
        .fetchTasks()
        .then(
          (data) => {
            setTasks(Array.isArray(data) ? data : []);
            setLoadError(null);
          },
          (error) => {
            if (!handleAuthError(error)) setLoadError(error.message);
          }
        )
        .finally(() => {
          setLoading(false);
        }),
    [handleAuthError]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError(null);
    loadTasks();
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const openCreate = () => {
    setFormError(null);
    setCreateOpen(true);
  };

  const handleCreate = async (values) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      const task = await api.createTask(values);
      setTasks((previous) => [task, ...previous]);
      setCreateOpen(false);
      setNotice('Tâche créée avec succès.');
    } catch (error) {
      if (handleAuthError(error)) return;
      setFormError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    if (!editingTask) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      const updated = await api.updateTask(editingTask._id, values);
      setTasks((previous) =>
        previous.map((task) => (task._id === updated._id ? updated : task))
      );
      setEditingTask(null);
      setNotice('Tâche mise à jour.');
    } catch (error) {
      if (handleAuthError(error)) return;
      setFormError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.deleteTask(deletingTask._id);
      setTasks((previous) => previous.filter((task) => task._id !== deletingTask._id));
      setDeletingTask(null);
      setNotice('Tâche supprimée.');
    } catch (error) {
      if (handleAuthError(error)) return;
      setDeleteError(error.message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      tasks.filter((task) => task.status === status).length;
    return {
      total: tasks.length,
      pending: countByStatus('pending'),
      inProgress: countByStatus('in-progress'),
      completed: countByStatus('completed'),
      overdue: tasks.filter(isOverdue).length,
    };
  }, [tasks]);

  const filterCounts = useMemo(
    () => ({
      all: stats.total,
      pending: stats.pending,
      'in-progress': stats.inProgress,
      completed: stats.completed,
    }),
    [stats]
  );

  const visibleTasks = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)),
    [tasks, filter]
  );

  const showSkeleton = loading && !loadError;

  return (
    <div className="dashboard">
      {sessionError ? (
        <div className="alert alert-warning" role="alert">
          <Icon name="alert" size={16} />
          <span>{sessionError}</span>
          <button
            type="button"
            className="alert-dismiss"
            onClick={() => setSessionError(null)}
            aria-label="Masquer l’alerte"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ) : null}

      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Bonjour, {user?.name}</h1>
          <p className="page-subtitle">
            Voici un aperçu de vos tâches.
            {stats.overdue > 0 ? (
              <span className="overdue-summary">
                <Icon name="alert" size={14} />
                {stats.overdue} en retard
              </span>
            ) : null}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Nouvelle tâche
        </button>
      </header>

      <section className="stats-grid" aria-label="Statistiques des tâches">
        {STATS.map((stat) => (
          <div className="stat-card" key={stat.key}>
            <span className={`stat-icon ${stat.tone}`}>
              <Icon name={stat.icon} size={18} />
            </span>
            <div className="stat-body">
              <p className="stat-value">{stats[stat.key]}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

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
              <span className="chip-count">{filterCounts[option.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="task-section" aria-label="Liste des tâches" aria-busy={loading}>
        {showSkeleton ? (
          <div className="task-grid">
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        ) : loadError ? (
          <ErrorState
            title="Impossible de charger vos tâches"
            message={loadError}
            actionLabel="Réessayer"
            onAction={retryLoad}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Aucune tâche pour le moment"
            message="Créez votre première tâche pour commencer à organiser votre journée."
            actionLabel="Créer une tâche"
            onAction={openCreate}
          />
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            icon="layers"
            title="Aucune tâche dans ce filtre"
            message="Aucune tâche ne correspond au statut sélectionné."
            actionLabel="Afficher toutes les tâches"
            onAction={() => setFilter('all')}
          />
        ) : (
          <div className="task-grid">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onView={() => setViewingId(task._id)}
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
          </div>
        )}
      </section>

      <Modal
        open={createOpen}
        onClose={() => {
          if (!formSubmitting) setCreateOpen(false);
        }}
        title="Nouvelle tâche"
        description="Renseignez les informations de la tâche à créer."
        size="lg"
      >
        <TaskForm
          task={null}
          onSubmit={handleCreate}
          submitting={formSubmitting}
          error={formError}
          submitLabel="Créer la tâche"
        />
      </Modal>

      <Modal
        open={Boolean(editingTask)}
        onClose={() => {
          if (!formSubmitting) setEditingTask(null);
        }}
        title="Modifier la tâche"
        description="Mettez à jour les informations de cette tâche."
        size="lg"
      >
        {editingTask ? (
          <TaskForm
            key={editingTask._id}
            task={editingTask}
            onSubmit={handleUpdate}
            submitting={formSubmitting}
            error={formError}
            submitLabel="Enregistrer les modifications"
          />
        ) : null}
      </Modal>

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
        message={
          deletingTask
            ? `« ${deletingTask.title} » sera définitivement supprimée. Cette action est irréversible.`
            : ''
        }
        loading={deleteSubmitting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleteSubmitting) setDeletingTask(null);
        }}
      />

      {notice ? (
        <div className="toast" role="status" aria-live="polite">
          <Icon name="check" size={16} />
          {notice}
        </div>
      ) : null}
    </div>
  );
}
