export const STATUS_LABELS = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Terminée',
};

export const PRIORITY_LABELS = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
};

export const STATUS_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
];

export function formatDate(value, options = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function isOverdue(task) {
  if (!task || !task.dueDate || task.status === 'completed') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isDueToday(task) {
  if (!task?.dueDate || task.status === 'completed') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return startOfDay(due).getTime() === startOfDay().getTime();
}

export function projectName(task) {
  const raw = task?.project ? String(task.project).trim() : '';
  return raw || 'Sans projet';
}

export function groupByProject(tasks) {
  const groups = new Map();
  for (const task of tasks || []) {
    const name = projectName(task);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(task);
  }
  return [...groups.entries()]
    .map(([name, items]) => {
      const total = items.length;
      const done = items.filter((t) => t.status === 'completed').length;
      return { name, items, total, done, rate: total ? Math.round((done / total) * 100) : 0 };
    })
    .sort((a, b) => b.total - a.total);
}

export function completionRate(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((done / tasks.length) * 100);
}

const DAY_LABELS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

export function last7DaysBuckets(tasks) {
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = startOfDay();
    date.setDate(date.getDate() - offset);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const created = (tasks || []).filter((t) => {
      const at = new Date(t.createdAt);
      return !Number.isNaN(at.getTime()) && at >= date && at < next;
    }).length;
    const done = (tasks || []).filter((t) => {
      const at = new Date(t.updatedAt);
      return (
        !Number.isNaN(at.getTime()) &&
        t.status === 'completed' &&
        at >= date &&
        at < next
      );
    }).length;
    days.push({
      label: offset === 0 ? "Auj." : DAY_LABELS[date.getDay()],
      created,
      done,
    });
  }
  return days;
}

export function firstName(name) {
  if (!name) return '';
  return String(name).trim().split(/\s+/)[0] || '';
}
