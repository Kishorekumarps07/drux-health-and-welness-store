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
  CheckCircle
} from "lucide-react"
import { vendorService, VendorOrderItem } from "@/services/vendorService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export default function VendorOrdersPage() {
  const [items, setItems] = React.useState<VendorOrderItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

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
      case 'delivered': return "bg-[#A6D608]/10 text-[#A6D608] border-[#A6D608]/20"
      case 'processing': return "bg-blue-50 text-blue-500 border-blue-100"
      case 'shipped': return "bg-purple-50 text-purple-500 border-purple-100"
      case 'pending': return "bg-orange-50 text-orange-500 border-orange-100"
      case 'cancelled': return "bg-red-50 text-red-500 border-red-100"
      default: return "bg-gray-50 text-gray-400"
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
           {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
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
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Order Details</th>
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
                     <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group/row">
                       <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#A6D608] group-hover/row:bg-white transition-colors">
                                 <ShoppingBag className="w-5 h-5" />
                              </div>
                              <span className="font-black text-gray-900 text-sm italic tracking-tight">#{order.orderId.slice(0, 8)}</span>
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
                              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer">
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
                                  onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-purple-500 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                                >
                                  <Truck className="w-4 h-4" /> Mark as Shipped
                                </DropdownMenuItem>
                              )}

                              {order.status === 'SHIPPED' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-black rounded-xl text-[#A6D608] hover:bg-[#A6D608]/5 focus:bg-[#A6D608]/5 cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" /> Mark as Delivered
                                </DropdownMenuItem>
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
    </ProtectedRoute>
  )
}
