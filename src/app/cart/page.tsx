"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { useCart } from "@/lib/CartContext";
import { FiMinus, FiPlus, FiTag, FiLock, FiShoppingBag, FiArrowRight, FiTrash2, FiPackage } from "react-icons/fi";
import { fadeUp, stagger } from "@/lib/motion";

export default function CartPage() {
  const router = useRouter();
  const { cart, itemCount, loading, removeFromCart, updateQuantity, clearCart, applyCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Paystack redirects back to the site after payment, which can land here if the user
  // navigated to /cart first. Pick up the stored reference and forward to the callback route.
  useEffect(() => {
    const pending = localStorage.getItem("vendorspot_pending_payment");
    if (pending) {
      try {
        const { reference, orderId } = JSON.parse(pending);
        localStorage.removeItem("vendorspot_pending_payment");
        router.replace(`/orders/${orderId}/payment-callback?reference=${reference}`);
      } catch {
        localStorage.removeItem("vendorspot_pending_payment");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    const result = await applyCoupon(couponInput.trim().toUpperCase());
    setCouponMsg({ text: result.message, ok: result.success });
    setApplyingCoupon(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 min-h-screen pt-20 sm:pt-24 pb-6 sm:pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {cart.items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6">
                  <FiShoppingBag className="w-9 h-9 text-gray-300" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-dark mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm mb-8 max-w-xs">Browse our products and add something you like.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-7 py-3.5 text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm">
                  Browse Products <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.h1
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-xl sm:text-2xl font-bold text-dark mb-6"
                >
                  Your Cart{" "}
                  <span className="text-base font-normal text-gray-400 ml-1">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                </motion.h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* Cart items */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-gray-100"
                  >
                    <AnimatePresence>
                      {cart.items.map((item) => (
                        <motion.div
                          key={item._id}
                          variants={fadeUp}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-3 sm:gap-4 py-4"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-6 h-6 text-gray-400" /></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark truncate leading-snug">{item.product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">₦{item.price.toLocaleString()} each</p>
                            {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>}
                            <button
                              onClick={() => removeFromCart(item._id)}
                              disabled={loading}
                              className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs mt-1.5 disabled:opacity-50 transition-colors"
                            >
                              <FiTrash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <p className="text-sm font-bold text-dark">₦{(item.price * item.quantity).toLocaleString()}</p>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={loading}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-dark">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={loading}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                    <Link href="/products" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-dark text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                      Continue Shopping
                    </Link>
                    <button
                      onClick={clearCart}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" /> Clear Cart
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="flex flex-col gap-4">
                  {/* Promo */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm font-semibold text-dark mb-3 flex items-center gap-1.5">
                      <FiTag className="w-4 h-4 text-primary" /> Promo Code
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(null); }}
                        placeholder="Enter code"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors min-w-0"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        {applyingCoupon ? "…" : "Apply"}
                      </button>
                    </div>
                    {couponMsg && (
                      <p className={`text-xs mt-2 ${couponMsg.ok ? "text-green-600" : "text-red-500"}`}>{couponMsg.text}</p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-base font-bold text-dark mb-4">Order Summary</h2>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-dark">₦{cart.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee</span>
                        <span className="text-xs font-medium text-gray-400 italic">Calculated at checkout</span>
                      </div>
                      {cart.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount{cart.couponCode ? ` (${cart.couponCode})` : ""}</span>
                          <span className="font-medium">-₦{cart.discount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between font-bold text-dark text-base mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <p>Subtotal</p>
                        <p className="text-[10px] font-normal text-gray-400 mt-0.5">Delivery added at checkout</p>
                      </div>
                      <span>₦{cart.subtotal.toLocaleString()}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/checkout")}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      <FiLock className="w-4 h-4" /> Proceed to Checkout
                    </motion.button>
                  </div>
                </motion.div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <FooterMini />
    </>
  );
}
