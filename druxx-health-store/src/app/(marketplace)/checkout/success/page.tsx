"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ShoppingBag, ArrowRight, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
// import { Order } from "@/types";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const data = await orderService.getOrder(orderId);
          setOrder(data);
        } catch (error) {
          console.error("Failed to fetch order", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 text-center shadow-sm">
          <div className="w-24 h-24 rounded-full bg-[#A6D608]/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Check size={48} className="text-[#A6D608]" strokeWidth={3} />
          </div>

          <h1 className="font-heading font-black text-3xl md:text-4xl text-[#1E1E1E] mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Thank you for choosing Druxx. Your wellness journey continues as we prepare your premium items for delivery.
          </p>

          <div className="bg-[#F7F7F7] rounded-3xl p-6 md:p-8 text-left space-y-4 mb-10">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Order ID</span>
              <span className="font-mono font-black text-[#1E1E1E]">
                #{orderId?.slice(-8).toUpperCase() || "DRX-XXXX"}
              </span>
            </div>
            
            {order && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items</span>
                  <span className="font-bold text-[#1E1E1E]">{order.items.length} Premium Essentials</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-[#1E1E1E]">₹{order.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery To</span>
                  <span className="font-bold text-[#1E1E1E] line-clamp-1">{order.address?.fullName}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 text-[10px] font-black uppercase tracking-widest text-[#2CA7A0]">
              <Package size={14} />
              Estimated Delivery: 3-5 Business Days
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              asChild
              className="h-14 bg-[#1E1E1E] hover:bg-black text-white font-bold rounded-2xl flex items-center gap-2"
            >
              <Link href="/dashboard/orders">
                <ShoppingBag size={18} />
                Order History
              </Link>
            </Button>
            <Button
              asChild
              className="h-14 bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-2xl flex items-center gap-2"
            >
              <Link href="/products">
                Continue Shopping
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <button className="mt-8 text-gray-400 text-xs font-bold flex items-center justify-center gap-2 mx-auto hover:text-[#1E1E1E] transition-colors">
            <Download size={14} />
            Download Invoice (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
