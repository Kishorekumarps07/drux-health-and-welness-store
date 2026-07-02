"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type PageState = "loading" | "invalid" | "form" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/login");

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user clicks the reset link.
    // We MUST listen for this specific event — getSession() alone cannot
    // distinguish a recovery session from a normal signed-in session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // Recovery link is valid — show the new password form
          const roles: string[] =
            session?.user?.app_metadata?.roles ??
            session?.user?.user_metadata?.roles ??
            [];

          if (roles.includes("ADMIN")) setRedirectTo("/admin/login");
          else if (roles.includes("VENDOR")) setRedirectTo("/vendor/login");
          else setRedirectTo("/login");

          setPageState("form");
        }
        // Note: SIGNED_IN during recovery is blocked at authStore level.
        // No need to sign out here — recovery flow is handled cleanly.
      }
    );

    // Fallback: if no auth event fires within 4 seconds, the link is bad.
    const timeout = setTimeout(() => {
      setPageState((current) => {
        if (current === "loading") return "invalid";
        return current;
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Sign out the recovery session — user must do a fresh login
      await supabase.auth.signOut();
      setPageState("success");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFBF8] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#A6D608] animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  /* ── Invalid / Expired ── */
  if (pageState === "invalid") {
    return (
      <div className="min-h-screen bg-[#FAFBF8] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-zinc-100 rounded-2xl shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-zinc-900">Link expired or invalid</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              This reset link is no longer valid. Links expire after 1 hour or once used. Please request a new one.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <Link
              href="/vendor/forgot-password"
              className="block w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center"
            >
              Request a new link
            </Link>
            <Link
              href="/vendor/login"
              className="block w-full h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold transition-colors flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-[#FAFBF8] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-zinc-100 rounded-2xl shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-zinc-900">Password updated!</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Your password has been changed. Sign in with your new credentials.
            </p>
          </div>
          <Button
            onClick={() => router.push(redirectTo)}
            className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold transition-colors"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  /* ── New Password Form ── */
  return (
    <div className="min-h-screen bg-[#FAFBF8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-900 hover:opacity-75 transition-opacity">
            <span className="text-2xl font-black tracking-tight">
              drux<span className="text-[#A6D608]">.</span>
            </span>
          </Link>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-bold text-zinc-900">Set a new password</h1>
            <p className="text-sm text-zinc-500">
              Choose a strong password — at least 8 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  autoFocus
                  className="pl-10 pr-10 h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="pl-10 h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm"
                />
              </div>
              {confirmPassword && (
                <p className={`text-xs font-medium ${password === confirmPassword ? "text-emerald-500" : "text-red-400"}`}>
                  {password === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Updating…
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
