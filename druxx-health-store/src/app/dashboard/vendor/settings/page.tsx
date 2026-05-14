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
  const [files, setFiles] = useState<{ logo?: File; banner?: File }>({});
  const [previews, setPreviews] = useState<{ logo?: string; banner?: string }>({});

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
      setPreviews({
        logo: data.storeLogo || "",
        banner: data.storeBanner || ""
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

  const handleFileChange = (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'logo' | 'banner') => {
    setFiles(prev => ({ ...prev, [type]: undefined }));
    setPreviews(prev => ({ ...prev, [type]: "" }));
    setFormData(prev => ({ ...prev, [type === 'logo' ? 'storeLogo' : 'storeBanner']: "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.append('storeName', formData.storeName);
      uploadData.append('storeDescription', formData.storeDescription);
      uploadData.append('gstNumber', formData.gstNumber);
      
      if (files.logo) uploadData.append('logo', files.logo);
      else if (previews.logo === "") uploadData.append('storeLogo', ""); // Signal deletion

      if (files.banner) uploadData.append('banner', files.banner);
      else if (previews.banner === "") uploadData.append('storeBanner', ""); // Signal deletion

      await vendorService.updateProfile(uploadData);
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
                             {previews.logo ? (
                                <img 
                                  src={previews.logo} 
                                  alt="Store Logo"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                />
                             ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                   <ImageIcon size={32} />
                                   <span className="text-[8px] font-black uppercase mt-2">No Logo</span>
                                </div>
                             )}
                             <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <ImageIcon className="text-white w-6 h-6" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleFileChange('logo', e)}
                                />
                             </label>
                          </div>
                          {previews.logo && (
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => removeImage('logo')}
                               className="w-full h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase gap-1.5"
                             >
                                <Trash2 size={12} /> Remove
                             </Button>
                          )}
                       </div>
                       <div className="flex-1 space-y-4 pt-1">
                          <p className="text-sm font-black text-gray-800">Logo Branding</p>
                          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Recommended dimensions: 512x512.</p>
                             <div className="flex flex-wrap gap-2">
                                <Badge className="bg-[#A6D608]/10 text-[#A6D608] hover:bg-[#A6D608]/10 border-none font-black text-[8px]">CLOUDINARY STORAGE</Badge>
                                <Badge className="bg-blue-50 text-blue-500 hover:bg-blue-50 border-none font-black text-[8px]">SVG/PNG SUPPORTED</Badge>
                             </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full rounded-xl border-gray-200 font-black text-xs hover:bg-white"
                            onClick={() => document.getElementById('logo-input')?.click()}
                          >
                             Choose New Logo
                             <input 
                               id="logo-input"
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               onChange={(e) => handleFileChange('logo', e)}
                             />
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Store Banner</label>
                          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">1920x400 Recommended</span>
                       </div>
                       <div className="w-full h-48 rounded-[2rem] bg-gray-50 border-4 border-white shadow-lg overflow-hidden relative group">
                          {previews.banner ? (
                             <img 
                               src={previews.banner} 
                               alt="Store Banner"
                               className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                             />
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <ImageIcon size={48} />
                                <span className="text-[10px] font-black uppercase mt-2 tracking-widest">No Banner Selected</span>
                             </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4">
                             <Button 
                               onClick={() => document.getElementById('banner-input')?.click()}
                               variant="outline" 
                               className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-xl font-black text-xs uppercase tracking-widest backdrop-blur-md"
                             >
                                <input 
                                  id="banner-input"
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleFileChange('banner', e)}
                                />
                                Change Banner
                             </Button>
                             {previews.banner && (
                                <Button 
                                  onClick={() => removeImage('banner')}
                                  className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest backdrop-blur-md"
                                >
                                   Delete
                                </Button>
                             )}
                          </div>
                       </div>
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
