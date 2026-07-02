"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import {
  FiMapPin, FiShare2, FiUserPlus, FiUserCheck, FiStar,
  FiShoppingBag, FiCheck, FiPackage,
} from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { fadeUp, stagger } from "@/lib/motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface VendorDetail {
  id: string;
  businessName: string;
  businessDescription: string;
  businessLogo: string;
  businessBanner: string;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  verificationStatus: string;
  isPremium: boolean;
  followersCount: number;
  isFollowing: boolean;
  storefront?: { primaryColor?: string };
  location?: string;
  businessAddress?: { city?: string; state?: string; country?: string; street?: string };
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
}

export default function ShopDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMobileDevice(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/vendor/public/${id}`);
        const json = await res.json();
        const v = json.data?.vendor ?? null;
        setVendor(v);
        setProducts(json.data?.products ?? []);
        if (v) {
          setIsFollowing(v.isFollowing ?? false);
          setFollowersCount(v.followersCount ?? 0);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleFollow = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vendorspot_token") : null;
    if (!token) { toast("Please log in to follow vendors.", "info"); return; }
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE}/vendor/${id}/follow`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setIsFollowing(!isFollowing);
        setFollowersCount(json.data?.followersCount ?? followersCount + (isFollowing ? -1 : 1));
      }
    } catch {
      // silently handle
    } finally {
      setFollowLoading(false);
    }
  };

  const openInApp = () => {
    const deepLink = `vendorspot://vendor/${id}`;
    window.location.href = deepLink;
    // If the app isn't installed the deep link silently fails, so fall back to the store after 1.5s
    setTimeout(() => {
      window.location.href =
        /android/i.test(navigator.userAgent)
          ? "https://play.google.com/store/apps/details?id=com.vendorspot.app"
          : "https://apps.apple.com/ng/app/vendorspot-thespot/id6761906107";
    }, 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = vendor?.businessName ? `${vendor.businessName} on Vendorspot` : "Check out this shop on Vendorspot";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast("Link copied!", "success");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast("Could not copy link.", "error");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 mt-12 sm:mt-16">
          <div className="bg-gray-200 h-32 w-full animate-pulse" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm -mt-6 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="bg-gray-200 h-40" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 mt-16">
          <FiPackage className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500 font-medium">Shop not found</p>
          <Link href="/shops" className="text-primary text-sm font-medium hover:underline">
            Browse all shops
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen pt-12 sm:pt-16 pb-16">
        {/* Open in App Banner — mobile/tablet only */}
        {isMobileDevice && (
          <div className="bg-[#CC3366] text-white px-4 py-3 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/VLogo.svg" alt="Vendorspot" className="w-7 h-7 rounded" />
              <span className="text-sm font-medium">View this store in the Vendorspot app</span>
            </div>
            <button
              onClick={openInApp}
              className="bg-white text-[#CC3366] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
            >
              Open App
            </button>
          </div>
        )}

        {/* ── Banner ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-32 sm:h-40 w-full bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden">
          {vendor.businessBanner && (
            <img
              src={vendor.businessBanner}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* subtle dark overlay so avatar pops */}
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        {/* ── Profile card ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm -mt-6 relative z-10 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 -mt-10 sm:-mt-12 ring-2 ring-gray-100">
                {vendor.businessLogo ? (
                  <img src={vendor.businessLogo} alt={vendor.businessName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">{vendor.businessName?.charAt(0) || "?"}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-dark leading-tight">
                    {vendor.businessName}
                  </h1>
                  {vendor.isPremium && (
                    <Image
                      src="/icons/verify.svg"
                      alt="Premium"
                      width={18}
                      height={18}
                      style={{
                        width: 18, height: 18, flexShrink: 0,
                        filter: "brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1500%) hue-rotate(199deg) brightness(101%) contrast(102%)",
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  {vendor.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{vendor.averageRating.toFixed(1)} ({vendor.totalReviews})</span>
                    </div>
                  )}
                  {followersCount > 0 && (
                    <span>{followersCount} {followersCount === 1 ? "follower" : "followers"}</span>
                  )}
                  {vendor.totalSales > 0 && <span>{vendor.totalSales} sales</span>}
                  {(vendor.businessAddress?.city || vendor.businessAddress?.state || vendor.location) && (
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3 shrink-0" />
                      <span>
                        {[vendor.businessAddress?.city, vendor.businessAddress?.state]
                          .filter(Boolean).join(", ") || vendor.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <FiCheck className="w-3.5 h-3.5 text-green-500" /> : <FiShare2 className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Share"}
                </button>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {isFollowing ? <FiUserCheck className="w-3.5 h-3.5" /> : <FiUserPlus className="w-3.5 h-3.5" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            {/* Description */}
            {vendor.businessDescription && (
              <p className="text-sm text-gray-500 leading-relaxed mt-4 pt-4 border-t border-gray-100">
                {vendor.businessDescription}
              </p>
            )}
          </motion.div>

          {/* ── Products ── */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-7">
            <div className="flex items-center gap-2 mb-5">
              <FiShoppingBag className="w-4 h-4 text-dark" />
              <h2 className="text-base font-bold text-dark">Products</h2>
              {products.length > 0 && (
                <span className="text-sm text-gray-400">({products.length})</span>
              )}
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 text-gray-400">
                <FiShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No products listed yet.</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    _id={product._id}
                    name={product.name}
                    price={product.price}
                    images={product.images}
                    slug={product.slug}
                    averageRating={product.averageRating}
                    totalReviews={product.totalReviews}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
