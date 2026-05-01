"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, UserPlus, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function AuthPortal() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;
        toast.success("Welcome! Check your email to confirm registration.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#A6D608]/10 text-[#A6D608] mb-4">
          {mode === "login" ? <LogIn size={32} /> : <UserPlus size={32} />}
        </div>
        <h2 className="text-3xl font-black text-[#1E1E1E] uppercase tracking-tighter">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {mode === "login" ? "Enter your details to access your health hub." : "Join the Druxx health community today."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
              Full Name
            </label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                required
                type="text"
                placeholder="John Doe"
                className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>
        )}

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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              required
              type="password"
              placeholder="••••••••"
              className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <Button 
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#1E1E1E] text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all group"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              {mode === "login" ? "Sign In" : "Register"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center pt-8 border-t border-gray-50">
        <p className="text-xs text-gray-500">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[#A6D608] font-black uppercase tracking-wider hover:underline"
          >
            {mode === "login" ? "Sign Up Free" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
