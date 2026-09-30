import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../context/TasksContext.jsx';
import {
  STATUS_LABELS,
  completionRate,
  isOverdue,
  last7DaysBuckets,
  startOfDay,
} from '../utils/task.js';
import Icon from '../components/Icon.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

const DONUT_SIZE = 168;
const DONUT_STROKE = 20;
const DONUT_R = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_C = 2 * Math.PI * DONUT_R;

const STATUS_COLORS = {
  pending: '#7E80D8',
  'in-progress': '#CD49AA',
  completed: '#3fb3b0',
};

function StatusDonut({ counts, total }) {
  const segments = useMemo(() => {
    let acc = 0;
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => {
        const frac = total ? value / total : 0;
        const seg = { key, value, offset: acc, frac };
        acc += frac;
        return seg;
      });
  }, [counts, total]);

  return (
    <div className="donut-row">
      <svg width={DONUT_SIZE} height={DONUT_SIZE} role="img" aria-label="Répartition par statut">
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={DONUT_R}
          fill="none"
          stroke="var(--surface-sunken)"
          strokeWidth={DONUT_STROKE}
        />
        {segments.map((seg) => (
          <circle
            key={seg.key}
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={DONUT_R}
            fill="none"
            stroke={STATUS_COLORS[seg.key]}
            strokeWidth={DONUT_STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${seg.frac * DONUT_C} ${DONUT_C}`}
            strokeDashoffset={-seg.offset * DONUT_C}
            transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
            style={{ transition: 'stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease' }}
          />
        ))}
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="var(--text)"
        >
          {total}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize="11.5"
          fill="var(--text-subtle)"
        >
          tâches
        </text>
      </svg>
      <div className="legend">
        {Object.entries(counts).map(([key, value]) => (
          <span key={key} className="legend-item">
            <span className="legend-swatch" style={{ background: STATUS_COLORS[key] }} />
            {STATUS_LABELS[key] ?? key} · <strong>{value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const { tasks, loading, loadError, reload, openCreate } = useTasks();

  const week = useMemo(() => last7DaysBuckets(tasks), [tasks]);

  const weekDone = useMemo(() => {
    const since = startOfDay();
    since.setDate(since.getDate() - 7);
    return tasks.filter((t) => {
      if (t.status !== 'completed') return false;
      const at = new Date(t.updatedAt);
      return !Number.isNaN(at.getTime()) && at >= since;
    }).length;
  }, [tasks]);

  const rate = useMemo(() => completionRate(tasks), [tasks]);

  const counts = useMemo(
    () => ({
      pending: tasks.filter((t) => t.status === 'pending').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks]
  );

  const overdue = useMemo(() => tasks.filter(isOverdue).length, [tasks]);

  const prioSplit = useMemo(
    () => [
      { value: 'high', label: 'Haute', count: tasks.filter((t) => t.priority === 'high').length, color: 'linear-gradient(135deg,#f87171,#CD49AA)' },
      { value: 'medium', label: 'Moyenne', count: tasks.filter((t) => t.priority === 'medium').length, color: 'linear-gradient(135deg,#7E80D8,#67CECB)' },
      { value: 'low', label: 'Basse', count: tasks.filter((t) => t.priority === 'low').length, color: 'var(--border-strong)' },
    ],
    [tasks]
  );

  const maxBucket = Math.max(1, ...week.flatMap((d) => [d.created, d.done]));
  const GOAL = 40;

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
            Statistiques
          </motion.h1>
          <p className="page-subtitle">
            Votre rythme, raconté par vos tâches — pas seulement des chiffres.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Nouvelle tâche
        </button>
      </header>

      {loadError ? (
        <ErrorState title="Impossible de charger vos statistiques" message={loadError} actionLabel="Réessayer" onAction={reload} />
      ) : loading ? (
        <div className="stat-story" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="card story-card" key={i}>
              <div className="skeleton-line skeleton-line-sm" />
              <div className="skeleton-line skeleton-line-title" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Pas encore de données 📊"
          message="Terminez vos premières tâches et vos statistiques prendront vie ici."
          actionLabel="Créer une tâche"
          onAction={openCreate}
        />
      ) : (
        <>
          <div className="stat-story">
            <motion.section
              className="card story-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Cette semaine"
            >
              <p className="story-kicker">Cette semaine</p>
              <p className="story-big">+{weekDone}</p>
              <p className="story-sub">tâches terminées — {overdue > 0 ? `${overdue} en retard à rattraper.` : 'aucun retard, bravo.'}</p>
            </motion.section>
            <motion.section
              className="card story-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              aria-label="Votre rythme"
            >
              <p className="story-kicker">Votre rythme</p>
              <p className="story-big gradient-text">{rate}%</p>
              <p className="story-sub">taux de complétion global sur {tasks.length} tâches.</p>
            </motion.section>
            <motion.section
              className="card story-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              aria-label="Objectif"
            >
              <p className="story-kicker">Objectif</p>
              <p className="story-big">{counts.completed} <span className="subtle" style={{ fontSize: 20 }}>/ {GOAL}</span></p>
              <div className="project-bar" style={{ marginTop: 10 }}>
                <div className="project-bar-fill" style={{ width: `${Math.min(100, Math.round((counts.completed / GOAL) * 100))}%` }} />
              </div>
              <p className="story-sub" style={{ marginTop: 8 }}>objectif de {GOAL} tâches terminées.</p>
            </motion.section>
          </div>

          <section className="card chart-card" aria-label="Activité des 7 derniers jours">
            <div className="panel-head">
              <h2 className="panel-title">Activité des 7 derniers jours</h2>
            </div>
            <div className="bars">
              {week.map((day) => (
                <div className="bar-col" key={day.label}>
                  <span className="bar-val">{day.done}</span>
                  <div className="bar-track" style={{ display: 'flex', gap: 3 }}>
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max(3, (day.created / maxBucket) * 100)}%`, '--bar-g': 'linear-gradient(180deg,#7E80D8,#a5a7ec)', flex: 1 }}
                      title={`${day.created} créée(s)`}
                    />
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max(3, (day.done / maxBucket) * 100)}%`, '--bar-g': 'linear-gradient(180deg,#67CECB,#3fb3b0)', flex: 1 }}
                      title={`${day.done} terminée(s)`}
                    />
                  </div>
                  <span className="bar-label">{day.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-swatch" style={{ background: '#7E80D8' }} /> Créées
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-swatch" style={{ background: '#3fb3b0' }} /> Terminées
              </span>
            </div>
          </section>

          <div className="dash-cols">
            <section className="card chart-card" style={{ marginBottom: 0 }} aria-label="Répartition par statut">
              <div className="panel-head">
                <h2 className="panel-title">Répartition par statut</h2>
              </div>
              <StatusDonut counts={counts} total={tasks.length} />
            </section>

            <section className="card chart-card" style={{ marginBottom: 0 }} aria-label="Répartition par priorité">
              <div className="panel-head">
                <h2 className="panel-title">Répartition par priorité</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
                {prioSplit.map((row) => (
                  <div key={row.value}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <strong>{row.label}</strong>
                      <span className="subtle">{row.count}</span>
                    </div>
                    <div className="project-bar">
                      <div
                        className="project-bar-fill"
                        style={{ width: `${tasks.length ? Math.round((row.count / tasks.length) * 100) : 0}%`, '--proj-g': row.color, background: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="story-sub" style={{ marginTop: 16 }}>
                <Icon name="target" size={14} style={{ verticalAlign: -2 }} /> Concentrez-vous d’abord sur les priorités hautes.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
