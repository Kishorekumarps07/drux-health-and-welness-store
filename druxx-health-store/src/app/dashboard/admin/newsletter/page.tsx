"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import {
  Mail,
  Download,
  Search,
  Trash2,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.listNewsletterSubscribers({
        page,
        limit: 50,
        search: debouncedSearch || undefined,
      });
      setSubscribers(result.subscribers);
      setTotal(result.total);
      setPages(result.pages);
    } catch {
      toast.error("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} from the newsletter list?`)) return;
    setDeletingEmail(email);
    try {
      await adminService.deleteNewsletterSubscriber(email);
      toast.success(`${email} has been unsubscribed.`);
      fetchSubscribers();
    } catch {
      toast.error("Failed to remove subscriber.");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleExport = () => {
    const url = adminService.getNewsletterExportUrl();
    // Open CSV download — backend returns Content-Disposition: attachment
    window.open(url, "_blank");
    toast.success("CSV export started.");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            View, search, and export your mailing list.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-all text-sm font-bold border border-[#374151]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
            <Users size={22} className="text-[#10B981]" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{total.toLocaleString()}</p>
            <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">
              Total Subscribers
            </p>
          </div>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
            <Mail size={22} className="text-[#6366F1]" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{subscribers.length}</p>
            <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">
              Showing This Page
            </p>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-[#111827] rounded-2xl border border-[#1F2937] overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-[#1F2937]">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1F2937]">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                  Subscribed On
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1F2937]">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-[#1F2937] rounded animate-pulse w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-[#1F2937] rounded animate-pulse w-28" />
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <div className="h-8 bg-[#1F2937] rounded-lg animate-pulse w-16" />
                    </td>
                  </tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Mail size={36} className="text-[#374151]" />
                      <p className="text-[#6B7280] font-bold text-sm">
                        {debouncedSearch
                          ? `No subscribers match "${debouncedSearch}"`
                          : "No subscribers yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-[#10B981]">
                            {sub.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#9CA3AF]">
                        {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.email)}
                        disabled={deletingEmail === sub.email}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {deletingEmail === sub.email ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-[#1F2937] flex items-center justify-between">
            <span className="text-xs text-[#6B7280] font-bold">
              Page {page} of {pages} — {total.toLocaleString()} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
