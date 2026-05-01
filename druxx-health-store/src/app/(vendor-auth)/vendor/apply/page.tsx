"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vendorService } from "@/services/vendorService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
    bankDetails: ""
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
          console.error("Error checking vendor application:", err);
       } finally {
          setChecking(false);
       }
    }
    
    if (initialized) {
      if (user) {
        checkExisting();
      } else {
        setChecking(false);
      }
    }
  }, [user, initialized]);

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#A6D608]" size={32} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8F9FA] py-16 px-6 italic">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Merchant Application</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Step {step} of 3 • Launch your brand</p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 rounded-full transition-all duration-500", step === s ? "w-12 bg-[#A6D608]" : s < step ? "w-6 bg-gray-900" : "w-6 bg-gray-200")} />
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 relative overflow-hidden">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608]">
                        <Store size={24} />
                     </div>
                     <h3 className="text-xl font-black text-gray-900">Store Identity</h3>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Name</Label>
                    <Input 
                      value={formData.storeName}
                      onChange={e => setFormData({...formData, storeName: e.target.value})}
                      placeholder="e.g. Organic Wellness Co." 
                      className="h-14 rounded-2xl border-gray-100 italic font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Category</Label>
                    <Input 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Herbal Supplements" 
                      className="h-14 rounded-2xl border-gray-100 italic font-bold"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <FileText size={24} />
                     </div>
                     <h3 className="text-xl font-black text-gray-900">Brand Description</h3>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">About your store</Label>
                    <Textarea 
                      value={formData.storeDescription}
                      onChange={e => setFormData({...formData, storeDescription: e.target.value})}
                      placeholder="Tell us about your mission and products..." 
                      className="min-h-[150px] rounded-2xl border-gray-100 italic font-bold p-4"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <CreditCard size={24} />
                     </div>
                     <h3 className="text-xl font-black text-gray-900">Verification</h3>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">GST Number (Optional)</Label>
                    <Input 
                      value={formData.gstNumber}
                      onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                      placeholder="22AAAAA0000A1Z5" 
                      className="h-14 rounded-2xl border-gray-100 italic font-bold"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                     <div className="flex gap-3">
                        <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic">
                           By submitting, you agree to the Druxx Health Store Vendor Agreement. Your application will be reviewed within 24-48 business hours.
                        </p>
                     </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-50">
                {step > 1 ? (
                  <Button type="button" variant="ghost" className="h-12 rounded-xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 flex gap-2" onClick={() => setStep(s => s - 1)}>
                    <ChevronLeft size={16} /> Previous
                  </Button>
                ) : <div />}
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-14 px-8 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-sm flex gap-3 shadow-xl shadow-gray-200 transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : step === 3 ? (
                    <>Submit Application <CheckCircle2 size={18} className="text-[#A6D608]" /></>
                  ) : (
                    <>Next Step <ArrowRight size={18} /></>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#A6D608]/5 rounded-full blur-3xl" />
          </div>
          
          <div className="text-center mt-10">
             <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic" onClick={() => router.push('/dashboard/vendor')}>Already a vendor? Access Dashboard</Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
