import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TasksContext.jsx';
import {
  STATUS_FILTERS,
  completionRate,
  firstName,
  groupByProject,
  isDueToday,
  isOverdue,
  startOfDay,
} from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import HimaCard from '../components/HimaCard.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskSheet from '../components/TaskSheet.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const STATS = [
  { key: 'total', label: 'Tâches totales', icon: 'layers', tone: '', accent: 'linear-gradient(180deg,#7E80D8,#CD49AA)' },
  { key: 'pending', label: 'En attente', icon: 'circle', tone: 'tone-amber', accent: '#f59e0b' },
  { key: 'inProgress', label: 'En cours', icon: 'clock', tone: 'tone-blue', accent: '#3b82f6' },
  { key: 'completed', label: 'Terminées', icon: 'check', tone: 'tone-green', accent: '#22c55e' },
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
  const { user, sessionError, setSessionError } = useAuth();
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
  const [editingTask, setEditingTask] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const stats = useMemo(() => {
    const countByStatus = (status) => tasks.filter((t) => t.status === status).length;
    return {
      total: tasks.length,
      pending: countByStatus('pending'),
      inProgress: countByStatus('in-progress'),
      completed: countByStatus('completed'),
      overdue: tasks.filter(isOverdue).length,
    };
  }, [tasks]);

  const rate = useMemo(() => completionRate(tasks), [tasks]);

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
    () => (filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  const todayFocus = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'completed');
    const score = (t) =>
      (isOverdue(t) ? 0 : isDueToday(t) ? 1 : t.priority === 'high' ? 2 : 3);
    return [...open].sort((a, b) => score(a) - score(b)).slice(0, 6);
  }, [tasks]);

  const doneToday = useMemo(() => {
    const today = startOfDay().getTime();
    return tasks.filter((t) => {
      if (t.status !== 'completed') return false;
      const at = new Date(t.updatedAt);
      return !Number.isNaN(at.getTime()) && startOfDay(at).getTime() === today;
    }).length;
  }, [tasks]);

  const topProjects = useMemo(() => groupByProject(tasks).slice(0, 3), [tasks]);

  const projectSuggestions = useMemo(
    () => groupByProject(tasks).map((g) => g.name).filter((n) => n !== 'Sans projet'),
    [tasks]
  );

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
          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Bonjour, {firstName(user?.name) || user?.name} 👋
          </motion.h1>
          <p className="page-subtitle">
            Voici où vous en êtes aujourd&apos;hui.
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

      <div className="hero-grid">
        <motion.section
          className="progress-hero"
          aria-label="Votre progression"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <ProgressRing rate={rate} />
          <div className="progress-hero-body">
            <p className="progress-hero-kicker">Votre progression</p>
            <h2 className="progress-hero-title">
              {rate >= 70
                ? 'Vous êtes sur une excellente dynamique.'
                : rate >= 40
                  ? 'Vous êtes sur une bonne dynamique.'
                  : 'Chaque tâche compte — avancez à votre rythme.'}
            </h2>
            <p className="progress-hero-sub">
              {stats.completed} tâche{stats.completed > 1 ? 's' : ''} terminée{stats.completed > 1 ? 's' : ''} sur {stats.total}
            </p>
            <span className="progress-hero-count">
              <Icon name="trendingUp" size={15} />
              {stats.total - stats.completed} tâche{stats.total - stats.completed > 1 ? 's' : ''} restante{stats.total - stats.completed > 1 ? 's' : ''}
            </span>
          </div>
        </motion.section>

        <HimaCard doneToday={doneToday} />
      </div>

      <section className="stats-grid" aria-label="Statistiques des tâches">
        {STATS.map((stat, index) => (
          <motion.div
            className="stat-card"
            key={stat.key}
            style={{ '--card-accent': stat.accent }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 * index }}
          >
            <span className={`stat-icon ${stat.tone}`}>
              <Icon name={stat.icon} size={18} />
            </span>
            <div className="stat-body">
              <p className="stat-value">{stats[stat.key]}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="dash-cols">
        <section className="panel" aria-label="Aujourd’hui">
          <div className="panel-head">
            <h2 className="panel-title">Aujourd&apos;hui</h2>
            <a className="panel-link" href="#/taches">Tout voir</a>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton-line skeleton-line-md" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line-sm" />
            </div>
          ) : todayFocus.length === 0 ? (
            <EmptyState
              icon="check"
              title="Aucune tâche pour aujourd’hui 🎉"
              message="Votre journée est libre. Profitez-en pour avancer sur vos objectifs."
              actionLabel="Créer une tâche"
              onAction={openCreate}
            />
          ) : (
            <ul className="focus-list">
              <AnimatePresence initial={false}>
                {todayFocus.map((task) => (
                  <motion.li
                    key={task._id}
                    className="focus-row"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 24 }}
                  >
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
                        ) : isDueToday(task) ? (
                          'Aujourd’hui'
                        ) : task.dueDate ? (
                          'À venir'
                        ) : (
                          'Sans échéance'
                        )}
                        <span className="dot-sep">{task.priority === 'high' ? 'Haute priorité' : task.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}</span>
                      </span>
                    </span>
                    <button type="button" className="icon-btn" onClick={() => setViewingId(task._id)} aria-label={`Voir « ${task.title} »`}>
                      <Icon name="eye" size={16} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>

        <section className="panel" aria-label="Aperçu des projets">
          <div className="panel-head">
            <h2 className="panel-title">Projets en cours</h2>
            <a className="panel-link" href="#/projets">Tout voir</a>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line-md" />
            </div>
          ) : topProjects.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              Nommez un projet dans vos tâches pour les regrouper ici.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topProjects.map((project) => (
                <div key={project.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, marginBottom: 6 }}>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</strong>
                    <span className="subtle">{project.done}/{project.total} · {project.rate}%</span>
                  </div>
                  <div className="project-bar">
                    <div className="project-bar-fill" style={{ width: `${project.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

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
            onAction={reload}
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
          <motion.div className="task-grid" layout>
            <AnimatePresence initial={false}>
              {visibleTasks.map((task) => (
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
    </div>
  );
}
