import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { VendorHighlights } from "@/components/home/VendorHighlights";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AdvantageCarousel } from "@/components/home/AdvantageCarousel";
import { OfferZone } from "@/components/home/OfferZone";
import { productService } from "@/services/productService";
import { HomeAnimations } from "@/components/home/HomeAnimations";
import api from "@/lib/api";

export default async function HomePage() {
  // Fetch all home data in parallel on the server
  const [fRes, bRes, nRes, heroRes, advRes, vRes] = await Promise.all([
    productService.getFeatured(),
    productService.getBestSellers(),
    productService.getNewArrivals(),
    api.get('/cms/hero').catch(() => ({ data: { data: [] } })),
    api.get('/cms/advantages').catch(() => ({ data: { data: [] } })),
    api.get('/vendors', { params: { limit: 3, orderBy: 'latest' } }).catch(() => ({ data: { vendors: [] } }))
  ]);

  const heroSlides = heroRes.data?.data || [];
  const advantages = (advRes.data?.data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    desc: a.description,
    image: a.image,
    iconType: a.icon_type
  }));

  const vendors = (vRes.data?.vendors || []).map((bv: any) => ({
    id: bv.id,
    name: bv.storeName,
    slug: bv.storeSlug,
    logo: bv.storeLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${bv.storeName}`,
    banner: bv.storeBanner || "https://images.unsplash.com/photo-1506784919140-50cf144ad310?q=80&w=2000",
    description: bv.storeDescription || "A trusted wellness brand on Druxx Health Store.",
    rating: parseFloat(bv.rating) || 0,
    reviewCount: 0,
    productCount: bv._count?.products || 0,
    location: "India",
    isVerified: bv.approvalStatus === "ACTIVE",
    isTopSeller: parseFloat(bv.rating) >= 4.5,
    deliveryPerformance: 99,
    joinedDate: bv.createdAt,
    specialties: ["Health", "Wellness"]
  }));

  return (
    <>
      <HeroCarousel heroSlides={heroSlides} />
      
      <HomeAnimations>
        {/* Featured dynamic products */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
             <FeaturedProducts 
               featured={fRes.products}
               bestSellers={bRes.products}
               newArrivals={nRes.products}
             />
          </div>
        </div>

        {/* Offer Zone */}
        <OfferZone />

        {/* The Drux Advantage Carousel */}
        <AdvantageCarousel advantages={advantages} />

        {/* Vendor highlights */}
        <VendorHighlights vendors={vendors} />
      </HomeAnimations>

      {/* Newsletter section */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#A6D608]/10 to-[#2CA7A0]/10 border-t border-[#A6D608]/20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-[#1E1E1E] mb-2">
            Stay Healthy, Stay Updated
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Get exclusive offers, health tips, and new arrivals straight to your inbox.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 h-10 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm px-4 text-sm outline-none focus:ring-2 focus:ring-[#A6D608]/20"
            />
            <button className="bg-[#1E1E1E] text-white hover:bg-black rounded-xl font-bold px-6 h-10 transition-colors">
              Join
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
            Join 50,000+ fitness enthusiasts
          </p>
        </div>
      </section>
    </>
  );
}
