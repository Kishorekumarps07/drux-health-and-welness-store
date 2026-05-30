"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  CreditCard,
  Heart,
  ExternalLink,
  Plus,
  Clock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders({ limit: 3 });
      setRecentOrders(data.orders);
      setOrderCount(data.total);
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const dashCards = [
    {
      title: "My Orders",
      description: "Track, return, or buy items again",
      icon: <Package size={24} />,
      link: "/dashboard/orders",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Addresses",
      description: "Edit delivery addresses for orders",
      icon: <MapPin size={24} />,
      link: "/dashboard/addresses",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Login & Security",
      description: "Edit login, name, and mobile number",
      icon: <ShieldCheck size={24} />,
      link: "/dashboard/security",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Account Settings",
      description: "Manage your profile and notification preferences",
      icon: <Settings size={24} />,
      link: "/dashboard/profile",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Wishlist",
      description: "Items you've saved for later",
      icon: <Heart size={24} />,
      link: "/dashboard/wishlist",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Help Center",
      description: "Get help with your orders and account",
      icon: <HelpCircle size={24} />,
      link: "/help",
      color: "text-teal-500",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Profile Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A6D608]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#A6D608]/20 bg-white flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.name} width={128} height={128} className="object-cover" />
              ) : (
                <User size={48} className="text-[#A6D608]" />
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#A6D608] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-[#1E1E1E]">Hello, {user?.name.split(' ')[0]}!</h1>
              <Badge className="w-fit mx-auto md:mx-0 bg-gray-900 text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-full border-none">
                PREMIUM MEMBER
              </Badge>
            </div>
            <p className="text-gray-500 font-medium mb-6">{user?.email} • Member since {new Date().getFullYear()}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex flex-col bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 min-w-[120px]">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</span>
                <span className="text-xl font-black text-[#1E1E1E]">{loading ? "..." : orderCount}</span>
              </div>
              <div className="flex flex-col bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 min-w-[120px]">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Active Status</span>
                <span className="text-xl font-black text-[#A6D608]">Healthy</span>
              </div>
            </div>
          </div>

          <Button asChild className="hidden lg:flex bg-[#1E1E1E] hover:bg-black text-white font-bold px-8 h-14 rounded-2xl gap-2 shadow-xl">
             <Link href="/products">Shop Latest Drops</Link>
          </Button>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashCards.map((card, idx) => (
          <Link 
            key={idx} 
            href={card.link}
            className="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-[#A6D608]/30 hover:shadow-xl hover:shadow-[#A6D608]/5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className={`w-14 h-14 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
              {card.icon}
            </div>
            <div>
              <h3 className="font-black text-[#1E1E1E] text-lg mb-1 flex items-center gap-2">
                {card.title}
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#A6D608] group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-[#1E1E1E] flex items-center gap-2">
              <Clock size={20} className="text-[#A6D608]" />
              Recent Orders
            </h2>
            <Link href="/dashboard/orders" className="text-sm font-bold text-[#A6D608] hover:underline flex items-center gap-1">
              View All <ExternalLink size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/dashboard/orders/${order.id}`} 
                  className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#A6D608] transition-colors">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-[#1E1E1E]">Order #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#1E1E1E]">₹{order.total.toLocaleString()}</p>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-gray-100">
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm font-medium">No recent orders found.</p>
                <Button asChild variant="link" className="text-[#A6D608] font-bold">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#1E1E1E] px-4">Membership</h2>
          <div className="bg-[#1E1E1E] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6D608]/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <p className="text-[#A6D608] text-[10px] font-black tracking-[0.2em] uppercase mb-4">Current Plan</p>
            <h3 className="text-2xl font-black mb-2">Druxx Elite</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">Enjoy free shipping on all orders and 5% cashback on premium supplements.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#A6D608]/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#A6D608]" />
                </div>
                <span className="text-sm font-bold">Free Priority Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#A6D608]/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#A6D608]" />
                </div>
                <span className="text-sm font-bold">Early access to Sales</span>
              </div>
            </div>

            <Button className="w-full bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold h-12 rounded-xl">
              View Benefits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
