"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types";
import { toast } from "sonner";

function parseSpecs(text: string | undefined) {
  if (!text) return [];
  const labels = [
    "Product details Batteries",
    "Batteries",
    "Product Dimensions",
    "Date First Available",
    "Manufacturer",
    "ASIN",
    "Item model number",
    "Country of Origin",
    "Department",
    "Packer",
    "Importer",
    "Item Weight",
    "Item Dimensions LxWxH",
    "Net Quantity",
    "Generic Name"
  ];
  
  const foundSpecs: { label: string; value: string }[] = [];
  const sortedLabels = [...labels].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedLabels.join('|')})\\s*:\\s*`, 'g');
  
  let match;
  const matches: { label: string; index: number; length: number }[] = [];
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      label: match[1].replace("Product details ", ""),
      index: match.index,
      length: match[0].length
    });
  }
  
  if (matches.length === 0) return [];
  
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    const startVal = currentMatch.index + currentMatch.length;
    const endVal = nextMatch ? nextMatch.index : text.length;
    let value = text.substring(startVal, endVal).trim();
    value = value.replace(/(^,\s*)|(,\s*$)/g, '');
    if (value && !foundSpecs.some((s) => s.label.toLowerCase() === currentMatch.label.toLowerCase())) {
      foundSpecs.push({ label: currentMatch.label, value });
    }
  }
  return foundSpecs;
}

interface ProductViewProps {
  product: Product;
  related: Product[];
  reviews: any[];
}

export function ProductView({ product, related, reviews }: ProductViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes('/video/upload/') || (url.includes('res.cloudinary.com') && url.includes('/video/'));

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-[175px] md:top-[160px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#A6D608] transition-colors shrink-0">Home</Link>
            <ChevronRight size={12} className="shrink-0" />
            <Link href="/products" className="hover:text-[#A6D608] transition-colors shrink-0">Products</Link>
            <ChevronRight size={12} className="shrink-0" />
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-[#A6D608] transition-colors shrink-0"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-gray-900 font-medium truncate min-w-0">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Media Gallery */}
            <div className="lg:col-span-5 space-y-3 sticky top-24">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                {product.images && product.images.length > 0 && isVideo(product.images[selectedImage]) ? (
                  <video
                    src={product.images[selectedImage]}
                    poster={product.images[selectedImage].replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg").replace('/video/upload/', '/video/upload/so_auto/')}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={product.images && product.images.length > 0 ? product.images[selectedImage] : "/placeholder.png"}
                    alt={product.name || "Product Image"}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-[#CC0C39] text-white border-0 font-medium text-xs px-2 py-0.5 rounded-sm">
                      {product.discount}% OFF
                    </Badge>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    const shareData = {
                      title: product.name,
                      text: product.shortDescription || `Check out ${product.name} on Druxx Health Store!`,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      navigator.share(shareData).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#A6D608] hover:text-white hover:border-[#A6D608] transition-all shadow-sm active:scale-95 group"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setSelectedImage(i)}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                        selectedImage === i
                          ? "border-[#007185] ring-2 ring-[#007185]/20 shadow-2xs"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {img && isVideo(img) ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={img.replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg").replace('/video/upload/', '/video/upload/so_auto/')} 
                            alt={(product.name || "Product") + ` video ${i + 1}`} 
                            fill 
                            className="object-cover" 
                            sizes="56px" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center shadow-xs">
                              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-[#007185] border-b-[3px] border-b-transparent ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image 
                          src={img || "/placeholder.png"} 
                          alt={(product.name || "Product") + ` view ${i + 1}`} 
                          fill 
                          className="object-contain p-1" 
                          sizes="56px" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Center Column */}
            <div className="lg:col-span-4 flex flex-col">
              <Link
                href={`/products?vendor=${product.vendor.slug}`}
                className="text-xs sm:text-sm font-semibold text-[#007185] hover:text-[#C45500] hover:underline transition-all block mb-1"
              >
                Visit the {product.vendor.name} Store
              </Link>

              <h1 className="text-lg sm:text-xl font-medium text-gray-900 leading-snug tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2 pb-2 border-b border-gray-200 text-xs flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className={s <= Math.round(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#007185] hover:underline cursor-pointer">{product.reviewCount} ratings</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  {product.discount > 0 && (
                    <span className="text-xl sm:text-2xl font-light text-[#CC0C39]">-{product.discount}%</span>
                  )}
                  <span className="text-2xl sm:text-3xl font-medium text-gray-900">
                    <span className="text-xs align-super font-normal">₹</span>
                    {product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                {product.originalPrice > product.price && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  </p>
                )}
                <span className="text-xs font-medium text-gray-500 block mt-0.5">Inclusive of all taxes</span>
              </div>

              {(() => {
                const specs = parseSpecs(product.description || product.shortDescription);
                return (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <table className="w-full text-xs text-gray-800 border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-100 last:border-0">
                          <td className="py-1.5 font-bold w-2/5 text-gray-700">Sold By</td>
                          <td className="py-1.5 w-3/5 text-[#007185] font-medium">{product.vendor.name}</td>
                        </tr>
                        {specs.slice(0, 7).map((s, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-1.5 font-bold w-2/5 text-gray-700">{s.label}</td>
                            <td className="py-1.5 w-3/5 text-gray-900 font-medium">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {(() => {
                const highlights = product.metadata?.highlights?.filter((h: string) => h.trim().length > 0) || [];
                if (highlights.length === 0) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-[10px] font-black text-[#1E1E1E] uppercase tracking-[0.2em] mb-4">Highlights</h3>
                    <div className="space-y-3">
                      {highlights.map((h: string, idx: number) => {
                        const hasEmoji = h.match(/^\p{Emoji}/u);
                        const emoji = hasEmoji ? h.split(' ')[0] : null;
                        const text = emoji ? h.split(' ').slice(1).join(' ') : h;
                        return (
                          <div key={idx} className="relative pl-5 py-0.5 border-l-2 border-[#A6D608]/30 hover:border-[#A6D608] transition-colors group">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-gray-900 leading-tight flex items-center gap-2">
                                {emoji && <span className="text-sm">{emoji}</span>}
                                {text}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Buybox */}
            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs space-y-3 sticky top-24">
                <span className="text-xl font-medium text-gray-900 block">
                  <span className="text-xs align-super font-normal">₹</span>
                  {product.price.toLocaleString("en-IN")}
                </span>
                <div className="text-xs text-gray-600 leading-snug">
                  <span className="text-[#007185] font-semibold">FREE delivery</span> on eligible items.
                </div>
                <div className="text-xs font-semibold text-[#007600]">In stock</div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50/50">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold">-</button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold">+</button>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    className={`w-full h-10 rounded-full font-medium text-xs transition-all shadow-xs ${addedToCart ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900"}`}
                  >
                    {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
                  </Button>
                  <Button asChild className="w-full h-10 rounded-full font-medium text-xs bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 shadow-xs block text-center leading-10">
                    <Link href="/checkout" onClick={() => addItem(product, quantity)}>Buy Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200 p-4 sm:p-8 space-y-8 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#C45500] mb-3 uppercase tracking-wider">Product Description</h2>
            <div className="text-sm text-gray-800 leading-relaxed max-w-4xl font-medium">
              {(() => {
                const rawDescription = product.description || "";
                if (!rawDescription) return <p className="text-gray-500 italic">No description available.</p>;
                return rawDescription.split(/\n+/).map((para, pIdx) => {
                  const trimmedPara = para.trim();
                  if (!trimmedPara) return null;

                  // If a line starts with a bullet-like character, treat it as a styled list item
                  const isListItem = trimmedPara.startsWith('•') || trimmedPara.startsWith('-') || trimmedPara.startsWith('*');
                  
                  if (isListItem) {
                    // Just remove the bullet character for our custom bullet styling
                    const cleanPoint = trimmedPara.replace(/^[•\-*]\s*/, '');
                    return (
                      <ul key={pIdx} className="space-y-3 mb-4">
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#A6D608] mt-2 shrink-0 shadow-[0_0_8px_rgba(166,214,8,0.4)]" />
                          <span className="text-sm font-medium text-gray-700 leading-relaxed">{cleanPoint}</span>
                        </li>
                      </ul>
                    );
                  }

                  // Default paragraph rendering for normal text blocks
                  return <p key={pIdx} className="mb-5 whitespace-pre-line leading-relaxed text-gray-700">{para}</p>;
                });
              })()}
            </div>
          </div>
          <Separator />
          <div>
            <h2 className="text-base font-bold text-[#C45500] mb-4 uppercase tracking-wider">Customer Reviews</h2>
            <div className="space-y-4 max-w-3xl">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-[#A6D608] border border-[#A6D608]/20 shadow-sm">
                        {review.userName[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold text-[13px] text-gray-900 leading-none">{review.userName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} className={s <= review.rating ? "fill-[#FFA41C] text-[#FFA41C]" : "fill-gray-200 text-gray-200"} />
                          ))}
                          {review.verified && (
                            <span className="text-[9px] font-bold text-[#C45500] ml-2 flex items-center gap-1">
                              <ShieldCheck size={10} /> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium pl-10">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-gray-500 text-xs italic">No reviews yet.</div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200 p-4 sm:p-6">
            <h2 className="text-base font-bold text-[#C45500] mb-4 uppercase tracking-wider">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
