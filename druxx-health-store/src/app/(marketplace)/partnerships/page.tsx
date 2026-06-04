"use client";

import { useState } from "react";
import { Handshake, Award, ShieldCheck, Mail, Phone, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PROGRAMS = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#2CA7A0]" />,
    title: "Institutional & Corporate Wellness",
    desc: "Offer custom wellness boxes, discounted supplement programs, and certified nutritionist consultations for your company's workforce."
  },
  {
    icon: <Award className="w-6 h-6 text-[#A6D608]" />,
    title: "Affiliate & Expert Network",
    desc: "Are you a gym instructor, nutritionist, or yoga coach? Recommend verified Druxx products to your client list and earn premium commissions."
  },
  {
    icon: <Handshake className="w-6 h-6 text-[#FF7A00]" />,
    title: "Co-Branding & Distribution",
    desc: "Incorporate your high-quality vitamins or fitness gear directly into the official Druxx catalogue and ship using our express logistics API."
  }
];

export default function PartnershipsPage() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState("Institutional");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Partnership proposal sent! Our corporate relations manager will contact you within 24 hours.");
      // Reset
      setCompany("");
      setName("");
      setEmail("");
      setProgram("Institutional");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Collaborate</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Partner With <span className="text-[#A6D608]">Druxx</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Expand your corporate healthcare benefits, distribute premium formulations, or earn payouts as a verified health affiliate.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Programs list */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tight leading-none mb-3">
              Partnership <span className="text-[#2CA7A0]">Channels</span>
            </h2>
            <p className="text-sm text-gray-500">
              We design specific pathways to deliver mutual growth and ensure premium wellness.
            </p>
          </div>

          <div className="space-y-6">
            {PROGRAMS.map((prog, i) => (
              <div 
                key={i}
                className="bg-white border border-gray-150/50 rounded-3xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {prog.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-gray-900">{prog.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Support */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#A6D608]">Direct Inquiries</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If your proposal falls outside these channels, write or call our partnerships team directly.
            </p>
            <div className="space-y-2 text-xs font-semibold text-zinc-300">
              <a href="mailto:druxindia@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} className="text-zinc-500" /> druxindia@gmail.com
              </a>
              <a href="tel:080-DRUXX-PART" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} className="text-zinc-500" /> +91 80 4422 9900 (Mon - Fri)
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Lead Form */}
        <div className="bg-white border border-gray-100/80 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-gray-200/20">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Inquire Now
            </h3>
            <p className="text-xs text-gray-400">
              Share details about your business and goals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                Company / Organization Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Apex Fitness Ltd."
                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Contact Person <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Karan Johar"
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="karan@apexfit.in"
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                Program Category
              </label>
              <select
                value={program}
                onChange={e => setProgram(e.target.value)}
                className="w-full text-sm font-semibold border border-gray-100 bg-gray-50/50 rounded-xl px-3 h-12 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
              >
                <option value="Institutional">Institutional & Corporate Wellness</option>
                <option value="Affiliate">Affiliate & Expert Network</option>
                <option value="Co-Branding">Co-Branding & Distribution</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                Proposal Summary <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Briefly describe your proposal or wellness program requirements..."
                rows={4}
                className="w-full text-sm font-semibold border border-gray-100 bg-gray-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-zinc-950 text-white text-xs font-black uppercase tracking-widest hover:bg-black gap-1.5"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : (
                <>Send Inquiry <ArrowRight size={14} /></>
              )}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
