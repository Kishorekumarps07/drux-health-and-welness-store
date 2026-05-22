import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Druxx Health Store",
  description: "Read the official terms of use, marketplace code of conduct, and vendor policies for Druxx Health Store.",
};

export default function TermsPage() {
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
            Terms of <span className="text-[#A6D608]">Service</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Effective Date: May 22, 2026. Review these terms carefully before accessing or using our marketplace platform.
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-150/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10 text-gray-700 leading-relaxed text-sm">
          
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              1. Platform Nature
            </h2>
            <p>
              Druxx Health Store operates as a multi-vendor online marketplace. We provide the technology infrastructure that enables independent wellness sellers (\"Vendors\") to list products and sell directly to customers. 
            </p>
            <p>
              While we perform audits on vendor credentials, the actual sales contract is formed directly between the buyer and the vendor.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-905 uppercase tracking-tight border-b border-gray-50 pb-2">
              2. User Accounts
            </h2>
            <p>
              By creating an account, you represent that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All information provided during registration (including shipping addresses and email) is true and accurate.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials and account password.</li>
              <li>You will notify support immediately of any unauthorized access or security breach.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              3. Purchases & Payments
            </h2>
            <p>
              All listed product pricing is determined by the respective vendors. Druxx reserves the right to cancel orders arising from typographical pricing errors. By completing checkout, you authorize our third-party payment gateways to process charge transactions for the order totals.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              4. Healthcare Disclaimers
            </h2>
            <p>
              The products listed on Druxx Health Store (including dietary supplements, vitamins, and herbal formulations) are not intended to diagnose, treat, cure, or prevent any medical condition.
            </p>
            <p>
              Product descriptions and expert reviews are for informational purposes only. Always consult a certified healthcare practitioner before introducing new nutritional supplements or dietary habits.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              5. Governing Law
            </h2>
            <p>
              These Terms of Service and any transactional disputes are governed by and construed in accordance with the laws of India, with exclusive jurisdiction in the courts of Bengaluru, Karnataka.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
