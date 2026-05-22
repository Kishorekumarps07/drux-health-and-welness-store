"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, Lock, Loader2, Key } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SecurityPage() {
  const { user } = useAuthStore() as any;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#A6D608] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#A6D608]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 bg-[#A6D608]/10 text-[#A6D608] rounded-2xl flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1E1E1E]">Login & Security</h1>
            <p className="text-gray-500 text-sm">Manage your login details and password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Email (Read Only) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              Registered Email (Primary Login)
            </label>
            <div className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center text-gray-400 font-medium select-none">
              {user?.email}
            </div>
          </div>

          <div className="border-t border-gray-50 my-6 pt-6">
            <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <Key size={18} className="text-[#A6D608]" />
              Change Password
            </h3>

            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
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
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
