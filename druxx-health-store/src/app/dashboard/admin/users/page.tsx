"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  UserCircle,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Copy,
  History,
  Eye,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER"
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(newUser.name, newUser.email, newUser.password, newUser.role);
      
      toast.success("User account created successfully");
      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "CUSTOMER" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.data?.message || "Failed to create user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await adminService.listUsers({ page, limit: 10, search, role });
      setUsers(result.users || []);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (!roles) return <Badge className="bg-[#374151] text-[#D1D5DB] border-[#374151]">Customer</Badge>;
    if (roles.includes('ADMIN')) return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Admin</Badge>;
    if (roles.includes('VENDOR')) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Vendor</Badge>;
    return <Badge className="bg-[#374151] text-[#D1D5DB] border-[#374151]">Customer</Badge>;
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Users</h1>
          <p className="text-[#9CA3AF] font-medium mt-1">Manage all registered accounts across the platform</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#08D6A6] hover:bg-[#07c296] text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-[#08D6A6]/20 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="bg-[#111827] p-6 rounded-[2rem] border border-[#1F2937] shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] w-5 h-5" />
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-[#1F2937] border-none rounded-2xl font-medium focus-visible:ring-2 focus-visible:ring-[#08D6A6]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-14 bg-[#1F2937] border-none rounded-2xl px-6 font-bold text-gray-600 focus:ring-2 focus:ring-[#08D6A6] cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="ADMIN">Admins</option>
          </select>
          <Button variant="outline" className="h-14 rounded-2xl px-6 font-bold border-[#1F2937] hover:bg-[#1F2937] border-2">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] rounded-[2rem] border border-[#1F2937] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1F2937]/30 border-b border-[#1F2937]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">User Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Account Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Connected Store</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-20 bg-[#1F2937]/20" />
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#1F2937] rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#4B5563]" />
                      </div>
                      <p className="text-[#9CA3AF] font-bold">No users found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#374151] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                          <UserCircle className="w-6 h-6 text-[#6B7280]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white flex items-center gap-1.5">
                            {user.name}
                            {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#08D6A6]" />}
                          </p>
                          <p className="text-xs text-[#6B7280] font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getRoleBadge(user.roles)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          user.isVerified ? "bg-[#08D6A6] shadow-[0_0_8px_#08D6A6]" : "bg-gray-300"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          user.isVerified ? "text-[#08D6A6]" : "text-[#6B7280]"
                        )}>
                          {user.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs text-[#9CA3AF] font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {user.vendor ? (
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold text-[#E5E7EB]">{user.vendor.storeName}</p>
                          <Badge variant="outline" className={cn(
                            "text-[8px] h-4 py-0 font-black uppercase tracking-widest border-0",
                            user.vendor.approvalStatus === 'APPROVED' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                          )}>
                            {user.vendor.approvalStatus}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-10 h-10 p-0 rounded-xl hover:bg-[#374151] flex items-center justify-center transition-colors focus:outline-none border-0 bg-transparent cursor-pointer">
                          <MoreVertical className="w-5 h-5 text-[#6B7280]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-[#1F2937] bg-[#111827] shadow-xl p-2 min-w-[200px] text-white">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] px-3 py-2">
                            User Governance
                          </DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer focus:bg-[#1F2937] focus:text-[#08D6A6]">
                             <Eye className="w-4 h-4 mr-2" />
                             View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                             className="rounded-xl font-bold text-xs py-3 cursor-pointer focus:bg-[#1F2937] focus:text-[#08D6A6]"
                             onClick={() => {
                                window.location.href = `mailto:${user.email}`;
                             }}
                          >
                             <Mail className="w-4 h-4 mr-2" />
                             Contact User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                             className="rounded-xl font-bold text-xs py-3 cursor-pointer focus:bg-[#1F2937] focus:text-white"
                             onClick={() => {
                                if (typeof window !== 'undefined') {
                                   navigator.clipboard.writeText(user.id);
                                   toast.success("User ID copied to clipboard");
                                }
                             }}
                          >
                             <Copy className="w-4 h-4 mr-2" />
                             Copy User ID
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-[#1F2937] my-1" />
                          
                          <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer focus:bg-[#1F2937] focus:text-[#08D6A6]">
                             <Link href={`/dashboard/admin/audit-logs?search=${user.email}`} className="flex items-center w-full">
                                <History className="w-4 h-4 mr-2" />
                                Audit History
                             </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-[#1F2937] my-1" />
                          
                          <DropdownMenuItem 
                             className="rounded-xl font-bold text-xs py-3 cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-500/10"
                             onClick={() => toast.warning(`Initiating suspension protocol for ${user.name}...`)}
                          >
                             <ShieldAlert className="w-4 h-4 mr-2" />
                             Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-[#1F2937]/30 border-t border-[#1F2937] flex items-center justify-between">
          <p className="text-xs text-[#9CA3AF] font-bold">
            Showing <span className="text-white">{users.length}</span> users per page
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-xl h-10 w-10 border-[#374151]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-2 bg-[#111827] rounded-xl border border-[#374151] text-xs font-black text-white">
              {page} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="rounded-xl h-10 w-10 border-[#374151]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Add User Modal */}
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="max-w-md bg-[#111827] border-[#1F2937] text-white p-0 overflow-hidden rounded-[2rem]">
        <form onSubmit={handleAddUser}>
           <DialogHeader className="p-8 pb-4">
              <DialogTitle className="text-2xl font-black tracking-tight">Create New Account</DialogTitle>
              <DialogDescription className="text-[#9CA3AF] font-medium mt-1">
                 Manually register a custom account on the platform.
              </DialogDescription>
           </DialogHeader>
           
           <div className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                 <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] ml-1">Full Name</Label>
                 <Input 
                    id="name"
                    placeholder="e.g. John Doe"
                    className="h-12 bg-[#1F2937] border-none rounded-xl font-bold placeholder-[#4B5563] focus-visible:ring-2 focus-visible:ring-[#08D6A6]"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                 />
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] ml-1">Email Address</Label>
                 <Input 
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-12 bg-[#1F2937] border-none rounded-xl font-bold placeholder-[#4B5563] focus-visible:ring-2 focus-visible:ring-[#08D6A6]"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] ml-1">Password</Label>
                    <Input 
                       id="password"
                       type="password"
                       placeholder="••••••••"
                       className="h-12 bg-[#1F2937] border-none rounded-xl font-bold placeholder-[#4B5563] focus-visible:ring-2 focus-visible:ring-[#08D6A6]"
                       value={newUser.password}
                       onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                       required
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] ml-1">Account Role</Label>
                    <Select 
                       value={newUser.role} 
                       onValueChange={(val) => setNewUser({...newUser, role: val || "CUSTOMER"})}
                    >
                       <SelectTrigger className="h-12 bg-[#1F2937] border-none rounded-xl font-bold focus:ring-2 focus:ring-[#08D6A6]">
                          <SelectValue placeholder="Select Role" />
                       </SelectTrigger>
                       <SelectContent className="bg-[#111827] border-[#1F2937] text-white rounded-xl">
                          <SelectItem value="CUSTOMER" className="font-bold focus:bg-[#1F2937] focus:text-[#08D6A6]">Customer</SelectItem>
                          <SelectItem value="VENDOR" className="font-bold focus:bg-[#1F2937] focus:text-[#08D6A6]">Vendor Account</SelectItem>
                          <SelectItem value="ADMIN" className="font-bold focus:bg-[#1F2937] focus:text-[#08D6A6]">Administrator</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
           </div>
           
           <DialogFooter className="p-8 bg-[#1F2937]/30 border-t border-[#1F2937] flex gap-3">
              <Button 
                 type="button" 
                 variant="outline" 
                 onClick={() => setIsAddModalOpen(false)}
                 className="flex-1 rounded-xl h-12 font-bold border-[#1F2937] hover:bg-[#1F2937]"
              >
                 Cancel
              </Button>
              <Button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="flex-1 bg-[#08D6A6] hover:bg-[#07c296] text-white rounded-xl h-12 font-bold shadow-lg shadow-[#08D6A6]/20"
              >
                 {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                 ) : (
                    "Create Account"
                 )}
              </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
