"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  vendorService, 
  VendorOrderItem 
} from "@/services/vendorService";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; action?: string; next?: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, action: "Process Order", next: "PROCESSING" },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Package, action: "Mark as Shipped", next: "SHIPPED" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, action: "Mark as Delivered", next: "DELIVERED" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function VendorOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<VendorOrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await vendorService.getOrderItem(id as string);
        setItem(data);
      } catch (error) {
        toast.error("Failed to load order details.");
        router.push("/vendor/orders");
      } finally {
        setIsLoading(false);
      }
    };
    loadItem();
  }, [id, router]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updated = await vendorService.updateItemStatus(id as string, newStatus);
      setItem(updated);
      toast.success(`Order item marked as ${newStatus.toLowerCase()}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6"><div className="w-12 h-12 rounded-full border-2 border-[#A6D608] border-t-transparent animate-spin"></div></div>;
  if (!item) return null;

  const currentConfig = STATUS_CONFIG[item.status];
  const canCancel = item.status === "PENDING" || item.status === "PROCESSING";

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="min-h-screen bg-[#FAFAFA] pb-24">
        {/* Navigation Header */}
        <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl hover:bg-gray-100 font-bold transition-all flex items-center gap-2 -ml-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-50 text-gray-500 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-none">Line Item #{item.id.substring(0, 8)}</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Actions Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm overflow-hidden relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Current Fulfillment Status</p>
                   <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-2xl ${currentConfig.color}`}>
                       <currentConfig.icon size={24} />
                     </div>
                     <h2 className="text-2xl font-black text-[#1E1E1E] uppercase tracking-tight">{currentConfig.label}</h2>
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-3">
                    {canCancel && (
                      <Button 
                        variant="outline" 
                        className="rounded-2xl h-14 border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold px-6 text-xs uppercase tracking-widest"
                        onClick={() => handleUpdateStatus("CANCELLED")}
                        disabled={isUpdating}
                      >
                        <XCircle size={14} className="mr-2" /> Cancel Item
                      </Button>
                    )}
                    {currentConfig.next && (
                       <Button 
                        className="rounded-2xl h-14 bg-[#1E1E1E] text-white hover:bg-black font-bold px-8 text-xs uppercase tracking-widest shadow-lg shadow-gray-200"
                        onClick={() => handleUpdateStatus(currentConfig.next!)}
                        disabled={isUpdating}
                      >
                        {currentConfig.action} <ChevronRight size={14} className="ml-2" />
                      </Button>
                    )}
                 </div>
              </div>

              {/* Status Timeline Visualization */}
              <div className="mt-12 flex items-center gap-1">
                 {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((s, idx) => {
                   const isPast = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(item.status) >= idx;
                   const isCurrent = item.status === s;
                   const sText = STATUS_CONFIG[s];
                   return (
                     <div key={s} className="flex-1 flex flex-col items-center gap-3">
                       <div className={`w-full h-1.5 rounded-full ${isPast ? "bg-[#A6D608]" : "bg-gray-100"} ${isCurrent ? "animate-pulse" : ""}`} />
                       <div className="flex flex-col items-center">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${isPast ? "text-[#1E1E1E]" : "text-gray-300"}`}>{sText.label}</span>
                         {s === "SHIPPED" && item.shippedAt && <span className="text-[8px] text-gray-400 mt-0.5">{format(new Date(item.shippedAt), "MMM d, h:mm a")}</span>}
                         {s === "DELIVERED" && item.deliveredAt && <span className="text-[8px] text-gray-400 mt-0.5">{format(new Date(item.deliveredAt), "MMM d, h:mm a")}</span>}
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>

            {/* Product Listing Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-gray-50 bg-gray-50/10">
                 <h3 className="font-heading font-black text-xs text-[#1E1E1E] uppercase tracking-widest">Product Details</h3>
               </div>
               <div className="p-8">
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                      {item.product.images?.[0]?.url && <img src={item.product.images[0].url} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black text-[#1E1E1E] leading-tight mb-1">{item.title}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                        <span>Price: ₹{Number(item.price).toLocaleString()}</span>
                        <span>•</span>
                        <span>Quantity: {item.quantity}</span>
                        <span>•</span>
                        <span className="text-green-600">Total: ₹{Number(item.total).toLocaleString()}</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer & Shipping Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
              <h3 className="font-heading font-black text-xs text-[#1E1E1E] uppercase tracking-widest mb-6">Customer & Shipping</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Purchased By</p>
                      <p className="text-sm font-bold text-[#1E1E1E]">{item.order.user.name}</p>
                      <p className="text-xs text-gray-400">{item.order.user.email}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-[#A6D608]/10 text-[#A6D608]"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Shipping Address</p>
                      <p className="text-sm font-bold text-[#1E1E1E]">{item.order.address.fullName}</p>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                        {item.order.address.line1}, {item.order.address.line2 && `${item.order.address.line2}, `}{item.order.address.city}, {item.order.address.state} - {item.order.address.pincode}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[#A6D608] hover:underline cursor-pointer">
                         <span className="text-[10px] font-black uppercase tracking-widest">Get Directions</span>
                         <ExternalLink size={10} />
                      </div>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Contact</p>
                      <p className="text-sm font-bold text-[#1E1E1E]">{item.order.address.phone}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#1E1E1E] rounded-[2rem] p-6 text-white overflow-hidden relative group">
               <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck size={120} />
               </div>
               <h3 className="font-heading font-black text-xs text-white/50 uppercase tracking-widest mb-6 relative z-10">Payment Context</h3>
               <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-xl bg-white/10 text-white"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{item.order.paymentMethod === 'COD' ? "Cash on Delivery" : "Online Payment"}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Status: {item.order.paymentStatus.replace('_', ' ')}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
