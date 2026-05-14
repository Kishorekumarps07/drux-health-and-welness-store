"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Plus,
  ArrowRight,
  Star,
  Zap,
  LayoutGrid,
  Store,
  BarChart3,
  Search,
  Settings,
  ChevronRight
} from "lucide-react"
import { vendorService, VendorStats, VendorOrderItem } from "@/services/vendorService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { VendorMetricsTile } from "@/components/vendor/VendorMetricsTile"
import { VendorRevenueChart } from "@/components/vendor/VendorRevenueChart"
import { PriorityOrders } from "@/components/vendor/PriorityOrders"
import { useAuthStore } from "@/store/authStore"

export default function VendorOverviewPage() {
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [orders, setOrders] = useState<VendorOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsData, ordersData, analyticsData] = await Promise.all([
          vendorService.getDashboardStats(),
          vendorService.getMyOrders({ limit: 6, status: 'PENDING' }),
          vendorService.getAnalytics()
        ])
        
        setStats(statsData)
        setOrders(ordersData.items || [])
        setAnalytics(analyticsData)
      } catch (error) {
        toast.error("Failed to load business intelligence")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleOrderAction = async (id: string, status: string) => {
    try {
      await vendorService.updateItemStatus(id, status)
      toast.success(`Order moved to ${status}`)
      // Refresh orders
      const ordersData = await vendorService.getMyOrders({ limit: 6, status: 'PENDING' })
      setOrders(ordersData.items)
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  // Format analytics trend for chart
  const revenueTrend = (analytics?.salesTrend || []).map((day: any) => ({
    date: day.date,
    revenue: day.revenue
  }));

  const metricCards = [
    { 
      name: "Today's Revenue", 
      value: `₹${analytics?.todayRevenue?.toLocaleString() || '0'}`, 
      change: analytics?.revenueGrowth || '+0%', 
      trend: (analytics?.revenueGrowth?.startsWith('+') ? 'up' : 'down') as 'up' | 'down', 
      icon: TrendingUp, 
      color: '#A6D608' 
    },
    { 
      name: "Pending Orders", 
      value: stats?.pendingOrderCount || '0', 
      change: 'Action Required', 
      trend: 'up' as const, 
      icon: Clock, 
      color: '#FF7A00' 
    },
    { 
      name: "Total Products", 
      value: stats?.productCount || '0', 
      change: 'Lifetime stats', 
      trend: 'up' as const, 
      icon: Package, 
      color: '#0ea5e9' 
    },
    { 
      name: "Store Rating", 
      value: (user as any)?.vendor?.rating ? parseFloat((user as any).vendor.rating).toFixed(1) : "4.8", 
      change: 'Customer Trust', 
      trend: 'up' as const, 
      icon: Star, 
      color: '#f59e0b' 
    },
  ]

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 italic">
        {/* Priority Orders Section (Surfaced Top) */}
        {orders.length > 0 && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Priority Orders</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Items awaiting fulfillment</p>
                 </div>
                 <Button asChild variant="ghost" className="rounded-xl font-black text-[#A6D608] hover:bg-[#A6D608]/5 gap-2">
                    <Link href="/dashboard/vendor/orders">
                       Process All <ArrowRight size={14} />
                    </Link>
                 </Button>
              </div>
              <PriorityOrders orders={orders} onAction={handleOrderAction} loading={loading} />
           </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {metricCards.map((card) => (
             <VendorMetricsTile key={card.name} {...card} loading={loading} />
           ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           {/* Revenue Insights */}
           <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Analytics</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Weekly Store Growth</p>
                 </div>
                 <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100/50">
                    <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-black bg-white text-gray-900 shadow-sm">Revenue</Button>
                    <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600">Orders</Button>
                 </div>
              </div>
              <VendorRevenueChart data={revenueTrend} />
              
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#A6D608]/5 rounded-full blur-3xl pointer-events-none" />
           </div>

           {/* Quick Actions & Empty State */}
           <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-[#1E1E1E] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-[#A6D608]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#A6D608]/30">
                       <Zap className="w-7 h-7 text-[#A6D608]" />
                    </div>
                    <h3 className="text-2xl font-black mb-1 italic">Quick Actions</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">Manage your business operations efficiently.</p>
                    
                    <div className="grid gap-3 font-black text-xs uppercase italic tracking-widest">
                       <Link href="/dashboard/vendor/inventory/add" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group/btn">
                          <div className="flex items-center gap-3">
                             <Plus size={16} className="text-[#A6D608]" /> <span>Add New Product</span>
                          </div>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                       <Link href="/dashboard/vendor/orders" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group/btn">
                          <div className="flex items-center gap-3">
                             <ShoppingBag size={16} className="text-[#A6D608]" /> <span>View All Orders</span>
                          </div>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                       <Link href="/dashboard/vendor/settings" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group/btn">
                          <div className="flex items-center gap-3">
                             <Store size={16} className="text-[#A6D608]" /> <span>Store Profile</span>
                          </div>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                 </div>
                 <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#A6D608]/10 rounded-full blur-3xl" />
              </div>

              {/* Empty State / Status */}
              {!stats?.productCount && !loading && (
                <div className="bg-white rounded-[2.5rem] p-10 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                      <Package size={24} className="text-[#A6D608]" />
                   </div>
                   <h4 className="text-xl font-black text-gray-900 mb-2">No Products Yet</h4>
                   <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8 italic">Ready to grow your health brand?</p>
                   <Button asChild className="w-full bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-2xl h-14 font-black shadow-xl shadow-[#A6D608]/20 transition-all">
                      <Link href="/dashboard/vendor/inventory/add">Start selling your products</Link>
                   </Button>
                </div>
              )}

              {/* Tips Section */}
              <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100">
                 <h4 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Merchant Tips</h4>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 text-[#A6D608]">
                          <BarChart3 size={18} />
                       </div>
                       <p className="text-xs font-bold text-gray-600 leading-relaxed italic">Include high-quality 4K images to increase your store conversion rate by up to 40%.</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 text-[#A6D608]">
                          <Zap size={18} />
                       </div>
                       <p className="text-xs font-bold text-gray-600 leading-relaxed italic">Fast fulfillment (under 12h) boosts your store rating and visibility in search results.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function Clock({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
