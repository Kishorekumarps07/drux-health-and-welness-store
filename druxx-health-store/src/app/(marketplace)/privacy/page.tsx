import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Druxx Health Store",
  description: "Learn how we collect, process, and safeguard your personal details and transaction data at Druxx Health Store.",
};

export default function PrivacyPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Legal Details</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Privacy <span className="text-[#A6D608]">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Effective Date: May 22, 2026. We are committed to protecting your privacy and security. Learn more about our data guidelines.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-150/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10 text-gray-700 leading-relaxed text-sm">
          
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information that helps us personalize and improve your shopping experience. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> Full name, email address, password, phone number, and billing/shipping addresses.</li>
              <li><strong>Transaction Details:</strong> Payment references, order details, cart contents, and transaction histories.</li>
              <li><strong>Vendor Materials:</strong> Store profiles, certificates of authenticity, tax logs, and bank accounts for vendor payouts.</li>
              <li><strong>Interactive Inputs:</strong> Message queries, help center tickets, support chat contents, and resume submissions.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              2. How We Use Your Data
            </h2>
            <p>
              Your personal data is used solely to process order operations and provide quality support:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processing checkouts, verifying payments, and delivering order items via third-party courier channels.</li>
              <li>Providing vendor payouts, tracking merchant analytics, and verifying seller qualifications.</li>
              <li>Sending transaction updates, verification OTPs, and response notifications to support tickets.</li>
              <li>Improving platform speed, troubleshooting system logs, and preventing fraud or security breaches.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              3. Data Security Safeguards
            </h2>
            <p>
              We employ strict technical safeguards to secure your private details:
            </p>
            <p>
              All online connection pathways are encrypted using Secure Sockets Layer (SSL) technology. Credit and debit card credentials are never stored directly on our servers; they are securely parsed by PCI-DSS compliant payment aggregators (e.g. Razorpay, Stripe).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              4. Sharing of Information
            </h2>
            <p>
              We do not sell, lease, or distribute your personal details to third-party marketing companies. Data is shared only with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Shipping Aggregators:</strong> Shared shipping addresses and telephone numbers to enable delivery.</li>
              <li><strong>Verified Vendors:</strong> Order contents and delivery addresses to enable product dispatch and tracking setup.</li>
              <li><strong>Legal Obligations:</strong> Compliance with statutory requirements, judicial inquiries, or tax Audits.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-2">
              5. Your Privacy Rights
            </h2>
            <p>
              You maintain full control over your personal records:
            </p>
            <p>
              You have the right to request deletion of your account and related records, edit address fields inside your profile dashboard, or withdraw consent to promotional newsletter campaigns. For any privacy requests, write to <a href="mailto:druxindia@gmail.com" className="text-lime-600 font-bold hover:underline">druxindia@gmail.com</a>.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
