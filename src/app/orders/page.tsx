"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { FiPackage, FiChevronRight, FiLoader, FiArrowRight } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface OrderItem {
  product: { name: string; images: string[] };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: "Order Placed",  color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  confirmed:  { label: "Confirmed",     color: "text-blue-600 bg-blue-50 border-blue-200" },
  processing: { label: "Processing",    color: "text-purple-600 bg-purple-50 border-purple-200" },
  shipped:    { label: "Shipped",       color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  in_transit: { label: "In Transit",    color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  delivered:  { label: "Delivered",     color: "text-green-600 bg-green-50 border-green-200" },
  cancelled:  { label: "Cancelled",     color: "text-red-600 bg-red-50 border-red-200" },
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    fetch(`${API_BASE}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => { if (json.success) setOrders(json.data?.orders || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 min-h-screen pt-20 sm:pt-24 pb-6 sm:pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="text-xl sm:text-2xl font-bold text-dark mb-6">
            My Orders
          </motion.h1>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-24">
                <FiLoader className="w-6 h-6 animate-spin text-primary" />
              </motion.div>
            ) : orders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14 text-center"
              >
                <FiPackage className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm font-semibold text-dark mb-1">No orders yet</p>
                <p className="text-xs text-gray-500 mb-6">When you place orders, they&apos;ll appear here.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Start Shopping <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <motion.div key="list" variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "text-gray-600 bg-gray-50 border-gray-200" };
                  const firstItem = order.items?.[0];
                  const itemCount = order.items?.length || 0;

                  return (
                    <motion.div key={order._id} variants={fadeUp}>
                      <Link
                        href={`/orders/${order.orderNumber || order._id}`}
                        className="flex items-center gap-3 sm:gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {firstItem?.product?.images?.[0] ? (
                            <img src={firstItem.product.images[0]} alt={firstItem.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm font-bold text-dark truncate">#{order.orderNumber || order._id}</p>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {firstItem?.product?.name}{itemCount > 1 && ` +${itemCount - 1} more`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <p className="text-sm font-bold text-dark">₦{order.total?.toLocaleString()}</p>
                          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <FooterMini />
    </>
  );
}
