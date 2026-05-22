import type { Metadata } from "next";
import { ShieldCheck, Users, Sparkles, Heart, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Druxx Health Store",
  description: "Learn about Druxx Health Store, our mission to curate premium health, organic wellness, and verified products across India.",
};

const VALUES = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-[#2CA7A0]" />,
    title: "100% Verified Sellers",
    desc: "Every single vendor on our platform undergoes a rigorous multi-stage credential audit to ensure authentic, certified formulations."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-[#A6D608]" />,
    title: "Purity & Integrity",
    desc: "We prioritize products free from harmful synthetic additives, strictly organic foods, and scientifically backed health supplements."
  },
  {
    icon: <Heart className="w-8 h-8 text-[#FF7A00]" />,
    title: "Customer-First Support",
    desc: "Our customer service is guided by certified health advisors to help find the exact product matching your wellness goals."
  },
  {
    icon: <Award className="w-8 h-8 text-[#2CA7A0]" />,
    title: "Fair Trade Ecosystem",
    desc: "We ensure transparent, direct payouts to vendors, supporting local wellness brands and organic farmers across India."
  }
];

const METRICS = [
  { value: "50K+", label: "Active Customers" },
  { value: "100+", label: "Verified Vendors" },
  { value: "5K+", label: "Wellness Products" },
  { value: "99.4%", label: "On-Time Deliveries" }
];

export default function AboutPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50/50">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-[#1E1E1E] text-white py-20 px-4 md:px-8">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(166,214,8,1) 1px, transparent 1px), linear-gradient(90deg, rgba(166,214,8,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-20 bg-lime-500 blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            Empowering Your <span className="text-[#A6D608]">Wellness</span> Journey
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Druxx Health Store is India's premium multi-vendor destination for vitamins, supplements, organic foods, and Ayurvedic products. We bridge the gap between verified local producers and health-conscious families.
          </p>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 grid grid-cols-2 md:grid-cols-4 p-8 gap-6 text-center">
          {METRICS.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-3xl md:text-4xl font-black text-gray-900">{metric.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Mission */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tight">
              Purity Checked. <br/>
              <span className="text-[#2CA7A0]">Quality Guaranteed.</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We started Druxx out of a simple frustration: the wellness market is saturated with artificial fillers, counterfeit supplements, and misleading labels. 
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our platform implements strict standards. We verify certificates of analysis, inspect organic registrations, and partner with local nutritionists to vet every product cataloged in our inventory.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-black transition-all"
              >
                Explore Catalog <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 aspect-video md:aspect-square bg-zinc-100 flex items-center justify-center">
            {/* Styled vector placeholder or background representation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2CA7A0]/20 to-[#A6D608]/20" />
            <div className="relative text-center p-8 space-y-4">
              <Users className="w-16 h-16 text-zinc-800 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Verified Seller Circle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-zinc-950 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Our Core <span className="text-[#A6D608]">Pillars</span>
            </h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest max-w-md mx-auto">
              How we build trust and safety into every single transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val) => (
              <div key={val.title} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="font-bold text-base text-white">{val.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="max-w-4xl mx-auto px-4 py-20 space-y-12">
        <h2 className="text-3xl font-black uppercase tracking-tight text-center text-gray-900">
          Our Journey so far
        </h2>
        
        <div className="relative border-l border-gray-150 pl-6 space-y-10 ml-4">
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#A6D608] border-4 border-white" />
            <h3 className="font-bold text-base text-gray-900">Late 2024 - Foundation</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Launched Druxx Health Store with 10 hand-picked local organic brands and a direct-to-vendor settlement platform.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#2CA7A0] border-4 border-white" />
            <h3 className="font-bold text-base text-gray-900">Mid 2025 - Vetting Panels</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Established our Internal Wellness Advisory panel, ensuring all vitamins and proteins undergo triple laboratory certifications.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#FF7A00] border-4 border-white" />
            <h3 className="font-bold text-base text-gray-900">Present - Nationwide Delivery</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Now partnering with 100+ premium vendors, reaching wellness seekers across 2,000+ pin codes in India.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
