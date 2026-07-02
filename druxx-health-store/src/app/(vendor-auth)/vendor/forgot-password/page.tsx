"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your business email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send recovery link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1">Merchant Portal</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">

          {sent ? (
            /* ── Success State ── */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-zinc-900">Check your inbox</h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-zinc-800">{email}</span>.
                  The link expires in 1 hour.
                </p>
              </div>
              <p className="text-xs text-zinc-400">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-zinc-700 font-semibold underline underline-offset-2 hover:text-zinc-900"
                >
                  Try again
                </button>
              </p>
              <Link
                href="/vendor/login"
                className="block w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-6 space-y-1">
                <h1 className="text-xl font-bold text-zinc-900">Reset your password</h1>
                <p className="text-sm text-zinc-500">
                  Enter your registered business email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500" htmlFor="email">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourbrand.com"
                      required
                      autoFocus
                      className="pl-10 h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/vendor/login"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
