const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';
const REDIRECT_KEY = 'taskflow_redirect';

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : la session ne sera pas persistée */
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* stockage indisponible : rien à nettoyer */
  }
}

export function getToken() {
  return read(TOKEN_KEY);
}

export function getCachedUser() {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  write(TOKEN_KEY, token);
  write(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  remove(TOKEN_KEY);
  remove(USER_KEY);
}

export function saveRedirectPath(path) {
  write(REDIRECT_KEY, path);
}

export function consumeRedirectPath() {
  const path = read(REDIRECT_KEY);
  remove(REDIRECT_KEY);
  return path;
}
