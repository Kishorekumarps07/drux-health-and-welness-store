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
  mismatchError: null,

  initialize: async () => {
    const syncUser = async (sUser: User | null) => {
      if (sUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sUser.id)
            .maybeSingle();
          
          set({ 
            supabaseUser: sUser, 
            profile: profile || null,
            isAuthenticated: true,
            mismatchError: null,
            user: {
              id: sUser.id,
              name: profile?.full_name || sUser.email?.split('@')[0] || "User",
              email: sUser.email || "",
              avatar: profile?.avatar_url || "",
              roles: [profile?.role || "CUSTOMER"],
              activeRole: profile?.role || "CUSTOMER",
              isAdmin: profile?.role === "ADMIN",
              isVendor: profile?.role === "VENDOR",
              addresses: profile?.addresses || []
            }
          });
        } catch (err) {
          console.error("Profile fetch error:", err);
          // Fallback to basic user info if profile fetch fails
          set({ 
            supabaseUser: sUser,
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
        set({ isAuthenticated: false, user: null, supabaseUser: null, profile: null });
      }
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUser(session?.user ?? null);
    } catch (error) {
      console.error("Auth init error:", error);
    } finally {
      set({ loading: false, isLoading: false, initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      await syncUser(session?.user ?? null);
    });
  },

  login: async (email, password, requiredRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Once signed in, the onAuthStateChange listener updates the store state,
    // but we can manually verify the role before returning true.
    if (requiredRole && data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role !== requiredRole && profile?.role !== 'ADMIN') {
        await supabase.auth.signOut();
        set({ 
          mismatchError: {
            message: `This account is a ${profile?.role || 'CUSTOMER'}. You need a ${requiredRole} account to login here.`,
            link: requiredRole === 'VENDOR' ? '/vendor/register' : '/login',
            cta: requiredRole === 'VENDOR' ? 'Create a Merchant Account' : 'Go to Customer Login'
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
