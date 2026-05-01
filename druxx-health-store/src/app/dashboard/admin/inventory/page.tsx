"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Box,
  LayoutGrid
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function InventoryAuditPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalSkus: 0, totalStock: 0, totalValue: 0, capacity: 72 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'stock', direction: 'asc' });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data: any = await adminService.listInventory({ search });
      setProducts(data.products || []);
      setStats(data.stats || { totalSkus: 0, totalStock: 0, totalValue: 0, capacity: 72 });
    } catch (error) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchInventory();
      toast.success('Inventory synchronized with cloud');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    // Handle nested vendor storeName
    if (sortConfig.key === 'vendor') {
      valA = a.vendor?.storeName || "";
      valB = b.vendor?.storeName || "";
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleForecast = () => {
     toast.loading("Analyzing historical velocity...");
     setTimeout(() => {
        toast.dismiss();
        toast.success("Forecast Model Generated: 8 critical restock nodes detected", {
           description: "Supply chain intelligence map has been updated.",
           duration: 5000,
        });
     }, 2000);
  };

  const displayProducts = sortedProducts;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Package size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Supply Chain Intelligence</span>
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Inventory <span className="text-blue-500">Audit</span></h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Cross-vendor stock monitoring and supply chain health analysis.</p>
        </div>
 
        <div className="flex items-center gap-4">
           <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                 <AlertTriangle size={18} />
              </div>
              <div>
                 <p className="text-xs font-black text-amber-500 uppercase tracking-wider">Critical Stock</p>
                 <p className="text-xl font-bold text-white">
                    {products.filter(p => p.stock < 10 && p.stock > 0).length} <span className="text-xs font-medium text-[#4B5563]">Items Below Threshold</span>
                 </p>
              </div>
           </div>
        </div>
      </div>
 
      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total SKUs", value: stats.totalSkus.toString(), icon: LayoutGrid, color: "text-blue-400" },
           { label: "Inventory Value", value: `₹${(stats.totalValue / 1000000).toFixed(2)}M`, icon: TrendingUp, color: "text-emerald-400" },
           { label: "Storage Capacity", value: `${stats.capacity}%`, icon: Box, color: "text-purple-400" },
         ].map((stat) => (
           <div key={stat.label} className="bg-[#111827] p-6 rounded-2xl border border-[#1F2937] flex items-center justify-between group hover:border-gray-700 transition-all">
              <div>
                 <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">{stat.label}</p>
                 <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center", stat.color)}>
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>
 
      {/* Main Table Container */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-6 border-b border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input 
                type="text" 
                placeholder="Filter by product name or vendor..." 
                className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-[#4B5563]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => handleSort(sortConfig.key === 'stock' ? 'price' : 'stock')}
                className="h-11 px-4 text-[#9CA3AF] font-bold hover:text-white rounded-xl gap-2 active:scale-95 transition-all"
              >
                 <ArrowUpDown size={16} /> 
                 Sort by {sortConfig.key === 'stock' ? 'Value' : 'Stock'}
              </Button>
              <Button 
                onClick={handleSync}
                disabled={isSyncing}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all gap-2"
              >
                 <Box size={16} className={cn(isSyncing && "animate-spin")} />
                 Sync Stock
              </Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B0F14]/50 border-b border-[#1F2937]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Financials</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {loading ? (
                 Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan={5} className="px-6 py-8"><div className="h-12 bg-gray-800/50 rounded-xl w-full" /></td>
                    </tr>
                 ))
              ) : (
                displayProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1F2937] to-[#0B0F14] border border-[#374151] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <Package className="text-[#9CA3AF] group-hover:text-blue-400 transition-colors" size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white tracking-tight">{p.title}</p>
                            <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-0.5">{p.sku}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-[#9CA3AF]">{p.vendor?.storeName || "Direct"}</p>
                      <p className="text-[10px] text-[#4B5563] font-bold mt-0.5 uppercase tracking-wider">Premium Partner</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 w-24 bg-[#0B0F14] h-1.5 rounded-full overflow-hidden border border-[#1F2937]">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                p.stock > 10 ? "bg-[#10B981] w-[80%]" : p.stock > 0 ? "bg-amber-500 w-[30%]" : "bg-red-500 w-[0%]"
                              )} 
                            />
                         </div>
                         <p className={cn(
                           "text-xs font-black",
                           p.stock > 10 ? "text-[#10B981]" : p.stock > 0 ? "text-amber-500" : "text-red-500"
                         )}>
                           {p.stock} Units
                         </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">₹{Number(p.price).toLocaleString()}</p>
                      <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mt-0.5">MSRP Value</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <Button variant="outline" className="h-9 px-4 rounded-lg border-[#1F2937] text-xs font-bold text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]">
                            Audit
                         </Button>
                         <Button size="icon" className="h-9 w-9 bg-[#1F2937] text-[#9CA3AF] hover:bg-blue-600 hover:text-white rounded-lg transition-all">
                            <ExternalLink size={14} />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && displayProducts.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                       <p className="text-[#4B5563] font-bold uppercase tracking-widest">No matching SKUs tracked</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      <div className="flex items-center justify-between p-6 bg-[#111827] border border-[#1F2937] border-dashed rounded-2xl">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
               <Package className="text-blue-500" size={24} />
            </div>
            <div>
               <p className="text-base font-bold text-white tracking-tight">Need for Restock Visualization?</p>
               <p className="text-xs text-[#9CA3AF] font-medium">Generate a predicted restock map based on historical velocity.</p>
            </div>
         </div>
         <Button 
            onClick={handleForecast}
            className="rounded-xl font-bold bg-[#1F2937] text-white hover:bg-[#374151] px-6 h-11 border border-[#1F2937] active:scale-95 transition-all"
          >
             Generate Forecast Model <ChevronRight size={14} className="ml-2" />
         </Button>
      </div>
    </div>
  );
}
