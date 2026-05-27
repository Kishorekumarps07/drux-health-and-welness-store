"use client";

import { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Save,
  XCircle,
  Percent,
  CheckCircle,
  X,
  AlertCircle
} from "lucide-react";
import { couponService, Coupon } from "@/services/couponService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState<{ 
    code: string; 
    discountPercent: number; 
    isActive: boolean;
    applicabilityType: "ALL" | "PRODUCT" | "VENDOR";
    productId: string | null;
    vendorId: string | null;
  }>({ 
    code: "", 
    discountPercent: 10, 
    isActive: true,
    applicabilityType: "ALL",
    productId: null,
    vendorId: null
  });
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCoupons();

    const loadTargets = async () => {
      try {
        const { productService } = await import("@/services/productService");
        const { vendorService } = await import("@/services/vendorService");
        
        const productsRes = await productService.getAllProducts({ limit: 150 });
        const vendorsRes = await vendorService.getAllVendors({ limit: 100 });
        
        setProducts(productsRes.products.map((p: any) => ({ id: p.id, name: p.name })));
        setVendors(vendorsRes.vendors.map((v: any) => ({ id: v.id, name: v.name })));
      } catch (error) {
        console.error("Failed to load coupon targets:", error);
      }
    };
    loadTargets();
  }, []);

  const handleSave = async () => {
    if (!formData.code || !formData.discountPercent) {
      toast.error("Code and Discount Percentage are required");
      return;
    }

    const pct = Number(formData.discountPercent);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    const productId = formData.applicabilityType === "PRODUCT" ? formData.productId : null;
    const vendorId = formData.applicabilityType === "VENDOR" ? formData.vendorId : null;

    if (formData.applicabilityType === "PRODUCT" && !productId) {
      toast.error("Please select a target product");
      return;
    }
    if (formData.applicabilityType === "VENDOR" && !vendorId) {
      toast.error("Please select a target vendor");
      return;
    }

    const loadingToast = toast.loading(editingId === "new" ? "Creating coupon..." : "Updating coupon...");
    try {
      if (editingId === "new") {
        await couponService.createCoupon({
          code: formData.code.toUpperCase().trim(),
          discountPercent: pct,
          isActive: formData.isActive,
          productId,
          vendorId
        });
        toast.success("Coupon created successfully", { id: loadingToast });
      } else {
        await couponService.updateCoupon(editingId!, {
          code: formData.code.toUpperCase().trim(),
          discountPercent: pct,
          isActive: formData.isActive,
          productId,
          vendorId
        });
        toast.success("Coupon updated successfully", { id: loadingToast });
      }
      setEditingId(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Operation failed", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    
    const loadingToast = toast.loading("Removing coupon...");
    try {
      await couponService.deleteCoupon(id);
      toast.success("Coupon removed", { id: loadingToast });
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete", { id: loadingToast });
    }
  };

  if (!mounted) return null;

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Tag className="text-[#10B981]" />
             Coupon <span className="text-[#10B981]">Manager</span>
           </h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Configure and manage promo discount coupon codes.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId("new");
            setFormData({ 
              code: "", 
              discountPercent: 10, 
              isActive: true,
              applicabilityType: "ALL",
              productId: null,
              vendorId: null
            });
          }}
          className="bg-[#10B981] hover:bg-[#059669] rounded-xl h-12 gap-2 font-bold px-6 shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Create New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] group-focus-within:text-[#10B981] transition-colors" />
            <input 
              type="text" 
              placeholder="Search coupons by code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-2xl pl-12 pr-4 py-4 text-white focus:border-[#10B981]/50 outline-none transition-all placeholder:text-[#4B5563]"
            />
          </div>

          <div className="grid gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-[#111827] animate-pulse rounded-2xl border border-[#1F2937]" />
              ))
            ) : filteredCoupons.map((c) => (
              <div 
                key={c.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all group flex items-center gap-6",
                  editingId === c.id ? "bg-[#1F2937] border-[#10B981]" : "bg-[#111827] border-[#1F2937] hover:border-[#374151]"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center shrink-0">
                  <Percent className="text-[#10B981]" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-mono font-bold text-lg tracking-wider truncate uppercase">{c.code}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                      c.isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs font-bold text-[#10B981]">{c.discountPercent}% Discount</p>
                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Added {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-2">
                    {c.productId && c.product?.title ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider">
                        Target: {c.product.title}
                      </span>
                    ) : c.vendorId && c.vendor?.storeName ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider">
                        Vendor: {c.vendor.storeName}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[9px] font-bold uppercase tracking-wider">
                        Store-wide
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingId(c.id);
                      setFormData({ 
                        code: c.code, 
                        discountPercent: c.discountPercent, 
                        isActive: c.isActive,
                        applicabilityType: c.productId ? "PRODUCT" : c.vendorId ? "VENDOR" : "ALL",
                        productId: c.productId || null,
                        vendorId: c.vendorId || null
                      });
                    }}
                    className="p-3 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all border border-transparent hover:border-[#10B981]/20"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-3 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredCoupons.length === 0 && (
              <div className="p-20 rounded-3xl border border-dashed border-[#1F2937] flex flex-col items-center justify-center text-center">
                <Tag size={48} className="text-[#1F2937] mb-4" />
                <p className="text-[#4B5563] font-bold uppercase tracking-widest">No coupons found</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
           <div className={cn(
             "sticky top-32 p-8 rounded-3xl border bg-[#111827] shadow-2xl transition-all",
             editingId ? "border-[#10B981]/50 opacity-100 translate-y-0" : "border-[#1F2937] opacity-50 translate-y-4 pointer-events-none"
           )}>
             {!editingId ? (
               <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Tag size={40} className="text-[#1F2937] mb-4" />
                  <p className="text-[#4B5563] font-bold">Select a coupon to edit or click create new.</p>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                      {editingId === "new" ? "Create New Coupon" : "Edit Coupon"}
                    </h3>
                    <button onClick={() => setEditingId(null)} className="text-[#4B5563] hover:text-white transition-colors">
                      <XCircle size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                          Coupon Code
                        </label>
                        <input 
                          type="text" 
                          value={formData.code} 
                          placeholder="e.g. SPECIAL30"
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white font-mono font-bold tracking-wider text-sm focus:border-[#10B981] outline-none transition-all placeholder:text-[#374151] uppercase"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                          Discount Percentage
                        </label>
                        <input 
                          type="number" 
                          value={formData.discountPercent} 
                          placeholder="15"
                          min="1"
                          max="100"
                          onChange={(e) => setFormData({...formData, discountPercent: Number(e.target.value)})}
                          className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all placeholder:text-[#374151]"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                          Applicability
                        </label>
                        <select
                          value={formData.applicabilityType}
                          onChange={(e) => {
                            const val = e.target.value as "ALL" | "PRODUCT" | "VENDOR";
                            setFormData({
                              ...formData,
                              applicabilityType: val,
                              productId: val === "PRODUCT" ? (products[0]?.id || null) : null,
                              vendorId: val === "VENDOR" ? (vendors[0]?.id || null) : null
                            });
                          }}
                          className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all cursor-pointer"
                        >
                          <option value="ALL">Store-wide (All Products)</option>
                          <option value="PRODUCT">Specific Product</option>
                          <option value="VENDOR">Specific Vendor</option>
                        </select>
                     </div>

                     {formData.applicabilityType === "PRODUCT" && (
                       <div className="space-y-2 animate-in fade-in duration-200">
                          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                            Target Product
                          </label>
                          <select
                            value={formData.productId || ""}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value || null })}
                            className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all cursor-pointer"
                          >
                            <option value="" disabled>-- Select Product --</option>
                            {products.length === 0 ? (
                              <option disabled>Loading products...</option>
                            ) : (
                              products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))
                            )}
                          </select>
                       </div>
                     )}

                     {formData.applicabilityType === "VENDOR" && (
                       <div className="space-y-2 animate-in fade-in duration-200">
                          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                            Target Vendor
                          </label>
                          <select
                            value={formData.vendorId || ""}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value || null })}
                            className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all cursor-pointer"
                          >
                            <option value="" disabled>-- Select Vendor --</option>
                            {vendors.length === 0 ? (
                              <option disabled>Loading vendors...</option>
                            ) : (
                              vendors.map((v) => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))
                            )}
                          </select>
                       </div>
                     )}

                     <div className="flex items-center gap-3 px-1 pt-2">
                        <input 
                          type="checkbox" 
                          id="coupon-active"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded bg-[#0B0F14] border-[#1F2937] text-[#10B981] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="coupon-active" className="text-xs font-bold text-gray-300 cursor-pointer">
                          Active & Usable by Customers
                        </label>
                     </div>
                  </div>

                  <div className="pt-8 flex gap-3">
                     <Button 
                       onClick={handleSave}
                       className="flex-1 bg-[#10B981] hover:bg-[#059669] h-13 rounded-xl font-bold gap-2 text-white shadow-lg shadow-[#10B981]/10 active:scale-95 transition-all"
                     >
                       <Save size={18} /> {editingId === "new" ? "Create Coupon" : "Update Coupon"}
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => setEditingId(null)}
                       className="border-[#1F2937] text-[#9CA3AF] hover:bg-[#1F2937] h-13 rounded-xl px-6 font-bold"
                     >
                       Cancel
                     </Button>
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
