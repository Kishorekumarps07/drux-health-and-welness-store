"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";

export function SuggestedProducts() {
  const { items, addItem } = useCartStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Get category IDs from cart items
        const categoryIds = Array.from(new Set(items.map(item => item.product.categoryId)));
        const cartProductIds = new Set(items.map(item => item.product.id));

        // Fetch products from these categories
        const res = await productService.getAllProducts({
          categoryId: categoryIds[0], // Take the first item's category for simplicity
          limit: 10
        });

        // Filter out items already in cart
        const filtered = res.products
          .filter((p: Product) => !cartProductIds.has(p.id))
          .slice(0, 3);

        setSuggestions(filtered);
      } catch (err) {
        console.error("Failed to fetch cart suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [items.length]); // Re-fetch only when items count changes

  if (items.length === 0 || suggestions.length === 0) return null;

  return (
    <div className="px-4 py-6 border-t border-gray-100 bg-gray-50/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#A6D608]/20 flex items-center justify-center">
          <Sparkles size={14} className="text-[#1E1E1E]" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Suggested for you</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((product) => (
          <div 
            key={product.id} 
            className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="56px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">
                {product.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-black text-[#1E1E1E]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <Button
                  onClick={() => addItem(product)}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full bg-[#A6D608] hover:bg-[#1E1E1E] text-[#1E1E1E] hover:text-white transition-all shadow-sm"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-3 text-center italic font-medium">
          "Wellness is better shared. Add these to your routine!"
        </p>
      )}
    </div>
  );
}
