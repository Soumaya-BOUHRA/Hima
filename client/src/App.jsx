import { useEffect, useMemo } from 'react';
import './App.css';
import AuthProvider from './context/AuthProvider.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { RouteContext, useHashRoute, useRoute } from './hooks/useHashRoute.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmptyState from './components/EmptyState.jsx';

function NotFound({ onHome }) {
  return (
    <EmptyState
      icon="alert"
      title="Page introuvable"
      message="La page que vous demandez n’existe pas ou a été déplacée."
      actionLabel="Retour au tableau de bord"
      onAction={onHome}
    />
  );
}

function AppShell() {
  const { user, initializing } = useAuth();
  const { route, navigate } = useRoute();
  const isGuestRoute = route === '/login' || route === '/register';

  useEffect(() => {
    if (initializing || !isGuestRoute || !user) return;
    navigate('/dashboard', { replace: true });
  }, [initializing, isGuestRoute, user, navigate]);

  if (initializing) {
    return <LoadingScreen label="Vérification de votre session…" />;
  }

  if (isGuestRoute) {
    if (user) return <LoadingScreen label="Redirection…" />;
    return (
      <div className="guest-layout">
        {route === '/login' ? <Login /> : <Register />}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          {route === '/' || route === '/dashboard' ? (
            <Dashboard />
          ) : (
            <NotFound onHome={() => navigate('/dashboard')} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  const [route, navigate] = useHashRoute();
  const routeContext = useMemo(() => ({ route, navigate }), [route, navigate]);

  return (
    <AuthProvider>
      <RouteContext.Provider value={routeContext}>
        <AppShell />
      </RouteContext.Provider>
    </AuthProvider>
  );
}

export default App;
