"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";
import { Spinner } from "@/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const OTP_LENGTH = 6;

function getStrength(pw: string) {
  if (!pw) return null;
  if (pw.length < 6) return { label: "Weak", width: "w-1/3", color: "bg-red-400" };
  const score = [/[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: "Weak",   width: "w-1/3", color: "bg-red-400" };
  if (score === 2) return { label: "Medium", width: "w-2/3", color: "bg-amber-400" };
  return              { label: "Strong",  width: "w-full", color: "bg-green-500" };
}

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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigitChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const strength = getStrength(password);
  const code = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (code.length < OTP_LENGTH) { setError("Please enter the full 6-digit code."); return; }
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Invalid or expired code."); return; }
      setSuccess("Password reset successful! Redirecting to login…");
      setTimeout(() => router.push("/login"), 1600);
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
        <Link href="/forgot-password" className="absolute top-5 right-5 z-10 text-gray-600 text-sm font-medium hover:opacity-80 transition-opacity">
          Back
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <FiLock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs">
            Enter the code sent to{" "}
            <span className="text-dark font-medium">{email || "your email"}</span>
            {" "}and choose a new password.
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="flex-1 bg-white px-5 sm:px-6 pt-6 pb-10 max-w-md w-full mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimateError msg={error} />
          <AnimateError msg={success} type="success" />

          {/* Code boxes */}
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold text-gray-500 mb-2">Reset Code</p>
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 outline-none transition-all ${
                    d
                      ? "border-primary text-primary bg-primary/5"
                      : "border-gray-200 text-dark focus:border-primary focus:bg-white"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* New password */}
          <motion.div variants={fadeUp}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <p className="text-[11px] text-gray-400 mt-1">
                  Password strength: <span className="font-medium text-gray-600">{strength.label}</span>
                </p>
              </div>
            )}
          </motion.div>

          {/* Confirm password */}
          <motion.div variants={fadeUp}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-gray-50 text-sm text-dark placeholder-gray-400 focus:outline-none focus:bg-white transition-colors ${
                  confirm && confirm !== password ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary"
                }`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
            )}
          </motion.div>

          <motion.button
            variants={fadeUp} type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60"
          >
            {loading && <Spinner />}
            {loading ? "Resetting…" : "Reset Password"}
          </motion.button>

          <motion.div variants={fadeUp} className="text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Back to Login
            </Link>
          </motion.div>
        </form>
      </motion.div>

      <div className="flex-shrink-0">
        <img src="/auth_rec2.svg" alt="" className="w-full block" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
