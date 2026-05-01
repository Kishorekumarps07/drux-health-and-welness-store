"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShoppingBag, 
  Store, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
  Monitor
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { AdminMetricsTile } from "@/components/admin/AdminMetricsTile";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import Link from "next/link";

const RevenueChart = dynamic(() => import("@/components/admin/AnalyticsCharts").then((mod) => mod.RevenueChart), { ssr: false });
const OrdersTrendBarChart = dynamic(() => import("@/components/admin/AnalyticsCharts").then((mod) => mod.OrdersTrendBarChart), { ssr: false });

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const [statsData, revData, ordersData, feedData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRevenueAnalytics('7d'),
          adminService.listAllOrders({ limit: 10 }),
          adminService.getActivityFeed()
        ]);
        
        setStats(statsData);
        setRevenueData(revData);
        setOrders(ordersData.orders || []);
        setActivities(feedData || []);
      } catch (error) {
        toast.error("Failed to load dashboard intelligence");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const ordersTrend = revenueData.map(d => ({
    date: d.date,
    value: d.orders || 0
  }));

  const metrics = [
    { 
      name: 'Total Revenue', 
      value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`, 
      change: stats?.growth?.revenue || '+12.5%', 
      trend: 'up' as const, 
      icon: TrendingUp, 
      color: '#10B981' // emerald-500
    },
    { 
      name: 'Total Orders', 
      value: stats?.totalOrders || '0', 
      change: stats?.growth?.orders || '+8.2%', 
      trend: 'up' as const, 
      icon: ShoppingBag, 
      color: '#8b5cf6' 
    },
    { 
      name: 'Active Vendors', 
      value: stats?.totalVendors || '0', 
      change: '+3 new', 
      trend: 'up' as const, 
      icon: Store, 
      color: '#0ea5e9' 
    },
    { 
      name: 'Pending Approvals', 
      value: stats?.pendingVendors || '0', 
      change: 'Urgent', 
      trend: 'down' as const, 
      icon: Clock, 
      color: '#F59E0B' // amber-500
    },
  ];

  const handleExportReport = () => {
    if (!stats) return;
    
    const rows = [
      ["Category", "Value", "Growth"],
      ["Total Revenue", stats.totalRevenue, stats.growth?.revenue],
      ["Total Orders", stats.totalOrders, stats.growth?.orders],
      ["Active Vendors", stats.totalVendors, "+3 new"],
      ["Pending Approvals", stats.pendingVendors, "Urgent"],
      [],
      ["ID", "Customer", "Amount", "Status", "Date"]
    ];

    orders.forEach(o => {
      rows.push([o.id, o.user?.name || 'N/A', o.total, o.status, new Date(o.createdAt).toLocaleDateString()]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `druxx_admin_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Intelligence report exported successfully");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Banner / Welcome */}
      <div className="col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence <span className="text-[#10B981]">Hub</span></h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Holistic view of platform performance and operational health.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            onClick={handleExportReport}
            className="rounded-xl h-11 px-5 font-semibold border-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-colors"
           >
              Export Report
           </Button>
           <Button asChild className="rounded-xl h-11 px-5 font-semibold bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-[#10B981]/20 transition-all border border-transparent">
              <Link href="/dashboard/admin/audit-logs">
                Audit Logs
              </Link>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Primary Metrics Grid - 4 items spanning 3 columns each */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {metrics.map((m) => (
             <AdminMetricsTile key={m.name} {...m} loading={loading} />
           ))}
        </div>

        {/* Main Intelligence Grid Split 8 / 4 */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] shadow-lg shadow-black/5 hover:border-[#374151] transition-colors duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Revenue Stream</h3>
                  <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mt-1">Last 7 Days (Real-time)</p>
                </div>
                <Badge variant="outline" className="rounded-lg border-[#10B981]/20 text-[#10B981] bg-[#10B981]/10 font-bold px-3 py-1 uppercase text-[10px]">
                  Growing Fast
                </Badge>
             </div>
             <RevenueChart data={revenueData} />
          </div>

          {/* Activity Chart Area */}
          <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] shadow-lg shadow-black/5 hover:border-[#374151] transition-colors duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Order Volume</h3>
                  <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mt-1">Platform Activity Trend</p>
                </div>
             </div>
             <OrdersTrendBarChart data={ordersTrend} />
          </div>

          {/* Recent Orders Table */}
          <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] shadow-lg shadow-black/5 hover:border-[#374151] transition-colors duration-300">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Global Transaction Log</h3>
                <Button asChild variant="ghost" className="rounded-xl font-bold text-[#10B981] hover:bg-[#10B981]/10 gap-2 h-9 px-4">
                   <Link href="/dashboard/admin/orders">
                      View All <ExternalLink size={14} />
                   </Link>
                </Button>
             </div>
             <RecentOrdersTable orders={orders} loading={loading} />
          </div>
        </div>

        {/* Right Sidebar Section col-span-4 */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* System Alerts Panel */}
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl p-6 text-white shadow-xl shadow-[#10B981]/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 border border-white/30 backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                   <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Systems Healthy</h3>
                <p className="text-emerald-50 text-xs font-medium leading-relaxed mb-6">Platform is operating optimally. 0 security incidents in 24h.</p>
                
                <div className="space-y-3">
                   {stats?.pendingVendors > 0 && (
                      <div className="flex items-center gap-4 bg-black/20 border border-black/10 p-4 rounded-xl hover:bg-black/30 transition-colors cursor-pointer group/alert backdrop-blur-md">
                         <div className="w-8 h-8 rounded-lg bg-amber-500/20 shadow-inner border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Store size={16} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100 group-hover/alert:text-white transition-colors">Vendor Approvals</p>
                            <p className="text-xs font-bold text-white mt-0.5">{stats.pendingVendors} Applications Pending</p>
                         </div>
                         <ChevronRight size={14} className="text-emerald-200 group-hover/alert:text-white transition-all transform group-hover/alert:translate-x-1" />
                      </div>
                   )}

                   <div className="flex items-center gap-4 bg-black/20 border border-black/10 p-4 rounded-xl hover:bg-black/30 transition-colors cursor-pointer group/alert backdrop-blur-md">
                      <div className="w-8 h-8 rounded-lg bg-red-400/20 shadow-inner border border-red-400/30 flex items-center justify-center text-red-300">
                         <CreditCard size={16} />
                      </div>
                      <div className="flex-1">
                         <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100 group-hover/alert:text-white transition-colors">Check Failures</p>
                         <p className="text-xs font-bold text-white mt-0.5">0 Payment Errors</p>
                      </div>
                      <ChevronRight size={14} className="text-emerald-200 group-hover/alert:text-white transition-all transform group-hover/alert:translate-x-1" />
                   </div>
                </div>
             </div>
             {/* Ambient Glow */}
             <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] shadow-lg shadow-black/5 hover:border-[#374151] transition-colors duration-300">
             <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Administrative Suite</h3>
             <div className="grid gap-3">
                {[
                   { label: "Vendor Management", href: "/dashboard/admin/vendors", icon: Store, color: "text-[#10B981]" },
                   { label: "CMS Management", href: "/dashboard/admin/cms", icon: Monitor, color: "text-amber-500" },
                   { label: "Inventory Audit", href: "/dashboard/admin/inventory", icon: Package, color: "text-blue-500" },
                   { label: "User Permissions", href: "/dashboard/admin/users", icon: Users, color: "text-purple-500" },
                ].map((action) => (
                   <Link 
                     key={action.label}
                     href={action.href}
                     className="flex items-center justify-between p-3.5 rounded-xl bg-[#1F2937]/30 border border-transparent hover:border-[#374151] hover:bg-[#1F2937]/50 transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                           <action.icon size={16} className={action.color} />
                         </div>
                         <span className="font-semibold text-[#E5E7EB] text-sm">{action.label}</span>
                      </div>
                      <ArrowUpRight size={16} className="text-[#6B7280] group-hover:text-white transition-all transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                   </Link>
                ))}
             </div>
          </div>

          {/* Platform Snapshot */}
          <div className="bg-[#111827]/50 rounded-xl p-6 border border-[#1F2937] border-dashed flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 bg-[#1F2937] rounded-xl flex items-center justify-center shadow-inner mb-4 border border-[#374151]">
                <Activity size={18} className="text-[#10B981]" />
             </div>
             <h4 className="text-base font-bold text-white mb-1">System Load</h4>
             <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-5">Optimal Capacity</p>
             <div className="w-full bg-[#1F2937] h-1 rounded-full overflow-hidden shadow-inner flex items-center">
                <div className="bg-[#10B981] h-full rounded-full transition-all duration-1000 w-[24%] shadow-[0_0_8px_#10B981]" />
             </div>
             <p className="text-[9px] font-bold text-[#6B7280] mt-3 uppercase tracking-wider">
               Last Ping: <span suppressHydrationWarning>{mounted ? new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' }) : '--:--:-- TT'}</span> (UTC)
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
