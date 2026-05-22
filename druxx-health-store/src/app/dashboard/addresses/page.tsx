"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ChevronLeft, 
  Loader2, 
  Home, 
  Briefcase, 
  User, 
  Phone 
} from "lucide-react";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
      toast.error("Could not load your addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setLabel("Home");
    setFullName("");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setPincode("");
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (address: Address) => {
    setEditingId(address.id);
    setLabel(address.label || "Home");
    setFullName(address.fullName);
    setPhone(address.phone);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setPincode(address.pincode);
    setIsDefault(address.isDefault);
    setShowForm(true);
  };

  const validateForm = () => {
    if (fullName.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return false;
    }
    if (!/^\d{10,}$/.test(phone.trim())) {
      toast.error("Phone number must be at least 10 digits.");
      return false;
    }
    if (street.trim().length < 3) {
      toast.error("Street/Address must be at least 3 characters.");
      return false;
    }
    if (city.trim().length < 2) {
      toast.error("City must be at least 2 characters.");
      return false;
    }
    if (state.trim().length < 2) {
      toast.error("State must be at least 2 characters.");
      return false;
    }
    if (pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
      toast.error("Pincode must be exactly 6 digits.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      label: label.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: "India",
      isDefault,
    };

    try {
      if (editingId) {
        await userService.updateAddress(editingId, payload);
        toast.success("Address updated successfully!");
      } else {
        await userService.createAddress(payload);
        toast.success("Address added successfully!");
      }
      resetForm();
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save address. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await userService.deleteAddress(id);
      toast.success("Address deleted successfully!");
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    try {
      await userService.updateAddress(address.id, {
        ...address,
        isDefault: true
      });
      toast.success("Default address updated!");
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update default address.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#A6D608] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-2xl gap-2 shadow-lg shadow-[#A6D608]/20"
          >
            <Plus size={16} strokeWidth={3} />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-sm relative animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#A6D608]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          
          <h2 className="text-xl font-black text-[#1E1E1E] mb-6 relative z-10">
            {editingId ? "Edit Delivery Address" : "Add Delivery Address"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter recipient's full name"
                    className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Street / Line Address */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Street Address / House No. / Area
              </label>
              <textarea
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Flat, House no., Building, Company, Apartment, Street, Sector, etc."
                className="w-full min-h-[80px] p-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  6-Digit Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter pincode"
                  className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Address Type & Default Choice */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-50">
              <div className="space-y-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  Address Tag
                </span>
                <div className="flex gap-2">
                  {["Home", "Work", "Office", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setLabel(tag)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                        label === tag 
                          ? "bg-[#1E1E1E] text-white border-transparent" 
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#A6D608] focus:ring-[#A6D608] cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700">Set as default address</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#1E1E1E] hover:bg-black text-white font-bold h-14 rounded-2xl gap-2 shadow-xl shadow-gray-100"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Address"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="px-6 h-14 rounded-2xl border-gray-200 font-bold hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#A6D608]" />
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white p-6 rounded-[2rem] border relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                address.isDefault 
                  ? "border-[#A6D608] shadow-md shadow-[#A6D608]/5" 
                  : "border-gray-100 hover:border-gray-200 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      {address.label === "Home" ? (
                        <Home size={16} />
                      ) : address.label === "Work" || address.label === "Office" ? (
                        <Briefcase size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                      {address.label}
                    </span>
                  </div>
                  
                  {address.isDefault && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#A6D608]/10 text-[#8ab506] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={10} strokeWidth={3} />
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-black text-[#1E1E1E] text-base">{address.fullName}</p>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    {address.street}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    {address.city}, {address.state} - <span className="font-bold text-[#1E1E1E]">{address.pincode}</span>
                  </p>
                  <p className="text-gray-400 text-xs font-bold pt-1 flex items-center gap-1">
                    <Phone size={12} /> {address.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-6">
                {!address.isDefault ? (
                  <button 
                    onClick={() => handleSetDefault(address)}
                    className="text-xs font-bold text-[#A6D608] hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-400">Default Address</span>
                )}

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEditClick(address)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    title="Edit Address"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-16 h-16 bg-[#A6D608]/10 text-[#A6D608] rounded-2xl flex items-center justify-center mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="font-black text-[#1E1E1E] text-lg mb-1">No Saved Addresses</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
            Please add a shipping address to speed up your checkout process.
          </p>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-[#1E1E1E] hover:bg-black text-white font-bold px-8 h-12 rounded-xl"
          >
            Add New Address
          </Button>
        </div>
      )}
    </div>
  );
}
