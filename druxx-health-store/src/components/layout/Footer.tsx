import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Truck,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
    { label: "Partnerships", href: "/partnerships" },
  ],
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Best Sellers", href: "/products?tag=bestseller" },
    { label: "New Arrivals", href: "/products?tag=new" },
    { label: "Offers & Deals", href: "/products?tag=sale" },
    { label: "Brands", href: "/brands" },
  ],
  vendors: [
    { label: "Become a Vendor", href: "/vendor" },
    { label: "Vendor Login", href: "/vendor/login" },
    { label: "Vendor Dashboard", href: "/dashboard/vendor" },
    { label: "Seller Guidelines", href: "/vendor/guidelines" },
    { label: "Shipping Policy", href: "/vendor/shipping" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Track Order", href: "/dashboard/orders" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const TRUST_BADGES = [
  {
    icon: <Truck size={22} className="text-[#A6D608]" />,
    title: "Free Delivery",
    subtitle: "On orders above ₹499",
  },
  {
    icon: <Shield size={22} className="text-[#2CA7A0]" />,
    title: "100% Authentic",
    subtitle: "Verified vendor products",
  },
  {
    icon: <RefreshCw size={22} className="text-[#FF7A00]" />,
    title: "Easy Returns",
    subtitle: "30-day hassle-free returns",
  },
  {
    icon: <MessageCircle size={22} className="text-[#A6D608]" />,
    title: "24/7 Support",
    subtitle: "Expert health advisors",
  },
];

export function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white">
      {/* Trust badges bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{badge.title}</p>
                  <p className="text-xs text-gray-400">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/druxlogo.png"
                alt="Drux Health Store"
                width={180}
                height={120}
                className="h-[100px] w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed max-w-xs">
              Your trusted multi-vendor platform for premium health, wellness, and organic
              products. Curated from verified vendors across India.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <a
                href="tel:1800-DRUXX"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#A6D608] transition-colors"
              >
                <Phone size={14} />
                1800-DRUXX-HEALTH (Toll Free)
              </a>
              <a
                href="mailto:druxindia@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#A6D608] transition-colors"
              >
                <Mail size={14} />
                druxindia@gmail.com
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={14} />
                Pan-India delivery
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { href: "https://facebook.com", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { href: "https://instagram.com", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { href: "https://twitter.com", label: "X (Twitter)", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { href: "https://youtube.com", label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map(({ href, label, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#A6D608] hover:text-[#1E1E1E] flex items-center justify-center text-gray-400 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d={path}/></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(
              [
                { title: "Company", links: FOOTER_LINKS.company },
                { title: "Shop", links: FOOTER_LINKS.shop },
                { title: "Vendors", links: FOOTER_LINKS.vendors },
                { title: "Support", links: FOOTER_LINKS.support },
              ] as const
            ).map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-heading font-semibold text-sm text-white mb-3">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-[#A6D608] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <Separator className="bg-white/10" />
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Druxx Health Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300">
              Terms
            </Link>
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-300">
              Sitemap
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Secure payments:</span>
            <span className="font-mono font-semibold text-gray-300">VISA</span>
            <span className="font-mono font-semibold text-gray-300">MC</span>
            <span className="font-mono font-semibold text-gray-300">UPI</span>
            <span className="font-mono font-semibold text-gray-300">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
