"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products?category=${category.slug}`}
        id={`category-card-${category.id}`}
        className={`group relative overflow-hidden rounded-3xl border border-gray-100 bg-white flex flex-col transition-all duration-500 ease-out transform ${
          isHovered 
            ? "scale-105 -translate-y-1 shadow-2xl z-30" 
            : "scale-100 translate-y-0 shadow-sm z-20"
        }`}
        style={{ 
          minHeight: "160px",
          boxShadow: isHovered ? `0 20px 40px -10px ${category.color || '#A6D608'}40` : "" 
        }}
      >
        {/* Background image & Gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src={category.image || "https://images.unsplash.com/photo-1542282088-fe8426682b8f"}
            alt={category.name}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? "opacity-40 scale-110" : "opacity-20 scale-100"
            }`}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ 
              background: category.gradient || "linear-gradient(to top right, #3f3f46, #18181b)", 
              opacity: isHovered ? 0.95 : 0.85 
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-5 text-center">
          <div className={`text-4xl mb-3 transition-transform duration-500 ${isHovered ? "scale-125 rotate-6" : "scale-100 rotate-0"}`}>
            {category.icon || "📦"}
          </div>
          <h3 className="font-heading font-extrabold text-white text-[15px] leading-tight drop-shadow-md tracking-tight">
            {category.name}
          </h3>
          <p className="text-white/80 text-[10px] font-bold mt-1.5 uppercase tracking-widest">{category.productCount || 0} products</p>

          {/* Hover Status */}
          <div className={`flex items-center gap-1.5 mt-3 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <span className="text-white text-[11px] font-black uppercase tracking-tighter">Explore Now</span>
            <ArrowRight size={14} className="text-white" strokeWidth={3} />
          </div>
        </div>
      </Link>

      {/* Subcategory Preview Panel (Desktop Only) */}
      <div 
        className={`absolute top-full left-0 right-0 mt-3 p-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl z-50 transition-all duration-300 origin-top pointer-events-none md:pointer-events-auto ${
          isHovered ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-4 scale-95 invisible"
        }`}
      >
        <div className="flex flex-col gap-2.5">
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Popular in {category.name}</span>
          <div className="flex flex-col gap-1">
            {(category.subcategories || []).map((sub) => (
              <Link
                key={sub}
                href={`/products?category=${category.slug}&tag=${sub.toLowerCase()}`}
                className="flex items-center justify-between group/sub px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-bold text-[#1E1E1E] group-hover/sub:text-[#A6D608] transition-colors">{sub}</span>
                <ChevronRight size={14} className="text-gray-300 group-hover/sub:text-[#A6D608] translate-x-[-4px] group-hover/sub:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
          <Link 
            href={`/products?category=${category.slug}`}
            className="mt-2 text-center py-2 text-[10px] font-black uppercase tracking-widest text-[#A6D608] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View All Series
          </Link>
        </div>
      </div>
    </div>
  );
}

