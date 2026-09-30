import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Icon from '../components/Icon.jsx';

const MIN_PASSWORD = 6;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    const name = values.name.trim();
    const email = values.email.trim();

    if (!name) errors.name = 'Le nom est requis.';
    else if (name.length < 2) errors.name = 'Le nom doit contenir au moins 2 caractères.';
    else if (name.length > 60) errors.name = 'Le nom ne peut pas dépasser 60 caractères.';

    if (!email) errors.email = 'L’adresse email est requise.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Adresse email invalide.';

    if (!values.password) errors.password = 'Le mot de passe est requis.';
    else if (values.password.length < MIN_PASSWORD)
      errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;

    if (values.confirmPassword !== values.password)
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setSubmitting(true);

    try {
      await register(name, email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Création du compte impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez HIMA et donnez de l’élan à vos journées."
      footer={
        <p>
          Déjà un compte ?{' '}
          <a className="link" href="#/login">
            Se connecter
          </a>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="alert alert-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className={`field ${fieldErrors.name ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="register-name">
            Nom complet
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            className="input"
            value={values.name}
            onChange={handleChange}
            placeholder="Camille Dupont"
            autoComplete="name"
            autoFocus
            maxLength={60}
            aria-invalid={fieldErrors.name ? 'true' : 'false'}
            aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
          />
          {fieldErrors.name ? (
            <p className="field-error" id="register-name-error">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className={`field ${fieldErrors.email ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="register-email">
            Adresse email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            className="input"
            value={values.email}
            onChange={handleChange}
            placeholder="vous@exemple.com"
            autoComplete="email"
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          />
          {fieldErrors.email ? (
            <p className="field-error" id="register-email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className={`field ${fieldErrors.password ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="register-password">
            Mot de passe
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            className="input"
            value={values.password}
            onChange={handleChange}
            placeholder="6 caractères minimum"
            autoComplete="new-password"
            aria-invalid={fieldErrors.password ? 'true' : 'false'}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
          />
          {fieldErrors.password ? (
            <p className="field-error" id="register-password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className={`field ${fieldErrors.confirmPassword ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="register-confirm">
            Confirmer le mot de passe
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            className="input"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Retapez votre mot de passe"
            autoComplete="new-password"
            aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
            aria-describedby={
              fieldErrors.confirmPassword ? 'register-confirm-error' : undefined
            }
          />
          {fieldErrors.confirmPassword ? (
            <p className="field-error" id="register-confirm-error">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Création du compte…' : 'Créer mon compte'}
          {!submitting ? <Icon name="arrowRight" size={16} /> : null}
        </button>
      </form>
    </AuthLayout>
  );
}
