"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import {
  FiHeart, FiChevronLeft, FiChevronRight, FiShare2,
  FiMessageCircle, FiMapPin, FiShoppingCart, FiStar,
  FiLink, FiUserPlus, FiX, FiCopy, FiCheck, FiSend,
  FiChevronDown, FiChevronUp, FiPackage,
} from "react-icons/fi";
import { useCart } from "@/lib/CartContext";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const COLOR_HEX: Record<string, string> = {
  red: "#E53E3E", blue: "#3182CE", green: "#38A169", black: "#1A202C",
  white: "#FFFFFF", yellow: "#ECC94B", orange: "#ED8936", purple: "#805AD5",
  pink: "#ED64A6", brown: "#A0522D", gray: "#718096", grey: "#718096",
  navy: "#1A365D", maroon: "#702459", gold: "#D69E2E", silver: "#A0AEC0",
  beige: "#F5F5DC", cream: "#FFFDD0", khaki: "#C3B091", teal: "#319795",
};

function colorHex(name: string) {
  return COLOR_HEX[name.toLowerCase()] ?? "#CBD5E0";
}

interface ProductDetail {
  id: string; name: string; slug: string; description: string;
  shortDescription: string; price: number; originalPrice: number;
  discount: number; images: string[]; thumbnail: string; category: string;
  stock: number; inStock: boolean; rating: number; reviews: number;
  tags: string[]; keyFeatures: string[]; specifications: Record<string, string>;
  sizes?: string[]; colors?: string[];
  vendor: { id: string; name: string; image: string; verified: boolean; isPremium: boolean };
}
interface VendorDetail {
  id: string; businessName: string; businessDescription: string;
  businessLogo: string; businessBanner: string; averageRating: number;
  totalReviews: number; verificationStatus: string; location?: string;
  businessAddress?: { city?: string; state?: string };
}
interface Review {
  _id: string; user: { firstName: string; lastName: string; avatar?: string };
  rating: number; comment: string; verified: boolean; helpful: number; createdAt: string;
}
interface Question {
  _id: string; question: string; answer?: string;
  user: { firstName: string; lastName: string };
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-accent fill-accent" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    sessionStorage.setItem("affiliateCode", ref);
    fetch(`${API_BASE}/affiliate/track/${ref}`).catch(() => {});
  }, []);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [similar, setSimilar] = useState<ProductDetail[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [variantError, setVariantError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setVariantError("");
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;
    if (hasSizes && !selectedSize) { setVariantError("Please select a size"); return; }
    if (hasColors && !selectedColor) { setVariantError("Please select a color"); return; }
    setVariantError("");
    const variantParts: string[] = [];
    if (selectedSize) variantParts.push(`Size: ${selectedSize}`);
    if (selectedColor) variantParts.push(`Color: ${selectedColor}`);
    const variant = variantParts.length > 0 ? variantParts.join(", ") : undefined;
    await addToCart(product.id, { _id: product.id, name: product.name, price: product.price, images: product.images || [] }, 1, variant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.name ?? "Check out this product";
    if (navigator.share) {
      try { await navigator.share({ title, text: `${title} on Vendorspot`, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {}
    }
  };

  const [showAskModal, setShowAskModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [askSuccess, setAskSuccess] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const [referralLoading, setReferralLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [showReferralCard, setShowReferralCard] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  const openInApp = () => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    const deepLink = `vendorspot://products/${id}${ref ? `?ref=${ref}` : ""}`;
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href =
          /android/i.test(navigator.userAgent)
            ? "https://play.google.com/store/apps/details?id=com.vendorspot.app"
            : "https://apps.apple.com/ng/app/vendorspot-thespot/id6761906107";
      }
    }, 1500);
  };

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setLoading(true);
        const pRes = await fetch(`${API_BASE}/products/${id}`);
        const pJson = await pRes.json();
        const prod: ProductDetail = pJson.data;
        if (!prod) return;
        setProduct(prod);
        setActiveImage(0);
        const productId = prod.id;
        if (prod?.vendor?.id) {
          const vRes = await fetch(`${API_BASE}/vendor/public/${prod.vendor.id}`);
          const vJson = await vRes.json();
          setVendor(vJson.data?.vendor ?? null);
        }
        const [sRes, rRes, qRes] = await Promise.all([
          fetch(`${API_BASE}/products/${productId}/similar?limit=10`),
          fetch(`${API_BASE}/reviews/product/${productId}?limit=5`),
          fetch(`${API_BASE}/questions/product/${productId}?limit=20`),
        ]);
        const [sJson, rJson, qJson] = await Promise.all([sRes.json(), rRes.json(), qRes.json()]);
        setSimilar(sJson.data?.products ?? []);
        setReviews(rJson.data?.reviews ?? []);
        setQuestions(qJson.data?.questions ?? []);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAskQuestion = async () => {
    const token = localStorage.getItem("vendorspot_token");
    if (!token) { setAskError("Please log in to ask a question."); return; }
    if (!questionText.trim()) { setAskError("Please enter your question."); return; }
    setAskLoading(true); setAskError("");
    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product?.id, question: questionText.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setAskError(json.message || "Failed to submit question."); return; }
      setAskSuccess(true);
      setQuestionText("");
      setTimeout(() => { setShowAskModal(false); setAskSuccess(false); }, 1800);
    } catch {
      setAskError("Something went wrong. Please try again.");
    } finally {
      setAskLoading(false);
    }
  };

  const handleGenerateReferral = async () => {
    const token = localStorage.getItem("vendorspot_token");
    if (!token) { setReferralError("Please log in to generate a referral link."); setShowReferralCard(true); return; }
    setReferralLoading(true); setReferralError(""); setReferralLink("");
    try {
      const res = await fetch(`${API_BASE}/affiliate/generate-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product?.id }),
      });
      const json = await res.json();
      if (res.status === 403) {
        const actRes = await fetch(`${API_BASE}/affiliate/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const actJson = await actRes.json();
        if (!actRes.ok || !actJson.success) {
          setReferralError(actJson.message || "Could not activate affiliate account.");
          setShowReferralCard(true);
          return;
        }
        const retry = await fetch(`${API_BASE}/affiliate/generate-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product?.id }),
        });
        const retryJson = await retry.json();
        if (!retry.ok || !retryJson.success) {
          setReferralError(retryJson.message || "Failed to generate link.");
          setShowReferralCard(true);
          return;
        }
        setReferralLink(retryJson.data?.affiliateLink?.url || "");
        setShowReferralCard(true);
        return;
      }
      if (!res.ok || !json.success) {
        setReferralError(json.message || "Failed to generate referral link.");
        setShowReferralCard(true);
        return;
      }
      setReferralLink(json.data?.affiliateLink?.url || "");
      setShowReferralCard(true);
    } catch {
      setReferralError("Something went wrong. Please try again.");
      setShowReferralCard(true);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleCopyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const lightboxPrev = () => setLightboxIndex((i) => Math.max(0, i - 1));
  const lightboxNext = (len: number) => setLightboxIndex((i) => Math.min(len - 1, i + 1));

  useEffect(() => {
    if (!lightboxOpen) return;
    const len = product?.images?.length ?? 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setLightboxIndex((i) => Math.min(len - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, product?.images?.length]);

  const images = product?.images?.length ? product.images : [];
  const canPrev = activeImage > 0;
  const canNext = activeImage < images.length - 1;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const visibleQuestions = showAllQuestions ? questions : questions.slice(0, 3);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl h-96" />
              <div className="lg:col-span-2 bg-white rounded-3xl h-96" />
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-3xl h-56" />
                <div className="bg-white rounded-3xl h-40" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center mt-16">
          <p className="text-gray-500">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen pt-22 pb-16">

        {/* Open in App Banner — mobile/tablet only */}
        {isMobileDevice && (
          <div className="bg-[#CC3366] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/VLogo.svg" alt="Vendorspot" className="w-7 h-7 rounded" />
              <span className="text-sm font-medium">Get a better experience in the app</span>
            </div>
            <button onClick={openInApp} className="bg-white text-[#CC3366] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
              Open App
            </button>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-primary transition-colors">{product.category || "Products"}</Link>
          <span>›</span>
          <span className="text-dark font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── 5-col grid: [Image ×2] [Info ×2] [Sidebar ×1] ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">

            {/* ── Image gallery ── col-span-2 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/80">
                <div
                  className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3 cursor-zoom-in group"
                  onClick={() => images.length > 0 && openLightbox(activeImage)}
                >
                  {images.length > 0 ? (
                    <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-16 h-16 text-gray-200" />
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveImage((i) => Math.max(0, i - 1))} disabled={!canPrev}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:border-primary hover:text-primary transition-colors flex-shrink-0">
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setActiveImage(i)}
                          className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                            i === activeImage ? "border-primary shadow-sm" : "border-transparent opacity-50 hover:opacity-100"
                          }`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))} disabled={!canNext}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:border-primary hover:text-primary transition-colors flex-shrink-0">
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Product info ── col-span-2 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100/80 flex flex-col">

                {/* Title + save */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-dark leading-snug">{product.name}</h1>
                  <button onClick={() => setSaved((s) => !s)}
                    className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary transition-colors">
                    <FiHeart className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-gray-400"}`} />
                  </button>
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <p className="text-2xl font-extrabold text-dark">₦{product.price?.toLocaleString()}</p>
                  {product.originalPrice > product.price && (
                    <p className="text-sm text-gray-400 line-through">₦{product.originalPrice?.toLocaleString()}</p>
                  )}
                  {product.discount > 0 && (
                    <span className="text-[11px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 flex-wrap">
                  {product.category && (
                    <span>Category: <span className="text-dark font-medium">{product.category}</span></span>
                  )}
                  <span>
                    Stock:{" "}
                    <span className={`font-semibold ${(product.stock ?? 0) > 0 ? "text-emerald-500" : "text-red-400"}`}>
                      {(product.stock ?? 0) > 0 ? `${product.stock} left` : "Out of stock"}
                    </span>
                  </span>
                </div>

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
                      Size {selectedSize && <span className="text-gray-400 font-normal normal-case ml-1">— {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setVariantError(""); }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedSize === size
                              ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                              : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                          }`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
                      Color {selectedColor && <span className="text-gray-400 font-normal normal-case ml-1">— {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button key={color} onClick={() => { setSelectedColor(color); setVariantError(""); }} title={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color ? "border-primary ring-2 ring-primary/20 scale-110" : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: colorHex(color) }} />
                      ))}
                    </div>
                  </div>
                )}

                {variantError && <p className="text-xs text-red-500 mb-3">{variantError}</p>}

                {/* Add to cart */}
                <button onClick={handleAddToCart}
                  className={`w-full font-bold py-3.5 rounded-2xl mb-3 transition-all flex items-center justify-center gap-2 text-sm ${
                    addedToCart
                      ? "bg-emerald-500 text-white"
                      : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                  }`}>
                  {addedToCart ? <FiCheck className="w-4 h-4" /> : <FiShoppingCart className="w-4 h-4" />}
                  {addedToCart ? "Added to Cart!" : "Add to Cart"}
                </button>

                {/* Secondary actions */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={handleGenerateReferral} disabled={referralLoading}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-60">
                    <FiLink className="w-3.5 h-3.5" />
                    {referralLoading ? "Generating…" : "Referral Link"}
                  </button>
                  <button onClick={() => { setShowAskModal(true); setAskError(""); setAskSuccess(false); }}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                    <FiMessageCircle className="w-3.5 h-3.5" />
                    Ask a Question
                  </button>
                </div>

                {/* Referral card */}
                <AnimatePresence>
                  {showReferralCard && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="mb-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-dark">Your Referral Link</p>
                        <button onClick={() => setShowReferralCard(false)} className="text-gray-400 hover:text-gray-600">
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      {referralError ? (
                        <p className="text-xs text-red-500">{referralError}</p>
                      ) : referralLink ? (
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-gray-500 flex-1 truncate bg-white border border-gray-200 rounded-lg px-2 py-1.5">{referralLink}</p>
                          <button onClick={handleCopyReferral}
                            className={`flex-shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              copied ? "bg-emerald-100 text-emerald-600" : "bg-primary text-white hover:bg-primary-dark"
                            }`}>
                            {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Share */}
                <div className="flex items-center justify-end border-t border-gray-100 pt-3 mt-auto">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Share</span>
                    <a href={`https://facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer">
                      <FaFacebook className="w-4 h-4 text-blue-600 hover:opacity-70 transition-opacity" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                      <FaInstagram className="w-4 h-4 text-pink-500 hover:opacity-70 transition-opacity" />
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noreferrer">
                      <FaXTwitter className="w-4 h-4 text-dark hover:opacity-70 transition-opacity" />
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                      <FaWhatsapp className="w-4 h-4 text-green-500 hover:opacity-70 transition-opacity" />
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Sidebar ── col-span-1 */}
            <div className="lg:col-span-1 space-y-4">

              {/* Vendor card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-dark">Vendor</h3>
                </div>
                <div className="relative h-20">
                  {vendor?.businessBanner ? (
                    <img src={vendor.businessBanner} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark" />
                  )}
                  <button className="absolute top-2 right-2 w-7 h-7 bg-dark/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FiUserPlus className="w-3.5 h-3.5 text-white" />
                  </button>
                  <div className="absolute -bottom-5 left-3 w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                    {(vendor?.businessLogo || product.vendor?.image) ? (
                      <img src={vendor?.businessLogo || product.vendor.image} alt={vendor?.businessName || product.vendor?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{(vendor?.businessName || product.vendor?.name)?.charAt(0) || "?"}</span>
                    )}
                  </div>
                </div>
                <div className="px-4 pt-7 pb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-bold text-dark truncate">{vendor?.businessName || product.vendor?.name || "Vendor"}</p>
                    {(vendor?.verificationStatus === "verified" || product.vendor?.verified) && (
                      <FiCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </div>
                  {vendor && (vendor.businessAddress?.city || vendor.businessAddress?.state || vendor.location) && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <FiMapPin className="w-3 h-3" />
                      <span>
                        {[vendor.businessAddress?.city, vendor.businessAddress?.state]
                          .filter(Boolean).join(", ") || vendor.location}
                      </span>
                    </div>
                  )}
                  {(vendor?.averageRating ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <StarRating rating={vendor?.averageRating ?? 0} />
                      <span className="text-[11px] text-gray-400">({vendor?.totalReviews ?? 0})</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleShare}
                      className={`flex-1 flex items-center justify-center gap-1.5 border rounded-xl py-2 text-xs font-medium transition-colors ${
                        shareCopied ? "border-emerald-300 text-emerald-600 bg-emerald-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {shareCopied ? <FiCheck className="w-3.5 h-3.5" /> : <FiShare2 className="w-3.5 h-3.5" />}
                      {shareCopied ? "Copied!" : "Share"}
                    </button>
                    <Link href={`/shops/${product.vendor?.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-dark rounded-xl py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                      <FiShoppingCart className="w-3.5 h-3.5" /> Visit
                    </Link>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 p-4">
                <h3 className="text-sm font-bold text-dark mb-3">Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r._id} className="border-b border-gray-50 pb-3 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                            {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover" /> : r.user?.firstName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-dark">
                              {r.user?.firstName} {r.user?.lastName}
                              {r.verified && <span className="text-primary ml-1 text-[10px] inline-flex items-center gap-0.5"><FiCheck className="w-2.5 h-2.5" strokeWidth={3} /> Verified</span>}
                            </p>
                            <StarRating rating={r.rating} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Product Details + Q&A below the 5-col grid ── */}
          <div className="mt-5 space-y-4 max-w-4xl">

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100/80">
              <h2 className="text-base font-bold text-dark mb-3">Product Details</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || product.shortDescription || "No description available."}
              </p>
              {product.keyFeatures?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {product.keyFeatures.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-1 leading-none">•</span>{f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {questions.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100/80">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-dark flex items-center gap-2">
                    <FiMessageCircle className="w-4 h-4 text-primary" />
                    Questions &amp; Answers
                    <span className="text-sm font-normal text-gray-400">({questions.length})</span>
                  </h2>
                  <button onClick={() => { setShowAskModal(true); setAskError(""); setAskSuccess(false); }}
                    className="text-xs font-semibold text-primary hover:underline">
                    + Ask a Question
                  </button>
                </div>
                <div className="space-y-4">
                  {visibleQuestions.map((q) => (
                    <div key={q._id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">Q</span>
                        </div>
                        <div>
                          <p className="text-sm text-dark">{q.question}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{q.user?.firstName} {q.user?.lastName}</p>
                        </div>
                      </div>
                      {q.answer && (
                        <div className="flex items-start gap-2 ml-8 mt-2 bg-gray-50 rounded-xl p-3">
                          <div className="w-5 h-5 rounded-full bg-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-white">A</span>
                          </div>
                          <p className="text-xs text-gray-600">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {questions.length > 3 && (
                  <button onClick={() => setShowAllQuestions((v) => !v)}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    {showAllQuestions
                      ? <><FiChevronUp className="w-3.5 h-3.5" /> Show less</>
                      : <><FiChevronDown className="w-3.5 h-3.5" /> Show all {questions.length} questions</>}
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Similar Products */}
          {similar.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-6">Similar Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similar.map((p) => (
                  <ProductCard key={p.id} _id={p.id} name={p.name} price={p.price} compareAtPrice={p.originalPrice} discountPercentage={p.discount} averageRating={p.rating} totalReviews={p.reviews} images={p.images} slug={p.slug} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={images[lightboxIndex]}
              alt={product.name}
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(images.length); }}
                className="absolute right-4 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === lightboxIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask a Question Modal */}
      <AnimatePresence>
        {showAskModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAskModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-3xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-dark flex items-center gap-2">
                  <FiMessageCircle className="w-4 h-4 text-primary" /> Ask a Question
                </h3>
                <button onClick={() => setShowAskModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">About: <span className="text-dark font-medium">{product.name}</span></p>
              {askSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <FiCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-dark">Question submitted!</p>
                  <p className="text-sm text-gray-400 mt-1">The vendor will respond shortly.</p>
                </motion.div>
              ) : (
                <>
                  {askError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2 mb-3">{askError}</div>
                  )}
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type your question here…"
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{questionText.length}/1000</span>
                    <button onClick={handleAskQuestion} disabled={askLoading || !questionText.trim()}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full px-5 py-2.5 text-sm transition-colors disabled:opacity-60">
                      <FiSend className="w-3.5 h-3.5" />
                      {askLoading ? "Sending…" : "Submit"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
