import { getToken, setSession } from './storage.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isAuthError = (error) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez que l’API est démarrée sur le port 5000.',
      0
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload.message === 'string' && payload.message) ||
      `Erreur ${response.status} : la requête a échoué.`;
    throw new ApiError(message, response.status);
  }

  return payload;
}

/* ----------------------------- Authentification ----------------------------- */

export async function register(name, email, password) {
  const payload = await request('/auth/register', {
    method: 'POST',
    auth: false,
    body: { name, email, password },
  });
  const { token, user } = payload.data;
  setSession(token, user);
  return user;
}

export async function login(email, password) {
  const payload = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  const { token, user } = payload.data;
  setSession(token, user);
  return user;
}

export async function fetchCurrentUser() {
  const payload = await request('/auth/me');
  return payload.data.user;
}

/* ---------------------------------- Tâches ---------------------------------- */

export async function fetchTasks() {
  const payload = await request('/tasks');
  return payload.data.tasks;
}

export async function fetchTask(id) {
  const payload = await request(`/tasks/${encodeURIComponent(id)}`);
  return payload.data.task;
}

export async function createTask(input) {
  const payload = await request('/tasks', { method: 'POST', body: input });
  return payload.data.task;
}

export async function updateTask(id, input) {
  const payload = await request(`/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: input,
  });
  return payload.data.task;
}

export async function deleteTask(id) {
  const payload = await request(`/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return payload.data.task;
}
