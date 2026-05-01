"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Check, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types";
import { useState } from "react";

interface QuickViewProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Mock calculated delivery date (Today + 1-2 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-3xl bg-white animate-in zoom-in-95 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery (Single Image for Quick View) */}
          <div className="relative aspect-square md:aspect-auto bg-gray-50 flex items-center justify-center p-8 overflow-hidden border-r border-gray-100">
             <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                {product.discount > 0 && (
                  <Badge className="bg-[#FF7A00] hover:bg-[#FF7A00] text-white font-black px-3 py-1.5 rounded-full text-[11px] shadow-lg shadow-orange-500/20 border-none">
                    SAVE {product.discount}%
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-[#1E1E1E] hover:bg-[#1E1E1E] text-[#A6D608] font-black px-3 py-1.5 rounded-full text-[11px] border-none shadow-lg shadow-black/10">
                    BEST SELLER
                  </Badge>
                )}
             </div>

             <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain mix-blend-multiply drop-shadow-2xl"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
             </div>
             
             {/* Subtle Decorative Elements */}
             <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#A6D608]/10 rounded-full blur-[80px]" />
             <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/5 rounded-full blur-[80px]" />
          </div>

          {/* Right: Product Details */}
          <div className="p-8 lg:p-12 flex flex-col bg-white">
             {/* Header */}
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {product.brand || product.vendor.name}
                   </span>
                   {product.vendor.isVerified && (
                      <div className="px-2 py-0.5 bg-[#A6D608]/10 text-[#A6D608] text-[9px] font-black rounded-full flex items-center gap-1">
                         <Check size={8} strokeWidth={4} /> VERIFIED
                      </div>
                   )}
                </div>
                <h2 className="text-2xl lg:text-3xl font-heading font-black text-[#1E1E1E] leading-tight mb-4">
                   {product.name}
                </h2>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.floor(product.rating) ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-200"} />
                      ))}
                      <span className="text-sm font-bold ml-1">{product.rating.toFixed(1)}</span>
                   </div>
                   <div className="w-1 h-1 bg-gray-300 rounded-full" />
                   <span className="text-sm font-bold text-gray-400">{product.reviewCount} Reviews</span>
                </div>
             </div>

             {/* Description Snippet */}
             <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                {product.shortDescription || product.description}
             </p>

             {/* Pricing & Stock */}
             <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-2">
                   <span className="text-3xl lg:text-4xl font-heading font-black text-[#1E1E1E]">
                      ₹{product.price.toLocaleString("en-IN")}
                   </span>
                   {product.originalPrice > product.price && (
                     <span className="text-lg text-gray-400 line-through font-medium">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                     </span>
                   )}
                </div>
                
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-sm">
                      <Truck size={16} className="text-[#A6D608]" />
                      <span className="font-bold text-gray-700">FREE delivery by </span>
                      <span className="font-black text-[#1E1E1E]">{formattedDate}</span>
                   </div>
                   {product.stock < 10 ? (
                      <p className="text-xs font-black text-red-500 flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg w-fit">
                         <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                         Only {product.stock} items left in stock
                      </p>
                   ) : (
                      <p className="text-xs font-bold text-green-600 flex items-center gap-2">
                         <Check size={14} strokeWidth={3} /> In Stock & Ready to Ship
                      </p>
                   )}
                </div>
             </div>

             {/* Actions */}
             <div className="mt-auto space-y-3">
                <div className="flex gap-3">
                   <Button 
                      onClick={handleAddToCart}
                      className={`flex-1 h-14 rounded-2xl font-black text-base shadow-xl transition-all duration-300 ${
                        addedToCart 
                          ? "bg-[#2CA7A0] text-white scale-[0.98]" 
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
                   <Button variant="outline" className="w-14 h-14 rounded-2xl border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-400 group">
                      <Heart size={20} strokeWidth={2.5} className="group-hover:fill-red-500 transition-all" />
                   </Button>
                </div>
                
                <Link 
                   href={`/products/${product.slug}`}
                   onClick={() => onOpenChange(false)}
                   className="flex items-center justify-center gap-2 w-full py-4 text-xs font-black text-gray-400 hover:text-[#1E1E1E] transition-colors uppercase tracking-widest"
                >
                   View Full Product Details <ArrowRight size={14} />
                </Link>
             </div>

             {/* Trust Badges */}
             <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={18} className="text-gray-400" />
                   <span className="text-[10px] font-bold text-gray-500 leading-tight uppercase tracking-tight">Genuine Products Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                   <Truck size={18} className="text-gray-400" />
                   <span className="text-[10px] font-bold text-gray-500 leading-tight uppercase tracking-tight">Trusted Delivery Network</span>
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
