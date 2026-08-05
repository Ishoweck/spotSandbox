"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiChevronDown, FiSmartphone, FiGift } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";
import { useGoogleSignIn } from "@/lib/useGoogleSignIn";
import { detectOS, openAppOrStore, APP_STORE_URL, PLAY_STORE_URL, type OS } from "@/lib/appStore";
import { Spinner } from "@/components/Spinner";
import { fbEvent } from "@/lib/fbpixel";
import { ttqEvent } from "@/lib/ttpixel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const hearOptions = [
  "Social Media", "Google Search", "Friend / Referral",
  "Blog / Article", "Advertisement", "Other",
];

const appButtons = [
  {
    label: "Google Play",
    href: PLAY_STORE_URL,
    path: "M3.176 3.09a1.5 1.5 0 0 0-.176.713v16.394c0 .257.063.5.176.713L13.338 12 3.176 3.09zm1.054-.854L14.89 11.15l2.95-2.95L5.665 1.448a1.49 1.49 0 0 0-1.435-.212zM18.95 9.31l-3.06 3.06 3.06 3.06 2.56-1.37a1.5 1.5 0 0 0 0-2.72l-2.56-1.37-.56.34h.56zm-4.16 4.16L4.23 22.764a1.49 1.49 0 0 0 1.435-.212l12.175-6.752-3.05-2.33z",
    os: "android" as OS,
  },
  {
    label: "App Store",
    href: APP_STORE_URL,
    path: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
    os: "ios" as OS,
  },
];

function getStrength(pw: string) {
  if (!pw) return null;
  if (pw.length < 6) return { label: "Weak", width: "w-1/3", color: "bg-red-400" };
  const score = [/[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: "Weak",   width: "w-1/3", color: "bg-red-400" };
  if (score === 2) return { label: "Medium", width: "w-2/3", color: "bg-amber-400" };
  return              { label: "Strong",  width: "w-full", color: "bg-green-500" };
}

function AnimateError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3"
    >
      {error}
    </motion.div>
  );
}

