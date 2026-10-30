"use client";

// ============================================================
// VENDOR PAYMENT / CHECKOUT LINK
// Landing page for vendorspotng.com/pay/<code>, shared by vendors on
// WhatsApp, Instagram, etc.
//  - PAYMENT links: buyer enters name/email/phone (+ amount if open) and
//    pays the vendor directly through Paystack. No account needed.
//  - PRODUCT links: shows the product; "Buy now" adds it to the cart and
//    goes through the normal escrow checkout. The link code rides along
//    in sessionStorage so the order gets the checkout-link commission.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiMail,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/Toast";
import { PayFooter, PayTopBar, VendorAvatar, naira, paystackFee } from "./ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Paystack's inline popup, so the buyer pays on top of this page (inside
// WhatsApp / X / Instagram's in-app browser) instead of being sent off to
// checkout.paystack.com. If the script can't load we fall back to the redirect.
const PAYSTACK_INLINE_SRC = "https://js.paystack.co/v2/inline.js";

interface PaystackPopInstance {
  resumeTransaction: (
    accessCode: string,
    callbacks?: {
      onSuccess?: (tx: { reference?: string }) => void;
      onCancel?: () => void;
      onError?: (err: { message?: string }) => void;
    }
  ) => void;
}

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopInstance;
  }
}

let paystackScript: Promise<boolean> | null = null;
const loadPaystackInline = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.PaystackPop) return Promise.resolve(true);
  if (!paystackScript) {
    paystackScript = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = PAYSTACK_INLINE_SRC;
      script.async = true;
      script.onload = () => resolve(!!window.PaystackPop);
      script.onerror = () => {
        paystackScript = null; // allow a retry on the next attempt
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return paystackScript;
};

interface PublicLink {
  link: {
    code: string;
    type: "PAYMENT" | "PRODUCT";
    title: string;
    description?: string;
    amount: number | null;
    status: string;
    available: boolean;
  };
  vendor: { businessName: string; logo?: string; slug?: string } | null;
  product: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    inStock: boolean;
    hasVariants: boolean;
  } | null;
  limits: { min: number; max: number };
}

