import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext.jsx';
import * as api from '../services/api.js';
import { clearSession, getCachedUser, getToken } from '../services/storage.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!getToken()) {
      clearSession();
      return null;
    }
    return getCachedUser();
  });
  const [initializing, setInitializing] = useState(() => Boolean(getToken()));
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    if (!getToken()) return undefined;

    let cancelled = false;

    api
      .fetchCurrentUser()
      .then((me) => {
        if (!cancelled) {
          setUser(me);
          setSessionError(null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (api.isAuthError(error)) {
          clearSession();
          setUser(null);
          setSessionError(null);
          return;
        }
        // Réseau indisponible ou erreur serveur : on conserve la session
        // en cache et on prévient l'utilisateur sans le déconnecter.
        if (!getCachedUser()) {
          clearSession();
          setUser(null);
        }
        setSessionError(error.message);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
    setSessionError(null);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const registeredUser = await api.register(name, email, password);
    setUser(registeredUser);
    setSessionError(null);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setSessionError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await api.fetchCurrentUser();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      sessionError,
      login,
      register,
      logout,
      refreshUser,
      setSessionError,
    }),
    [user, initializing, sessionError, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
