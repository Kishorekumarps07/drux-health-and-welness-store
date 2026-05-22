"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Mail, Phone, Clock, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const FAQS = [
  {
    q: "How does the multi-vendor system work?",
    a: "Druxx Health Store is a unified marketplace. You can add products from different verified vendors to a single cart and checkout. We dispatch items from their respective warehouse locations, so your order may arrive in multiple secure packages.",
    cat: "General"
  },
  {
    q: "How do I track my delivery status?",
    a: "Once dispatched, you will receive an SMS and email with tracking details. You can also view live delivery progress by logging in and navigating to your dashboard under 'Track Order' or directly visiting '/dashboard/orders'.",
    cat: "Delivery"
  },
  {
    q: "What is your return window for supplements?",
    a: "We offer a 30-day hassle-free return policy for unopened items. Due to health and safety regulations, opened supplements, vitamins, or food products cannot be returned unless they arrived damaged or defective.",
    cat: "Returns"
  },
  {
    q: "Are the payment systems secure?",
    a: "Yes. All online transactions are encrypted via 256-bit SSL protocols. We use Tier-1 payment aggregators (supporting UPI, Credit Cards, NetBanking) and offer Cash on Delivery (COD) for supported pin codes.",
    cat: "Payments"
  },
  {
    q: "How can I apply to sell my wellness brand on Druxx?",
    a: "Click on 'Become a Vendor' in the footer, which will redirect you to our registration page. Complete the merchant questionnaire and upload your business registrations/FSSAI certificates for verification.",
    cat: "Vendor"
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIndex = (idx: number) => {
    if (openIndexes.includes(idx)) {
      setOpenIndexes(openIndexes.filter(i => i !== idx));
    } else {
      setOpenIndexes([...openIndexes, idx]);
    }
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !msg) {
      toast.error("Please complete all inquiry fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Support ticket registered successfully. We will reply via email within 3 hours.");
      setName("");
      setEmail("");
      setSubject("");
      setMsg("");
    }, 1500);
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Support Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            How Can We <span className="text-[#A6D608]">Help?</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Search our frequently asked questions, toggle answers, or register a direct support ticket below.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: FAQ Search & Accordion */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search FAQs (e.g. tracking, refund, vendor)..."
                className="pl-11 h-12 rounded-xl border-gray-100 bg-white shadow-sm font-semibold text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => {
                const isOpen = openIndexes.includes(i);
                return (
                  <div 
                    key={i} 
                    className="bg-white border border-gray-150/50 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleIndex(i)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="font-black text-sm text-gray-900 tracking-tight">{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-[#2CA7A0]" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-6 pt-0 border-t border-gray-50 bg-gray-50/10">
                        <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-gray-150/50 rounded-2xl">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No matching questions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Support Contacts & Form */}
        <div className="space-y-8">
          {/* Quick Help Card */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] rounded-full opacity-20 bg-lime-500 blur-2xl pointer-events-none" />
            <h3 className="font-black text-lg text-white uppercase tracking-tight border-b border-white/5 pb-3">
              Direct Channels
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                <Phone size={16} className="text-[#A6D608]" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Toll-Free Support</p>
                  <span>1800-DRUXX-HEALTH</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                <Mail size={16} className="text-[#2CA7A0]" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Help Email</p>
                  <a href="mailto:support@druxx.health" className="hover:text-white transition-colors">
                    support@druxx.health
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                <Clock size={16} className="text-orange-500" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Service Hours</p>
                  <span>24 / 7 Live Chat Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket form */}
          <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-3">
              Submit Ticket
            </h3>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Your Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Vikram Singh"
                  className="h-10 rounded-lg border-gray-100 bg-gray-50/50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="h-10 rounded-lg border-gray-100 bg-gray-50/50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Subject</label>
                <Input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Order tracking query"
                  className="h-10 rounded-lg border-gray-100 bg-gray-50/50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Detailed Message</label>
                <textarea
                  required
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Type your message or order ID..."
                  rows={3}
                  className="w-full text-xs font-semibold border border-gray-100 bg-gray-50/50 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-lg bg-zinc-950 text-white text-xs font-black uppercase tracking-widest hover:bg-black"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Submit Ticket"}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
