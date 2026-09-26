import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import { consumeRedirectPath } from '../services/storage.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Icon from '../components/Icon.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: '', password: '' });
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
    if (!values.email.trim()) errors.email = 'L’adresse email est requise.';
    if (!values.password) errors.password = 'Le mot de passe est requis.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setSubmitting(true);

    try {
      await login(values.email.trim(), values.password);
      const redirect = consumeRedirectPath();
      navigate(redirect && redirect !== '/login' ? redirect : '/dashboard', {
        replace: true,
      });
    } catch (err) {
      setError(err?.message || 'Connexion impossible pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour accéder à vos tâches."
      footer={
        <p>
          Pas encore de compte ?{' '}
          <a className="link" href="#/register">
            Créer un compte
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

        <div className={`field ${fieldErrors.email ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="login-email">
            Adresse email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="input"
            value={values.email}
            onChange={handleChange}
            placeholder="vous@exemple.com"
            autoComplete="email"
            autoFocus
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          />
          {fieldErrors.email ? (
            <p className="field-error" id="login-email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className={`field ${fieldErrors.password ? 'field-invalid' : ''}`}>
          <label className="field-label" htmlFor="login-password">
            Mot de passe
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="input"
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={fieldErrors.password ? 'true' : 'false'}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          />
          {fieldErrors.password ? (
            <p className="field-error" id="login-password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
          {!submitting ? <Icon name="arrowRight" size={16} /> : null}
        </button>
      </form>
    </AuthLayout>
  );
}
