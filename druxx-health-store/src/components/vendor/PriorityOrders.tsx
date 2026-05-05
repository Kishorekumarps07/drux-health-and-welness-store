"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { VendorOrderItem } from "@/services/vendorService";

interface PriorityOrdersProps {
  orders: VendorOrderItem[];
  onAction: (id: string, status: string) => Promise<void>;
  loading?: boolean;
}

export function PriorityOrders({ orders, onAction, loading = false }: PriorityOrdersProps) {
  if (!loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 italic">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-200" />
        </div>
        <p className="text-gray-400 font-bold">No orders currently require immediate action.</p>
        <p className="text-[10px] text-gray-300 uppercase tracking-widest font-black mt-2">All tasks completed</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-44 bg-white rounded-[2rem] border border-gray-100 animate-pulse p-6" />
        ))
      ) : (
        orders.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden italic">
            <div className="flex justify-between items-start mb-4">
              <Badge className={cn(
                "rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tight border-none",
                item.status === 'PENDING' ? "bg-amber-50 text-amber-500" : "bg-indigo-50 text-indigo-500"
              )}>
                {item.status}
              </Badge>
              <span className="text-[10px] text-gray-400 font-black">#{item.orderId.slice(-6).toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-200" />
                  )}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 truncate">{item.product.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Qty: {item.quantity} • ₹{item.total.toLocaleString()}</p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               {item.status === 'PENDING' ? (
                 <Button 
                   onClick={() => onAction(item.id, 'PROCESSING')}
                   className="flex-1 bg-[#1E1E1E] text-white hover:bg-black rounded-xl font-black text-xs h-10 transition-all"
                 >
                    Process Order
                 </Button>
               ) : (
                 <Button 
                   onClick={() => onAction(item.id, 'SHIPPED')}
                   className="flex-1 bg-[#A6D608] text-white hover:bg-[#8ab506] rounded-xl font-black text-xs h-10 transition-all shadow-lg shadow-[#A6D608]/20"
                 >
                    Mark as Shipped
                 </Button>
               )}
               <Link href={`/dashboard/vendor/orders/${item.id}`}>
                 <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-gray-100 text-gray-400 hover:text-gray-900">
                    <ChevronRight size={16} />
                 </Button>
               </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
