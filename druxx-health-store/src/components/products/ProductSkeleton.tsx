"use client";

import { cn } from "@/lib/utils";

export const ProductSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col h-full p-4", className)}>
      {/* Image Area */}
      <div className="relative aspect-square bg-gray-50 rounded-xl mb-4" />

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Vendor */}
        <div className="h-3 w-20 bg-gray-50 rounded-full" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-50 rounded-md" />
          <div className="h-4 w-2/3 bg-gray-50 rounded-md" />
        </div>

        {/* Rating */}
        <div className="h-3 w-16 bg-gray-50 rounded-full" />

        {/* Price */}
        <div className="h-6 w-24 bg-gray-50 rounded-md" />

        {/* Button */}
        <div className="mt-auto pt-4">
          <div className="h-11 w-full bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductListSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};
