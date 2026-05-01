"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Store, Sparkles, SlidersHorizontal } from "lucide-react";
import { VendorCard } from "@/components/products/VendorCard";
import { vendorService } from "@/services/vendorService";
import { Vendor } from "@/types";
import { Button } from "@/components/ui/button";

export default function VendorsListingPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const data = await vendorService.getAllVendors();
        setVendors(data.vendors);
      } catch (error) {
        console.error("Failed to fetch vendors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-16 md:pt-16 md:pb-24 px-4 overflow-hidden relative">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A6D608]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2CA7A0]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#A6D608]/10 px-4 py-2 rounded-full border border-[#A6D608]/20">
            <Sparkles size={16} className="text-[#A6D608] fill-[#A6D608]/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E1E1E]">Verified Brand Partners</span>
          </div>
          
          <h1 className="font-heading font-black text-4xl md:text-6xl text-[#1E1E1E] leading-tight">
            Shop From India's Most <br className="hidden md:block" /> 
            <span className="text-[#A6D608]">Trusted Wellness Brands</span>
          </h1>
          
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            We've partnered with premium, certified vendors to ensure 100% authenticity and direct sourcing for every product you buy.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
              <input
                type="text"
                placeholder="Search brands, stores or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-xl focus:outline-none focus:ring-4 focus:ring-[#A6D608]/10 focus:border-[#A6D608] transition-all text-base font-bold placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 pl-4">
             <span className="text-xs font-black uppercase tracking-widest text-gray-400">
               {filteredVendors.length} Brands Found
             </span>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="ghost" className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest text-gray-500">
               Sort by: Popularity
             </Button>
             <div className="w-px h-4 bg-gray-100 mx-2" />
             <Button className="h-10 rounded-xl gap-2 bg-[#1E1E1E] text-white hover:bg-[#A6D608] hover:text-[#1E1E1E] font-bold text-[10px] uppercase tracking-widest">
                <SlidersHorizontal size={14} />
                Filters
             </Button>
          </div>
        </div>

        {/* Vendor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] bg-white rounded-[2rem] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Store size={48} />
            </div>
            <h2 className="font-heading font-black text-2xl text-[#1E1E1E] mb-2">No Brands Found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">We couldn't find any vendors matching your search for "{searchQuery}".</p>
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
