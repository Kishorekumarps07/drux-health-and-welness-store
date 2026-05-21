"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import api from "@/lib/api";
import { userService } from "@/services/userService";

interface AuthState {
  user: any | null;
  supabaseUser: User | null;
  profile: any | null;
  /** True while the initial session check is running. False forever after. */
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  mismatchError?: any;

  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string, requiredRole?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, forceRole?: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setActiveRole: (role: string) => void;
  sendOtp: (email: string, shouldCreateUser?: boolean) => Promise<boolean>;
  verifyOtp: (email: string, token: string, requiredRole?: string) => Promise<boolean>;
  loginWithGoogle: (requiredRole: string) => Promise<void>;
}

// Guard so initialize() is truly idempotent across React StrictMode double-invocations
let _initStarted = false;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Clear all auth artifacts from browser storage and axios defaults. */
function _clearAuthStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
  delete api.defaults.headers.common["Authorization"];
}

/** Apply a session token to storage and axios defaults. */
function _applyToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/** Fetch the user profile from the backend and return a normalised user object. */
async function _buildUserFromSession(sUser: User, session: any) {
  _applyToken(session.access_token);

  try {
    const data = await userService.getProfile();
    const profile = data.user;
    const role = profile.roles?.[profile.roles.length - 1] || "CUSTOMER";
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

      if (!session || !session.user) {
        // SIGNED_OUT event — clear everything
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

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const state = await _buildUserFromSession(session.user, session);
        set(state);
      }
    });

    // Now check the current session (handles page refresh / existing sessions)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user) {
        const state = await _buildUserFromSession(session.user, session);
        set(state);
      } else {
        _clearAuthStorage();
        set({ isAuthenticated: false, user: null });
      }
    } catch {
      _clearAuthStorage();
      set({ isAuthenticated: false, user: null });
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

    // Role check before we sync state
    if (requiredRole && data.user) {
      const metaRole = data.user.user_metadata?.role ?? "CUSTOMER";
      if (metaRole !== requiredRole) {
        await supabase.auth.signOut();
        _clearAuthStorage();

        let customMessage = `This account is a ${metaRole}. Please use the correct login portal.`;
        let customLink = "/login";
        let customCta = "Go to Customer Login";

        if (metaRole === "ADMIN") {
          customMessage = "This account is registered as an Administrator. Please use the Admin Portal.";
          customLink = "/admin/login";
          customCta = "Go to Admin Portal";
        } else if (metaRole === "VENDOR") {
          customMessage = "This account is registered as a Merchant/Vendor. Please use the Merchant Portal.";
          customLink = "/vendor/login";
          customCta = "Go to Merchant Portal";
        } else if (requiredRole === "ADMIN") {
          customMessage = "Access Denied. Administrator privileges required.";
          customLink = "/login";
          customCta = "Go to Customer Login";
        } else if (requiredRole === "VENDOR") {
          customMessage = "Access Denied. Merchant privileges required.";
          customLink = "/login";
          customCta = "Go to Customer Login";
        }

        set({
          mismatchError: {
            message: customMessage,
            link: customLink,
            cta: customCta,
          },
        });
        throw new Error("Role mismatch");
      }
    }

    // Bug 4 fix: Directly build & set state — never depends on _syncUserRef closure
    const state = await _buildUserFromSession(data.user, data.session);
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

    // Role check before we sync state
    if (requiredRole && data.user) {
      const metaRole = data.user.user_metadata?.role ?? "CUSTOMER";
      if (metaRole !== requiredRole) {
        await supabase.auth.signOut();
        _clearAuthStorage();

        let customMessage = `This account is a ${metaRole}. Please use the correct login portal.`;
        let customLink = "/login";
        let customCta = "Go to Customer Login";

        if (metaRole === "ADMIN") {
          customMessage = "This account is registered as an Administrator. Please use the Admin Portal.";
          customLink = "/admin/login";
          customCta = "Go to Admin Portal";
        } else if (metaRole === "VENDOR") {
          customMessage = "This account is registered as a Merchant/Vendor. Please use the Merchant Portal.";
          customLink = "/vendor/login";
          customCta = "Go to Merchant Portal";
        } else if (requiredRole === "ADMIN") {
          customMessage = "Access Denied. Administrator privileges required.";
          customLink = "/login";
          customCta = "Go to Customer Login";
        } else if (requiredRole === "VENDOR") {
          customMessage = "Access Denied. Merchant privileges required.";
          customLink = "/login";
          customCta = "Go to Customer Login";
        }

        set({
          mismatchError: {
            message: customMessage,
            link: customLink,
            cta: customCta,
          },
        });
        throw new Error("Role mismatch");
      }
    }

    const state = await _buildUserFromSession(data.user, data.session);
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
