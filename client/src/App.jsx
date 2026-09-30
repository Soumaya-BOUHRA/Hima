import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import AuthProvider from './context/AuthProvider.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import TasksProvider from './context/TasksProvider.jsx';
import { useTasks } from './context/TasksContext.jsx';
import { RouteContext, useHashRoute, useRoute, isAppRoute } from './hooks/useHashRoute.js';
import { groupByProject, isOverdue } from './utils/task.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Background from './components/Background.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import MobileNav from './components/MobileNav.jsx';
import TaskSheet from './components/TaskSheet.jsx';
import Toasts from './components/Toasts.jsx';
import Icon from './components/Icon.jsx';
import EmptyState from './components/EmptyState.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Projects from './pages/Projects.jsx';
import Calendar from './pages/Calendar.jsx';
import Priorities from './pages/Priorities.jsx';
import Statistics from './pages/Statistics.jsx';

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

function ShellInner() {
  const { route, navigate } = useRoute();
  const {
    tasks,
    notice,
    createOpen,
    setCreateOpen,
    openCreate,
    formSubmitting,
    formError,
    handleCreateSubmit,
  } = useTasks();

  const overdueCount = useMemo(() => tasks.filter(isOverdue).length, [tasks]);
  const projectSuggestions = useMemo(
    () => groupByProject(tasks).map((g) => g.name).filter((n) => n !== 'Sans projet'),
    [tasks]
  );

  const page = useMemo(() => {
    switch (route) {
      case '/':
      case '/dashboard':
        return <Dashboard />;
      case '/taches':
        return <Tasks />;
      case '/projets':
        return <Projects />;
      case '/calendrier':
        return <Calendar />;
      case '/priorites':
        return <Priorities />;
      case '/statistiques':
        return <Statistics />;
      default:
        return <NotFound onHome={() => navigate('/dashboard')} />;
    }
  }, [route, navigate]);

  return (
    <div className="app-shell">
      <Background />
      <Sidebar route={route} overdueCount={overdueCount} />
      <div className="app-main-col">
        <Topbar route={route} overdueCount={overdueCount} />
        <motion.main
          className="app-main"
          key={isAppRoute(route) ? route : 'not-found'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {page}
        </motion.main>
      </div>
      <MobileNav route={route} />
      <button
        type="button"
        className="fab"
        onClick={openCreate}
        aria-label="Créer une tâche"
      >
        <Icon name="plus" size={26} />
      </button>
      <TaskSheet
        open={createOpen}
        mode="create"
        task={null}
        submitting={formSubmitting}
        error={formError}
        projectSuggestions={projectSuggestions}
        onClose={() => {
          if (!formSubmitting) setCreateOpen(false);
        }}
        onSubmit={handleCreateSubmit}
      />
      <Toasts notice={notice} />
    </div>
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
      <TasksProvider>
        <ShellInner />
      </TasksProvider>
    </ProtectedRoute>
  );
}

function App() {
  const [route, navigate] = useHashRoute();
  const routeContext = useMemo(() => ({ route, navigate }), [route, navigate]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RouteContext.Provider value={routeContext}>
          <AppShell />
        </RouteContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
