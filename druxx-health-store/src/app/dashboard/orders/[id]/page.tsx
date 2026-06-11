"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Loader2, 
  AlertTriangle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Clock size={14} />, label: "Pending" },
  confirmed: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: <CheckCircle2 size={14} />, label: "Confirmed" },
  processing: { color: "bg-orange-50 text-orange-700 border-orange-100", icon: <Loader2 size={14} className="animate-spin" />, label: "Processing" },
  partial: { color: "bg-orange-50 text-orange-700 border-orange-100", icon: <Package size={14} />, label: "Partial" },
  shipped: { color: "bg-purple-50 text-purple-700 border-purple-100", icon: <Truck size={14} />, label: "Shipped" },
  delivered: { color: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle2 size={14} />, label: "Delivered" },
  cancelled: { color: "bg-red-50 text-red-700 border-red-100", icon: <XCircle size={14} />, label: "Cancelled" },
  refunded: { color: "bg-rose-50 text-rose-700 border-rose-100", icon: <History size={14} />, label: "Refunded" },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrder(params.id as string);
      setOrder(data.order);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setCancelling(true);
    try {
      await orderService.cancelOrder(params.id as string);
      toast.success("Order cancelled successfully");
      await fetchOrderDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A6D608]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-gray-500 mt-2">We couldn't find the order you are looking for.</p>
        <Button asChild className="mt-6 bg-[#1E1E1E]">
          <Link href="/dashboard/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const statusKey = order.status.toLowerCase();
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const isCancellable = ["pending", "confirmed"].includes(statusKey);

  // Status timeline steps
  const steps = [
    { label: "Ordered", active: true },
    { label: "Confirmed", active: ["confirmed", "processing", "shipped", "delivered"].includes(statusKey) },
    { label: "Processing", active: ["processing", "shipped", "delivered"].includes(statusKey) },
    { label: "Shipped", active: ["shipped", "delivered"].includes(statusKey) },
    { label: "Delivered", active: statusKey === "delivered" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/dashboard/orders" 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#A6D608] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to My Orders
        </Link>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shrink-0 shadow-sm">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-green-900 leading-tight">Order Confirmed!</h2>
            <p className="text-green-700 text-sm mt-1">
              Thank you for shopping with Druxx. Your order has been placed successfully and is now being processed.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Details Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Order ID</span>
            <h1 className="text-xl font-mono font-black text-[#1E1E1E] uppercase">#{order.id}</h1>
            <p className="text-gray-500 text-xs mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`${statusConfig.color} px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border uppercase tracking-wider`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>

            {isCancellable && (
              <Button 
                onClick={handleCancelOrder} 
                disabled={cancelling}
                variant="outline" 
                className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase tracking-widest px-4 h-10"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>

        {/* Tracking Timeline (Hidden if Cancelled) */}
        {statusKey !== "cancelled" && statusKey !== "refunded" && (
          <div className="py-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Delivery Tracking</h3>
            <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
              {/* Connector Line */}
              <div className="absolute left-[15px] sm:left-0 sm:top-4 w-0.5 sm:w-full h-full sm:h-0.5 bg-gray-100 -z-10" />
              
              {steps.map((step, idx) => (
                <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 sm:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transition-all ${
                    step.active ? "bg-[#A6D608] scale-110" : "bg-gray-200"
                  }`}>
                    {step.active && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider ${
                      step.active ? "text-[#1E1E1E]" : "text-gray-400"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipment Tracking Information */}
        {order.shipments && order.shipments.length > 0 && order.shipments.some((s: any) => s.awbCode) && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Shipment Tracking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.shipments.map((shipment: any) => {
                if (!shipment.awbCode) return null;
                return (
                  <div key={shipment.id} className="p-4 bg-gray-50 border border-gray-100 rounded-3xl flex items-start gap-3 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#A6D608] shrink-0 shadow-sm">
                      <Truck size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {shipment.courierName || "Courier Partner"}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                        AWB: <span className="font-mono text-gray-800">{shipment.awbCode}</span>
                      </p>
                      {shipment.trackingUrl ? (
                        <a 
                          href={shipment.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-black text-[#A6D608] uppercase tracking-wider mt-2 hover:underline"
                        >
                          Track Shipment →
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold block mt-2">
                          Status: {shipment.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Order Items</h3>
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/20">
            {order.items.map((item: any) => {
              const imageUrl = item.product?.images?.[0]?.url || "/placeholder-product.png";
              return (
                <div key={item.id} className="p-4 sm:p-5 flex gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-white shrink-0 shadow-sm">
                    <Image src={imageUrl} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[#1E1E1E] text-sm leading-tight">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Sold by <span className="font-bold text-gray-700">{item.vendor?.storeName || "Druxx Vendor"}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-black text-[#1E1E1E] text-sm">₹{parseFloat(item.price).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-400">Total: ₹{parseFloat(item.total).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Blocks (Address + Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#A6D608]" />
              Shipping Address
            </h3>
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-1">
              <p className="font-bold text-gray-800">{order.address?.fullName}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{order.address?.street}</p>
              <p className="text-gray-500 text-sm">
                {order.address?.city}, {order.address?.state} - <span className="font-bold text-[#1E1E1E]">{order.address?.pincode}</span>
              </p>
              <p className="text-gray-400 text-xs font-medium pt-1">
                Phone: {order.address?.phone}
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <CreditCard size={14} className="text-[#A6D608]" />
              Payment & Cost Summary
            </h3>
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Payment Method</span>
                <span className="font-bold text-gray-800 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Payment Status</span>
                <span className={`font-bold uppercase text-xs ${
                  order.paymentStatus === "ORDER_CREATED" || order.paymentStatus === "VERIFIED" ? "text-green-600" : "text-gray-500"
                }`}>
                  {order.paymentStatus === "ORDER_CREATED" ? "PAID" : order.paymentStatus}
                </span>
              </div>
              
              <div className="border-t border-gray-100/50 my-2 pt-2 space-y-1.5">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">₹{parseFloat(order.subtotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-gray-800">
                    {parseFloat(order.shippingCharge) === 0 ? "FREE" : `₹${parseFloat(order.shippingCharge)}`}
                  </span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>- ₹{parseFloat(order.discount).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-black text-[#1E1E1E] text-base border-t border-gray-100 pt-3">
                <span>Grand Total</span>
                <span className="text-lg">₹{parseFloat(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="space-y-2 pt-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Order Notes</h3>
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 text-sm text-gray-600 italic">
              &ldquo;{order.notes}&rdquo;
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
