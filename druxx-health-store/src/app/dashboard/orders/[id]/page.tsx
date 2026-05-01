"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8 font-medium">
        Thank you for your purchase. Your order ID is <span className="font-bold text-gray-900">#{params.id}</span>
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => router.push('/dashboard/orders')} variant="outline" className="rounded-xl border-gray-200 font-bold">
          View All Orders
        </Button>
        <Button onClick={() => router.push('/')} className="bg-[#1E1E1E] text-white rounded-xl font-bold">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
