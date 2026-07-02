"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fadeUp, stagger } from "@/lib/motion";
import {
  FiArrowRight, FiCheck, FiX, FiSend,
  FiGift, FiTrendingUp, FiShield, FiZap,
  FiMapPin, FiBookOpen, FiUsers, FiAward,
  FiShare2, FiLink, FiTwitter, FiChevronDown,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const ambassadorTypes = [
  {
    id: "student" as const,
    icon: FiBookOpen,
    iconBg: "bg-violet-50",
    iconFg: "text-violet-500",
    tag: "Student Ambassador",
    tagColor: "bg-violet-100 text-violet-600",
    borderColor: "border-violet-200",
    checkBg: "bg-violet-500",
    headline: "Represent Vendorspot on your campus",
    desc: "You're a student with influence — your classmates trust your word. Help them discover the easiest way to buy and sell online while building real-world experience and earning rewards.",
    perks: [
      "Earn commission on every campus referral",
      "Official campus rep title & certificate",
      "Priority access to student discount campaigns",
      "Monthly performance bonuses",
    ],
  },
  {
    id: "state" as const,
    icon: FiMapPin,
    iconBg: "bg-sky-50",
    iconFg: "text-sky-500",
    tag: "State Ambassador",
    tagColor: "bg-sky-100 text-sky-600",
    borderColor: "border-sky-200",
    checkBg: "bg-sky-500",
    headline: "Be the face of Vendorspot in your state",
    desc: "You're connected — whether through business circles, community groups, or social media. Lead your state's Vendorspot presence, grow a local vendor and buyer base, and earn as the platform scales.",
    perks: [
      "Highest commission tier on all state referrals",
      "Dedicated state ambassador dashboard",
      "Featured in state-level marketing campaigns",
      "Direct line to the Vendorspot growth team",
    ],
  },
];

const whyJoin = [
  {
    icon: FiGift, bg: "bg-rose-50", fg: "text-rose-500", title: "Real Earnings",
    desc: "Earn a commission every time someone you refer registers as a vendor or completes their first purchase. No ceiling, no minimum threshold — money that actually moves.",
  },
  {
    icon: FiTrendingUp, bg: "bg-violet-50", fg: "text-violet-500", title: "Grow Your Brand",
    desc: "Ambassador spotlights on our Instagram and website, co-branded content, and tags that put your name in front of thousands. Your audience grows when ours does.",
  },
  {
    icon: FiShield, bg: "bg-emerald-50", fg: "text-emerald-500", title: "Verified Badge",
    desc: "Your name and social handles carry the official Vendorspot Ambassador badge — a credibility signal recognized by vendors, buyers, and business partners across Africa.",
  },
  {
    icon: FiZap, bg: "bg-amber-50", fg: "text-amber-500", title: "Priority Support",
    desc: "Ambassadors never wait in general queues. You get a dedicated contact who knows your account and responds within 24 hours — no matter what.",
  },
];

const steps = [
  {
    title: "Pick your program",
    desc: "Choose Student or State Ambassador based on your situation. Then fill in our quick application form — your name, location, social handle, and why you want to join. It takes under 2 minutes.",
  },
  {
    title: "Get approved",
    desc: "Our ambassador team reads every application personally — we don't use bots or auto-filters. We'll respond by email within 3–5 business days with your result and a clear next-steps guide.",
  },
  {
    title: "Start representing",
    desc: "Once approved, you get your personalized referral link, a digital ambassador kit (branded assets, templates, guidelines), and access to your dashboard to track your referrals and earnings in real time.",
  },
];

const whoFits = [
  { icon: FiBookOpen,   label: "Students with an active campus presence" },
  { icon: FiMapPin,     label: "Community leaders or state representatives" },
  { icon: FiTrendingUp, label: "Social media creators of any niche or size" },
  { icon: FiGift,       label: "People who love sharing great deals" },
  { icon: FiShield,     label: "Entrepreneurs who support local businesses" },
  { icon: FiUsers,      label: "Bloggers, podcasters, and online communities" },
];

const faqs = [
  {
    q: "Is there a cost to join the program?",
    a: "None at all. Applying, joining, and representing Vendorspot as an ambassador is completely free. There are no hidden fees, deposits, or paid tiers.",
  },
  {
    q: "How do I actually earn money?",
    a: "You receive a unique referral link when approved. Every vendor who registers through your link — or buyer who places their first order — earns you a commission. Your dashboard shows clicks, conversions, and payouts in real time.",
  },
  {
    q: "Can I apply for both the Student and State programs?",
    a: "You can apply to either program, but ambassadors are onboarded into one program at a time. If your situation changes (e.g. you graduate or relocate), reach out and we'll help you transition.",
  },
  {
    q: "What does the ambassador kit include?",
    a: "Your kit contains: your personalized referral link, branded digital assets (banners, story templates, captions), official ambassador certificate, and a guidelines document covering how to represent Vendorspot effectively.",
  },
  {
    q: "Do I need a minimum number of followers?",
    a: "No. We don't gate the program by follower count. What we look for is genuine community presence and trust — 500 engaged followers often outperform 50,000 passive ones.",
  },
  {
    q: "How long does the review process take?",
    a: "Our team reviews every application personally and typically responds within 3–5 business days. You'll receive an email confirmation as soon as your application is submitted.",
  },
];

/* ─── FAQ Item ──────────────────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-dark leading-snug">{q}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3 bg-white">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Share Button ──────────────────────────────────────────────────────────── */

const SHARE_URL  = "https://vendorspotng.com/ambassador-program";
const SHARE_TEXT = `Vendorspot Ambassador Program — Represent Africa's most trusted marketplace and earn real rewards!

Whether you're a student on campus or a community leader in your state, Vendorspot is looking for passionate people to join its growing ambassador network.

As an ambassador you get:
- Commission on every vendor or buyer you refer (no cap)
- Official ambassador title, certificate & badge
- Your own referral dashboard to track earnings
- Priority support + co-branded content features
- Zero cost to join

Student Ambassador: Represent Vendorspot on your campus and earn on every campus referral.
State Ambassador: Be the face of Vendorspot in your state and lead your region's growth.

Applications take less than 2 minutes.
Apply now:`;

function ShareButton() {
  const [open, setOpen]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  /* Close popover on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Vendorspot Ambassador Program", text: SHARE_TEXT, url: SHARE_URL });
      } catch {}
    } else {
      setOpen((v) => !v);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all"
      >
        <FiShare2 className="w-3.5 h-3.5" />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-52 z-50 overflow-hidden"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-1 pb-2">Share via</p>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                <FaWhatsapp className="w-4 h-4" />
              </span>
              WhatsApp
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Join the Vendorspot Ambassador Program — earn commissions, get official recognition, and represent Africa's most trusted marketplace. Student & State programs available. No cost to join.")}&url=${encodeURIComponent(SHARE_URL)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <FiTwitter className="w-4 h-4" />
              </span>
              X (Twitter)
            </a>

            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${copied ? "bg-emerald-50 text-emerald-500" : "bg-gray-100 text-gray-500"}`}>
                {copied ? <FiCheck className="w-4 h-4" /> : <FiLink className="w-4 h-4" />}
              </span>
              {copied ? "Link copied!" : "Copy link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Nigerian States ────────────────────────────────────────────────────────── */

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT — Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

/* ─── Modal ─────────────────────────────────────────────────────────────────── */

type AmbassadorType = "student" | "state" | "";

function ApplyModal({ preselected, onClose }: { preselected: AmbassadorType; onClose: () => void }) {
  const [type, setType]       = useState<AmbassadorType>(preselected);
  const [form, setForm]       = useState({ name: "", email: "", phone: "", location: "", social: "", why: "" });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: type, ...form }),
      });
      if (!res.ok) throw new Error("send_failed");
      setSent(true);
    } catch {
      setError("Something went wrong sending your application. Please try again or email us directly at support@vendorspotng.com.");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = ambassadorTypes.find((a) => a.id === type);

  const inputCls =
    "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-dark placeholder-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
  const labelCls = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col sm:flex-row max-h-[92dvh] sm:max-h-[88vh]"
      >
        {/* Left panel — desktop only */}
        <div
          className="hidden sm:flex sm:w-60 lg:w-72 shrink-0 p-8 lg:p-10 flex-col justify-between relative overflow-hidden"
          style={{ backgroundColor: "#d7004b" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-7">
              <FiAward className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Vendorspot</p>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white leading-snug mb-2">
              Ambassador<br />Application
            </h3>
            <p className="text-xs text-white/50 mb-7 leading-relaxed">
              {selectedType ? selectedType.tag : "Student or State Program"}
            </p>

            {selectedType && (
              <div className="space-y-3.5">
                {selectedType.perks.map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <FiCheck className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span className="text-xs text-white/80 leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="relative z-10 text-xs text-white/35 mt-6 leading-relaxed">
            We review every application personally and respond within 3–5 business days.
          </p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 sm:px-7 lg:px-8 pt-5 pb-4 border-b border-gray-100 shrink-0">
            {/* Mobile: show branding; Desktop: just label */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg sm:hidden flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#d7004b" }}>
                <FiAward className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest sm:hidden">Vendorspot</p>
                <p className="text-sm font-bold text-dark">{sent ? "Done" : "Ambassador Application"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3"
            >
              <FiX className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Scrollable form area */}
          <div className="overflow-y-auto flex-1 px-5 sm:px-7 lg:px-8 py-5">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-7 h-7 text-emerald-500" />
                </div>
                <h4 className="text-base font-bold text-dark mb-2">Application received!</h4>
                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                  We&apos;ll review your application and get back to you within 3–5 business days.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Program type */}
                <div>
                  <p className={labelCls}>Program Type *</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ambassadorTypes.map((a) => {
                      const Icon = a.icon;
                      const active = type === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setType(a.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                            active
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary text-white" : `${a.iconBg} ${a.iconFg}`}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-sm font-semibold ${active ? "text-primary" : "text-gray-600"}`}>
                            {a.id === "student" ? "Student" : "State"} Ambassador
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input required type="text" value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input required type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 800 000 0000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{type === "student" ? "University *" : "State *"}</label>
                    {type === "state" ? (
                      <select
                        required
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="" disabled>Select your state…</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        type="text"
                        value={form.location}
                        onChange={set("location")}
                        placeholder="e.g. UNILAG"
                        className={inputCls}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Social Media Handle / Link</label>
                  <input type="text" value={form.social} onChange={set("social")} placeholder="@yourhandle or profile URL" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Why do you want to join? *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.why}
                    onChange={set("why")}
                    placeholder="Tell us how you plan to represent Vendorspot…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-500 text-xs px-4 py-3 rounded-xl leading-relaxed">
                    <FiX className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !type}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSend className="w-3.5 h-3.5" />
                  {loading ? "Sending…" : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function AmbassadorPage() {
  const [modal, setModal] = useState<AmbassadorType>("");

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section
          className="pt-24 sm:pt-32 pb-0 relative overflow-hidden"
          style={{ backgroundColor: "#d7004b" }}
        >
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", transform: "translate(-30%,30%)" }} />
          {/* dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14 pb-10 sm:pb-16">

              {/* ── Left: copy ── */}
              <div className="flex-1 text-center lg:text-left mb-8 sm:mb-12 lg:mb-0">
                <motion.span variants={fadeUp} initial="hidden" animate="visible"
                  className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
                  Ambassador Program
                </motion.span>

                <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
                  className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-4 sm:mb-5">
                  Represent<br />Vendorspot.<br />
                  <span className="text-accent">Earn while you grow.</span>
                </motion.h1>

                <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
                  className="text-white/65 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto lg:mx-0 leading-relaxed mb-6 sm:mb-8">
                  Turn your influence into income — whether you&apos;re a student on campus or a community leader in your state. No cost to join. No cap on earnings.
                </motion.p>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.22 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-5">
                  <button
                    onClick={() => setModal("student")}
                    className="flex items-center justify-center gap-2 bg-white text-primary text-sm font-bold px-6 sm:px-7 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-lg shadow-black/20"
                  >
                    <FiBookOpen className="w-4 h-4" />
                    Student Ambassador
                  </button>
                  <button
                    onClick={() => setModal("state")}
                    className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-bold px-6 sm:px-7 py-3.5 rounded-full transition-all shadow-lg shadow-black/20"
                  >
                    <FiMapPin className="w-4 h-4" />
                    State Ambassador
                  </button>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.28 }}
                  className="flex items-center justify-center lg:justify-start gap-4">
                  <a href="#programs"
                    className="text-white/50 hover:text-white/75 text-xs font-medium transition-colors underline underline-offset-4">
                    Learn about each program
                  </a>
                  <span className="w-px h-3 bg-white/20" />
                  <ShareButton />
                </motion.div>
              </div>

              {/* ── Right: program cards ── */}
              <div className="flex flex-col gap-3 sm:gap-4 lg:w-[400px] lg:shrink-0">

                {/* Student card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl sm:rounded-3xl cursor-pointer group hover:bg-white/15 transition-colors"
                  onClick={() => setModal("student")}
                >
                  {/* Mobile: horizontal strip */}
                  <div className="flex items-center gap-3 p-4 sm:hidden">
                    <div className="w-10 h-10 rounded-xl bg-violet-400/30 border border-violet-300/30 flex items-center justify-center shrink-0">
                      <FiBookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-white font-bold text-sm leading-snug">Student Ambassador</p>
                        <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Campus</span>
                      </div>
                      <p className="text-white/55 text-xs">Earn on every campus referral. No cap.</p>
                    </div>
                    <FiArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  {/* Desktop: full card */}
                  <div className="hidden sm:block p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-violet-400/30 border border-violet-300/30 flex items-center justify-center shrink-0">
                        <FiBookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-white font-bold text-base">Student Ambassador</p>
                          <span className="text-[10px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">Campus</span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed mb-3">
                          Represent Vendorspot on your campus. Earn on every referral — classmates, staff, anyone.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Commission per referral", "Campus rep title", "Monthly bonuses"].map((t) => (
                            <span key={t} className="text-[10px] font-semibold text-white/70 bg-white/10 px-2.5 py-1 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1 text-white/50 group-hover:text-white/80 transition-colors text-xs font-semibold">
                      Apply now <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>

                {/* State card — white/glass, brighter than student */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-3xl cursor-pointer group hover:bg-white/28 transition-colors"
                  onClick={() => setModal("state")}
                >
                  {/* Mobile: horizontal strip */}
                  <div className="flex items-center gap-3 p-4 sm:hidden">
                    <div className="w-10 h-10 rounded-xl bg-white/25 border border-white/30 flex items-center justify-center shrink-0">
                      <FiMapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-white font-bold text-sm leading-snug">State Ambassador</p>
                        <span className="text-[9px] font-bold text-white/70 bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Top Tier</span>
                      </div>
                      <p className="text-white/55 text-xs">Highest commission tier. Lead your state.</p>
                    </div>
                    <FiArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  {/* Desktop: full card */}
                  <div className="hidden sm:block p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-white/25 border border-white/30 flex items-center justify-center shrink-0">
                        <FiMapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-white font-bold text-base">State Ambassador</p>
                          <span className="text-[10px] font-bold text-white/70 bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">Top Tier</span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed mb-3">
                          Lead your state&apos;s growth. Get the highest commission tier plus your own ambassador dashboard.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Highest commissions", "Dedicated dashboard", "State-level features"].map((t) => (
                            <span key={t} className="text-[10px] font-semibold text-white/70 bg-white/15 px-2.5 py-1 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1 text-white/50 group-hover:text-white/80 transition-colors text-xs font-semibold">
                      Apply now <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>

              </div>

            </div>
          </div>

          {/* wave transition */}
          <div className="relative h-10 sm:h-14 overflow-hidden">
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#111827">
              <path d="M0,0 C360,56 1080,56 1440,0 L1440,56 L0,56 Z" />
            </svg>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-dark py-5">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-3xl mx-auto px-6 grid grid-cols-4 divide-x divide-white/10">
            {[
              { val: "2K+",    label: "Active Vendors"   },
              { val: "₦0",     label: "Cost to Join"     },
              { val: "No Cap", label: "On Your Earnings"  },
              { val: "3–5d",   label: "Review Turnaround" },
            ].map(({ val, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center px-3 py-1">
                <p className="text-lg sm:text-2xl font-extrabold text-accent">{val}</p>
                <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5 leading-tight">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Ambassador types */}
        <section id="programs" className="py-16 sm:py-24 px-6 sm:px-8 lg:px-10">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-12">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Two Programs</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark mb-4">Find your fit</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Both programs come with real earning potential, official recognition, and hands-on support from our team. Pick the one that matches where you are right now.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ambassadorTypes.map((a) => {
                const Icon = a.icon;
                return (
                  <motion.div key={a.id} variants={fadeUp}
                    className={`bg-white rounded-3xl border-2 ${a.borderColor} p-7 sm:p-8 flex flex-col hover:shadow-xl hover:shadow-black/5 transition-all duration-300`}>

                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-xl ${a.iconBg} ${a.iconFg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${a.tagColor}`}>
                        {a.tag}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-dark mb-3 leading-snug">{a.headline}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">{a.desc}</p>

                    <ul className="space-y-2.5 mb-8">
                      {a.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2.5 text-sm text-dark">
                          <span className={`w-4 h-4 rounded-full ${a.checkBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <FiCheck className="w-2.5 h-2.5 text-white" />
                          </span>
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setModal(a.id)}
                      className="mt-auto flex items-center justify-center gap-2 bg-dark hover:bg-dark/80 text-white text-sm font-semibold px-6 py-3.5 rounded-full transition-all"
                    >
                      Apply as {a.id === "student" ? "Student" : "State"} Ambassador
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Why join */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Why Join</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-3">Built to reward you</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                We invest in every ambassador. You bring the community — we make sure the benefits are worth it.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whyJoin.map(({ icon: Icon, bg, fg, title, desc }) => (
                <motion.div key={title} variants={fadeUp}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md hover:shadow-black/5 transition-all duration-300">
                  <div className={`w-9 h-9 rounded-xl ${bg} ${fg} flex items-center justify-center mb-4`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-dark mb-1.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Simple Process</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">How it works</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                From application to first payout — the whole process is designed to be fast, transparent, and straightforward.
              </p>
            </motion.div>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div key={step.title}
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 bg-white border border-gray-100 rounded-2xl px-6 py-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                  <span className="w-7 h-7 rounded-full bg-primary/8 text-primary text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-dark mb-1">{step.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Questions</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">Frequently asked</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Everything you need to know before you apply. Still have questions? Email us at{" "}
                <a href="mailto:support@vendorspotng.com" className="text-primary font-medium hover:underline">
                  support@vendorspotng.com
                </a>.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-2">
              {faqs.map((item) => (
                <motion.div key={item.q} variants={fadeUp}>
                  <FaqItem q={item.q} a={item.a} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Who fits */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Who We Want</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">Are you the right fit?</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                We&apos;re not looking for the biggest accounts — we&apos;re looking for the most trusted ones. Whether you have 500 followers or 500,000, what matters is genuine community presence. If people listen when you speak, you belong here.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whoFits.map(({ icon: Icon, label }) => (
                <motion.div key={label} variants={fadeUp}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-dark">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Monthly Recognition Awards */}
        <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-10 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Monthly Awards</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">Recognition that pays</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Every month, we reward our top performing ambassadors. Show up consistently, grow your network, and you could be next.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
              {[
                { label: "Top Ambassador", amount: "₦25,000", icon: "🥇", desc: "Highest total referrals (vendors + customers) for the month" },
                { label: "Top Campus", amount: "₦30,000", icon: "🎓", desc: "Best performing student ambassador across all campuses" },
                { label: "Most Improved", amount: "₦10,000", icon: "📈", desc: "Ambassador with the biggest growth from the previous month" },
              ].map((award) => (
                <motion.div key={award.label} variants={fadeUp}
                  className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{award.icon}</div>
                  <p className="text-2xl font-extrabold text-primary mb-1">{award.amount}</p>
                  <p className="text-sm font-bold text-dark mb-2">{award.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{award.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Ambassador Benefits */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-8">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Perks</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-3">Beyond the commission</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Ambassadors get access to exclusive benefits that go far beyond earnings.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "💰", label: "Cash Incentives", desc: "Monthly payouts for vendor and customer referrals, plus milestone bonuses" },
                { icon: "🎁", label: "Vendorspot Merchandise", desc: "Exclusive branded merch — hoodies, kits, and more for top ambassadors" },
                { icon: "💼", label: "Internship Opportunities", desc: "High-performing ambassadors get priority access to Vendorspot internship roles" },
                { icon: "📜", label: "Leadership Certificates", desc: "Official certificates recognising your impact and ambassadorship" },
                { icon: "✉️", label: "Recommendation Letters", desc: "Personalised reference letters from the Vendorspot team for your career" },
                { icon: "🤝", label: "Networking Opportunities", desc: "Access to our ambassador community, events, and founder sessions" },
              ].map((benefit) => (
                <motion.div key={benefit.label} variants={fadeUp}
                  className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="text-2xl shrink-0">{benefit.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-dark mb-1">{benefit.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-20 sm:py-28 px-6 text-center overflow-hidden" style={{ backgroundColor: "#d7004b" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.09) 0%, transparent 60%)" }} />

          <div className="relative max-w-xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center mx-auto mb-6">
              <FiAward className="w-6 h-6" />
            </motion.div>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Ready to represent Vendorspot?
            </motion.h2>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-white/60 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
              Thousands of vendors and buyers are already on Vendorspot — and more are joining every day. Join the ambassador program, bring your community on board, and earn on every referral with no cap and no cost. Applications take less than 2 minutes. Let&apos;s go.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setModal("student")}
                className="flex items-center gap-2 bg-white text-primary text-sm font-bold px-7 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-md"
              >
                <FiBookOpen className="w-4 h-4" />
                Student Ambassador
              </button>
              <button
                onClick={() => setModal("state")}
                className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-dark text-sm font-bold px-7 py-3.5 rounded-full transition-all shadow-md"
              >
                <FiMapPin className="w-4 h-4" />
                State Ambassador
              </button>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              transition={{ delay: 0.22 }} className="flex justify-center mt-5">
              <ShareButton />
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />

      <AnimatePresence>
        {modal && <ApplyModal preselected={modal} onClose={() => setModal("")} />}
      </AnimatePresence>
    </>
  );
}
