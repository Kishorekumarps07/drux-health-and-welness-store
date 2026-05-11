"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingCart, 
  Check, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { Product } from "@/types";
import { QuickView } from "./QuickView";
import { cn } from "@/lib/utils";

const isVideo = (url: string) => url ? (/\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes('/video/upload/') || (url.includes('res.cloudinary.com') && url.includes('/video/'))) : false;
const getThumbnail = (url: string) => {
  if (!url) return "/placeholder.png";
  if (isVideo(url)) {
    // Cloudinary video thumbnail trick: replace extension with .jpg and add auto start offset
    return url.replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg").replace('/video/upload/', '/video/upload/so_auto/');
  }
  return url;
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartStatus, setCartStatus] = useState<"idle" | "loading" | "success">("idle");
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const discountAmount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (product.stock === 0) return;

    setCartStatus("loading");
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem(product as any);
    setCartStatus("success");
    
    setTimeout(() => {
      setCartStatus("idle");
    }, 2000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "group relative bg-white rounded-2xl sm:rounded-2xl p-1.5 sm:p-4 border border-gray-100 transition-all duration-200",
          "hover:shadow-xl hover:border-gray-200 cursor-pointer flex flex-col h-full",
          className
        )}
      >
        <Link href={`/products/${product.slug || product.id}`} className="absolute inset-0 z-0" />

        {/* Image Container */}
        <div className="relative aspect-[4/5] rounded-xl sm:rounded-xl bg-gray-50 overflow-hidden mb-4 sm:mb-4 flex items-center justify-center">
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full h-full p-2 sm:p-4"
          >
            {product.images?.[0] && isVideo(product.images[0]) ? (
              isHovered ? (
                <video
                  src={product.images[0]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Image
                  src={getThumbnail(product.images[0])}
                  alt={product.name || "Product Image"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )
            ) : (
              <Image
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name || "Product Image"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
          </motion.div>

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
            {discountAmount > 0 && (
              <Badge className="bg-[#A6D608] text-[#1E1E1E] border-none font-black text-[10px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm">
                {discountAmount}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={toggleWishlist}
            className={cn(
              "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300",
              isWishlisted ? "bg-red-50 text-red-500" : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500"
            )}
          >
            <Heart 
              size={14} 
              className={cn("sm:w-4.5 transition-transform duration-300", isWishlisted && "fill-current scale-110")} 
            />
          </button>

          {/* Quick View Overlay (Desktop Only) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden lg:flex absolute inset-0 bg-black/5 items-center justify-center z-10"
              >
                <Button
                  onClick={openQuickView}
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-md text-[#1E1E1E] font-black text-[10px] uppercase tracking-widest rounded-full px-5 py-2 h-9 shadow-lg hover:bg-[#A6D608] hover:text-[#1E1E1E] border-none"
                >
                  <Eye size={14} className="mr-2" /> Quick View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 relative z-1 pointer-events-none">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate italic">
              {product.vendor?.name || "Druxx Seller"}
            </span>
          </div>

          <h3 className="text-sm sm:text-lg font-black text-[#1E1E1E] line-clamp-2 leading-tight min-h-[2.5rem] sm:min-h-[3rem] mb-1 sm:mb-2 group-hover:text-[#A6D608] transition-colors tracking-tight">
            {product.name}
          </h3>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {product.rating ? (
              <>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="sm:w-3 fill-[#FF7A00] text-[#FF7A00]" />
                  <span className="text-[11px] sm:text-xs font-black text-gray-900">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] sm:text-[10px] text-gray-400 font-medium">({product.reviewCount || 0})</span>
              </>
            ) : (
              <span className="text-[12px] sm:text-xs text-[#A6D608] font-medium">No reviews</span>
            )}
          </div>

          {/* Pricing Section */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-gray-600 font-medium line-through opacity-80">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>

          {/* Stock Logic */}
          <div className="mt-auto">
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-[10px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 mb-1.5 sm:mb-2">
                <AlertCircle size={10} className="sm:w-2.5" /> Only {product.stock} left
              </p>
            )}
            
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartStatus === "loading"}
              className={cn(
                "w-full h-9 sm:h-11 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-[10px] uppercase tracking-[0.1em] transition-all duration-300 pointer-events-auto",
                cartStatus === "success" 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-[#1E1E1E] hover:bg-[#A6D608] hover:text-[#1E1E1E] text-white shadow-lg"
              )}
            >
              {cartStatus === "loading" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : cartStatus === "success" ? (
                <span className="flex items-center gap-1.5 sm:gap-2 animate-in zoom-in-95">
                  <Check size={14} strokeWidth={3} className="sm:w-4" /> Added ✓
                </span>
              ) : product.stock === 0 ? (
                "Sold Out"
              ) : (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <ShoppingCart size={12} className="sm:w-3.5" /> Add
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <QuickView 
        product={product as any} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </>
  );
}
