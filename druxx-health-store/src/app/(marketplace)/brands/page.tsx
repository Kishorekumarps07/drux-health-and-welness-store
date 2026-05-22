"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const BRANDS = [
  { name: "Organic India", slug: "organic-india", desc: "Premium organic herbal teas, tulsi infusions, and traditional Ayurvedic supplements.", rating: 4.8, category: "Ayurvedic" },
  { name: "MuscleBlaze", slug: "muscleblaze", desc: "India's leading sports nutrition brand specializing in whey proteins, creatine, and pre-workouts.", rating: 4.6, category: "Sports Nutrition" },
  { name: "Himalaya Wellness", slug: "himalaya", desc: "Trusted herbal personal care, baby products, and daily health remedies since 1930.", rating: 4.7, category: "Herbal Care" },
  { name: "Optimum Nutrition", slug: "optimum-nutrition", desc: "Gold Standard protein formulations engineered for elite athletic recovery and performance.", rating: 4.9, category: "Sports Nutrition" },
  { name: "Kapiva", slug: "kapiva", desc: "Modern Ayurvedic nutrition including juices, wild honey, shilajit, and herbal weight-care products.", rating: 4.5, category: "Ayurvedic" },
  { name: "True Elements", slug: "true-elements", desc: "100% clean whole foods, rolled oats, seeds, and breakfast cereals free from preservatives.", rating: 4.7, category: "Organic Food" },
  { name: "Banyan Botanicals", slug: "banyan-botanicals", desc: "Sustainably sourced, USDA certified organic Ayurvedic herbs and massage oils.", rating: 4.8, category: "Ayurvedic" }
];

export default function BrandsPage() {
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = BRANDS.filter((brand) => {
    const matchesLetter = selectedLetter === "All" || brand.name.toUpperCase().startsWith(selectedLetter);
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brand.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brand.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLetter && matchesSearch;
  });

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Brand Partners</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Our Featured <span className="text-[#A6D608]">Brands</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            We collaborate with the finest wellness and organic suppliers in India. Search and browse their full catalogs below.
          </p>
        </div>
      </section>

      {/* Directory Filters */}
      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name or category..."
            className="pl-11 h-12 rounded-xl border-gray-100 bg-white shadow-sm font-semibold text-sm"
          />
        </div>

        {/* Alphabet Bar */}
        <div className="flex flex-wrap gap-1 justify-center border-y border-gray-150 py-4 overflow-x-auto">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-8 h-8 rounded-lg text-xs font-black uppercase flex items-center justify-center transition-all ${
                selectedLetter === letter
                  ? "bg-[#1E1E1E] text-white"
                  : "text-gray-450 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* Brands Grid */}
      <section className="max-w-6xl mx-auto px-4">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBrands.map((brand, i) => (
              <div 
                key={i} 
                className="bg-white border border-gray-150/50 rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full space-y-6"
              >
                <div className="space-y-4">
                  {/* Badge & Rating */}
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-lime-500/10 text-lime-700">
                      {brand.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      <Star size={14} className="text-[#FF7A00] fill-[#FF7A00]" />
                      <span>{brand.rating}</span>
                    </div>
                  </div>

                  {/* Brand info */}
                  <div className="space-y-1.5">
                    <h3 className="font-black text-xl text-gray-900 tracking-tight">{brand.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{brand.desc}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <Link
                    href={`/products?brand=${brand.slug}`}
                    className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-zinc-950 hover:text-[#2CA7A0] transition-colors"
                  >
                    <span>Browse Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-150/50 rounded-[2rem]">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              No brand partners matching your selection.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
