"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { Zap, ArrowRight, Percent } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OfferZone() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Fetch products and filter those with discounts > 0 on frontend for now
        // or we could add a specific 'offers' flag in backend if needed.
        const result = await productService.getAllProducts({ limit: 8 });
        const offerProducts = result.products.filter((p: any) => p.originalPrice && p.originalPrice > p.price);
        setProducts(offerProducts);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (products.length === 0 && !loading) return null;

  return (
    <section className="py-20 px-4 md:px-8 bg-[#F9FAFB] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A6D608]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2CA7A0]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00]/10 text-[#FF7A00] rounded-full border border-[#FF7A00]/20">
              <Zap size={16} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Lightning Deals</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1E1E1E] tracking-tighter uppercase italic leading-[0.9]">
              The <span className="text-[#A6D608]">Offer</span> Zone.
            </h2>
            <p className="text-gray-500 font-medium max-w-md">
              Grab your favorites at unbeatable prices. Health shouldn't break the bank.
            </p>
          </div>
          
          <Link href="/products?sort=discount">
            <Button variant="ghost" className="group text-[#1E1E1E] font-black uppercase tracking-widest text-xs gap-2 hover:bg-transparent hover:text-[#A6D608]">
              View All Offers
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
