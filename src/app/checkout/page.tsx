"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/Toast";
import { FiMapPin, FiTag, FiTruck, FiChevronRight, FiCheck, FiPlus, FiCreditCard, FiLoader, FiPackage, FiAlertCircle, FiShield, FiX } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

interface DeliveryRate {
  type: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  courier: string;
  logo?: string;
  vendorBreakdown?: { vendorId: string; vendorName: string; price: number; courier: string }[];
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendorspot_token");
}
function authHeaders() {
  const token = getToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

function calcBuyerProtectionFee(baseTotal: number): number {
  if (baseTotal >= 100001) return 2000;
  if (baseTotal >= 50001)  return 1500;
  if (baseTotal >= 20001)  return 1000;
  if (baseTotal >= 1000)   return 500;
  return 0;
}

function calcGatewayFee(amount: number, gateway: "paystack" | "flutterwave" | "wallet"): number {
  if (amount <= 0 || gateway === "wallet") return 0;
  if (gateway === "paystack") {
    if (amount <= 2500) return Math.ceil(amount * 0.015);
    return Math.min(Math.ceil((amount + 100) / 0.985) - amount, 2000);
  }
  // flutterwave: 1.4% capped at ₦2,000
  return Math.min(Math.ceil(amount / 0.986) - amount, 2000);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, itemCount, clearCart, applyCoupon } = useCart();
  const { toast } = useToast();

  // Guest mode state
  const [isAuthed, setIsAuthed] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  const handleGuestContinue = async () => {
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      toast("Please enter a valid email address.", "warning");
      return;
    }
    setGuestLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/guest-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        const token = json.data?.accessToken || json.data?.token;
        if (token) {
          localStorage.setItem("vendorspot_token", token);
          if (json.data?.user) localStorage.setItem("vendorspot_user", JSON.stringify(json.data.user));
          setIsAuthed(true);
          toast("Welcome! You can set your password later via email.", "success");
          loadAddresses();
        }
      } else {
        // Email already has a full account — guest-register would create a duplicate, so redirect to login
        toast(json.message || "Email already registered. Please log in.", "info");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch {
      toast("Could not continue as guest. Try again.", "error");
    } finally {
      setGuestLoading(false);
    }
  };

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", street: "", city: "", state: "", label: "Home" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Shipping rate state
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<DeliveryRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [ratesFallback, setRatesFallback] = useState(false);
  const lastFetchedAddressId = useRef<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    const result = await applyCoupon(promoInput.trim().toUpperCase());
    setPromoMessage({ text: result.message, ok: result.success });
    if (result.success) setPromoInput("");
    setPromoLoading(false);
  };

  // Payment & order state
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack" | "flutterwave">("paystack");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showProtectionInfo, setShowProtectionInfo] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const shippingCost = selectedRate?.price ?? 0;
  const baseTotal = Math.max(0, cart.subtotal - cart.discount + shippingCost);
  const buyerProtectionFee = selectedRate ? calcBuyerProtectionFee(baseTotal) : 0;
  const orderTotal = baseTotal + buyerProtectionFee;
  const gatewayFee = selectedRate ? calcGatewayFee(orderTotal, paymentMethod) : 0;
  const grandTotal = orderTotal + gatewayFee;

  const loadAddresses = () => {
    if (!getToken()) { setLoadingAddresses(false); return; }
    setLoadingAddresses(true);
    fetch(`${API_BASE}/addresses`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const list: Address[] = json.data?.addresses || [];
          setAddresses(list);
          const def = list.find((a) => a.isDefault) || list[0];
          if (def) setSelectedAddressId(def._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  };

  // Load saved addresses and wallet balance on mount (if already authed)
  useEffect(() => {
    loadAddresses();
    if (getToken()) {
      fetch(`${API_BASE}/wallet`, { headers: authHeaders() })
        .then((r) => r.json())
        .then((json) => { if (json.success) setWalletBalance(json.data?.wallet?.balance ?? 0); })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.fullName || !addressForm.phone) {
      toast("Please fill all address fields.", "warning");
      return;
    }
    setSavingAddress(true);
    try {
      const res = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...addressForm, country: "Nigeria", isDefault: addresses.length === 0 }),
      });
      const json = await res.json();
      if (json.success) {
        const newAddr: Address = json.data.address;
        setAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr._id);
        setShowAddressForm(false);
        setAddressForm({ fullName: "", phone: "", street: "", city: "", state: "", label: "Home" });
        setRates([]);
        setSelectedRate(null);
        setRatesLoaded(false);
        lastFetchedAddressId.current = null; // force re-fetch for the new address
        toast("Address saved!", "success");
      } else {
        toast(json.message || "Failed to save address.", "error");
      }
    } catch {
      toast("Could not save address.", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const HARDCODED_FALLBACK: DeliveryRate[] = [
    { type: "standard", name: "Standard Delivery", description: "Estimated 5–7 business days", price: 2500, estimatedDays: "5–7 days", courier: "Standard Courier" },
    { type: "express",  name: "Express Delivery",  description: "Estimated 2–3 business days", price: 5000, estimatedDays: "2–3 days",  courier: "Express Courier"  },
  ];

  const handleCalculateRates = useCallback(async (addr?: Address) => {
    const target = addr || selectedAddress;
    if (!target) return;
    setLoadingRates(true);
    setRates([]);
    setSelectedRate(null);
    setRatesLoaded(false);
    setRatesFallback(false);
    try {
      const params = new URLSearchParams({
        street: target.street,
        city: target.city,
        state: target.state,
        fullName: target.fullName,
        phone: target.phone,
      });
      const res = await fetch(`${API_BASE}/orders/delivery-rates?${params}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        const list: DeliveryRate[] = (json.data?.rates || []).filter(
          (r: DeliveryRate) => !["store_pickup", "pickup", "self_pickup", "digital"].includes(r.type)
        );
        const isFallback = json.data?.source === "fallback" || list.length === 0;
        const finalList = list.length > 0 ? list : HARDCODED_FALLBACK;
        setRates(finalList);
        setRatesFallback(isFallback || list.length === 0);
        setRatesLoaded(true);
        // Auto-select cheapest option
        const cheapest = finalList.reduce((min, r) => r.price < min.price ? r : min, finalList[0]);
        setSelectedRate(cheapest);
      } else {
        // Backend error — fall back silently
        setRates(HARDCODED_FALLBACK);
        setSelectedRate(HARDCODED_FALLBACK[0]);
        setRatesFallback(true);
        setRatesLoaded(true);
      }
    } catch {
      // Network error — fall back silently
      setRates(HARDCODED_FALLBACK);
      setSelectedRate(HARDCODED_FALLBACK[0]);
      setRatesFallback(true);
      setRatesLoaded(true);
    } finally {
      setLoadingRates(false);
    }
  }, [selectedAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fetch rates whenever the selected address changes
  useEffect(() => {
    if (!selectedAddressId || loadingAddresses) return;
    if (selectedAddressId === lastFetchedAddressId.current) return;
    lastFetchedAddressId.current = selectedAddressId;
    handleCalculateRates();
  }, [selectedAddressId, loadingAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast("Please select a delivery address.", "warning"); return; }
    if (!selectedRate) { toast("Please select a shipping option.", "warning"); return; }
    if (cart.items.length === 0) { toast("Your cart is empty.", "warning"); return; }

    setPlacingOrder(true);
    try {
      // Affiliate code is stored by the product page or affiliate landing page; clear it after use
      const pendingAffiliateCode = sessionStorage.getItem("affiliateCode") || undefined;

      const body: Record<string, unknown> = {
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country || "Nigeria",
        },
        paymentMethod,
        deliveryType: selectedRate.type,
        selectedDeliveryPrice: selectedRate.price,
        selectedCourier: selectedRate.courier,
        vendorBreakdown: selectedRate.vendorBreakdown || [],
        ...(pendingAffiliateCode && { affiliateCode: pendingAffiliateCode }),
      };

      if (paymentMethod === "paystack" || paymentMethod === "flutterwave") {
        const res = await fetch(`${API_BASE}/orders/initialize-payment`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.success) {
          const authUrl = json.data?.payment?.authorization_url;
          const reference = json.data?.payment?.reference || json.data?.reference;
          const orderId = json.data?.order?._id || json.data?.orderId;
          // Persist reference + orderId before redirecting so the callback page can verify
          // the correct order even after the browser does a full reload
          if (reference && orderId) {
            localStorage.setItem("vendorspot_pending_payment", JSON.stringify({ reference, orderId }));
          }
          if (authUrl) {
            window.location.href = authUrl;
          } else {
            toast("Could not redirect to payment. Try again.", "error");
          }
        } else {
          toast(json.message || "Payment initialization failed.", "error");
        }
      } else {
        // Wallet payment
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.success) {
          sessionStorage.removeItem("affiliateCode");
          await clearCart();
          const orderId = json.data?.order?._id || "new";
          router.push(`/orders/${orderId}?confirmed=true`);
        } else {
          toast(json.message || "Failed to place order.", "error");
        }
      }
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {!isAuthed ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
                <h1 className="text-xl font-bold text-dark mb-1">Checkout</h1>
                <p className="text-sm text-gray-500 mb-6">Enter your email to continue as a guest — no password needed.</p>

                <div className="space-y-3">
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGuestContinue()}
                    placeholder="youremail@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleGuestContinue}
                    disabled={guestLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-dark disabled:opacity-60 transition-colors"
                  >
                    {guestLoading ? <><FiLoader className="w-4 h-4 animate-spin" /> Please wait...</> : "Continue as Guest"}
                  </button>
                </div>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-dark text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Log In to your account <FiChevronRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By continuing, we&apos;ll email you a link to set your password and access your order history.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* ── Left column ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6">Checkout</h1>

                  {/* ── Delivery Address ── */}
                  <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-dark flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" /> Customer Address
                      </p>
                      <button
                        onClick={() => { setShowAddressForm((v) => !v); setRates([]); setSelectedRate(null); setRatesLoaded(false); }}
                        className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Add new
                      </button>
                    </div>

                    {loadingAddresses ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                      </div>
                    ) : (
                      <>
                        {addresses.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {addresses.map((addr) => (
                              <button
                                key={addr._id}
                                onClick={() => { setSelectedAddressId(addr._id); setRates([]); setSelectedRate(null); setRatesLoaded(false); }}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                                  selectedAddressId === addr._id
                                    ? "border-primary bg-pink-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-bold text-dark">{addr.label} — {addr.fullName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{addr.street}, {addr.city}, {addr.state}</p>
                                    <p className="text-xs text-gray-400">{addr.phone}</p>
                                  </div>
                                  {selectedAddressId === addr._id && (
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                      <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Add address form */}
                        {(showAddressForm || addresses.length === 0) && (
                          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                            <p className="text-xs font-semibold text-dark">New Shipment Address</p>
                            <div className="grid grid-cols-2 gap-2">
                              <input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Full name" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                              <input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="Phone number" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                              <input value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="Street address" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                              <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                              <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button onClick={handleSaveAddress} disabled={savingAddress} className="flex-1 bg-primary text-white text-sm font-semibold py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
                                {savingAddress ? "Saving..." : "Save Address"}
                              </button>
                              {addresses.length > 0 && (
                                <button onClick={() => setShowAddressForm(false)} className="px-4 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  {/* ── Shipping Rates ── */}
                  <section className="mb-6">
                    <p className="text-sm font-bold text-dark flex items-center gap-2 mb-4">
                      <FiTruck className="w-4 h-4" /> Shipping Options
                    </p>

                    {!selectedAddress && (
                      <p className="text-sm text-gray-400 py-2">Select a delivery address above to see shipping options.</p>
                    )}

                    {loadingRates && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                        <FiLoader className="w-4 h-4 animate-spin text-primary" />
                        Fetching delivery rates…
                      </div>
                    )}

                    {ratesLoaded && ratesFallback && (
                      <div className="flex items-start gap-2 mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <FiAlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">Live shipping rates are temporarily unavailable. Showing estimated delivery options — your actual fee may vary.</p>
                      </div>
                    )}

                    {ratesLoaded && rates.length > 0 && (
                      <div className="space-y-2">
                        {rates.map((rate, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedRate(rate)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                              selectedRate?.courier === rate.courier && selectedRate?.name === rate.name
                                ? "border-primary bg-pink-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {rate.logo ? (
                                  <img src={rate.logo} alt={rate.courier} className="w-8 h-8 object-contain rounded flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                    <FiTruck className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-dark truncate">{rate.name}</p>
                                  <p className="text-xs text-gray-500">{rate.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm font-bold text-dark">₦{rate.price.toLocaleString()}</span>
                                {selectedRate?.courier === rate.courier && selectedRate?.name === rate.name && (
                                  <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* ── Payment Method ── */}
                  <section>
                    <p className="text-sm font-bold text-dark flex items-center gap-2 mb-3">
                      <FiCreditCard className="w-4 h-4" /> Payment Method
                    </p>
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                      {/* Paystack */}
                      <button
                        onClick={() => setPaymentMethod("paystack")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${paymentMethod === "paystack" ? "bg-pink-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <div className="w-13 h-9 rounded-lg flex flex-col items-center justify-center px-2 flex-shrink-0" style={{ backgroundColor: "#011B33", minWidth: 52 }}>
                          <span className="text-[9px] font-black leading-none" style={{ color: "#00C3F9" }}>pay</span>
                          <span className="text-[9px] font-black leading-none text-white">stack</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark">Paystack</p>
                          <p className="text-xs text-gray-400">Debit/credit card · Bank transfer</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "paystack" ? "border-primary bg-primary" : "border-gray-300"}`}>
                          {paymentMethod === "paystack" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Flutterwave */}
                      <button
                        onClick={() => setPaymentMethod("flutterwave")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${paymentMethod === "flutterwave" ? "bg-pink-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <div className="w-13 h-9 rounded-lg flex flex-col items-center justify-center px-2 flex-shrink-0" style={{ backgroundColor: "#FF6900", minWidth: 52 }}>
                          <span className="text-[9px] font-black leading-none text-white">flutter</span>
                          <span className="text-[9px] font-black leading-none" style={{ color: "#FFD700" }}>wave</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark">Flutterwave</p>
                          <p className="text-xs text-gray-400">Card · Bank transfer · USSD & more</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "flutterwave" ? "border-primary bg-primary" : "border-gray-300"}`}>
                          {paymentMethod === "flutterwave" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Wallet — only for logged-in users */}
                      {isAuthed && (
                        <button
                          onClick={() => setPaymentMethod("wallet")}
                          disabled={walletBalance !== null && walletBalance < grandTotal}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-60 ${paymentMethod === "wallet" ? "bg-pink-50" : "bg-white hover:bg-gray-50"}`}
                        >
                          <div className="w-13 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FE", minWidth: 52 }}>
                            <FiCreditCard className="w-5 h-5" style={{ color: "#6366F1" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark">Wallet Balance</p>
                            <p className={`text-xs font-medium ${walletBalance === null ? "text-gray-400" : walletBalance >= grandTotal ? "text-green-600" : "text-red-500"}`}>
                              {walletBalance === null ? "Loading…" : `₦${walletBalance.toLocaleString()}${walletBalance < grandTotal ? " · Insufficient" : ""}`}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "wallet" ? "border-primary bg-primary" : "border-gray-300"}`}>
                            {paymentMethod === "wallet" && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      )}
                    </div>
                  </section>
                </div>

                <Link href="/cart" className="text-sm text-primary hover:underline font-medium block">
                  &larr; Continue Shopping
                </Link>
              </div>

              {/* ── Right sidebar ── */}
              <div className="flex flex-col gap-4">
                {/* Promo code */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm font-semibold text-dark mb-2 flex items-center gap-1.5">
                    <FiTag className="w-4 h-4" /> Apply Promo Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      placeholder="Enter promo code"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-xs mt-2 font-medium ${promoMessage.ok ? "text-green-600" : "text-red-500"}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-base font-bold text-dark mb-4">Order Summary</h2>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                      <span className="font-medium text-dark">₦{cart.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={`font-medium ${selectedRate ? "text-dark" : "text-gray-400"}`}>
                        {selectedRate ? `₦${selectedRate.price.toLocaleString()}` : "—"}
                      </span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount{cart.couponCode ? ` (${cart.couponCode})` : ""}</span>
                        <span className="font-medium">-₦{cart.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {buyerProtectionFee > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <button
                          onClick={() => setShowProtectionInfo(true)}
                          className="flex items-center gap-1.5 text-left hover:text-gray-800 transition-colors"
                        >
                          <span className="text-sm">Buyer Protection</span>
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#CC3366" }}>?</span>
                        </button>
                        <span className="font-medium text-dark">₦{buyerProtectionFee.toLocaleString()}</span>
                      </div>
                    )}
                    {gatewayFee > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span className="text-sm">{paymentMethod === "flutterwave" ? "Flutterwave" : "Paystack"} fee</span>
                        <span className="font-medium text-dark">₦{gatewayFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between font-bold text-dark text-base mt-4 pt-3 border-t border-gray-100">
                    <span>Total to Pay</span>
                    <span style={{ color: "#CC3366" }}>₦{(selectedRate ? grandTotal : Math.max(0, cart.subtotal - cart.discount)).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || cart.items.length === 0 || !selectedRate || !selectedAddress}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {placingOrder ? (
                      <><FiLoader className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                  {!selectedRate && cart.items.length > 0 && (
                    <p className="text-xs text-gray-400 text-center mt-2">Select a shipping option to continue</p>
                  )}
                </div>

                {/* Items preview */}
                {cart.items.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-bold text-dark mb-3">Items ({itemCount})</p>
                    <div className="space-y-2">
                      {cart.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-4 h-4 text-gray-400" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-dark truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-400">x{item.quantity}</p>
                          </div>
                          <span className="text-xs font-semibold text-dark">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <FooterMini />

      {/* Buyer Protection Info Modal */}
      {showProtectionInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={() => setShowProtectionInfo(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-8 sm:pb-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#CC3366" }}>
                  <FiShield className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Why Vendorspot Charges a Buyer Protection Fee</h3>
              </div>
              <button onClick={() => setShowProtectionInfo(false)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-5 mb-4">
              Every order on Vendorspot is covered by our Buyer Protection programme. Your payment is held securely in escrow and only released to the vendor after you confirm you&apos;ve received your item in good condition.
            </p>

            <p className="text-sm font-semibold text-gray-800 mb-3">Your protection includes:</p>

            <ul className="space-y-2 mb-4">
              {[
                "Secure escrow holding until you confirm delivery",
                "Order monitoring from payment to doorstep",
                "Priority dispute resolution if anything goes wrong",
                "Verified refund processing when eligible",
                "Fraud prevention on every transaction",
                "Delivery coordination support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-5">
                  <span className="text-green-500 flex-shrink-0">✅</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "#FFF0F5" }}>
              <p className="text-sm text-gray-700 leading-5">
                This small fee keeps the entire trust system running, so every purchase you make on Vendorspot is backed by real protection, not just a promise.
              </p>
              <p className="text-sm font-semibold mt-2" style={{ color: "#CC3366" }}>
                Shop with confidence. We&apos;ve got your back.
              </p>
              <div className="flex items-start gap-1 mt-3 pt-3 border-t border-pink-200">
                <FiAlertCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">This fee is non-refundable, even if an order is cancelled or refunded.</p>
              </div>
            </div>

            <button
              onClick={() => setShowProtectionInfo(false)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#CC3366" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
