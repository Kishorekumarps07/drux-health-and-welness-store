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
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

type Tab = "subscribers" | "compose";

export default function NewsletterAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");

  // ── Subscriber list state ──────────────────────────────────────
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // ── Compose state ──────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  // Debounce search
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
    window.open(adminService.getNewsletterExportUrl(), "_blank");
    toast.success("CSV export started.");
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error("Please enter a subject line."); return; }
    if (!body.trim())    { toast.error("Please write the email body."); return; }
    if (total === 0)     { toast.error("No subscribers to send to."); return; }

    if (!confirm(`Send this newsletter to all ${total.toLocaleString()} subscribers?`)) return;

    setSending(true);
    setSendResult(null);
    try {
      const result = await adminService.sendNewsletterBlast(subject, body);
      setSendResult(result);
      toast.success(`Newsletter sent! ${result.sent} delivered, ${result.failed} failed.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send newsletter.");
    } finally {
      setSending(false);
    }
  };

  // Preview HTML: wrap body in branded shell
  const previewHtml = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1E1E1E;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#A6D608;">DRUX HEALTH STORE</p>
        <p style="margin:4px 0 0;font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:2px;">Health &amp; Wellness</p>
      </div>
      <div style="padding:32px;">${body || '<p style="color:#9CA3AF;">Your content will appear here…</p>'}</div>
      <div style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">You're receiving this because you subscribed to Drux Health Store newsletters.</p>
      </div>
    </div>
  `;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Newsletter</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage subscribers and send email blasts to your mailing list.
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white font-bold text-sm border border-[#374151] transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
            <Users size={22} className="text-[#10B981]" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{total.toLocaleString()}</p>
            <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">Total Subscribers</p>
          </div>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
            <Mail size={22} className="text-[#6366F1]" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{subscribers.length}</p>
            <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">Showing This Page</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1F2937] rounded-2xl p-1.5">
        {[
          { id: "subscribers" as Tab, label: "Subscribers", icon: Users },
          { id: "compose" as Tab, label: "Compose & Send", icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20"
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Subscribers Tab ── */}
      {activeTab === "subscribers" && (
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] overflow-hidden">
          {/* Search */}
          <div className="p-5 border-b border-[#1F2937]">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
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
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Subscribed On</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#1F2937]">
                      <td className="px-6 py-4"><div className="h-4 bg-[#1F2937] rounded animate-pulse w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[#1F2937] rounded animate-pulse w-28" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-[#1F2937] rounded-lg animate-pulse w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Mail size={36} className="text-[#374151]" />
                        <p className="text-[#6B7280] font-bold text-sm">
                          {debouncedSearch ? `No subscribers match "${debouncedSearch}"` : "No subscribers yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-[#10B981]">{sub.email[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#9CA3AF]">
                          {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
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
              <span className="text-xs text-[#6B7280] font-bold">Page {page} of {pages} — {total.toLocaleString()} total</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white disabled:opacity-40 transition-all">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white disabled:opacity-40 transition-all">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Compose & Send Tab ── */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Composer */}
          <div className="space-y-5">
            <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">
                  Subject Line <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Arrivals This Week 🌿"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">
                  Email Body (HTML supported) <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  rows={16}
                  placeholder={`<h2 style="color:#1E1E1E;">Hello from Drux! 👋</h2>\n<p>We have exciting news for you...</p>\n<a href="https://drux.in/products" style="background:#A6D608;color:#1E1E1E;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Shop Now</a>`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all font-mono resize-none"
                />
                <p className="text-[11px] text-[#6B7280] mt-2">
                  Tip: You can write plain text or use HTML tags for rich formatting. The branded Drux header &amp; footer are automatically added.
                </p>
              </div>

              {/* Send Result */}
              {sendResult && (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${sendResult.failed === 0 ? "bg-[#10B981]/10 border border-[#10B981]/20" : "bg-[#F59E0B]/10 border border-[#F59E0B]/20"}`}>
                  {sendResult.failed === 0
                    ? <CheckCircle2 size={18} className="text-[#10B981] shrink-0 mt-0.5" />
                    : <AlertCircle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-sm font-bold text-white">Blast Complete</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      ✅ {sendResult.sent} delivered &nbsp;·&nbsp; ❌ {sendResult.failed} failed &nbsp;·&nbsp; 📬 {sendResult.total} total
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white font-bold text-sm border border-[#374151] transition-all"
                >
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>

                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !body.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-lg shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={14} className={sending ? "animate-pulse" : ""} />
                  {sending ? `Sending to ${total.toLocaleString()} subscribers…` : `Send to ${total.toLocaleString()} Subscribers`}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
              {showPreview ? "Email Preview" : "Preview hidden — click Preview to show"}
            </p>
            {showPreview && (
              <div className="bg-white rounded-2xl overflow-hidden border border-[#1F2937] shadow-xl">
                <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium ml-2 truncate">
                    📧 {subject || "Your email subject…"}
                  </span>
                </div>
                <div
                  className="p-4 max-h-[600px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
            {!showPreview && (
              <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-12 flex flex-col items-center gap-4 text-center">
                <Eye size={36} className="text-[#374151]" />
                <p className="text-sm text-[#6B7280] font-bold">Click "Preview" to see how your email will look to subscribers.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
