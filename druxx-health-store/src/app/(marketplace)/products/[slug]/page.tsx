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
        {/* Product main section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
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
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-[#FF7A00] text-white border-0 font-bold text-sm px-2">
                      -{product.discount}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i
                          ? "border-[#A6D608]"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {img && (/\.(mp4|webm|mov|ogg)$/i.test(img) || img.includes('/video/upload/') || (img.includes('res.cloudinary.com') && img.includes('/video/'))) ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={img.replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg").replace('/video/upload/', '/video/upload/so_auto/')} 
                            alt={(product.name || "Product") + ` video ${i + 1}`} 
                            fill 
                            className="object-cover" 
                            sizes="64px" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-[#A6D608] border-b-[3px] border-b-transparent ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image 
                          src={img || "/placeholder.png"} 
                          alt={(product.name || "Product") + ` view ${i + 1}`} 
                          fill 
                          className="object-cover" 
                          sizes="64px" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col gap-4">
              <Link
                href={`/products?vendor=${product.vendor.slug}`}
                className="flex items-center gap-1.5 text-sm text-[#2CA7A0] font-semibold hover:text-[#248a84] transition-colors"
              >
                {product.vendor.name}
                {product.vendor.isVerified && <ShieldCheck size={15} className="text-[#2CA7A0]" />}
              </Link>

              <h1 className="font-heading font-bold text-xl md:text-2xl text-[#1E1E1E] leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-[#FF7A00]/10 px-2 py-1 rounded-lg">
                  <Star size={14} className="fill-[#FF7A00] text-[#FF7A00]" />
                  <span className="text-sm font-bold text-[#FF7A00]">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{product.reviewCount} reviews</span>
                <span className="text-gray-200">|</span>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#1E1E1E]">₹{product.price.toLocaleString("en-IN")}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                </div>
                {discountAmount > 0 && <p className="text-sm text-green-600 font-semibold">You save ₹{discountAmount.toLocaleString("en-IN")} ({product.discount}% off)</p>}
              </div>

              <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{product.shortDescription}</div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Minus size={14} /></button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Plus size={14} /></button>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 font-bold text-sm rounded-xl transition-all ${addedToCart ? "bg-green-500 text-white" : "bg-[#A6D608] text-[#1E1E1E]"}`}
                >
                  {addedToCart ? "✓ Added!" : <><ShoppingCart size={16} className="mr-2" /> Add to Cart</>}
                </Button>
                <Button asChild className="flex-1 h-12 bg-[#FF7A00] hover:bg-[#d96600] text-white font-bold text-sm rounded-xl">
                  <Link href="/checkout" onClick={() => addItem(product, quantity)}><Zap size={16} className="mr-2" /> Buy Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-6">
          <Tabs defaultValue="description">
            <TabsList className="bg-gray-50 border border-gray-100 mb-6 p-1 rounded-xl">
              <TabsTrigger value="description" className="text-sm rounded-lg">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm rounded-lg">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="shipping" className="text-sm rounded-lg">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>{product.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[{ label: "Brand", value: product.brand }, { label: "Weight", value: product.weight }, { label: "SKU", value: product.sku }, { label: "Category", value: product.category }].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      <p className="text-sm text-gray-800 font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{review.user?.name || "Customer"}</p>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={s <= review.rating ? "fill-[#FF7A00] text-[#FF7A00]" : "fill-gray-200 text-gray-200"} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm italic">No reviews yet for this product.</p>
                    <p className="text-gray-900 text-sm font-bold mt-2">Be the first to review!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shipping">
               <div className="space-y-4 text-sm text-gray-700">
                {[
                  { icon: <Truck size={18} className="text-[#A6D608]" />, title: "Free Delivery", desc: "Above ₹499." },
                  { icon: <RefreshCw size={18} className="text-[#2CA7A0]" />, title: "30-Day Returns", desc: "Easy returns if unsatisfied." },
                  { icon: <ShieldCheck size={18} className="text-[#FF7A00]" />, title: "Authenticity", desc: "100% verified products." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">{item.icon}</div>
                    <div><p className="font-semibold text-gray-900 mb-1">{item.title}</p><p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
            <h2 className="font-heading font-bold text-lg text-[#1E1E1E] mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
