"use client"

import * as React from "react"
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Filter, 
  Clock, 
  Eye, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Calendar,
  MessageSquare,
  Package,
  Activity,
  CheckCircle,
  X
} from "lucide-react"
import { vendorService, VendorOrderItem } from "@/services/vendorService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export default function VendorOrdersPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<VendorOrderItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedOrder, setSelectedOrder] = React.useState<VendorOrderItem | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([])

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const allFilteredIds = filteredOrders.map(o => o.id)
    const areAllSelected = allFilteredIds.every(id => selectedItemIds.includes(id))
    if (areAllSelected) {
      setSelectedItemIds(prev => prev.filter(id => !allFilteredIds.includes(id)))
    } else {
      setSelectedItemIds(prev => {
        const combined = [...prev, ...allFilteredIds]
        return Array.from(new Set(combined))
      })
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedItemIds.length === 0) return;
    const loadingToast = toast.loading(`Updating ${selectedItemIds.length} orders to ${newStatus}...`);
    try {
      for (const id of selectedItemIds) {
        await vendorService.updateItemStatus(id, newStatus);
      }
      toast.success(`Successfully updated selected orders`, { id: loadingToast });
      setSelectedItemIds([]);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update some orders in bulk", { id: loadingToast });
    }
  }

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = selectedStatus === 'all' ? undefined : selectedStatus.toUpperCase()
      const result = await vendorService.getMyOrders({ 
        status: statusParam as any,
        limit: 50 
      })
      setItems(result.items || [])
    } catch (error) {
      toast.error("Failed to load global orders")
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = items.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.order?.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await vendorService.updateItemStatus(id, newStatus)
      toast.success(`Order updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'delivered':  return "bg-[#A6D608]/10 text-[#A6D608] border-[#A6D608]/20"
      case 'confirmed':  return "bg-blue-50 text-blue-600 border-blue-100"
      case 'processing': return "bg-indigo-50 text-indigo-500 border-indigo-100"
      case 'shipped':    return "bg-purple-50 text-purple-500 border-purple-100"
      case 'pending':    return "bg-orange-50 text-orange-500 border-orange-100"
      case 'partial':    return "bg-amber-50 text-amber-600 border-amber-100"
      case 'cancelled':  return "bg-red-50 text-red-500 border-red-100"
      case 'refunded':   return "bg-rose-50 text-rose-500 border-rose-100"
      default:           return "bg-gray-50 text-gray-400 border-gray-100"
    }
  }

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Manage Orders</h1>
             <p className="text-gray-500 font-medium italic">Track fulfillment and manage customer orders.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl border-gray-200 hover:bg-gray-50 font-bold px-6 h-12 gap-2 transition-all italic">
                <Calendar className="w-4 h-4 text-gray-400" />
                This Month
             </Button>
             <Button className="bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-2xl px-6 h-12 shadow-lg shadow-[#A6D608]/20 transition-all font-black">
                Export CSV
             </Button>
          </div>
        </div>

        {/* Orders Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
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
               {status}
             </Button>
           ))}
        </div>

        {/* Orders List / Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative group transition-all">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="relative group max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all" 
                />
             </div>
             <div className="flex items-center gap-3">
                <Button variant="ghost" className="rounded-xl italic font-bold gap-2 text-gray-400 hover:text-gray-900">
                   <Filter className="w-4 h-4" />
                   More Filters
                </Button>
             </div>
          </div>

          {loading ? (
            <div className="py-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6D608]"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-50">
                     <th className="pl-8 pr-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center w-12">
                       <input 
                         type="checkbox" 
                         checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedItemIds.includes(o.id))}
                         onChange={toggleSelectAll}
                         className="w-4 h-4 rounded bg-gray-50 border-gray-200 text-[#A6D608] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                       />
                     </th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Order Details</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Customer</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Inventory</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Amount</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {filteredOrders.map((order) => (
                     <tr 
                       key={order.id} 
                       className={cn(
                         "hover:bg-gray-50/50 transition-colors group/row",
                         selectedItemIds.includes(order.id) && "bg-[#A6D608]/5 hover:bg-[#A6D608]/5"
                       )}
                     >
                        <td className="pl-8 pr-4 py-6 text-center w-12">
                          <input 
                            type="checkbox" 
                            checked={selectedItemIds.includes(order.id)}
                            onChange={() => toggleSelectItem(order.id)}
                            className="w-4 h-4 rounded bg-gray-50 border-gray-200 text-[#A6D608] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-6 max-w-[240px]">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover/row:bg-white transition-colors">
                                  {order.product?.images && order.product.images.length > 0 ? (
                                     <img src={order.product.images[0].url} alt={order.title} className="w-full h-full object-cover" />
                                  ) : (
                                     <ShoppingBag className="w-5 h-5 text-[#A6D608]" />
                                  )}
                               </div>
                               <div className="min-w-0">
                                  <span className="font-black text-gray-900 text-xs italic tracking-tight block">#{order.orderId.slice(0, 8)}</span>
                                  <span className="text-[11px] font-bold text-gray-500 truncate block max-w-[170px]" title={order.title}>{order.title}</span>
                                </div>
                            </div>
                        </td>
                       <td className="px-8 py-6">
                           <p className="text-sm font-black text-gray-900">{order.order?.user?.name || 'Customer'}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Premium Member</p>
                       </td>
                       <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase italic">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(order.createdAt).toLocaleDateString()}
                           </div>
                       </td>
                       <td className="px-8 py-6 text-sm font-black text-gray-900">
                           {order.quantity} {order.quantity === 1 ? 'unit' : 'units'}
                       </td>
                       <td className="px-8 py-6">
                           <span className="text-sm font-black text-[#A6D608] tracking-tight">₹{order.total.toLocaleString()}</span>
                       </td>
                       <td className="px-8 py-6">
                           <div className={cn(
                             "inline-flex items-center gap-2 px-3 py-1 rounded-xl border font-black text-[10px] uppercase tracking-wider",
                             getStatusColor(order.status)
                           )}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {order.status}
                           </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-xl">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Management</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowModal(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-gray-400" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 border-gray-50" />
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Update Fulfillment</DropdownMenuLabel>
                              
                              {order.status === 'PENDING' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-blue-500 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                                >
                                  <Activity className="w-4 h-4" /> Accept Order
                                </DropdownMenuItem>
                              )}
                              
                              {order.status === 'PROCESSING' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    console.log("Book shipment clicked in dropdown. Order details:", order);
                                    router.push(`/dashboard/vendor/shipments?orderId=${order.orderId}&book=true`);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-purple-500 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                                >
                                  <Truck className="w-4 h-4" /> Book Shipment (Shiprocket)
                                </DropdownMenuItem>
                              )}

                              {order.status === 'SHIPPED' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/dashboard/vendor/shipments?orderId=${order.orderId}&track=true`)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-purple-500 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                                  >
                                    <Activity className="w-4 h-4" /> Track Courier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-[#A6D608] hover:bg-[#A6D608]/5 focus:bg-[#A6D608]/5 cursor-pointer"
                                  >
                                    <CheckCircle className="w-4 h-4" /> Mark as Delivered
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
                   <ShoppingBag className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No matching orders</h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium italic">
                   We couldn't find any orders matching the current filter and search criteria.
                </p>
                <Button 
                   onClick={() => {
                    setSearchQuery("")
                    setSelectedStatus("all")
                  }}
                  className="mt-8 bg-gray-900 text-white hover:bg-gray-800 rounded-2xl px-8"
                >
                   Reset Filters
                </Button>
             </div>
          )}
        </div>

        {/* Order Fulfillment Helper Card (Sideboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-[#A6D608]/5 rounded-[32px] p-8 border border-[#A6D608]/10 group relative overflow-hidden italic">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#A6D608]/10 rounded-full group-hover:scale-150 transition-transform" />
              <Truck className="w-8 h-8 text-[#A6D608] mb-6" />
              <h4 className="text-lg font-black text-gray-900 mb-2">Need logistical help?</h4>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">Druxx Logistics partners are available to pick up orders directly from your warehouse within 4 hours.</p>
              <Button className="w-full bg-[#A6D608] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#A6D608]/20 h-11">Request Pickup</Button>
           </div>
           
           <div className="bg-white rounded-[32px] p-8 border border-gray-100 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-blue-500 mb-4" />
              <h4 className="text-lg font-black text-gray-900 mb-1">100% On-Time</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic mb-6">Fulfillment Score</p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-blue-500" />
              </div>
           </div>

           <div className="bg-white rounded-[32px] p-8 border border-gray-100 group cursor-pointer hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                     <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Urgent Queries</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Customer Support</p>
                  </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 transition-all hover:bg-orange-50/50">
                    <span className="font-bold text-gray-600 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Order #12A9</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Stunning detailed Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white w-full max-w-2xl rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-8 max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608]">
                       <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-gray-900">Order Fulfillment Details</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                          Fulfillment ID: #{selectedOrder.id.slice(0, 8)} | Order ID: #{selectedOrder.orderId.slice(0, 8)}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setShowModal(false)}
                   className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
                 
                 {/* Section 1: Product & Pricing */}
                 <div className="space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Product & Earnings</h4>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                       <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {selectedOrder.product?.images && selectedOrder.product.images.length > 0 ? (
                             <img src={selectedOrder.product.images[0].url} alt={selectedOrder.title} className="w-full h-full object-cover" />
                          ) : (
                             <ShoppingBag className="w-6 h-6 text-[#A6D608]" />
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm truncate">{selectedOrder.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                             Product ID: {selectedOrder.productId}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                             <p className="text-xs text-gray-500 font-bold">
                                Qty: <span className="text-gray-900 font-black">{selectedOrder.quantity}</span>
                             </p>
                             <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                             <p className="text-xs text-gray-500 font-bold">
                                Unit Price: <span className="text-gray-900 font-black">₹{selectedOrder.price.toLocaleString()}</span>
                             </p>
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Your Earnings</p>
                          <p className="text-lg font-black text-[#A6D608] mt-0.5">₹{selectedOrder.total.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 {/* Section 2: Customer & Shipping Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Customer Profile</h4>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 h-full">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</p>
                             <p className="text-sm font-black text-gray-900">{selectedOrder.order?.user?.name || "Customer"}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                             <p className="text-xs font-bold text-gray-600 truncate">{selectedOrder.order?.user?.email || "N/A"}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                             <p className="text-xs font-bold text-gray-600">{selectedOrder.order?.address?.phone || selectedOrder.order?.user?.phone || "N/A"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Delivery Address</h4>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 h-full">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</p>
                             <p className="text-sm font-black text-gray-900">{selectedOrder.order?.address?.fullName || "Recipient"}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Street Address</p>
                             <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                {selectedOrder.order?.address?.line1}
                                {selectedOrder.order?.address?.line2 && <span className="block text-gray-500 mt-0.5">{selectedOrder.order?.address?.line2}</span>}
                             </p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City, State & Pincode</p>
                             <p className="text-xs font-black text-gray-700">
                                {selectedOrder.order?.address?.city}, {selectedOrder.order?.address?.state} - <span className="font-mono">{selectedOrder.order?.address?.pincode}</span>
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Section 3: Billing & Status */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Payment Information</h4>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                             <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Payment Method</span>
                             <span className="font-black text-gray-700 uppercase">{selectedOrder.order?.paymentMethod || "Razorpay"}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Payment Status</span>
                             <span className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-600 font-black text-[9px] uppercase">
                                {selectedOrder.order?.paymentStatus || "PAID"}
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Order Date</span>
                             <span className="font-bold text-gray-600">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Fulfillment Progress</h4>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</span>
                             <div className={cn(
                               "inline-flex items-center gap-2 px-3 py-1 rounded-xl border font-black text-[10px] uppercase tracking-wider",
                               getStatusColor(selectedOrder.status)
                             )}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {selectedOrder.status}
                             </div>
                          </div>
                          
                          {/* Action button directly inside the modal */}
                          <div className="flex gap-2 w-full pt-1.5">
                             {selectedOrder.status === 'PENDING' && (
                                <Button 
                                  onClick={() => {
                                    handleStatusUpdate(selectedOrder.id, 'PROCESSING');
                                    setShowModal(false);
                                  }}
                                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
                                >
                                   <Activity size={14} /> Accept Order
                                </Button>
                             )}
                             {selectedOrder.status === 'PROCESSING' && (
                                 <Button 
                                   onClick={() => {
                                     setShowModal(false);
                                     console.log("Book shipment clicked in modal. SelectedOrder details:", selectedOrder);
                                     router.push(`/dashboard/vendor/shipments?orderId=${selectedOrder.orderId}&book=true`);
                                   }}
                                   className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-md shadow-purple-500/10 active:scale-95 transition-all"
                                 >
                                    <Truck size={14} /> Book Shipment (Shiprocket)
                                 </Button>
                              )}
                              {selectedOrder.status === 'SHIPPED' && (
                                 <div className="flex gap-2 w-full">
                                    <Button 
                                      onClick={() => {
                                        console.log("Track courier clicked in modal. SelectedOrder:", selectedOrder);
                                        setShowModal(false);
                                        router.push(`/dashboard/vendor/shipments?orderId=${selectedOrder.orderId}&track=true`);
                                      }}
                                      className="w-1/2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-md shadow-purple-500/10 active:scale-95 transition-all"
                                    >
                                       <Activity size={14} /> Track Courier
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        handleStatusUpdate(selectedOrder.id, 'DELIVERED');
                                        setShowModal(false);
                                      }}
                                      className="w-1/2 bg-[#A6D608] hover:bg-[#8ab506] text-white rounded-xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-md shadow-[#A6D608]/10 active:scale-95 transition-all"
                                    >
                                       <CheckCircle size={14} /> Complete Delivery
                                    </Button>
                                 </div>
                              )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 gap-3">
                 <Button 
                   onClick={() => setShowModal(false)}
                   className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-black text-xs uppercase tracking-widest h-11 transition-all active:scale-95"
                 >
                    Dismiss
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-150 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#A6D608]/15 flex items-center justify-center text-[#A6D608]">
                 <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-black text-gray-900 tracking-tight">
                 {selectedItemIds.length} {selectedItemIds.length === 1 ? 'item' : 'items'} selected
              </span>
           </div>
           
           <span className="w-[1px] h-6 bg-gray-200" />
           
           <div className="flex items-center gap-2">
              <Button
                onClick={() => handleBulkStatusUpdate('PROCESSING')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                 Bulk Accept
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate('DELIVERED')}
                className="bg-[#A6D608]/10 hover:bg-[#A6D608]/20 text-[#A6D608] border border-[#A6D608]/20 rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                 Bulk Deliver
              </Button>
              
              <span className="w-[1px] h-6 bg-gray-200 mx-1" />
              
              <Button
                variant="ghost"
                onClick={() => setSelectedItemIds([])}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl h-10 px-3 font-bold text-xs"
              >
                 Cancel
              </Button>
           </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
