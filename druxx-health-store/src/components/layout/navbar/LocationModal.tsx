"use client";

import { useState } from "react";
import { MapPin, Loader2, Navigation, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMarketplaceStore } from "@/store/marketplaceStore";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_CITIES = [
  { city: "Bengaluru", pincode: "560001" },
  { city: "Mumbai",    pincode: "400001" },
  { city: "Delhi",     pincode: "110001" },
  { city: "Hyderabad", pincode: "500001" },
  { city: "Chennai",   pincode: "600001" },
  { city: "Pune",      pincode: "411001" },
  { city: "Kolkata",   pincode: "700001" },
  { city: "Ahmedabad", pincode: "380001" },
];

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const { location, setLocation } = useMarketplaceStore();
  const [pincode, setPincode]           = useState("");
  const [error, setError]               = useState("");
  const [isDetecting, setIsDetecting]   = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  /* ── GPS auto-detect using shared geocode utility ─────────────────── */
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
          // Dynamically import so it tree-shakes on server
          const { reverseGeocode } = await import("@/lib/geocode");
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
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") {
        const offices = data[0].PostOffice;
        if (offices?.length > 0) {
          const po       = offices[0];
          const area     = po.Name;
          const district = po.District;
          const state    = po.State;
          const full     = area !== district ? `${area}, ${district}` : `${district}, ${state}`;
          setLocation({ city: full, pincode });
        } else {
          setLocation({ city: `Area - ${pincode}`, pincode });
        }
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

  /* ── Select city from grid ────────────────────────────────────────── */
  const handleSelectCity = (city: string, pin: string) => {
    setLocation({ city, pincode: pin });
    onOpenChange(false);
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl bg-white gap-0">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="relative bg-[#111] overflow-hidden px-7 pt-8 pb-10">
          {/* Grid map pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(#A6D608 1px, transparent 1px), linear-gradient(90deg, #A6D608 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow blobs */}
          <div className="absolute -top-8 -right-8 w-44 h-44 bg-[#A6D608] rounded-full blur-[90px] opacity-25" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-[#FF7A00] rounded-full blur-[80px] opacity-15" />

          {/* Text */}
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A6D608] mb-2">
              Delivery Area
            </p>
            <h2 className="text-[26px] font-black text-white leading-tight tracking-tight">
              Where should we<br />
              <span className="text-[#A6D608]">deliver to you?</span>
            </h2>
            {location.city && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1">
                <MapPin size={11} className="text-[#A6D608]" />
                <span className="text-[11px] font-bold text-white/80 truncate max-w-[200px]">
                  {location.city}{location.pincode ? ` · ${location.pincode}` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────── */}
        <div className="px-6 pt-8 pb-6 space-y-6">

          {/* Auto-detect */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A6D608] to-[#8ab506] text-black font-black h-14 flex items-center justify-center gap-2.5 shadow-lg shadow-[#A6D608]/30 hover:shadow-[#A6D608]/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:translate-y-0"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            {isDetecting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="text-[14px]">Detecting your location…</span>
              </>
            ) : (
              <>
                <Navigation size={18} className="fill-black/30" />
                <span className="text-[14px]">Use My Current Location</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or enter pincode</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* PIN Code Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-300 tracking-wider select-none">
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
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#A6D608] focus:ring-2 focus:ring-[#A6D608]/20 outline-none text-sm font-bold tracking-widest transition-all placeholder:font-normal placeholder:tracking-normal text-gray-900"
                />
              </div>
              <button
                onClick={handleApplyPincode}
                disabled={isPincodeLoading || pincode.length < 6}
                className="h-12 px-6 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
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

          {/* Popular Cities */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Popular Cities</p>
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_CITIES.map((item) => {
                const isSelected = location.city === item.city;
                return (
                  <button
                    key={item.city}
                    onClick={() => handleSelectCity(item.city, item.pincode)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? "border-[#A6D608] bg-[#A6D608]/8 shadow-sm"
                        : "border-gray-100 bg-gray-50/50 hover:border-[#A6D608]/50 hover:bg-[#A6D608]/5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#A6D608] flex items-center justify-center shadow-sm">
                        <Check size={10} className="text-black stroke-[3]" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black tracking-tight ${
                      isSelected ? "bg-[#A6D608] text-black" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.city.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={`text-[10px] font-black leading-tight ${
                      isSelected ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {item.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-1 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="text-[11px] font-bold text-gray-300 hover:text-gray-500 tracking-widest uppercase transition-colors"
          >
            Skip for now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
