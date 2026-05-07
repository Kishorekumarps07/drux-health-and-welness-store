"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowRight, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Filter,
  Package,
  TrendingUp,
  User,
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { VendorHighlights } from "@/components/home/VendorHighlights";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AdvantageCarousel } from "@/components/home/AdvantageCarousel";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      
      {/* Featured dynamic products */}
      <motion.div 
        {...fadeInUp}
        className="relative z-20 mx-auto max-w-7xl px-4 md:px-6 py-8"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
           <FeaturedProducts />
        </div>
      </motion.div>

      {/* The Drux Advantage Carousel */}
      <motion.div {...fadeInUp}>
        <AdvantageCarousel />
      </motion.div>

      {/* Vendor highlights */}
      <motion.div {...fadeInUp}>
        <VendorHighlights />
      </motion.div>

      {/* Newsletter section */}
      <motion.section 
        {...fadeInUp}
        className="py-12 px-4 bg-gradient-to-r from-[#A6D608]/10 to-[#2CA7A0]/10 border-t border-[#A6D608]/20"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-[#1E1E1E] mb-2">
            Stay Healthy, Stay Updated
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Get exclusive offers, health tips, and new arrivals straight to your inbox.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm"
            />
            <Button className="bg-[#1E1E1E] text-white hover:bg-black rounded-xl font-bold px-6">
              Join
            </Button>
          </form>
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
            Join 50,000+ fitness enthusiasts
          </p>
        </div>
      </motion.section>
    </>
  );
}
