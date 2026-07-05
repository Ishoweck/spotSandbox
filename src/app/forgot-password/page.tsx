"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";
import { Spinner } from "@/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function AnimateError({ msg, type = "error" }: { msg: string; type?: "error" | "success" }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-xl px-4 py-3 ${
        type === "success"
          ? "bg-green-50 border border-green-100 text-green-700"
          : "bg-red-50 border border-red-100 text-red-600"
      }`}
    >
      {msg}
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Failed to send reset code."); return; }
      setSent(true);
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
        <Link href="/login" className="absolute top-5 right-5 z-10 text-gray-600 text-sm font-medium hover:opacity-80 transition-opacity">
          Back
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs">
            No worries — enter your email and we&apos;ll send you a reset code.
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="flex-1 bg-white px-5 sm:px-6 pt-6 pb-10 max-w-md w-full mx-auto"
      >
        {sent ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <FiMail className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-dark mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              If <span className="font-medium text-dark">{email}</span> is registered, you&apos;ll receive a reset code shortly.
            </p>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm text-center transition-colors block"
            >
              Enter Reset Code
            </Link>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <FiArrowLeft className="w-4 h-4" /> Try a different email
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimateError msg={error} />

            <motion.div variants={fadeUp}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </motion.div>

            <motion.button
              variants={fadeUp} type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60 mt-1"
            >
              {loading && <Spinner />}
              {loading ? "Sending…" : "Send Reset Code"}
            </motion.button>

            <motion.div variants={fadeUp} className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                <FiArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </motion.div>
          </form>
        )}
      </motion.div>

      <div className="flex-shrink-0">
        <img src="/auth_rec2.svg" alt="" className="w-full block" />
      </div>
    </div>
  );
}
