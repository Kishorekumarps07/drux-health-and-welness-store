"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Package, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  MoreVertical,
  Calendar,
  User,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  vendorService, 
  VendorOrderItem, 
  VendorStats 
} from "@/services/vendorService";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function VendorOrdersPage() {
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, ordersData] = await Promise.all([
          vendorService.getDashboardStats(),
          vendorService.getMyOrders({ 
            page, 
            status: statusFilter === "all" ? undefined : statusFilter 
          })
        ]);
        setStats(statsData);
        setItems(ordersData.items);
        setTotalPages(ordersData.pages);
      } catch (error) {
        console.error("Failed to load vendor data", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [page, statusFilter]);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="min-h-screen bg-[#FAFAFA] pb-12">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 pt-8 pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#1E1E1E] uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag className="text-[#A6D608]" /> Order Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Track and fulfill your individual product orders</p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-[#1E1E1E] text-white hover:bg-black rounded-xl px-6 font-bold text-xs uppercase tracking-widest h-11">
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Total Revenue", value: `₹${Number(stats?.totalSales || 0).toLocaleString()}`, icon: TrendingUp, color: "text-[#A6D608]" },
                { label: "Active Orders", value: stats?.orderCount || 0, icon: ShoppingBag, color: "text-blue-500" },
                { label: "Total Items", value: stats?.orderItemCount || 0, icon: Package, color: "text-purple-500" },
                { label: "Live Products", value: stats?.productCount || 0, icon: CheckCircle2, color: "text-green-500" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#FAFAFA] border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black text-[#1E1E1E]">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search by product, order ID, or customer..." 
                  className="pl-11 h-12 bg-gray-50 border-none rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-[#A6D608]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={(val: string | null) => val && setStatusFilter(val)}>
                  <SelectTrigger className="w-[180px] h-12 bg-gray-50 border-none rounded-2xl font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <Filter size={14} className="text-gray-400" />
                       <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100">
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table/List Section */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Item Info</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Package size={48} className="text-gray-100 mb-4" />
                          <p className="text-sm font-bold text-gray-400">No orders found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.product.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1E1E1E] line-clamp-1">{item.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-medium text-gray-400">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase">{item.orderId.substring(0, 8)}</span>
                              <span>•</span>
                              <span>{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                            <User size={12} className="text-gray-300" /> {item.order.user.name}
                          </span>
                          <span className="text-xs text-gray-400">{item.order.address.city}, {item.order.address.state}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {statusConfig(item.status)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#1E1E1E]">₹{Number(item.total).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity}</p>
                      </td>
                      <td className="px-6 py-5">
                        <Link href={`/vendor/orders/${item.id}`}>
                          <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-[#A6D608]/10 hover:text-[#1E1E1E] group-hover:bg-[#A6D608]/10">
                            <ChevronRight size={18} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button 
                    key={i} 
                    variant={page === i + 1 ? "default" : "outline"} 
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#1E1E1E] text-white" : "border-gray-200 text-gray-500 hover:border-[#A6D608]"}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function statusConfig(status: string) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <Badge className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-none flex items-center gap-1.5 w-fit ${cfg.color}`}>
      <Icon size={12} strokeWidth={2.5} /> {cfg.label}
    </Badge>
  );
}
