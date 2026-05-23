"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle2, MapPin, Store, Search, ShieldAlert, Award, Calendar, ArrowLeft } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { mapBackendProduct } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { Product, Vendor } from "@/types";
import { Button } from "@/components/ui/button";

export default function VendorStorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await vendorService.getStoreBySlug(slug);
        setVendor(data.vendor);
        if (data.products) {
          setProducts(data.products.map(mapBackendProduct));
        }
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A6D608] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Storefront...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            The storefront you are looking for does not exist or has been disabled.
          </p>
          <Button asChild className="bg-[#1E1E1E] hover:bg-black text-white font-bold h-12 rounded-xl px-8 w-full">
            <Link href="/vendors">Back to All Brands</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Client-side filtering & sorting
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // Default popularity
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gray-100 overflow-hidden">
        {vendor.banner && (
          <Image
            src={vendor.banner}
            alt={`${vendor.name} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft size={14} /> Back to Brands
          </Link>
        </div>
      </div>

      {/* Profile Header card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start justify-between">
          
          {/* Left Block: Logo & Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {vendor.name}
                </h1>
                {vendor.isVerified && (
                  <span className="bg-[#A6D608]/15 text-[#A6D608] border-0 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} fill="white" /> VERIFIED BRAND
                  </span>
                )}
                {vendor.isTopSeller && (
                  <span className="bg-[#FFD700]/15 text-[#B8860B] border-0 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award size={12} /> TOP SELLER
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-[#A6D608]" /> {vendor.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Registered {new Date(vendor.joinedDate).getFullYear()}
                </span>
              </div>

              <p className="text-sm text-gray-500 font-medium max-w-xl leading-relaxed capitalize">
                {vendor.description}
              </p>
            </div>
          </div>

          {/* Right Block: Stats */}
          <div className="flex gap-4 sm:gap-6 self-stretch md:self-auto justify-around md:justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-8 shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 font-black text-2xl text-gray-900 mb-0.5">
                <Star size={18} className="fill-[#FF7A00] text-[#FF7A00]" />
                {vendor.rating.toFixed(1)}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Rating</span>
            </div>
            
            <div className="w-px bg-gray-100" />

            <div className="text-center">
              <div className="font-black text-2xl text-gray-900 mb-0.5">
                {products.length}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</span>
            </div>
          </div>

        </div>
      </div>

      {/* Inventory & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
          {/* Search inside shop */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search products within ${vendor.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6D608] focus:bg-white transition-all font-bold placeholder:text-gray-300"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-auto justify-end">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 bg-gray-50 border-0 rounded-2xl px-4 text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#A6D608] cursor-pointer appearance-none min-w-[150px]"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Store size={48} />
            </div>
            <h2 className="font-heading font-black text-2xl text-[#1E1E1E] mb-2">No Products Found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn't find any products in this store matching "{searchQuery}".
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-black rounded-2xl h-12 px-8"
            >
              Clear Search
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
