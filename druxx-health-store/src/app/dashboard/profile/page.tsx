"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Phone, ChevronLeft, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuthStore() as any;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userService.getProfile();
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        // Fallback to auth store info if API fails
        if (user) {
          setName(user.name || "");
          setPhone(user.phone || "");
        }
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (phone.trim() && !/^(?:\+91|0)?[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A6D608]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#A6D608] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm relative p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#A6D608]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 bg-[#A6D608]/10 text-[#A6D608] rounded-2xl flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1E1E1E]">Account Settings</h1>
            <p className="text-gray-500 text-sm">Update your public profile details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Email (Read-Only) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              Email Address (Cannot be changed)
            </label>
            <div className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center text-gray-400 font-medium select-none">
              {user?.email}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1E1E1E] hover:bg-black text-white font-bold h-14 rounded-2xl gap-2 shadow-xl shadow-gray-100 transition-all flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Save Profile Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