export default function PayPage() {
  const params = useParams();
  const code = String(params?.code || "");

  const [data, setData] = useState<PublicLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`${API_BASE}/payment-links/public/${code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f8]">
      <PayTopBar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <LoadingSkeleton />
        ) : notFound || !data ? (
          <StateCard
            icon={<FiAlertCircle size={26} />}
            title="This link doesn't exist"
            body="Check the link with the person who sent it to you."
          />
        ) : !data.link.available ? (
          <StateCard
            icon={<FiAlertCircle size={26} />}
            title={data.link.status === "USED" ? "This link has already been paid" : "This link is no longer active"}
            body={`Contact ${data.vendor?.businessName || "the vendor"} for a new link.`}
            vendor={data.vendor}
          />
        ) : data.link.type === "PRODUCT" && data.product ? (
          <ProductCheckout data={data} code={code} />
        ) : (
          <PaymentCheckout data={data} code={code} />
        )}
      </main>
      <PayFooter />
    </div>
  );
}

// ─── Direct payment ──────────────────────────────────────────────────────────

function PaymentCheckout({ data, code }: { data: PublicLink; code: string }) {
  const { link, vendor, limits } = data;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Warm the popup script while the buyer fills the form
  useEffect(() => {
    loadPaystackInline();
  }, []);

  const payAmount = link.amount ?? Number(amount.replace(/,/g, ""));
  const hasAmount = Number.isFinite(payAmount) && payAmount > 0;
  const processingFee = hasAmount ? paystackFee(payAmount) : 0;
  const total = hasAmount ? payAmount + processingFee : 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!link.amount && (!hasAmount || payAmount < limits.min || payAmount > limits.max)) {
      return setError(`Enter an amount between ${naira(limits.min)} and ${naira(limits.max)}.`);
    }
    if (name.trim().split(/\s+/).length < 2) return setError("Please enter your first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email address.");
    if (phone && !/^(\+234|0)[789]\d{9}$/.test(phone.trim())) return setError("Please enter a valid Nigerian phone number.");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/payment-links/public/${code}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          ...(phone.trim() && { phone: phone.trim() }),
          ...(!link.amount && { amount: payAmount }),
          ...(note.trim() && { note: note.trim() }),
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.authorization_url) {
        const { reference, access_code: accessCode, authorization_url: authUrl } = json.data;
        if (accessCode && (await loadPaystackInline()) && window.PaystackPop) {
          try {
            new window.PaystackPop().resumeTransaction(accessCode, {
              onSuccess: (tx) => router.push(`/pay/${code}/done?reference=${encodeURIComponent(tx?.reference || reference)}`),
              onCancel: () => setSubmitting(false),
              onError: () => {
                window.location.href = authUrl;
              },
            });
            return;
          } catch {
            // fall through to the redirect
          }
        }
        window.location.href = authUrl;
        return;
      }
      setError(json.message || json.errors?.[0]?.msg || "Could not start the payment. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px] lg:gap-10 items-start">
      {/* Summary */}
      <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <VendorAvatar vendor={vendor} size={52} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{vendor?.businessName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FiCheckCircle className="text-emerald-600" size={12} /> Verified vendor on Vendorspot
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Payment for</p>
          <h1 className="mt-1.5 text-2xl sm:text-[28px] font-semibold text-gray-900 leading-tight">{link.title}</h1>
          {link.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{link.description}</p>}
        </div>

        <div className="mt-8 rounded-xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total to pay</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
            {hasAmount ? naira(total) : <span className="text-gray-300">₦0.00</span>}
          </p>
          {!link.amount && !hasAmount && (
            <p className="mt-1 text-xs text-gray-500">Enter the amount agreed with the vendor.</p>
          )}
          {hasAmount && (
            <dl className="mt-4 space-y-2 border-t border-gray-200/70 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-medium text-gray-900">{naira(payAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Paystack processing fee</dt>
                <dd className="font-medium text-gray-900">{naira(processingFee)}</dd>
              </div>
            </dl>
          )}
        </div>

        <ul className="mt-8 space-y-3 text-sm text-gray-600">
          <TrustItem icon={<FiLock />} text="Payment encrypted and processed by Paystack" />
          <TrustItem icon={<FiCheck />} text="Paying a verified Vendorspot vendor" />
          <TrustItem icon={<FiMail />} text="Receipt sent to your email instantly" />
        </ul>
      </section>

      {/* Form */}
      <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 lg:sticky lg:top-6">
        <form onSubmit={handlePay} noValidate>
          <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
          <p className="text-sm text-gray-500 mt-0.5">No account needed.</p>

          <div className="mt-6 space-y-4">
            {!link.amount && (
              <Field label="Amount">
                <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <span className="pl-3.5 text-gray-500 font-medium">₦</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="0.00"
                    className="w-full bg-transparent px-2 py-3 text-base font-semibold text-gray-900 outline-none"
                  />
                </div>
              </Field>
            )}
            <Field label="Full name">
              <Input value={name} onChange={setName} placeholder="Tolu Adeyemi" autoComplete="name" />
            </Field>
            <Field label="Email address">
              <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" autoComplete="email" />
            </Field>
            <Field label="Phone number" optional>
              <Input value={phone} onChange={setPhone} placeholder="0801 234 5678" type="tel" autoComplete="tel" />
            </Field>
            <Field label="Note to vendor" optional>
              <Input value={note} onChange={setNote} placeholder="e.g. For the 2 perfumes" />
            </Field>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Spinner /> : <FiLock size={16} />}
            {submitting ? "Redirecting to secure payment..." : hasAmount ? `Pay ${naira(total)}` : "Continue to payment"}
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><FiCreditCard /> Card</span>
            <span className="flex items-center gap-1"><FiRefreshCw /> Bank transfer</span>
            <span className="flex items-center gap-1"><FiSmartphone /> USSD</span>
          </div>

          <p className="mt-6 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500">
            This is a direct payment to {vendor?.businessName || "the vendor"}, not a Vendorspot marketplace order, so Buyer
            Protection does not apply. Only pay vendors you know and trust.
          </p>
        </form>
      </section>
    </div>
  );
}

// ─── Product checkout ────────────────────────────────────────────────────────

function ProductCheckout({ data, code }: { data: PublicLink; code: string }) {
  const product = data.product!;
  const { vendor } = data;
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const images = product.images?.length ? product.images : [];
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  const longDescription = (product.description || "").length > 280;

  const handleBuyNow = async () => {
    sessionStorage.setItem("checkoutLinkCode", code);
    // Products with variants need a choice, so send the buyer to the full product page
    if (product.hasVariants) {
      router.push(`/products/${product.slug || product.id}`);
      return;
    }
    setSubmitting(true);
    try {
      await addToCart(product.id, { _id: product.id, name: product.name, price: product.price, images }, 1);
      router.push("/checkout");
    } catch {
      toast("Could not add this item. Please try again.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 items-start">
      {/* Gallery */}
      <section>
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-gray-200/70 bg-white">
          {images[activeImage] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300"><FiPackage size={56} /></div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${i === activeImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Details */}
      <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 lg:sticky lg:top-6">
        <div className="flex items-center gap-2.5">
          <VendorAvatar vendor={vendor} size={32} />
          <div className="min-w-0 text-sm">
            <span className="text-gray-500">Sold by </span>
            <span className="font-semibold text-gray-900">{vendor?.businessName}</span>
          </div>
          <FiCheckCircle className="shrink-0 text-emerald-600" size={14} title="Verified vendor" />
        </div>

        <h1 className="mt-5 text-2xl sm:text-[28px] font-semibold leading-tight text-gray-900">{product.name}</h1>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-semibold tracking-tight text-gray-900">{naira(product.price)}</span>
          {discount > 0 && (
            <>
              <span className="text-base text-gray-400 line-through">{naira(product.compareAtPrice!)}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">-{discount}%</span>
            </>
          )}
        </div>

        <p className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${product.inStock ? "text-emerald-700" : "text-red-600"}`}>
          <span className={`h-2 w-2 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
          {product.inStock ? "In stock" : "Out of stock"}
        </p>

        {product.description && (
          <div className="mt-5">
            <p className={`text-sm leading-6 text-gray-600 whitespace-pre-line ${!expanded && longDescription ? "line-clamp-5" : ""}`}>
              {product.description}
            </p>
            {longDescription && (
              <button onClick={() => setExpanded(!expanded)} className="mt-1 text-sm font-medium text-primary">
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleBuyNow}
          disabled={!product.inStock || submitting}
          className="mt-6 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner /> : <FiShoppingBag size={18} />}
          {!product.inStock ? "Out of stock" : product.hasVariants ? "Choose options" : "Buy now"}
        </button>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <FiShield /> Vendorspot Buyer Protection
          </p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
            <TrustItem icon={<FiLock />} text="Your payment is held safely until you receive your order" />
            <TrustItem icon={<FiTruck />} text="Choose delivery or pickup at checkout, with tracking" />
            <TrustItem icon={<FiRefreshCw />} text="Full refund if your order doesn't arrive or isn't as described" />
          </ul>
        </div>

        {vendor?.slug && (
          <Link href={`/shops/${vendor.slug}`} className="mt-5 block text-center text-sm font-medium text-gray-600 hover:text-gray-900">
            See more from {vendor.businessName}
          </Link>
        )}
      </section>
    </div>
  );
}

// ─── Small pieces ────────────────────────────────────────────────────────────

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="ml-1 font-normal text-gray-400">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

function Input(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={props.type || "text"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
    />
  );
}

function StateCard({
  icon,
  title,
  body,
  vendor,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  vendor?: PublicLink["vendor"];
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gray-200/70 bg-white p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">{icon}</div>
      <h1 className="mt-4 text-lg font-semibold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
      {vendor?.slug && (
        <Link href={`/shops/${vendor.slug}`} className="mt-6 inline-block rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Visit {vendor.businessName}
        </Link>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px] lg:gap-10 animate-pulse">
      <div className="h-[420px] rounded-2xl bg-white border border-gray-200/70 p-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-100" />
          <div className="space-y-2"><div className="h-3 w-32 rounded bg-gray-100" /><div className="h-2.5 w-24 rounded bg-gray-100" /></div>
        </div>
        <div className="mt-10 h-6 w-2/3 rounded bg-gray-100" />
        <div className="mt-8 h-24 rounded-xl bg-gray-50" />
      </div>
      <div className="h-[420px] rounded-2xl bg-white border border-gray-200/70" />
    </div>
  );
}
