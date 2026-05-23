import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { VendorHighlights } from "@/components/home/VendorHighlights";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AdvantageCarousel } from "@/components/home/AdvantageCarousel";
import { OfferZone } from "@/components/home/OfferZone";
import { productService } from "@/services/productService";
import { HomeAnimations } from "@/components/home/HomeAnimations";
import api from "@/lib/api";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default async function HomePage() {
  // Fetch all home data in parallel on the server
  // Fetch home data sequentially to avoid hitting rate limits (429)
  const fRes = await productService.getFeatured();
  const bRes = await productService.getBestSellers();
  const nRes = await productService.getNewArrivals();
  const oRes = await productService.getAllProducts({ limit: 12 });
  
  const [heroRes, advRes, vRes] = await Promise.all([
    api.get('/cms/hero').catch(() => ({ data: { data: [] } })),
    api.get('/cms/advantages').catch(() => ({ data: { data: [] } })),
    api.get('/vendors', { params: { limit: 3, orderBy: 'latest' } }).catch(() => ({ data: { vendors: [] } }))
  ]);

  const offerProducts = oRes.products.filter((p: any) => p.originalPrice && p.originalPrice > p.price);

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
        <OfferZone products={offerProducts} />

        {/* The Drux Advantage Carousel */}
        <AdvantageCarousel advantages={advantages} />

        {/* Vendor highlights */}
        <VendorHighlights vendors={vendors} />
      </HomeAnimations>

      {/* Newsletter section */}
      <NewsletterSection />
    </>
  );
}
