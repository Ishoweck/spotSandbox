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
import { useParams, useRouter } from "next/navigation";
import { FiShield, FiLock, FiAlertCircle, FiShoppingBag } from "react-icons/fi";
import FooterMini from "@/components/FooterMini";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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

const naira = (n: number) => `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

export default function PayPage() {
  const params = useParams();
  const code = String(params?.code || "");
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [data, setData] = useState<PublicLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setError(null);

    if (name.trim().split(/\s+/).length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email address.");
    if (phone && !/^(\+234|0)[789]\d{9}$/.test(phone.trim())) return setError("Please enter a valid Nigerian phone number.");

    const payAmount = data.link.amount ?? Number(amount);
    if (!data.link.amount) {
      if (!Number.isFinite(payAmount) || payAmount < data.limits.min || payAmount > data.limits.max) {
        return setError(`Enter an amount between ${naira(data.limits.min)} and ${naira(data.limits.max)}.`);
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/payment-links/public/${code}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          ...(phone.trim() && { phone: phone.trim() }),
          ...(!data.link.amount && { amount: payAmount }),
          ...(note.trim() && { note: note.trim() }),
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.authorization_url) {
        window.location.href = json.data.authorization_url;
        return;
      }
      setError(json.message || json.errors?.[0]?.msg || "Could not start the payment. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const handleBuyNow = async () => {
    if (!data?.product) return;
    // Products with variants need a choice, so send the buyer to the full product page
    if (data.product.hasVariants) {
      sessionStorage.setItem("checkoutLinkCode", code);
      router.push(`/products/${data.product.slug || data.product.id}`);
      return;
    }
    setSubmitting(true);
    try {
      const p = data.product;
      await addToCart(p.id, { _id: p.id, name: p.name, price: p.price, images: p.images || [] }, 1);
      sessionStorage.setItem("checkoutLinkCode", code);
      router.push("/checkout");
    } catch {
      toast("Could not add this item. Please try again.", "error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <Shell>
        <div className="text-center py-10">
          <FiAlertCircle className="mx-auto text-gray-400 mb-3" size={36} />
          <h1 className="text-lg font-bold text-gray-900 mb-1">Link not found</h1>
          <p className="text-sm text-gray-500">Check the link with the person who sent it to you.</p>
        </div>
      </Shell>
    );
  }

  const { link, vendor, product } = data;

  return (
    <Shell vendor={vendor}>
      {!link.available ? (
        <div className="text-center py-8">
          <FiAlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            {link.status === "USED" ? "This link has already been paid" : "This link is no longer active"}
          </h1>
          <p className="text-sm text-gray-500">Contact {vendor?.businessName || "the vendor"} for a new link.</p>
        </div>
      ) : link.type === "PRODUCT" && product ? (
        <div>
          {product.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover rounded-xl mb-4 bg-gray-100" />
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h1>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-primary">{naira(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">{naira(product.compareAtPrice)}</span>
            )}
          </div>
          {product.description && (
            <p className="text-sm text-gray-600 leading-6 mb-5 whitespace-pre-line line-clamp-6">{product.description}</p>
          )}
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock || submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Spinner /> : <FiShoppingBag />}
            {product.inStock ? "Buy now" : "Out of stock"}
          </button>
          <div className="mt-4 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
            <FiShield className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-xs text-green-800 leading-5">
              Buyer Protection: your payment is held safely by Vendorspot and only released to the vendor after you receive your order.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Payment for</p>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{link.title}</h1>
          {link.description && <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{link.description}</p>}
          {link.amount ? (
            <p className="text-3xl font-bold text-primary mb-5">{naira(link.amount)}</p>
          ) : (
            <div className="mb-4 mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₦)</label>
              <input
                type="number"
                inputMode="decimal"
                min={data.limits.min}
                max={data.limits.max}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Tolu Adeyemi" autoComplete="name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" autoComplete="email" />
          <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="08012345678" type="tel" autoComplete="tel" />
          <Field label="Note to vendor (optional)" value={note} onChange={setNote} placeholder="e.g. For the 2 perfumes" />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Spinner /> : <FiLock />}
            {link.amount ? `Pay ${naira(link.amount)}` : "Continue to payment"}
          </button>

          <p className="text-xs text-gray-500 leading-5 mt-4">
            This is a direct payment to {vendor?.businessName || "the vendor"}. It is not a Vendorspot marketplace order,
            so Vendorspot Buyer Protection does not apply. Only pay people you know and trust.
          </p>
        </form>
      )}
    </Shell>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{props.label}</label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function Shell({ children, vendor }: { children: React.ReactNode; vendor?: PublicLink["vendor"] }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
        {vendor && (
          <div className="flex items-center gap-3 mb-4">
            {vendor.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.logo} alt={vendor.businessName} className="w-11 h-11 rounded-full object-cover bg-white border border-gray-200" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-pink-100 text-primary font-bold flex items-center justify-center">
                {vendor.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 leading-tight">{vendor.businessName}</p>
              <p className="text-xs text-gray-500">Verified vendor on Vendorspot</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">{children}</div>
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <FiLock size={11} /> Payments secured by Paystack · Powered by Vendorspot
        </p>
      </main>
      <FooterMini />
    </div>
  );
}
