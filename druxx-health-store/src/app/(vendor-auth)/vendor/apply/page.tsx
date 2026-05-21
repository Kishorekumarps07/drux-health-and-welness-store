"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Store, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Package,
  Wallet
} from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const STEPS = [
  { id: 1, title: "Store Info", icon: Store },
  { id: 2, title: "Business Details", icon: Building2 },
  { id: 3, title: "Verification", icon: ShieldCheck },
];

export default function VendorApplyPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    category: "",
    gstNumber: "",
  });

  useEffect(() => {
    async function checkExisting() {
       try {
          const app = await vendorService.getMyApplication();
          if (app) {
             router.push('/vendor/status');
             return;
          }
       } catch (err) {
          console.error("Error checking application:", err);
       } finally {
          setChecking(false);
       }
    }
    
    if (initialized) {
      if (user) checkExisting();
      else setChecking(false);
    }
  }, [user, initialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vendorService.applyVendor(formData);
      toast.success("Application submitted successfully!");
      router.push("/vendor/status");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F6]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#A6D608]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Securing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9F9F6] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ── Top Navigation ───────────────────────────── */}
        <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
          <Link href="/">
            <Image src="/druxlogo.png" alt="Drux" width={96} height={64} className="h-[46px] md:h-[56px] w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
               <div className="w-2 h-2 rounded-full bg-[#A6D608] animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Business Portal Active</span>
            </div>
            <button 
              onClick={() => router.push('/vendor/login')}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            >
              Exit
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-16 px-6">
          
          <div className="grid lg:grid-cols-[1fr_380px] gap-16">
            
            {/* ── Left Side: Form ───────────────────────────── */}
            <div className="space-y-12">
              
              {/* Intro */}
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Merchant Application</h1>
                <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                  Join India's fastest growing health & wellness marketplace. Complete your profile to start selling.
                </p>
              </div>

              {/* Stepper Header */}
              <div className="flex items-center gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 flex-1">
                    <div className={`flex items-center gap-3 ${step === s.id ? 'text-gray-900' : s.id < step ? 'text-[#A6D608]' : 'text-gray-300'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border-2 transition-all ${step === s.id ? 'bg-gray-900 border-gray-900 text-white' : s.id < step ? 'bg-[#A6D608]/10 border-[#A6D608]/20 text-[#A6D608]' : 'bg-white border-gray-100'}`}>
                        {s.id < step ? <CheckCircle2 size={16} /> : s.id}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">{s.title}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="h-[2px] flex-1 bg-gray-100 rounded-full" />}
                  </div>
                ))}
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-10">
                <form onSubmit={(e) => { e.preventDefault(); step === 3 ? handleSubmit(e) : nextStep(); }}>
                  
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Store Name</label>
                          <div className="relative group">
                            <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" size={20} />
                            <input 
                              required
                              value={formData.storeName}
                              onChange={e => setFormData({...formData, storeName: e.target.value})}
                              placeholder="e.g. Pure Life Wellness"
                              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/5 transition-all font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Product Category</label>
                          <select 
                            required
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full h-16 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/5 transition-all font-bold appearance-none cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            <option value="Supplements">Supplements & Nutrition</option>
                            <option value="PersonalCare">Personal Care</option>
                            <option value="Fitness">Fitness Equipment</option>
                            <option value="Organic">Organic Food</option>
                            <option value="Ayurveda">Ayurveda</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Bio / Description</label>
                          <textarea 
                            required
                            value={formData.storeDescription}
                            onChange={e => setFormData({...formData, storeDescription: e.target.value})}
                            placeholder="Tell customers about your brand's heritage and quality standards..."
                            className="w-full min-h-[160px] p-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/5 transition-all font-bold resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">GST Identification Number</label>
                          <div className="relative group">
                            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" size={20} />
                            <input 
                              value={formData.gstNumber}
                              onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                              placeholder="22AAAAA0000A1Z5 (Optional)"
                              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/5 transition-all font-bold"
                            />
                          </div>
                        </div>
                        
                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                          <AlertCircle className="text-amber-500 shrink-0" size={20} />
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-900">Verification Notice</h4>
                            <p className="text-[10px] font-bold text-amber-700/70 leading-relaxed italic">
                              By submitting, you agree to Druxx's merchant terms. Our compliance team will review your application within 24 hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`h-14 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <ChevronLeft size={16} /> Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.1em] flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-gray-200"
                    >
                      {loading ? (
                        <>Processing <Loader2 className="animate-spin" size={16} /></>
                      ) : step === 3 ? (
                        <>Submit Application <CheckCircle2 size={18} className="text-[#A6D608]" /></>
                      ) : (
                        <>Continue <ArrowRight size={18} /></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── Right Side: Info ───────────────────────────── */}
            <div className="space-y-8 hidden lg:block">
              
              <div className="bg-gray-900 rounded-[2rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Package size={80} />
                </div>
                <h3 className="text-xl font-black mb-6 relative z-10">Why sell on Druxx?</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#A6D608] border border-white/5 shrink-0">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-white">0% Commission</p>
                      <p className="text-[10px] font-medium text-gray-500 leading-tight">For your first 30 days of selling.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#A6D608] border border-white/5 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-white">Smart Logistics</p>
                      <p className="text-[10px] font-medium text-gray-500 leading-tight">Automated pickup & nationwide delivery.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2rem] text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Need help onboarding?</p>
                <Link href="#" className="text-[11px] font-black text-gray-900 hover:text-[#A6D608] transition-colors flex items-center justify-center gap-2">
                  Contact Merchant Support <ArrowRight size={14} />
                </Link>
              </div>

            </div>

          </div>
        </main>

        <footer className="py-12 border-t border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Druxx Health Store • Merchant Network 2026</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

import { Truck } from "lucide-react";
