"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        setProduct(data);
        
        // Fetch related products
        const relData = await productService.getAllProducts({
          categoryId: data.categoryId,
          limit: 4
        });
        setRelated(relData.products.filter((p: any) => p.id !== data.id));

        // Fetch real reviews
        const reviewData = await productService.getReviews(data.id);
        setReviews(reviewData);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A6D608] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discountAmount = product.originalPrice - product.price;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#A6D608] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-[#A6D608] transition-colors">Products</Link>
            <ChevronRight size={12} />
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-[#A6D608] transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Amazon/Flipkart Listing Top Container */}
        <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Media Gallery (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-3 sticky top-24">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                {product.images && product.images.length > 0 && (/\.(mp4|webm|mov|ogg)$/i.test(product.images[selectedImage]) || product.images[selectedImage].includes('/video/upload/') || (product.images[selectedImage].includes('res.cloudinary.com') && product.images[selectedImage].includes('/video/'))) ? (
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
              </div>

              {/* Thumbnails */}
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
                      {img && (/\.(mp4|webm|mov|ogg)$/i.test(img) || img.includes('/video/upload/') || (img.includes('res.cloudinary.com') && img.includes('/video/'))) ? (
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

            {/* Center Column: Product Details & Specifications (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col">
              {/* Brand Store Link */}
              <Link
                href={`/products?vendor=${product.vendor.slug}`}
                className="text-xs sm:text-sm font-semibold text-[#007185] hover:text-[#C45500] hover:underline transition-all block mb-1"
              >
                Visit the {product.vendor.name} Store
              </Link>

              {/* Title */}
              <h1 className="text-lg sm:text-xl font-medium text-gray-900 leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Combined Star Ratings & Origin Trust Strip */}
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

              {/* Pricing section */}
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

              {/* Quick Specs preview table */}
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

              {/* Product Highlights (Dynamic or Default) */}
              {(() => {
                const highlights = product.metadata?.highlights?.filter((h: string) => h.trim().length > 0) || [];
                const defaultHighlights = [
                  { title: "✨ Premium Grade", desc: "Quality Assured" },
                  { title: "🛡️ 100% Authentic", desc: "Verified Origin" },
                  { title: "📦 Vendor Direct", desc: "Direct Fulfillment" },
                  { title: "🌱 Eco-Sourced", desc: "Sustainable Choice" },
                  { title: "⚡ Optimum Efficacy", desc: "High Performance" }
                ];

                const displayHighlights = highlights.length > 0 
                  ? highlights.map((h: string) => ({ title: h, desc: "Verified Quality" }))
                  : defaultHighlights;

                return (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">Product Highlights</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {displayHighlights.map((highlight, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "border border-gray-200 bg-gray-50/50 rounded-lg p-2 flex flex-col justify-center items-center text-center hover:border-[#007185] transition-colors",
                            idx === 4 && displayHighlights.length === 5 ? "sm:col-span-1" : ""
                          )}
                        >
                          <span className="text-[11px] font-bold text-gray-900 block leading-tight truncate w-full">{highlight.title}</span>
                          <span className="text-[9px] text-gray-500 block truncate w-full">{highlight.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* About this item / Bullets */}
              {(() => {
                let narrative = product.description || product.shortDescription || "";
                const ksIdx = narrative.indexOf("Product details");
                if (ksIdx > 30) {
                  narrative = narrative.substring(0, ksIdx).trim();
                } else if (ksIdx !== -1) {
                  narrative = narrative.replace(/^Product details\s*/i, "").trim();
                }
                if (!narrative) return null;
                // split into nice scannable bullet points
                const sentences = narrative.split(/\.(?=\s|[A-Z])/).map(s => s.trim()).filter(s => s.length > 10);
                return (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">About this item</h3>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-gray-800 leading-relaxed font-medium">
                      {sentences.length > 0 ? (
                        sentences.map((sentence, idx) => (
                          <li key={idx}>{sentence + (sentence.endsWith(".") ? "" : ".")}</li>
                        ))
                      ) : (
                        <li>{narrative}</li>
                      )}
                    </ul>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Amazon Action Buybox Card (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs space-y-3 sticky top-24">
                <span className="text-xl font-medium text-gray-900 block">
                  <span className="text-xs align-super font-normal">₹</span>
                  {product.price.toLocaleString("en-IN")}
                </span>

                <div className="text-xs text-gray-600 leading-snug">
                  <span className="text-[#007185] font-semibold">FREE delivery</span> on eligible marketplace vendor items.
                </div>

                <div className="text-xs font-semibold text-[#007600]">
                  In stock
                </div>

                <div className="text-[11px] text-gray-500 space-y-1 border-y border-gray-100 py-2">
                  <div className="flex justify-between"><span className="w-2/5">Ships from</span><span className="w-3/5 text-gray-800 font-medium truncate">Druxx Fulfilled</span></div>
                  <div className="flex justify-between"><span className="w-2/5">Sold by</span><span className="w-3/5 text-[#007185] font-medium truncate">{product.vendor.name}</span></div>
                  {product.vendor.isVerified && (
                    <div className="flex justify-between"><span className="w-2/5">Guarantor</span><span className="w-3/5 text-emerald-600 font-bold">Verified Direct</span></div>
                  )}
                </div>

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
                  
                  <Button
                    asChild
                    className="w-full h-10 rounded-full font-medium text-xs bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 shadow-xs block text-center leading-10"
                  >
                    <Link href="/checkout" onClick={() => addItem(product, quantity)}>Buy Now</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] justify-center pt-1">
                  <ShieldCheck size={14} className="text-gray-400" />
                  <span>Secure transaction</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Stacked Product Details Sections (Amazon/Flipkart Layout Architecture) */}
        <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200 p-4 sm:p-8 space-y-8 mb-6">
          
          {/* Section 1: Product Description */}
          <div>
            <h2 className="text-base font-bold text-[#C45500] mb-3 uppercase tracking-wider">Product Description</h2>
            <div className="text-xs sm:text-sm text-gray-800 leading-relaxed max-w-4xl space-y-3 font-medium whitespace-pre-line">
              {(() => {
                let narrative = product.description || "";
                const ksIdx = narrative.indexOf("Product details");
                if (ksIdx > 30) {
                  narrative = narrative.substring(0, ksIdx).trim();
                } else if (ksIdx !== -1) {
                  narrative = narrative.replace(/^Product details\s*/i, "").trim();
                }
                return narrative ? <p>{narrative}</p> : <p className="text-gray-500 italic">Product description provided directly by authorized store {product.vendor.name}.</p>;
              })()}
            </div>
          </div>

          <Separator />

          {/* Section 2: Technical Details Table */}
          {(() => {
            const specs = parseSpecs(product.description);
            return (
              <div>
                <h2 className="text-base font-bold text-[#C45500] mb-3 uppercase tracking-wider">Technical Details</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-w-3xl shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <th className="bg-[#F3F3F3] p-2.5 w-1/3 font-bold text-gray-700 border-r border-gray-200">Vendor Origin</th>
                        <td className="p-2.5 w-2/3 text-gray-900 font-semibold">{product.vendor.name}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="bg-[#F3F3F3] p-2.5 w-1/3 font-bold text-gray-700 border-r border-gray-200">Category</th>
                        <td className="p-2.5 w-2/3 text-gray-900 font-semibold">{product.category}</td>
                      </tr>
                      {specs.map((s, idx) => (
                        <tr key={idx} className="border-b border-gray-200 last:border-0">
                          <th className="bg-[#F3F3F3] p-2.5 w-1/3 font-bold text-gray-700 border-r border-gray-200">{s.label}</th>
                          <td className="p-2.5 w-2/3 text-gray-900 font-medium">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          <Separator />

          {/* Section 3: Delivery Trust Strip */}
          <div>
            <h2 className="text-base font-bold text-[#C45500] mb-4 uppercase tracking-wider">Marketplace Guarantees</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Truck size={20} className="text-[#007185]" />, title: "Free Delivery", desc: "Fulfilled direct for active items above ₹499." },
                { icon: <RefreshCw size={20} className="text-[#007185]" />, title: "30 Days Returns", desc: "Hassle-free replacement if unsatisfied." },
                { icon: <ShieldCheck size={20} className="text-[#007185]" />, title: "100% Secure Origin", desc: `Directly collected from ${product.vendor.name}.` },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">{item.icon}</div>
                  <div>
                    <p className="font-bold text-xs text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-600 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Section 4: Customer Reviews */}
          <div>
            <h2 className="text-base font-bold text-[#C45500] mb-4 uppercase tracking-wider">Customer Reviews</h2>
            <div className="space-y-4 max-w-3xl">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {review.user?.name ? review.user.name[0].toUpperCase() : "C"}
                      </div>
                      <p className="font-semibold text-xs text-gray-900">{review.user?.name || "Amazon Customer"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} className={s <= review.rating ? "fill-[#FFA41C] text-[#FFA41C]" : "fill-gray-200 text-gray-200"} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-800">{review.title}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 block mb-2">Reviewed on {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-gray-500 text-xs italic">
                  No customer reviews found. Be the first to write a review.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
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
