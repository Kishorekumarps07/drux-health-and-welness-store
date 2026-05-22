import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, HelpCircle, FileText, ShoppingBag, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Sitemap | Druxx Health Store",
  description: "Navigate all pages, categories, help guides, and merchant portals on Druxx Health Store.",
};

const SECTIONS = [
  {
    title: "Marketplace & Shop",
    icon: <ShoppingBag className="w-5 h-5 text-[#A6D608]" />,
    links: [
      { label: "Home Page", href: "/" },
      { label: "All Products", href: "/products" },
      { label: "Best Sellers", href: "/products?tag=bestseller" },
      { label: "New Arrivals", href: "/products?tag=new" },
      { label: "Offers & Deals", href: "/products?tag=sale" },
      { label: "Featured Brands", href: "/brands" },
      { label: "Shopping Cart", href: "/cart" }
    ]
  },
  {
    title: "Corporate & Press",
    icon: <Landmark className="w-5 h-5 text-[#2CA7A0]" />,
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers & Culture", href: "/careers" },
      { label: "Press Room", href: "/press" },
      { label: "Wellness Blog", href: "/blog" },
      { label: "Partnerships", href: "/partnerships" }
    ]
  },
  {
    title: "Support & Policies",
    icon: <HelpCircle className="w-5 h-5 text-orange-650" />,
    links: [
      { label: "Help Center & FAQs", href: "/help" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Track Your Order", href: "/dashboard/orders" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  },
  {
    title: "Merchant Portal",
    icon: <ShieldCheck className="w-5 h-5 text-[#2CA7A0]" />,
    links: [
      { label: "Become a Vendor", href: "/vendor/register" },
      { label: "Vendor Login", href: "/vendor/login" },
      { label: "Seller Guidelines", href: "/vendor/guidelines" },
      { label: "Shipping Policy", href: "/vendor/shipping" }
    ]
  }
];

export default function SitemapPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Navigation Index</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Visual <span className="text-[#A6D608]">Sitemap</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Find every route, policy list, shopping category, and merchant dashboard link compiled in one simple directory.
          </p>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SECTIONS.map((section, idx) => (
            <div 
              key={idx}
              className="bg-white border border-gray-150/50 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-200 space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="font-black text-lg text-gray-900 uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-lime-500/5 border border-gray-100 hover:border-lime-500/20 transition-all text-xs font-bold text-gray-650 hover:text-[#1E1E1E]"
                    >
                      <span>{link.label}</span>
                      <ArrowRight size={12} className="text-gray-300 group-hover:text-lime-600 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
