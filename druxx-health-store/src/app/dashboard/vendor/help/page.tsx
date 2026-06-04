"use client";

import { 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Mail, 
  ChevronRight,
  Search,
  ArrowRight
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function VendorHelpPage() {
  const faqs = [
    {
      q: "How do I request a payout?",
      a: "Payouts are requested via the Financial Portal. Once your available balance exceeds ₹1,000, you can trigger a settlement to your verified bank account. Payments are usually processed within 48 business hours."
    },
    {
      q: "What are the platform commission fees?",
      a: "Druxx Health Store operates on a transparent flat-fee model. We charge a 12% commission on the total sale value (excluding shipping) for all categories except heavy equipment, which is at 8%."
    },
    {
      q: "Can I sell internationally?",
      a: "Currently, our logistic network is optimized for domestic shipping within India. International expansion is planned for Q4 2026. Stay tuned to our monthly vendor newsletter for updates."
    },
    {
      q: "How do I handle customer returns?",
      a: "Returns are handled via the Orders panel. If a customer requests a return for a valid reason (damaged/wrong item), you will be notified. You must approve or reject the request within 24 hours."
    }
  ];

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 italic">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Support <span className="text-[#A6D608]">Concierge</span></h1>
            <p className="text-gray-500 font-medium mt-1">Foundational knowledge and direct assistance for your store operations.</p>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
            <Input 
              placeholder="Search help articles..." 
              className="pl-12 rounded-2xl border-gray-100 h-12 w-full font-medium"
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                 <BookOpen size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2">Vendor Academy</h4>
              <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">Learn best practices for product photography and SEO optimization.</p>
              <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-transparent flex items-center gap-2">
                 Explore Guide <ArrowRight size={12} />
              </Button>
           </Card>

           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-[#A6D608]/10 rounded-xl flex items-center justify-center mb-6 text-[#A6D608] group-hover:scale-110 transition-transform">
                 <FileText size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2">Policy Hub</h4>
              <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">Review the latest merchant agreements and compliance standards.</p>
              <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-[#A6D608] hover:bg-transparent flex items-center gap-2">
                 Read Policies <ArrowRight size={12} />
              </Button>
           </Card>

           <Card className="rounded-[2rem] p-8 border-gray-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                 <MessageSquare size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2">Direct Support</h4>
              <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">Get technical help with your account or order management.</p>
              <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-transparent flex items-center gap-2">
                 Open Ticket <ArrowRight size={12} />
              </Button>
           </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* FAQ Section */}
           <Card className="rounded-[3rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white">
              <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Common Knowledge</h3>
              <Accordion type="single" collapsible className="w-full space-y-4">
                 {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-none bg-gray-50 rounded-2xl overflow-hidden px-6 transition-all data-[state=open]:bg-white data-[state=open]:shadow-sm data-[state=open]:ring-1 data-[state=open]:ring-gray-100">
                       <AccordionTrigger className="hover:no-underline py-5 text-sm font-black text-gray-800 text-left">
                          {faq.q}
                       </AccordionTrigger>
                       <AccordionContent className="text-xs font-bold text-gray-400 leading-relaxed pb-6">
                          {faq.a}
                       </AccordionContent>
                    </AccordionItem>
                 ))}
              </Accordion>
           </Card>

           {/* Contact Support */}
           <div className="space-y-8">
              <Card className="rounded-[3rem] p-10 bg-[#1E1E1E] text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 w-full">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                       <Mail className="w-7 h-7 text-[#A6D608]" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 italic">Priority Assistance</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">Can't find what you're looking for? Our executive support team is available 9 AM - 6 PM IST.</p>
                    
                    <div className="grid gap-4">
                       <div 
                           onClick={() => window.location.href = 'mailto:druxindia@gmail.com'}
                           className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group/link cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608]">@</div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Official Email</p>
                                <p className="text-sm font-bold text-white">druxindia@gmail.com</p>
                             </div>
                          </div>
                          <ChevronRight size={18} className="text-gray-600 transition-transform group-hover/link:translate-x-1" />
                       </div>
                    </div>
                 </div>
                 <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#A6D608]/5 rounded-full blur-3xl" />
              </Card>

              <Card className="rounded-[3rem] p-10 border-gray-100 shadow-xl shadow-black/5 bg-white border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <HelpCircle className="text-gray-300 w-8 h-8" />
                 </div>
                 <h4 className="text-lg font-black text-gray-900 mb-2 italic tracking-tight">Report a Technical Bug</h4>
                 <p className="text-xs text-gray-400 font-bold mb-6 italic leading-relaxed px-4">Encountering an error in the dashboard? File a tracker to help our engineers resolve it faster.</p>
                 <Button variant="ghost" className="rounded-xl font-black text-[#A6D608] hover:bg-[#A6D608]/5 h-10 px-6 uppercase text-[10px] tracking-widest">
                    Open Dev Console
                 </Button>
              </Card>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
