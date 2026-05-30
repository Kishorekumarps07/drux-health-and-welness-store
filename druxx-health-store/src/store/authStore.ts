"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import api from "@/lib/api";
import { userService } from "@/services/userService";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
  activeRole: string;
  isAdmin: boolean;
  isVendor: boolean;
  vendorStatus?: string;
  addresses: any[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatarUrl?: string | null;
  avatar?: string | null;
  phone?: string | null;
  addresses?: any[];
  vendor?: {
    id: string;
    approvalStatus: string;
    storeName: string;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  profile: UserProfile | null;
  /** True while the initial session check is running. False forever after. */
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  mismatchError?: { message: string; link: string; cta: string } | null;

  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string, requiredRole?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, forceRole?: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setActiveRole: (role: string) => void;
  sendOtp: (email: string, shouldCreateUser?: boolean) => Promise<boolean>;
  verifyOtp: (email: string, token: string, requiredRole?: string) => Promise<boolean>;
  loginWithGoogle: (requiredRole: string) => Promise<void>;
  clearMismatchError: () => void;
}

// Guard so initialize() is truly idempotent across React StrictMode double-invocations
let _initStarted = false;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Clear all auth artifacts from browser storage and axios defaults. */
function _clearAuthStorage() {
  if (typeof window !== "undefined") {
    console.trace("🧹 _clearAuthStorage called by:");
    localStorage.removeItem("token");
    // Also clear Supabase's own session storage keys (sb-<project>-auth-token).
    // These contain the refresh token that triggers "Invalid Refresh Token" errors
    // when the session has expired. Without clearing these, the error fires on
    // every page load until the user explicitly logs in again.
    const supabaseKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("sb-")
    );
    supabaseKeys.forEach((k) => localStorage.removeItem(k));
  }
  delete api.defaults.headers.common["Authorization"];
}

/** Check if the active role matches the requirements of the current login page */
function _checkRoleMismatch(pathname: string, role: string) {
  const normPathname = pathname.replace(/\/$/, "");
  if (normPathname === "/login" && role !== "CUSTOMER") {
    let message = "This account is registered as a Merchant/Vendor. Please use the Merchant Portal.";
    let link = "/vendor/login";
    let cta = "Go to Merchant Portal";
    if (role === "ADMIN") {
      message = "This account is registered as an Administrator. Please use the Admin Portal.";
      link = "/admin/login";
      cta = "Go to Admin Portal";
    }
    return { message, link, cta };
  }
  if (normPathname === "/vendor/login" && role !== "VENDOR") {
    let message = "This account is registered as a Customer. Please use the Customer Login.";
    let link = "/login";
    let cta = "Go to Customer Login";
    if (role === "ADMIN") {
      message = "This account is registered as an Administrator. Please use the Admin Portal.";
      link = "/admin/login";
      cta = "Go to Admin Portal";
    }
    return { message, link, cta };
  }
  if (normPathname === "/admin/login" && role !== "ADMIN") {
    let message = "Access Denied. Administrator privileges required.";
    let link = "/login";
    let cta = "Go to Customer Login";
    if (role === "VENDOR") {
      message = "Access Denied. Merchant privileges cannot access Admin Portal.";
      link = "/vendor/login";
      cta = "Go to Merchant Portal";
    }
    return { message, link, cta };
  }
  return null;
}

/** Apply a session token to storage and axios defaults. */
function _applyToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/**
 * Shared helper: checks if the actualRole matches requiredRole.
 * On mismatch: signs out, clears storage, sets mismatchError state, and throws.
 * Returns void (throws on mismatch, no-op on match).
 */
async function _handleRoleMismatch(
  actualRole: string,
  requiredRole: string,
  set: (state: Partial<AuthState>) => void,
  stateRef: { user: AuthUser | null }
) {
  if (requiredRole === actualRole) return; // ✅ match — nothing to do

  await supabase.auth.signOut();
  _clearAuthStorage();

  let message = `This account is a ${actualRole}. Please use the correct login portal.`;
  let link = "/login";
  let cta = "Go to Customer Login";

  if (actualRole === "ADMIN") {
    message = "This account is registered as an Administrator. Please use the Admin Portal.";
    link = "/admin/login";
    cta = "Go to Admin Portal";
  } else if (actualRole === "VENDOR") {
    message = "This account is registered as a Merchant/Vendor. Please use the Merchant Portal.";
    link = "/vendor/login";
    cta = "Go to Merchant Portal";
  } else if (requiredRole === "ADMIN") {
    message = "Access Denied. Administrator privileges required.";
    link = "/login";
    cta = "Go to Customer Login";
  } else if (requiredRole === "VENDOR") {
    message = "Access Denied. Merchant privileges required.";
    link = "/login";
    cta = "Go to Customer Login";
  }

  set({
    mismatchError: { message, link, cta },
    isAuthenticated: false,
    user: null,
    supabaseUser: null,
    profile: null,
    accessToken: null,
  });
  throw new Error("Role mismatch");
}

