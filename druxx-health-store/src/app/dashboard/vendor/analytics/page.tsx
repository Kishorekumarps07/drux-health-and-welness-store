"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users,
  ArrowUpRight,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await vendorService.getAnalytics({ range });
      setData(analytics);
    } catch (error) {
      toast.error("Failed to fetch shop performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[2rem]" />)}
        </div>
        <div className="h-[400px] bg-gray-50 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Shop <span className="text-[#A6D608]">Intelligence</span></h1>
            <p className="text-gray-500 font-medium italic mt-1">Deep dive into your store's performance and conversion metrics.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                {['7d', '30d', '90d'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {r}
                  </button>
                ))}
             </div>
             <Button variant="outline" className="rounded-2xl h-12 px-5 font-bold gap-2">
                <Download className="w-4 h-4" />
                Export
             </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Revenue</p>
                 <h3 className="text-3xl font-black text-gray-900 italic">₹{data?.salesTrend?.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toLocaleString() || '0'}</h3>
                 <div className="mt-4 flex items-center gap-2">
                    <Badge className="bg-[#A6D608]/10 text-[#A6D608] border-none font-black text-[10px] px-2 py-0.5">
                       <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
                    </Badge>
                    <span className="text-[10px] font-bold text-gray-400">vs last period</span>
                 </div>
              </div>
              <BarChart3 className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 transform rotate-12 group-hover:scale-110 transition-transform" />
           </Card>

           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Orders</p>
                 <h3 className="text-3xl font-black text-gray-900 italic">{data?.salesTrend?.reduce((acc: number, curr: any) => acc + curr.orders, 0) || '0'}</h3>
                 <div className="mt-4 flex items-center gap-2">
                    <Badge className="bg-[#A6D608]/10 text-[#A6D608] border-none font-black text-[10px] px-2 py-0.5">
                       <TrendingUp className="w-3 h-3 mr-1" /> +8.2%
                    </Badge>
                    <span className="text-[10px] font-bold text-gray-400">vs last period</span>
                 </div>
              </div>
              <ShoppingBag className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 transform -rotate-12 group-hover:scale-110 transition-transform" />
           </Card>

           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Avg Order Value</p>
                 <h3 className="text-3xl font-black text-gray-900 italic">₹{Math.round((data?.salesTrend?.reduce((acc: number, curr: any) => acc + curr.revenue, 0) / (data?.salesTrend?.reduce((acc: number, curr: any) => acc + curr.orders, 0) || 1)) || 0).toLocaleString()}</h3>
                 <div className="mt-4 flex items-center gap-2">
                    <Badge className="bg-[#A6D608]/10 text-[#A6D608] border-none font-black text-[10px] px-2 py-0.5">
                       STABLE
                    </Badge>
                    <span className="text-[10px] font-bold text-gray-400">Target: ₹2,500</span>
                 </div>
              </div>
              <ArrowUpRight className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 transform group-hover:scale-110 transition-transform" />
           </Card>
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 rounded-[2.5rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h4 className="text-xl font-black text-gray-900">Revenue Stream</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Daily trend in sales volume</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                       <div className="w-2.5 h-2.5 rounded-full bg-[#A6D608]" />
                       Revenue
                    </div>
                 </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrend || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A6D608" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A6D608" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      itemStyle={{ fontWeight: 800, color: '#A6D608' }}
                      labelStyle={{ marginBottom: '5px', fontWeight: 600, color: '#6b7280' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#A6D608" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A6D608]/5 rounded-full blur-3xl -z-10" />
           </Card>

           <Card className="rounded-[2.5rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white">
              <h4 className="text-xl font-black text-gray-900 mb-8">Top Products</h4>
              <div className="space-y-6">
                 {data?.topProducts?.map((product: any, index: number) => (
                    <div key={product.id} className="flex flex-col gap-2 group cursor-pointer">
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-3">
                             <span className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400">{index + 1}</span>
                             {product.title}
                          </span>
                          <span className="text-xs font-black text-gray-900">₹{product.revenue.toLocaleString()}</span>
                       </div>
                       <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden flex items-center">
                          <div 
                            className="bg-[#A6D608] h-full rounded-full group-hover:brightness-110 transition-all"
                            style={{ width: `${(product.revenue / (data.topProducts[0].revenue || 1)) * 100}%` }}
                          />
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          <span>{product.quantity} sold</span>
                          <span>{Math.round((product.revenue / (data?.salesTrend?.reduce((acc: number, curr: any) => acc + curr.revenue, 0) || 1)) * 100)}% of sales</span>
                       </div>
                    </div>
                 ))}
                 
                 {(!data?.topProducts || data.topProducts.length === 0) && (
                    <div className="py-20 text-center italic text-gray-400 font-medium">
                       No sales data yet.
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
