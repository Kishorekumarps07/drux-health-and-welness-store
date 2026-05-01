"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Package, 
  UserPlus, 
  ShieldAlert, 
  Clock, 
  CheckCheck,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'vendor' | 'security';
  read: boolean;
  link: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { 
    id: '1', 
    title: 'New High-Value Order', 
    description: 'Order #DRX-8821 received for ₹12,450', 
    time: '2 mins ago', 
    type: 'order', 
    read: false, 
    link: '/dashboard/admin/orders' 
  },
  { 
    id: '2', 
    title: 'Vendor Registration', 
    description: 'Wellness Roots is requesting store approval', 
    time: '15 mins ago', 
    type: 'vendor', 
    read: false, 
    link: '/dashboard/admin/vendors' 
  },
  { 
    id: '3', 
    title: 'Security Alert', 
    description: '3 failed login attempts from IP 192.168.1.45', 
    time: '1 hour ago', 
    type: 'security', 
    read: false, 
    link: '/dashboard/admin/audit-logs' 
  },
  { 
    id: '4', 
    title: 'System Update', 
    description: 'Monthly performance report is ready', 
    time: '4 hours ago', 
    type: 'order', 
    read: true, 
    link: '/dashboard/admin' 
  },
];

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return <Package className="text-blue-400" size={16} />;
      case 'vendor': return <UserPlus className="text-emerald-400" size={16} />;
      case 'security': return <ShieldAlert className="text-red-400" size={16} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative cursor-pointer group p-2 hover:bg-[#1F2937]/50 rounded-xl transition-colors outline-none border-none">
        <Bell className="w-5 h-5 text-[#9CA3AF] group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981] animate-pulse"></span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] bg-[#0B0F14] border-[#1F2937] p-0 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]/50">
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications</h3>
              <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest mt-0.5">{unreadCount} Unread Alerts</p>
           </div>
           {unreadCount > 0 && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={markAllRead}
               className="h-8 text-[10px] font-black uppercase text-[#10B981] hover:text-[#059669] hover:bg-transparent px-0"
             >
                Mark all as read <CheckCheck size={12} className="ml-1.5" />
             </Button>
           )}
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <Link 
                key={n.id} 
                href={n.link}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-[#111827] transition-all border-b border-[#1F2937] group relative",
                  !n.read && "bg-blue-500/[0.02]"
                )}
              >
                {!n.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                )}
                <div className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center shrink-0 group-hover:border-[#374151] transition-all shadow-inner">
                   {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                     <p className={cn("text-xs font-bold truncate transition-colors", n.read ? "text-[#9CA3AF]" : "text-white")}>
                       {n.title}
                     </p>
                     <p className="text-[9px] text-[#4B5563] font-bold whitespace-nowrap">{n.time}</p>
                  </div>
                  <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed mt-1 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight size={14} className="text-[#374151]" />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-[#4B5563]">
               <Bell className="w-10 h-10 mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest">No active alerts</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#111827]/30 text-center border-t border-[#1F2937]">
           <Link href="/dashboard/admin/audit-logs" className="text-[10px] font-black uppercase text-[#4B5563] hover:text-white transition-colors">
              View Comprehensive System Logs
           </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
