// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config;

    // if it's a 401 on the refresh endpoint itself, do nothing
    if (
      error.response?.status === 401 &&
      original.url?.endsWith("/auth/refresh") // skip retry for refresh calls
    ) {
      // Optionally: force logout or clear header here
      delete api.defaults.headers.common["Authorization"];
      return Promise.reject(error);
    }

    // otherwise, for other 401s, try one refresh+retry
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { access_token } = (
          await api.post<{ access_token: string }>("/auth/refresh")
        ).data;

        // set the new token and retry the original request
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        original.headers["Authorization"] = `Bearer ${access_token}`;
        return api(original);

      } catch (refreshError) {
        // refresh failed, clear auth header to avoid further retries
        delete api.defaults.headers.common["Authorization"];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
