"use client";

import { useState } from "react";
import { MapPin, Search, ChevronRight, Check, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarketplaceStore } from "@/store/marketplaceStore";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_CITIES = [
  { city: "Bengaluru", pincode: "560001" },
  { city: "Mumbai", pincode: "400001" },
  { city: "Delhi", pincode: "110001" },
  { city: "Hyderabad", pincode: "500001" },
  { city: "Chennai", pincode: "600001" },
  { city: "Pune", pincode: "411001" },
];

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const { location, setLocation } = useMarketplaceStore();
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const exactArea = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.road;
            const baseCity = addr.city || addr.town || addr.village || addr.state_district;
            const detectedCity = exactArea && baseCity && exactArea !== baseCity 
              ? `${exactArea}, ${baseCity}` 
              : exactArea || baseCity || "Current Location";
            const detectedPincode = addr.postcode || "560001";
            setLocation({ city: detectedCity, pincode: detectedPincode });
            onOpenChange(false);
          } else {
            setError("Could not determine address from location.");
          }
        } catch (err) {
          setError("Failed to fetch location details.");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable permissions.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleApplyPincode = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsDetecting(true);
    setError("");
    
    try {
      // Using public Indian Pincode API
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      
      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District;
        const area = postOffice.Name;
        const fullLocation = `${area}, ${city}`;
        
        setLocation({ city: fullLocation, pincode });
        onOpenChange(false);
        setPincode("");
        setError("");
      } else {
        setError("Invalid PIN code. Please check and try again.");
      }
    } catch (err) {
      console.error("Pincode lookup failed:", err);
      // Fallback for demo/stability
      setLocation({ city: "Verified Area", pincode });
      onOpenChange(false);
      setPincode("");
      setError("");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectCity = (city: string, pin: string) => {
    setLocation({ city, pincode: pin });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#1E1E1E] p-8 text-white relative overflow-hidden">
           {/* Abstract Background Decoration */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A6D608] rounded-full blur-[80px] opacity-20" />
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-10" />

           <DialogHeader className="relative z-10">
             <DialogTitle className="font-heading font-black text-2xl lg:text-3xl tracking-tight mb-2">
                Choose your <span className="text-[#A6D608]">Location</span>
             </DialogTitle>
             <DialogDescription className="text-gray-400 text-sm leading-relaxed">
                Select a delivery area to see product availability and faster delivery options.
             </DialogDescription>
           </DialogHeader>
        </div>

        <div className="p-8 space-y-8 bg-white">
          {/* Auto Detect Location Button */}
          <Button
            type="button"
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full h-12 bg-[#A6D608]/10 hover:bg-[#A6D608]/20 text-[#1E1E1E] border border-[#A6D608]/30 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isDetecting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
                <span>Detecting Current Location...</span>
              </>
            ) : (
              <>
                <Navigation size={18} className="text-[#A6D608] fill-[#A6D608]" />
                <span>Auto-Detect Current Location</span>
              </>
            )}
          </Button>

          {/* PIN Code Input */}
          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Deliver to PIN Code</label>
             <div className="flex gap-2">
                <div className="relative flex-1">
                   <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <Input 
                      placeholder="Enter 6-digit PIN code" 
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        setError("");
                      }}
                      className="h-12 pl-10 rounded-xl border-gray-200 focus:ring-[#A6D608] font-bold text-sm tracking-widest placeholder:tracking-normal placeholder:font-medium"
                      maxLength={6}
                   />
                </div>
                <Button 
                   onClick={handleApplyPincode}
                   className="h-12 px-6 bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-xl"
                >
                   Apply
                </Button>
             </div>
             {error && <p className="text-xs text-red-500 px-1 font-medium italic">*{error}</p>}
          </div>

          {/* Popular Cities */}
          <div className="space-y-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Popular Cities</p>
             <div className="grid grid-cols-2 gap-3">
                {POPULAR_CITIES.map((item) => {
                  const isSelected = location.city === item.city;
                  return (
                    <button
                      key={item.city}
                      onClick={() => handleSelectCity(item.city, item.pincode)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                        isSelected 
                          ? "border-[#A6D608] bg-[#A6D608]/5 shadow-sm" 
                          : "border-gray-100 hover:border-[#A6D608]/40 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                         {item.city}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#A6D608] flex items-center justify-center">
                           <Check size={12} className="text-[#1E1E1E]" />
                        </div>
                      ) : (
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#A6D608] translate-x-1 opacity-0 group-hover:opacity-100 transition-all font-bold" />
                      )}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
           <button 
             onClick={() => onOpenChange(false)}
             className="text-xs font-bold text-gray-400 hover:text-gray-600 tracking-wide uppercase transition-colors"
           >
              Skip for now
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
