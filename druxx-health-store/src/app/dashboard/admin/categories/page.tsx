"use client";

import { useState, useEffect } from "react";
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  Search,
  Save,
  XCircle,
  Package,
  ChevronRight,
  TrendingUp,
  Box
} from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ name: string; slug: string; icon: string }>({ name: "", slug: "", icon: "" });
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { categories } = await categoryService.getAllCategories();
      setCategories(categories);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and Slug are required");
      return;
    }

    const loadingToast = toast.loading(editingId === "new" ? "Creating category..." : "Updating category...");
    try {
      if (editingId === "new") {
        await categoryService.createCategory(formData);
        toast.success("Category created successfully", { id: loadingToast });
      } else {
        await categoryService.updateCategory(editingId!, formData);
        toast.success("Category updated successfully", { id: loadingToast });
      }
      setEditingId(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Operation failed", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat?.productCount && cat.productCount > 0) {
      toast.error(`Cannot delete category "${cat.name}"`, {
        description: `There are still ${cat.productCount} products linked to this category. Please reassign them first.`
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${cat?.name}"?`)) return;
    
    const loadingToast = toast.loading("Removing category...");
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category removed", { id: loadingToast });
      fetchCategories();
    } catch (error: any) {
      if (error.code === '23503') {
        toast.error("Constraint Error", {
          description: "This category is linked to active products and cannot be deleted.",
          id: loadingToast
        });
      } else {
        toast.error(error.message || "Failed to delete", { id: loadingToast });
      }
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (!mounted) return null;

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <LayoutGrid className="text-[#10B981]" />
             Category <span className="text-[#10B981]">Manager</span>
           </h1>
           <p className="text-[#9CA3AF] font-medium mt-1">Organize and manage platform-wide product classification.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId("new");
            setFormData({ name: "", slug: "", icon: "" });
          }}
          className="bg-[#10B981] hover:bg-[#059669] rounded-xl h-12 gap-2 font-bold px-6 shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Create New Category
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Search and Filters */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] group-focus-within:text-[#10B981] transition-colors" />
            <input 
              type="text" 
              placeholder="Search categories by name or slug..." 
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
            ) : filteredCategories.map((cat) => (
              <div 
                key={cat.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all group flex items-center gap-6",
                  editingId === cat.id ? "bg-[#1F2937] border-[#10B981]" : "bg-[#111827] border-[#1F2937] hover:border-[#374151]"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center shrink-0">
                  <Tag className="text-[#9CA3AF] group-hover:text-[#10B981] transition-colors" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-lg tracking-tight truncate">{cat.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{cat.slug}</p>
                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cat.productCount || 0} Products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingId(cat.id);
                      setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || "" });
                    }}
                    className="p-3 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all border border-transparent hover:border-[#10B981]/20"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-3 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredCategories.length === 0 && (
              <div className="p-20 rounded-3xl border border-dashed border-[#1F2937] flex flex-col items-center justify-center text-center">
                <Box size={48} className="text-[#1F2937] mb-4" />
                <p className="text-[#4B5563] font-bold uppercase tracking-widest">No categories found</p>
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
                  <LayoutGrid size={40} className="text-[#1F2937] mb-4" />
                  <p className="text-[#4B5563] font-bold">Select a category to edit or click create new.</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                     {editingId === "new" ? "Create New Category" : "Edit Category"}
                   </h3>
                   <button onClick={() => setEditingId(null)} className="text-[#4B5563] hover:text-white transition-colors">
                     <XCircle size={20} />
                   </button>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                         Category Name
                       </label>
                       <input 
                         type="text" 
                         value={formData.name} 
                         placeholder="e.g. Health & Wellness"
                         onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                                ...formData,
                                name: val,
                                slug: editingId === "new" ? generateSlug(val) : formData.slug
                            });
                         }}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all placeholder:text-[#374151]"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                         URL Slug
                       </label>
                       <input 
                         type="text" 
                         value={formData.slug} 
                         placeholder="health-wellness"
                         onChange={(e) => setFormData({...formData, slug: e.target.value})}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all placeholder:text-[#374151]"
                       />
                       <p className="text-[9px] text-gray-500 font-medium px-1">Slugs are used in URLs for better SEO.</p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2 px-1">
                         Icon / Emoji (Optional)
                       </label>
                       <input 
                         type="text" 
                         value={formData.icon} 
                         placeholder="e.g. ┬í┬©"
                         onChange={(e) => setFormData({...formData, icon: e.target.value})}
                         className="w-full bg-[#0B0F14] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#10B981] outline-none transition-all placeholder:text-[#374151]"
                       />
                    </div>
                 </div>

                 <div className="pt-8 flex gap-3">
                    <Button 
                      onClick={handleSave}
                      className="flex-1 bg-[#10B981] hover:bg-[#059669] h-13 rounded-xl font-bold gap-2 text-white shadow-lg shadow-[#10B981]/10 active:scale-95 transition-all"
                    >
                      <Save size={18} /> {editingId === "new" ? "Create Category" : "Update Category"}
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
