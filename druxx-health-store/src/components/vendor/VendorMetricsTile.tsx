"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface VendorMetricsTileProps {
  name: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  loading?: boolean;
}

export function VendorMetricsTile({
  name,
  value,
  change,
  trend,
  icon: Icon,
  color,
  loading = false
}: VendorMetricsTileProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden relative">
      <div 
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full group-hover:scale-150 transition-transform duration-500" 
        style={{ backgroundColor: `${color}05` }}
      />
      <div className="relative z-10">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:rotate-6 transition-transform" 
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 italic">{name}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            {loading ? <div className="h-7 w-20 bg-gray-50 animate-pulse rounded-lg" /> : value}
          </h3>
          {!loading && (
            <span className={cn(
              "text-[10px] font-black flex items-center gap-0.5",
              trend === 'up' ? "text-green-500" : "text-red-500"
            )}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
