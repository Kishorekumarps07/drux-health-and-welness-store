"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

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
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <div className="w-28 h-28 rounded-full bg-white border border-gray-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag size={48} className="text-gray-200" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-[#1E1E1E] mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Looks like you haven&apos;t added any products yet. Start exploring our health store!
          </p>
          <Button
            asChild
            className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-xl h-12 px-8"
            id="continue-shopping-btn"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#A6D608]">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-heading font-bold text-2xl text-[#1E1E1E]">
            Shopping Cart
            <span className="text-gray-400 font-normal text-base ml-2">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </h1>
          <button
            onClick={() => clearCart()}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <Link href={`/products/${product.slug}`}>
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#2CA7A0] font-semibold mb-0.5">
                        {product.vendor.name}
                      </p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug hover:text-[#A6D608] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {product.discount > 0 && (
                    <Badge className="bg-[#FF7A00]/10 text-[#FF7A00] border-0 text-[10px] mt-1.5">
                      {product.discount}% off
                    </Badge>
                  )}

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg text-[#1E1E1E]">
                        ₹{(product.price * quantity).toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{(product.originalPrice * quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#A6D608] transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= 10}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#A6D608] transition-colors disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm text-[#A6D608] font-semibold hover:text-[#8ab506] transition-colors mt-2"
            >
              <ArrowRight size={14} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-heading font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={15} className="text-[#A6D608]" /> Apply Coupon
              </h3>

              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-xs font-bold text-green-700">{couponCode} applied</p>
                    <p className="text-[10px] text-green-600">{couponDiscount}% discount</p>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      setCouponSuccess("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponSuccess("");
                      }}
                      placeholder="Enter coupon code"
                      className="h-10 text-sm uppercase font-mono"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      id="coupon-input"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      className="h-10 px-4 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white text-xs font-semibold flex-shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-green-600 mt-1.5">{couponSuccess}</p>}
                  <p className="text-[10px] text-gray-400 mt-2">
                    Try: DRUXX10, HEALTH20, FIRST15, ORGANIC25
                  </p>
                </>
              )}
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28">
              <h3 className="font-heading font-semibold text-base text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subTotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({couponCode})</span>
                    <span>−₹{discountAmt.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={shipCost === 0 ? "text-green-600 font-medium" : ""}>
                    {shipCost === 0 ? "FREE" : `₹${shipCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span>
                  <span>₹{taxAmt.toLocaleString("en-IN")}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base text-[#1E1E1E]">
                  <span>Total</span>
                  <span>₹{totalAmt.toLocaleString("en-IN")}</span>
                </div>
                {discountAmt + (subTotal > 499 ? 0 : 0) > 0 && (
                  <div className="text-center text-xs text-green-600 font-semibold bg-green-50 rounded-lg py-1.5">
                    🎉 You&apos;re saving ₹{discountAmt.toLocaleString("en-IN")} on this order!
                  </div>
                )}
              </div>

              {subTotal < 499 && (
                <p className="text-xs text-[#FF7A00] text-center mt-3 font-medium">
                  Add ₹{(499 - subTotal).toLocaleString("en-IN")} more for free delivery!
                </p>
              )}

              <Button
                asChild
                className="w-full mt-4 h-12 bg-[#FF7A00] hover:bg-[#d96600] text-white font-bold rounded-xl text-sm"
                id="checkout-btn"
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400">
                <span>🔒 Secure checkout</span>
                <span>·</span>
                <span>🚚 Fast delivery</span>
                <span>·</span>
                <span>↩️ Easy returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
