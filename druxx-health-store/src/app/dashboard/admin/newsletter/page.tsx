"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import {
  Mail, Download, Search, Trash2, Users, RefreshCw,
  ChevronLeft, ChevronRight, Send, Eye, EyeOff,
  CheckCircle2, AlertCircle, Sparkles, Tag, Megaphone,
  Gift, ShoppingBag, Star, Zap, LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";

interface Subscriber { id: string; email: string; createdAt: string; }
type Tab = "subscribers" | "compose";

// ── Email Templates ────────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = [
  {
    id: "new-arrivals",
    label: "New Arrivals",
    icon: Sparkles,
    color: "#A6D608",
    subject: "🌿 New Arrivals Just Dropped — Shop Now!",
    body: `<h2 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#1E1E1E;">New Arrivals Are Here! 🌿</h2>
<p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.7;">We've just restocked our shelves with brand-new health &amp; wellness products. From supplements to personal care — something fresh awaits you.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr>
    <td style="background:#F9FAFB;border-radius:12px;padding:20px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">This Week's Highlights</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
        <li>Premium Whey Protein — now in stock</li>
        <li>Organic Ashwagandha Capsules</li>
        <li>Herbal Green Tea Collection</li>
      </ul>
    </td>
  </tr>
</table>

<a href="https://drux.in/products" style="display:inline-block;background:#A6D608;color:#1E1E1E;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;letter-spacing:0.5px;">Shop New Arrivals →</a>`,
  },
  {
    id: "flash-sale",
    label: "Flash Sale",
    icon: Zap,
    color: "#FF7A00",
    subject: "⚡ Flash Sale — Up to 40% OFF for 24 Hours Only!",
    body: `<div style="background:#FFF7ED;border:2px dashed #FF7A00;border-radius:14px;padding:20px;text-align:center;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#FF7A00;text-transform:uppercase;letter-spacing:2px;">Limited Time Offer</p>
  <p style="margin:0;font-size:40px;font-weight:900;color:#1E1E1E;">UP TO 40% OFF</p>
  <p style="margin:6px 0 0;font-size:13px;color:#6B7280;">Sale ends in 24 hours · No code needed</p>
</div>

<h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#1E1E1E;">Hurry — Stock is Limited! ⚡</h2>
<p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.7;">Our biggest flash sale of the month is live right now. Grab your favourite health products before they sell out.</p>

<table width="100%" cellpadding="12" cellspacing="8" style="margin-bottom:24px;">
  <tr>
    <td style="background:#FEF3C7;border-radius:10px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#92400E;">Supplements</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#FF7A00;">30% OFF</p>
    </td>
    <td style="background:#DCFCE7;border-radius:10px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#166534;">Personal Care</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#16A34A;">25% OFF</p>
    </td>
    <td style="background:#EDE9FE;border-radius:10px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#5B21B6;">Herbal Teas</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#7C3AED;">40% OFF</p>
    </td>
  </tr>
</table>

<a href="https://drux.in/products" style="display:inline-block;background:#FF7A00;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">Shop the Flash Sale →</a>`,
  },
  {
    id: "coupon",
    label: "Coupon Code",
    icon: Tag,
    color: "#6366F1",
    subject: "🎁 Exclusive Coupon Inside — Just for You!",
    body: `<h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#1E1E1E;">A Special Gift from Drux 🎁</h2>
<p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">As a valued subscriber, we're giving you an exclusive discount on your next order. Use the code below at checkout:</p>

<div style="text-align:center;margin-bottom:28px;">
  <div style="display:inline-block;background:#F5F3FF;border:2px dashed #6366F1;border-radius:14px;padding:20px 48px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:2px;">Your Exclusive Code</p>
    <p style="margin:0;font-size:32px;font-weight:900;color:#1E1E1E;letter-spacing:4px;font-family:monospace;">DRUX20</p>
    <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">20% OFF · Valid for 7 days · Min. order ₹499</p>
  </div>
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td style="background:#F9FAFB;border-radius:12px;padding:18px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Terms &amp; Conditions</p>
      <ul style="margin:0;padding-left:20px;color:#6B7280;font-size:13px;line-height:2;">
        <li>Valid on all products storewide</li>
        <li>Cannot be combined with other offers</li>
        <li>One use per customer</li>
        <li>Expires in 7 days from receipt</li>
      </ul>
    </td>
  </tr>
</table>

<a href="https://drux.in/products" style="display:inline-block;background:#6366F1;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">Redeem Discount →</a>`,
  },
  {
    id: "announcement",
    label: "Announcement",
    icon: Megaphone,
    color: "#0EA5E9",
    subject: "📢 Important Update from Drux Health Store",
    body: `<h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#1E1E1E;">Big News from Drux! 📢</h2>
<p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.7;">We have an exciting announcement to share with our community. We're constantly working to bring you the best health and wellness experience.</p>

<div style="background:#EFF6FF;border-left:4px solid #0EA5E9;border-radius:0 12px 12px 0;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0369A1;">What's New</p>
  <p style="margin:0;font-size:14px;color:#1E40AF;line-height:1.7;">
    [Write your announcement here — new category, new feature, policy update, store hours, etc.]
  </p>
</div>

<p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">Thank you for being part of the Drux Health family. We appreciate your continued support and trust in our products.</p>

<a href="https://drux.in" style="display:inline-block;background:#0EA5E9;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">Learn More →</a>`,
  },
  {
    id: "loyalty",
    label: "Loyalty Reward",
    icon: Star,
    color: "#F59E0B",
    subject: "⭐ You've Earned a Special Reward — Check it Out!",
    body: `<div style="text-align:center;margin-bottom:24px;">
  <div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;background:#FEF3C7;border-radius:50%;font-size:32px;margin-bottom:12px;">⭐</div>
  <h2 style="margin:0;font-size:24px;font-weight:900;color:#1E1E1E;">You're a Drux VIP!</h2>
  <p style="margin:8px 0 0;font-size:14px;color:#6B7280;">Thank you for being one of our most loyal customers.</p>
</div>

<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center;">
  <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;">Your VIP Reward</p>
  <p style="margin:0;font-size:28px;font-weight:900;color:#1E1E1E;">FREE SHIPPING</p>
  <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">On your next 3 orders · No minimum spend</p>
  <div style="margin-top:14px;display:inline-block;background:#F59E0B;color:#fff;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:2px;">VIPSHIP</div>
</div>

<p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">Your loyalty means everything to us. We hope this small token of appreciation makes your next shopping experience even better.</p>

<a href="https://drux.in/products" style="display:inline-block;background:#F59E0B;color:#1E1E1E;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">Claim Your Reward →</a>`,
  },
  {
    id: "seasonal",
    label: "Seasonal Offer",
    icon: Gift,
    color: "#EC4899",
    subject: "🎉 Season's Special — Exclusive Deals Inside!",
    body: `<div style="text-align:center;background:linear-gradient(135deg,#FDF2F8,#F5F3FF);border-radius:14px;padding:32px;margin-bottom:24px;">
  <p style="margin:0 0 8px;font-size:32px;">🎉</p>
  <h2 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1E1E1E;">Seasonal Health Sale</h2>
  <p style="margin:0;font-size:14px;color:#6B7280;">Hand-picked deals for this season's wellness needs</p>
</div>

<p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.7;">This season, invest in your health with our specially curated product bundles and seasonal bestsellers — at prices you'll love.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr>
    <td style="padding-bottom:12px;">
      <div style="background:#FDF2F8;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">💊</span>
        <div>
          <p style="margin:0;font-size:13px;font-weight:700;color:#1E1E1E;">Immunity Booster Bundle</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9CA3AF;">Vitamin C + Zinc + Elderberry</p>
        </div>
        <span style="margin-left:auto;font-size:14px;font-weight:900;color:#EC4899;">₹899</span>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:12px;">
      <div style="background:#F5F3FF;border-radius:12px;padding:16px;">
        <span style="font-size:24px;">🌿</span>
        <div style="display:inline-block;vertical-align:middle;margin-left:12px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#1E1E1E;">Herbal Detox Pack</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9CA3AF;">Green Tea + Triphala + Moringa</p>
        </div>
        <span style="float:right;font-size:14px;font-weight:900;color:#7C3AED;">₹649</span>
      </div>
    </td>
  </tr>
</table>

<a href="https://drux.in/products" style="display:inline-block;background:#EC4899;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">View All Seasonal Deals →</a>`,
  },
  {
    id: "restock",
    label: "Back in Stock",
    icon: ShoppingBag,
    color: "#10B981",
    subject: "🔔 Back in Stock — Don't Miss Out Again!",
    body: `<h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#1E1E1E;">They're Back! 🔔</h2>
<p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.7;">The products you've been waiting for are back in stock — but not for long. These sell out fast, so grab yours now.</p>

<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">Back in Stock Now</p>
  
  <div style="border-bottom:1px solid #D1FAE5;padding-bottom:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <p style="margin:0;font-size:14px;font-weight:700;color:#1E1E1E;">Whey Protein Isolate (1kg)</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">Chocolate / Vanilla / Unflavoured</p>
    </div>
    <a href="https://drux.in/products" style="background:#10B981;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
  </div>
  
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <p style="margin:0;font-size:14px;font-weight:700;color:#1E1E1E;">Omega-3 Fish Oil Capsules</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">90 Softgels · EPA &amp; DHA</p>
    </div>
    <a href="https://drux.in/products" style="background:#10B981;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
  </div>
</div>

<p style="margin:0 0 20px;font-size:13px;color:#6B7280;">⚠️ Limited quantities available. Order now to avoid disappointment.</p>

<a href="https://drux.in/products" style="display:inline-block;background:#10B981;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;">Shop Restocked Items →</a>`,
  },
];

