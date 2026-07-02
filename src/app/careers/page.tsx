"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FiArrowRight, FiCheck, FiMapPin, FiClock, FiBriefcase, FiSend, FiX } from "react-icons/fi";
import { fadeUp } from "@/lib/motion";

const roles = [
  {
    id: "social-media-manager",
    title: "Social Media Manager",
    type: "Volunteer",
    location: "Remote / Lagos",
    department: "Marketing",
    color: "bg-violet-500",
    description:
      "We're looking for a creative, data-driven Social Media Manager to grow and manage Vendorspot's presence across X, Instagram, TikTok, Facebook, and LinkedIn. You'll craft content, run campaigns, engage our community, and turn followers into buyers and vendors.",
    responsibilities: [
      "Plan and execute social media content calendars across all platforms",
      "Create engaging posts, reels, stories, and short-form video content",
      "Monitor trends and adapt content to stay relevant and drive growth",
      "Engage with followers, respond to comments and DMs promptly",
      "Track performance metrics and report insights weekly",
      "Collaborate with the Growth and Design teams on campaigns",
    ],
    requirements: [
      "2+ years managing brand social media accounts",
      "Strong writing and visual storytelling skills",
      "Experience with content scheduling tools (Buffer, Later, etc.)",
      "Understanding of social media analytics and growth tactics",
      "Passion for e-commerce and Nigerian/African digital culture",
      "Video editing skills are a strong plus",
    ],
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    type: "Volunteer",
    location: "Remote / Lagos",
    department: "Design",
    color: "bg-pink-500",
    description:
      "We're looking for a product-minded UI/UX Designer to craft intuitive, beautiful experiences across the Vendorspot web and mobile platforms. You'll own end-to-end design — from user research and wireframes to polished high-fidelity screens — helping buyers and vendors navigate the marketplace with ease.",
    responsibilities: [
      "Design user flows, wireframes, and high-fidelity screens for web and mobile",
      "Conduct user research and translate insights into actionable design decisions",
      "Build and maintain a consistent design system across all product surfaces",
      "Collaborate closely with engineering to ensure pixel-accurate implementation",
      "Run usability tests and iterate based on feedback",
      "Champion accessibility and inclusive design practices across the product",
    ],
    requirements: [
      "Strong portfolio of shipped mobile and/or web product work",
      "Proficiency in Figma (components, auto-layout, prototyping)",
      "Solid grasp of UX principles — information architecture, user flows, usability",
      "Experience designing for both iOS/Android and responsive web",
      "Ability to think in systems, not just screens",
      "Understanding of front-end constraints is a strong plus",
    ],
  },
  {
    id: "graphic-designer",
    title: "Graphic Designer / Art Director",
    type: "Volunteer",
    location: "Remote / Lagos",
    department: "Design",
    color: "bg-teal-500",
    description:
      "We're looking for a talented Graphic Designer and Art Director to shape the visual identity of Vendorspot across all touchpoints — from in-app UI assets and social media visuals to marketing campaigns and brand collateral. If you think in stories and communicate through design, this is your seat.",
    responsibilities: [
      "Create high-quality graphics for social media, campaigns, and marketing materials",
      "Design UI assets, banners, illustrations, and promotional visuals for the platform",
      "Art-direct campaign shoots and visual content to maintain brand consistency",
      "Develop and maintain brand guidelines and design systems",
      "Collaborate with the Marketing and Product teams on visual storytelling",
      "Produce motion graphics and short animated assets where needed",
    ],
    requirements: [
      "Strong portfolio demonstrating graphic design and brand work",
      "Proficiency in Figma, Adobe Illustrator, Photoshop, or equivalent tools",
      "Solid understanding of typography, colour theory, and layout",
      "Experience designing for digital-first brands (social, web, mobile)",
      "Eye for detail and ability to uphold visual consistency across touchpoints",
      "Motion design or video editing skills are a strong plus",
    ],
  },
];

const perks = [
  "Remote-first culture",
  "Volunteer opportunity",
  "Growth & learning",
  "Collaborative team",
  "Build real experience",
  "Real impact on Nigerian commerce",
];

