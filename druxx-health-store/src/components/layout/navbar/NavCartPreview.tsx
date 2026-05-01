"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NavCartPreview() {
  const { items, subtotal, totalItems, removeItem } = useCartStore();
  const summaryItems = items.slice(0, 3);
  const remainingCount = Math.max(0, items.length - 3);

  return (
    <div className="w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#A6D608]" /> My Cart
        </h3>
        <Badge className="bg-[#A6D608] text-[#1E1E1E] font-bold text-[10px]">
          {totalItems()} Items
        </Badge>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag size={24} className="text-gray-300" />
             </div>
             <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {summaryItems.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group/item">
                <div className="relative w-14 h-14 rounded-lg border border-gray-100 overflow-hidden bg-white flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover/item:text-[#A6D608] transition-colors">{item.product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                     <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                     <p className="text-sm font-black text-gray-900">₹{item.product.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-center py-2 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">+ {remainingCount} more items in cart</p>
              </div>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 bg-gray-50/80 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
            <span className="text-lg font-black text-[#1E1E1E]">₹{subtotal().toLocaleString("en-IN")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#A6D608] hover:border-[#A6D608] font-bold h-11 text-xs">
              <Link href="/cart">View Cart</Link>
            </Button>
            <Button asChild className="rounded-xl bg-[#FF7A00] hover:bg-[#d96600] text-white font-bold h-11 text-xs shadow-lg shadow-orange-500/20">
              <Link href="/checkout" className="flex items-center gap-1.5">
                Checkout <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
