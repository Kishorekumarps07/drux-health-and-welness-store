"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Banknote,
  IndianRupee,
  Calendar,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VendorPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const paymentsData = await vendorService.getPayments();
      setData(paymentsData);
    } catch (error) {
      toast.error("Failed to fetch financial details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const statusMap: Record<string, any> = {
    PROCESSED: { color: "text-[#A6D608]", bg: "bg-[#A6D608]/10", icon: CheckCircle2 },
    PENDING: { color: "text-amber-500", bg: "bg-amber-50", icon: Clock },
    FAILED: { color: "text-red-500", bg: "bg-red-50", icon: AlertCircle },
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-50 rounded-[2.5rem]" />
          <div className="h-64 bg-gray-50 rounded-[2.5rem]" />
        </div>
        <div className="h-96 bg-gray-50 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial <span className="text-[#A6D608]">Portal</span></h1>
            <p className="text-gray-500 font-medium italic mt-1">Manage your earnings, payouts, and settlement accounts.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button className="rounded-2xl h-12 px-6 font-black bg-[#1E1E1E] text-white hover:bg-black shadow-xl shadow-black/10 transition-all active:scale-95">
                Request Payout
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Balance Card */}
           <Card className="rounded-[2.5rem] bg-[#1E1E1E] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-[#A6D608]/10 rounded-2xl flex items-center justify-center mb-10 border border-[#A6D608]/20 group-hover:rotate-6 transition-transform">
                    <Wallet className="w-8 h-8 text-[#A6D608]" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Available Balance</p>
                    <h3 className="text-5xl font-black italic tracking-tighter">₹{data?.balance?.toLocaleString() || '0.00'}</h3>
                 </div>
                 
                 <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-10">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Withdrawn</p>
                       <p className="text-lg font-black text-gray-200">₹{data?.totalWithdrawn?.toLocaleString() || '0.00'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Pending Settlements</p>
                       <p className="text-lg font-black text-gray-200 italic">₹0.00</p>
                    </div>
                 </div>
              </div>
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#A6D608]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
           </Card>

            {/* Bank Account Summary */}
            <Card className="rounded-[2.5rem] bg-white p-10 border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden border-2 border-dashed border-gray-100 italic">
               <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                     <Banknote className="w-7 h-7 text-gray-300" />
                  </div>
                  <Button variant="ghost" className="rounded-xl font-black text-[#A6D608] hover:bg-[#A6D608]/5">
                     Update Bank Account
                  </Button>
               </div>
               <div>
                  <h4 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Settlement Account</h4>
                  <p className="text-sm text-gray-400 font-medium">Funds will be deposited to your verified business account.</p>
                  
                  <div className="mt-8 space-y-4">
                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Bank Name</span>
                        <span className="text-sm font-black text-gray-800 tracking-tight">{data?.bankInfo?.bankName || "Not Linked"}</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Account Number</span>
                        <span className="text-sm font-black text-gray-800 tracking-tight">{data?.bankInfo?.accountNumber || "---- ---- ----"}</span>
                     </div>
                     {data?.bankInfo?.isVerified ? (
                        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black text-[#A6D608] uppercase tracking-tighter">
                           <ShieldCheck className="w-3.5 h-3.5" />
                           Verified & Security Cleared
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                           <AlertCircle className="w-3.5 h-3.5" />
                           Action Required: Link Bank Account
                        </div>
                     )}
                  </div>
               </div>
            </Card>
        </div>

        {/* Payout History */}
        <Card className="rounded-[3rem] border-gray-100 shadow-xl shadow-black/5 bg-white overflow-hidden italic">
           <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div>
                 <h4 className="text-2xl font-black text-gray-900 tracking-tight">Payout History</h4>
                 <p className="text-sm text-gray-400 font-medium mt-1">Log of all historical settlements to your account.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-gray-200 font-black text-xs hover:bg-white shadow-sm">
                 Download Statement
              </Button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-400">
                       <th className="px-10 py-6">Transaction ID</th>
                       <th className="px-6 py-6">Status</th>
                       <th className="px-6 py-6 font-medium italic">Period</th>
                       <th className="px-10 py-6 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {data?.payouts?.map((payout: any) => {
                       const status = statusMap[payout.status] || statusMap.PENDING;
                       return (
                          <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors group">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                   </div>
                                   <span className="font-black text-sm text-gray-800 tracking-tighter">#{payout.id.slice(0, 12).toUpperCase()}</span>
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-tighter", status.bg, status.color)}>
                                   <status.icon className="w-3.5 h-3.5" />
                                   {payout.status}
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <div className="flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-gray-600 transition-colors">
                                   <Calendar className="w-3.5 h-3.5" />
                                   {payout.period}
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="font-black text-gray-900 flex items-center justify-end gap-1 text-lg italic tracking-tight">
                                   <IndianRupee className="w-4 h-4 text-gray-300" />
                                   {payout.amount}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Processed {new Date(payout.date).toLocaleDateString()}</p>
                             </td>
                          </tr>
                       );
                    })}
                    
                    {(!data?.payouts || data.payouts.length === 0) && (
                       <tr>
                          <td colSpan={4} className="px-10 py-24 text-center">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CreditCard className="w-8 h-8 text-gray-200" />
                             </div>
                             <h5 className="text-xl font-black text-gray-900">No Transactions Yet</h5>
                             <p className="text-gray-400 font-medium">Your first payout will appear here once processed.</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

function ShieldCheck({ size = 24, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
