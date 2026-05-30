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
  Calendar,
  Layers,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";
import { couponService, Coupon } from "@/services/couponService";
import { vendorService } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState<{ 
    code: string; 
    discountPercent: number; 
    isActive: boolean;
    applicabilityType: "ALL" | "PRODUCT";
    productId: string | null;
    expiresAt: string;
    usageLimit: string;
  }>({ 
    code: "", 
    discountPercent: 10, 
    isActive: true,
    applicabilityType: "ALL",
    productId: null,
    expiresAt: "",
    usageLimit: ""
  });
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [mounted, setMounted] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getVendorCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await vendorService.getMyProducts({ limit: 100 });
      setProducts(res.products.map((p: any) => ({ id: p.id, title: p.title })));
    } catch (error) {
      console.error("Failed to load vendor products:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCoupons();
    loadProducts();
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const discount = Number(formData.discountPercent) || 10;
      const res = await couponService.generateVendorCouponCode(discount);
      setFormData(prev => ({ ...prev, code: res.code }));
      toast.success(`Generated unique code: ${res.code}`, {
        icon: <Sparkles className="w-4 h-4 text-[#A6D608]" />
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate coupon code");
    } finally {
      setGenerating(false);
    }
  };

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

    if (formData.applicabilityType === "PRODUCT" && !productId) {
      toast.error("Please select a target product");
      return;
    }

    const dataPayload = {
      code: formData.code.toUpperCase().trim(),
      discountPercent: pct,
      isActive: formData.isActive,
      productId,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null
    };

    const loadingToast = toast.loading(editingId === "new" ? "Creating coupon..." : "Updating coupon...");
    try {
      if (editingId === "new") {
        await couponService.createVendorCoupon(dataPayload);
        toast.success("Coupon created successfully", { id: loadingToast });
      } else {
        await couponService.updateVendorCoupon(editingId!, dataPayload);
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
      await couponService.deleteVendorCoupon(id);
      toast.success("Coupon removed", { id: loadingToast });
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete", { id: loadingToast });
    }
  };

  if (!mounted) return null;

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "ALL" 
      ? true 
      : filterStatus === "ACTIVE" 
        ? c.isActive 
        : !c.isActive;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Tag className="text-[#A6D608] w-8 h-8" />
            Coupon <span className="text-[#A6D608]">Manager</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            Boost sales and offer custom discounts on your products
          </p>
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
              expiresAt: "",
              usageLimit: ""
            });
          }}
          className="bg-[#A6D608] hover:bg-[#8ebb06] text-white rounded-xl h-12 gap-2 font-bold px-6 shadow-lg shadow-[#A6D608]/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Create Custom Coupon
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Coupon List Area */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
              <input 
                type="text" 
                placeholder="Search coupons by code..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:border-[#A6D608]/50 outline-none transition-all placeholder:text-gray-400 text-sm font-semibold shadow-sm"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    filterStatus === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          <div className="grid gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-gray-100 shadow-sm" />
              ))
            ) : filteredCoupons.map((c) => (
              <div 
                key={c.id}
                className={cn(
                  "p-5 rounded-2xl border bg-white transition-all group flex items-center gap-6 shadow-sm",
                  editingId === c.id ? "border-[#A6D608] ring-2 ring-[#A6D608]/10" : "border-gray-100 hover:border-gray-300"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-inner">
                  <Percent className="text-[#A6D608]" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-gray-900 font-mono font-black text-lg tracking-wider truncate uppercase">{c.code}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                      c.isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                    )}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <p className="font-bold text-[#A6D608]">{c.discountPercent}% Discount</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Added {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Targets & metadata tags */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-2.5">
                    {c.productId && c.product?.title ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-black uppercase tracking-wider">
                        Product: {c.product.title}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 text-[9px] font-black uppercase tracking-wider">
                        Store-wide (All Products)
                      </span>
                    )}

                    {/* Expiry display */}
                    {(c as any).expiresAt && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={10} /> Exp: {new Date((c as any).expiresAt).toLocaleDateString()}
                      </span>
                    )}

                    {/* Usage display */}
                    {(c as any).usageLimit !== null && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Layers size={10} /> Limit: {(c as any).usageLimit}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingId(c.id);
                      setFormData({ 
                        code: c.code, 
                        discountPercent: c.discountPercent, 
                        isActive: c.isActive,
                        applicabilityType: c.productId ? "PRODUCT" : "ALL",
                        productId: c.productId || null,
                        expiresAt: (c as any).expiresAt ? new Date((c as any).expiresAt).toISOString().split('T')[0] : "",
                        usageLimit: (c as any).usageLimit !== null ? String((c as any).usageLimit) : ""
                      });
                    }}
                    className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:text-[#A6D608] hover:bg-[#A6D608]/10 transition-all border border-gray-100 hover:border-[#A6D608]/20"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100 hover:border-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredCoupons.length === 0 && (
              <div className="p-20 rounded-3xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-center">
                <Tag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No coupons matching criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel Form Area */}
        <div className="col-span-12 lg:col-span-5">
          <div className={cn(
            "sticky top-32 p-8 rounded-3xl border bg-white shadow-xl transition-all",
            editingId ? "border-gray-200 opacity-100 translate-y-0" : "border-gray-100 opacity-50 translate-y-4 pointer-events-none"
          )}>
            {!editingId ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Tag size={40} className="text-gray-200 mb-4 animate-bounce duration-1000" />
                <p className="text-gray-400 font-bold text-sm">Select a coupon to edit or click custom coupon to start building.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <Tag size={20} className="text-[#A6D608]" />
                    {editingId === "new" ? "Build Custom Coupon" : "Modify Coupon"}
                  </h3>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Coupon Code Input + Dynamic Generator */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.code} 
                        placeholder="e.g. WELLNESS20"
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono font-bold tracking-wider text-sm focus:border-[#A6D608] outline-none transition-all placeholder:text-gray-300 uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleGenerateCode}
                        disabled={generating}
                        className="bg-gray-100 hover:bg-[#A6D608]/10 text-gray-700 hover:text-[#A6D608] border border-gray-200 hover:border-[#A6D608]/30 rounded-xl h-11 px-4 gap-2 font-bold transition-all shrink-0 active:scale-95 shadow-sm"
                      >
                        <Sparkles size={14} className={cn("text-[#A6D608]", generating && "animate-spin")} />
                        Generate
                      </Button>
                    </div>
                    <p className="text-[9px] text-gray-400 px-1 font-semibold">
                      Generates a dynamic code prefixed with your store identifier automatically.
                    </p>
                  </div>

                  {/* Discount percentage */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Discount Percentage
                    </label>
                    <input 
                      type="number" 
                      value={formData.discountPercent} 
                      placeholder="15"
                      min="1"
                      max="100"
                      onChange={(e) => setFormData({...formData, discountPercent: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:border-[#A6D608] outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Applicability selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Applicability
                    </label>
                    <select
                      value={formData.applicabilityType}
                      onChange={(e) => {
                        const val = e.target.value as "ALL" | "PRODUCT";
                        setFormData({
                          ...formData,
                          applicabilityType: val,
                          productId: val === "PRODUCT" ? (products[0]?.id || null) : null
                        });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:border-[#A6D608] outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">Store-wide (All Products)</option>
                      <option value="PRODUCT">Specific Product</option>
                    </select>
                  </div>

                  {/* Product selector if specific product is selected */}
                  {formData.applicabilityType === "PRODUCT" && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        Select Target Product
                      </label>
                      <select
                        value={formData.productId || ""}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value || null })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:border-[#A6D608] outline-none transition-all cursor-pointer"
                      >
                        <option value="" disabled>-- Select Product --</option>
                        {products.length === 0 ? (
                          <option disabled>No products uploaded yet</option>
                        ) : (
                          products.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Expiration Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:border-[#A6D608] outline-none transition-all cursor-pointer"
                    />
                  </div>

                  {/* Usage limit */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Usage Limit (Optional)
                    </label>
                    <input 
                      type="number" 
                      value={formData.usageLimit}
                      placeholder="e.g. 50 times maximum"
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-sm focus:border-[#A6D608] outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Active Toggle Checkbox */}
                  <div className="flex items-center gap-3 px-1 pt-2">
                    <input 
                      type="checkbox" 
                      id="coupon-active"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded bg-gray-50 border-gray-200 text-[#A6D608] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="coupon-active" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                      Active and usable by customers immediately
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-8 flex gap-3">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-[#A6D608] hover:bg-[#8ebb06] h-12 rounded-xl font-bold gap-2 text-white shadow-lg shadow-[#A6D608]/10 active:scale-95 transition-all"
                  >
                    <Save size={18} /> {editingId === "new" ? "Publish Coupon" : "Update Coupon"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    className="border-gray-200 text-gray-500 hover:bg-gray-50 h-12 rounded-xl px-6 font-bold"
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
