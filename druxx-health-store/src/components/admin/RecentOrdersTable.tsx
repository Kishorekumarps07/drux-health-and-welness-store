"use client";

import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  ExternalLink,
  ChevronRight,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RecentOrdersTableProps {
  orders: any[];
  loading?: boolean;
}

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

export function RecentOrdersTable({ orders, loading = false }: RecentOrdersTableProps) {
  if (!loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#1F2937]/30 rounded-2xl border-2 border-dashed border-[#374151]">
        <div className="w-16 h-16 bg-[#111827] rounded-full flex items-center justify-center shadow-sm mb-4 border border-[#374151]">
          <ShoppingBag className="w-8 h-8 text-[#4B5563]" />
        </div>
        <p className="text-[#9CA3AF] font-bold">No recent global orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1F2937] uppercase text-[10px] font-bold tracking-[0.2em] text-[#9CA3AF]">
            <th className="px-6 py-5">Order Context</th>
            <th className="px-6 py-5">Customer</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5 text-right">Amount</th>
            <th className="px-6 py-5 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-6"><div className="h-10 w-32 bg-[#1F2937] rounded-xl" /></td>
                <td className="px-6 py-6"><div className="h-6 w-24 bg-[#1F2937] rounded-lg" /></td>
                <td className="px-6 py-6"><div className="h-6 w-20 bg-[#1F2937] rounded-lg" /></td>
                <td className="px-6 py-6 text-right"><div className="h-6 w-16 bg-[#1F2937] rounded-lg ml-auto" /></td>
                <td className="px-6 py-6"><div className="h-8 w-8 bg-[#1F2937] rounded-full ml-auto" /></td>
              </tr>
            ))
          ) : (
            orders.slice(0, 7).map((order) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              return (
                <tr key={order.id} className="group hover:bg-[#1F2937]/30 transition-colors">
                  <td className="px-6 py-6">
                    <div>
                      <p className="font-bold text-white group-hover:text-[#10B981] transition-colors">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-tighter mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="font-bold text-[#E5E7EB] text-sm truncate max-w-[120px]">
                      {order.user?.name || (order.address ? `${order.address.firstName} ${order.address.lastName}` : "Guest")}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] font-medium truncate">{order.user?.email || "No Email"}</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider border",
                      status.bg,
                      status.color
                    )}>
                      <status.icon size={12} />
                      {order.status}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="font-bold text-white flex items-center justify-end gap-1">
                      <IndianRupee size={12} className="text-[#9CA3AF]" />
                      {order.total.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link href={`/dashboard/admin/orders?search=${order.id}`}>
                      <button className="w-8 h-8 rounded-lg bg-transparent group-hover:bg-[#374151] border border-transparent group-hover:border-[#4B5563] flex items-center justify-center transition-all shadow-sm">
                        <ChevronRight size={14} className="text-[#9CA3AF] group-hover:text-white" />
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
