import axios from "axios";

// Create a single axios instance for all API requests
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000
});

// Add interceptors as needed for token refresh/global error
api.interceptors.response.use(
      response => response,
  error => {
    // Optionally add logout or token refresh on 401/403
    // Example: if (error.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);
