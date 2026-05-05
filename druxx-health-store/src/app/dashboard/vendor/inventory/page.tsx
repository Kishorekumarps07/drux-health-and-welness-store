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
  X
} from "lucide-react"
import { vendorService } from "@/services/vendorService"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function VendorInventoryPage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddingProduct, setIsAddingProduct] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null)

  const categories = [
    { id: 'b1bf4209-33a2-4038-b328-27a12b9f9e0e', name: 'Vitamins & Supplements' }, 
    { id: 'b043cef3-510b-4b8f-8b21-ecc6e70e5571', name: 'Herbal & Ayurvedic' }
  ]

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
    fetchProducts()
  }, [fetchProducts])

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
    price: 0,
    category: "",
    stock: 0,
    description: "",
    image: ""
  })

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setLoading(true)
    try {
      await vendorService.updateProduct(editingProduct.id, {
        title: editingProduct.title,
        price: editingProduct.price,
        categoryId: categories.find(c => c.name === editingProduct.categoryName)?.id || editingProduct.categoryId,
        stockQty: editingProduct.stock,
        description: editingProduct.description,
        image: editingProduct.image
      })
      toast.success("Product updated successfully")
      setEditingProduct(null)
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
    setLoading(true)
    try {
      await vendorService.createProduct({
        title: newProduct.name,
        price: newProduct.price,
        categoryId: categories.find(c => c.name === newProduct.category)?.id || categories[0].id,
        stockQty: newProduct.stock,
        description: newProduct.description,
        image: newProduct.image,
        status: 'ACTIVE'
      })
      toast.success("Product listed successfully!")
      setIsAddingProduct(false)
      setNewProduct({ name: "", price: 0, category: "", stock: 0, description: "", image: "" })
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-[#A6D608]/10 rounded-2xl flex items-center justify-center">
                 <Package className="w-6 h-6 text-[#A6D608]" />
              </div>
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Live Listings</p>
                 <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                 <Check className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">In Stock</p>
                 <h3 className="text-2xl font-black text-gray-900">{products.filter(p => p.stock > 0).length}</h3>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                 <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Out of Stock</p>
                 <h3 className="text-2xl font-black text-gray-900">{products.filter(p => p.stock === 0).length}</h3>
              </div>
           </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative group transition-all">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="relative group max-w-sm w-full">
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
                <Button variant="outline" className="rounded-xl border-gray-100 hover:bg-gray-50 italic font-bold gap-2">
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
                          {product.images?.[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.title} fill className="object-cover" />
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
                             image: product.images?.[0]?.url || "",
                             categoryName: product.category?.name
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
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
                      <div className="space-y-2">
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
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Regular Price (₹)</label>
                         <input 
                           required 
                           type="number" 
                           value={newProduct.price}
                           onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                           placeholder="0.00" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Category</label>
                         <select 
                           value={newProduct.category}
                           onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all appearance-none"
                         >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Initial Stock Level</label>
                         <input 
                           required 
                           type="number" 
                           value={newProduct.stock}
                           onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
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
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Image URL</label>
                      <input 
                        type="url" 
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                        placeholder="https://images.unsplash.com/..." 
                      />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
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
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Name</label>
                         <input 
                           required 
                           type="text" 
                           value={editingProduct.title}
                           onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Regular Price (₹)</label>
                         <input 
                           required 
                           type="number" 
                           value={editingProduct.price}
                           onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Category</label>
                         <select 
                           value={editingProduct.categoryName}
                           onChange={(e) => setEditingProduct({...editingProduct, categoryName: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all appearance-none"
                         >
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Current Stock</label>
                         <input 
                           required 
                           type="number" 
                           value={editingProduct.stock}
                           onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
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
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest italic ml-1">Product Image URL</label>
                      <input 
                        type="url" 
                        value={editingProduct.image || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                      />
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
