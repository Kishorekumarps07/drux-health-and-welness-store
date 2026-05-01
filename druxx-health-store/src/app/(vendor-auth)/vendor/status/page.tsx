"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  ShieldCheck, 
  XSquare, 
  ArrowRight, 
  RefreshCcw,
  Loader2,
  Mail,
  Search,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { vendorService } from "@/services/vendorService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function VendorStatusPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getMyApplication();
      setVendor(data);
      if (data?.is_verified) {
         router.push('/dashboard/vendor');
      }
    } catch (err) {
      toast.error("Failed to fetch application status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) {
      if (user) {
        fetchStatus();
      } else {
        setLoading(false); // Let ProtectedRoute handle the redirect
      }
    }
  }, [user, initialized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#A6D608]" size={32} />
      </div>
    );
  }

  if (!vendor) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 text-center italic">
          <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
             <Search size={32} className="text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">No Application Found</h1>
          <p className="text-gray-400 font-bold max-w-sm mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Ready to grow your health brand in India's leading wellness store?</p>
          <Button asChild className="h-14 px-8 rounded-2xl bg-[#A6D608] hover:bg-[#8ab506] text-white font-black shadow-xl shadow-[#A6D608]/20 transition-all">
             <Link href="/vendor/apply" className="flex gap-3">Start Selling Now <ArrowRight size={18} /></Link>
          </Button>
       </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 italic">
        <div className="max-w-xl w-full text-center">
           
           {(!vendor.is_verified) && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-100/50 animate-pulse" />
                    <Clock size={40} className="text-amber-500 relative z-10" />
                 </div>
                 <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 tracking-tighter">Under Review</h1>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Checking your wellness brand credentials</p>
                 
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-8 mb-12">
                    <div className="flex gap-5 text-left items-start">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 animate-spin duration-3000">
                          <RefreshCcw size={18} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-gray-800 tracking-tight mb-1">Status: Verification</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Our clinical verification team is reviewing your compliance & store details.</p>
                       </div>
                    </div>
                    
                    <div className="pt-8 border-t border-gray-50">
                       <Button variant="ghost" className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#A6D608] hover:bg-[#A6D608]/5 gap-2" onClick={fetchStatus}>
                          <RefreshCcw size={14} /> Refresh Status
                       </Button>
                    </div>
                 </div>
                 
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-3">
                    <Mail size={12} className="text-[#A6D608]" /> 
                    <span>We'll email you at {user?.email}</span>
                 </div>
              </div>
           )}

           {vendor.is_verified === false && vendor.rejectionReason && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-sm">
                    <XSquare size={40} className="text-red-500" />
                 </div>
                 <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 tracking-tighter">Application Declined</h1>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Professional Verification Update</p>
                 
                 <div className="bg-white rounded-[2.5rem] border border-red-50 shadow-sm p-10 space-y-8 mb-12">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reason for rejection:</p>
                       <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 italic font-bold text-gray-600 text-sm leading-relaxed">
                          "{vendor.rejectionReason || "Your store details did not meet our current merchant quality guidelines. Please review your branding and compliance details."}"
                       </div>
                    </div>
                    
                    <Button asChild className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black shadow-xl transition-all">
                       <Link href="/vendor/apply" className="flex gap-3">Update Application <RefreshCcw size={18} /></Link>
                    </Button>
                 </div>
                 
                 <Link href="/help/merchant" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Contact Support Hub →</Link>
              </div>
           )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
