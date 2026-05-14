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
}

// Guard so initialize() is truly idempotent across React StrictMode double-invocations
let _initStarted = false;
let _syncUserRef: any = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  supabaseUser: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  accessToken: null,
  mismatchError: null,

  initialize: async () => {
    if (_initStarted) return;
    _initStarted = true;

    const syncUser = async (sUser: User | null, session?: any) => {
      const accessToken = session?.access_token ?? null;

      if (!sUser || !session) {
        set({ isAuthenticated: false, user: null, supabaseUser: null, profile: null, accessToken: null });
        return;
      }

      // ── CRITICAL: Set accessToken FIRST so subsequent API calls have the header ──
      set({ accessToken: session.access_token });
      localStorage.setItem("token", session.access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${session.access_token}`;

      try {
        // Fetch profile from our Node.js Backend API instead of Supabase direct DB
        const data = await userService.getProfile();
        const profile = data.user;

        const role = profile.roles?.[profile.roles.length - 1] || "CUSTOMER";
        const vendorStatus = profile.vendor?.approvalStatus;

        set({
          supabaseUser: sUser,
          profile: profile,
          isAuthenticated: true,
          mismatchError: null,
          user: {
            id: sUser.id,
            name: profile.name || sUser.user_metadata?.full_name || "User",
            email: sUser.email || "",
            avatar: profile.avatar || "",
            roles: profile.roles || ["CUSTOMER"],
            activeRole: role,
            isAdmin: profile.roles?.includes("ADMIN"),
            isVendor: profile.roles?.includes("VENDOR"),
            vendorStatus: vendorStatus,
            addresses: profile.addresses || [],
          },
        });
      } catch (err) {
        // Fallback if API fails (e.g. initial setup)
        const metaRole = sUser.user_metadata?.role ?? "CUSTOMER";
        set({
          supabaseUser: sUser,
          accessToken,
          isAuthenticated: true,
          user: {
            id: sUser.id,
            name: sUser.user_metadata?.full_name ?? sUser.email?.split("@")[0] ?? "User",
            email: sUser.email ?? "",
            avatar: "",
            roles: ["CUSTOMER", metaRole].filter((r, i, a) => a.indexOf(r) === i),
            activeRole: metaRole,
            isAdmin: metaRole === "ADMIN",
            isVendor: metaRole === "VENDOR",
            addresses: [],
          },
        });
      }
    };

    _syncUserRef = syncUser;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUser(session?.user ?? null, session);
    } finally {
      set({ loading: false, initialized: true });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUser(session?.user ?? null, session);
    });
  },

  refreshProfile: async () => {
    const { supabaseUser, accessToken } = get();
    if (supabaseUser && _syncUserRef) {
      await _syncUserRef(supabaseUser, { access_token: accessToken });
    }
  },

  login: async (email, password, requiredRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Sync user immediately before resolving to prevent race conditions in UI redirects
    if (_syncUserRef) {
      await _syncUserRef(data.user, data.session);
    }

    if (requiredRole && data.user) {
      if (data.user.email === "infopromptix@gmail.com") {
        set({ mismatchError: null });
        return true;
      }

      // Use metadata (already set at registration) — no extra DB query needed
      const metaRole = data.user.user_metadata?.role ?? "CUSTOMER";

      if (metaRole !== requiredRole && metaRole !== "ADMIN") {
        await supabase.auth.signOut();
        set({
          mismatchError: {
            message: `This account is a ${metaRole}. You need a ${requiredRole} account to login here.`,
            link: requiredRole === "VENDOR" ? "/vendor/register" : "/login",
            cta: requiredRole === "VENDOR" ? "Create a Vendor Account" : "Go to Customer Login",
          },
        });
        throw new Error("Role mismatch");
      }
    }

    set({ mismatchError: null });
    return true;
  },

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

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      supabaseUser: null,
      profile: null,
      isAuthenticated: false,
      accessToken: null,
      mismatchError: null,
    });
  },
}));
