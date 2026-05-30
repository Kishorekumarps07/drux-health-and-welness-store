"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Bell, 
  Package, 
  Clock, 
  CheckCheck,
  ChevronRight,
  ShieldAlert,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { notificationService, Notification } from "@/services/notificationService";

export function VendorNotifications() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      console.error("Failed to fetch vendor notifications:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30 seconds for new customer order alerts
      intervalRef.current = setInterval(fetchNotifications, 30000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All merchant notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    
    // Intelligently route the vendor to their vendor orders manager instead of customer orders
    if (n.link) {
      if (n.link.startsWith("/dashboard/orders")) {
        router.push("/dashboard/vendor/orders");
      } else {
        router.push(n.link);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': 
        return <Package className="text-[#A6D608]" size={16} />;
      default: 
        return <ShieldAlert className="text-amber-500" size={16} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative cursor-pointer group outline-none">
        <div className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center">
          <Bell className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors shadow-sm" />
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF7A00] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-short shadow-sm">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[360px] bg-white border border-gray-100 p-0 rounded-2xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Alert Center</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{unreadCount} Unread alerts</p>
           </div>
           {unreadCount > 0 && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={handleMarkAllRead}
               className="h-8 text-[10px] font-black uppercase text-[#A6D608] hover:text-[#8ab506] hover:bg-transparent px-0 flex items-center gap-1 cursor-pointer"
             >
                Mark all read <CheckCheck size={12} />
             </Button>
           )}
        </div>

        <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-gray-50/70 transition-all border-b border-gray-50 group relative cursor-pointer text-left",
                  !n.read && "bg-[#A6D608]/[0.02]"
                )}
              >
                {!n.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A6D608] rounded-full" />
                )}
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-gray-200 transition-all shadow-inner">
                   {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                     <p className={cn("text-xs font-bold truncate transition-colors", n.read ? "text-gray-500" : "text-gray-900")}>
                       {n.title}
                     </p>
                     <p className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{formatTime(n.createdAt)}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
               <Bell className="w-10 h-10 mb-3 opacity-20 text-[#A6D608]" />
               <p className="text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
           <Link href="/dashboard/vendor/orders" className="text-[10px] font-black uppercase text-[#A6D608] hover:text-[#8ab506] transition-colors">
              Fulfill Orders Screen
           </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