export default function NewsletterAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");

  // ── Subscriber list state ─────────────────────────────────────
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // ── Compose state ─────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.listNewsletterSubscribers({ page, limit: 50, search: debouncedSearch || undefined });
      setSubscribers(result.subscribers);
      setTotal(result.total);
      setPages(result.pages);
    } catch { toast.error("Failed to load subscribers."); }
    finally { setLoading(false); }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} from the newsletter list?`)) return;
    setDeletingEmail(email);
    try {
      await adminService.deleteNewsletterSubscriber(email);
      toast.success(`${email} unsubscribed.`);
      fetchSubscribers();
    } catch { toast.error("Failed to remove subscriber."); }
    finally { setDeletingEmail(null); }
  };

  const handleExport = () => { window.open(adminService.getNewsletterExportUrl(), "_blank"); toast.success("CSV export started."); };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error("Please enter a subject line."); return; }
    if (!body.trim()) { toast.error("Please write the email body."); return; }
    if (total === 0) { toast.error("No subscribers to send to."); return; }
    if (!confirm(`Send this newsletter to all ${total.toLocaleString()} subscribers?`)) return;
    setSending(true); setSendResult(null);
    try {
      const result = await adminService.sendNewsletterBlast(subject, body);
      setSendResult(result);
      toast.success(`Newsletter sent! ${result.sent} delivered, ${result.failed} failed.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send newsletter.");
    } finally { setSending(false); }
  };

  const applyTemplate = (t: typeof EMAIL_TEMPLATES[0]) => {
    setSubject(t.subject);
    setBody(t.body);
    setActiveTemplate(t.id);
    setSendResult(null);
    toast.success(`"${t.label}" template loaded!`);
  };

  const previewHtml = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #dddddd;">
      <div style="background-color:#A6D608;height:4px;font-size:1px;line-height:1px;">&nbsp;</div>
      <div style="padding:20px 32px;border-bottom:1px solid #eeeeee;background-color:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="vertical-align:middle;">
              <img src="https://drux.in/druxlogo.png" alt="Drux Health Store" style="height:35px;width:auto;display:block;border:0;" />
            </td>
            <td align="right" style="vertical-align:middle;color:#666666;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
              Newsletter
            </td>
          </tr>
        </table>
      </div>
      <div style="padding:32px 32px 24px;background-color:#ffffff;color:#111111;font-size:14px;line-height:1.5;">${body || '<p style="color:#9CA3AF;">Your content will appear here…</p>'}</div>
      <div style="background:#F9FAFB;padding:24px 32px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.5;">
          You're receiving this because you subscribed to Drux Health Store newsletters.<br/>
          <a href="https://drux.in" style="color:#A6D608;text-decoration:none;font-weight:bold;margin-top:6px;display:inline-block;">Visit our store</a>
        </p>
      </div>
    </div>`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Newsletter</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Manage subscribers and send email blasts to your mailing list.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSubscribers} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-all text-sm font-bold border border-[#374151]">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white font-bold text-sm border border-[#374151] transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center"><Users size={22} className="text-[#10B981]" /></div>
          <div><p className="text-3xl font-black text-white">{total.toLocaleString()}</p><p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">Total Subscribers</p></div>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center"><Mail size={22} className="text-[#6366F1]" /></div>
          <div><p className="text-3xl font-black text-white">{subscribers.length}</p><p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-0.5">Showing This Page</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1F2937] rounded-2xl p-1.5">
        {([{ id: "subscribers" as Tab, label: "Subscribers", icon: Users }, { id: "compose" as Tab, label: "Compose & Send", icon: Send }]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20" : "text-[#9CA3AF] hover:text-white"}`}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Subscribers Tab ── */}
      {activeTab === "subscribers" && (
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] overflow-hidden">
          <div className="p-5 border-b border-[#1F2937]">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input type="text" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all" />
            </div>
          </div>
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
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1F2937]">
                    <td className="px-6 py-4"><div className="h-4 bg-[#1F2937] rounded animate-pulse w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1F2937] rounded animate-pulse w-28" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-[#1F2937] rounded-lg animate-pulse w-16 ml-auto" /></td>
                  </tr>
                )) : subscribers.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Mail size={36} className="text-[#374151]" />
                      <p className="text-[#6B7280] font-bold text-sm">{debouncedSearch ? `No subscribers match "${debouncedSearch}"` : "No subscribers yet."}</p>
                    </div>
                  </td></tr>
                ) : subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-[#10B981]">{sub.email[0].toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-[#9CA3AF]">{new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(sub.email)} disabled={deletingEmail === sub.email}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all disabled:opacity-50">
                        <Trash2 size={12} />{deletingEmail === sub.email ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="px-6 py-4 border-t border-[#1F2937] flex items-center justify-between">
              <span className="text-xs text-[#6B7280] font-bold">Page {page} of {pages} — {total.toLocaleString()} total</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white disabled:opacity-40 transition-all"><ChevronLeft size={15} /></button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1F2937] text-[#9CA3AF] hover:text-white disabled:opacity-40 transition-all"><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Compose & Send Tab ── */}
      {activeTab === "compose" && (
        <div className="space-y-6">

          {/* Template Picker */}
          <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutTemplate size={16} className="text-[#9CA3AF]" />
              <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">Quick Templates</p>
              <span className="ml-auto text-[10px] text-[#6B7280] font-bold">Click any template to auto-fill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {EMAIL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center group ${
                    activeTemplate === tpl.id
                      ? "border-current bg-current/10"
                      : "border-[#1F2937] hover:border-[#374151] bg-[#0B0F14] hover:bg-[#1F2937]"
                  }`}
                  style={activeTemplate === tpl.id ? { borderColor: tpl.color, color: tpl.color } : { color: tpl.color }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tpl.color}15` }}
                  >
                    <tpl.icon size={18} style={{ color: tpl.color }} />
                  </div>
                  <span className="text-[11px] font-bold text-white leading-tight">{tpl.label}</span>
                  {activeTemplate === tpl.id && (
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: tpl.color }}>Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Composer + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Subject Line <span className="text-[#EF4444]">*</span></label>
                <input type="text" placeholder="e.g. New Arrivals This Week 🌿" value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all font-medium" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">Email Body (HTML) <span className="text-[#EF4444]">*</span></label>
                  {body && <button onClick={() => { setBody(""); setSubject(""); setActiveTemplate(null); }} className="text-[10px] text-[#EF4444] font-bold hover:opacity-80">Clear</button>}
                </div>
                <textarea rows={18} placeholder="Write your email content here, or pick a template above..."
                  value={body} onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#10B981]/50 transition-all font-mono resize-none" />
                <p className="text-[11px] text-[#6B7280] mt-2">
                  Plain text or HTML both work. The branded Drux header &amp; footer are automatically wrapped around your content.
                </p>
              </div>

              {sendResult && (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${sendResult.failed === 0 ? "bg-[#10B981]/10 border border-[#10B981]/20" : "bg-[#F59E0B]/10 border border-[#F59E0B]/20"}`}>
                  {sendResult.failed === 0 ? <CheckCircle2 size={18} className="text-[#10B981] shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-bold text-white">Blast Complete</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">✅ {sendResult.sent} delivered · ❌ {sendResult.failed} failed · 📬 {sendResult.total} total</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white font-bold text-sm border border-[#374151] transition-all">
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>
                <button onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-lg shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <Send size={14} className={sending ? "animate-pulse" : ""} />
                  {sending ? `Sending to ${total.toLocaleString()} subscribers…` : `Send to ${total.toLocaleString()} Subscribers`}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                {showPreview ? "Email Preview" : "Preview hidden — click Preview to show"}
              </p>
              {showPreview ? (
                <div className="bg-white rounded-2xl overflow-hidden border border-[#1F2937] shadow-xl">
                  <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" /></div>
                    <span className="text-xs text-gray-500 font-medium ml-2 truncate">📧 {subject || "Your email subject…"}</span>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-12 flex flex-col items-center gap-4 text-center">
                  <Eye size={36} className="text-[#374151]" />
                  <p className="text-sm text-[#6B7280] font-bold">Click "Preview" to see how your email will look to subscribers.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
