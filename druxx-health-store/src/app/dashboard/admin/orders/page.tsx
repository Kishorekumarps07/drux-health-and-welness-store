"use client";

import { useEffect, useState } from "react";
import { 
  ChevronRight, 
  Search, 
  Filter, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  RefreshCw,
  Mail,
  History,
  Copy,
  Eye,
  ExternalLink,
  MoreVertical,
  Calendar,
  IndianRupee
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { adminService } from "@/services/adminService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams ? searchParams.get("search") || "" : "";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.listAllOrders({ search });
      console.log("FRONTEND ADMIN ORDERS FETCHED:", data.orders);
      setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to fetch platform orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success(`Order #${id.slice(0, 8)} status updated to ${status}`);
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const statusMap: Record<string, any> = {
    PENDING: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
    CONFIRMED: { color: "text-blue-400", bg: "bg-blue-500/10", icon: Package },
    PROCESSING: { color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Package },
    PARTIAL: { color: "text-orange-400", bg: "bg-orange-500/10", icon: Package },
    SHIPPED: { color: "text-purple-400", bg: "bg-purple-500/10", icon: Truck },
    DELIVERED: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: CheckCircle2 },
    CANCELLED: { color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
    REFUNDED: { color: "text-rose-400", bg: "bg-rose-500/10", icon: History },
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Global Orders</h1>
            <p className="text-[#9CA3AF] font-medium mt-1">Monitor and manage all transactions across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors" />
                <Input 
                  placeholder="Search by Order ID..." 
                  className="pl-12 rounded-xl bg-[#111827] border border-[#1F2937] text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#10B981]/50 focus:border-transparent h-11 w-[300px] font-medium shadow-inner"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" className="rounded-xl h-11 px-5 font-semibold bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white transition-colors gap-2 shadow-sm">
                <Filter className="w-4 h-4" />
                Filter
             </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#111827] rounded-3xl border border-[#1F2937] shadow-xl overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-[#1F2937] uppercase text-[10px] font-bold tracking-widest text-[#9CA3AF]">
                       <th className="px-10 py-6">Order ID & Date</th>
                       <th className="px-6 py-6">Customer</th>
                       <th className="px-6 py-6">Status</th>
                       <th className="px-6 py-6 text-right">Amount</th>
                       <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1F2937]">
                    {loading ? (
                      Array(6).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td className="px-10 py-8"><div className="h-10 w-40 bg-[#1F2937]/50 rounded-xl" /></td>
                           <td className="px-6 py-8"><div className="h-6 w-32 bg-[#1F2937]/50 rounded-lg" /></td>
                           <td className="px-6 py-8"><div className="h-6 w-24 bg-[#1F2937]/50 rounded-lg" /></td>
                           <td className="px-6 py-8 text-right"><div className="h-6 w-20 bg-[#1F2937]/50 rounded-lg ml-auto" /></td>
                           <td className="px-10 py-8 text-right"><div className="h-8 w-8 bg-[#1F2937]/50 rounded-full ml-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      orders.map((order) => {
                        const status = statusMap[order.status] || statusMap.PENDING;
                        return (
                          <tr key={order.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                             <td className="px-10 py-8">
                                <div>
                                   <p className="font-bold text-white group-hover:text-[#10B981] transition-colors tracking-tight">
                                      #{order.id.slice(0, 12).toUpperCase()}
                                   </p>
                                   <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(order.createdAt).toLocaleDateString()}
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <p className="font-bold text-[#E5E7EB]">{order.user?.name || (order.address ? `${order.address.firstName} ${order.address.lastName}` : "Anonymous")}</p>
                                <p className="text-[10px] font-medium text-[#9CA3AF] lowercase">{order.user?.email || "No Email"}</p>
                             </td>
                             <td className="px-6 py-8">
                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-bold text-[10px] uppercase tracking-wider", status.bg, status.color, `border-${status.color.split('-')[1]}/20`)}>
                                   <status.icon className="w-3.5 h-3.5" />
                                   {order.status}
                                </div>
                             </td>
                             <td className="px-6 py-8 text-right">
                                <div className="text-white font-bold flex items-center justify-end gap-1">
                                   <IndianRupee className="w-3 h-3 text-[#9CA3AF]" />
                                   {order.total.toLocaleString()}
                                </div>
                                <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mt-1">{order.items?.length || 0} items</p>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <DropdownMenu>
                                   <DropdownMenuTrigger className="rounded-xl w-10 h-10 p-0 hover:bg-[#1F2937] flex items-center justify-center transition-all focus:outline-none">
                                      {updating === order.id ? (
                                        <RefreshCw className="w-4 h-4 text-[#10B981] animate-spin" />
                                      ) : (
                                        <MoreVertical className="w-4 h-4 text-[#9CA3AF] hover:text-white" />
                                      )}
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-[#111827] border-[#1F2937] shadow-2xl shadow-black p-2 text-white">
                                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] px-3 py-2">
                                         Update Status
                                      </DropdownMenuLabel>
                                      {['CONFIRMED', 'PROCESSING', 'PARTIAL', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map((st) => (
                                        <DropdownMenuItem 
                                          key={st}
                                          disabled={order.status === st || updating === order.id}
                                          onClick={() => handleStatusUpdate(order.id, st)}
                                          className={cn(
                                            "rounded-xl font-bold text-xs py-2.5 cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] focus:text-white",
                                            st === 'CANCELLED' ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10" : ""
                                          )}
                                        >
                                          Mark as {st}
                                        </DropdownMenuItem>
                                      ))}
                                      
                                      <DropdownMenuSeparator className="bg-[#1F2937] my-1" />
                                      
                                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] px-3 py-2">
                                         Customer Interaction
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem 
                                         className="rounded-xl font-bold text-xs py-2.5 cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] focus:text-[#10B981]"
                                         onClick={() => window.location.href = `mailto:${order.user?.email}`}
                                      >
                                         <div className="flex items-center w-full">
                                           <Mail className="w-4 h-4 mr-2" />
                                           Contact Customer
                                         </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                         className="rounded-xl font-bold text-xs py-2.5 cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] focus:text-white"
                                         onClick={() => {
                                            if (typeof window !== 'undefined') {
                                              navigator.clipboard.writeText(order.id);
                                              toast.success("Order ID copied to clipboard");
                                            }
                                         }}
                                      >
                                         <div className="flex items-center w-full">
                                           <Copy className="w-4 h-4 mr-2" />
                                           Copy Order ID
                                         </div>
                                      </DropdownMenuItem>
                                      
                                      <DropdownMenuSeparator className="bg-[#1F2937] my-1" />
                                      
                                      <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] focus:text-[#10B981]">
                                         <Link href={`/dashboard/admin/audit-logs?search=${order.id}`} className="flex items-center w-full">
                                           <History className="w-4 h-4 mr-2" />
                                           Audit History
                                         </Link>
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </td>
                          </tr>
                        );
                      })
                    )}
                    {!loading && orders.length === 0 && (
                      <tr>
                         <td colSpan={5} className="px-10 py-20 text-center">
                            <div className="w-16 h-16 bg-[#1F2937]/50 rounded-full flex items-center justify-center mx-auto mb-6">
                               <Package className="w-8 h-8 text-[#4B5563]" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">No Global Orders</h4>
                            <p className="text-[#9CA3AF] font-medium">Platform-wide sales will appear here.</p>
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
