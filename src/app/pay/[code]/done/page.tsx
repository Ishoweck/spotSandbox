"use client";

// Paystack returns here (?reference=...) after a payment-link payment.
// The backend verifies with Paystack and records the payment if the webhook
// hasn't already. Rendered as a printable receipt.

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiAlertCircle, FiCheck, FiCopy, FiPrinter } from "react-icons/fi";
import { Spinner } from "@/components/Spinner";
import { PayFooter, PayTopBar, VendorAvatar, naira } from "../ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Result {
  paid: boolean;
  reference: string;
  amount: number;
  title?: string;
  vendorName?: string;
  vendorSlug?: string;
  vendorLogo?: string;
  paidAt?: string;
}

function PayDoneContent() {
  const params = useParams();
  const search = useSearchParams();
  const code = String(params?.code || "");
  const reference = search.get("reference") || search.get("trxref") || "";

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    let attempts = 0;
    // The charge can take a few seconds to settle, so retry a few times
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
        if (attempts < 5) {
          setTimeout(check, 2500);
          return;
        }
        setResult(json.data || null);
      } catch {
        if (attempts < 5) {
          setTimeout(check, 2500);
          return;
        }
      }
      setLoading(false);
    };
    check();
  }, [reference]);

  const copyReference = async () => {
    if (!result?.reference) return;
    await navigator.clipboard.writeText(result.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paidAt = result?.paidAt ? new Date(result.paidAt) : null;
  const vendor = result?.vendorName ? { businessName: result.vendorName, logo: result.vendorLogo } : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f8] print:bg-white">
      <PayTopBar />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="rounded-2xl border border-gray-200/70 bg-white p-10 text-center">
            <div className="flex justify-center"><Spinner /></div>
            <h1 className="mt-5 text-lg font-semibold text-gray-900">Confirming your payment</h1>
            <p className="mt-1 text-sm text-gray-500">This usually takes a few seconds. Please don&apos;t close this page.</p>
          </div>
        ) : result?.paid ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white print:border-gray-300">
            <div className="px-6 pt-10 pb-8 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <FiCheck size={28} strokeWidth={3} />
              </div>
              <p className="mt-5 text-sm font-medium text-gray-500">Payment successful</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-gray-900">{naira(result.amount)}</p>
              {vendor && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-3">
                  <VendorAvatar vendor={vendor} size={24} />
                  <span className="text-sm text-gray-700">to <span className="font-medium text-gray-900">{vendor.businessName}</span></span>
                </div>
              )}
            </div>

            {/* Perforation */}
            <div className="relative h-0 border-t border-dashed border-gray-200">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#f7f7f8] print:hidden" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#f7f7f8] print:hidden" />
            </div>

            <dl className="space-y-3.5 px-6 py-6 text-sm sm:px-8">
              {result.title && <Row label="Payment for" value={result.title} />}
              {paidAt && (
                <Row
                  label="Date"
                  value={paidAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                />
              )}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">Reference</dt>
                <dd className="flex items-center gap-2 font-mono text-[13px] font-medium text-gray-900">
                  {result.reference}
                  <button onClick={copyReference} className="text-gray-400 hover:text-gray-700 print:hidden" title="Copy reference">
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                </dd>
              </div>
              <Row label="Status" value="Paid" valueClassName="text-emerald-700" />
            </dl>

            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 text-center text-xs text-gray-500 sm:px-8">
              A copy of this receipt has been sent to your email.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200/70 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <FiAlertCircle size={26} />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-gray-900">We couldn&apos;t confirm this payment</h1>
            <p className="mt-1 text-sm text-gray-500">
              If you were charged, your receipt will arrive by email shortly. Otherwise, you can try again.
            </p>
            <Link
              href={`/pay/${code}`}
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Try again
            </Link>
          </div>
        )}

        {result?.paid && (
          <div className="mt-5 flex gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiPrinter size={16} /> Print receipt
            </button>
            {result.vendorSlug && (
              <Link
                href={`/shops/${result.vendorSlug}`}
                className="flex flex-1 items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Visit store
              </Link>
            )}
          </div>
        )}
      </main>
      <PayFooter />
    </div>
  );
}

function Row({ label, value, valueClassName = "text-gray-900" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className={`text-right font-medium ${valueClassName}`}>{value}</dd>
    </div>
  );
}

export default function PayDonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
          <Spinner />
        </div>
      }
    >
      <PayDoneContent />
    </Suspense>
  );
}
