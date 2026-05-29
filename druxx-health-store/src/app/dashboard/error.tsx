"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error in dashboard:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-500/5">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>
      
      <h2 className="text-3xl font-black text-white tracking-tight mb-2">
        Dashboard Encountered an Error
      </h2>
      <p className="text-gray-400 max-w-md mb-8 font-medium">
        Failed to load this dashboard section. Our technical team has been logged.
      </p>

      {error.message && (
        <div className="mb-8 p-4 bg-[#111827] rounded-2xl border border-[#1F2937] max-w-lg text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">System Error Message</p>
          <p className="font-mono text-xs text-red-400 font-bold break-all">
            {error.message}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-2xl h-12 px-6 font-bold bg-[#10B981] hover:bg-[#059669] text-white transition-all gap-2 shadow-md shadow-emerald-500/10"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Section
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-2xl h-12 px-6 font-bold border-[#1F2937] text-gray-300 bg-[#111827] hover:bg-[#1F2937] hover:text-white transition-all gap-2"
        >
          <a href="/dashboard">
            <Home className="w-4 h-4" />
            Dashboard Home
          </a>
        </Button>
      </div>
    </div>
  );
}
