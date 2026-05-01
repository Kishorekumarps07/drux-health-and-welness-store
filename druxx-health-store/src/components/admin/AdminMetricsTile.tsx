"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface AdminMetricsTileProps {
  name: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  loading?: boolean;
}

export function AdminMetricsTile({
  name,
  value,
  change,
  trend,
  icon: Icon,
  color,
  loading = false
}: AdminMetricsTileProps) {
  return (
    <div className="bg-[#111827] p-5 rounded-xl shadow-sm border border-[#1F2937] hover:border-[#374151] hover:-translate-y-1 hover:shadow-2xl cursor-pointer transition-all duration-300 group overflow-hidden relative">
      <div 
        className="absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" 
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 border shadow-inner group-hover:scale-105 transition-transform" 
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{name}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {loading ? <div className="h-8 w-24 bg-[#1F2937] animate-pulse rounded-lg" /> : value}
          </h3>
          {!loading && (
            <span className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border",
              trend === 'up' ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" : "bg-red-500/10 text-red-400 border-red-500/20"
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
