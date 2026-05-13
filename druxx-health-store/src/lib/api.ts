import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  timeout: 15000, // 15s timeout — prevents hanging requests
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Reads the cached accessToken from Zustand state.
// Does NOT call supabase.auth.getSession() per-request (would add 200-500ms latency).
// The token is kept fresh automatically by onAuthStateChange in authStore.
api.interceptors.request.use(
  (config) => {
    const token = (useAuthStore.getState() as any).accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Debounced 401 redirect ───────────────────────────────────────────────────
// Prevents multiple concurrent 401s from firing multiple window.location redirects.
let _redirectTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleAuthRedirect() {
  if (typeof window === "undefined") return;
  if (_redirectTimeout) return; // already scheduled
  _redirectTimeout = setTimeout(() => {
    _redirectTimeout = null;
    // Use replaceState so the browser back-button doesn't loop back to the
    // broken page. The redirect param lets the login page redirect back after login.
    const current = window.location.pathname + window.location.search;
    window.location.replace(`/login?expired=true&redirect=${encodeURIComponent(current)}`);
  }, 100);
}

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 401 Unauthorized: session expired ────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._authRetried) {
      originalRequest._authRetried = true;

      // Sign out from Supabase and clear local state
      useAuthStore.getState().logout();

      // Only redirect if we're actually on a page that requires auth.
      // Avoid redirecting on public API calls (e.g. product listings).
      const protectedPaths = ["/dashboard", "/checkout", "/cart"];
      if (typeof window !== "undefined") {
        const isProtected = protectedPaths.some((p) =>
          window.location.pathname.startsWith(p)
        );
        if (isProtected) scheduleAuthRedirect();
      }
    }

    // ── 429 Too Many Requests: exponential backoff ───────────────────────────
    if (error.response?.status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      const maxRetries = 3;
      if (originalRequest._retryCount <= maxRetries) {
        const backoff =
          Math.pow(2, originalRequest._retryCount) * 1000 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
