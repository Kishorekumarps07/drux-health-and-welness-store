"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (success) {
      setCouponSuccess(`${couponDiscount || "?"}% discount applied!`);
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code.");
      setCouponSuccess("");
    }
  };

  const subTotal = subtotal();
  const shipCost = shipping();
  const taxAmt = tax();
  const totalAmt = total();
  const discountAmt = Math.round((subTotal * (couponDiscount ?? 0)) / 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
          <SheetTitle className="font-heading font-bold text-lg text-[#1E1E1E] flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#A6D608]" />
            My Cart
            {items.length > 0 && (
              <Badge className="bg-[#A6D608] text-[#1E1E1E] font-bold ml-1">
                {items.length}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Empty state */}
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any health products yet. Start your wellness journey today!"
            action={{
              label: "Start Shopping",
              onClick: closeCart,
              href: "/products"
            }}
            className="flex-1 border-none bg-transparent"
          />
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-50">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                    {/* Product image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="block"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#A6D608] transition-colors leading-tight">
                          {product.name}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{product.vendor.name}</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Price */}
                        <div>
                          <span className="text-base font-bold text-[#1E1E1E]">
                            ₹{(product.price * quantity).toLocaleString("en-IN")}
                          </span>
                          {quantity > 1 && (
                            <span className="text-xs text-gray-400 ml-1">
                              (₹{product.price.toLocaleString("en-IN")} each)
                            </span>
                          )}
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#A6D608] hover:text-[#A6D608] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= 10}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#A6D608] hover:text-[#A6D608] transition-colors disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors ml-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="px-4 py-3 border-t border-gray-100">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {couponCode} — {couponDiscount}% Off
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        removeCoupon();
                        setCouponSuccess("");
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                      <Tag size={12} /> Apply Coupon
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                          setCouponSuccess("");
                        }}
                        placeholder="Enter coupon code"
                        className="h-9 text-sm uppercase font-mono"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        size="sm"
                        className="h-9 px-3 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white text-xs font-semibold"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      Try: DRUXX10, HEALTH20, FIRST15
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 pt-4 pb-safe space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{subTotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>−₹{discountAmt.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipCost === 0 ? "text-green-600 font-medium" : ""}>
                  {shipCost === 0 ? "FREE" : `₹${shipCost}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (5%)</span>
                <span>₹{taxAmt.toLocaleString("en-IN")}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-[#1E1E1E]">
                <span>Total</span>
                <span>₹{totalAmt.toLocaleString("en-IN")}</span>
              </div>

              {subTotal < 499 && (
                <p className="text-xs text-[#FF7A00] font-medium text-center mt-1">
                  Add ₹{(499 - subTotal).toLocaleString("en-IN")} more for free shipping!
                </p>
              )}

              <Button
                asChild
                onClick={closeCart}
                className="w-full mt-3 bg-[#FF7A00] hover:bg-[#d96600] text-white font-bold h-12 text-base rounded-xl"
                id="proceed-checkout-btn"
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
