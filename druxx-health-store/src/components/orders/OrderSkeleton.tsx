"use client";

import { cn } from "@/lib/utils";

export const OrderSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse", className)}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-gray-100 rounded-full" />
            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between py-4 border-t border-gray-50 mt-4">
          <div className="flex items-center -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white" />
            ))}
          </div>
          <div className="text-right space-y-1">
            <div className="h-3 w-20 bg-gray-100 rounded ml-auto" />
            <div className="h-5 w-16 bg-gray-100 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