/**
 * Resolve the highest-privilege active role from a roles array.
 * Priority order: ADMIN > VENDOR > CUSTOMER (default).
 * Used by login() and verifyOtp() to determine the effective role before
 * comparing it against the requiredRole of the login portal.
 */
function _resolveActiveRole(roles: string[]): string {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("VENDOR")) return "VENDOR";
  return "CUSTOMER";
}

/** Fetch the user profile from the backend and return a normalised user object. */
async function _buildUserFromSession(sUser: SupabaseUser, session: { access_token: string } & Partial<Session>) {
  _applyToken(session.access_token);

  try {
    const data = await userService.getProfile();
    const profile = data.user;
    let role = "CUSTOMER";
    if (profile.roles?.includes("ADMIN")) {
      role = "ADMIN";
    } else if (profile.roles?.includes("VENDOR")) {
      role = "VENDOR";
    }

    const vendorStatus = profile.vendor?.approvalStatus;

    return {
      supabaseUser: sUser,
      profile,
      isAuthenticated: true,
      accessToken: session.access_token,
      mismatchError: null,
      user: {
        id: sUser.id,
        name: profile.name || sUser.user_metadata?.full_name || "User",
        email: sUser.email || "",
        avatar: profile.avatarUrl || profile.avatar || "",
        roles: profile.roles || ["CUSTOMER"],
        activeRole: role,
        isAdmin: profile.roles?.includes("ADMIN"),
        isVendor: profile.roles?.includes("VENDOR"),
        vendorStatus,
        addresses: profile.addresses || [],
      },
    };
  } catch {
    // Fallback: use Supabase metadata if backend is unreachable
    const metaRole = sUser.user_metadata?.role ?? "CUSTOMER";
    return {
      supabaseUser: sUser,
      profile: null,
      isAuthenticated: true,
      accessToken: session.access_token,
      mismatchError: null,
      user: {
        id: sUser.id,
        name: sUser.user_metadata?.full_name ?? sUser.email?.split("@")[0] ?? "User",
        email: sUser.email ?? "",
        avatar: "",
        roles: Array.from(new Set(["CUSTOMER", metaRole])),
        activeRole: metaRole,
        isAdmin: metaRole === "ADMIN",
        isVendor: metaRole === "VENDOR",
        addresses: [],
      },
    };
  }
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  supabaseUser: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  accessToken: null,
  mismatchError: null,

  clearMismatchError: () => set({ mismatchError: null }),

  // ── initialize ─────────────────────────────────────────────────────────────
  // Called once from SessionManager on app mount.
  // Bug 3 fix: Register the onAuthStateChange listener FIRST before calling
  // getSession(), so no SIGNED_IN event is ever missed.
  initialize: async () => {
    if (_initStarted) return;
    _initStarted = true;

    // Bug 3 fix: Listener is registered BEFORE getSession() call
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip INITIAL_SESSION — we handle that explicitly below with getSession()
      // to avoid double-processing on startup.
      if (event === "INITIAL_SESSION") return;

      // Stale/invalid refresh token (e.g. from a previous logged-out session).
      // Supabase fires this when the silent token refresh fails.
      // We silently wipe local state — no redirect, no error, no console noise.
      // Cast to string: older @supabase/supabase-js types omit TOKEN_REFRESH_FAILED
      // from the AuthChangeEvent union, but it fires at runtime.
      if ((event as string) === "TOKEN_REFRESH_FAILED") {
        _clearAuthStorage();
        set({
          isAuthenticated: false,
          user: null,
          supabaseUser: null,
          profile: null,
          accessToken: null,
        });
        return;
      }

      if (!session || !session.user) {
        // Only clear storage if this is a definitive SIGNED_OUT event
        // or if we don't have a token in localStorage to begin with.
        // This prevents transient null sessions on initial load from breaking active logins.
        const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");
        if (event === "SIGNED_OUT" || !hasLocalToken) {
          _clearAuthStorage();
          set({
            isAuthenticated: false,
            user: null,
            supabaseUser: null,
            profile: null,
            accessToken: null,
          });
        }
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const state = await _buildUserFromSession(session.user, session);

        // Pre-emptively check for role mismatch on login pages to prevent redirect races
        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          const userRole = state.user?.activeRole || "CUSTOMER";
          const mismatch = state.profile ? _checkRoleMismatch(pathname, userRole) : null;

          if (mismatch) {
            // Under an automatic auth change (e.g. in a background tab), do NOT globally sign out or clear storage,
            // as this would instantly disrupt a successful login that just occurred in the foreground tab.
            // Instead, simply flag the mismatchError locally on this page/tab.
            set({
              mismatchError: mismatch,
            });
            return;
          }
        }

        set({ ...state, mismatchError: null });
      }
    });

    // Now check the current session (handles page refresh / existing sessions)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user) {
        const state = await _buildUserFromSession(session.user, session);

        // Check for role mismatch on current page during initial session check
        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          const userRole = state.user?.activeRole || "CUSTOMER";
          const mismatch = state.profile ? _checkRoleMismatch(pathname, userRole) : null;

          if (mismatch) {
            // Under automatic session checks, do NOT globally sign out or clear storage
            // if this specific page/tab has a role mismatch, as it may be a background tab.
            // Simply flag the mismatchError locally.
            set({
              mismatchError: mismatch,
            });
            return;
          }
        }

        set({ ...state, mismatchError: null });
      } else {
        // Only clear storage if we don't have a token in localStorage
        const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");
        if (!hasLocalToken) {
          _clearAuthStorage();
          set({ isAuthenticated: false, user: null });
        } else {
          // If we have a local token, keep authenticated true so frontend continues using it
          set({ isAuthenticated: true });
        }
      }
    } catch {
      const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");
      if (!hasLocalToken) {
        _clearAuthStorage();
        set({ isAuthenticated: false, user: null });
      }
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  // ── refreshProfile ─────────────────────────────────────────────────────────
  refreshProfile: async () => {
    const { supabaseUser, accessToken } = get();
    if (!supabaseUser || !accessToken) return;
    const state = await _buildUserFromSession(supabaseUser, {
      access_token: accessToken,
    });
    set(state);
  },

  // ── login ──────────────────────────────────────────────────────────────────
  // Bug 4 fix: Inline the state sync so it always runs regardless of whether
  // _initStarted guard prevented initialize() from completing first.
  login: async (email, password, requiredRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error("Login failed. No session returned.");

    const state = await _buildUserFromSession(data.user, data.session);

    // Role check after building user from backend profile
    if (requiredRole && state.user) {
      const actualRole = _resolveActiveRole(state.user.roles);
      await _handleRoleMismatch(actualRole, requiredRole, set, state);
      // If we reach here, roles matched — force the activeRole
      state.user.activeRole = requiredRole;
    }

    set({ ...state, mismatchError: null });
    return true;
  },

  // ── register ───────────────────────────────────────────────────────────────
  register: async (name, email, password, forceRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: forceRole ?? "CUSTOMER",
        },
      },
    });
    if (error) throw error;
    return true;
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  // Bug 6 fix: Clear localStorage token and axios header so stale tokens
  // never cause redirect loops on the next page load.
  logout: async () => {
    await supabase.auth.signOut();
    _clearAuthStorage();
    set({
      user: null,
      supabaseUser: null,
      profile: null,
      isAuthenticated: false,
      accessToken: null,
      mismatchError: null,
    });
  },

  // ── setActiveRole ──────────────────────────────────────────────────────────
  setActiveRole: (role: string) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, activeRole: role } });
  },

  // ── sendOtp ────────────────────────────────────────────────────────────────
  sendOtp: async (email: string, shouldCreateUser: boolean = false) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser,
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) throw error;
    return true;
  },

  // ── verifyOtp ──────────────────────────────────────────────────────────────
  verifyOtp: async (email: string, token: string, requiredRole?: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error("OTP verification failed. No session.");

    const state = await _buildUserFromSession(data.user, data.session);

    if (requiredRole && state.user) {
      const actualRole = _resolveActiveRole(state.user.roles);
      await _handleRoleMismatch(actualRole, requiredRole, set, state);
      // If we reach here, roles matched — force the activeRole
      state.user.activeRole = requiredRole;
    }

    set({ ...state, mismatchError: null });
    return true;
  },

  // ── loginWithGoogle ────────────────────────────────────────────────────────
  loginWithGoogle: async (requiredRole: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${requiredRole}`,
      },
    });
    if (error) throw error;
  },
}));
