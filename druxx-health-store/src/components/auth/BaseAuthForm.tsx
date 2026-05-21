"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

interface BaseAuthFormProps {
  requiredRole?: UserRole;
  mode?: 'login' | 'register';
  logo?: boolean;
  subtitle?: string;
  submitLabel?: string;
  redirectPath?: string;
  onSuccess?: (user: any) => void;
  className?: string;
}

export function BaseAuthForm({
  requiredRole,
  mode = 'login',
  logo = false,
  subtitle,
  submitLabel = "Sign In",
  redirectPath = "/",
  onSuccess,
  className,
}: BaseAuthFormProps) {
  const isRegisterMode = mode === 'register';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register, mismatchError } = useAuthStore();

  /** Map Supabase/backend error messages to friendly strings. */
  const getFriendlyError = (err: any): string => {
    const msg: string = err?.message || err?.error_description || "";
    if (msg.includes("Invalid login credentials")) return "Incorrect email or password. Please try again.";
    if (msg.includes("Email not confirmed")) return "Please verify your email address before logging in. Check your inbox.";
    if (msg.includes("Too many requests")) return "Too many attempts. Please wait a few minutes and try again.";
    if (msg.includes("User not found")) return "No account found with this email address.";
    if (msg.includes("Role mismatch")) return ""; // shown via mismatchError UI, not generic error
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("Network")) return "Connection error. Please check your internet and try again.";
    if (msg) return msg; // Show the actual message if it's informative
    return "Something went wrong. Please try again.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const ok = await login(email, password, requiredRole);
      if (ok && onSuccess) {
        onSuccess(useAuthStore.getState().user);
      }
    } catch (err: any) {
      const friendly = getFriendlyError(err);
      if (friendly) setError(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    try {
      const ok = await register(name, email, password);
      if (ok && onSuccess) {
        onSuccess(useAuthStore.getState().user);
      }
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (msg.includes("User already registered") || msg.includes("already exists")) {
        setError("An account with this email already exists. Please log in instead.");
      } else if (msg.includes("Password should be") || msg.includes("weak")) {
        setError("Password is too weak. Use at least 6 characters with a mix of letters and numbers.");
      } else if (msg.includes("Invalid email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Mocking Google Sign-In for now
    setTimeout(() => {
      console.log("Google Sign-In Success (Mock)");
      // In real scenario, you'd call a backend endpoint with the Google token
      setIsLoading(false);
      alert("Google Sign-In successful! (Mocked for professional demo)");
    }, 1500);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="text-center mb-10">
        {logo ? (
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo.png"
              alt="Drux Logo"
              width={300}
              height={100}
              className="h-20 w-auto"
            />
          </div>
        ) : (
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
            {isRegisterMode ? "Create Account" : "Welcome Back"}
          </h2>
        )}
        <p className="text-gray-400 font-medium italic text-sm">{subtitle || "Please enter your credentials to continue."}</p>
      </div>

      {/* Social Login Section */}
      <div className="grid grid-cols-1 gap-3 mb-8">
         <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-gray-100 flex items-center justify-center gap-3 font-bold text-gray-600 hover:bg-gray-50 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
         >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.04c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.02H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.98l3.66-2.94z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.02l3.66 2.94c.87-2.6 3.3-4.58 6.16-4.58z"/>
            </svg>
            Sign in with Google
         </Button>
      </div>

      <div className="relative flex items-center gap-4 mb-8">
         <div className="flex-1 h-px bg-gray-100" />
         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Or with email</span>
         <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="bg-transparent overflow-hidden">
        {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</Label>
                </div>
                <div className="group relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-14 h-16 rounded-[1.25rem] border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-[#A6D608]/10 transition-all font-medium" placeholder="your@email.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-[#A6D608] hover:underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="group relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-14 pr-14 h-16 rounded-[1.25rem] border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-[#A6D608]/10 transition-all font-medium" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center animate-in slide-in-from-top-2 duration-300">
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}

              {mismatchError && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center animate-in slide-in-from-top-2 duration-300">
                  <p className="text-orange-700 text-xs font-bold mb-3">{mismatchError.message}</p>
                  <Button variant="outline" className="w-full rounded-xl h-10 border-orange-200 text-orange-700 hover:bg-orange-50 font-black text-[10px] uppercase" onClick={() => (window.location.href = mismatchError.link)}>
                    {mismatchError.cta}
                  </Button>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-[1.25rem] font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#A6D608]/20" style={{ backgroundColor: '#A6D608', color: '#1E1E1E' }}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {submitLabel}
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
            </form>
        ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50/30" placeholder="John Doe" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50/30" placeholder="user@druxx.com" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50/30" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Confirm</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50/30" required />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center animate-in slide-in-from-top-2 duration-300">
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-[1.25rem] bg-[#1E1E1E] text-[#A6D608] hover:bg-black font-black text-sm transition-all mt-4">
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </form>
        )}
      </div>
    </div>
  );
}
