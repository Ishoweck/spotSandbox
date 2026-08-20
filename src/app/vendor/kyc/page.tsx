"use client";

// ============================================================
// VENDOR KYC — NIN UPLOAD PAGE (WEB)
// Landing page for the "upload your NIN" email. Lets vendors on
// desktop upload their NIN image without having to install the app.
// Orphan-verified vendors (auto-verified by Dojah with no image on
// file) see a red action banner; everyone else sees their current
// status. Uses /upload/kyc-document to hit Cloudinary then
// /vendor/kyc/upload to persist the {type, documentUrl} pair.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiUpload, FiCheck, FiAlertCircle, FiClock, FiArrowLeft, FiFileText } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { Spinner } from "@/components/Spinner";
import { authFetch, getToken } from "@/lib/auth-fetch";
import { fadeUp } from "@/lib/motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface KYCDocument {
  type: string;
  documentUrl: string;
  verificationStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

interface VendorProfile {
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
  businessName?: string;
  kycDocuments?: KYCDocument[];
  ninVerification?: {
    attemptedAt?: string;
    autoVerified?: boolean;
  };
}

const isNinDocMissing = (docs: KYCDocument[] = []): boolean => {
  const nin = docs.find((d) => d.type === "NIN");
  if (!nin) return true;
  const url = (nin.documentUrl || "").trim();
  return !url || url === "nin-lookup";
};

export default function VendorKYCPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login?next=/vendor/kyc");
      return;
    }
    void fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`${API_BASE}/vendor/profile`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMsg({ ok: false, text: json.message || "Could not load your vendor profile." });
        return;
      }
      const p = json.data?.vendorProfile || json.data;
      setProfile(p);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Network error." });
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setMsg({ ok: false, text: "File too large — please choose an image under 8MB." });
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    setMsg(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMsg({ ok: false, text: "Please choose a file first." });
      return;
    }
    setUploading(true);
    setMsg(null);
    try {
      // Step 1 — upload the file to Cloudinary via backend
      const form = new FormData();
      form.append("document", selectedFile);
      form.append("type", "NIN");

      const token = getToken();
      const uploadRes = await fetch(`${API_BASE}/upload/kyc-document`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.success) {
        throw new Error(uploadJson.message || "Upload failed.");
      }
      const documentUrl = uploadJson.data?.url;
      if (!documentUrl) throw new Error("Upload did not return a URL.");

      // Step 2 — persist the NIN entry on the vendor profile
      const submitRes = await authFetch(`${API_BASE}/vendor/kyc/upload`, {
        method: "POST",
        body: JSON.stringify({ documents: [{ type: "NIN", documentUrl }] }),
      });
      const submitJson = await submitRes.json();
      if (!submitRes.ok || !submitJson.success) {
        throw new Error(submitJson.message || "Could not save your NIN document.");
      }

      setMsg({
        ok: true,
        text: "NIN uploaded successfully. Our team will review and activate your storefront within 24 hours.",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      await fetchProfile();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner />
        </main>
        <FooterMini />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-dark mb-1">Vendor profile not found</h1>
            <p className="text-sm text-gray-500 mb-5">
              {msg?.text || "This page is only available to vendor accounts."}
            </p>
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              <FiArrowLeft className="w-4 h-4" /> Back home
            </Link>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  const kycDocuments = profile.kycDocuments || [];
  const ninDoc = kycDocuments.find((d) => d.type === "NIN");
  const ninMissing = isNinDocMissing(kycDocuments);
  const orphanVerified = profile.verificationStatus === "verified" && ninMissing;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto space-y-4">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-dark mb-3"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back to account
            </Link>
            <h1 className="text-2xl font-extrabold text-dark">NIN Verification</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload a clear photo of your NIN slip or card to activate your storefront.
            </p>
          </motion.div>

          {/* Status banner */}
          {orphanVerified && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-2.5"
            >
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-900">Action needed — upload your NIN</p>
                <p className="text-xs text-red-800 mt-0.5 leading-5">
                  Your account was auto-verified, but your NIN image is missing from our records.
                  Please upload it below so our team can complete your activation.
                </p>
              </div>
            </motion.div>
          )}
          {profile.verificationStatus === "verified" && !orphanVerified && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2.5"
            >
              <FiCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-900">Account verified — you're all set.</p>
            </motion.div>
          )}
          {profile.verificationStatus === "pending" && ninDoc && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-2.5"
            >
              <FiClock className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-bold text-orange-900">Under review — usually within 24 hours.</p>
            </motion.div>
          )}
          {profile.verificationStatus === "rejected" && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-2.5"
            >
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-900">Verification failed — please re-upload.</p>
                {ninDoc?.rejectionReason && (
                  <p className="text-xs text-red-800 mt-0.5">{ninDoc.rejectionReason}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Upload card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Your NIN document
              </p>
              <p className="text-xs text-gray-500 leading-5">
                Accepted: JPG, PNG, or PDF. Max size 8MB. Please make sure the whole document is
                visible and the text is readable.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFilePick}
              className="hidden"
            />

            {previewUrl ? (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="NIN preview" className="w-full max-h-80 object-contain bg-gray-50" />
              </div>
            ) : selectedFile ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
                <FiFileText className="w-6 h-6 text-gray-400" />
                <div className="text-sm">
                  <p className="font-semibold text-dark">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 text-gray-500 text-sm font-semibold py-3.5 rounded-xl hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <FiUpload className="w-4 h-4" />
              {selectedFile ? "Choose a different file" : "Choose NIN file"}
            </button>

            {msg && (
              <div
                className={`flex items-start gap-2 text-sm px-4 py-3 rounded-xl ${
                  msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}
              >
                {msg.ok ? (
                  <FiCheck className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading && <Spinner />}
              {uploading ? "Uploading…" : "Submit NIN for review"}
            </button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="text-center text-[11px] text-gray-400"
          >
            Prefer the app? Open Vendorspot on your phone and go to Store profile → KYC Verification.
          </motion.p>
        </div>
      </main>

      <FooterMini />
    </>
  );
}
