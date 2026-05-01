"use client";

import { 
  Package, 
  UserPlus, 
  Store, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  type: 'ORDER' | 'USER' | 'VENDOR';
  title: string;
  user?: string;
  date: string;
  amount?: number;
  status?: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return Package;
      case 'USER': return UserPlus;
      case 'VENDOR': return Store;
      default: return AlertCircle;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'ORDER': return "text-[#0ea5e9] bg-[#0ea5e9]/10";
      case 'USER': return "text-[#A6D608] bg-[#A6D608]/10";
      case 'VENDOR': return "text-[#8b5cf6] bg-[#8b5cf6]/10";
      default: return "text-gray-400 bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((item, i) => {
        const Icon = getIcon(item.type);
        const colorClass = getColors(item.type);
        
        return (
          <div key={i} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", colorClass)}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-gray-900 truncate">{item.title}</p>
                {item.amount && (
                  <span className="text-sm font-black text-gray-900 shrink-0">₹{item.amount.toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs font-medium text-gray-500 truncate italic">
                  {item.user ? `by ${item.user}` : 'Platform event'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  <Clock className="w-3 h-3" />
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {activities.length === 0 && (
        <div className="py-10 text-center">
           <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
           <p className="text-sm text-gray-400 font-medium">No recent activity detected.</p>
        </div>
      )}
    </div>
  );
}
