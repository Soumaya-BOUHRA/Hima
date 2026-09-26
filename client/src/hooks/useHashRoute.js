import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const RouteContext = createContext({ route: '/', navigate: () => {} });

function readHashRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
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
