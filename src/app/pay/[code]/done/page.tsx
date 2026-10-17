"use client";

// Paystack returns here (?reference=...) after a payment-link payment.
// The backend verifies with Paystack and records the payment if the webhook
// hasn't already.

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import FooterMini from "@/components/FooterMini";
import { Spinner } from "@/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Result {
  paid: boolean;
  reference: string;
  amount: number;
  title?: string;
  vendorName?: string;
  paidAt?: string;
}

function PayDoneContent() {
  const params = useParams();
  const search = useSearchParams();
  const code = String(params?.code || "");
  const reference = search.get("reference") || search.get("trxref") || "";

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    let attempts = 0;
    // The charge can take a few seconds to settle, so retry a couple of times
    const check = async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE}/payment-links/public/verify/${reference}`);
        const json = await res.json();
        if (json.success && json.data?.paid) {
          setResult(json.data);
          setLoading(false);
          return;
        }
        if (attempts < 4) {
          setTimeout(check, 2500);
          return;
        }
        setResult(json.data || null);
      } catch {
        if (attempts < 4) {
          setTimeout(check, 2500);
          return;
        }
      }
      setLoading(false);
    };
    check();
  }, [reference]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          {loading ? (
            <>
              <Spinner />
              <p className="text-sm text-gray-500 mt-3">Confirming your payment...</p>
            </>
          ) : result?.paid ? (
            <>
              <FiCheckCircle className="mx-auto text-green-500 mb-3" size={44} />
              <h1 className="text-xl font-bold text-gray-900 mb-1">Payment successful</h1>
              <p className="text-sm text-gray-600 mb-5">
                You paid <strong>₦{Number(result.amount).toLocaleString()}</strong>
                {result.vendorName ? <> to <strong>{result.vendorName}</strong></> : null}
                {result.title ? <> for &ldquo;{result.title}&rdquo;</> : null}.
              </p>
              <div className="text-left text-sm border-t border-b border-gray-100 py-3 mb-5">
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-semibold text-gray-900">{result.reference}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">A receipt has been sent to your email. You can close this page.</p>
            </>
          ) : (
            <>
              <FiAlertCircle className="mx-auto text-amber-500 mb-3" size={44} />
              <h1 className="text-xl font-bold text-gray-900 mb-1">Payment not confirmed</h1>
              <p className="text-sm text-gray-600 mb-5">
                We could not confirm this payment. If you were charged, you will receive a receipt by email shortly.
              </p>
              <Link href={`/pay/${code}`} className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl">
                Try again
              </Link>
            </>
          )}
        </div>
      </main>
      <FooterMini />
    </div>
  );
}

export default function PayDonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>}>
      <PayDoneContent />
    </Suspense>
  );
}
