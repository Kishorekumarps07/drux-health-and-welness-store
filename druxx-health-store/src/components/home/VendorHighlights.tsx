"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { VendorCard } from "@/components/products/VendorCard";
import { vendorService } from "@/services/vendorService";
import { Vendor } from "@/types";

export function VendorHighlights({ vendors, loading = false }: { vendors: Vendor[]; loading?: boolean }) {
  return (
    <section className="py-16 md:py-24 px-4 bg-gray-50/30 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
               <div className="h-px w-8 bg-[#A6D608]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A6D608]">Official Brand Partners</span>
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-[#1E1E1E] leading-tight flex items-center gap-3">
              Shop From Top Trusted Vendors <Sparkles size={28} className="text-[#FFD700] fill-[#FFD700]/20" />
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-4 leading-relaxed font-medium">
              We partner with India&apos;s leading health and wellness brands globally to ensure you get 100% authentic products directly from the source.
            </p>
          </div>
          
          <Link
            href="/vendors"
            className="flex items-center gap-2 group text-sm font-black text-[#1E1E1E] hover:text-[#A6D608] transition-all whitespace-nowrap bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md"
          >
            Explore All Brand Stores
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Vendor Grid / Scroll Container */}
        <div className="flex gap-6 overflow-x-auto touch-pan-x hide-scrollbar pb-8 snap-x-mandatory px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-[2rem] bg-white border border-gray-100 animate-pulse" />
            ))
          ) : vendors.length > 0 ? (
            vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="snap-center flex-shrink-0 w-[300px] md:w-auto"
              >
                <VendorCard vendor={vendor} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <Store className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Brand Partners Found</p>
            </div>
          )}
        </div>

        {/* Trust Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8 border-t border-gray-100 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           {/* These could be generic logos or text */}
           <div className="flex items-center gap-2 font-black text-xs text-gray-400 uppercase tracking-widest">
              Verified Merchants Only
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
           <div className="flex items-center gap-2 font-black text-xs text-gray-400 uppercase tracking-widest">
              Direct Brand Sourcing
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
           <div className="flex items-center gap-2 font-black text-xs text-gray-400 uppercase tracking-widest">
              Quality Assurance Guaranteed
           </div>
        </div>
      </div>
    </section>
  );
}
