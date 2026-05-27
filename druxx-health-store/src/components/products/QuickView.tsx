"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Check, ArrowRight, ShieldCheck, Truck, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/types";
import { useState } from "react";

interface QuickViewProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      onOpenChange(false);
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden border-none rounded-[2rem] md:rounded-[3rem] shadow-2xl bg-white">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left: Product Image */}
          <div className="w-full md:w-[45%] relative bg-[#F8F9FA] flex items-center justify-center p-6 md:p-12 overflow-hidden group">
            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-[#FF7A00] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 transform -rotate-2">
                  SAVE {product.discount}%
                </div>
              </div>
            )}

            <div className="relative w-full aspect-square">
              {product.images[0] && (/\.(mp4|webm|mov|ogg)$/i.test(product.images[0]) || product.images[0].includes('/video/upload/') || (product.images[0].includes('res.cloudinary.com') && product.images[0].includes('/video/'))) ? (
                <video
                  src={product.images[0]}
                  poster={product.images[0].replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg").replace('/video/upload/', '/video/upload/so_auto/')}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              ) : (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              )}
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#A6D608]/20 rounded-full blur-[80px]" />
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    {product.brand || product.vendor.name}
                  </span>
                  {product.vendor.isVerified && (
                    <div className="px-2 py-0.5 bg-[#A6D608]/10 text-[#A6D608] text-[8px] font-black rounded-full flex items-center gap-1">
                      <Check size={8} strokeWidth={4} /> VERIFIED
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-[#1E1E1E] leading-tight mb-4">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.floor(product.rating) ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-200"} />
                  ))}
                  <span className="text-sm font-black ml-2 text-[#1E1E1E]">{product.rating.toFixed(1)}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">{product.reviewCount} Reviews</span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                {product.shortDescription || product.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#1E1E1E] tracking-tighter">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-300 line-through font-bold tracking-tighter">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Delivery</p>
                      <p className="text-xs font-black text-[#1E1E1E]">FREE by {formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${product.stock > 0 ? 'bg-[#A6D608]/10' : 'bg-red-50'}`}>
                      <Check size={16} className={product.stock > 0 ? 'text-[#A6D608]' : 'text-red-500'} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Availability</p>
                      <p className={`text-xs font-black ${product.stock > 0 ? 'text-[#A6D608]' : 'text-red-500'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-50">
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 rounded-2xl font-black text-base shadow-xl transition-all duration-300 ${
                    addedToCart 
                      ? "bg-[#1E1E1E] text-[#A6D608] scale-[0.98]" 
                      : "bg-[#A6D608] hover:bg-[#1E1E1E] hover:text-[#A6D608] text-[#1E1E1E] shadow-[#A6D608]/20"
                  }`}
                >
                  {addedToCart ? (
                    <span className="flex items-center gap-2">
                       <Check size={20} strokeWidth={3} /> ADDED TO CART
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       <ShoppingCart size={20} strokeWidth={2.5} /> ADD TO CART
                    </span>
                  )}
                </Button>
                <Button 
                  onClick={toggleWishlist}
                  variant="outline" 
                  className={`w-14 h-14 rounded-2xl border-gray-100 transition-all duration-300 ${
                    isWishlisted ? "text-red-500 border-red-500 bg-red-50" : "text-gray-400 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <Heart 
                    size={20} 
                    strokeWidth={2.5} 
                    className={`transition-all ${isWishlisted ? "fill-red-500" : "group-hover:fill-red-500"}`} 
                  />
                </Button>
              </div>
              
              <Link 
                href={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center gap-2 w-full py-2 text-[10px] font-black text-gray-400 hover:text-[#A6D608] transition-colors uppercase tracking-[0.2em] italic"
              >
                View Full Specifications <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
