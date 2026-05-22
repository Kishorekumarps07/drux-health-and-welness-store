import type { Metadata } from "next";
import { Download, FileText, Image as ImageIcon, Mail, ArrowRight, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Press & Media Room | Druxx Health Store",
  description: "Access the latest press releases, brand asset kits, media inquiries, and corporate news updates for Druxx Health Store.",
};

const RELEASES = [
  {
    date: "May 10, 2026",
    title: "Druxx Health Store Expands Panel to Vette Supplement Authenticity",
    snippet: "Announcing a new rigorous testing process for all third-party supplements, ensuring zero fillers, artificial colors, or adulteration.",
    category: "Corporate"
  },
  {
    date: "March 15, 2026",
    title: "Druxx Health Hits Milestone of 100+ Verified Wellness Brands",
    snippet: "The e-commerce platform scales its merchant network, adding organic farms and wellness creators from Himachal Pradesh, Kerala, and Rajasthan.",
    category: "Milestone"
  },
  {
    date: "Jan 08, 2026",
    title: "Druxx Announces Integration with Local Logistics Partners for Fast Payouts",
    snippet: "Introducing next-day settlement payouts for vendors shipping within 24 hours, enhancing direct farmer liquidity.",
    category: "Product Launch"
  }
];

const ASSETS = [
  { icon: <ImageIcon className="w-5 h-5 text-lime-600" />, title: "Brand Logos Kit", size: "4.2 MB", format: "PNG / SVG" },
  { icon: <FileText className="w-5 h-5 text-teal-600" />, title: "Brand Guidelines Manual", size: "12.8 MB", format: "PDF Document" },
  { icon: <ImageIcon className="w-5 h-5 text-orange-600" />, title: "Leadership Team Headshots", size: "18.5 MB", format: "ZIP Archive" }
];

export default function PressPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Media Room</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Press & <span className="text-[#A6D608]">News</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Stay up to date with corporate announcements, platform updates, media kits, and press releases.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Press Releases */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
            Latest Press Releases
          </h2>
          
          <div className="space-y-6">
            {RELEASES.map((release, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100/80 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600">
                    {release.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">{release.date}</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight leading-snug">
                  {release.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {release.snippet}
                </p>
                <div className="pt-2">
                  <button className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-lime-600 hover:text-lime-700 transition-colors">
                    Read full release <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Media Kits & Contacts */}
        <div className="space-y-8">
          
          {/* Media Kit Section */}
          <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight border-b border-gray-50 pb-3">
              Media Assets
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Approved corporate logos, bios, and imagery for editorial publication.
            </p>
            
            <div className="space-y-3">
              {ASSETS.map((asset, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100/50 hover:border-gray-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100">
                      {asset.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{asset.title}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{asset.format} · {asset.size}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white hover:bg-lime-500 hover:text-white flex items-center justify-center border border-gray-100 transition-all text-gray-500">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Press Contact Section */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] rounded-full opacity-20 bg-lime-500 blur-2xl pointer-events-none" />
            <h3 className="font-black text-lg text-white uppercase tracking-tight border-b border-white/5 pb-3">
              Media Contact
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              For interviews, statements, panel information, or feature pieces, get in touch with our PR agency.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <Mail size={16} className="text-[#A6D608]" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Press Email</p>
                <a href="mailto:press@druxx.health" className="hover:text-white transition-colors">
                  press@druxx.health
                </a>
              </div>
            </div>
            <div className="pt-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              Average response time: &lt; 4 hours
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
