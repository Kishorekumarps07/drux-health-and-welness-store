import type { Metadata } from "next";
import { Truck, ShieldCheck, Box, RefreshCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Merchant Shipping Policy | Druxx Merchant Portal",
  description: "Learn about Druxx vendor packaging specifications, dispatch SLA times, courier partners, and returns logistics protocols.",
};

const PROTOCOLS = [
  {
    icon: <Box className="w-5 h-5 text-orange-600" />,
    title: "1. Spill-Proof Packing",
    desc: "Use secure bubble-wrap sleeves, anti-spill plastic tape for bottle necks, and double-walled carton boxes for fragile liquid items."
  },
  {
    icon: <Truck className="w-5 h-5 text-lime-600" />,
    title: "2. Fast Dispatch SLA",
    desc: "Pack and transition order status to 'Ready to Ship' within 24 hours of notification. Courier pickup must occur within 48 hours."
  },
  {
    icon: <RefreshCcw className="w-5 h-5 text-teal-600" />,
    title: "3. Returns Logistics",
    desc: "Customer return pick-ups are routed back to your designated return warehouse automatically using Druxx integrated APIs."
  }
];

export default function VendorShippingPage() {
  return (
    <div className="font-sans min-h-screen bg-[#FAFBF8] pt-24 md:pt-32 pb-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-700">Fulfillment & Operations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">
            Shipping <span className="text-lime-600">Policy</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            Ensure smooth, damaged-free delivery. Review dispatch SLAs, packaging standards, and integrated courier rules for Druxx sellers.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {PROTOCOLS.map((proto, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              {proto.icon}
            </div>
            <h3 className="font-black text-sm text-gray-900 tracking-tight">{proto.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{proto.desc}</p>
          </div>
        ))}
      </section>

      {/* Details Card */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10 text-gray-700 text-sm leading-relaxed">
          
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              1. Packaging & Branding Guidelines
            </h2>
            <p>
              Product safety during transit is paramount. Sellers are expected to package items to avoid leakage or deformation:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-650">
              <li><strong>Protective Wrap:</strong> All liquid containers (honey, juices, oils) must be sealed using shrink-sleeves and wrapped in bubble-sheets at least 15mm thick.</li>
              <li><strong>Outer Box:</strong> Use high-density, corrugating corrugated cardboard box packs. Secure the opening flaps with heavy-duty packaging tapes.</li>
              <li><strong>Branding:</strong> You may include your brand flyers or cards inside the package. However, outside branding must align with standard carrier dimensions.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              2. Logistics Aggregations & Carriers
            </h2>
            <p>
              Druxx integrates directly with major shipping providers (Delhivery, Blue Dart, Xpressbees, and Shiprocket) to automate courier allocation. 
            </p>
            <p>
              Once you mark a package as 'Ready for Dispatch', the assigned carrier will arrive for pick-up. You must print and affix the shipping label generated in your dashboard onto the outer box package.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              3. Dispatch SLA & Penalties
            </h2>
            <p>
              We guarantee fast shipping to our clients. Our merchant SLA rules dictate:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-650">
              <li><strong>&lt; 24 Hours:</strong> Label generation and packing must occur.</li>
              <li><strong>Strike System:</strong> Orders taking over 72 hours to ship will face automatic cancellation, with a penalty charge applied to your upcoming payout cycle.</li>
              <li><strong>Damaged Shipments:</strong> If a package is returned due to poor merchant packaging, the replacement cost is borne entirely by the seller.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Need assistance with printing labels?
            </div>
            <Link 
              href="/vendor/login" 
              className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-black transition-all"
            >
              Access Merchant Panel <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
