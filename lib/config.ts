/** Configure this per deployment. Requests never retry against another backend. */
export const getApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) return process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api';
  if (configured.startsWith('/') && !configured.startsWith('//')) return configured.replace(/\/$/, '');
  const url = new URL(configured);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid NEXT_PUBLIC_API_URL');
  return configured.replace(/\/$/, '');
};
export const getApiBaseUrlWithoutPath = () => getApiBaseUrl().replace(/\/api$/, '');
export const getApiUrl = (endpoint: string) => `${getApiBaseUrlWithoutPath()}${endpoint}`;
export const API_CONFIG = {
  get BASE_URL() { return getApiBaseUrl(); },
  get BASE_URL_WITHOUT_PATH() { return getApiBaseUrlWithoutPath(); },
} as const;
