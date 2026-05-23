"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { orderService } from "@/services/orderService";
import { OrderSkeleton } from "@/components/orders/OrderSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Clock size={14} />, label: "Pending" },
  confirmed: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: <CheckCircle2 size={14} />, label: "Confirmed" },
  shipped: { color: "bg-purple-50 text-purple-700 border-purple-100", icon: <Truck size={14} />, label: "Shipped" },
  delivered: { color: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle2 size={14} />, label: "Delivered" },
  cancelled: { color: "bg-red-50 text-red-700 border-red-100", icon: <XCircle size={14} />, label: "Cancelled" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.orders);
    } catch (err: any) {
      console.error("Failed to fetch orders", err);
      setError(err.message || "Failed to load your order history.");
      toast.error("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    // 1. Filter by status
    if (statusFilter !== "all" && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    // 2. Filter by search term (Order ID or Product Name)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      const matchesId = order.id.toLowerCase().includes(term);
      const matchesProduct = order.items.some((item: any) =>
        item.title.toLowerCase().includes(term)
      );
      return matchesId || matchesProduct;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#1E1E1E]">My Orders</h1>
          <p className="text-gray-500 text-sm">Track and manage your premium wellness purchases.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-gray-200 font-bold text-xs uppercase tracking-widest bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-150 rounded-xl">
              <SelectItem value="all" className="font-bold text-xs">All Statuses</SelectItem>
              <SelectItem value="pending" className="font-bold text-xs">Pending</SelectItem>
              <SelectItem value="confirmed" className="font-bold text-xs">Confirmed</SelectItem>
              <SelectItem value="shipped" className="font-bold text-xs">Shipped</SelectItem>
              <SelectItem value="delivered" className="font-bold text-xs">Delivered</SelectItem>
              <SelectItem value="cancelled" className="font-bold text-xs">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load orders"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchOrders
          }}
        />
      ) : orders.length > 0 ? (
        filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
            const statusKey = order.status.toLowerCase();
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] flex items-center justify-center text-[#2CA7A0]">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Order ID</p>
                        <p className="font-mono font-bold text-[#1E1E1E] uppercase">#{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Placed On</p>
                        <p className="text-sm font-bold text-[#1E1E1E]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      
                      <Badge className={`${status.color} px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1.5 border uppercase tracking-wider`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                      
                      <Button asChild size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 text-gray-400 hover:text-[#1E1E1E] hover:bg-gray-50">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <ChevronRight size={20} />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-gray-50">
                    <div className="flex items-center -space-x-2">
                      {order.items.slice(0, 3).map((item: any, idx: any) => {
                        const imageUrl = item.product?.images?.[0]?.url || "/placeholder-product.png";
                        return (
                          <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <Image src={imageUrl} alt={item.title} fill className="object-cover" />
                          </div>
                        );
                      })}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</p>
                      <p className="text-lg font-black text-[#1E1E1E]">₹{order.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matches found"
            description="We couldn't find any orders matching your criteria. Try adjusting your search or filters."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearchTerm("");
                setStatusFilter("all");
              }
            }}
          />
        )
      ) : (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Start your wellness journey today with our curated products."
          action={{
            label: "Shop Marketplace",
            href: "/products"
          }}
        />
      )}
    </div>
  );
}
