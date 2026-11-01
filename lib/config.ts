/** Configure this per deployment. Requests never retry against another backend. */
export const getApiBaseUrl = (): string => '/api';
export const getApiBaseUrlWithoutPath = () => getApiBaseUrl().replace(/\/api$/, '');
export const getApiUrl = (endpoint: string) => `${getApiBaseUrlWithoutPath()}${endpoint}`;
export const API_CONFIG = {
  get BASE_URL() { return getApiBaseUrl(); },
  get BASE_URL_WITHOUT_PATH() { return getApiBaseUrlWithoutPath(); },
} as const;
