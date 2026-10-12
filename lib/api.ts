import axios from 'axios';
import { getApiBaseUrl } from './config';
const storageKeys = ['nexuspay_token', 'user', 'nexuspay_user', 'refresh_token'];
function storages(): Storage[] {
  if (typeof window === 'undefined') return [];
  const result: Storage[] = [];
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    try { result.push(window[key]); } catch { /* Browser privacy policy may disable storage. */ }
  }
  return result;
}
function processToken(raw: string): string | null {
  try {
    let token = raw.trim();
    if (token.startsWith('{')) { const parsed = JSON.parse(token); token = parsed?.data?.token || parsed?.token || ''; }
    token = token.replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '').trim();
    return token.split('.').length === 3 ? token : null;
  } catch { return null; }
}
function getAuthToken(): string | null {
  for (const storage of storages()) for (const key of storageKeys.slice(0, 3)) {
    try { const raw = storage.getItem(key); const token = raw && processToken(raw); if (token) return token; } catch { /* Try the next store. */ }
  }
  return null;
}
const apiClient = axios.create({ timeout: 30000, headers: { 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use(config => {
  config.baseURL = getApiBaseUrl();
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Rejected payments remain rejected. Never retry a debit automatically or change environments.
export const authUtils = {
  getToken: getAuthToken,
  isAuthenticated: () => !!getAuthToken(),
  clearAuth: () => {
    for (const storage of storages()) for (const key of storageKeys) {
      try { storage.removeItem(key); } catch { /* Storage can be read-only. */ }
    }
  },
  setAuth: (token: string, userData?: unknown) => {
    for (const storage of storages()) {
      try { storage.setItem('nexuspay_token', token); if (userData) storage.setItem('nexuspay_user', JSON.stringify(userData)); break; } catch { /* Try session storage. */ }
    }
  },
  isValidToken: (token: string): boolean => {
    try {
      if (!processToken(token)) return false;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000;
    } catch { return false; }
  },
  ensureAuthenticated: async (): Promise<boolean> => {
    const token = getAuthToken();
    if (token && authUtils.isValidToken(token)) return true;
    authUtils.clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
    return false;
  },
};
export default apiClient;
export { apiClient as api };
