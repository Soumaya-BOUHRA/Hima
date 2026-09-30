import { useState } from 'react';
import { STATUS_LABELS, PRIORITY_LABELS, toInputDate } from '../utils/task.js';

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 2000;
const MAX_PROJECT = 60;

const buildValues = (task) => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  status: task?.status ?? 'pending',
  priority: task?.priority ?? 'medium',
  dueDate: toInputDate(task?.dueDate),
  project: task?.project ?? '',
});

const validate = (values) => {
  const errors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Le titre est requis.';
  } else if (title.length < 2) {
    errors.title = 'Le titre doit contenir au moins 2 caractères.';
  } else if (title.length > MAX_TITLE) {
    errors.title = `Le titre ne peut pas dépasser ${MAX_TITLE} caractères.`;
  }

  if (values.description.length > MAX_DESCRIPTION) {
    errors.description = `La description ne peut pas dépasser ${MAX_DESCRIPTION} caractères.`;
  }

  return errors;
};

export default function TaskForm({
  task,
  onSubmit,
  submitting = false,
  error,
  submitLabel = 'Enregistrer',
  projectSuggestions = [],
}) {
  const [values, setValues] = useState(() => buildValues(task));
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || null,
      project: values.project.trim(),
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className={`field ${fieldErrors.title ? 'field-invalid' : ''}`}>
        <label className="field-label" htmlFor="task-title">
          Titre <span className="required-mark">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          className="input"
          value={values.title}
          onChange={handleChange}
          placeholder="Ex. Préparer la présentation client"
          maxLength={MAX_TITLE}
          autoComplete="off"
          autoFocus
          aria-invalid={fieldErrors.title ? 'true' : 'false'}
          aria-describedby={fieldErrors.title ? 'task-title-error' : undefined}
        />
        {fieldErrors.title ? (
          <p className="field-error" id="task-title-error">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className={`field ${fieldErrors.description ? 'field-invalid' : ''}`}>
        <label className="field-label" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          className="input textarea"
          value={values.description}
          onChange={handleChange}
          placeholder="Ajoutez des détails, des liens ou des notes…"
          rows={4}
          maxLength={MAX_DESCRIPTION}
          aria-invalid={fieldErrors.description ? 'true' : 'false'}
          aria-describedby={
            fieldErrors.description ? 'task-description-error' : undefined
          }
        />
        <div className="field-hint-row">
          {fieldErrors.description ? (
            <p className="field-error" id="task-description-error">
              {fieldErrors.description}
            </p>
          ) : (
            <span />
          )}
          <span className="field-hint">
            {values.description.length}/{MAX_DESCRIPTION}
          </span>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="task-project">
          Projet
        </label>
        <input
          id="task-project"
          name="project"
          type="text"
          className="input"
          value={values.project}
          onChange={handleChange}
          placeholder="Ex. Marketing, Personnel…"
          maxLength={MAX_PROJECT}
          autoComplete="off"
          list="hima-project-suggestions"
        />
        {projectSuggestions?.length ? (
          <datalist id="hima-project-suggestions">
            {projectSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        ) : null}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="task-status">
            Statut
          </label>
          <select
            id="task-status"
            name="status"
            className="input select"
            value={values.status}
            onChange={handleChange}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-priority">
            Priorité
          </label>
          <select
            id="task-priority"
            name="priority"
            className="input select"
            value={values.priority}
            onChange={handleChange}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-dueDate">
            Échéance
          </label>
          <input
            id="task-dueDate"
            name="dueDate"
            type="date"
            className="input"
            value={values.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
