"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    storeName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 0. Force clear any existing sticky sessions to prevent ID mismatch
      await supabase.auth.signOut();

      // 1. Create User Account natively as a VENDOR
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "VENDOR"
          }
        }
      });

      if (authError) throw authError;

      // Ensure we have a user ID before proceeding
      if (!authData.user?.id) {
        throw new Error("Failed to generate user ID during registration.");
      }

      // Force update the profile role to VENDOR since some Supabase triggers default to CUSTOMER
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'VENDOR' })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.warn("Could not force-update profile role:", profileError);
      }

      // Force a manual login if Supabase didn't automatically create a session
      if (!authData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInErr) throw new Error("Account created, but failed to log in automatically.");
      }

      // Ensure we have a user ID before proceeding
      if (!authData.user?.id) {
        throw new Error("Failed to generate user ID during registration.");
      }

      // 2. Immediately create the Vendor Store Profile
      const uniqueSlug = formData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
      
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: formData.storeName,
          slug: uniqueSlug,
          owner_id: authData.user.id,
          is_verified: false
        });

      if (vendorError) throw vendorError;

      toast.success("Merchant account created successfully!");
      
      // Redirect directly to the status/onboarding page
      router.push("/vendor/status");
    } catch (error: any) {
      console.log("Registration validation error:", error.message);
      toast.error(error.message || "Failed to create merchant account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
      {/* Left Column: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden p-20 flex-col justify-center border-r border-gray-800">
        <div className="relative z-10 max-w-xl">
           <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-[#A6D608]/10 rounded-full border border-[#A6D608]/20">
              <Zap className="w-4 h-4 text-[#A6D608]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608] italic">Express Onboarding</span>
           </div>
           
           <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8 italic">
              Start Selling <br /> 
              <span className="text-gray-500">in </span>
              <span className="text-[#A6D608]">60 Seconds.</span>
           </h1>

           <div className="space-y-6 mb-16">
              {[
                "Instant store generation.",
                "Zero platform fees for your first 30 days.",
                "Direct access to our logistics network."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[#A6D608] border border-gray-700">
                      <CheckCircle2 size={14} />
                   </div>
                   <p className="text-sm font-bold text-gray-400 italic uppercase tracking-wider">{text}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#A6D608]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 delay-200">
           
           <div className="text-center mb-10">
             <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
               Merchant Application
             </h2>
             <p className="text-gray-400 font-medium italic text-sm">Create your personal account and brand identity.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Store Details Section */}
              <div className="p-6 bg-[#A6D608]/5 rounded-[1.5rem] border border-[#A6D608]/10 mb-6">
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Store / Brand Name</Label>
                   <div className="group relative">
                     <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                     <Input 
                       value={formData.storeName}
                       onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                       className="pl-14 h-14 rounded-2xl border-white bg-white focus:ring-4 focus:ring-[#A6D608]/10 transition-all font-bold italic shadow-sm" 
                       placeholder="Organic Wellness Co." 
                       required 
                     />
                   </div>
                 </div>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Full Name</Label>
                <div className="group relative">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="pl-14 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</Label>
                <div className="group relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-14 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white" 
                    placeholder="merchant@druxx.com" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Password</Label>
                <div className="group relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-14 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 rounded-[1.25rem] font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-900/10 mt-8" 
                style={{ backgroundColor: '#1E1E1E', color: 'white' }}
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-[#A6D608]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Profile...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Submit Application
                    <ArrowRight size={18} className="text-[#A6D608]" />
                  </div>
                )}
              </Button>
           </form>

           <div className="mt-8 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               Already have a merchant account? <Link href="/vendor/login" className="text-[#A6D608] hover:underline ml-1">Sign In</Link>
             </p>
           </div>

        </div>
      </div>
    </div>
  );
}
