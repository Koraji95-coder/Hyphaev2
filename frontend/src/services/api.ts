// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    // if login itself fails, just reject immediately
    if (
      error.response?.status === 401 &&
      original.url?.endsWith("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // Handle connection refused or server unavailable
    if (error.code === "ECONNREFUSED" || error.response?.status === 503) {
      console.error("Server unavailable:", error.message);
      return Promise.reject(
        new Error("Server is currently unavailable. Please try again later.")
      );
    }

    // If it's a 401 on the refresh endpoint itself, clear auth and fail
    if (
      error.response?.status === 401 &&
      original.url?.endsWith("/auth/refresh")
    ) {
      console.error("Refresh token failed, clearing auth header");
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("auth_access_token");
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    // For other 401s, try one refresh+retry
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const response = await api.post("/auth/refresh");

        if (!response.data || !response.data.access_token) {
          throw new Error("Invalid or missing access token in refresh response");
        }

        const { access_token } = response.data;

        if (access_token.split(".").length === 3) {
          console.log("Refresh successful, retrying original request");
          api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          original.headers["Authorization"] = `Bearer ${access_token}`;
          localStorage.setItem("auth_access_token", access_token);
          return api(original);
        }

        throw new Error("Invalid access token received from refresh");
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        delete api.defaults.headers.common["Authorization"];
        localStorage.removeItem("auth_access_token");
        return Promise.reject(
          new Error("Failed to refresh token. Please log in again.")
        );
      }
    }

    return Promise.reject(error);
  }
);
