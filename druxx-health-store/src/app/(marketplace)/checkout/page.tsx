"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
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
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRazorpay } from "react-razorpay";

const STEPS = [
  { id: 1, name: "Delivery Address" },
  { id: 2, name: "Payment Method" },
  { id: 3, name: "Review Order" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, subtotal, shipping, tax, couponDiscount, clearCart, syncWithServer } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { Razorpay } = useRazorpay();

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingAddresses(true);
        await syncWithServer();
        const data = await userService.getAddresses();
        setAddresses(data);
        const def = data.find((a: any) => a.isDefault);
        if (def) setAddressId(def.id);
      } catch (error) {
        console.error("Failed to load addresses", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, syncWithServer]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await userService.createAddress({
        ...newAddress,
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

    setIsPlacingOrder(true);
    try {
      if (paymentMethod === "COD") {
        const order = await orderService.placeOrder({
          addressId,
          paymentMethod: "COD",
        });
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/dashboard/orders/${order.id}?success=true`);
      } else {
        const { razorpayOrder } = await orderService.createPaymentIntent();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
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
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      {/* Amazon-style Minimal Header */}
      <header className="bg-[#131921] py-3 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#A6D608] p-1.5 rounded-lg">
              <span className="font-black text-black text-xl leading-none">D</span>
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase">Druxx</span>
          </Link>
          <h1 className="text-white font-medium text-xl hidden md:block">Checkout</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <Lock size={18} className="text-[#A6D608]" />
            <span className="text-sm font-medium">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Main Checkout Sections (Left) */}
          <div className="flex-1 w-full space-y-4">
            
            {/* 1. Delivery Address Section */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className={cn(
                "p-4 flex items-center justify-between border-b transition-colors",
                currentStep === 1 ? "bg-gray-50" : "bg-white"
              )}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-black text-[#A6D608] text-sm font-black">1</span>
                  <h3 className="font-bold text-lg uppercase tracking-tight">Delivery Address</h3>
                </div>
                {currentStep > 1 && (
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold uppercase tracking-wider"
                  >
                    Change
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setAddressId(addr.id)}
                          className={cn(
                            "relative p-5 rounded-xl border-2 cursor-pointer transition-all group",
                            addressId === addr.id 
                              ? "border-[#A6D608] bg-[#A6D608]/5" 
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none",
                              addressId === addr.id ? "bg-[#A6D608] text-black" : "bg-gray-100 text-gray-500"
                            )}>
                              {addr.label}
                            </Badge>
                            {addressId === addr.id && <CheckCircle2 size={18} className="text-[#A6D608]" />}
                          </div>
                          <p className="font-black text-gray-900 mb-1">{addr.fullName}</p>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            {addr.street || addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm text-gray-400 mt-2 font-bold italic">Phone: {addr.phone}</p>
                          
                          {addressId === addr.id && (
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentStep(2);
                              }}
                              className="w-full mt-4 bg-black text-[#A6D608] rounded-full font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-black/10"
                            >
                              Deliver to this address
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add New Address Card */}
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#A6D608] hover:bg-[#A6D608]/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#A6D608] group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#A6D608]/20 flex items-center justify-center">
                          <Plus size={20} />
                        </div>
                        <span className="font-black uppercase text-[10px] tracking-widest">Add New Address</span>
                      </button>
                    </div>

                    {showAddressForm && (
                      <form onSubmit={handleAddAddress} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mt-4 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} required className="h-12 rounded-xl" />
                            <Input placeholder="Phone Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required className="h-12 rounded-xl" />
                         </div>
                         <Input placeholder="Street Address / Landmark" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} required className="h-12 rounded-xl" />
                         <div className="grid grid-cols-3 gap-4">
                            <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required className="h-12 rounded-xl" />
                            <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required className="h-12 rounded-xl" />
                            <Input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required className="h-12 rounded-xl" />
                         </div>
                         <div className="flex gap-4">
                            <Button type="submit" className="bg-[#A6D608] text-black hover:bg-[#95C207] font-black uppercase tracking-widest text-xs px-8 h-12 rounded-xl">Save Address</Button>
                            <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)} className="font-black uppercase tracking-widest text-xs text-gray-400 h-12">Cancel</Button>
                         </div>
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <div className="p-4 flex gap-4 text-sm text-gray-600 font-medium">
                    <p className="font-bold text-black">{selectedAddress?.fullName},</p>
                    <p className="truncate max-w-md">{selectedAddress?.street}, {selectedAddress?.city}, {selectedAddress?.pincode}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Payment Method Section */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className={cn(
                "p-4 flex items-center justify-between border-b transition-colors",
                currentStep === 2 ? "bg-gray-50" : "bg-white"
              )}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-black text-[#A6D608] text-sm font-black">2</span>
                  <h3 className="font-bold text-lg uppercase tracking-tight">Payment Method</h3>
                </div>
                {currentStep > 2 && (
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold uppercase tracking-wider"
                  >
                    Change
                  </button>
                )}
              </div>

              <AnimatePresence>
                {currentStep === 2 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6 space-y-4"
                  >
                    {[
                      { id: "RAZORPAY", name: "Online Payment (Card/UPI/NetBanking)", desc: "Fast & Secure payments via Razorpay", icon: CreditCard },
                      { id: "COD", name: "Cash on Delivery", desc: "Pay when your products arrive", icon: Truck }
                    ].map((method) => (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4",
                          paymentMethod === method.id 
                            ? "border-[#A6D608] bg-[#A6D608]/5" 
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === method.id ? "border-[#A6D608]" : "border-gray-300"
                        )}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#A6D608]" />}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                          <method.icon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{method.desc}</p>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      className="mt-6 bg-[#A6D608] text-black hover:bg-[#95C207] rounded-full px-12 h-12 font-black uppercase text-xs tracking-widest shadow-lg shadow-[#A6D608]/20"
                    >
                      Use this payment method
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Review Items Section */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className={cn(
                "p-4 flex items-center justify-between border-b transition-colors",
                currentStep === 3 ? "bg-gray-50" : "bg-white"
              )}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-black text-[#A6D608] text-sm font-black">3</span>
                  <h3 className="font-bold text-lg uppercase tracking-tight">Review Items & Delivery</h3>
                </div>
              </div>

              <AnimatePresence>
                {currentStep === 3 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6"
                  >
                    <div className="space-y-4 mb-8">
                       {items.map((item) => {
                         const product = item.product;
                         return (
                           <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all">
                               <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 p-2 overflow-hidden flex-shrink-0">
                                  <img 
                                    src={product?.images?.[0] || "/placeholder.png"} 
                                    alt={product?.name} 
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                  />
                               </div>
                               <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <p className="text-sm font-bold text-gray-900 uppercase tracking-tight truncate">{product?.name}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                     <span className="text-xs font-black text-gray-400">Qty: {item.quantity}</span>
                                     <span className="text-xs font-black text-black">₹{Number(product?.price).toLocaleString()}</span>
                                  </div>
                                  <p className="text-[10px] text-green-600 font-bold mt-1">Expected Delivery: 3-5 Business Days</p>
                               </div>
                               <p className="text-sm font-black text-gray-900 flex items-center">₹{Number((product?.price || 0) * item.quantity).toLocaleString()}</p>
                           </div>
                         );
                       })}
                    </div>
                    
                    <div className="bg-[#A6D608]/5 p-6 rounded-2xl border border-[#A6D608]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#A6D608] shadow-sm">
                             <ShieldCheck size={24} />
                          </div>
                          <div>
                             <p className="font-black text-black uppercase text-xs tracking-widest">Premium Guarantee</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified products & secure logistics only.</p>
                          </div>
                       </div>
                       <Button 
                         disabled={isPlacingOrder}
                         onClick={handlePlaceOrder}
                         className="w-full md:w-auto h-14 rounded-full bg-black text-[#A6D608] hover:bg-gray-900 font-black uppercase tracking-widest text-xs px-12 shadow-2xl shadow-black/20"
                       >
                         {isPlacingOrder ? "Placing Order..." : `Place Order • ₹${total().toLocaleString()}`}
                       </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Sticky Order Summary (Right) */}
          <aside className="w-full lg:w-80 space-y-4 sticky top-24">
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
              <Button 
                disabled={isPlacingOrder || !addressId}
                onClick={handlePlaceOrder}
                className="w-full h-12 rounded-md bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium text-sm shadow-sm mb-4"
              >
                Place your order
              </Button>
              <p className="text-[10px] text-gray-500 text-center mb-4 leading-normal">
                By placing your order, you agree to Druxx's <span className="text-blue-600 hover:underline cursor-pointer">privacy notice</span> and <span className="text-blue-600 hover:underline cursor-pointer">conditions of use</span>.
              </p>
              
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="font-bold text-sm">Order Summary</h3>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between text-gray-600">
                      <span>Items:</span>
                      <span>₹{subtotal().toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className={shipping() === 0 ? "text-green-600 font-bold" : ""}>
                        {shipping() === 0 ? "FREE" : `₹${shipping()}`}
                      </span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Tax (5%):</span>
                      <span>₹{tax().toLocaleString()}</span>
                   </div>
                   {couponDiscount > 0 && (
                     <div className="flex justify-between text-green-600 font-bold">
                        <span>Discount:</span>
                        <span>-₹{Math.round((subtotal() * couponDiscount) / 100).toLocaleString()}</span>
                     </div>
                   )}
                </div>
                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                   <span className="text-lg font-bold text-[#B12704]">Order Total:</span>
                   <span className="text-lg font-bold text-[#B12704]">₹{total().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
               <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-gray-500" />
                  <span className="text-xs font-bold uppercase tracking-tight text-gray-700">Druxx Protection</span>
               </div>
               <p className="text-[10px] text-gray-500 leading-normal">
                  All products are verified for quality and authenticity. Returns accepted within 7 days.
               </p>
            </div>
          </aside>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 py-8 border-t border-gray-200 text-center">
         <div className="flex flex-wrap justify-center gap-6 mb-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            <span className="cursor-pointer hover:underline">Conditions of Use</span>
            <span className="cursor-pointer hover:underline">Privacy Notice</span>
            <span className="cursor-pointer hover:underline">Help</span>
         </div>
         <p className="text-[10px] text-gray-400 font-medium">© 2026 Druxx Health and Wellness. All rights reserved.</p>
      </footer>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
