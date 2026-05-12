"use client"

import * as React from "react"
import { 
  Package, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  Upload,
  Loader2
} from "lucide-react"
import { vendorService } from "@/services/vendorService"
import { productService } from "@/services/productService"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

const isVideo = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes('/video/upload/') || url.includes('res.cloudinary.com') && url.includes('/video/');
};

const getThumbnail = (url: string) => {
  if (!url) return "/placeholder.png";
  if (isVideo(url)) {
    // Cloudinary video to thumbnail transformation
    return url.replace(/\.(mp4|webm|mov|ogg)$/i, '.jpg').replace('/video/upload/', '/video/upload/so_auto/');
  }
  return url;
};

export default function VendorInventoryPage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddingProduct, setIsAddingProduct] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])

  const fetchCategories = React.useCallback(async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories");
    }
  }, []);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await vendorService.getMyProducts({ search: searchQuery })
      setProducts(result.products || [])
    } catch (error) {
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  React.useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await vendorService.deleteProduct(id)
      toast.success("Product deleted successfully")
      fetchProducts()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  // New Product Form State
  const [newProduct, setNewProduct] = React.useState({
    name: "",
    price: "" as any,
    originalPrice: "" as any,
    discount: "" as any,
    category: "",
    stock: "" as any,
    description: "",
    image: "",
    highlights: ["", "", "", "", ""]
  })

  const calculateDiscount = (mrp: number, sale: number) => {
    if (!mrp || !sale) return "";
    return Math.round(((mrp - sale) / mrp) * 100);
  }

  const calculateSalePrice = (mrp: number, discount: number) => {
    if (!mrp) return "";
    return Math.round(mrp * (1 - (discount || 0) / 100));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setLoading(true)
    
    const formData = new FormData();
    if (editingProduct.title) formData.append("title", editingProduct.title);
    if (editingProduct.price !== undefined) formData.append("price", editingProduct.price.toString());
    if (editingProduct.originalPrice !== undefined) formData.append("comparePrice", editingProduct.originalPrice.toString());
    if (editingProduct.categoryId) formData.append("categoryId", editingProduct.categoryId);
    if (editingProduct.stock !== undefined) formData.append("stockQty", editingProduct.stock.toString());
    if (editingProduct.description) formData.append("description", editingProduct.description);
    
    formData.append("metadata", JSON.stringify({
      ...editingProduct.metadata,
      highlights: editingProduct.highlights
    }));

    if (imageFiles.length > 0) {
      imageFiles.forEach(file => formData.append("images", file));
    }

    try {
      await vendorService.updateProduct(editingProduct.id, formData)
      toast.success("Product updated successfully")
      setEditingProduct(null)
      setImageFiles([])
      setPreviews([])
      fetchProducts()
    } catch (error) {
      toast.error("Failed to update product")
    } finally {
      setLoading(false)
    }
  }
  const filteredProducts = products;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.category) {
      toast.error("Please select a category");
      return;
    }
    setLoading(true)

    const formData = new FormData();
    formData.append("title", newProduct.name);
    formData.append("price", (newProduct.price || 0).toString());
    formData.append("comparePrice", (newProduct.originalPrice || 0).toString());
    formData.append("categoryId", newProduct.category);
    formData.append("stockQty", (newProduct.stock || 0).toString());
    formData.append("description", newProduct.description);
    formData.append("status", "ACTIVE");
    formData.append("metadata", JSON.stringify({ highlights: newProduct.highlights }));
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => formData.append("images", file));
    }

    try {
      await vendorService.createProduct(formData)
      toast.success("Product listed successfully!")
      setIsAddingProduct(false)
      setNewProduct({ 
        name: "", 
        price: "" as any, 
        originalPrice: "" as any, 
        discount: "" as any, 
        category: "", 
        stock: "" as any, 
        description: "", 
        image: "",
        highlights: ["", "", "", "", ""] 
      })
      setImageFiles([])
      setPreviews([])
      fetchProducts()
    } catch (error) {
      toast.error("Failed to list product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">My Products</h1>
             <p className="text-gray-500 font-medium italic">Manage your marketplace inventory and listings.</p>
          </div>
          <Button 
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-2xl px-6 h-12 shadow-lg shadow-[#A6D608]/20 transition-all font-black gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
           <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#A6D608]/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                 <Package className="w-5 h-5 md:w-6 md:h-6 text-[#A6D608]" />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Live Listings</p>
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 truncate">{products.length}</h3>
              </div>
           </div>
           <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                 <Check className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">In Stock</p>
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 truncate">{products.filter(p => p.stock > 0).length}</h3>
              </div>
           </div>
           <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                 <X className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Out of Stock</p>
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 truncate">{products.filter(p => p.stock === 0).length}</h3>
              </div>
           </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative group transition-all">
          <div className="p-5 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
             <div className="relative group w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search inventory..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                />
             </div>
             <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1 md:flex-none rounded-xl border-gray-100 hover:bg-gray-50 italic font-bold gap-2 h-11">
                   <Filter className="w-4 h-4 text-gray-400" />
                   Filter
                </Button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Product</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Price</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0 flex items-center justify-center group-hover/row:scale-105 transition-transform duration-300">
                          {product.images?.[0] ? (
                            isVideo(typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={getThumbnail(typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)} 
                                  alt={product.title} 
                                  fill 
                                  className="object-cover" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-[#A6D608] border-b-[4px] border-b-transparent ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Image 
                                src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                                alt={product.title} 
                                fill 
                                className="object-cover" 
                              />
                            )
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-gray-900 truncate text-sm">{product.title}</p>
                           <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase group-hover/row:text-[#A6D608] transition-colors">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-tighter italic">{product.category?.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-gray-900 tracking-tight">₹{product.price.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-sm font-black tracking-tight",
                        product.stock > 10 ? "text-gray-900" : "text-red-500"
                      )}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-xl px-2 py-0.5 text-[10px] font-black uppercase tracking-tight",
                        product.stock > 0 ? "bg-[#A6D608]/10 text-[#A6D608]" : "bg-red-50 text-red-500"
                      )}>
                        {product.stock > 0 ? 'Live' : 'Out of Stock'}
                      </Badge>
                    </td>
                     <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Button 
                           variant="ghost" 
                           size="icon-sm" 
                           onClick={() => setEditingProduct({
                             ...product,
                             originalPrice: product.comparePrice || product.price,
                             price: product.price,
                             discount: calculateDiscount(Number(product.comparePrice || product.price), Number(product.price)),
                             image: product.images?.[0]?.url || "",
                             categoryName: product.category?.name,
                             highlights: product.metadata?.highlights || ["", "", "", "", ""]
                           })}
                           className="rounded-lg hover:bg-white hover:text-[#A6D608] transition-all hover:shadow-sm"
                         >
                            <Edit2 className="w-4 h-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon-sm" 
                           onClick={() => handleDelete(product.id)}
                           className="rounded-lg hover:bg-white hover:text-red-500 transition-all hover:shadow-sm"
                         >
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-2xl w-full p-6 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A6D608] to-[#FF7A00]" />
                <button 
                  onClick={() => setIsAddingProduct(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 font-black" />
                </button>

                <h2 className="text-3xl font-black text-gray-900 mb-2">List New Product</h2>
                <p className="text-gray-500 font-medium italic mb-8">Reach thousands of healthy customers with Druxx.</p>

                <form onSubmit={handleAddProduct} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Name</label>
                         <input 
                           required 
                           type="text" 
                           value={newProduct.name}
                           onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                           placeholder="e.g. Organic Matcha Tea" 
                         />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Original Price / MRP (₹)</label>
                           <input 
                             required 
                             type="number" 
                             value={newProduct.originalPrice}
                             onChange={(e) => {
                               const mrp = e.target.value === '' ? '' : Number(e.target.value);
                               const discount = newProduct.discount;
                               setNewProduct({
                                 ...newProduct, 
                                 originalPrice: mrp,
                                 price: mrp === '' ? '' : calculateSalePrice(Number(mrp), Number(discount))
                               })
                             }}
                             className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                             placeholder="0.00" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-[#FF7A00] uppercase tracking-widest italic ml-1">Discount (%)</label>
                           <input 
                             type="number" 
                             value={newProduct.discount}
                             onChange={(e) => {
                               const discount = e.target.value === '' ? '' : Number(e.target.value);
                               const mrp = newProduct.originalPrice;
                               setNewProduct({
                                 ...newProduct, 
                                 discount: discount,
                                 price: mrp === '' ? '' : calculateSalePrice(Number(mrp), Number(discount))
                               })
                             }}
                             className="w-full px-4 py-3 bg-[#FF7A00]/5 border-2 border-[#FF7A00]/20 rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" 
                             placeholder="0" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-[#A6D608] uppercase tracking-widest italic ml-1 font-bold">Offer Selling Price (₹)</label>
                           <input 
                             required 
                             type="number" 
                             value={newProduct.price}
                             onChange={(e) => {
                               const price = e.target.value === '' ? '' : Number(e.target.value);
                               const mrp = newProduct.originalPrice;
                               setNewProduct({
                                 ...newProduct, 
                                 price: price,
                                 discount: mrp === '' ? '' : calculateDiscount(Number(mrp), Number(price))
                               })
                             }}
                             className="w-full px-4 py-3 bg-[#A6D608]/5 border-2 border-[#A6D608]/20 rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                             placeholder="0.00" 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Category</label>
                         <select 
                           value={newProduct.category}
                           onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all appearance-none"
                         >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Initial Stock Level</label>
                         <input 
                           required 
                           type="number" 
                           value={newProduct.stock}
                           onChange={(e) => setNewProduct({...newProduct, stock: e.target.value === '' ? '' : Number(e.target.value)})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                           placeholder="0" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Description</label>
                      <textarea 
                        required 
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all resize-none" 
                        placeholder="Tell customers about your product..." 
                      />
                   </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Highlights (Key selling points)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newProduct.highlights.map((highlight, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black">#{idx + 1}</span>
                            <input 
                              type="text"
                              value={highlight}
                              onChange={(e) => {
                                const newHighlights = [...newProduct.highlights];
                                newHighlights[idx] = e.target.value;
                                setNewProduct({ ...newProduct, highlights: newHighlights });
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                              placeholder={`Highlight ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold ml-1">These will appear as visual boxes on the product page.</p>
                    </div>

                   <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Images & Videos</label>
                       <div className="grid grid-cols-4 gap-4">
                         {previews.map((preview, idx) => (
                           <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                             {isVideo(imageFiles[idx]?.name || preview) ? (
                               <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                             ) : (
                               <Image src={preview} alt="Preview" fill className="object-cover" />
                             )}
                             <button 
                               type="button"
                               onClick={() => removeImage(idx)}
                               className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
                             >
                               <X size={12} />
                             </button>
                           </div>
                         ))}
                         {previews.length < 3 && (
                           <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 hover:border-[#A6D608] hover:bg-[#A6D608]/5 transition-all cursor-pointer group">
                             <Upload className="w-6 h-6 text-gray-300 group-hover:text-[#A6D608] transition-colors" />
                             <input 
                               type="file" 
                               multiple 
                               accept="image/*,video/*" 
                               onChange={handleFileChange} 
                               className="hidden" 
                             />
                           </label>
                         )}
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold mt-2 ml-1">Upload up to 3 files (Images or Videos). First one is primary.</p>
                    </div>
                   
                   <div className="pt-6">
                      <Button type="submit" className="w-full bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-[20px] h-14 font-black shadow-xl shadow-[#A6D608]/20 transition-all text-lg" disabled={loading}>
                         {loading ? "Listing..." : "Initialize Listing"}
                      </Button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-2xl w-full p-6 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-[#A6D608]" />
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 font-black" />
                </button>

                <h2 className="text-3xl font-black text-gray-900 mb-2">Edit Listing</h2>
                <p className="text-gray-500 font-medium italic mb-8">Maintain accurate marketplace data.</p>

                <form onSubmit={handleUpdateProduct} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Name</label>
                         <input 
                           required 
                           type="text" 
                           value={editingProduct.title}
                           onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                         />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Original Price / MRP (₹)</label>
                           <input 
                             required 
                             type="number" 
                             value={editingProduct.originalPrice === 0 || editingProduct.originalPrice === "" ? "" : editingProduct.originalPrice}
                             onChange={(e) => {
                               const mrp = e.target.value === '' ? '' : Number(e.target.value);
                               const discount = editingProduct.discount;
                               setEditingProduct({
                                 ...editingProduct, 
                                 originalPrice: mrp,
                                 price: mrp === '' ? '' : calculateSalePrice(Number(mrp), Number(discount))
                               })
                             }}
                             className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-[#FF7A00] uppercase tracking-widest italic ml-1">Discount (%)</label>
                           <input 
                             type="number" 
                             value={editingProduct.discount}
                             onChange={(e) => {
                               const discount = e.target.value === '' ? '' : Number(e.target.value);
                               const mrp = editingProduct.originalPrice;
                               setEditingProduct({
                                 ...editingProduct, 
                                 discount: discount,
                                 price: mrp === '' ? '' : calculateSalePrice(Number(mrp), Number(discount))
                               })
                             }}
                             className="w-full px-4 py-3 bg-[#FF7A00]/5 border-2 border-[#FF7A00]/20 rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-[#A6D608] uppercase tracking-widest italic ml-1 font-bold">Offer Selling Price (₹)</label>
                           <input 
                             required 
                             type="number" 
                             value={editingProduct.price === 0 || editingProduct.price === "" ? "" : editingProduct.price}
                             onChange={(e) => {
                               const price = e.target.value === '' ? '' : Number(e.target.value);
                               const mrp = editingProduct.originalPrice;
                               setEditingProduct({
                                 ...editingProduct, 
                                 price: price,
                                 discount: mrp === '' ? '' : calculateDiscount(Number(mrp), Number(price))
                               })
                             }}
                             className="w-full px-4 py-3 bg-[#A6D608]/5 border-2 border-[#A6D608]/20 rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Category</label>
                         <select 
                           value={editingProduct.categoryId}
                           onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all appearance-none"
                         >
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Current Stock</label>
                         <input 
                           required 
                           type="number" 
                           value={editingProduct.stock === 0 || editingProduct.stock === "" ? "" : editingProduct.stock}
                           onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value === '' ? '' : Number(e.target.value)})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Description</label>
                      <textarea 
                        required 
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all resize-none" 
                      />
                   </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Highlights</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editingProduct.highlights.map((highlight: string, idx: number) => (
                          <div key={idx} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black">#{idx + 1}</span>
                            <input 
                              type="text"
                              value={highlight}
                              onChange={(e) => {
                                const newHighlights = [...editingProduct.highlights];
                                newHighlights[idx] = e.target.value;
                                setEditingProduct({ ...editingProduct, highlights: newHighlights });
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                              placeholder={`Highlight ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Update Images</label>
                      <div className="grid grid-cols-4 gap-4">
                        {previews.length > 0 ? previews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )) : editingProduct.images?.map((img: any, idx: number) => {
                          const imageUrl = typeof img === 'string' ? img : img?.url;
                          if (!imageUrl) return null;
                          return (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                              {isVideo(imageUrl) ? (
                                <video src={imageUrl} className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <Image src={imageUrl} alt="Current" fill className="object-cover opacity-80" />
                              )}
                            </div>
                          );
                        })}
                        {previews.length < 3 && (
                          <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 hover:border-[#A6D608] hover:bg-[#A6D608]/5 transition-all cursor-pointer group">
                            <Upload className="w-6 h-6 text-gray-300 group-hover:text-[#A6D608] transition-colors" />
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*,video/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 ml-1">Upload up to 3 files. Selecting new files will replace existing ones.</p>
                   </div>
                   
                   <div className="pt-6">
                      <Button type="submit" className="w-full bg-[#1E1E1E] hover:bg-black text-white rounded-[20px] h-14 font-black shadow-xl transition-all text-lg" disabled={loading}>
                         {loading ? "Updating..." : "Save Changes"}
                      </Button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
