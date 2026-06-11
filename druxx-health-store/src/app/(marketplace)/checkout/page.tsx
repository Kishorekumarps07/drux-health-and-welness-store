"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { couponService, Coupon } from "@/services/couponService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  Truck,
  ShieldCheck,
  Package,
  ArrowLeft,
  Minus,
  Trash2,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRazorpay } from "react-razorpay";

const STEPS = [
  { id: 1, name: "Delivery Address" },
  { id: 2, name: "Payment Method" },
  { id: 3, name: "Review Order" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    items, 
    total, 
    subtotal, 
    shipping, 
    tax, 
    couponCode,
    couponDiscount, 
    couponDiscountAmount,
    applyCoupon,
    removeCoupon,
    clearCart, 
    syncWithServer, 
    updateQuantity, 
    removeItem 
  } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const hasOutOfStockItems = items.some(
    (item) => {
      const stock = item.product?.stock ?? 0;
      return stock === 0 || stock < item.quantity;
    }
  );

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

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
  const { Razorpay } = useRazorpay();

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const getDeliveryDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingAddresses(true);
        setIsLoadingCoupons(true);
        await syncWithServer();
        const data = await userService.getAddresses();
        setAddresses(data);
        const def = data.find((a: any) => a.isDefault);
        if (def) setAddressId(def.id);

        const activeCps = await couponService.getActiveCoupons();
        setActiveCoupons(activeCps);
      } catch (error) {
        console.error("Failed to load checkout data", error);
      } finally {
        setIsLoadingAddresses(false);
        setIsLoadingCoupons(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, syncWithServer]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneTrimmed = newAddress.phone.trim();
    if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(phoneTrimmed)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const pincodeTrimmed = newAddress.pincode.trim();
    if (pincodeTrimmed.length !== 6 || !/^\d{6}$/.test(pincodeTrimmed)) {
      toast.error("Pincode must be exactly 6 digits.");
      return;
    }

    try {
      const saved = await userService.createAddress({
        ...newAddress,
        phone: phoneTrimmed,
        pincode: pincodeTrimmed,
        street: newAddress.line1 + (newAddress.line2 ? ", " + newAddress.line2 : ""),
      });
      setAddresses([...addresses, saved]);
      setAddressId(saved.id);
      setShowAddressForm(false);
      toast.success("Address added successfully");
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressId) {
      toast.error("Please select a delivery address");
      setCurrentStep(1);
      return;
    }

    const freshItems = useCartStore.getState().items;
    const hasOOS = freshItems.some(
      (item) => {
        const stock = item.product?.stock ?? 0;
        return stock === 0 || stock < item.quantity;
      }
    );
    if (hasOOS) {
      toast.error("Some items in your cart are out of stock. Please adjust your cart before placing the order.");
      setIsPlacingOrder(false);
      return;
    }

    setIsPlacingOrder(true);
    try {
      if (paymentMethod === "COD") {
        const order = await orderService.placeOrder({
          addressId,
          paymentMethod: "COD",
          couponCode: couponCode || undefined,
        });
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/dashboard/orders/${order.id}?success=true`);
      } else {
        const { razorpayOrder } = await orderService.createPaymentIntent({
          couponCode: couponCode || undefined,
          addressId,
        });

        const options = {
          key: razorpayOrder.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Druxx Health Store",
          description: "Premium Wellness Products",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              const order = await orderService.verifyAndCreateOrder({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                addressId,
                couponCode: couponCode || undefined,
              });
              toast.success("Payment successful! Order confirmed.");
              clearCart();
              router.push(`/dashboard/orders/${order.id}?success=true`);
            } catch (err) {
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: "#A6D608" },
        };

        const rzp = new Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 font-medium">Add some premium wellness products to your life before checking out.</p>
          <Link href="/">
            <Button className="bg-black text-[#A6D608] rounded-full px-12 h-14 font-black uppercase text-xs tracking-widest transition-all hover:scale-105 shadow-xl">
              Explore Store
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const selectedAddress = addresses.find(a => a.id === addressId);

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-24 font-sans text-gray-900">
      {/* Minimal Flipkart/Amazon Style Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#2874F0] font-semibold text-sm transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <Link href="/" className="flex items-center">
              <Image
                src="/druxlogo.png"
                alt="Drux Health Store"
                width={150}
                height={50}
                className="h-[52px] md:h-[68px] w-auto object-contain"
                priority
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-[10px] sm:text-xs md:text-sm text-right justify-end shrink-0 max-w-[120px] sm:max-w-none">
            <Lock className="text-[#2874F0] w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="leading-tight">100% Safe & Secure <span className="hidden sm:inline">Checkout</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* Left Column: Flipkart-Style Accordion (2/3 width) */}
          <div className="flex-1 w-full space-y-3">
            
            {/* STEP 1: LOGIN DETAILS */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              {currentStep === 1 ? (
                <div>
                  <div className="bg-[#2874F0] text-white px-6 py-4 flex items-center gap-4">
                    <span className="bg-white text-[#2874F0] font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">1</span>
                    <h3 className="font-bold uppercase text-sm tracking-wider">Login or Signup</h3>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Logged in as <span className="font-bold">{user?.name}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      </div>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="bg-[#FB641B] hover:bg-[#e05310] text-white font-bold px-8 h-11 rounded-sm text-xs uppercase tracking-wider"
                      >
                        Continue Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-100 text-gray-500 font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">1</span>
                    <div>
                      <span className="font-bold uppercase text-[11px] text-gray-400 block tracking-wider">Login Details</span>
                      <span className="text-sm font-semibold text-gray-800">{user?.name} <span className="text-gray-400 font-normal">| {user?.email}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-[#2874F0] font-bold text-xs uppercase border border-gray-200 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              {currentStep === 2 ? (
                <div>
                  <div className="bg-[#2874F0] text-white px-6 py-4 flex items-center gap-4">
                    <span className="bg-white text-[#2874F0] font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">2</span>
                    <h3 className="font-bold uppercase text-sm tracking-wider">Delivery Address</h3>
                  </div>
                  
                  <div className="p-6 bg-white space-y-4">
                    {isLoadingAddresses ? (
                      <div className="text-center py-6 text-sm text-gray-500 font-medium">Loading your saved addresses...</div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => setAddressId(addr.id)}
                            className={cn(
                              "relative p-4 rounded-sm border cursor-pointer transition-all flex items-start gap-4",
                              addressId === addr.id 
                                ? "border-gray-200 bg-gray-50/50" 
                                : "border-gray-100 hover:border-gray-200"
                            )}
                          >
                            <div className="mt-1">
                              <div className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center",
                                addressId === addr.id ? "border-[#2874F0]" : "border-gray-300"
                              )}>
                                {addressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#2874F0]" />}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                                <Badge className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-sm border-none px-2 py-0.5">
                                  {addr.label}
                                </Badge>
                                <span className="font-bold text-sm text-gray-900">{addr.phone}</span>
                              </div>
                              
                              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                {addr.street || addr.line1}, {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                              </p>

                              {addressId === addr.id && (
                                <div className="mt-4">
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentStep(3);
                                    }}
                                    className="bg-[#FB641B] hover:bg-[#e05310] text-white font-bold px-8 h-11 rounded-sm text-xs uppercase tracking-wider shadow-md"
                                  >
                                    Deliver Here
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add New Address Accordion Tab */}
                        {!showAddressForm ? (
                          <button 
                            onClick={() => setShowAddressForm(true)}
                            className="w-full p-4 border border-dashed border-gray-300 hover:border-[#2874F0] hover:bg-blue-50/20 rounded-sm flex items-center justify-center gap-2 text-[#2874F0] font-bold text-xs uppercase transition-colors"
                          >
                            <Plus size={16} />
                            <span>Add a New Address</span>
                          </button>
                        ) : (
                          <form onSubmit={handleAddAddress} className="bg-gray-50/50 p-5 rounded-sm border border-gray-200 mt-4 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Add a New Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input 
                                placeholder="Full Name" 
                                value={newAddress.fullName} 
                                onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} 
                                required 
                                className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                              />
                              <Input 
                                placeholder="10-digit Phone Number" 
                                value={newAddress.phone} 
                                onChange={e => setNewAddress({...newAddress, phone: e.target.value})} 
                                required 
                                className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                              />
                            </div>
                            <Input 
                              placeholder="Street Address / Area / Landmark" 
                              value={newAddress.line1} 
                              onChange={e => setNewAddress({...newAddress, line1: e.target.value})} 
                              required 
                              className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                            />
                            <div className="grid grid-cols-3 gap-4">
                              <Input 
                                placeholder="City" 
                                value={newAddress.city} 
                                onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                                required 
                                className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                              />
                              <Input 
                                placeholder="State" 
                                value={newAddress.state} 
                                onChange={e => setNewAddress({...newAddress, state: e.target.value})} 
                                required 
                                className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                              />
                              <Input 
                                placeholder="6-digit Pincode" 
                                value={newAddress.pincode} 
                                onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} 
                                required 
                                className="h-11 rounded-sm border-gray-300 focus:border-[#2874F0] text-sm" 
                              />
                            </div>
                            <div className="flex gap-4 pt-2">
                              <Button 
                                type="submit" 
                                className="bg-[#2874F0] text-white hover:bg-[#1a64dc] font-bold uppercase tracking-wider text-xs px-6 h-11 rounded-sm"
                              >
                                Save & Deliver Here
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setShowAddressForm(false)} 
                                className="font-bold uppercase tracking-wider text-xs text-gray-500 h-11"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-100 text-gray-500 font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">2</span>
                    <div>
                      <span className="font-bold uppercase text-[11px] text-gray-400 block tracking-wider">Delivery Address</span>
                      {selectedAddress ? (
                        <span className="text-sm font-semibold text-gray-800">
                          {selectedAddress.fullName} - {selectedAddress.street || selectedAddress.line1}, {selectedAddress.city} - {selectedAddress.pincode}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No delivery address selected</span>
                      )}
                    </div>
                  </div>
                  {currentStep > 2 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-[#2874F0] font-bold text-xs uppercase border border-gray-200 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3: ORDER SUMMARY */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              {currentStep === 3 ? (
                <div>
                  <div className="bg-[#2874F0] text-white px-6 py-4 flex items-center gap-4">
                    <span className="bg-white text-[#2874F0] font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">3</span>
                    <h3 className="font-bold uppercase text-sm tracking-wider">Order Summary</h3>
                  </div>
                  
                  <div className="p-6 bg-white">
                    <div className="space-y-6 mb-6">
                      {items.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                        const originalPrice = hasDiscount ? product.originalPrice : Math.round(Number(product.price) * 1.25);
                        const discountPercent = hasDiscount ? product.discount : 20;
                        
                        const stock = product.stock ?? 0;
                        const isOutOfStock = stock === 0;
                        const isLowStock = !isOutOfStock && stock < item.quantity;

                        return (
                          <div key={item.id} className="flex gap-4 sm:gap-6 py-5 border-b border-gray-100 last:border-b-0 group">
                            {/* Left Side: Product Image & Quantity Controls */}
                            <div className="flex flex-col items-center gap-3 flex-shrink-0">
                              <div className="relative w-20 h-20 bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center rounded-sm overflow-hidden">
                                <Image 
                                  src={product.images?.[0] || "/placeholder.png"} 
                                  alt={product.name} 
                                  fill
                                  className="object-contain p-1"
                                  sizes="80px"
                                  priority
                                />
                              </div>
                              
                              {/* Qty Controls */}
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, Math.max(1, item.quantity - 1))}
                                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors active:scale-95 cursor-pointer"
                                >
                                  <Minus size={10} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-gray-900 select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                  disabled={item.quantity >= 10 || item.quantity >= stock}
                                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors active:scale-95 cursor-pointer"
                                >
                                  <Plus size={10} strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Right Side: Product Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between pl-2">
                              <div>
                                <p className="text-sm sm:text-base font-medium text-gray-900 hover:text-[#2874F0] line-clamp-2 leading-tight transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">Seller: {product.vendor?.name || "Drux Official"}</p>
                                
                                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                                  <span className="text-base sm:text-lg font-bold text-gray-900">₹{(Number(product.price) * item.quantity).toLocaleString("en-IN")}</span>
                                  {originalPrice > product.price && (
                                    <>
                                      <span className="text-xs sm:text-sm text-gray-400 line-through">₹{(originalPrice * item.quantity).toLocaleString("en-IN")}</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#388E3C]">{discountPercent}% Off</span>
                                    </>
                                  )}
                                </div>

                                {/* Stock Warnings */}
                                {isOutOfStock && (
                                  <div className="mt-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
                                    Out of Stock
                                  </div>
                                )}
                                {isLowStock && (
                                  <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                                    Only {stock} unit{stock > 1 ? "s" : ""} left (Requested: {item.quantity})
                                  </div>
                                )}

                                <div className="mt-3 text-[10px] sm:text-xs font-medium text-gray-800">
                                  Delivery by {getDeliveryDateString()} | <span className="text-[#388E3C] font-semibold">Free Delivery</span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-6 border-t border-gray-50 pt-3">
                                <button
                                  type="button"
                                  onClick={() => removeItem(product.id)}
                                  className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} className="text-gray-400" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      {hasOutOfStockItems ? (
                        <Button 
                          disabled
                          className="bg-gray-300 text-gray-500 font-bold px-8 h-11 rounded-sm text-xs uppercase tracking-wider cursor-not-allowed"
                        >
                          Remove Out of Stock Items to Proceed
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setCurrentStep(4)}
                          className="bg-[#FB641B] hover:bg-[#e05310] text-white font-bold px-10 h-11 rounded-sm text-xs uppercase tracking-wider shadow-md"
                        >
                          Continue to Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-100 text-gray-500 font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">3</span>
                    <div>
                      <span className="font-bold uppercase text-[11px] text-gray-400 block tracking-wider">Order Summary</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {items.length} {items.length === 1 ? "Item" : "Items"} in order
                      </span>
                    </div>
                  </div>
                  {currentStep > 3 && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-[#2874F0] font-bold text-xs uppercase border border-gray-200 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* STEP 4: PAYMENT OPTIONS */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              {currentStep === 4 ? (
                <div>
                  <div className="bg-[#2874F0] text-white px-6 py-4 flex items-center gap-4">
                    <span className="bg-white text-[#2874F0] font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">4</span>
                    <h3 className="font-bold uppercase text-sm tracking-wider">Payment Options</h3>
                  </div>
                  
                  <div className="p-6 bg-white space-y-4">
                    {[
                      { id: "RAZORPAY", name: "Online Payment (UPI, Cards, NetBanking)", desc: "Safe, fast, and secure checkout via Razorpay", icon: CreditCard },
                      { id: "COD", name: "Cash on Delivery (COD)", desc: "Pay with cash when order is delivered", icon: Truck }
                    ].map((method) => (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "p-4 rounded-sm border cursor-pointer transition-all flex items-start gap-4",
                          paymentMethod === method.id 
                            ? "border-gray-200 bg-gray-50/50" 
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="mt-1">
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            paymentMethod === method.id ? "border-[#2874F0]" : "border-gray-300"
                          )}>
                            {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-[#2874F0]" />}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-bold text-sm text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">{method.desc}</p>

                          {paymentMethod === method.id && (
                            <div className="mt-4">
                              {hasOutOfStockItems ? (
                                <div className="space-y-3">
                                  <p className="text-xs text-red-600 font-bold">
                                    Some items in your cart are out of stock. Please return to the cart page to adjust your items.
                                  </p>
                                  <Button 
                                    disabled
                                    className="bg-gray-300 text-gray-500 font-bold px-10 h-12 rounded-sm text-xs uppercase tracking-wider cursor-not-allowed"
                                  >
                                    Cannot Place Order (Out of Stock Items)
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  disabled={isPlacingOrder}
                                  onClick={handlePlaceOrder}
                                  className="bg-[#FB641B] hover:bg-[#e05310] text-white font-bold px-10 h-12 rounded-sm text-xs uppercase tracking-wider shadow-lg"
                                >
                                  {isPlacingOrder ? "Placing Order..." : paymentMethod === "COD" ? "Confirm Order (COD)" : "Pay & Place Order"}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center justify-between bg-white opacity-60">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-100 text-gray-400 font-bold w-5 h-5 flex items-center justify-center text-xs rounded-sm">4</span>
                    <div>
                      <span className="font-bold uppercase text-[11px] text-gray-400 block tracking-wider">Payment Options</span>
                      <span className="text-sm font-semibold text-gray-400">Select payment method at the final step</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Flipkart-Style Price Details (1/3 width) */}
          <aside className="w-full lg:w-80 space-y-4 sticky top-20">
            {hasOutOfStockItems && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-xs font-semibold text-red-700 flex items-start gap-2 shadow-sm">
                <span className="text-red-500 font-bold text-base leading-none">⚠️</span>
                <div>
                  <p className="font-bold text-red-800">Items Out of Stock</p>
                  <p className="mt-0.5 text-gray-600">Please return to the cart page to remove or adjust out of stock items.</p>
                  <Link href="/cart" className="text-blue-600 underline font-bold mt-1.5 block">Go to Cart</Link>
                </div>
              </div>
            )}

            {/* Coupon Card */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6 space-y-4">
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
                  {activeCoupons.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Available Coupons</p>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                        {activeCoupons.map((coupon) => (
                          <div 
                            key={coupon.id} 
                            onClick={() => {
                              setCouponInput(coupon.code);
                              setCouponError("");
                              setCouponSuccess("");
                            }}
                            className="flex items-center justify-between p-1.5 border border-dashed border-gray-200 hover:border-[#A6D608] hover:bg-[#A6D608]/5 rounded-sm cursor-pointer transition-colors"
                          >
                            <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">{coupon.code}</span>
                            <span className="text-[11px] font-bold text-green-600">{coupon.discountPercent}% OFF</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !isLoadingCoupons && (
                      <p className="text-[10px] text-gray-400 font-medium">No coupons available at the moment.</p>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              <h3 className="font-bold uppercase text-gray-500 text-[13px] tracking-wider px-6 py-4 border-b border-gray-100">
                Price Details
              </h3>
              
              <div className="p-6 space-y-4 text-sm font-medium">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({items.length} {items.length === 1 ? "item" : "items"})</span>
                  <span>₹{subtotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className={shipping() === 0 ? "text-green-600 font-bold" : ""}>
                    {shipping() === 0 ? "FREE" : `₹${shipping()}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span>₹{tax().toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{couponDiscountAmount().toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-center text-gray-900">
                  <span className="text-base font-bold">Amount Payable</span>
                  <span className="text-base font-bold">₹{total().toLocaleString()}</span>
                </div>
              </div>
              
              {couponDiscount > 0 && (
                <div className="bg-green-50/50 border-t border-gray-100 px-6 py-3.5 text-xs font-bold text-green-600 flex items-center gap-1.5 rounded-b-sm">
                  <span>★</span>
                  <span>You will save ₹{couponDiscountAmount().toLocaleString()} on this order!</span>
                </div>
              )}
            </div>

            {/* Safe Shopping Guarantee Banner */}
            <div className="flex items-start gap-3 p-4 bg-[#F9FAFB] border border-gray-200 rounded-sm">
              <ShieldCheck size={28} className="text-gray-400 shrink-0" />
              <div className="text-xs text-gray-500 font-medium leading-relaxed">
                <p className="font-bold text-gray-600">Safe and Secure Payments</p>
                <p className="mt-0.5">Your payment security is our top priority. We use secure servers and trusted APIs to handle your payment details.</p>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-16 py-8 border-t border-gray-200 text-center text-xs text-gray-400 font-medium space-y-3">
        <div className="flex flex-wrap justify-center gap-6 text-blue-600 font-bold uppercase tracking-wider">
          <span className="cursor-pointer hover:underline">Conditions of Use</span>
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Help & FAQs</span>
        </div>
        <p>© 2026 Drux Health and Wellness Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
