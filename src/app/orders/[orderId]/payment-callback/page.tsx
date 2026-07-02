"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { useCart } from "@/lib/CartContext";
import { FiLoader, FiCheck, FiAlertCircle, FiArrowRight } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}

export default function PaymentCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  // Flutterwave redirects with ?status=successful&tx_ref=<ref>&transaction_id=<id>
  // Paystack redirects with ?reference=<ref>&trxref=<ref>
  const transaction_id = searchParams.get("transaction_id");
  const flwStatus = searchParams.get("status");
  const isFlutterwave = !!(transaction_id || flwStatus === "successful" || flwStatus === "cancelled");

  const reference = (params.orderId as string)
    || searchParams.get("tx_ref")
    || searchParams.get("reference")
    || searchParams.get("trxref")
    || "";

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Confirming your payment…");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) { setStatus("failed"); setMessage("Invalid payment reference."); return; }

    const confirm = async () => {
      const token = getToken();
      if (!token) { setStatus("failed"); setMessage("Session expired. Please log in and check your orders."); return; }
      try {
        const body: Record<string, string> = {
          provider: isFlutterwave ? "flutterwave" : "paystack",
        };
        if (transaction_id) body.transaction_id = transaction_id;

        const res = await fetch(`${API_BASE}/orders/confirm-payment/${reference}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.success) {
          sessionStorage.removeItem("affiliateCode");
          await clearCart();
          const id = json.data?.order?.orderNumber || json.data?.order?._id || reference;
          setOrderId(id);
          setStatus("success");
          setMessage("Payment confirmed! Your order has been placed.");
          setTimeout(() => router.push(`/orders/${id}?confirmed=true`), 2500);
        } else {
          setStatus("failed");
          setMessage(json.message || "Could not confirm your payment.");
        }
      } catch {
        setStatus("failed");
        setMessage("Something went wrong. Please check your orders or contact support.");
      }
    };
    confirm();
  }, [reference, isFlutterwave, transaction_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusConfig = {
    loading: {
      bg: "bg-pink-50",
      icon: <FiLoader className="w-8 h-8 text-primary animate-spin" />,
      title: "Processing Payment",
    },
    success: {
      bg: "bg-green-50",
      icon: <FiCheck className="w-8 h-8 text-green-500" strokeWidth={3} />,
      title: "Payment Successful!",
    },
    failed: {
      bg: "bg-red-50",
      icon: <FiAlertCircle className="w-8 h-8 text-red-500" />,
      title: "Payment Issue",
    },
  };

  const cfg = statusConfig[status];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center py-16 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 max-w-sm w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className={`w-16 h-16 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-5`}
            >
              {cfg.icon}
            </motion.div>

            <h1 className="text-xl font-bold text-dark mb-2">{cfg.title}</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>

            {status === "success" && (
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <FiLoader className="w-3 h-3 animate-spin" /> Redirecting to your order…
              </p>
            )}

            {status === "failed" && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/orders/${reference}`)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  View My Order <FiArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full border border-gray-200 text-sm text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <FooterMini />
    </>
  );
}
