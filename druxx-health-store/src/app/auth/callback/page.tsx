"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { userService } from "@/services/userService";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized, loading: authLoading, logout } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    async function handleCallback() {
      try {
        // Exchange authorization code for session in PKCE flow
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // Wait for Supabase to finish parsing the hash/query params and establish a session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          // If no session is found after 2 seconds, redirect to /login
          const timer = setTimeout(() => {
            router.push("/login");
          }, 2000);
          return () => clearTimeout(timer);
        }

        const sUser = session.user;
        const requiredRole = searchParams.get("role") || "CUSTOMER";
        
        let activeRole = sUser.user_metadata?.role ?? "CUSTOMER";
        try {
          if (session.access_token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${session.access_token}`;
          }
          const profileData = await userService.getProfile();
          if (profileData && profileData.user) {
            const profile = profileData.user;
            activeRole = "CUSTOMER";
            if (profile.roles?.includes("ADMIN")) {
              activeRole = "ADMIN";
            } else if (profile.roles?.includes("VENDOR")) {
              activeRole = "VENDOR";
            }
          }
        } catch (e) {
          console.error("Failed to fetch backend profile in auth callback, falling back to metadata:", e);
        }

        // Strict role locking
        if (requiredRole && requiredRole !== "ANY") {
          const isAllowed = activeRole === requiredRole;

          if (!isAllowed) {
            await logout();
            setStatus("error");
            
            let customMessage = `Role mismatch: This account is registered as a ${activeRole}. Please use the correct login portal.`;
            if (activeRole === "ADMIN") {
              customMessage = "This account is registered as an Administrator. Please use the Admin Portal.";
            } else if (activeRole === "VENDOR") {
              customMessage = "This account is registered as a Merchant/Vendor. Please use the Merchant Portal.";
            } else if (activeRole === "CUSTOMER") {
              customMessage = "This account is registered as a Customer. Please use the Customer Login.";
            }
            
            setErrorMessage(customMessage);
            return;
          }
        }

        setStatus("success");
        // Redirect to appropriate dashboard after a short delay
        const timer = setTimeout(() => {
          if (activeRole === "ADMIN") {
            router.push("/dashboard/admin");
          } else if (activeRole === "VENDOR") {
            router.push("/dashboard/vendor");
          } else {
            router.push("/");
          }
        }, 1500);

        return () => clearTimeout(timer);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred during login.");
      }
    }

    handleCallback();
  }, [router, searchParams, logout]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#A6D608]/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#2CA7A0]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center flex flex-col items-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#A6D608]/10 flex items-center justify-center mb-6 animate-bounce">
              <Loader2 className="w-10 h-10 text-[#A6D608] animate-spin" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase mb-2">Verifying Session</h2>
            <p className="text-gray-400 text-sm">Please wait while we secure your connection and load your profile...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 scale-in duration-300">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase mb-2 text-emerald-400">Authenticated</h2>
            <p className="text-gray-300 text-sm">Welcome back! Preparing your personalized dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase mb-2 text-rose-400">Login Failed</h2>
            <p className="text-gray-300 text-sm mb-6">{errorMessage}</p>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/login"
                className="w-full h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-black uppercase text-xs flex items-center justify-center"
              >
                Customer Login
              </Link>
              <Link
                href="/vendor/login"
                className="w-full h-12 rounded-xl bg-[#A6D608] text-white hover:bg-[#8ab506] transition-all font-black uppercase text-xs flex items-center justify-center"
              >
                Merchant Portal
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
