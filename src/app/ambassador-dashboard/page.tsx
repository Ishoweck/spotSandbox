"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { fadeUp } from "@/lib/motion";
import {
  FiCopy, FiCheck, FiTrendingUp, FiUsers, FiDollarSign,
  FiAward, FiExternalLink, FiShoppingBag, FiShare2,
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const BRAND = "#d7004b";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface AmbassadorInfo {
  ambassadorCode: string;
  role: "student" | "state";
  name: string;
  status: string;
  approvedAt: string;
}

interface ReferredUser {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface VendorReferral {
  _id: string;
  referredUserId: ReferredUser;
  ordinalPosition: number;
  tierRate: number;
  partialCount: number;
  stage40Reached: boolean;
  stage60Reached: boolean;
  commission40Amount: number;
  commission60Amount: number;
  totalEarned: number;
  createdAt: string;
}

interface CustomerReferral {
  _id: string;
  referredUserId: ReferredUser;
  customerOrdersTracked: { orderId: string; orderAmount: number; commissionAmount: number }[];
  totalEarned: number;
  createdAt: string;
}

interface Milestone {
  current: number;
  next: number | null;
  reward: number | null;
  targets: { count: number; reward: number }[];
}

interface Summary {
  totalVendors: number;
  totalCustomers: number;
  vendorEarned: number;
  customerEarned: number;
  totalEarned: number;
}

interface DashboardData {
  ambassador: AmbassadorInfo;
  milestone: Milestone;
  vendors: VendorReferral[];
  customers: CustomerReferral[];
  summary: Summary;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Copy button ─────────────────────────────────────────────────────────── */

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      style={{ color: copied ? "#16a34a" : BRAND }}
    >
      {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : (label || "Copy")}
    </button>
  );
}

/* ─── Milestone bar ─────────────────────────────────────────────────────────── */

function MilestoneBar({ milestone }: { milestone: Milestone }) {
  const { targets, current, next, reward } = milestone;
  const maxTarget = 200;
  const pct = Math.min((current / maxTarget) * 100, 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor Milestone</p>
        <p className="text-xs font-semibold text-gray-500">
          {next ? `Next unlock at ${next} vendors` : "All milestones reached 🎉"}
        </p>
      </div>

      <div className="flex items-end justify-between mb-3 mt-2">
        <div>
          <p className="text-3xl font-extrabold text-gray-900">{current}</p>
          <p className="text-xs text-gray-400 mt-0.5">vendors referred</p>
        </div>
        {next && reward && (
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{fmt(reward)}</p>
            <p className="text-xs text-gray-400">next milestone reward</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: BRAND }}
        />
      </div>

      {/* Milestone markers */}
      <div className="flex justify-between">
        {targets.map((t) => {
          const reached = current >= t.count;
          return (
            <div key={t.count} className="flex flex-col items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: reached ? BRAND : "white",
                  borderColor: reached ? BRAND : "#d1d5db",
                }}
              />
              <p className="text-[9px] font-bold" style={{ color: reached ? BRAND : "#9ca3af" }}>
                {t.count}
              </p>
              <p className="text-[8px]" style={{ color: reached ? "#d7004b99" : "#d1d5db" }}>
                {fmt(t.reward)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Vendor row ─────────────────────────────────────────────────────────────── */

function VendorRow({ v, idx }: { v: VendorReferral; idx: number }) {
  const u = v.referredUserId;
  const stage = v.stage60Reached ? "Fully active" : v.stage40Reached ? "Has product" : "Registered";
  const stageCls = v.stage60Reached
    ? "bg-gray-900 text-white"
    : v.stage40Reached
    ? "bg-gray-100 text-gray-700"
    : "bg-gray-50 text-gray-400";

  return (
    <tr className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5 text-xs text-gray-300 font-mono">{idx + 1}</td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-gray-900">{u?.firstName} {u?.lastName}</p>
        <p className="text-xs text-gray-400">{u?.email}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${stageCls}`}>
          {stage}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <p className="text-sm font-bold text-gray-900">{fmt(v.totalEarned)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {v.stage40Reached && `40%: ${fmt(v.commission40Amount)}`}
          {v.stage60Reached && ` + 60%: ${fmt(v.commission60Amount)}`}
        </p>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400 text-right hidden sm:table-cell">{fmtDate(v.createdAt)}</td>
    </tr>
  );
}

/* ─── Customer row ─────────────────────────────────────────────────────────── */

function CustomerRow({ c }: { c: CustomerReferral }) {
  const u = c.referredUserId;
  const orders = c.customerOrdersTracked.length;

  return (
    <tr className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-gray-900">{u?.firstName} {u?.lastName}</p>
        <p className="text-xs text-gray-400">{u?.email}</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 mb-0.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
              style={{
                backgroundColor: n <= orders ? BRAND : "#f3f4f6",
                color: n <= orders ? "white" : "#9ca3af",
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400">{orders}/3 orders</p>
      </td>
      <td className="px-5 py-3.5 text-right">
        <p className="text-sm font-bold text-gray-900">{fmt(c.totalEarned)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">3% per order</p>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400 text-right hidden sm:table-cell">{fmtDate(c.createdAt)}</td>
    </tr>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

type Tab = "vendors" | "customers";

export default function AmbassadorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("vendors");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    fetch(`${API_BASE}/ambassadors/my-dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          if (json.statusCode === 401) { router.push("/login"); return; }
          setError(json.message || "Could not load your dashboard.");
        } else {
          setData(json.data as DashboardData);
        }
      })
      .catch(() => setError("Connection error. Please try again."))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const referralLink = data
    ? `https://vendorspotng.com/signup?ref=${data.ambassador.ambassadorCode}`
    : "";

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
            <p className="text-sm text-gray-400">Loading your dashboard…</p>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  /* ── Error / not an ambassador ── */
  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${BRAND}12` }}>
              <FiAward className="w-7 h-7" style={{ color: BRAND }} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {error.includes("not found") ? "Not an ambassador yet" : "Something went wrong"}
            </h1>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              {error.includes("not found")
                ? "This dashboard is for approved Vendorspot ambassadors. Apply to join and you'll get access once approved."
                : error}
            </p>
            <Link
              href="/ambassador-program"
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              <FiAward className="w-4 h-4" />
              View Ambassador Program
            </Link>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  if (!data) return null;

  const { ambassador, milestone, vendors, customers, summary } = data;

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen pb-24">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <section className="pt-24 sm:pt-28 pb-8 px-6 border-b border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">

              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{ color: BRAND, borderColor: `${BRAND}33`, backgroundColor: `${BRAND}0d` }}
                >
                  {ambassador.role === "student" ? "Student Ambassador" : "State Ambassador"}
                </span>
                <span className="text-xs text-gray-400">· since {fmtDate(ambassador.approvedAt)}</span>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
                Hey, {ambassador.name.split(" ")[0]} 👋
              </h1>

              {/* Code + link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Code card */}
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ambassador Code</p>
                    <p className="font-mono text-lg font-bold text-gray-900 tracking-widest">{ambassador.ambassadorCode}</p>
                  </div>
                  <CopyButton text={ambassador.ambassadorCode} />
                </div>

                {/* Link card */}
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Referral Link</p>
                    <p className="text-xs text-gray-500 truncate">{referralLink}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <CopyButton text={referralLink} label="Copy link" />
                    <a
                      href={referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6">

          {/* Stats row — floats out of the dark section */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-1 pt-6 mb-6"
          >
            {[
              { label: "Total Earned",       value: fmt(summary.totalEarned),   icon: FiDollarSign  },
              { label: "Vendors Referred",   value: summary.totalVendors,        icon: FiUsers       },
              { label: "Customers Referred", value: summary.totalCustomers,      icon: FiShoppingBag },
              { label: "Vendor Earnings",    value: fmt(summary.vendorEarned),   icon: FiTrendingUp  },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
              >
                <Icon className="w-4 h-4 text-gray-300 mb-3" />
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          <hr className="border-gray-200 mb-6" />

          {/* Milestone */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.13 }} className="mb-6">
            <MilestoneBar milestone={milestone} />
          </motion.div>

          <hr className="border-gray-200 mb-6" />

          {/* Tabs + tables */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>

            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-1 w-fit">
              {(["vendors", "customers"] as Tab[]).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={active ? { backgroundColor: BRAND, color: "white" } : { color: "#6b7280" }}
                  >
                    {t === "vendors" ? `Vendors (${summary.totalVendors})` : `Customers (${summary.totalCustomers})`}
                  </button>
                );
              })}
            </div>

            {/* Vendors table */}
            {tab === "vendors" && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
                {vendors.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiUsers className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">No vendors yet</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Share your referral link. You earn commission when vendors join, get a product approved, and make their first sale.
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(referralLink)}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ color: BRAND, borderColor: `${BRAND}30` }}
                    >
                      <FiShare2 className="w-3.5 h-3.5" /> Copy referral link
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">#</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">Vendor</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">Stage</th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-300 uppercase tracking-wider">Earned</th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-300 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v, i) => <VendorRow key={v._id} v={v} idx={i} />)}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Customers table */}
            {tab === "customers" && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
                {customers.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiShoppingBag className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">No customers yet</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Share your link with buyers. You earn 3% on each of their first 3 completed orders.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">Orders</th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-300 uppercase tracking-wider">Earned</th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-300 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => <CustomerRow key={c._id} c={c} />)}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Commission info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3">How commissions work</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-1 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: BRAND }} />
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-0.5">Vendors</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      40% when their first product is approved, 60% when they make their first sale. Rate: ₦150 / ₦250 / ₦300 depending on your total vendor count.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 rounded-full shrink-0 mt-0.5 bg-gray-300" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-0.5">Customers</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      3% of each order total on a referred customer's first 3 completed orders only. Order must be fully delivered to count.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </main>
      <FooterMini />
    </>
  );
}
