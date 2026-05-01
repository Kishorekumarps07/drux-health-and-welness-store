"use client";

import { useState, useEffect } from "react";
import { 
  Monitor, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  CheckCircle2, 
  XCircle,
  Save,
  ShieldCheck,
  Smartphone,
  Zap,
  Target,
  Heart
} from "lucide-react";
import { useCMSStore } from "@/store/cmsStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const iconOptions = [
  { value: "shield", label: "Shield", icon: ShieldCheck },
  { value: "smartphone", label: "Smartphone", icon: Smartphone },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "target", label: "Target", icon: Target },
  { value: "heart", label: "Heart", icon: Heart },
];

export default function AdminCMSPage() {
  // Use individual selectors for better reactivity
  const heroSlides = useCMSStore((state) => state.heroSlides);
  const advantages = useCMSStore((state) => state.advantages);
  const loading = useCMSStore((state) => state.loading);
  const fetchCMSData = useCMSStore((state) => state.fetchCMSData);
  const addHeroSlide = useCMSStore((state) => state.addHeroSlide);
  const updateHeroSlide = useCMSStore((state) => state.updateHeroSlide);
  const deleteHeroSlide = useCMSStore((state) => state.deleteHeroSlide);
  const addAdvantage = useCMSStore((state) => state.addAdvantage);
  const updateAdvantage = useCMSStore((state) => state.updateAdvantage);
  const deleteAdvantage = useCMSStore((state) => state.deleteAdvantage);

  const [activeTab, setActiveTab] = useState<"hero" | "advantage">("hero");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [mounted, setMounted] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    fetchCMSData(); // Pull live data from Supabase
  }, [fetchCMSData]);

  const handleSave = async () => {
    if (!formData.title || !formData.image) {
      toast.error("Title and Image URL are required");
      return;
    }

    const loadingToast = toast.loading("Saving changes...");
    try {
      if (activeTab === "hero") {
        if (editingId === "new") {
          await addHeroSlide(formData);
        } else {
          await updateHeroSlide(editingId!, formData);
        }
      } else {
        if (editingId === "new") {
          await addAdvantage(formData);
        } else {
          await updateAdvantage(editingId!, formData);
        }
      }
      toast.success("Saved successfully", { id: loadingToast });
      setEditingId(null);
      setFormData({});
    } catch (error) {
      toast.error("Failed to save changes", { id: loadingToast });
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Deleting item...");
    try {
      if (activeTab === "hero") {
        await deleteHeroSlide(id);
      } else {
        await deleteAdvantage(id);
      }
      toast.success("Item removed", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to delete", { id: loadingToast });
      console.error(error);
    }
  };

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => new Set(prev).add(id));
  };

  if (!mounted) return null;

  const currentItems = activeTab === "hero" ? heroSlides : advantages;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Monitor className="text-[#10B981]" />
             CMS <span className="text-[#10B981]">Management</span>
           </h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Manage live carousel content and platform aesthetics.</p>
        </div>
        <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
          <button 
            onClick={() => setActiveTab("hero")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === "hero" ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20" : "text-[#9CA3AF] hover:text-white"
            )}
          >
            Hero Carousel
          </button>
          <button 
            onClick={() => setActiveTab("advantage")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === "advantage" ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20" : "text-[#9CA3AF] hover:text-white"
            )}
          >
            Advantages
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Live {activeTab === "hero" ? "Slides" : "Cards"}</h2>
            <Button 
              onClick={() => {
                setEditingId("new");
                setFormData(activeTab === "hero" ? { title: "", subtitle: "", image: "", bgColor: "from-[#1E1E1E] to-[#2a2a2a]" } : { title: "", desc: "", image: "", iconType: "shield" });
              }}
              className="bg-[#10B981] hover:bg-[#059669] rounded-xl h-10 gap-2 font-bold"
            >
              <Plus size={18} /> Add New
            </Button>
          </div>

          <div className="grid gap-4">
            {currentItems.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all group flex items-center gap-6",
                  editingId === item.id ? "bg-[#1F2937] border-[#10B981]" : "bg-[#111827] border-[#1F2937] hover:border-[#374151]"
                )}
              >
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 flex items-center justify-center">
                  {(item.image && !brokenImages.has(item.id)) ? (
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover opacity-60" 
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <ImageIcon className="text-[#1F2937]" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{item.title}</h4>
                  <p className="text-[#9CA3AF] text-xs line-clamp-1 mt-1">{(item as any).subtitle || (item as any).desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingId(item.id);
                      setFormData({ ...item });
                    }}
                    className="p-2.5 rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all border border-transparent hover:border-[#10B981]/20"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {currentItems.length === 0 && (
              <div className="p-20 rounded-3xl border border-dashed border-[#1F2937] flex flex-col items-center justify-center text-center opacity-40">
                <Layout size={48} className="mb-4" />
                <p className="font-bold">No items found.</p>
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
                  <Edit3 size={40} className="text-[#1F2937] mb-4" />
                  <p className="text-[#4B5563] font-bold">Select an item to edit.</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                     {editingId === "new" ? "Create New" : "Edit Item"}
                   </h3>
                   <button onClick={() => setEditingId(null)} className="text-[#4B5563] hover:text-white transition-colors">
                     <XCircle size={20} />
                   </button>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                         <Type size={12} /> Title
                       </label>
                       <input 
                         type="text" 
                         value={formData.title || ""} 
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none transition-all"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                         <Layout size={12} /> Description
                       </label>
                       <textarea 
                         value={formData.subtitle || formData.desc || ""} 
                         onChange={(e) => setFormData(activeTab === "hero" ? {...formData, subtitle: e.target.value} : {...formData, desc: e.target.value})}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none transition-all h-24 resize-none"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                         <ImageIcon size={12} /> Image URL
                       </label>
                       <input 
                         type="text" 
                         value={formData.image || ""} 
                         onChange={(e) => setFormData({...formData, image: e.target.value})}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none transition-all"
                       />
                    </div>

                    {activeTab === "hero" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={12} /> Background Gradient
                        </label>
                        <input 
                          type="text" 
                          value={formData.bgColor || ""} 
                          onChange={(e) => setFormData({...formData, bgColor: e.target.value})}
                          className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none transition-all"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Icon Type
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                           {iconOptions.map((opt) => (
                             <button
                               key={opt.value}
                               onClick={() => setFormData({...formData, iconType: opt.value})}
                               className={cn(
                                 "p-3 rounded-xl border flex items-center justify-center transition-all",
                                 formData.iconType === opt.value ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]" : "bg-[#0B0F14] border-[#1F2937] text-[#4B5563] hover:border-[#374151]"
                               )}
                             >
                               <opt.icon size={20} />
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="pt-6 flex gap-3">
                    <Button 
                      onClick={handleSave}
                      className="flex-1 bg-[#10B981] hover:bg-[#059669] h-12 rounded-xl font-bold gap-2"
                    >
                      <Save size={18} /> Save Changes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="border-[#1F2937] text-[#9CA3AF] hover:bg-[#1F2937] h-12 rounded-xl px-6 font-bold"
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
