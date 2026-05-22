import type { Metadata } from "next";
import { RefreshCw, ShieldCheck, AlertCircle, Clock, Truck, CreditCard } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Druxx Health Store",
  description: "Review our 30-day return policy guidelines, refund timelines, pick-up logistics, and supplement hygiene safety standards.",
};

const PROCESS_STEPS = [
  {
    icon: <Clock className="w-5 h-5 text-orange-600" />,
    title: "1. Request Return",
    desc: "Log into your account, go to 'Track Order' or your order history page under '/dashboard/orders', and click 'Return Item' within 30 days."
  },
  {
    icon: <Truck className="w-5 h-5 text-lime-600" />,
    title: "2. Secure Pick-Up",
    desc: "Our verified shipping partner will schedule a pick-up from your delivery address within 24-48 hours at no additional fee."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    title: "3. Quality Vetting",
    desc: "Once received, our warehouse team inspects the packaging, seals, and batch codes to ensure hygiene safety standard compliance."
  },
  {
    icon: <CreditCard className="w-5 h-5 text-[#FF7A00]" />,
    title: "4. Fast Refund",
    desc: "Approved refunds are processed immediately. Funds settle into your source bank account or UPI wallet within 3 to 5 business days."
  }
];

export default function ReturnsPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Policies</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Returns & <span className="text-[#A6D608]">Refunds</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Our priority is your complete health and satisfaction. Read our simple guidelines for hassle-free returns and safety criteria.
          </p>
        </div>
      </section>

      {/* Steps Flow */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
            How The Return Process Works
          </h2>
          <p className="text-xs font-bold text-gray-450 uppercase tracking-widest">
            A step-by-step path to register your request and settle payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <div 
              key={i} 
              className="bg-white border border-gray-150/50 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="font-bold text-sm text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Details */}
      <section className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Conditions card */}
        <div className="bg-white border border-gray-100/80 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-3">
            Eligibility Standards
          </h3>
          
          <ul className="space-y-4 text-xs text-gray-650 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span>The product must be completely unopened, with original neck-seals, hologram seals, and box packaging intact.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span>For items arrived broken, leaking, or damaged on delivery, please report within 7 days with package photographs.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span>We do not charge any return logistics fee. Return pickup shipping is fully funded by Druxx.</span>
            </li>
          </ul>
        </div>

        {/* Non returnable items */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertCircle size={20} className="flex-shrink-0" />
            <h3 className="font-black text-lg uppercase tracking-tight">
              Non-Returnable Items
            </h3>
          </div>

          <p className="text-xs text-rose-950 leading-relaxed">
            Due to strict healthcare sanitization guidelines, we cannot accept returns for the following categories once delivered:
          </p>

          <ul className="space-y-3 text-xs text-rose-800 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-450 mt-0.5">•</span>
              <span>Supplement powders (Whey, Creatine, Plant Protein) with open outer wraps or jar seals.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-450 mt-0.5">•</span>
              <span>Personal care items (Herbal oils, hair cleansers, skin creams) with broken box safety stickers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-450 mt-0.5">•</span>
              <span>Wellness gear, clothing, or items bought under clearance promotions.</span>
            </li>
          </ul>
        </div>

      </section>

      {/* Back button link */}
      <div className="text-center pt-10">
        <Link 
          href="/dashboard/orders" 
          className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-black transition-all"
        >
          Go to Your Orders
        </Link>
      </div>

    </div>
  );
}
