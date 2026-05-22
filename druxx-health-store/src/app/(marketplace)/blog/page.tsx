"use client";

import { useState } from "react";
import { Search, Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Nutrition", "Fitness", "Ayurvedic", "Mental Health"];

const BLOGS = [
  {
    id: 1,
    title: "Understanding Gut Microbiome: The Key to Stronger Immunity",
    category: "Nutrition",
    date: "May 18, 2026",
    readTime: "6 Min Read",
    author: "Dr. Ananya Nair, R.D.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800",
    snippet: "Discover how your gut health influences overall immunity, mood, and nutrient absorption, and learn which probiotics actually make a difference."
  },
  {
    id: 2,
    title: "5 Ayurvedic Herbs to Reduce Stress and Enhance Focus",
    category: "Ayurvedic",
    date: "May 14, 2026",
    readTime: "4 Min Read",
    author: "Acharya Vaidya Sharma",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
    snippet: "From Ashwagandha to Brahmi, explore how traditional adaptogenic herbs support cognitive clarity and cortisol regulation naturally."
  },
  {
    id: 3,
    title: "The Science of Hypertrophy: Protein Timing vs. Total Intake",
    category: "Fitness",
    date: "April 29, 2026",
    readTime: "8 Min Read",
    author: "Coach Rohan Malhotra",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800",
    snippet: "Does it really matter if you drink your shake within 30 minutes of working out? We dissect the latest research on protein timing."
  },
  {
    id: 4,
    title: "Mindful Eating: Breaking Free from Emotional Snack Triggers",
    category: "Mental Health",
    date: "April 20, 2026",
    readTime: "5 Min Read",
    author: "Sneha Rao, Cognitive Psychologist",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
    snippet: "Practical techniques to recognize physical hunger cues versus emotional stress triggers, reclaiming control over your relationship with food."
  },
  {
    id: 5,
    title: "Plant-Based Protein vs. Whey: Which is Better for Recovery?",
    category: "Nutrition",
    date: "March 11, 2026",
    readTime: "7 Min Read",
    author: "Dr. Ananya Nair, R.D.",
    image: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800",
    snippet: "We compare amino acid profiles, digestion rates, and bio-availability metrics to help you choose the right powder for your body."
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = BLOGS.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Health Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            The Druxx <span className="text-[#A6D608]">Chronicles</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Evidence-based nutritional science, training logs, wellness rituals, and vendor highlights compiled by certified experts.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-150 pb-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#1E1E1E] text-white"
                    : "bg-white border border-gray-150 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search health articles..."
              className="pl-11 h-11 rounded-xl border-gray-100 bg-white shadow-sm font-semibold text-sm"
            />
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-6xl mx-auto px-4">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.id} 
                className="bg-white border border-gray-150/50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-500" 
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/95 text-gray-800 backdrop-blur-sm shadow-sm">
                    {blog.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime}</span>
                    </div>
                    <h3 className="font-black text-lg text-gray-900 tracking-tight leading-snug hover:text-[#2CA7A0] transition-colors cursor-pointer">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {blog.snippet}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-650 font-bold">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={12} className="text-gray-400" />
                      </div>
                      <span>{blog.author}</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-lime-500 hover:text-white flex items-center justify-center border border-gray-100 transition-all text-gray-500">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-150/50 rounded-[2rem]">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              No matching wellness articles found.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
