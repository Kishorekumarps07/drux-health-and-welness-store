"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, Navigation, Check, Lock, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";
import { Address } from "@/types";
import { reverseGeocode, fetchPincodeDetails } from "@/lib/geocode";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const { location, setLocation } = useMarketplaceStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Fetch saved addresses if authenticated and modal opens
  useEffect(() => {
    if (open && isAuthenticated) {
      const loadAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
          const fetched = await userService.getAddresses();
          setAddresses(fetched || []);
        } catch (err) {
          console.error("Failed to load addresses", err);
        } finally {
          setIsLoadingAddresses(false);
        }
      };
      loadAddresses();
    }
  }, [open, isAuthenticated]);

  /* ── GPS auto-detect ──────────────────────────────────────────────── */
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          setLocation(result);
          onOpenChange(false);
        } catch {
          setError("Failed to fetch location. Try entering your PIN manually.");
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setError("Location access denied. Enable permissions in your browser.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  /* ── PIN code lookup ──────────────────────────────────────────────── */
  const handleApplyPincode = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }
    setIsPincodeLoading(true);
    setError("");
    try {
      const details = await fetchPincodeDetails(pincode);
      if (details && details.city) {
        setLocation({ city: details.city, pincode });
        onOpenChange(false);
        setPincode("");
      } else {
        setError("Invalid PIN code. Please check and try again.");
      }
    } catch {
      setError("Could not verify PIN code. Please try again.");
    } finally {
      setIsPincodeLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] rounded-3xl p-0 overflow-hidden border border-gray-100 shadow-2xl bg-white gap-0">
        
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Choose your location
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Select a delivery location to see product availability and delivery options.
          </p>
          {location.city && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
              <MapPin size={12} className="text-[#A6D608]" />
              <span className="text-[11px] font-bold text-gray-600 truncate max-w-[280px]">
                Current: {location.city}{location.pincode ? ` · ${location.pincode}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── BODY ────────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* Saved Addresses / Authentication Promo */}
          {!isAuthenticated ? (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Sign in for saved addresses</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                    Access your saved home or work addresses for faster delivery options.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenChange(false);
                  router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
                }}
                className="text-xs font-black text-[#A6D608] hover:text-[#8ab506] transition-colors shrink-0 flex items-center gap-0.5"
              >
                Sign In <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Saved Addresses
              </p>
              {isLoadingAddresses ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <Loader2 className="animate-spin text-gray-300 mb-2" size={24} />
                  <span className="text-xs font-semibold">Loading saved addresses...</span>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                  {addresses.map((addr) => {
                    const isSelected = location.pincode === addr.pincode;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setLocation({ city: `${addr.fullName || addr.label}, ${addr.city}`, pincode: addr.pincode });
                          onOpenChange(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "border-[#A6D608] bg-[#A6D608]/5 shadow-sm"
                            : "border-gray-100 bg-gray-50/30 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#A6D608] text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          <MapPin size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-900 truncate">{addr.fullName}</span>
                            {addr.label && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                                {addr.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#A6D608] flex items-center justify-center shrink-0">
                            <Check size={11} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-500">No saved addresses found</p>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      router.push("/dashboard/addresses");
                    }}
                    className="text-[11px] font-black text-[#A6D608] hover:underline mt-1 block w-full"
                  >
                    + Add an address in your profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PIN Code Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Enter Indian Pincode
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 tracking-wider select-none">
                  PIN
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="e.g. 560034"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPincode()}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#A6D608] focus:ring-2 focus:ring-[#A6D608]/20 outline-none text-sm font-bold tracking-widest transition-all placeholder:font-normal placeholder:tracking-normal text-gray-900"
                />
              </div>
              <button
                onClick={handleApplyPincode}
                disabled={isPincodeLoading || pincode.length < 6}
                className="h-12 px-6 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
              >
                {isPincodeLoading ? <Loader2 size={15} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-red-500 font-medium px-1 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-50 border border-red-200 text-[8px] flex items-center justify-center font-black shrink-0">!</span>
                {error}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Auto-detect */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="group w-full relative overflow-hidden rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold h-12 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-70"
          >
            {isDetecting ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#A6D608]" />
                <span className="text-xs">Detecting location…</span>
              </>
            ) : (
              <>
                <Navigation size={16} className="text-[#A6D608] fill-[#A6D608]/10 rotate-45" />
                <span className="text-xs">Use my current location</span>
              </>
            )}
          </button>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-2 text-center border-t border-gray-50">
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
