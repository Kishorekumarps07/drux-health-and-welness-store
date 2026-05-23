"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2, MailCheck } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/newsletter/subscribe", { email: cleanEmail });
      if (response.data.status === "success") {
        setSubscribed(true);
        toast.success("Subscribed successfully!");
      } else {
        toast.error(response.data.message || "Failed to subscribe.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-[#A6D608]/10 to-[#2CA7A0]/10 border-t border-[#A6D608]/20">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-[#1E1E1E]">
          Stay Healthy, Stay Updated
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Get exclusive offers, health tips, and new arrivals straight to your inbox.
        </p>

        {subscribed ? (
          <div className="bg-white/60 backdrop-blur-md border border-[#A6D608]/30 rounded-2xl p-6 max-w-sm mx-auto flex items-center justify-center gap-3 shadow-md animate-in zoom-in duration-300">
            <MailCheck className="text-[#A6D608] shrink-0" size={24} />
            <p className="text-sm font-bold text-gray-800">
              You've successfully subscribed!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm px-4 text-sm outline-none focus:ring-2 focus:ring-[#A6D608]/20 transition-all disabled:opacity-50"
              required
            />
            <button 
              type="submit"
              disabled={submitting}
              className="bg-[#1E1E1E] text-white hover:bg-black disabled:bg-gray-400 rounded-xl font-bold px-6 h-10 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Join
                </>
              ) : (
                "Join"
              )}
            </button>
          </form>
        )}
        
        <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
          Join 50,000+ fitness enthusiasts
        </p>
      </div>
    </section>
  );
}
