"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, ArrowRight, ShieldCheck, Truck, RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { SuggestedProducts } from "@/components/cart/SuggestedProducts";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    shipping,
    tax,
    total,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const subTotal = subtotal();
  const shipCost = shipping();
  const taxAmt = tax();
  const totalAmt = total();
  const discountAmt = Math.round((subTotal * (couponDiscount ?? 0)) / 100);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) {
      setCouponSuccess(`Coupon applied! ${couponDiscount}% off your order.`);
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid or expired coupon code.");
      setCouponSuccess("");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-sm p-12 max-w-lg w-full text-center shadow-md">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <Image src="/empty-cart.png" alt="Empty Cart" fill className="object-contain opacity-20" />
            <ShoppingBag size={64} className="absolute inset-0 m-auto text-[#A6D608] opacity-40" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty!</h1>
          <p className="text-gray-500 text-sm mb-8">Add items to it now.</p>
          <Button
            asChild
            className="bg-[#2874F0] hover:bg-[#1a5abd] text-white font-bold rounded-sm h-12 px-12 text-sm shadow-md transition-all"
          >
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-24 md:pb-12">
      {/* Flipkart Header Style Navigation (Optional but good for context) */}
      <div className="max-w-[1248px] mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Left Column: Flipkart Style Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white shadow-sm border border-gray-200">
              {/* Delivery Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">Check Delivery Services</span>
                </div>
                <div className="text-xs text-[#2874F0] font-bold cursor-pointer">Enter Pincode</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Image & Quantity */}
                      <div className="flex flex-col items-center gap-4 flex-shrink-0">
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="112px"
                          />
                        </div>
                        {/* Qty controls - Flipkart Style */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 active:scale-95"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900 border-none mx-1">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= 10}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-base text-gray-900 hover:text-[#2874F0] transition-colors line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-400 mt-1 font-medium italic">Seller: {product.vendor.name}</p>
                        
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-sm text-gray-400 line-through">₹{(product.originalPrice * quantity).toLocaleString("en-IN")}</span>
                              <span className="text-sm font-bold text-[#388E3C]">{product.discount}% Off</span>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                          <div className="flex items-center gap-1">
                            <Truck size={14} className="text-[#388E3C]" />
                            <span>Free Delivery</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delivery Date */}
                      <div className="text-xs font-medium text-gray-800 shrink-0">
                        Delivery by {new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} | <span className="text-[#388E3C]">Free</span>
                      </div>
                    </div>

                    {/* Action Links - Bottom of Item */}
                    <div className="mt-6 flex items-center gap-8 border-t border-gray-50 pt-4">
                      <button 
                        onClick={() => {/* Save for later logic */}}
                        className="text-sm font-bold text-gray-800 hover:text-[#2874F0] uppercase transition-colors"
                      >
                        Save for later
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-sm font-bold text-gray-800 hover:text-[#2874F0] uppercase transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Place Order Bar (Mobile only) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">₹{totalAmt.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-[#2874F0] font-bold cursor-pointer">View Price Details</span>
                </div>
                <Button
                  asChild
                  className="bg-[#FB641B] hover:bg-[#e85a15] text-white font-bold rounded-sm h-12 px-8 text-sm shadow-md"
                >
                  <Link href="/checkout">Place Order</Link>
                </Button>
              </div>

              {/* Place Order Link (Desktop only) */}
              <div className="hidden lg:flex justify-end p-5 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                <Button
                  asChild
                  className="bg-[#FB641B] hover:bg-[#e85a15] text-white font-bold rounded-sm h-14 px-16 text-sm shadow-md"
                >
                  <Link href="/checkout">Place Order</Link>
                </Button>
              </div>
            </div>

            {/* Suggestions - Flipkart 'More items to consider' style */}
            <div className="bg-white shadow-sm border border-gray-200 mt-4 overflow-hidden">
               <SuggestedProducts />
            </div>
          </div>

          {/* Right Column: Flipkart Style Price Details Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white shadow-sm border border-gray-200">
              <h3 className="px-6 py-4 text-sm font-bold text-gray-500 border-b border-gray-100 uppercase tracking-widest">Price Details</h3>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-800">
                  <span>Price ({items.length} items)</span>
                  <span>₹{subTotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-[#388E3C]">
                    <span>Discount</span>
                    <span>− ₹{discountAmt.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-800">
                  <span>Delivery Charges</span>
                  <span className={shipCost === 0 ? "text-[#388E3C] font-medium" : ""}>
                    {shipCost === 0 ? "FREE" : `₹${shipCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Secured Packaging Fee</span>
                  <span>₹29</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
                  <span>Total Amount</span>
                  <span>₹{(totalAmt + 29).toLocaleString("en-IN")}</span>
                </div>
                <Separator />
                {discountAmt > 0 && (
                  <div className="text-sm font-bold text-[#388E3C] pt-1">
                    You will save ₹{discountAmt.toLocaleString("en-IN")} on this order
                  </div>
                )}
              </div>
            </div>

            {/* Safety Badges */}
            <div className="flex items-center gap-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none justify-center opacity-60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Safe
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} /> Fast
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw size={14} /> Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
