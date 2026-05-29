"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error in authentication segment:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-500/5">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
        Authentication Error
      </h2>
      <p className="text-gray-500 max-w-md mb-8 font-medium">
        An error occurred during authentication processing. Please try resetting your session.
      </p>

      {error.message && (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-lg text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Details</p>
          <p className="font-mono text-xs text-red-600 font-bold break-all">
            {error.message}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-2xl h-12 px-6 font-bold bg-[#A6D608] hover:bg-[#95C207] text-[#1E1E1E] transition-all gap-2 shadow-md shadow-green-500/10"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-2xl h-12 px-6 font-bold border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors gap-2"
        >
          <a href="/">
            <Home className="w-4 h-4" />
            Go to Home
          </a>
        </Button>
      </div>
    </div>
  );
}
