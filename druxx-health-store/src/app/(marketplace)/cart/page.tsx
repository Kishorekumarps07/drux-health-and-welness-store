"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, ShieldCheck, Truck, RefreshCw, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { useState } from "react";
import { SuggestedProducts } from "@/components/cart/SuggestedProducts";
import { LocationModal } from "@/components/layout/navbar/LocationModal";
import { Drawer } from "vaul";

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
    couponDiscountAmount,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const { location, setLocation } = useMarketplaceStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPriceDrawer, setShowPriceDrawer] = useState(false);

  const subTotal = subtotal();
  const shipCost = shipping();
  const totalAmt = total();
  const discountAmt = couponDiscountAmount();

  const hasOutOfStockItems = items.some(
    (item) => {
      const stock = item.product?.stock ?? 0;
      return stock === 0 || stock < item.quantity;
    }
  );

  // MRP = sum of originalPrice (if available) else price
  const mrpTotal = items.reduce(
    (acc, { product, quantity }) =>
      acc + ((product.originalPrice ?? product.price) * quantity),
    0
  );
  // Item-level discount (from compare price / originalPrice difference)
  const itemSavings = Math.max(0, mrpTotal - subTotal);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const ok = await applyCoupon(couponInput.trim());
    if (ok) {
      const latestDiscount = useCartStore.getState().couponDiscount;
      setCouponSuccess(`Coupon applied! ${latestDiscount}% off your order.`);
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
      <LocationModal open={showLocationModal} onOpenChange={setShowLocationModal} />
      
      {/* Flipkart Header Style Navigation (Optional but good for context) */}
      <div className="max-w-[1248px] mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Left Column: Flipkart Style Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white shadow-sm border border-gray-200">
              {/* Delivery Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">From Saved Addresses</span>
                </div>
                <button 
                  onClick={() => setShowLocationModal(true)}
                  className="text-xs text-[#2874F0] font-bold cursor-pointer border border-gray-200 px-4 py-2 rounded-sm shadow-sm hover:bg-gray-50"
                >
                  {location.city
                    ? <>Deliver to: <span className="text-gray-900">{location.city}{location.pincode ? ` · ${location.pincode}` : ""}</span></>
                    : <span className="text-[#A6D608]">Select Delivery Location</span>
                  }
                </button>
              </div>

              {/* Warning banner */}
              {hasOutOfStockItems && (
                <div className="bg-red-50 border-b border-red-100 px-6 py-3 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2">
                  <span className="text-red-500 font-bold text-base">⚠️</span>
                  <span>Please remove out-of-stock items or adjust quantities to proceed with your order.</span>
                </div>
              )}

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="p-6">
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image & Quantity */}
                      <div className="flex flex-col items-center gap-3 flex-shrink-0">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 640px) 96px, 128px"
                          />
                        </div>
                        {/* Qty controls - Flipkart Style */}
                        <div className="flex items-center gap-0 mt-1">
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
                            disabled={quantity >= 10 || quantity >= (product.stock ?? 0)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-sm sm:text-base text-gray-900 hover:text-[#2874F0] transition-colors line-clamp-2 leading-tight font-medium">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">Seller: {product.vendor.name}</p>
                          
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="text-base sm:text-lg font-bold text-gray-900">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                            {product.originalPrice > product.price && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-gray-400 line-through">₹{(product.originalPrice * quantity).toLocaleString("en-IN")}</span>
                                <span className="text-xs sm:text-sm font-bold text-[#388E3C]">{product.discount}% Off</span>
                              </div>
                            )}
                          </div>

                          {/* Stock Warnings */}
                          {(product.stock ?? 0) === 0 ? (
                            <div className="mt-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
                              Out of Stock
                            </div>
                          ) : (product.stock ?? 0) < quantity ? (
                            <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                              Only {product.stock} left in stock (Requested: {quantity})
                            </div>
                          ) : null}

                          <div className="mt-2 text-[10px] sm:text-xs font-medium text-gray-800">
                             Delivery by {new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} | <span className="text-[#388E3C]">Free</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          <div className="flex items-center gap-1">
                            <Truck size={14} className="text-[#388E3C]" />
                            <span>Free Delivery</span>
                          </div>
                        </div>
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
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">&#8377;{totalAmt.toLocaleString("en-IN")}</span>
                  <button
                    onClick={() => setShowPriceDrawer(true)}
                    className="text-[11px] text-[#2874F0] font-bold flex items-center gap-0.5 mt-0.5"
                  >
                    View Price Details <ChevronUp size={12} />
                  </button>
                </div>
                {hasOutOfStockItems ? (
                  <Button
                    disabled
                    className="bg-gray-300 text-gray-500 font-bold rounded-sm h-12 px-4 text-xs shadow-none cursor-not-allowed"
                  >
                    Remove sold out items
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-[#FB641B] hover:bg-[#e85a15] text-white font-bold rounded-sm h-12 px-8 text-sm shadow-md"
                  >
                    <Link href="/checkout">Place Order</Link>
                  </Button>
                )}
              </div>

              {/* Place Order Link (Desktop only) */}
              <div className="hidden lg:flex justify-end p-5 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                {hasOutOfStockItems ? (
                  <Button
                    disabled
                    className="bg-gray-300 text-gray-500 font-bold rounded-sm h-14 px-12 text-sm shadow-none cursor-not-allowed"
                  >
                    Remove Out of Stock Items to Proceed
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-[#FB641B] hover:bg-[#e85a15] text-white font-bold rounded-sm h-14 px-16 text-sm shadow-md"
                  >
                    <Link href="/checkout">Place Order</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Suggestions - Flipkart 'More items to consider' style */}
            <div className="bg-white shadow-sm border border-gray-200 mt-4 overflow-hidden">
               <SuggestedProducts />
            </div>
          </div>

          {/* Right Column: Flipkart Style Price Details Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            {/* Coupon Card */}
            <div className="bg-white shadow-sm border border-gray-200 p-6 space-y-4 rounded-sm">
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                      {couponCode} — {couponDiscount}% OFF
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      setCouponSuccess("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={14} className="text-[#A6D608]" />
                    Apply Coupon
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponSuccess("");
                      }}
                      placeholder="Enter coupon code"
                      className="h-10 text-sm uppercase font-mono rounded-sm border-gray-300 focus:border-[#A6D608] focus:ring-[#A6D608]/15"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      className="h-10 px-6 bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold rounded-sm uppercase tracking-wider transition-colors"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 font-medium">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-green-600 font-bold">{couponSuccess}</p>
                  )}
                  <p className="text-[10px] text-gray-400 font-medium">
                    Try: DRUXX10, HEALTH20, FIRST15, ORGANIC25
                  </p>
                </div>
              )}
            </div>

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
                <Separator />
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
                  <span>Total Amount</span>
                  <span>₹{totalAmt.toLocaleString("en-IN")}</span>
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

      {/* ── Price Details Bottom Drawer (Mobile) ───────────────────────── */}
      <Drawer.Root open={showPriceDrawer} onOpenChange={setShowPriceDrawer}>
        <Drawer.Portal>
          {/* Backdrop */}
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />

          {/* Sheet */}
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl outline-none"
            style={{ maxHeight: "85dvh" }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-3 border-b border-gray-100">
              <Drawer.Title className="text-base font-bold text-gray-900 tracking-wide uppercase">
                Price Details
              </Drawer.Title>
              {items.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {items.reduce((a, i) => a + i.quantity, 0)} item
                  {items.reduce((a, i) => a + i.quantity, 0) > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Breakdown rows */}
            <div className="px-5 py-4 space-y-0 overflow-y-auto" style={{ maxHeight: "55dvh" }}>

              {/* MRP */}
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-700">
                  Price ({items.reduce((a, i) => a + i.quantity, 0)} item
                  {items.reduce((a, i) => a + i.quantity, 0) > 1 ? "s" : ""})
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  ₹{mrpTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Item-level discount (from originalPrice vs price) */}
              {itemSavings > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-700">Discount</span>
                  <span className="text-sm text-[#388E3C] font-semibold">
                    − ₹{itemSavings.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Coupon discount */}
              {discountAmt > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <span className="text-sm text-gray-700">Coupon Discount</span>
                    {couponCode && (
                      <span className="ml-2 text-[10px] font-bold text-[#388E3C] bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                        {couponCode}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[#388E3C] font-semibold">
                    − ₹{discountAmt.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Delivery */}
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <span className="text-sm text-gray-700">Delivery Charges</span>
                  {shipCost === 0 && subTotal > 0 && (
                    <span className="ml-2 text-[10px] font-bold text-[#388E3C] bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </div>
                {shipCost === 0 ? (
                  <div className="text-right">
                    <span className="text-sm text-gray-400 line-through mr-1">₹49</span>
                    <span className="text-sm text-[#388E3C] font-semibold">FREE</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900 font-medium">₹{shipCost}</span>
                )}
              </div>

              {/* Divider before total */}
              <div className="border-t-2 border-dashed border-gray-200 my-1" />

              {/* Total */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-base font-bold text-gray-900">
                  ₹{totalAmt.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Savings banner */}
              {(itemSavings > 0 || discountAmt > 0 || shipCost === 0) && (
                <div className="bg-[#F0FDF4] border border-green-200 rounded-xl px-4 py-3 mt-2">
                  <p className="text-sm font-bold text-[#15803D] text-center">
                    🎉 You will save ₹
                    {(itemSavings + discountAmt + (shipCost === 0 && subTotal > 0 ? 49 : 0)).toLocaleString("en-IN")}
                    {" "}on this order
                  </p>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              {hasOutOfStockItems ? (
                <Button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold rounded-sm h-12 text-xs shadow-none cursor-not-allowed"
                >
                  Remove Out of Stock Items to Proceed
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-[#FB641B] hover:bg-[#e85a15] text-white font-bold rounded-sm h-12 text-sm shadow-md"
                >
                  <Link href="/checkout" onClick={() => setShowPriceDrawer(false)}>
                    Place Order · ₹{totalAmt.toLocaleString("en-IN")}
                  </Link>
                </Button>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

    </div>
  );
}

