"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
  CheckCircle2, 
  MapPin, 
  Star, 
  Package, 
  TrendingUp, 
  Search,
  ShoppingCart,
  Heart,
  ChevronRight,
  Filter,
  Store
} from "lucide-react"

import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { vendorService } from "@/services/vendorService";
import { Vendor, Product } from "@/types";

export default function VendorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  
  const [vendor, setVendor] = React.useState<Vendor | null>(null)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 10000])

  React.useEffect(() => {
    if (slug) {
      const fetchVendorData = async () => {
        setLoading(true)
        try {
          const { vendor: vData, products: pData } = await vendorService.getStoreBySlug(slug)
          setVendor(vData)
          setProducts(pData)
        } catch (error) {
          console.error("Failed to fetch vendor", error)
        } finally {
          setLoading(false)
        }
      }
      fetchVendorData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="h-64 md:h-80 w-full bg-gray-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-12">
            <div className="h-32 w-32 rounded-3xl bg-gray-300 border-4 border-white animate-pulse" />
            <div className="flex-1 space-y-4 pb-4">
              <div className="h-10 w-64 bg-gray-300 rounded-xl" />
              <div className="h-6 w-96 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-3xl animate-pulse" />
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <ProductSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
           <Store className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Vendor Not Found</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium italic">
          The store you're looking for doesn't exist or has been moved. Explore our marketplace for other verified health partners.
        </p>
        <Button onClick={() => router.push('/products')} className="bg-gray-900 text-white rounded-2xl px-8 h-12">
           Browse Marketplace
        </Button>
      </div>
    )
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchesSearch && matchesPrice
  })

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Vendor Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {vendor.banner && (
          <Image
            src={vendor.banner}
            alt={vendor.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
            {/* Vendor Logo */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0 -mb-12 md:-mb-16">
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-black">{vendor.name}</h1>
                {vendor.isVerified && (
                  <CheckCircle2 className="w-6 h-6 text-[#A6D608] fill-white" strokeWidth={3} />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium opacity-90">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {vendor.rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  Joined {new Date(vendor.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pb-2 hidden md:flex">
              <Button className="bg-[#A6D608] hover:bg-[#8ab506] text-white px-8 rounded-2xl h-12">
                Follow
              </Button>
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-2xl h-12 backdrop-blur-md">
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row gap-12">
        {/* Left Sidebar: Vendor Info & Filters */}
        <aside className="w-full lg:w-80 space-y-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-4">About</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {vendor.description}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Products</span>
                <span className="font-bold text-gray-900">{vendor.productCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Response Time</span>
                <span className="font-bold text-gray-900">&lt; 24h</span>
              </div>
            </div>
            
            <Separator className="my-6 bg-gray-50" />
            
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.specialties.map((specialty) => (
                <Badge 
                  key={specialty} 
                  className="bg-gray-50 border-gray-100 text-gray-600 rounded-xl px-3 py-1 font-medium"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#A6D608]" />
              Filter Shop
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Price Range</h4>
                <Slider
                  max={10000}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val as [number, number])}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content: Products Grid */}
        <main className="flex-1 space-y-8">
          {/* Internal Shop Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
              <input
                type="text"
                placeholder={`Search in ${vendor.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A6D608]/20 focus:border-[#A6D608] transition-all text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              Showing <span className="text-gray-900 font-bold">{filteredProducts.length}</span> products
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                We couldn't find any products in {vendor.name} matching your search or filters.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("")
                  setPriceRange([0, 5000])
                }}
                className="mt-8 bg-gray-900 text-white hover:bg-gray-800 rounded-2xl px-8"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
