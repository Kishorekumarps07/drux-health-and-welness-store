"use client";

import { Package, ShieldCheck, Heart, MapPin, Settings, HelpCircle, Clock } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-150 shrink-0 shadow-inner" />
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="h-9 w-48 bg-gray-200 rounded-2xl mx-auto md:mx-0" />
            <div className="h-6 w-28 bg-gray-150 rounded-full mx-auto md:mx-0" />
          </div>
          <div className="h-4 w-72 bg-gray-100 rounded-lg mx-auto md:mx-0" />
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <div className="h-14 w-28 bg-gray-100 rounded-2xl border border-gray-50" />
            <div className="h-14 w-28 bg-gray-100 rounded-2xl border border-gray-50" />
          </div>
        </div>
        
        <div className="w-40 h-14 bg-gray-100 rounded-2xl hidden lg:block" />
      </div>

      {/* Navigation Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: <Package size={24} className="text-gray-300" /> },
          { icon: <MapPin size={24} className="text-gray-300" /> },
          { icon: <ShieldCheck size={24} className="text-gray-300" /> },
          { icon: <Settings size={24} className="text-gray-300" /> },
          { icon: <Heart size={24} className="text-gray-300" /> },
          { icon: <HelpCircle size={24} className="text-gray-300" /> }
        ].map((card, idx) => (
          <div 
            key={idx}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              {card.icon}
            </div>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-gray-200 rounded-lg" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4">
            <div className="h-6 w-36 bg-gray-200 rounded-lg" />
            <div className="h-4 w-16 bg-gray-150 rounded" />
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-150 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                  <div className="h-4 w-20 bg-gray-150 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded-lg px-4" />
          <div className="bg-[#1E1E1E] rounded-[2rem] p-8 text-white relative overflow-hidden min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="h-3 w-20 bg-[#A6D608]/20 rounded mb-4" />
              <div className="h-7 w-36 bg-white/10 rounded mb-3" />
              <div className="h-4 w-full bg-white/5 rounded mb-2" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
            
            <div className="space-y-4 py-4">
              <div className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
            </div>

            <div className="h-12 w-full bg-[#A6D608]/25 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
