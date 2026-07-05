"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";
import { Spinner } from "@/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    if (next.every((d) => d) && char) handleVerify(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerify(pasted);
  };

  const handleVerify = async (otp: string) => {
    setError(""); setSuccess("");
    if (!email) { setError("Email not found. Please sign up again."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Invalid or expired code."); return; }
      setSuccess("Email verified! Redirecting…");
      setTimeout(() => router.push("/login"), 1400);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResending(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Failed to resend code."); return; }
      setSuccess("A new code was sent to your email.");
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  };

  const otp = digits.join("");

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
        <Link href="/signup" className="absolute top-5 right-5 z-10 text-gray-600 text-sm font-medium hover:opacity-80 transition-opacity">
          Back
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <FiMail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">Check your inbox</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs">
            We sent a 6-digit code to{" "}
            <span className="text-dark font-medium">{email || "your email"}</span>
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="flex-1 bg-white px-5 sm:px-6 pt-6 pb-10 max-w-md w-full mx-auto"
      >
        <AnimateError msg={error} />
        <AnimateError msg={success} type="success" />

        {/* OTP boxes */}
        <motion.div variants={fadeUp} className="flex justify-center gap-2 sm:gap-3 mt-4 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 outline-none transition-all ${
                d
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 text-dark focus:border-primary focus:bg-white"
              }`}
            />
          ))}
        </motion.div>

        <motion.button
          variants={fadeUp}
          type="button"
          disabled={loading || otp.length < OTP_LENGTH}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVerify(otp)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? "Verifying…" : "Verify Email"}
        </motion.button>

        <motion.div variants={fadeUp} className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive a code?{" "}
            {cooldown > 0 ? (
              <span className="text-gray-400">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline disabled:opacity-60"
              >
                {resending && <Spinner className="w-3.5 h-3.5" />}
                {resending ? "Sending…" : "Resend code"}
              </button>
            )}
          </p>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-4">
          Wrong email?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">Go back</Link>
        </motion.p>
      </motion.div>

      <div className="flex-shrink-0">
        <img src="/auth_rec2.svg" alt="" className="w-full block" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
