"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2, ArrowRight, Package, TrendingUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vendor } from "@/types";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className = "" }: VendorCardProps) {
  return (
    <div
      className={`group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out flex flex-col h-full ${className}`}
    >
      {/* Banner Section */}
      <div className="relative h-32 lg:h-36 bg-gray-100 overflow-hidden">
        {vendor.banner && (
          <Image
            src={vendor.banner}
            alt={`${vendor.name} banner`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Top Seller Floating Badge */}
        {vendor.isTopSeller && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-[#FFD700] text-[#1E1E1E] text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce-subtle">
              <TrendingUp size={12} strokeWidth={3} /> TOP SELLER
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-6 relative">
        {/* Overlapping Logo */}
        <div className="relative -mt-10 lg:-mt-12 mb-4 z-10">
          <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white mx-auto md:mx-0">
            <Image
              src={vendor.logo}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          
          {/* Verified Badge Over Logo */}
          {vendor.isVerified && (
            <div className="absolute bottom-0 right-0 md:right-auto md:left-20 lg:left-24 translate-x-1/4 translate-y-1/4 bg-white rounded-full p-1 shadow-lg z-20">
              <CheckCircle2 size={24} className="text-[#A6D608] fill-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Vendor Identity */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
            <h3 className="font-heading font-black text-lg lg:text-xl text-[#1E1E1E]">
              {vendor.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
            <MapPin size={14} className="text-[#A6D608]" />
            {vendor.location}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 py-4 border-y border-gray-50">
          <div className="flex flex-col">
             <div className="flex items-center gap-1 mb-1">
                <Star size={14} className="fill-[#FF7A00] text-[#FF7A00]" />
                <span className="text-sm font-black text-[#1E1E1E]">{vendor.rating}</span>
             </div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{vendor.reviewCount.toLocaleString()} Reviews</span>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-4">
             <div className="flex items-center gap-1 mb-1 font-black text-sm text-[#1E1E1E]">
                <Package size={14} className="text-[#A6D608]" />
                {vendor.productCount}+
             </div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products Sold</span>
          </div>
        </div>

        {/* Performance & Description */}
        <div className="mb-6">
           <div className="flex items-center gap-2 mb-3 bg-[#A6D608]/5 px-3 py-2 rounded-xl border border-[#A6D608]/10 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
              <span className="text-[11px] font-black text-[#1E1E1E]">
                 {vendor.deliveryPerformance}% On-time Delivery
              </span>
           </div>
           <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium capitalize">
             {vendor.description}
           </p>
        </div>

        {/* Categories / Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {vendor.specialties.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="text-[9px] font-black uppercase tracking-wider border-gray-100 text-gray-400 bg-gray-50/50 hover:bg-[#A6D608]/10 hover:text-[#A6D608] hover:border-[#A6D608]/30 transition-all px-2.5 py-0.5 rounded-full"
            >
              {s}
            </Badge>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className="w-full bg-[#1E1E1E] hover:bg-[#A6D608] hover:text-[#1E1E1E] text-white font-black text-sm h-12 rounded-2xl shadow-xl hover:shadow-[#A6D608]/20 transition-all duration-300 group/cta"
        >
          <Link href={`/products?vendor=${vendor.slug}`}>
            Visit Official Store 
            <ArrowRight size={18} className="ml-2 group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
