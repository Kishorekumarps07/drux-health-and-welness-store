"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50/40 via-white to-lime-50/30 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Wellness Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-[#A6D608]/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-[#2CA7A0]/8 blur-3xl animate-pulse" />
      </div>

      {/* Back to Store */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>
      </div>

      <div className="w-full max-w-[480px] bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.03)] relative">
        {/* Brand/Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Recover Password
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email to receive a secure recovery link
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">Check your inbox</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                We sent a secure, single-use password recovery link to <span className="font-semibold text-gray-800">{email}</span>. Click the link within 1 hour to set a new password.
              </p>
            </div>
            <div className="pt-4">
              <Link 
                href="/login" 
                className="inline-flex h-12 px-6 items-center justify-center rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  required
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Recovery Link"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500 font-medium">
                Remember your password?{" "}
                <Link href="/login" className="text-gray-900 font-black uppercase tracking-wider hover:underline text-[10px]">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
