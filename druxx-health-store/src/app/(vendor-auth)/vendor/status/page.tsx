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
      
      const isApproved = data?.approvalStatus === 'ACTIVE' || data?.approvalStatus === 'APPROVED';
      
      if (isApproved) {
         // Refresh the authStore so ProtectedRoute sees the new status
         await useAuthStore.getState().refreshProfile();
         toast.success("Account approved! Redirecting to dashboard...");
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
        setLoading(false);
      }
    }
  }, [user, initialized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F6]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#A6D608]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F6] p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-gray-200/50">
             <Search size={32} className="text-[#A6D608]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">No Application Found</h1>
          <p className="text-gray-400 font-bold max-w-sm mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Start your journey as a Druxx merchant today.</p>
          <Button asChild className="h-16 px-10 rounded-2xl bg-gray-900 hover:bg-black text-white font-black shadow-xl transition-all">
             <Link href="/vendor/apply" className="flex gap-3">Apply Now <ArrowRight size={18} /></Link>
          </Button>
       </div>
    );
  }

  const isPending = vendor.approvalStatus === 'PENDING';
  const isRejected = vendor.approvalStatus === 'REJECTED';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center p-6 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-xl w-full text-center">
           
           {isPending && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-2xl shadow-amber-200/50 relative overflow-hidden group border border-amber-100">
                    <div className="absolute inset-0 bg-amber-50 opacity-20 animate-pulse" />
                    <Clock size={40} className="text-amber-500 relative z-10" />
                 </div>
                 <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Under Review</h1>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Checking your wellness brand credentials</p>
                 
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-10 space-y-8 mb-12 relative overflow-hidden">
                    <div className="flex gap-5 text-left items-start relative z-10">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#A6D608] shrink-0 border border-gray-100">
                          <RefreshCcw size={20} className="animate-spin-slow" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900 tracking-tight mb-1 uppercase tracking-wider">Status: Verification</p>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Our clinical verification team is currently reviewing your compliance and store details. This usually takes 24 hours.</p>
                       </div>
                    </div>
                    
                    <div className="pt-8 border-t border-gray-50 relative z-10">
                       <button 
                         onClick={fetchStatus}
                         className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                       >
                          <RefreshCcw size={14} /> Refresh Status
                       </button>
                    </div>
                 </div>
                 
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-3">
                    <Mail size={12} className="text-[#A6D608]" /> 
                    <span>Notifications sent to {user?.email}</span>
                 </div>
              </div>
           )}

           {isRejected && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-2xl shadow-red-200/50 border border-red-50">
                    <XSquare size={40} className="text-red-500" />
                 </div>
                 <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Application Declined</h1>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Professional Verification Update</p>
                 
                 <div className="bg-white rounded-[2.5rem] border border-red-50 shadow-2xl shadow-gray-200/50 p-10 space-y-8 mb-12">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reason for rejection:</p>
                       <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100 font-medium text-gray-700 text-sm leading-relaxed">
                          "{vendor.rejectionReason || "Your store details did not meet our quality guidelines. Please review your branding and compliance details."}"
                       </div>
                    </div>
                    
                    <Button asChild className="w-full h-16 rounded-2xl bg-gray-900 hover:bg-black text-white font-black shadow-xl transition-all">
                       <Link href="/vendor/apply" className="flex gap-3 uppercase tracking-widest text-[10px]">Update Application <RefreshCcw size={18} /></Link>
                    </Button>
                 </div>
                 
                 <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Contact Support Hub →</Link>
              </div>
           )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
