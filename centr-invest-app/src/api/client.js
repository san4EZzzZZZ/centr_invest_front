import { NativeModules, Platform } from 'react-native';

function getBundlerHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const match = scriptURL?.match(/^https?:\/\/([^/:]+)/);
  return match?.[1] ?? null;
}

function getDefaultApiUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  const bundlerHost = getBundlerHost();
  if (bundlerHost && bundlerHost !== 'localhost' && bundlerHost !== '127.0.0.1') {
    return `http://${bundlerHost}:8080/api`;
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

let memoryToken = null;

export function getToken() {
  if (memoryToken) return memoryToken;

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }

  return null;
}

export function setToken(token) {
  memoryToken = token;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function clearToken() {
  memoryToken = null;

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!response.ok) {
    let error = null;
    try {
      error = text ? JSON.parse(text) : null;
    } catch {
      error = null;
    }

    throw new Error(error?.detail || error?.title || text || `HTTP ${response.status}`);
  }

  return text ? JSON.parse(text) : undefined;
}

export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: ({ email, username, password }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
};

export const contentApi = {
  getProfessions: ({ title, profession } = {}) => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (profession) params.set('profession', profession);
    const query = params.toString();
    return apiFetch(`/professions${query ? `?${query}` : ''}`);
  },
  getTest: (testId) => apiFetch(`/tests/${testId}`),
};

export const attemptsApi = {
  start: (testId) => apiFetch(`/tests/${testId}/attempts`, { method: 'POST' }),
  get: (attemptId) => apiFetch(`/attempts/${attemptId}`),
  answer: (attemptId, answer) =>
    apiFetch(`/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answer),
    }),
  result: (attemptId) => apiFetch(`/attempts/${attemptId}/result`),
  aiReview: (attemptId) => apiFetch(`/attempts/${attemptId}/ai-review`),
};

export const profileApi = {
  get: () => apiFetch('/profile'),
  getFavorites: () => apiFetch('/profile/favorites'),
  addFavorite: (testId) => apiFetch(`/profile/favorites/tests/${testId}`, { method: 'POST' }),
  removeFavorite: (testId) => apiFetch(`/profile/favorites/tests/${testId}`, { method: 'DELETE' }),
};

export const adminApi = {
  getTests: ({ title, profession } = {}) => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (profession) params.set('profession', profession);
    const query = params.toString();
    return apiFetch(`/admin/tests${query ? `?${query}` : ''}`);
  },
  getTest: (testId) => apiFetch(`/admin/tests/${testId}`),
  createTest: (payload) =>
    apiFetch('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTest: (testId, payload) =>
    apiFetch(`/admin/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteTest: (testId) => apiFetch(`/admin/tests/${testId}`, { method: 'DELETE' }),
};
