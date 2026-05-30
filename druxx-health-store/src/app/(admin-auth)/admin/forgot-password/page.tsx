"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Loader2, 
  CheckCircle,
  ArrowLeft,
  Terminal,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Operator email required.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Security reset payload sent.");
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch recovery payload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Scanline Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(8, 214, 166, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 214, 166, 1) 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Terminal Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#08D6A6]/5 rounded-full blur-[140px] -z-10" />
      <div className="absolute -top-[10%] left-[10%] w-[350px] h-[350px] bg-emerald-950/20 rounded-full blur-[100px] -z-10" />

      {/* Back link */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-[#08D6A6] transition-all group uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Drux Main Site
        </Link>
      </div>

      <div className="w-full max-w-[460px] bg-zinc-950/40 backdrop-blur-2xl border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-6 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#08D6A6]">
            <Terminal size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.15em] text-zinc-100 font-mono">
              Reset Security
            </h1>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Node authorization recovery module
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#08D6A6]/10 text-[#08D6A6] flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-zinc-100 font-mono uppercase text-sm tracking-wider">Payload Dispatched</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-sm mx-auto">
                A single-use recovery token has been transmitted to email: <span className="text-[#08D6A6]">{email}</span>. Click the security link within 1 hour to assign a new password key.
              </p>
            </div>
            <div className="pt-4">
              <Link 
                href="/admin/login" 
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center"
              >
                Back to Authentication
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono px-1">
                Security Username (Email)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <Input
                  required
                  type="email"
                  placeholder="sysadmin@druxx.com"
                  className="pl-11 h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/50 focus:bg-zinc-900 focus:border-[#08D6A6]/40 focus:ring-1 focus:ring-[#08D6A6]/20 transition-all text-sm font-medium text-zinc-100 placeholder-zinc-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#08D6A6] hover:bg-[#06b88e] text-zinc-950 font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-lg shadow-[#08D6A6]/10 flex items-center justify-center gap-1"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  Dispatch Key <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] hover:text-[#08D6A6] transition-colors">
                <ArrowLeft size={12} /> Back to Portal
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
