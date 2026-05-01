"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  Store, 
  Image as ImageIcon, 
  Globe, 
  ShieldCheck, 
  Save,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function VendorSettingsPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    storeLogo: "",
    storeBanner: "",
    gstNumber: ""
  });

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getMyApplication();
      setVendor(data);
      setFormData({
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || "",
        storeLogo: data.storeLogo || "",
        storeBanner: data.storeBanner || "",
        gstNumber: data.gstNumber || ""
      });
    } catch (error) {
      toast.error("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vendorService.updateProfile(formData);
      toast.success("Store configuration updated successfully");
      fetchVendor();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-gray-100 rounded-2xl" />
        <div className="h-[500px] bg-gray-50 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 italic">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Store <span className="text-[#A6D608]">Settings</span></h1>
            <p className="text-gray-500 font-medium mt-1">Configure your brand identity and public profile appearance.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button asChild variant="outline" className="rounded-2xl h-12 px-5 font-black gap-2 border-gray-200">
                <Link href={`/vendors/${vendor?.storeSlug}`} target="_blank">
                   <Globe className="w-4 h-4" />
                   View Public Store
                </Link>
             </Button>
             <Button 
               onClick={handleSave}
               disabled={saving}
               className="rounded-2xl h-12 px-6 font-black bg-[#A6D608] text-white hover:bg-[#95c207] shadow-xl shadow-[#A6D608]/20 transition-all active:scale-95 disabled:opacity-50"
             >
                {saving ? "Saving Changes..." : "Save Configuration"}
                {!saving && <Save className="ml-2 w-4 h-4" />}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           {/* Primary Configuration */}
           <div className="xl:col-span-2 space-y-8">
              <Card className="rounded-[3rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white">
                 <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Store Identity</h3>
                 
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Store Name</label>
                          <Input 
                            value={formData.storeName}
                            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-gray-800 focus:bg-white transition-all px-6"
                            placeholder="e.g. Wellness Hub"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">GST Identification (Optional)</label>
                          <Input 
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-gray-800 focus:bg-white transition-all px-6"
                            placeholder="e.g. 22AAAAA0000A1Z5"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Store Bio / Description</label>
                       <Textarea 
                         value={formData.storeDescription}
                         onChange={(e) => setFormData({...formData, storeDescription: e.target.value})}
                         className="min-h-[150px] rounded-[2rem] border-gray-100 bg-gray-50/50 font-bold text-gray-800 focus:bg-white transition-all p-6 leading-relaxed"
                         placeholder="Describe your health mission and product quality standards..."
                       />
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2">This is displayed on your public store and product pages.</p>
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[3rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white">
                 <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Visual Branding</h3>
                 
                 <div className="space-y-10">
                    <div className="flex flex-col md:flex-row items-start gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Shop Logo</label>
                          <div className="w-32 h-32 rounded-3xl bg-gray-50 border-4 border-white shadow-lg overflow-hidden relative group">
                             <img 
                               src={formData.storeLogo || "https://api.dicebear.com/7.x/identicon/svg?seed=Store"} 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="text-white w-6 h-6" />
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4 pt-1">
                          <p className="text-sm font-black text-gray-800">Logo Image URL</p>
                          <Input 
                            value={formData.storeLogo}
                            onChange={(e) => setFormData({...formData, storeLogo: e.target.value})}
                            className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-medium px-4"
                            placeholder="https://example.com/logo.png"
                          />
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                             <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                             <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tighter leading-tight">Recommended dimensions: 512x512. Standard PNG or SVG formats only.</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Store Banner</label>
                          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">1920x400 Recommended</span>
                       </div>
                       <div className="w-full h-48 rounded-[2rem] bg-gray-50 border-4 border-white shadow-lg overflow-hidden relative group">
                          <img 
                            src={formData.storeBanner || "https://images.unsplash.com/photo-1506784919140-50cf144ad310"} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">
                             <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-xl font-black text-xs uppercase tracking-widest backdrop-blur-md">
                                Change Banner
                             </Button>
                          </div>
                       </div>
                       <Input 
                         value={formData.storeBanner}
                         onChange={(e) => setFormData({...formData, storeBanner: e.target.value})}
                         className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-medium px-4 mt-4"
                         placeholder=" Banner Image URL (Publicly accessible)"
                       />
                    </div>
                 </div>
              </Card>
           </div>

           {/* Side Status Panel */}
           <div className="space-y-8">
              <Card className="rounded-[2.5rem] p-8 border-gray-100 shadow-xl shadow-black/5 bg-[#1E1E1E] text-white italic">
                 <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-[#A6D608] w-6 h-6" />
                    Store Compliance
                 </h4>
                 <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-help">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ownership</span>
                       <Badge className="bg-[#A6D608] text-white border-none font-black text-[10px]">VERIFIED</Badge>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-help">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quality Audit</span>
                       <Badge className="bg-blue-500 text-white border-none font-black text-[10px]">PASSED</Badge>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-help">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fulfillment</span>
                       <Badge className="bg-[#A6D608] text-white border-none font-black text-[10px]">EXCELLENT</Badge>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Compliance status is updated based on order delivery accuracy and product quality scores.</p>
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] p-8 border-gray-100 shadow-xl shadow-black/5 bg-white border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Store className="text-gray-300 w-8 h-8" />
                 </div>
                 <h4 className="text-lg font-black text-gray-900 mb-2 italic tracking-tight">Public Presence</h4>
                 <p className="text-xs text-gray-400 font-bold mb-6 italic leading-relaxed px-4">Your store slug is permanently fixed to ensure SEO stability and broken link prevention.</p>
                 <Badge variant="outline" className="rounded-full border-[#A6D608]/20 text-[#A6D608] font-black px-4 py-1.5 bg-[#A6D608]/5">
                    /vendors/{vendor?.storeSlug}
                 </Badge>
              </Card>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
