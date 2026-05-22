"use client";

import { useState } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Heart, Coffee, BookOpen, Smile, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const JOBS = [
  {
    id: "nutri-expert",
    title: "Chief Nutrition & Wellness Consultant",
    dept: "Advisory & Quality Assurance",
    location: "Bengaluru (Hybrid)",
    type: "Full-Time",
    salary: "₹12L - ₹18L L.P.A.",
    desc: "We are seeking a certified nutritionist to lead our product screening panel, verify certificate files, and write clinical reviews for our catalog products."
  },
  {
    id: "frontend-dev",
    title: "Senior Frontend Engineer (Next.js / React)",
    dept: "Engineering",
    location: "Remote (India)",
    type: "Full-Time",
    salary: "₹18L - ₹24L L.P.A.",
    desc: "Join our UI team to build high-performance e-commerce features, multi-vendor dashboards, and beautiful checkout experiences. Must be a pro with Tailwind and React hooks."
  },
  {
    id: "content-writer",
    title: "Wellness & SEO Content Writer",
    dept: "Marketing",
    location: "Remote / Hybrid",
    type: "Contract",
    salary: "₹6L - ₹8L L.P.A.",
    desc: "Create engaging, medically researched blog posts, product guidelines, and newsletter campaigns. Knowledge of Ayurvedic wellness and sports nutrition is a major plus."
  },
  {
    id: "qa-lead",
    title: "Quality Assurance & Lead Tester",
    dept: "Engineering",
    location: "Bengaluru (On-site)",
    type: "Full-Time",
    salary: "₹8L - ₹12L L.P.A.",
    desc: "Own the end-to-end testing pipeline. Write automated e2e tests, perform browser compatibility checks, and verify purchase pathways."
  }
];

const BENEFITS = [
  { icon: <Heart className="text-[#FF7A00] w-6 h-6" />, title: "Premium Healthcare", desc: "Comprehensive medical cover for you and your family dependents." },
  { icon: <Coffee className="text-[#A6D608] w-6 h-6" />, title: "Wellness Hamper", desc: "Free monthly care package filled with Druxx organic supplements and snacks." },
  { icon: <BookOpen className="text-[#2CA7A0] w-6 h-6" />, title: "Learning Allowance", desc: "Annual budget for books, professional bootcamps, and certifications." },
  { icon: <Smile className="text-pink-500 w-6 h-6" />, title: "Flexible Schedule", desc: "Work hours designed around your productivity peaks. High trust environment." }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !resume) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Application for "${selectedJob.title}" submitted successfully!`);
      // Reset form
      setName("");
      setEmail("");
      setResume("");
      setCoverLetter("");
      setSelectedJob(null);
    }, 1500);
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
      {/* Hero */}
      <section className="bg-[#1E1E1E] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">We're Hiring</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Build the Future of <span className="text-[#A6D608]">Wellness</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Help us make premium, verified organic nutrition accessible to millions. We are a fast-growing team of innovators, engineers, and creators.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight text-center mb-12">
          Why You'll Love Working Here
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-base text-gray-900">{benefit.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tight">
            Open <span className="text-[#2CA7A0]">Opportunities</span>
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Select a role to review guidelines and submit your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {JOBS.map((job) => (
            <div 
              key={job.id} 
              className="bg-white border border-gray-100/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-lime-500/10 text-lime-700">
                    {job.dept}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600">
                    {job.type}
                  </span>
                </div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight">{job.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{job.desc}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-300" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={14} className="text-gray-300" /> {job.salary}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(job)}
                className="w-full md:w-auto flex-shrink-0 bg-zinc-950 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-black transition-all"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Application Form */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100 p-8 sm:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="mb-6 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2CA7A0]">Application</span>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight">
                {selectedJob.title}
              </h3>
              <p className="text-xs text-gray-400">
                Department: {selectedJob.dept} · {selectedJob.location}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Resume Link (PDF / Google Drive) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="url"
                  required
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you are a great fit..."
                  rows={4}
                  className="w-full text-sm font-semibold border border-gray-100 bg-gray-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 h-12 rounded-xl border-gray-100 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-zinc-950 text-white text-xs font-black uppercase tracking-widest hover:bg-black"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-1.5" size={14} /> : "Submit Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
