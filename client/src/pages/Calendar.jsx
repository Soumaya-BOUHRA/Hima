import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../context/TasksContext.jsx';
import { isOverdue, startOfDay } from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import ErrorState from '../components/ErrorState.jsx';

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export default function Calendar() {
  const { tasks, loading, loadError, reload, openCreate, toggleComplete, handleAuthError } = useTasks();
  const today = useMemo(() => startOfDay(), []);
  const [cursor, setCursor] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [selected, setSelected] = useState(today);
  const [viewingId, setViewingId] = useState(null);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = startOfDay(new Date(task.dueDate)).getTime();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(cursor.y, cursor.m, 1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [cursor]);

  const selectedTasks = useMemo(
    () => byDay.get(startOfDay(selected).getTime()) ?? [],
    [byDay, selected]
  );

  const move = (delta) => {
    setCursor((c) => {
      const date = new Date(c.y, c.m + delta, 1);
      return { y: date.getFullYear(), m: date.getMonth() };
    });
  };

  const goToday = () => {
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
    setSelected(today);
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
            Calendrier
          </motion.h1>
          <p className="page-subtitle">
            {MONTHS[cursor.m]} {cursor.y} · vos échéances en un coup d’œil.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => move(-1)} aria-label="Mois précédent">
            <Icon name="chevronDown" size={15} className="cal-arrow-prev" />
            <span className="btn-label">Préc.</span>
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={goToday}>
            Aujourd’hui
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => move(1)} aria-label="Mois suivant">
            <span className="btn-label">Suiv.</span>
            <Icon name="chevronDown" size={15} className="cal-arrow-next" />
          </button>
        </div>
      </header>

      {loadError ? (
        <ErrorState title="Impossible de charger le calendrier" message={loadError} actionLabel="Réessayer" onAction={reload} />
      ) : (
        <div className="cal-layout">
          <section className="panel" aria-label="Grille du mois">
            <div className="cal-grid">
              {DOW.map((day) => (
                <span key={day} className="cal-dow">{day}</span>
              ))}
              {cells.map((date) => {
                const key = date.getTime();
                const dayTasks = byDay.get(startOfDay(date).getTime()) ?? [];
                const outside = date.getMonth() !== cursor.m;
                const isToday = sameDay(date, today);
                const isSelected = sameDay(date, selected);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`cal-day${outside ? ' is-outside' : ''}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelected(date)}
                    aria-label={`${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${dayTasks.length} tâche${dayTasks.length > 1 ? 's' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <span className="cal-num">{date.getDate()}</span>
                    {dayTasks.length > 0 ? (
                      <span className="cal-dots" aria-hidden="true">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span
                            key={t._id}
                            className={`cal-dot${t.status === 'completed' ? ' done' : isOverdue(t) ? ' over' : ' open'}`}
                          />
                        ))}
                        {dayTasks.length > 3 ? (
                          <span className="cal-more">+{dayTasks.length - 3}</span>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="cal-dot open" /> À faire
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="cal-dot done" /> Terminée
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="cal-dot over" /> En retard
              </span>
            </div>
          </section>

          <section className="panel" aria-label="Tâches du jour sélectionné">
            <div className="panel-head">
              <h2 className="panel-title">
                {selected.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-md" />
              </div>
            ) : selectedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                <p style={{ fontSize: 15, fontWeight: 650 }}>Journée libre 🎉</p>
                <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                  Aucune échéance ce jour-là. Idéal pour avancer sur vos objectifs.
                </p>
                <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={openCreate}>
                  <Icon name="plus" size={15} />
                  Créer une tâche
                </button>
              </div>
            ) : (
              <ul className="focus-list">
                {selectedTasks.map((task) => (
                  <li key={task._id} className={`focus-row${task.status === 'completed' ? ' is-done' : ''}`}>
                    <button
                      type="button"
                      className={`hima-check${task.status === 'completed' ? ' is-checked' : ''}`}
                      onClick={() => toggleComplete(task)}
                      aria-label={`Terminer « ${task.title} »`}
                    >
                      <Icon name="check" size={14} />
                    </button>
                    <span className="focus-body">
                      <span className="focus-title">{task.title}</span>
                      <span className="focus-meta">
                        {task.status === 'completed' ? 'Terminée' : isOverdue(task) ? <strong style={{ color: 'var(--danger)' }}>En retard</strong> : 'Échéance ce jour'}
                      </span>
                    </span>
                    <button type="button" className="icon-btn" onClick={() => setViewingId(task._id)} aria-label={`Voir « ${task.title} »`}>
                      <Icon name="eye" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
