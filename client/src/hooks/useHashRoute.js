import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const RouteContext = createContext({ route: '/', navigate: () => {} });

function readHashRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export const NAV_ITEMS = [
  { to: '/dashboard', label: "Vue d'ensemble", icon: 'overview' },
  { to: '/taches', label: 'Mes tâches', icon: 'tasks' },
  { to: '/projets', label: 'Projets', icon: 'layers' },
  { to: '/calendrier', label: 'Calendrier', icon: 'calendar' },
  { to: '/priorites', label: 'Priorités', icon: 'flag' },
  { to: '/statistiques', label: 'Statistiques', icon: 'chart' },
];

export const APP_ROUTES = [
  '/',
  '/dashboard',
  '/taches',
  '/projets',
  '/calendrier',
  '/priorites',
  '/statistiques',
];

export function isAppRoute(route) {
  return APP_ROUTES.includes(route);
}

export function routeTitle(route) {
  const found = NAV_ITEMS.find((item) => item.to === route);
  if (found) return found.label;
  if (route === '/' || route === '/dashboard') return "Vue d'ensemble";
  return '';
}

export function useRoute() {
  return useContext(RouteContext);
}

export function useNavigate() {
  return useContext(RouteContext).navigate;
}

export function useHashRoute() {
  const [route, setRoute] = useState(readHashRoute);

  useEffect(() => {
    const handleChange = () => setRoute(readHashRoute());
    window.addEventListener('hashchange', handleChange);
    window.addEventListener('popstate', handleChange);
    return () => {
      window.removeEventListener('hashchange', handleChange);
      window.removeEventListener('popstate', handleChange);
    };
  }, []);

  const navigate = useCallback((to, options = {}) => {
    const path = to.startsWith('/') ? to : `/${to}`;
    const target = `#${path}`;

    if (options.replace) {
      window.history.replaceState(null, '', target);
      setRoute(path);
      return;
    }

    if (window.location.hash === target) {
      setRoute(path);
      return;
    }

    window.location.hash = target;
  }, []);

  return useMemo(() => [route, navigate], [route, navigate]);
}
