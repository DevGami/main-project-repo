const API_URL = `http://${window.location.hostname}:3000/api`;

/**
 * Get stored auth token from localStorage.
 */
const getToken = () => localStorage.getItem('passop_token');

/**
 * Get stored master key from sessionStorage (cleared on tab close for security).
 */
const getMasterKey = () => sessionStorage.getItem('passop_master_key');

/**
 * Build headers for authenticated + encrypted requests.
 */
const authHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const masterKey = getMasterKey();
  if (masterKey) headers['x-master-key'] = masterKey;
  return headers;
};

// ── Auth API ──

export const signup = async (email, username, password) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });
  return res.json();
};

// ── Passwords API ──

export const getPasswords = async () => {
  const res = await fetch(`${API_URL}/passwords`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const savePassword = async (site, username, password) => {
  const res = await fetch(`${API_URL}/passwords`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ site, username, password }),
  });
  return res.json();
};

export const updatePassword = async (id, site, username, password) => {
  const res = await fetch(`${API_URL}/passwords/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ site, username, password }),
  });
  return res.json();
};

export const deletePassword = async (id) => {
  const res = await fetch(`${API_URL}/passwords/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
};

// ── Token Management ──

export const setAuthData = (token, masterKey) => {
  localStorage.setItem('passop_token', token);
  if (masterKey) sessionStorage.setItem('passop_master_key', masterKey);
};

export const clearAuthData = () => {
  localStorage.removeItem('passop_token');
  sessionStorage.removeItem('passop_master_key');
};
