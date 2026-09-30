import { useCallback, useEffect, useMemo, useState } from 'react';
import TasksContext from './TasksContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import * as api from '../services/api.js';

export default function TasksProvider({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const openCreate = useCallback(() => {
    setFormError(null);
    setCreateOpen(true);
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      if (api.isAuthError(error)) {
        logout();
        navigate('/login', { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.fetchTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      if (!handleAuthError(error)) setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3400);
    return () => clearTimeout(timer);
  }, [notice]);

  const createTask = useCallback(
    async (values) => {
      const task = await api.createTask(values);
      setTasks((previous) => [task, ...previous]);
      setNotice('Tâche ajoutée — un pas de plus vers votre objectif.');
      return task;
    },
    []
  );

  const updateTask = useCallback(async (id, values) => {
    const updated = await api.updateTask(id, values);
    setTasks((previous) =>
      previous.map((task) => (task._id === updated._id ? updated : task))
    );
    return updated;
  }, []);

  const toggleComplete = useCallback(
    async (task) => {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      try {
        const updated = await api.updateTask(task._id, { status: nextStatus });
        setTasks((previous) =>
          previous.map((item) => (item._id === updated._id ? updated : item))
        );
        if (nextStatus === 'completed') {
          setNotice('Bravo — une tâche de plus vers votre objectif.');
        }
        return updated;
      } catch (error) {
        if (!handleAuthError(error)) setNotice(error.message);
        throw error;
      }
    },
    [handleAuthError]
  );

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((previous) => previous.filter((task) => task._id !== id));
    setNotice('Tâche supprimée.');
  }, []);

  const handleCreateSubmit = useCallback(
    async (values) => {
      setFormSubmitting(true);
      setFormError(null);
      try {
        await createTask(values);
      } catch (error) {
        if (handleAuthError(error)) {
          setCreateOpen(false);
          return;
        }
        setFormError(error.message);
        throw error;
      } finally {
        setFormSubmitting(false);
      }
    },
    [createTask, handleAuthError]
  );

  const value = useMemo(
    () => ({
      tasks,
      loading,
      loadError,
      notice,
      setNotice,
      reload: loadTasks,
      createTask,
      updateTask,
      toggleComplete,
      deleteTask,
      handleAuthError,
      createOpen,
      setCreateOpen,
      openCreate,
      formSubmitting,
      formError,
      handleCreateSubmit,
    }),
    [
      tasks,
      loading,
      loadError,
      notice,
      loadTasks,
      createTask,
      updateTask,
      toggleComplete,
      deleteTask,
      handleAuthError,
      createOpen,
      openCreate,
      formSubmitting,
      formError,
      handleCreateSubmit,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
