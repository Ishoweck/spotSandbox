"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";
import { consumeExpiredFlag } from "@/lib/auth-fetch";
import { Spinner } from "@/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showActivationCta, setShowActivationCta] = useState(false);
  const [activationSent, setActivationSent] = useState(false);
  const [activationLoading, setActivationLoading] = useState(false);

  useEffect(() => {
    if (consumeExpiredFlag()) setSessionExpired(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowActivationCta(false);
    setActivationSent(false);
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg: string = json.message || "Invalid email or password.";
        if (msg === "Please verify your email first" || msg === "Account is not active") {
          setError(msg === "Account is not active"
            ? "Your account is not active yet."
            : "Your email address hasn't been verified yet.");
          setShowActivationCta(true);
        } else {
          setError(msg);
        }
        return;
      }
      const token = json.data?.accessToken || json.data?.token || json.accessToken || json.token;
      if (!token) { setError("Login failed — no token received."); return; }
      localStorage.setItem("vendorspot_token", token);
      if (json.data?.user) localStorage.setItem("vendorspot_user", JSON.stringify(json.data.user));
      const isAmbassador = json.data?.user?.affiliateCode?.startsWith("AMB-");
      window.location.href = isAmbassador ? "/ambassador-dashboard" : "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendActivation = async () => {
    if (!email) { setError("Please enter your email address first."); return; }
    setActivationLoading(true);
    try {
      await fetch(`${API_BASE}/auth/resend-activation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setActivationSent(true);
      setShowActivationCta(false);
      setError("");
    } catch {
      setError("Failed to send activation email. Please try again.");
    } finally {
      setActivationLoading(false);
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">Log in to your account</h1>
          <p className="text-gray-500 text-sm mt-2">Welcome back! Please enter your details.</p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 bg-white px-5 sm:px-6 pt-2 pb-10 max-w-md w-full mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {sessionExpired && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p>Your session has expired. Please log in again to continue.</p>
            </motion.div>
          )}
          <AnimateError error={error} />
          {showActivationCta && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <p className="mb-2">Send an activation link to <strong>{email}</strong> to get access.</p>
              <button type="button" onClick={handleSendActivation} disabled={activationLoading}
                className="font-semibold text-primary hover:underline disabled:opacity-60">
                {activationLoading ? "Sending…" : "Send activation email →"}
              </button>
            </motion.div>
          )}
          {activationSent && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
              Activation link sent! Check your email and click the link to activate your account.
            </motion.div>
          )}

          {/* Email */}
          <motion.div variants={fadeUp}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                autoComplete="email"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeUp}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot password?</Link>
            </div>
          </motion.div>

          <motion.button
            variants={fadeUp}
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading && <Spinner />}
            {loading ? "Signing in…" : "Sign In"}
          </motion.button>
        </form>

        {/* Divider */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mt-10 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 whitespace-nowrap">or sign in with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </motion.div>

        {/* Social buttons */}
        <motion.div variants={fadeUp} className="space-y-3">
          <motion.button
            type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </motion.button>

          <motion.button
            type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
          >
            <svg width="17" height="18" viewBox="0 0 17 20" fill="currentColor">
              <path d="M14.045 10.763c-.02-2.132 1.743-3.162 1.823-3.213-1-1.456-2.548-1.655-3.092-1.674-1.31-.134-2.571.775-3.237.775-.666 0-1.683-.757-2.77-.736-1.414.02-2.727.822-3.452 2.083-1.483 2.564-.378 6.345 1.058 8.42.7 1.02 1.534 2.16 2.626 2.12 1.059-.043 1.458-.682 2.737-.682 1.279 0 1.643.682 2.76.66 1.138-.018 1.855-1.034 2.546-2.06a11.04 11.04 0 001.154-2.38c-.027-.012-2.21-.845-2.233-3.313zM11.82 4.13c.578-.7.97-1.669.863-2.636-.836.033-1.848.556-2.447 1.257-.537.623-.009 1.606.872 1.606.317-.001.641-.11.712-.227z"/>
            </svg>
            Sign in with Apple
          </motion.button>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
        </motion.p>

        <motion.p variants={fadeUp} className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
        </motion.p>
      </motion.div>

      {/* Bottom */}
      <div className="flex-shrink-0">
        <img src="/auth_rec2.svg" alt="" className="w-full block" />
      </div>
    </div>
  );
}

function AnimateError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3"
    >
      {error}
    </motion.div>
  );
}
