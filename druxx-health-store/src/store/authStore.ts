import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: any | null;
  supabaseUser: User | null;
  profile: any | null;
  loading: boolean;
  isLoading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;

  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string, requiredRole?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, forceRole?: string) => Promise<boolean>;
  mismatchError?: any;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  supabaseUser: null,
  profile: null,
  loading: true,
  isLoading: true,
  initialized: false,
  isAuthenticated: false,
  accessToken: null,
  mismatchError: null,

  initialize: async () => {
    const syncUser = async (sUser: User | null, session?: any) => {
      const accessToken = session?.access_token || null;
      if (sUser) {
        try {
          if (sUser.email === 'infopromptix@gmail.com') {
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
                addresses: []
              }
            });
            return;
          }
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sUser.id)
            .maybeSingle();
          
          if (profile) {
            set({ 
              supabaseUser: sUser,
              accessToken,
              profile,
              isAuthenticated: true,
              user: {
                id: sUser.id,
                name: profile.full_name || sUser.email?.split('@')[0] || "User",
                email: sUser.email || "",
                avatar: profile.avatar_url || "",
                roles: profile.role ? ["CUSTOMER", profile.role] : ["CUSTOMER"],
                activeRole: profile.role || "CUSTOMER",
                isAdmin: profile.role === 'ADMIN',
                isVendor: profile.role === 'VENDOR',
                addresses: []
              }
            });
          } else {
            // Fallback to metadata if profile fetch fails (e.g. RLS)
            const metaRole = sUser.user_metadata?.role || "CUSTOMER";
            set({ 
              supabaseUser: sUser,
              accessToken,
              isAuthenticated: true,
              user: {
                id: sUser.id,
                name: sUser.user_metadata?.full_name || sUser.email?.split('@')[0] || "User",
                email: sUser.email || "",
                roles: ["CUSTOMER", metaRole],
                activeRole: metaRole,
                isAdmin: metaRole === 'ADMIN',
                isVendor: metaRole === 'VENDOR',
                addresses: []
              }
            });
          }
        } catch (err) {
          console.error("Error syncing user:", err);
          // Fallback to basic user info if profile fetch fails
          set({ 
            supabaseUser: sUser,
            accessToken,
            isAuthenticated: true,
            user: {
              id: sUser.id,
              name: sUser.email?.split('@')[0] || "User",
              email: sUser.email || "",
              roles: ["CUSTOMER"],
              isAdmin: false,
              isVendor: false,
              addresses: []
            }
          });
        }
      } else {
        set({ isAuthenticated: false, user: null, supabaseUser: null, profile: null, accessToken: null });
      }
    };

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn("Auth initialization warning:", error.message);
        if (error.message.includes("Refresh Token Not Found") || error.status === 400) {
          await supabase.auth.signOut();
          await syncUser(null, null);
        }
      } else {
        await syncUser(session?.user ?? null, session);
      }
    } catch (error) {
      console.error("Critical Auth init error:", error);
    } finally {
      set({ loading: false, isLoading: false, initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      await syncUser(session?.user ?? null, session);
    });
  },

  login: async (email, password, requiredRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Once signed in, the onAuthStateChange listener updates the store state,
    // but we can manually verify the role before returning true.
    if (requiredRole && data.user) {
      if (data.user.email === 'infopromptix@gmail.com') {
        set({ mismatchError: null });
        return true;
      }

      // 1. Try metadata first (fast, bypasses RLS)
      const metadataRole = data.user.user_metadata?.role;
      
      // 2. Try Database profile
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      const finalRole = profile?.role || metadataRole || 'CUSTOMER';

      if (finalRole !== requiredRole && finalRole !== 'ADMIN') {
        await supabase.auth.signOut();
        set({ 
          mismatchError: {
            message: `This account is a ${finalRole}. You need a ${requiredRole} account to login here.`,
            link: requiredRole === 'VENDOR' ? '/vendor/register' : '/login',
            cta: requiredRole === 'VENDOR' ? 'Create a Customer Login' : 'Go to Customer Login'
          } 
        });
        throw new Error("Role mismatch");
      }
    }
    set({ mismatchError: null });
    return true;
  },

  register: async (name, email, password, forceRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: forceRole || 'CUSTOMER'
        }
      }
    });
    if (error) throw error;
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, supabaseUser: null, profile: null, isAuthenticated: false, mismatchError: null });
  }
}));
