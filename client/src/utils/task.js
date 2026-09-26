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
