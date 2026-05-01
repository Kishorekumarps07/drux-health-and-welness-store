"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, subtotal, shipping, clearCart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { loadRazorpay } = useRazorpay();

  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: "", street: "", city: "", pincode: "" });

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.street || !newAddress.city || !newAddress.pincode) {
        toast.error("Please fill all address fields");
        return;
    }

    const address = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: addresses.length === 0
    };

    const updatedAddresses = [...addresses, address];
    
    const { error } = await supabase
        .from('profiles')
        .update({ addresses: updatedAddresses })
        .eq('id', user?.id);

    if (error) {
        console.error("Supabase address update error:", error);
        toast.error(`Failed to save address: ${error.message}`);
        return;
    }

    setAddresses(updatedAddresses);
    setAddressId(address.id);
    setIsAddingAddress(false);
    toast.success("Address added!");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }
    fetchCart();
    if (user?.addresses) {
      setAddresses(user.addresses);
      const defaultAddr = user.addresses.find((a: any) => a.isDefault);
      if (defaultAddr) setAddressId(defaultAddr.id);
    }
  }, [isAuthenticated, router, fetchCart, user]);

  const handleCheckout = async () => {
    if (!addressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      if (paymentMethod === "COD") {
        const order = await orderService.placeOrder({
          addressId,
          paymentMethod: "COD",
          notes: "",
          items,
          subtotal: subtotal(),
          shipping: shipping(),
          total: total() + 49, // Add COD fee
          address: addresses.find((a: any) => a.id === addressId) || {}
        });
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/dashboard/orders/${order.id}`);
      } else {
        const { razorpayOrder }: any = await orderService.createPaymentIntent();
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          toast.error("Razorpay SDK failed to load.");
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Drux Health Store",
          description: "Premium Wellness Checkout",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              setIsPlacingOrder(true);
              const finalizeResponse = await orderService.verifyAndCreateOrder({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                addressId,
                notes: ""
              });
              toast.success("Payment successful!");
              clearCart();
              router.push(`/dashboard/orders/${finalizeResponse.id}`);
            } catch (err: any) {
              toast.error("Payment verified but order creation failed.");
            } finally {
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: "#A6D608" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      console.error("Checkout submission error:", error);
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <ShoppingBag size={64} className="text-gray-100 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 font-medium">Add some wellness to your life before checking out.</p>
        <Link href="/">
          <Button className="bg-[#1E1E1E] text-[#A6D608] rounded-full px-10 h-14 font-black uppercase text-xs tracking-widest transition-all hover:scale-105">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Secure Checkout Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Drux Logo" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="text-[#A6D608]" size={18} />
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Flow: Steps */}
          <div className="flex-1 space-y-4">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Delivery Address</h2>
                  </div>
                  {addressId && <Badge className="bg-[#A6D608] text-[#1E1E1E] border-none font-black text-[9px] uppercase">Selected</Badge>}
               </div>
               
               <div className="p-6">
                  {isAddingAddress ? (
                    <div className="space-y-4 border border-gray-200 p-4 rounded-xl">
                      <h3 className="font-bold text-sm uppercase">Add New Address</h3>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full h-10 px-3 text-sm border rounded-md"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Street Address" 
                        className="w-full h-10 px-3 text-sm border rounded-md"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      />
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="City" 
                          className="w-1/2 h-10 px-3 text-sm border rounded-md"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Pincode" 
                          className="w-1/2 h-10 px-3 text-sm border rounded-md"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddAddress} className="flex-1 bg-[#1E1E1E] text-white">Save Address</Button>
                        <Button onClick={() => setIsAddingAddress(false)} variant="outline">Cancel</Button>
                      </div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setAddressId(addr.id)}
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                            addressId === addr.id 
                            ? "border-[#A6D608] bg-[#A6D608]/5" 
                            : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                             <p className="font-black text-sm text-gray-900 uppercase tracking-tight">{addr.fullName}</p>
                             {addressId === addr.id && <div className="w-4 h-4 rounded-full bg-[#A6D608] flex items-center justify-center"><ChevronRight size={10} className="text-[#1E1E1E]" /></div>}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            {addr.street}, {addr.city} {addr.pincode}
                          </p>
                          <Button 
                            className={`w-full h-9 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                              addressId === addr.id 
                              ? "bg-[#1E1E1E] text-white" 
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            {addressId === addr.id ? "Deliver Here" : "Select Address"}
                          </Button>
                        </div>
                      ))}
                      <div 
                        onClick={() => setIsAddingAddress(true)}
                        className="p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] text-gray-400 hover:text-gray-600"
                      >
                        <Plus size={24} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Address</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                       <p className="text-sm text-gray-400 font-medium mb-4 italic">No saved addresses found.</p>
                       <Button onClick={() => setIsAddingAddress(true)} variant="outline" className="rounded-xl border-gray-200 text-xs font-bold px-6">Add New Address</Button>
                    </div>
                  )}
               </div>
            </div>

            {/* Step 2: Payment Methodology */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                  <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-[10px] font-black flex items-center justify-center">2</span>
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Payment Method</h2>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "RAZORPAY", label: "Online Payment", icon: CreditCard, sub: "UPI, Cards, Netbanking" },
                      { id: "COD", label: "Cash on Delivery", icon: Truck, sub: "Pay at your doorstep (+₹49)" }
                    ].map((m) => (
                      <label 
                        key={m.id}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                          paymentMethod === m.id 
                          ? "border-[#A6D608] bg-[#A6D608]/5" 
                          : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <input type="radio" className="hidden" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id as any)} />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === m.id ? "bg-[#1E1E1E] text-[#A6D608]" : "bg-gray-50 text-gray-300"}`}>
                          <m.icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{m.label}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{m.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
               </div>
            </div>

            {/* Step 3: Review Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                  <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-[10px] font-black flex items-center justify-center">3</span>
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Review Items</h2>
               </div>
               <div className="p-6 space-y-4">
                  {items.map((item) => {
                    const product = item.product;
                    const imageUrl = (product as any)?.images?.[0]?.url || (product as any)?.images?.[0] || "/placeholder-product.png";
                    return (
                      <div key={product?.id || Math.random()} className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0">
                            <Image 
                              src={imageUrl} 
                              alt={product?.name || "Product Image"} 
                              width={64} 
                              height={64} 
                              className="w-full h-full object-cover" 
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{product?.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                         </div>
                         <p className="text-sm font-black text-gray-900 italic">₹{Number((product?.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-[380px]">
             <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md sticky top-24">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 border-b border-gray-50 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Items ({items.length})</span>
                      <span className="text-sm font-black text-gray-900 italic">₹{Number(subtotal()).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Shipping</span>
                      <span className="text-sm font-black text-[#A6D608] italic">FREE</span>
                   </div>
                   {paymentMethod === "COD" && (
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">COD Handling</span>
                        <span className="text-sm font-black text-gray-900 italic">₹49</span>
                     </div>
                   )}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6 mb-10">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A6D608] mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                          ₹{(Number(total()) + (paymentMethod === "COD" ? 49 : 0)).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold italic">Inclusive of all taxes</p>
                   </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={isPlacingOrder || !addressId}
                  className="w-full bg-[#1E1E1E] hover:bg-black text-[#A6D608] h-16 rounded-2xl font-black uppercase tracking-[0.1em] text-xs transition-all shadow-xl shadow-gray-100 mb-6 disabled:opacity-50"
                >
                  {isPlacingOrder ? <Loader2 className="animate-spin" /> : "Complete Order"}
                </Button>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-3 grayscale opacity-40">
                      <ShieldCheck size={18} />
                      <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-widest">
                        SSL Secure Payment Gateway via Razorpay
                      </p>
                   </div>
                   <div className="flex items-center gap-3 grayscale opacity-40">
                      <Truck size={18} />
                      <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-widest">
                        Fast Delivery across 12,000+ Pincodes
                      </p>
                   </div>
                </div>
             </div>

             {/* Simple Footer Links */}
             <div className="mt-8 flex flex-wrap justify-center gap-4 opacity-30">
                <Link href="#" className="text-[10px] font-bold text-gray-500 hover:underline uppercase tracking-widest">Help</Link>
                <Link href="#" className="text-[10px] font-bold text-gray-500 hover:underline uppercase tracking-widest">Conditions</Link>
                <Link href="#" className="text-[10px] font-bold text-gray-500 hover:underline uppercase tracking-widest">Privacy</Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
