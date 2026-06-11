"use client"

import * as React from "react"
import { 
  Truck, 
  Search, 
  ChevronRight, 
  Filter, 
  Clock, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Printer,
  Package,
  Activity,
  CheckCircle,
  X,
  Scale,
  Ruler
} from "lucide-react"
import { vendorService } from "@/services/vendorService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface ShipmentItem {
  id: string;
  orderId: string;
  vendorId: string;
  shiprocketOrderId: string | null;
  shipmentId: string | null;
  awbCode: string | null;
  courierName: string | null;
  status: string;
  trackingUrl: string | null;
  labelUrl: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string; email: string; phone: string; };
    address: { 
      fullName: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    items: {
      id: string;
      title: string;
      price: number;
      quantity: number;
      total: number;
      product: {
        id: string;
        title: string;
        images?: { url: string }[];
      };
    }[];
  };
}

function VendorShipmentsPageContent() {
  const searchParams = useSearchParams()
  const queryOrderId = searchParams.get('orderId')
  const queryBook = searchParams.get('book')
  const queryTrack = searchParams.get('track')
  
  const processedParamsRef = React.useRef(false)

  const [shipments, setShipments] = React.useState<ShipmentItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  
  // Modals state
  const [selectedShipment, setSelectedShipment] = React.useState<ShipmentItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)
  const [showBookModal, setShowBookModal] = React.useState(false)
  const [showTrackingModal, setShowTrackingModal] = React.useState(false)
  const [showManualShipModal, setShowManualShipModal] = React.useState(false)
  
  const [vendorProfile, setVendorProfile] = React.useState<any>(null)

  // Manual Ship Form State
  const [manualCourier, setManualCourier] = React.useState("")
  const [manualAwb, setManualAwb] = React.useState("")
  const [manualTrackingUrl, setManualTrackingUrl] = React.useState("")
  const [manualShipLoading, setManualShipLoading] = React.useState(false)
  
  // Booking Form State
  const [weight, setWeight] = React.useState("0.5")
  const [length, setLength] = React.useState("15")
  const [width, setWidth] = React.useState("10")
  const [height, setHeight] = React.useState("5")
  const [pickupLocation, setPickupLocation] = React.useState("Primary")
  const [bookingLoading, setBookingLoading] = React.useState(false)
  
  // Tracking Data State
  const [trackingData, setTrackingData] = React.useState<any>(null)
  const [trackingLoading, setTrackingLoading] = React.useState(false)

  const fetchShipments = React.useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = selectedStatus === 'all' ? undefined : selectedStatus.toUpperCase()
      const result = await vendorService.getMyShipments({ 
        status: statusParam,
        limit: 50 
      })
      setShipments(result.shipments || [])
    } catch (error) {
      toast.error("Failed to load vendor shipments")
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  React.useEffect(() => {
    fetchShipments()
    
    // Fetch vendor profile to pre-populate pickup nickname
    const fetchProfile = async () => {
      try {
        const profile = await vendorService.getMyApplication()
        setVendorProfile(profile)
      } catch (err) {
        console.error("Failed to load vendor profile for pickup locations:", err)
      }
    }
    fetchProfile()
  }, [fetchShipments])

  const filteredShipments = shipments.filter(item => 
    item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.awbCode && item.awbCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.order?.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBookModal = (shipment: ShipmentItem) => {
    setSelectedShipment(shipment)
    setWeight("0.5")
    setLength("15")
    setWidth("10")
    setHeight("5")
    setPickupLocation(vendorProfile?.pickupLocation || "Primary")
    setShowBookModal(true)
  }

  const handleOpenManualShipModal = (shipment: ShipmentItem) => {
    setSelectedShipment(shipment)
    setManualCourier("")
    setManualAwb("")
    setManualTrackingUrl("")
    setShowManualShipModal(true)
  }

  const handleManualShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipment) return
    if (!manualCourier.trim() || !manualAwb.trim()) {
      toast.error("Courier Name and AWB Code are required.")
      return
    }

    setManualShipLoading(true)
    const toastId = toast.loading("Marking shipment as shipped...")

    try {
      await vendorService.manualShipment(selectedShipment.id, {
        courierName: manualCourier.trim(),
        awbCode: manualAwb.trim(),
        trackingUrl: manualTrackingUrl.trim() || undefined
      })
      toast.success("Shipment marked as shipped successfully!", { id: toastId })
      setShowManualShipModal(false)
      fetchShipments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark shipment as shipped", { id: toastId })
    } finally {
      setManualShipLoading(false)
    }
  }

  const handleBookShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipment) return

    setBookingLoading(true)
    const toastId = toast.loading("Booking shipment on Shiprocket...")

    try {
      await vendorService.bookShipment(selectedShipment.id, {
        weight: parseFloat(weight),
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        pickupLocation
      })
      toast.success("Shipment successfully booked! Courier assigned and AWB generated.", { id: toastId })
      setShowBookModal(false)
      fetchShipments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book shipment on Shiprocket", { id: toastId })
    } finally {
      setBookingLoading(false)
    }
  }

  const handlePrintLabel = async (shipment: ShipmentItem) => {
    const toastId = toast.loading("Retrieving shipping label PDF...")
    try {
      const result = await vendorService.getShipmentLabel(shipment.id)
      if (result.labelUrl) {
        window.open(result.labelUrl, '_blank')
        toast.success("Shipping label loaded successfully", { id: toastId })
      } else {
        throw new Error("Label URL missing")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to retrieve shipping label", { id: toastId })
    }
  }

  const handleOpenTrackingModal = async (shipment: ShipmentItem) => {
    setSelectedShipment(shipment)
    setTrackingData(null)
    setTrackingLoading(true)
    setShowTrackingModal(true)

    try {
      const tracking = await vendorService.getShipmentTracking(shipment.id)
      setTrackingData(tracking)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to retrieve tracking details")
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleHandoverShipment = async (shipment: ShipmentItem) => {
    const toastId = toast.loading("Processing courier handover...")
    try {
      await vendorService.handoverShipment(shipment.id)
      toast.success("Shipment successfully handed over to courier!", { id: toastId })
      fetchShipments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to handover shipment", { id: toastId })
    }
  }

  const handleCancelShipment = async (shipment: ShipmentItem) => {
    const isBooked = !!shipment.shiprocketOrderId
    const confirmMsg = isBooked 
      ? "Are you sure you want to cancel this shipment? This will also cancel the order booked on Shiprocket."
      : "Are you sure you want to cancel this shipment?"
      
    if (!window.confirm(confirmMsg)) return

    const toastId = toast.loading("Cancelling shipment...")
    try {
      await vendorService.cancelShipment(shipment.id)
      toast.success("Shipment successfully cancelled!", { id: toastId })
      fetchShipments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel shipment", { id: toastId })
    }
  }

  const handleGenerateAwb = async (shipment: ShipmentItem) => {
    const toastId = toast.loading("Requesting AWB from Shiprocket...")
    try {
      await vendorService.generateAwb(shipment.id)
      toast.success("AWB generated and courier assigned successfully!", { id: toastId })
      fetchShipments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate AWB", { id: toastId })
    }
  }

  React.useEffect(() => {
    console.log("Shipments query param hook triggered:", {
      loading,
      shipmentsCount: shipments.length,
      processedParams: processedParamsRef.current,
      queryOrderId,
      queryBook,
      queryTrack
    });

    if (loading || shipments.length === 0 || processedParamsRef.current) return;

    if (queryOrderId) {
      console.log("Setting search query to:", queryOrderId);
      setSearchQuery(queryOrderId);

      const matched = shipments.find(
        s => s.orderId.toLowerCase() === queryOrderId.toLowerCase()
      );

      console.log("Matched shipment search result:", matched);

      if (matched) {
        if (queryBook === 'true' && matched.status === 'READY_TO_SHIP') {
          console.log("Auto-opening book modal for:", matched);
          handleOpenBookModal(matched);
          processedParamsRef.current = true;
        } else if (queryTrack === 'true' && matched.awbCode) {
          console.log("Auto-opening tracking modal for:", matched);
          handleOpenTrackingModal(matched);
          processedParamsRef.current = true;
        } else {
          console.log("Condition not met for auto-modal:", {
            queryBook,
            status: matched.status,
            queryTrack,
            awbCode: matched.awbCode
          });
        }
      } else {
        console.log("No matched shipment found in shipments list for orderId:", queryOrderId);
      }
    }
  }, [loading, shipments, queryOrderId, queryBook, queryTrack]);

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase()
    switch (s) {
      case 'DELIVERED':  return "bg-[#A6D608]/10 text-[#A6D608] border-[#A6D608]/20"
      case 'SHIPPED':    return "bg-purple-50 text-purple-500 border-purple-100"
      case 'READY_TO_SHIP': return "bg-orange-50 text-orange-500 border-orange-100"
      case 'CANCELLED':  return "bg-red-50 text-red-500 border-red-100"
      default:           return "bg-gray-50 text-gray-400 border-gray-100"
    }
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Logistics & Shipments</h1>
             <p className="text-gray-500 font-medium">Book and track multi-vendor orders via Shiprocket.</p>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {['all', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'].map((status) => (
             <Button
               key={status}
               variant="ghost"
               onClick={() => setSelectedStatus(status)}
               className={cn(
                 "rounded-2xl px-6 h-11 font-black text-xs uppercase tracking-widest transition-all",
                 selectedStatus === status 
                   ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
                   : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
               )}
             >
               {status.replace(/_/g, ' ')}
             </Button>
           ))}
        </div>

        {/* Search & Listing */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative group transition-all">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="relative group max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID or AWB Code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                />
             </div>
          </div>

          {loading ? (
            <div className="py-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6D608]"></div>
            </div>
          ) : filteredShipments.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-50">
                     <th className="pl-8 pr-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipment Details</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient Details</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Courier Partner</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">AWB Code</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {filteredShipments.map((shipment) => (
                     <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors group/row">
                        
                        {/* Order & Product Image */}
                        <td className="pl-8 pr-4 py-6 max-w-[240px]">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover/row:bg-white transition-colors">
                                  {shipment.order.items && shipment.order.items.length > 0 && shipment.order.items[0].product?.images && shipment.order.items[0].product.images.length > 0 ? (
                                     <img src={shipment.order.items[0].product.images[0].url} alt="product" className="w-full h-full object-cover" />
                                  ) : (
                                     <Package className="w-5 h-5 text-[#A6D608]" />
                                  )}
                               </div>
                               <div className="min-w-0">
                                  <span className="font-black text-gray-900 text-xs tracking-tight block">#{shipment.orderId.slice(0, 8)}</span>
                                  <span className="text-[11px] font-bold text-gray-500 truncate block max-w-[170px]">
                                     {shipment.order.items.map(i => i.title).join(', ')}
                                  </span>
                                </div>
                            </div>
                        </td>

                        {/* Recipient Details */}
                        <td className="px-8 py-6">
                            <p className="text-sm font-black text-gray-900">{shipment.order?.address?.fullName || "Recipient"}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                              {shipment.order?.address?.city}, {shipment.order?.address?.pincode}
                            </p>
                        </td>

                        {/* Courier Partner */}
                        <td className="px-8 py-6 text-sm font-black text-gray-900">
                            {shipment.courierName || <span className="text-gray-400 font-bold text-xs">Not Booked</span>}
                        </td>

                        {/* AWB Code */}
                        <td className="px-8 py-6">
                            {shipment.awbCode ? (
                              <span className="font-mono text-xs font-black text-gray-750 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-lg">
                                {shipment.awbCode}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-bold text-xs">—</span>
                            )}
                        </td>

                        {/* Status badge */}
                        <td className="px-8 py-6">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-xl border font-black text-[10px] uppercase tracking-wider",
                              getStatusColor(shipment.status)
                            )}>
                               <span className="w-1.5 h-1.5 rounded-full bg-current" />
                               {shipment.status.replace(/_/g, ' ')}
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6 text-right">
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors">
                                 <MoreVertical className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-xl">
                               <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</DropdownMenuLabel>
                               
                               <DropdownMenuItem 
                                 onClick={() => {
                                   setSelectedShipment(shipment);
                                   setShowDetailsModal(true);
                                 }}
                                 className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                               >
                                 <Eye className="w-4 h-4 text-gray-400" /> View Details
                               </DropdownMenuItem>

                               <DropdownMenuSeparator className="my-1 border-gray-50" />

                               {shipment.status === 'READY_TO_SHIP' && !shipment.shiprocketOrderId && (
                                 <>
                                   <DropdownMenuItem 
                                     onClick={() => handleOpenBookModal(shipment)}
                                     className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-orange-500 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer"
                                   >
                                     <Truck className="w-4 h-4" /> Book on Shiprocket
                                   </DropdownMenuItem>
                                   <DropdownMenuItem 
                                     onClick={() => handleOpenManualShipModal(shipment)}
                                     className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-[#A6D608] hover:bg-[#A6D608]/5 focus:bg-[#A6D608]/5 cursor-pointer"
                                   >
                                     <CheckCircle className="w-4 h-4" /> Ship Manually
                                   </DropdownMenuItem>
                                 </>
                               )}

                               {shipment.status === 'READY_TO_SHIP' && shipment.shiprocketOrderId && shipment.awbCode && (
                                 <DropdownMenuItem 
                                   onClick={() => handleHandoverShipment(shipment)}
                                   className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-blue-500 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                                 >
                                   <CheckCircle className="w-4 h-4" /> Handover to Courier
                                 </DropdownMenuItem>
                               )}

                               {shipment.status === 'READY_TO_SHIP' && shipment.shiprocketOrderId && !shipment.awbCode && (
                                 <DropdownMenuItem 
                                   onClick={() => handleGenerateAwb(shipment)}
                                   className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-blue-600 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                                 >
                                   <Activity className="w-4 h-4" /> Generate AWB
                                 </DropdownMenuItem>
                               )}

                               {shipment.shipmentId && (
                                 <DropdownMenuItem 
                                   onClick={() => handlePrintLabel(shipment)}
                                   className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-purple-500 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                                 >
                                   <Printer className="w-4 h-4" /> Print Label
                                 </DropdownMenuItem>
                               )}

                               {shipment.awbCode && (
                                 <DropdownMenuItem 
                                   onClick={() => handleOpenTrackingModal(shipment)}
                                   className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-[#A6D608] hover:bg-[#A6D608]/5 focus:bg-[#A6D608]/5 cursor-pointer"
                                 >
                                   <Activity className="w-4 h-4" /> Track Courier
                                 </DropdownMenuItem>
                               )}

                               {shipment.status === 'READY_TO_SHIP' && (
                                 <>
                                   <DropdownMenuSeparator className="my-1 border-gray-50" />
                                   <DropdownMenuItem 
                                     onClick={() => handleCancelShipment(shipment)}
                                     className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-red-500 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                                   >
                                     <X className="w-4 h-4" /> Cancel Shipment
                                   </DropdownMenuItem>
                                 </>
                               )}
                             </DropdownMenuContent>
                           </DropdownMenu>
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          ) : (
             <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                   <Truck className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No shipments found</h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium italic">
                   There are no shipments matching your filter criteria.
                </p>
                <Button 
                   onClick={() => setSelectedStatus("all")}
                   className="mt-8 bg-gray-900 text-white hover:bg-gray-800 rounded-2xl px-8"
                >
                   Reset Filters
                </Button>
             </div>
          )}
        </div>

        {/* Modal: Shipment Details */}
        {showDetailsModal && selectedShipment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
             <div className="bg-white w-full max-w-2xl rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-8 max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608]">
                         <Package className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-gray-900">Shipment Details</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Shipment Ref ID: {selectedShipment.id}
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowDetailsModal(false)}
                     className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                   >
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
                   
                   {/* Products List */}
                   <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Items to Ship</h4>
                      <div className="space-y-2">
                        {selectedShipment.order.items.map((item) => (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                             <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                {item.product?.images && item.product.images.length > 0 ? (
                                   <img src={item.product.images[0].url} alt="prod" className="w-full h-full object-cover" />
                                ) : (
                                   <Package className="w-5 h-5 text-[#A6D608]" />
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-900 text-sm truncate">{item.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-gray-900">₹{item.total.toLocaleString()}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Delivery Address */}
                   <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Shipping Address</h4>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                         <p className="text-sm font-black text-gray-900">{selectedShipment.order.address?.fullName}</p>
                         <p className="text-xs font-bold text-gray-600 leading-relaxed">{selectedShipment.order.address?.street}</p>
                         <p className="text-xs font-black text-gray-700">
                           {selectedShipment.order.address?.city}, {selectedShipment.order.address?.state} - <span className="font-mono">{selectedShipment.order.address?.pincode}</span>
                         </p>
                         <p className="text-xs font-bold text-gray-500">Contact: {selectedShipment.order.address?.phone || "N/A"}</p>
                      </div>
                   </div>

                   {/* Logistics Info */}
                   <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Logistics Information (Shiprocket)</h4>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4 text-xs font-bold">
                         <div>
                            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Shiprocket Order ID</span>
                            <span className="text-gray-900 font-black">{selectedShipment.shiprocketOrderId || "Not Sync'd"}</span>
                         </div>
                         <div>
                            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Shiprocket Shipment ID</span>
                            <span className="text-gray-900 font-black">{selectedShipment.shipmentId || "Not Sync'd"}</span>
                         </div>
                         <div>
                            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Air Waybill (AWB)</span>
                            <span className="text-gray-900 font-black">{selectedShipment.awbCode || "Not Booked"}</span>
                         </div>
                         <div>
                            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Courier Partner</span>
                            <span className="text-[#A6D608] font-black">{selectedShipment.courierName || "Not Assigned"}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 gap-3">
                   {selectedShipment.status === 'READY_TO_SHIP' && !selectedShipment.shiprocketOrderId && (
                     <>
                       <Button 
                         onClick={() => {
                           setShowDetailsModal(false)
                           handleOpenBookModal(selectedShipment)
                         }}
                         className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                       >
                         Book Courier
                       </Button>
                       <Button 
                         onClick={() => {
                           setShowDetailsModal(false)
                           handleOpenManualShipModal(selectedShipment)
                         }}
                         className="bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                       >
                         Ship Manually
                       </Button>
                     </>
                   )}
                   {selectedShipment.status === 'READY_TO_SHIP' && selectedShipment.shiprocketOrderId && selectedShipment.awbCode && (
                     <Button 
                       onClick={() => {
                         setShowDetailsModal(false)
                         handleHandoverShipment(selectedShipment)
                       }}
                       className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                     >
                       Handover to Courier
                     </Button>
                   )}
                   {selectedShipment.status === 'READY_TO_SHIP' && selectedShipment.shiprocketOrderId && !selectedShipment.awbCode && (
                     <Button 
                       onClick={() => {
                         setShowDetailsModal(false)
                         handleGenerateAwb(selectedShipment)
                       }}
                       className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                     >
                       Generate AWB
                     </Button>
                   )}
                   <Button 
                     onClick={() => setShowDetailsModal(false)}
                     className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                   >
                      Close
                   </Button>
                </div>
             </div>
          </div>
        )}

        {/* Modal: Book Shipment Form */}
        {showBookModal && selectedShipment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                         <Truck className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-gray-900">Book Shipment</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Order: #{selectedShipment.orderId.slice(0, 8)}
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowBookModal(false)}
                     className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                   >
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <form onSubmit={handleBookShipment}>
                  <div className="p-8 space-y-4 text-left">
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5" /> Weight (kg)
                          </label>
                          <input 
                            type="number" 
                            step="0.01" 
                            required
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" /> Length (cm)
                          </label>
                          <input 
                            type="number" 
                            required
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                          />
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                            Width (cm)
                          </label>
                          <input 
                            type="number" 
                            required
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                            Height (cm)
                          </label>
                          <input 
                            type="number" 
                            required
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                          />
                       </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Pickup Location Nickname
                        </label>
                        <input 
                          type="text" 
                          required
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g. Primary, Warehouse-1"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                        />
                        <p className="text-[10px] text-gray-400 font-bold">Must match your pickup location configured on Shiprocket.</p>
                     </div>

                  </div>

                  <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 gap-3">
                     <Button 
                       type="button"
                       variant="ghost"
                       onClick={() => setShowBookModal(false)}
                       className="rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                     >
                        Cancel
                     </Button>
                     <Button 
                       type="submit"
                       disabled={bookingLoading}
                       className="bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11 shadow-lg shadow-[#A6D608]/20"
                     >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                     </Button>
                  </div>
                </form>
             </div>
          </div>
        )}

        {/* Modal: Manual Ship Form */}
        {showManualShipModal && selectedShipment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                         <Truck className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-gray-900">Ship Manually</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Order: #{selectedShipment.orderId.slice(0, 8)}
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowManualShipModal(false)}
                     className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                   >
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <form onSubmit={handleManualShipment}>
                  <div className="p-8 space-y-4 text-left">
                     
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Courier / Carrier Name *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={manualCourier}
                          onChange={(e) => setManualCourier(e.target.value)}
                          placeholder="e.g. Blue Dart, Delhivery, DTDC"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Tracking / AWB Number *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={manualAwb}
                          onChange={(e) => setManualAwb(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Tracking Link URL (Optional)
                        </label>
                        <input 
                          type="url" 
                          value={manualTrackingUrl}
                          onChange={(e) => setManualTrackingUrl(e.target.value)}
                          placeholder="e.g. https://www.bluedart.com/track?id=..."
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                        />
                     </div>

                  </div>

                  <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 gap-3">
                     <Button 
                       type="button"
                       variant="ghost"
                       onClick={() => setShowManualShipModal(false)}
                       className="rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                     >
                        Cancel
                     </Button>
                     <Button 
                       type="submit"
                       disabled={manualShipLoading}
                       className="bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11 shadow-lg shadow-[#A6D608]/20"
                     >
                        {manualShipLoading ? "Submitting..." : "Mark as Shipped"}
                     </Button>
                  </div>
                </form>
             </div>
          </div>
        )}

        {/* Modal: Track Courier */}
        {showTrackingModal && selectedShipment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-505">
                         <Activity className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-gray-900">Courier Tracking</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            AWB: {selectedShipment.awbCode} | {selectedShipment.courierName}
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowTrackingModal(false)}
                     className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                   >
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-left">
                  {trackingLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fetching live location updates...</p>
                    </div>
                  ) : trackingData && trackingData.tracking_data && trackingData.tracking_data.shipment_track_activities ? (
                    <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-6">
                      {trackingData.tracking_data.shipment_track_activities.map((act: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className={cn(
                            "absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 bg-white",
                            idx === 0 ? "border-[#A6D608] ring-4 ring-[#A6D608]/15" : "border-gray-300"
                          )} />
                          <p className="text-sm font-black text-gray-900 leading-none">{act.activity}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                            {act.location || "In Transit"} | {new Date(act.date).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                       <AlertCircle className="w-10 h-10 text-gray-300" />
                       <h4 className="text-sm font-black text-gray-800">No Tracking Activities Available</h4>
                       <p className="text-xs text-gray-500 max-w-[240px]">
                         Courier partner has not logged any transit scans or tracking activities for this AWB code yet.
                       </p>
                    </div>
                  )}
                </div>

                <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                   <Button 
                     onClick={() => setShowTrackingModal(false)}
                     className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11"
                   >
                      Close
                   </Button>
                </div>
             </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}

export default function VendorShipmentsPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6D608]"></div>
      </div>
    }>
      <VendorShipmentsPageContent />
    </React.Suspense>
  )
}
