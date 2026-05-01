"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCheck,
  Store,
  TrendingUp,
  Users,
  ExternalLink,
  Mail,
  History,
  Copy,
  Eye
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string;
  storeName: string;
  storeSlug: string;
  approvalStatus: "PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  totalSales: number;
  rating: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count: { products: number; orderItems: number };
}

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  APPROVED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Approved" },
  ACTIVE:   { icon: CheckCircle2, color: "text-[#08D6A6]",  bg: "bg-[#08D6A6]/8 border-[#08D6A6]/20", label: "Active" },
  PENDING:  { icon: Clock,        color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20", label: "Pending" },
  SUSPENDED:{ icon: ShieldAlert,  color: "text-red-500",    bg: "bg-red-500/10 border-red-500/20", label: "Suspended" },
  REJECTED: { icon: XCircle,      color: "text-[#6B7280]",   bg: "bg-[#1F2937] border-[#1F2937]", label: "Rejected" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Vendors" },
  { value: "PENDING",   label: "Pending Review" },
  { value: "APPROVED",  label: "Approved" },
  { value: "ACTIVE",    label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REJECTED",  label: "Rejected" },
];

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-[#1F2937]">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#374151] rounded-2xl flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-[#374151] rounded-lg" />
            <div className="h-3 w-24 bg-[#1F2937] rounded-lg" />
          </div>
        </div>
      </td>
      <td className="px-6 py-6"><div className="h-7 w-24 bg-[#374151] rounded-xl" /></td>
      <td className="px-6 py-6">
        <div className="space-y-1.5">
          <div className="h-4 w-20 bg-[#374151] rounded-lg" />
          <div className="h-3 w-16 bg-[#1F2937] rounded-lg" />
        </div>
      </td>
      <td className="px-6 py-6"><div className="h-4 w-14 bg-[#374151] rounded-lg" /></td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-9 w-24 bg-[#374151] rounded-xl" />
          <div className="h-9 w-9 bg-[#1F2937] rounded-xl" />
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminVendorsPage() {
  const [vendors, setVendors]       = useState<Vendor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch vendors ──────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async (opts?: { search?: string; status?: string; page?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: opts?.page ?? page,
        limit: 15,
      };
      if (opts?.search   !== undefined ? opts.search   : search)   params.search = opts?.search   ?? search;
      if (opts?.status   !== undefined ? opts.status   : statusFilter) params.status = opts?.status ?? statusFilter;

      const data = await adminService.listVendors(params);
      setVendors(data.vendors ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.pages ?? 1);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to fetch vendors";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchVendors();
  }, [page, statusFilter]); // re-fetch when page or filter changes

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchVendors({ search, page: 1 });
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (vendor: Vendor, newStatus: string) => {
    setActionLoading((prev) => ({ ...prev, [vendor.id]: true }));

    // Optimistic update
    setVendors((prev) =>
      prev.map((v) => v.id === vendor.id ? { ...v, approvalStatus: newStatus as Vendor["approvalStatus"] } : v)
    );

    try {
      await adminService.updateVendorStatus(vendor.id, newStatus);
      toast.success(
        <span>
          <strong>{vendor.storeName}</strong> has been <strong>{newStatus.toLowerCase()}</strong>.
        </span>
      );
    } catch (err: any) {
      // Rollback on failure
      setVendors((prev) =>
        prev.map((v) => v.id === vendor.id ? { ...v, approvalStatus: vendor.approvalStatus } : v)
      );
      const msg = err?.response?.data?.message ?? "Failed to update vendor status";
      toast.error(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [vendor.id]: false }));
    }
  };

  // ── Summary stats from loaded data ────────────────────────────────────────
  const pendingCount   = vendors.filter(v => v.approvalStatus === "PENDING").length;
  const approvedCount  = vendors.filter(v => ["APPROVED", "ACTIVE"].includes(v.approvalStatus)).length;
  const suspendedCount = vendors.filter(v => v.approvalStatus === "SUSPENDED").length;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Vendor Hub</h1>
            <p className="text-[#9CA3AF] font-medium italic mt-1">
              {total > 0 ? `Managing ${total} vendor${total !== 1 ? "s" : ""} across the platform.` : "Manage, approve, and audit platform vendors."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchVendors()}
            disabled={loading}
            className="rounded-2xl h-11 px-5 font-bold gap-2 self-start md:self-auto"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* ── Quick Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: total, icon: Store, color: "text-[#08D6A6]", bg: "bg-[#08D6A6]/10" },
            { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Active/Approved", value: approvedCount, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Suspended", value: suspendedCount, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111827] rounded-2xl p-6 border border-[#1F2937] shadow-sm flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
                <p className={cn("text-2xl font-black tracking-tight", loading ? "text-[#374151]" : "text-white")}>
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ─────────────────────────────────────────────────── */}
        <div className="bg-[#111827] rounded-3xl border border-[#1F2937] shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-8 py-6 border-b border-[#1F2937] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative group w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] group-focus-within:text-[#08D6A6] transition-colors" />
              <Input
                placeholder="Search by store name…"
                className="pl-11 rounded-2xl border-[#1F2937] h-11 font-medium bg-[#1F2937]/30 focus-visible:ring-[#08D6A6]/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all border",
                    statusFilter === opt.value
                      ? "bg-[#1F2937] text-white border-[#374151]"
                      : "bg-[#111827] text-[#9CA3AF] border-[#1F2937] hover:border-gray-300 hover:text-[#D1D5DB]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1F2937] uppercase text-[10px] font-black tracking-widest text-[#6B7280]">
                  <th className="px-8 py-5">Vendor</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Performance</th>
                  <th className="px-6 py-5">Products</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading skeletons */}
                {loading && Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}

                {/* Error state */}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-300" />
                      </div>
                      <h4 className="text-lg font-black text-white mb-1">Failed to load vendors</h4>
                      <p className="text-[#6B7280] font-medium text-sm mb-6">{error}</p>
                      <Button onClick={() => fetchVendors()} className="rounded-xl bg-[#1F2937] text-white">
                        Try Again
                      </Button>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!loading && !error && vendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[#374151]" />
                      </div>
                      <h4 className="text-xl font-black text-white mb-2">No Vendors Found</h4>
                      <p className="text-[#6B7280] font-medium">Try adjusting your search or filter.</p>
                    </td>
                  </tr>
                )}

                {/* Vendor rows */}
                {!loading && !error && vendors.map((vendor) => {
                  const cfg = STATUS_CONFIG[vendor.approvalStatus] ?? STATUS_CONFIG.PENDING;
                  const isActioning = actionLoading[vendor.id];

                  return (
                    <tr key={vendor.id} className="border-b border-[#1F2937] last:border-none hover:bg-[#1F2937]/40 transition-colors group">

                      {/* Vendor info */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center font-black text-[#08D6A6] text-lg uppercase flex-shrink-0 shadow-sm">
                            {vendor.storeName?.[0] ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-white text-sm flex items-center gap-2 flex-wrap">
                              {vendor.storeName}
                              <span className="text-[9px] font-bold bg-[#374151] text-[#6B7280] px-1.5 py-0.5 rounded-md uppercase tracking-tight">
                                {vendor.id.slice(0, 6)}
                              </span>
                            </p>
                            <p className="text-xs text-[#6B7280] font-medium truncate">
                              @{vendor.storeSlug} · {vendor.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-tight border",
                          cfg.bg, cfg.color
                        )}>
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-[#08D6A6]" />
                            <span className="text-sm font-black text-[#E5E7EB]">
                              ₹{Number(vendor.totalSales ?? 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-tight">
                            ★ {Number(vendor.rating ?? 0).toFixed(1)} rating
                          </p>
                        </div>
                      </td>

                      {/* Product count */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-[#D1D5DB]">
                          {vendor._count?.products ?? 0}
                        </span>
                        <p className="text-[10px] font-bold text-[#6B7280]">products</p>
                      </td>

                      {/* Action buttons */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">

                          {/* PENDING → Approve */}
                          {vendor.approvalStatus === "PENDING" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "APPROVED")}
                              className="bg-[#08D6A6] hover:bg-[#06b38a] text-white rounded-xl h-9 px-4 font-black text-xs shadow-md shadow-[#08D6A6]/20 transition-all disabled:opacity-60"
                            >
                              {isActioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Approve"}
                            </Button>
                          )}

                          {/* PENDING → Reject */}
                          {vendor.approvalStatus === "PENDING" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "REJECTED")}
                              variant="outline"
                              className="rounded-xl h-9 px-4 font-black text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-60"
                            >
                              Reject
                            </Button>
                          )}

                          {/* APPROVED → Activate */}
                          {vendor.approvalStatus === "APPROVED" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "ACTIVE")}
                              className="bg-[#08D6A6] hover:bg-[#06b38a] text-white rounded-xl h-9 px-4 font-black text-xs transition-all disabled:opacity-60"
                            >
                              {isActioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Activate"}
                            </Button>
                          )}

                          {/* APPROVED → Suspend */}
                          {vendor.approvalStatus === "APPROVED" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "SUSPENDED")}
                              variant="outline"
                              className="rounded-xl h-9 px-4 font-black text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-60"
                            >
                              Suspend
                            </Button>
                          )}

                          {/* ACTIVE → Suspend */}
                          {vendor.approvalStatus === "ACTIVE" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "SUSPENDED")}
                              variant="outline"
                              className="rounded-xl h-9 px-4 font-black text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-60"
                            >
                              {isActioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Suspend"}
                            </Button>
                          )}

                          {/* SUSPENDED → Re-Activate */}
                          {vendor.approvalStatus === "SUSPENDED" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "ACTIVE")}
                              className="bg-[#08D6A6] hover:bg-[#06b38a] text-white rounded-xl h-9 px-4 font-black text-xs disabled:opacity-60"
                            >
                              {isActioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Re-Activate"}
                            </Button>
                          )}

                          {/* REJECTED → Re-Review */}
                          {vendor.approvalStatus === "REJECTED" && (
                            <Button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(vendor, "PENDING")}
                              variant="outline"
                              className="rounded-xl h-9 px-4 font-black text-xs border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] transition-all disabled:opacity-60"
                            >
                              {isActioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Re-Review"}
                            </Button>
                          )}

                          {/* Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-xl w-9 h-9 p-0 hover:bg-[#111827] border-2 border-transparent hover:border-[#1F2937] transition-all flex items-center justify-center">
                              <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] bg-[#111827] border-[#1F2937] text-white rounded-2xl p-2 shadow-2xl">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] px-3 py-2">
                                Vendor Control
                              </DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl focus:bg-[#1F2937] focus:text-[#08D6A6] cursor-pointer">
                                <Link href={`/products?vendor=${vendor.storeSlug}`} target="_blank" className="flex items-center w-full">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Store Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl focus:bg-[#1F2937] focus:text-[#08D6A6] cursor-pointer" onClick={() => window.location.href = `mailto:${vendor.user.email}`}>
                                <div className="flex items-center w-full">
                                  <Mail className="w-4 h-4 mr-2" />
                                  Contact Vendor
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl focus:bg-[#1F2937] focus:text-[#08D6A6] cursor-pointer">
                                <Link href={`/dashboard/admin/audit-logs?search=${vendor.storeName}`} className="flex items-center w-full">
                                  <History className="w-4 h-4 mr-2" />
                                  Audit History
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#1F2937] my-1" />
                              <DropdownMenuItem 
                                className="rounded-xl focus:bg-[#1F2937] focus:text-white cursor-pointer"
                                onClick={() => {
                                  if (typeof window !== 'undefined') {
                                    navigator.clipboard.writeText(`${window.location.origin}/products?vendor=${vendor.storeSlug}`);
                                    toast.success("Store link copied to clipboard");
                                  }
                                }}
                              >
                                <div className="flex items-center w-full">
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Store Link
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator className="bg-[#1F2937] my-1 md:hidden" />
                              
                              <DropdownMenuItem 
                                className="rounded-xl focus:bg-red-500/10 focus:text-red-400 cursor-pointer md:hidden"
                                onClick={() => handleStatusChange(vendor, "SUSPENDED")}
                              >
                                <div className="flex items-center w-full">
                                  <ShieldAlert className="w-4 h-4 mr-2" />
                                  Suspend Store
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-8 py-5 border-t border-[#1F2937] flex items-center justify-between">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                Page {page} of {totalPages} · {total} vendors
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl w-9 h-9 p-0 border-[#1F2937]"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      className={cn(
                        "rounded-xl w-9 h-9 p-0 font-black text-xs border-[#1F2937] transition-all",
                        page === pageNum && "bg-[#1F2937] text-white border-[#374151]"
                      )}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  className="rounded-xl w-9 h-9 p-0 border-[#1F2937]"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
