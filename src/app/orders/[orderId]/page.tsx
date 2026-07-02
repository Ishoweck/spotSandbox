"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import {
  FiCheck, FiPackage, FiMapPin, FiChevronRight, FiDownload,
  FiTruck, FiClock, FiAlertCircle, FiShoppingBag, FiXCircle, FiCheckCircle,
} from "react-icons/fi";
import { friendlyError } from "@/lib/errorMessage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface OrderItem {
  _id?: string;
  id?: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    productType?: string;
    digitalFile?: string;
  };
  productType?: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  status: string;
  paymentStatus?: string;   // "completed" | "pending" | "failed"
  isDigital?: boolean;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  shippingCost?: number;
  deliveryFee?: number;
  discount?: number;
  shippingAddress?: { street?: string; city?: string; state?: string; country?: string };
  createdAt: string;
}

// Physical order status steps — in_transit is a distinct step between shipped and delivered
const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "in_transit", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending:    "Order Placed",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  in_transit: "In Transit",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}

function StatusTracker({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <FiAlertCircle className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
          <p className="text-xs text-gray-400">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress bar behind steps */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(0, (currentIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
          />
        </div>

        {STATUS_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done
                    ? "bg-primary border-primary"
                    : active
                    ? "bg-white border-primary"
                    : "bg-white border-gray-200"
                }`}
              >
                {done ? (
                  <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                ) : active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight max-w-[52px] ${active ? "text-primary" : done ? "text-gray-600" : "text-gray-400"}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;
  const isConfirmed = searchParams?.get("confirmed") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [noToken, setNoToken] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const token = getToken();
    if (!token) { setNoToken(true); setLoading(false); return; }

    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => { if (json.success) setOrder(json.data?.order ?? null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  // Backend download endpoint accepts either the Mongo _id or "item-{index}" as a fallback;
  // older orders may not have _id populated on embedded items
  const resolveItemId = (item: OrderItem, index: number): string =>
    item._id?.toString() || item.id?.toString() || `item-${index}`;

  const handleDownload = async (itemId: string) => {
    const token = getToken();
    if (!token || !order) return;
    setDownloading(itemId);
    setDownloadError(null);
    try {
      const res = await fetch(`${API_BASE}/orders/${order._id}/download/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Error response — only try JSON if the server says so
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          throw new Error(json.message || "Download failed");
        }
        throw new Error("Download failed. Please try again.");
      }

      // Success — stream is binary; read as blob and trigger browser save-dialog
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const nameMatch = disposition.match(/filename="?([^";\r\n]+)"?/i);
      const filename = nameMatch?.[1]?.trim() || "download";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err: unknown) {
      setDownloadError(friendlyError(err, "Could not start download. Please try again."));
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloading(null);
    }
  };

  const handleComplete = async () => {
    const token = getToken();
    if (!token || !order) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch(`${API_BASE}/orders/${order._id}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to complete order");
      setOrder((prev) => prev ? { ...prev, status: "delivered" } : prev);
    } catch (err: unknown) {
      setCompleteError(friendlyError(err, "Could not complete order. Please try again."));
      setTimeout(() => setCompleteError(null), 5000);
    } finally {
      setCompleting(false);
    }
  };

  const orderNo = order?.orderNumber || orderId;

  const isItemDigital = (item: OrderItem) =>
    ["digital", "DIGITAL"].includes(item.productType || item.product?.productType || "");

  const digitalItems = order?.items?.filter(isItemDigital) ?? [];
  const hasDigitalItems = digitalItems.length > 0;
  const isDigitalOrder = order?.isDigital || (order?.items && order.items.length > 0 && order.items.every(isItemDigital));
  const canDownload = order?.paymentStatus === "completed" || isConfirmed;

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8 px-3 sm:px-4 min-h-screen">
          <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  // ── Auth wall ─────────────────────────────────────────────────
  if (noToken) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50 py-16 px-4 min-h-screen flex items-start justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-dark mb-1">Sign in to view your order</p>
            {isConfirmed ? (
              <p className="text-xs text-gray-500 mb-5">
                Order reference: <span className="font-semibold">{orderId}</span><br />
                A confirmation email was sent to you.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mb-5">Log in to see your order details and track your shipment.</p>
            )}
            <div className="flex flex-col gap-2">
              <Link href="/login" className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors">
                Log In to Track Order <FiChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/products" className="flex items-center justify-center border border-gray-200 text-dark text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  // ── Order not found ───────────────────────────────────────────
  if (!order) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50 py-16 px-4 min-h-screen flex items-start justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            {isConfirmed ? (
              <>
                <p className="text-sm font-semibold text-dark mb-1">Order placed successfully!</p>
                <p className="text-xs text-gray-500 mb-5">
                  Reference: <span className="font-semibold">{orderId}</span><br />
                  A confirmation email has been sent to you.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-dark mb-1">Order not found</p>
                <p className="text-xs text-gray-500 mb-5">This order may belong to a different account.</p>
              </>
            )}
            <div className="flex flex-col gap-2">
              <Link href="/orders" className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors">
                View All Orders <FiChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/products" className="flex items-center justify-center border border-gray-200 text-dark text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <FooterMini />
      </>
    );
  }

  // ── Order detail ──────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8 px-3 sm:px-4 min-h-screen">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Back link */}
          <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
            <FiChevronRight className="w-4 h-4 rotate-180" /> All Orders
          </Link>

          {/* ── Header card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {isConfirmed && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-green-600" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">Payment confirmed — thank you!</p>
                  <p className="text-xs text-gray-500">
                    {hasDigitalItems
                      ? "Your digital product is ready. Scroll down to download it now."
                      : "Your order is being processed and will be on its way soon."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order number</p>
                <p className="text-base font-bold text-dark">{orderNo}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              {order.status && STATUS_LABELS[order.status] && (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${
                  order.status === "delivered"  ? "text-green-600 bg-green-50 border-green-200" :
                  order.status === "cancelled"  ? "text-red-600 bg-red-50 border-red-200" :
                  order.status === "shipped" || order.status === "in_transit" ? "text-indigo-600 bg-indigo-50 border-indigo-200" :
                  "text-yellow-600 bg-yellow-50 border-yellow-200"
                }`}>
                  {STATUS_LABELS[order.status]}
                </span>
              )}
            </div>
          </div>

          {/* ── Status tracker (physical orders only) ── */}
          {!isDigitalOrder && !hasDigitalItems && order.status !== "cancelled" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <FiTruck className="w-4 h-4 text-dark" />
                <h2 className="text-sm font-bold text-dark">Order Progress</h2>
              </div>
              <StatusTracker status={order.status} />
            </div>
          )}

          {/* ── Digital downloads ── shown for any order with digital items ── */}
          {hasDigitalItems && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiDownload className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-dark">Your Downloads</h2>
              </div>

              {downloadError && (
                <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  <FiXCircle className="w-4 h-4 flex-shrink-0" />
                  {downloadError}
                </div>
              )}

              {!canDownload ? (
                <p className="text-sm text-gray-500 py-2">
                  Downloads will be available once your payment is confirmed.
                </p>
              ) : (
                <div className="space-y-3">
                  {digitalItems.map((item, index) => {
                    const itemId = resolveItemId(item, index);
                    return (
                      <div key={itemId} className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-100 rounded-xl">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {item.product?.images?.[0]
                            ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-5 h-5 text-gray-400" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark truncate">{item.product?.name}</p>
                          <p className="text-xs text-primary font-medium">Ready to download</p>
                        </div>
                        <button
                          onClick={() => handleDownload(itemId)}
                          disabled={downloading === itemId}
                          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors flex-shrink-0"
                        >
                          <FiDownload className="w-3.5 h-3.5" />
                          {downloading === itemId ? "Downloading…" : "Download"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Order items ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiShoppingBag className="w-4 h-4 text-dark" />
              <h2 className="text-sm font-bold text-dark">Items Ordered</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const isDigitalItem = (item.productType || item.product?.productType || "").toLowerCase() === "digital";
                return (
                  <div key={item._id} className="flex items-center gap-4 py-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-6 h-6 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{item.product?.name}</p>
                      {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {isDigitalItem && (
                          <span className="text-[10px] font-semibold text-primary bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-100">Digital</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-dark flex-shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Shipping address (physical only) ── */}
          {!isDigitalOrder && order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin className="w-4 h-4 text-dark" />
                <h2 className="text-sm font-bold text-dark">Delivery Address</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {[order.shippingAddress.street, order.shippingAddress.city,
                  order.shippingAddress.state, order.shippingAddress.country]
                  .filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          {/* ── Estimated delivery notice (shipped) ── */}
          {(order.status === "shipped" || order.status === "in_transit") && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <FiClock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <p className="text-sm text-indigo-700 font-medium">Your order is on its way! Expected within 1–5 business days.</p>
            </div>
          )}

          {/* ── Payment summary ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-dark mb-4">Payment Summary</h2>
            <div className="space-y-2.5 text-sm">
              {order.subtotal != null && (
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
              )}
              {(order.shippingCost ?? order.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₦{(order.shippingCost ?? order.deliveryFee)!.toLocaleString()}</span>
                </div>
              )}
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₦{order.discount!.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-dark text-base pt-3 border-t border-gray-100">
                <span>Total Paid</span>
                <span>₦{(order.total ?? order.totalAmount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── Mark as Received (vendor has marked delivered, awaiting customer confirmation) ── */}
          {order.status === "delivered" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">Received your order?</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Once you confirm receipt, the vendor gets paid and your order is marked complete.
                  </p>
                </div>
              </div>
              {completeError && (
                <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  <FiXCircle className="w-4 h-4 flex-shrink-0" />
                  {completeError}
                </div>
              )}
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                <FiCheckCircle className="w-4 h-4" />
                {completing ? "Confirming…" : "I've Received My Order"}
              </button>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pb-4">
            <Link
              href="/orders"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white text-dark text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              All Orders
            </Link>
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <FooterMini />
    </>
  );
}
