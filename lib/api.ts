import axios from "axios";
import { getApiBaseUrl } from "./config";
const apiClient = axios.create({
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json", "X-NexusPay-Request": "1" },
});
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});
export const authUtils = {
  clearAuth: () => {
    if (typeof window === "undefined") return;
    for (const store of ["localStorage", "sessionStorage"] as const) {
      try {
        for (const key of [
          "nexuspay_token",
          "user",
          "nexuspay_user",
          "refresh_token",
        ])
          window[store].removeItem(key);
      } catch {}
    }
  },
  ensureAuthenticated: async () => {
    try {
      await apiClient.get("/auth/me");
      return true;
    } catch {
      return false;
    }
  },
};
export default apiClient;
export { apiClient as api };
