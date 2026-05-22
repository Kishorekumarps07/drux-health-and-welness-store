"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ChevronLeft, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = async (product: any) => {
    await addItemToCart(product);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#A6D608] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
          <Heart size={28} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1E1E1E]">My Wishlist</h1>
          <p className="text-gray-500 text-sm">Products you've saved for later</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const imageUrl = product.images?.[0] || "/placeholder-product.png";
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Image Area */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center group overflow-hidden">
                  <Image 
                    src={imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-4 right-4 w-9 h-9 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center shadow-md transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Product Info & Actions */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {product.brand || "DRUXX"}
                    </p>
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="font-bold text-[#1E1E1E] text-sm hover:text-[#A6D608] transition-colors line-clamp-2 min-h-[40px] leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-[#1E1E1E]">
                        ₹{parseFloat(product.price as any).toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && parseFloat(product.originalPrice as any) > parseFloat(product.price as any) && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{parseFloat(product.originalPrice as any).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#1E1E1E] hover:bg-black text-white font-bold h-11 rounded-xl gap-2 transition-all flex items-center justify-center text-xs uppercase tracking-widest"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[45vh]">
          <div className="w-16 h-16 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mb-4">
            <Heart size={32} />
          </div>
          <h3 className="font-black text-[#1E1E1E] text-lg mb-1">Your Wishlist is Empty</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
            Explore our curated wellness store to add products to your wishlist.
          </p>
          <Button asChild className="bg-[#1E1E1E] hover:bg-black text-white font-bold px-8 h-12 rounded-xl">
            <Link href="/products" className="flex items-center gap-1">
              Shop Now <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
