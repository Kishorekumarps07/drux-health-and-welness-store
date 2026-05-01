"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/products/CategoryCard";
import api from "@/lib/api";

export function CategoriesGrid() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data?.data?.categories) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);
  return (
    <section className="py-16 md:py-24 px-4 overflow-visible">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
               <div className="h-px w-8 bg-[#A6D608]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A6D608]">Curated Collections</span>
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-[#1E1E1E] leading-tight">
              Browse Our Premium Wellness Categories
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-4 leading-relaxed font-medium">
              Explore {categories.length} specialized categories designed to help you achieve your health goals with clinical-grade supplements and organic essentials.
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 group text-sm font-black text-[#1E1E1E] hover:text-[#A6D608] transition-all whitespace-nowrap bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md"
          >
            View All Categories
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid - Allow overflow for panels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 relative min-h-[300px]">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
