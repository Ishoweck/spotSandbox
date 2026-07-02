"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { fadeUp } from "@/lib/motion";
import {
  FiMail, FiLock, FiPackage, FiTrash2, FiCheck,
  FiAlertCircle, FiEye, FiEyeOff, FiLogOut, FiChevronRight, FiUser, FiMapPin,
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT — Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role?: string;
  location?: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}

type Tab = "profile" | "security";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser]             = useState<StoredUser | null>(null);
  const [tab, setTab]               = useState<Tab>("profile");

  /* Profile */
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [location, setLocation]     = useState("");
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  /* Password */
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwMsg, setPwMsg]             = useState<{ ok: boolean; text: string } | null>(null);
  const [pwLoading, setPwLoading]     = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    const raw = localStorage.getItem("vendorspot_user");
    if (raw) {
      try {
        const u = JSON.parse(raw) as StoredUser;
        setUser(u);
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setLocation(u.location || "");
      } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ firstName, lastName, location }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed.");
      const updated = { ...user, firstName, lastName, location };
      localStorage.setItem("vendorspot_user", JSON.stringify(updated));
      setUser(updated);
      setProfileMsg({ ok: true, text: "Profile updated successfully." });
    } catch (err: unknown) {
      setProfileMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "New passwords don't match." }); return; }
    if (newPw.length < 6)    { setPwMsg({ ok: false, text: "Password must be at least 6 characters." }); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Password change failed.");
      setPwMsg({ ok: true, text: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorspot_token");
    localStorage.removeItem("vendorspot_user");
    window.location.href = "/home";
  };

  if (!user) return null;

  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
    user.email?.charAt(0).toUpperCase() || "U";

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white";
  const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-24 px-6 text-center overflow-hidden" style={{ backgroundColor: "#d7004b" }}>
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white/25 overflow-hidden bg-white/20 text-white text-2xl font-extrabold flex items-center justify-center">
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : initials}
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.07 }}
            className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            {user.firstName} {user.lastName}
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}
            className="text-sm text-white/55 flex items-center justify-center gap-1.5">
            <FiMail className="w-3.5 h-3.5" />{user.email}
          </motion.p>
          {user.location && (
            <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
              className="text-xs text-white/40 flex items-center justify-center gap-1 mt-1">
              <FiMapPin className="w-3 h-3" />{user.location}
            </motion.p>
          )}
          <motion.button variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.17 }}
            onClick={handleLogout}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">
            <FiLogOut className="w-3.5 h-3.5" /> Log Out
          </motion.button>
        </div>
      </section>

      <main className="bg-gray-50 min-h-screen -mt-6 rounded-t-3xl relative z-10 pt-6 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Tab bar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
            {([
              { id: "profile",  label: "Profile",  icon: FiUser },
              { id: "security", label: "Password", icon: FiLock },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setProfileMsg(null); setPwMsg(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  tab === id ? "bg-dark text-white shadow-sm" : "text-gray-400 hover:text-dark"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </motion.div>

          {/* Form card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 shadow-sm">

            {/* Profile tab */}
            {tab === "profile" && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input required type="text" value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input disabled type="email" value={user.email || ""}
                    className={`${inputCls} !bg-gray-50 text-gray-400 cursor-not-allowed`} />
                  <p className="text-[11px] text-gray-400 mt-1 ml-0.5">Email cannot be changed.</p>
                </div>
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1.5"><FiMapPin className="w-3 h-3" /> State / Location</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select your state…</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {profileMsg && <Feedback ok={profileMsg.ok} text={profileMsg.text} />}
                <button type="submit" disabled={profileLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                  {profileLoading ? "Saving…" : "Save Changes"}
                </button>
              </form>
            )}

            {/* Password tab */}
            {tab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <PwField
                  label="Current Password" value={currentPw} show={showCurrent}
                  onToggle={() => setShowCurrent(v => !v)}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  inputCls={inputCls} labelCls={labelCls}
                />
                <PwField
                  label="New Password" value={newPw} show={showNew}
                  onToggle={() => setShowNew(v => !v)}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 6 characters"
                  inputCls={inputCls} labelCls={labelCls}
                />
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input required type="password" value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password" className={inputCls} />
                </div>
                {pwMsg && <Feedback ok={pwMsg.ok} text={pwMsg.text} />}
                <button type="submit" disabled={pwLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                  {pwLoading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            <Link href="/orders"
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FiPackage className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-dark">My Orders</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/delete-account"
              className="flex items-center justify-between px-5 py-4 hover:bg-red-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                  <FiTrash2 className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-red-500">Delete Account</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-red-200" />
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.14 }}
            className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5 pt-1">
            <FiLock className="w-3 h-3" /> Your data is private and securely stored.
          </motion.p>

        </div>
      </main>
      <FooterMini />
    </>
  );
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
      {ok ? <FiCheck className="w-4 h-4 shrink-0" /> : <FiAlertCircle className="w-4 h-4 shrink-0" />}
      {text}
    </div>
  );
}

function PwField({ label, value, show, onToggle, onChange, placeholder, inputCls, labelCls }: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; inputCls: string; labelCls: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input required type={show ? "text" : "password"} value={value}
          onChange={onChange} placeholder={placeholder} className={`${inputCls} pr-11`} />
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors">
          {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
