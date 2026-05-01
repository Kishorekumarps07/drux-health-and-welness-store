import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="text-9xl font-heading font-black text-[#A6D608]/20 select-none">404</span>
          <div className="relative -mt-16">
            <h1 className="font-heading font-bold text-3xl text-[#1E1E1E] mb-2">Page Not Found</h1>
            <p className="text-gray-500 text-sm">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-xl h-12 px-6">
            <Link href="/" className="flex items-center gap-2">
              <Home size={18} />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-gray-200 text-gray-600 hover:text-[#A6D608] hover:border-[#A6D608] rounded-xl h-12 px-6">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Browse Products
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            If you believe this is an error, please contact our support at <span className="text-[#A6D608] font-medium">1800-DRUXX-HEALTH</span>
          </p>
        </div>
      </div>
    </div>
  );
}
