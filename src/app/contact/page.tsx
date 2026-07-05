"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FiMail, FiMapPin, FiPhone, FiSend, FiCheck, FiMessageCircle, FiClock } from "react-icons/fi";
import { Spinner } from "@/components/Spinner";
import { FaXTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { fadeUp, slideLeft, slideRight, stagger } from "@/lib/motion";

const contactInfo = [
  {
    Icon: FiMapPin,
    label: "Location",
    value: "Lagos, Nigeria",
    sub: "West Africa",
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
  },
  {
    Icon: FiMail,
    label: "Email",
    value: "support@vendorspotng.com",
    sub: "We reply within 24–48h",
    href: "mailto:support@vendorspotng.com",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-500",
  },
  {
    Icon: FiPhone,
    label: "Phone",
    value: "+234 704 588 2161",
    sub: "Mon–Fri, 9am–5pm WAT",
    href: "tel:+2347045882161",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
  },
];

const socials = [
  { Icon: FaXTwitter,   label: "X (Twitter)",  href: "https://x.com/vendorsspot",                    color: "hover:bg-black hover:text-white"       },
  { Icon: FaInstagram,  label: "Instagram",    href: "https://www.instagram.com/vendorsspot",         color: "hover:bg-pink-500 hover:text-white"    },
  { Icon: FaLinkedinIn, label: "LinkedIn",     href: "https://www.linkedin.com/company/vendorspot/",  color: "hover:bg-blue-600 hover:text-white"    },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {}
    setLoading(false);
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-primary pt-28 sm:pt-36 pb-24 sm:pb-32 px-6 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%,-40%)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-10"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(-30%, 40%)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
            >
              <FiMessageCircle className="w-3.5 h-3.5" />
              We&apos;re here to help
            </motion.div>
            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}
              className="text-white/70 text-sm sm:text-base max-w-md mx-auto leading-relaxed"
            >
              Have a question, issue, or just want to say hello? Our team is ready to help you.
            </motion.p>
          </div>
        </section>

        {/* Contact cards — float over hero */}
        <section className="px-6 sm:px-8 lg:px-10 -mt-12 mb-0 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {contactInfo.map(({ Icon, label, value, sub, href, bg, iconBg, iconColor }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className={`${bg} rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm border border-white`}
                >
                  <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold text-dark hover:text-primary transition-colors truncate block">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-dark">{value}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14">

              {/* Sidebar */}
              <motion.div
                variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="md:col-span-2 flex flex-col gap-7"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-dark leading-snug mb-3">
                    We&apos;d love to hear from you.
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Whether it&apos;s an order issue, a vendor enquiry, or feedback — we read every message and respond personally.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <FiClock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    We typically respond within <span className="font-bold">24–48 hours</span> on business days.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Follow us</p>
                  <div className="flex gap-2">
                    {socials.map(({ Icon, label, href, color }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 transition-all duration-200 ${color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                variants={slideRight} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="md:col-span-3"
              >
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center bg-emerald-50 border border-emerald-100 rounded-3xl p-10 sm:p-14"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <FiCheck className="w-7 h-7 text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-2">Message Sent!</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Thanks for reaching out. We&apos;ll get back to you within 24–48 hours.</p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="mt-6 text-sm font-semibold text-primary hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-5 bg-white"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                        <input
                          name="name" value={form.name} onChange={handleChange} required
                          placeholder="Your name"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                        <input
                          name="email" type="email" value={form.email} onChange={handleChange} required
                          placeholder="you@email.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Topic</label>
                      <select
                        name="subject" value={form.subject} onChange={handleChange} required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
                      >
                        <option value="">Select a topic…</option>
                        <option value="order">Order Issue</option>
                        <option value="vendor">Become a Vendor</option>
                        <option value="payment">Payment / Refund</option>
                        <option value="report">Report a Problem</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange} required rows={5}
                        placeholder="Tell us how we can help…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl py-3.5 transition-colors shadow-sm disabled:opacity-60"
                    >
                      {loading ? <Spinner /> : <FiSend className="w-4 h-4" />}
                      {loading ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
