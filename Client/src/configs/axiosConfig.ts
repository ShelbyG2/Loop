import axios from "axios";
import { supabase } from "./supabaseConfig";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = "/";
          return Promise.reject(error);
        }

        return api(originalRequest);
      } catch (authError) {
        console.error("Authentication error:", authError);

        await supabase.auth.signOut();

        window.location.href = "/";
        return Promise.reject(authError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
