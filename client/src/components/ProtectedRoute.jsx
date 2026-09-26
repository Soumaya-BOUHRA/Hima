import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useRoute } from '../hooks/useHashRoute.js';
import { saveRedirectPath } from '../services/storage.js';
import LoadingScreen from './LoadingScreen.jsx';

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const { route } = useRoute();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing || user) return;
    saveRedirectPath(route);
    navigate('/login', { replace: true });
  }, [initializing, user, route, navigate]);

  if (initializing || !user) {
    return <LoadingScreen label="Vérification de votre session…" />;
  }

  return children;
}
