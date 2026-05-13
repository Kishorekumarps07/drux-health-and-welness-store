import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
}

// Guard so initialize() is truly idempotent across React StrictMode double-invocations
let _initStarted = false;
// Hold the unsubscribe callback to prevent listener leaks on re-init
let _authListenerUnsub: (() => void) | null = null;

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
    // ── Idempotency guard ────────────────────────────────────────────────────
    if (_initStarted) return;
    _initStarted = true;

    // ── Unsubscribe stale listener from previous hot-reload ─────────────────
    if (_authListenerUnsub) {
      _authListenerUnsub();
      _authListenerUnsub = null;
    }

    const syncUser = async (sUser: User | null, session?: any) => {
      const accessToken = session?.access_token ?? null;

      if (!sUser) {
        set({
          isAuthenticated: false,
          user: null,
          supabaseUser: null,
          profile: null,
          accessToken: null,
        });
        return;
      }

      // ── Hardcoded admin bypass ─────────────────────────────────────────────
      if (sUser.email === "infopromptix@gmail.com") {
        set({
          supabaseUser: sUser,
          accessToken,
          profile: { role: "ADMIN" },
          isAuthenticated: true,
          mismatchError: null,
          user: {
            id: sUser.id,
            name: "Admin",
            email: sUser.email,
            avatar: "",
            roles: ["CUSTOMER", "ADMIN"],
            activeRole: "ADMIN",
            isAdmin: true,
            isVendor: false,
            addresses: [],
          },
        });
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sUser.id)
          .maybeSingle();

        // Use profile from DB, or fall back to user_metadata (set during register)
        const metaRole = sUser.user_metadata?.role ?? "CUSTOMER";
        const role = profile?.role ?? metaRole;

        set({
          supabaseUser: sUser,
          accessToken,
          profile: profile ?? null,
          isAuthenticated: true,
          mismatchError: null,
          user: {
            id: sUser.id,
            name: profile?.full_name ?? sUser.user_metadata?.full_name ?? sUser.email?.split("@")[0] ?? "User",
            email: sUser.email ?? "",
            avatar: profile?.avatar_url ?? "",
            roles: ["CUSTOMER", role].filter((r, i, a) => a.indexOf(r) === i),
            activeRole: role,
            isAdmin: role === "ADMIN",
            isVendor: role === "VENDOR",
            addresses: [],
          },
        });
      } catch (err) {
        // Graceful fallback — never leave the user in a broken state
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

    // Expose syncUser for use in login method to avoid race conditions
    (get() as any)._syncUser = syncUser;

    // ── Initial session check ────────────────────────────────────────────────
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        // Stale refresh token — sign out silently
        if (error.message.includes("Refresh Token Not Found") || error.status === 400) {
          await supabase.auth.signOut();
          await syncUser(null);
        }
      } else {
        await syncUser(session?.user ?? null, session);
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      set({ loading: false, initialized: true });
    }

    // ── Subscribe to future auth events (exactly once) ───────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await syncUser(session?.user ?? null, session);
      }
    );
    _authListenerUnsub = () => subscription.unsubscribe();
  },

  login: async (email, password, requiredRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Sync user immediately before resolving to prevent race conditions in UI redirects
    if ((get() as any)._syncUser) {
      await (get() as any)._syncUser(data.user, data.session);
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