/** Shown when vendor tab is selected — detects OS and routes to app / store */
function VendorAppDownload() {
  const [os, setOs] = useState<OS>("desktop");

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const isMobile = os === "ios" || os === "android";
  const primaryBtn = os === "ios" ? appButtons[1] : appButtons[0];

  return (
    <motion.div
      key="vendor-app"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center py-6 gap-5"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
        <FiSmartphone className="w-10 h-10 text-primary" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-dark mb-1.5">Vendor registration is on the app</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Create and manage your storefront from the Vendorspot mobile app. Download it{isMobile ? " to get started" : " on your phone"}.
        </p>
      </div>

      {/* Mobile: single prominent button + secondary link */}
      {isMobile ? (
        <div className="w-full flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => openAppOrStore(os)}
            className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full px-8 py-3.5 text-sm w-full transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
              <path d={primaryBtn.path} />
            </svg>
            {os === "ios" ? "Open / Download on App Store" : "Open / Download on Google Play"}
          </motion.button>
          <p className="text-[11px] text-gray-400">
            Already installed?{" "}
            <button
              onClick={() => openAppOrStore(os)}
              className="text-primary font-medium hover:underline"
            >
              Open the app
            </button>
          </p>
        </div>
      ) : (
        /* Desktop: show both store buttons */
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {appButtons.map(({ label, href, path }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl px-4 py-3 text-sm font-semibold hover:bg-primary hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0"><path d={path} /></svg>
              {label}
            </motion.a>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
        Set up your store, list products, manage orders, and track earnings — all from your phone.
      </p>
    </motion.div>
  );
}

export default function SignupPage() {
  const [role, setRole] = useState<"vendor" | "customer">("vendor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hear, setHear] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralLocked, setReferralLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleSignIn();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || params.get("referral") || params.get("referralCode")
      || sessionStorage.getItem("affiliateCode");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setReferralLocked(true);
    }
  }, []);

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password) { setError("Please fill in all required fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone || undefined, password, role: "customer", referralCode: referralCode || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Registration failed. Please try again."); return; }
      fbEvent("CompleteRegistration");
      ttqEvent("CompleteRegistration");
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">

      {/* Header arch */}
      <div className="relative flex-shrink-0" style={{ height: "max(170px, 28.06vw)" }}>
        <img src="/auth_rec1.svg" alt="" className="absolute inset-0 w-full h-full object-fill block" aria-hidden="true" />
        <div className="absolute top-5 left-5 z-10">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/VLogo.svg" alt="Vendorspot" className="h-7 w-auto" />
          </Link>
        </div>
        <Link href="/" className="absolute top-5 right-5 z-10 text-gray-600 text-sm font-medium hover:opacity-80 transition-opacity">
          Back
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">
            {role === "vendor" ? "Sell on Vendorspot" : "Create your Account"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {role === "vendor"
              ? "Join thousands of vendors growing their business."
              : "Join a trusted marketplace for buyers, sellers, affiliates, and creators."}
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="flex-1 bg-white px-5 sm:px-6 pt-4 pb-10 max-w-md w-full mx-auto"
      >
        {/* Role toggle */}
        <motion.div variants={fadeUp} className="flex rounded-full overflow-hidden border border-gray-200 mb-6 p-1 gap-1">
          {(["vendor", "customer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                role === r ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {r === "vendor" ? "Sign up as Vendor" : "Sign up to buy"}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {role === "vendor" ? (
            <VendorAppDownload key="vendor" />
          ) : (
            <motion.form
              key="customer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <AnimateError error={error || googleError} />

              {/* Full Name */}
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  autoComplete="email"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  autoComplete="tel"
                />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Password strength: <span className="font-medium text-gray-600">{strength.label}</span></p>
                  </div>
                )}
              </div>

              {/* How did you hear — skipped when they arrived via a referral link, since we already know */}
              {!referralCode && (
                <div className="relative">
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={hear} onChange={(e) => setHear(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors appearance-none"
                  >
                    <option value="" disabled>How did you hear about Vendorspot?</option>
                    {hearOptions.map((o) => <option key={o} value={o} className="text-dark">{o}</option>)}
                  </select>
                </div>
              )}

              {/* Referral / Ambassador Code */}
              <div className="relative">
                <FiGift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text" value={referralCode} onChange={(e) => !referralLocked && setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Referral code (optional)"
                  readOnly={referralLocked}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-dark placeholder-gray-400 focus:outline-none transition-colors font-mono tracking-wider ${referralLocked ? "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500" : "border-gray-200 bg-gray-50 focus:border-primary focus:bg-white"}`}
                  autoComplete="off"
                  maxLength={20}
                />
              </div>

              <motion.button
                type="submit" disabled={loading || googleLoading} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60 mt-1"
              >
                {loading && <Spinner />}
                {loading ? "Creating account…" : "Create account"}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 whitespace-nowrap">or sign up with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google sign-up */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                disabled={googleLoading || loading}
                onClick={async () => {
                  const data = await signInWithGoogle("customer");
                  if (data) window.location.href = "/";
                }}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Signing up…" : "Continue with Google"}
              </motion.button>

              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                By continuing, I agree to the Vendorspot{" "}
                <Link href="/terms" className="underline hover:text-gray-600">General Terms of Use</Link>
                {" "}&amp;{" "}
                <Link href="/privacy" className="underline hover:text-gray-600">General Privacy Policy</Link>.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Skipped for vendor signups (app-download prompt, not a form) and referral-link arrivals (fresh invites) */}
        {role === "customer" && !referralCode && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          </p>
        )}
      </motion.div>

      {/* Bottom */}
      <div className="flex-shrink-0">
        <img src="/auth_rec2.svg" alt="" className="w-full block" />
      </div>
    </div>
  );
}
