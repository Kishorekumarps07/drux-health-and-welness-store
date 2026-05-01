"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  ArrowDownLeft,
  ArrowUpRight,
  User,
  MoreVertical,
  Activity,
  History,
  Copy,
  ExternalLink,
  ChevronRight,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Mock Audit Log Data
const MOCK_LOGS = [
  { id: 'LOG-8821', action: 'LOGIN_SUCCESS', user: 'Admin User', role: 'SUPER_ADMIN', detail: 'Successful system login from IP 192.168.1.1', time: '2 mins ago', type: 'security', metadata: { ip: '192.168.1.1', browser: 'Chrome/120' } },
  { id: 'LOG-8822', action: 'VENDOR_APPROVED', user: 'Test Admin', role: 'ADMIN', detail: 'Approved Organic Farm Co application', time: '15 mins ago', type: 'action', metadata: { vendorId: 'vnd_9921', adminId: 'adm_1' } },
  { id: 'LOG-8823', action: 'PRODUCT_DELETED', user: 'Test Admin', role: 'ADMIN', detail: 'Removed product "Outdated Supplement X"', time: '1 hour ago', type: 'warning', metadata: { productId: 'prd_772', sku: 'OUT-SUPP' } },
  { id: 'LOG-8824', action: 'ORDER_REFUNDED', user: 'System', role: 'AUTOMATION', detail: 'Refund processed for #DRX-7721 (₹2,450)', time: '3 hours ago', type: 'financial', metadata: { orderId: 'DRX-7721', amount: 2450 } },
  { id: 'LOG-8825', action: 'USER_ROLE_CHANGE', user: 'Admin User', role: 'SUPER_ADMIN', detail: 'Promoted user alex@example.com to VENDOR', time: '5 hours ago', type: 'security', metadata: { targetUser: 'alex@example.com', oldRole: 'CUSTOMER', newRole: 'VENDOR' } },
  { id: 'LOG-8826', action: 'CONFIG_UPDATE', user: 'Admin User', role: 'SUPER_ADMIN', detail: 'Updated platform commission rate to 12%', time: 'Yesterday', type: 'action', metadata: { key: 'PLATFORM_COMMISSION', value: 12 } },
];

export default function AuditLogsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = React.useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchesFilter = filter === "all" || log.type === filter;
      const matchesSearch = 
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const handleExportCSV = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
       loading: 'Generating encrypted audit report...',
       success: () => {
          // Simulate download
          const blob = new Blob(["ID,Action,User,Detail,Time\n" + filteredLogs.map(l => `${l.id},${l.action},${l.user},${l.detail},${l.time}`).join("\n")], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.setAttribute('hidden', '');
          a.setAttribute('href', url);
          a.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return 'Audit report downloaded successfully';
       },
       error: 'Export failed'
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Log ID copied to clipboard", { description: id });
  };

  const handleViewMetadata = (log: any) => {
    toast.info(`Metadata for ${log.id}`, {
      description: JSON.stringify(log.metadata, null, 2),
      duration: 5000,
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldCheck className="text-purple-400" size={16} />;
      case 'warning': return <Activity className="text-red-400" size={16} />;
      case 'financial': return <ArrowDownLeft className="text-emerald-400" size={16} />;
      default: return <History className="text-blue-400" size={16} />;
    }
  };

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'security': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case 'warning': return "bg-red-500/10 text-red-400 border-red-500/20";
      case 'financial': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-x-hidden">
        <div>
           <div className="flex items-center gap-3 text-[#10B981] mb-2">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security & Governance</span>
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Audit <span className="text-[#10B981]">Trail</span></h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Immutable log of all administrative actions and system events.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            onClick={() => toast.loading("Fetching date-series distributions...")}
            className="rounded-xl border-[#1F2937] text-[#9CA3AF] hover:bg-[#1F2937] font-bold h-11 px-6 active:scale-95 transition-all"
           >
              <Calendar size={16} className="mr-2" />
              Date Range
           </Button>
           <Button 
            onClick={handleExportCSV}
            className="rounded-xl bg-[#10B981] text-white hover:bg-[#059669] font-bold h-11 px-6 active:scale-95 transition-all gap-2"
           >
              <Download size={16} />
              Export CSV
           </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111827] border border-[#1F2937] rounded-2xl w-fit">
        {['all', 'security', 'action', 'financial'].map((t) => (
          <button
            key={t}
            onClick={() => {
               setFilter(t);
               toast.info(`Auditing: ${t.toUpperCase()} channel isolated`);
            }}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
              filter === t 
                ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20" 
                : "text-[#4B5563] hover:text-[#9CA3AF]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#10B981]/50 outline-none transition-all placeholder:text-[#4B5563]"
              />
           </div>
           <Button 
            variant="ghost" 
            onClick={() => setSearchQuery("")}
            className="h-10 w-10 p-0 text-[#4B5563] hover:text-white rounded-xl"
           >
              <Filter size={18} />
           </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B0F14]/50 border-b border-[#1F2937]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Event Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Actor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#4B5563]">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center group-hover:border-[#10B981]/30 transition-all">
                          {getLogIcon(log.type)}
                       </div>
                       <Badge variant="outline" className={cn("rounded-md uppercase text-[9px] font-black px-2 py-0.5", getLogBadge(log.type))}>
                         {log.action}
                       </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center border border-[#374151]">
                          <User size={14} className="text-[#9CA3AF]" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white tracking-tight">{log.user}</p>
                          <p className="text-[9px] text-[#4B5563] font-black uppercase tracking-widest">{log.role}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#9CA3AF] font-medium max-w-md truncate">{log.detail}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-bold">
                    {log.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                       <DropdownMenuTrigger className="p-2 text-[#374151] hover:text-white transition-colors outline-none">
                          <MoreVertical size={16} />
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 bg-[#0B0F14] border-[#1F2937] text-[#9CA3AF] rounded-xl shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-[#4B5563] px-3 py-2">Audit Utility</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewMetadata(log)} className="gap-2 focus:bg-[#111827] focus:text-white cursor-pointer py-2">
                             <Activity size={14} /> View Metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyId(log.id)} className="gap-2 focus:bg-[#111827] focus:text-white cursor-pointer py-2">
                             <Copy size={14} /> Copy Log ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#1F2937]" />
                          <DropdownMenuItem onClick={() => setSearchQuery(log.user)} className="gap-2 focus:bg-[#111827] focus:text-[#10B981] cursor-pointer py-2">
                             <User size={14} /> Filter by Actor
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 focus:bg-red-500/10 focus:text-red-400 cursor-pointer py-2">
                             <ShieldCheck size={14} /> Flag for Review
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <Search className="text-[#1F2937]" size={32} />
                          <p className="text-[#4B5563] font-black uppercase tracking-widest text-xs">No administrative events found</p>
                       </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 bg-[#111827] border border-[#1F2937] rounded-2xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center border border-[#10B981]/20">
               <ShieldCheck className="text-[#10B981]" size={20} />
            </div>
            <div>
               <p className="text-sm font-bold text-white tracking-tight">Security Hardening Active</p>
               <p className="text-xs text-[#4B5563] font-medium">All sessions are currently being monitored for suspicious activity.</p>
            </div>
         </div>
         <Button variant="ghost" className="rounded-xl font-bold text-[#10B981] hover:bg-[#10B981]/10 px-6">
            Privacy Policy <ArrowUpRight size={14} className="ml-2" />
         </Button>
      </div>
    </div>
  );
}
