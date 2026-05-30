"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/userService";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resolvedRole, setResolvedRole] = useState<string>("CUSTOMER");

  useEffect(() => {
    async function checkSession() {
      try {
        // Retrieve the current session to ensure the recovery link flow was initiated properly.
        // Supabase auto-exchanges the recovery hash for a session when this page loads.
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setSessionValid(false);
        } else {
          setSessionValid(true);
          
          // Try to proactively fetch user profile to resolve which portal to redirect to later
          try {
            if (session.access_token) {
              api.defaults.headers.common["Authorization"] = `Bearer ${session.access_token}`;
            }
            const profileData = await userService.getProfile();
            if (profileData && profileData.user) {
              const roles = profileData.user.roles ?? [];
              if (roles.includes("ADMIN")) {
                setResolvedRole("ADMIN");
              } else if (roles.includes("VENDOR")) {
                setResolvedRole("VENDOR");
              } else {
                setResolvedRole("CUSTOMER");
              }
            }
          } catch (profileErr) {
            console.error("Failed to pre-resolve user role:", profileErr);
          }
        }
      } catch (err) {
        console.error("Reset password session check failed:", err);
        setSessionValid(false);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Sign the user out of the recovery session so they can perform a fresh log in
      await supabase.auth.signOut();

      setSuccess(true);
      toast.success("Password updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const getPortalRedirect = () => {
    if (resolvedRole === "ADMIN") return "/admin/login";
    if (resolvedRole === "VENDOR") return "/vendor/login";
    return "/login";
  };

  const getPortalLabel = () => {
    if (resolvedRole === "ADMIN") return "Admin Portal";
    if (resolvedRole === "VENDOR") return "Merchant Portal";
    return "Sign In";
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-10 h-10 text-[#A6D608] animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Validating recovery session...</p>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-gray-900 uppercase">Session Invalid</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your recovery link is invalid, expired, or has already been used. Please request a new password recovery link from your login portal.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Button onClick={() => router.push("/login")} className="h-12 w-full rounded-xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest text-white">
              Customer Portal
            </Button>
            <Button onClick={() => router.push("/vendor/login")} variant="outline" className="h-12 w-full rounded-xl border-gray-200 hover:bg-gray-50 font-black uppercase text-xs tracking-widest text-gray-700">
              Merchant Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50/20 via-white to-lime-50/20 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-[#A6D608]/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-[#2CA7A0]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[460px] bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.03)]">
        {success ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase">Key Set Successfully</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your new password has been established. You can now securely log in to your portal using your new credentials.
              </p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => router.push(getPortalRedirect())} 
                className="h-12 px-8 rounded-xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest text-white"
              >
                Go to {getPortalLabel()}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2CA7A0] bg-[#2CA7A0]/10 px-4 py-2 rounded-full mb-3 inline-block">
                Secure Session Active
              </span>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Update Password
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Establish your new authentication password credentials
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold animate-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold animate-all"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Save New Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
