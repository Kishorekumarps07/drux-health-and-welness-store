import type { Metadata } from "next";
import { FileText, ShieldAlert, Award, Landmark, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Guidelines | Druxx Merchant Portal",
  description: "Learn about Druxx onboarding compliance, certificate requirements, catalogue quality standards, and merchant payout timelines.",
};

const STEPS = [
  {
    icon: <CheckCircle className="w-5 h-5 text-lime-600" />,
    title: "1. Account Set Up",
    desc: "Complete the merchant registration form, upload your business PAN card, GSTIN number, and FSSAI license (for edible items)."
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
    title: "2. Lab Vetting",
    desc: "Submit laboratory Certificates of Analysis (CoA) or certified organic stamps for every SKU listing to guarantee authentic formulations."
  },
  {
    icon: <Landmark className="w-5 h-5 text-orange-600" />,
    title: "3. Direct Payouts",
    desc: "Integrate your corporate bank details to receive secure auto-settlements on a T+3 business day cycle following confirmed delivery."
  }
];

export default function SellerGuidelinesPage() {
  return (
    <div className="font-sans min-h-screen bg-[#FAFBF8] pt-24 md:pt-32 pb-20">
      {/* Page Header */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-700">Compliance Code</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">
            Seller <span className="text-lime-600">Guidelines</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            Welcome to the Druxx Verified Merchant Network. To maintain the highest standard of health and consumer safety, all sellers must align with our quality regulations.
          </p>
        </div>
      </section>

      {/* Grid Compliance */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {STEPS.map((step, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="font-black text-sm text-gray-900 tracking-tight">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </section>

      {/* Policy Details */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10 text-gray-700 text-sm leading-relaxed">
          
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              1. Catalogue & Product Listing Rules
            </h2>
            <p>
              To maintain a premium shopping experience, all product listings must submit to the following guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-650">
              <li><strong>Imagery:</strong> Upload minimum 3 high-resolution product photos featuring a solid white background. Avoid mockups or low-light shots.</li>
              <li><strong>Disclosures:</strong> Provide complete ingredient lists, allergen warnings (e.g. nuts, gluten, dairy), and accurate nutritional fact panels.</li>
              <li><strong>Expirations:</strong> Products shipped to customers must have a minimum shelf-life of 6 months remaining from the date of dispatch.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              2. Quality Assurance Audit
            </h2>
            <p>
              Druxx conducts regular testing on randomized inventory units. If a product fails purity criteria (e.g., contains undisclosed heavy metals, fillers, artificial sweeteners, or banned ingredients):
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-gray-650">
              <li>The specific item listings will be suspended immediately.</li>
              <li>The merchant account will be marked as 'SUSPENDED' pending a detailed audit.</li>
              <li>Sellers will forfeit payouts for orders containing the affected batch codes.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              3. Order Fulfillment & Payouts
            </h2>
            <p>
              Merchants are obligated to pack and hand over orders to our courier partners within 24 hours of receiving the order notification. Failure to dispatch items within 48 hours will trigger automatic order cancellation and penalty strikes.
            </p>
            <p>
              <strong>Commission Fees:</strong> Druxx charges a flat 8-12% commission fee (based on category profiles) on completed sales to fund payments processing, hosting, and pan-India marketing campaigns.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Ready to start your shop?
            </div>
            <Link 
              href="/vendor/register" 
              className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-black transition-all"
            >
              Apply as a Seller <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
