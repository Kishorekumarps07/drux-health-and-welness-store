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
  const { user, logout } = useAuthStore();
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
    <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-500">
      {/* Hello Greeting Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none mb-1.5">
            Hello, <span className="text-[#A6D608]">{user?.name?.split(' ')[0] || "User"}</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.email}</p>
        </div>
        <Badge className="bg-[#A6D608]/10 text-[#A6D608] border border-[#A6D608]/20 font-black text-[9px] tracking-widest px-3 py-1 rounded-full uppercase">
          Elite Member
        </Badge>
      </div>

      {/* 2x2 Grid of Main Buttons (Amazon Style) */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/dashboard/orders" 
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-200 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center justify-center gap-1.5 min-h-[84px]"
        >
          <span className="text-xs font-black text-gray-800">Your Orders</span>
        </Link>
        
        <Link 
          href="/dashboard/wishlist" 
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-200 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center justify-center gap-1.5 min-h-[84px]"
        >
          <span className="text-xs font-black text-gray-800">Your Wishlist</span>
        </Link>
        
        <Link 
          href="/dashboard/security" 
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-200 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center justify-center gap-1.5 min-h-[84px]"
        >
          <span className="text-xs font-black text-gray-800">Login & Security</span>
        </Link>
        
        <Link 
          href="/dashboard/addresses" 
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-200 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center justify-center gap-1.5 min-h-[84px]"
        >
          <span className="text-xs font-black text-gray-800">Your Addresses</span>
        </Link>
      </div>

      {/* Recent Orders Section (Amazon style - single compact card) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Recent Order</h2>
          <Link href="/dashboard/orders" className="text-xs font-bold text-[#A6D608] hover:text-[#8ab506] transition-colors flex items-center gap-0.5">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        
        {loading ? (
          <div className="animate-pulse flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-2.5 bg-gray-50 rounded w-1/2" />
            </div>
          </div>
        ) : recentOrders.length > 0 ? (
          (() => {
            const order = recentOrders[0];
            return (
              <Link 
                href={`/dashboard/orders/${order.id}`} 
                className="flex items-center justify-between group active:scale-[0.99] transition-transform py-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#A6D608] transition-colors border border-gray-100/80 shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-black text-sm text-gray-900">₹{order.total.toLocaleString()}</p>
                  <span className="inline-block px-1.5 py-0.5 bg-gray-50 text-[9px] font-black text-gray-500 rounded uppercase tracking-wider mt-1 border border-gray-100/50 leading-none">
                    {order.status}
                  </span>
                </div>
              </Link>
            );
          })()
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 font-medium mb-2">No recent orders found.</p>
            <Button asChild variant="outline" className="h-8 rounded-lg text-xs font-bold px-4 border-gray-200">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Account Settings List (Amazon Style) */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
        <Link href="/dashboard/profile" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
          <span className="text-xs font-bold text-gray-700">Account Settings</span>
          <ChevronRight size={14} className="text-gray-300" />
        </Link>
        <Link href="/help" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
          <span className="text-xs font-bold text-gray-700">Help Center</span>
          <ChevronRight size={14} className="text-gray-300" />
        </Link>
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left border-none"
        >
          <span className="text-xs font-bold text-rose-500">Sign Out</span>
          <ChevronRight size={14} className="text-rose-300" />
        </button>
      </div>
    </div>
  );
}