function ApplyModal({ role, onClose }: { role: typeof roles[0]; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", portfolio: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role.title, ...form }),
    }).catch(() => {});
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Applying for</p>
              <h3 className="text-xl font-extrabold text-dark">{role.title}</h3>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0">
              <FiX className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-dark mb-2">Application sent!</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                We&apos;ve received your application for <strong>{role.title}</strong>. We&apos;ll review it and get back to you within 5–7 business days.
              </p>
              <button onClick={onClose} className="mt-6 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Portfolio / LinkedIn / CV link</label>
                <input
                  type="url"
                  value={form.portfolio}
                  onChange={(e) => setForm((f) => ({ ...f, portfolio: e.target.value }))}
                  placeholder="https://"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Why do you want this role? *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us a bit about yourself and why you're a great fit…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <FiSend className="w-4 h-4" />
                Submit Application
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CareersPage() {
  const [selected, setSelected] = useState<typeof roles[0] | null>(null);

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section
          className="pt-24 sm:pt-32 pb-14 sm:pb-20 px-6 text-center relative overflow-hidden"
          style={{ backgroundColor: "#8A38F5" }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", transform: "translate(35%,-35%)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.p variants={fadeUp} initial="hidden" animate="visible"
              className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
              Volunteer Roles
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Build the future<br className="hidden sm:block" /> of commerce with us
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
              className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Join a small, driven team on a mission to make online trade safe and trustworthy across Africa. These are voluntary roles — no pay for now, but a real chance to shape something from the ground up.
            </motion.p>
          </div>
        </section>

        {/* Perks strip */}
        <section className="bg-dark py-5 overflow-hidden">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 px-6">
            {perks.map((p) => (
              <span key={p} className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <FiCheck className="w-3.5 h-3.5 text-accent shrink-0" />{p}
              </span>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section className="py-14 sm:py-20 px-6 sm:px-8 lg:px-10">
          <div className="max-w-4xl mx-auto">
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">
              Open Positions
            </motion.h2>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="mb-10 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-amber-500 text-lg shrink-0">📌</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>These are voluntary, unpaid roles.</strong> We&apos;re early-stage and building momentum — once we hit our traction goals, paid positions and other benefits will follow. Right now, it&apos;s about passion, skill, and being part of something from day one.
              </p>
            </motion.div>

            <div className="space-y-6">
              {roles.map((role, i) => (
                <motion.div
                  key={role.id}
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:border-gray-200 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`${role.color} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                          {role.department}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          <FiClock className="w-3 h-3" />{role.type}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          <FiMapPin className="w-3 h-3" />{role.location}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-dark mb-2">{role.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-5">{role.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-dark uppercase tracking-widest mb-2">What you&apos;ll do</p>
                          <ul className="space-y-1.5">
                            {role.responsibilities.slice(0, 3).map((r) => (
                              <li key={r} className="flex items-start gap-2 text-xs text-gray-500">
                                <FiCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-dark uppercase tracking-widest mb-2">What we need</p>
                          <ul className="space-y-1.5">
                            {role.requirements.slice(0, 3).map((r) => (
                              <li key={r} className="flex items-start gap-2 text-xs text-gray-500">
                                <FiBriefcase className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />{r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelected(role)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shrink-0 shadow-sm self-start"
                    >
                      Apply <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* General applications */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="mt-10 border border-dashed border-gray-200 rounded-3xl p-6 sm:p-8 text-center"
            >
              <p className="text-sm font-bold text-dark mb-1">Don&apos;t see your role?</p>
              <p className="text-sm text-gray-400 mb-5">We&apos;re always open to exceptional people. Send us an open application.</p>
              <a
                href="mailto:support@vendorspotng.com?subject=Open%20Application%20%E2%80%94%20Vendorspot"
                className="inline-flex items-center gap-2 border border-gray-200 text-dark text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                <FiSend className="w-4 h-4" /> Email us directly
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />

      <AnimatePresence>
        {selected && <ApplyModal role={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
