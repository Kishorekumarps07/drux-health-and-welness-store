"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Award,
  Calendar,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { cn } from "@/lib/utils";

const COLORS = ['#08D6A6', '#A6D608', '#FF7A00', '#2CA7A0', '#1E1E1E'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, r, p] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueAnalytics(range),
        adminService.getPerformanceStats()
      ]);
      setStats(s);
      setRevenueData(r);
      setPerformance(p);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const KPI_CARDS = [
    { 
      name: 'Total Revenue', 
      value: `₹${stats?.totalRevenue.toLocaleString() || '0'}`, 
      change: stats?.growth.revenue, 
      icon: DollarSign, 
      color: 'bg-emerald-500/10 text-emerald-400',
      trend: 'up'
    },
    { 
      name: 'Total Users', 
      value: stats?.totalUsers || '0', 
      change: stats?.growth.users, 
      icon: Users, 
      color: 'bg-blue-500/10 text-blue-400',
      trend: 'up'
    },
    { 
      name: 'Total Orders', 
      value: stats?.totalOrders || '0', 
      change: stats?.growth.orders, 
      icon: ShoppingBag, 
      color: 'bg-orange-500/10 text-orange-400',
      trend: 'up'
    },
    { 
      name: 'Vendors', 
      value: stats?.totalVendors || '0', 
      change: stats?.growth.vendors, 
      icon: TrendingUp, 
      color: 'bg-purple-500/10 text-purple-400',
      trend: 'up'
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Analytics</h1>
          <p className="text-[#9CA3AF] font-medium mt-1">Real-time performance metrics and growth trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#111827] border border-[#1F2937] p-1 rounded-xl flex shadow-sm">
            {['7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  range === r ? "bg-[#1F2937] text-white shadow" : "text-[#9CA3AF] hover:text-[#E5E7EB]"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-11 rounded-xl px-5 font-semibold bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all">
            <Calendar className="w-5 h-5 mr-2" />
            Custom
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.name} className="p-6 rounded-3xl bg-[#111827] border-[#1F2937] shadow-xl hover:border-[#374151] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-white/5", kpi.color)}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                kpi.trend === 'up' ? "bg-emerald-500/10 text-[#10B981] border-[#10B981]/20" : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">{kpi.name}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{kpi.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 p-8 rounded-3xl bg-[#111827] border-[#1F2937] shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                  <Activity className="w-5 h-5 text-[#10B981]" />
                  Revenue Growth
                </h3>
                <p className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wider mt-1">Platform-wide transactional volume</p>
              </div>
              <Badge className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-bold text-[10px] py-1">
                 LIVE DATA
              </Badge>
           </div>
           
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1F2937', color: '#E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}}
                  itemStyle={{color: '#10B981', fontWeight: 600}}
                  labelStyle={{color: '#9CA3AF', fontWeight: 500, marginBottom: '4px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </Card>

        {/* Top Vendors Chart */}
        <Card className="p-8 rounded-3xl bg-[#111827] border-[#1F2937] shadow-xl">
           <div className="mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Award className="w-5 h-5 text-[#8b5cf6]" />
                Top Creators
              </h3>
              <p className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wider mt-1">Performance by store volume</p>
           </div>

           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance?.topVendors || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis 
                  dataKey="storeName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}}
                />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                  cursor={{fill: '#1F2937', opacity: 0.5}}
                  contentStyle={{backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1F2937', color: '#E5E7EB'}}
                  itemStyle={{color: '#8b5cf6', fontWeight: 600}}
                />
                <Bar dataKey="totalSales" radius={[6, 6, 0, 0]} barSize={24}>
                  {(performance?.topVendors || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>

           <div className="mt-8 space-y-4">
              {performance?.topVendors.map((v: any, i: number) => (
                <div key={v.storeName} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-[#10B981]" : "bg-[#374151]")} />
                      <span className="text-xs font-bold text-white">{v.storeName}</span>
                   </div>
                   <span className="text-xs font-bold text-[#9CA3AF]">₹{v.totalSales.toLocaleString()}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-8 rounded-3xl bg-[#111827] border-[#1F2937] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Regional Distribution</h3>
            <div className="h-[300px] w-full bg-[#1F2937]/30 rounded-2xl flex items-center justify-center border border-dashed border-[#374151]">
               <div className="text-center">
                  <div className="w-12 h-12 bg-[#111827] border border-[#1F2937] rounded-xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                     <Filter className="w-6 h-6 text-[#6B7280]" />
                  </div>
                  <p className="text-xs font-medium text-[#9CA3AF] italic">Advanced geospatial analytics processing...</p>
               </div>
            </div>
         </Card>

         <Card className="p-8 rounded-3xl bg-[#111827] border-[#1F2937] shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Health Score</h3>
              <Badge className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-bold tracking-widest text-[10px]">SYSTEM HEALTHY</Badge>
            </div>
            <div className="space-y-6">
               {[
                 { label: 'Order Processing Speed', value: 94 },
                 { label: 'Payment Success Rate', value: 99.2 },
                 { label: 'Platform Uptime', value: 100 },
               ].map((metric) => (
                 <div key={metric.label}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">
                       <span>{metric.label}</span>
                       <span className="text-white">{metric.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1F2937] shadow-inner rounded-full overflow-hidden">
                       <div className="h-full bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981]" style={{ width: `${metric.value}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
}
