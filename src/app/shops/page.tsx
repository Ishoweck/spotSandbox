"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  FiSearch, FiMapPin, FiShare2,
  FiUserPlus, FiX, FiCheck, FiShoppingBag, FiArrowRight, FiFilter, FiChevronDown,
} from "react-icons/fi";
import { useApi } from "@/lib/useApi";
import type { VendorProfile } from "@/lib/api";
import { useToast } from "@/components/Toast";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT — Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

/* ─── palette ─── */
const COVER_GRADIENTS = [
  "from-rose-400 to-orange-300",
  "from-violet-500 to-fuchsia-400",
  "from-sky-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-yellow-300",
  "from-pink-500 to-rose-400",
  "from-indigo-500 to-blue-400",
  "from-orange-500 to-amber-400",
  "from-teal-500 to-emerald-400",
  "from-fuchsia-500 to-pink-400",
];

const AVATAR_BG = [
  "bg-rose-500","bg-violet-600","bg-sky-500","bg-emerald-500",
  "bg-amber-500","bg-pink-600","bg-indigo-500","bg-orange-500",
];

/* seller bubble arc — 6 items, U-shape */
const ARC_Y = [0, 28, 48, 48, 28, 0];

/* ─── skeleton ─── */
function ShopSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 animate-pulse flex flex-col" style={{ minHeight: 300 }}>
      <div className="h-32 bg-gray-100 flex-shrink-0" />
      <div className="px-4 pt-10 pb-5 flex flex-col gap-3 flex-1">
        <div className="h-4 bg-gray-100 rounded-full w-3/5" />
        <div className="h-3 bg-gray-100 rounded-full w-2/5" />
        <div className="h-3 bg-gray-100 rounded-full w-full mt-1" />
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        <div className="flex gap-2 mt-auto pt-3">
          <div className="h-9 bg-gray-100 rounded-2xl flex-1" />
          <div className="h-9 bg-gray-100 rounded-2xl flex-1" />
        </div>
      </div>
    </div>
  );
}

/* ─── shop card ─── */
function ShopCard({ shop, index, compact = false }: { shop: VendorProfile; index: number; compact?: boolean }) {
  const grad = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const avatarBg = AVATAR_BG[index % AVATAR_BG.length];
  const { toast } = useToast();
  const [following, setFollowing] = useState(shop.isFollowing ?? false);
  const [copied, setCopied] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("vendorspot_token") : null;
    if (!token) {
      toast("Please log in to follow shops", "info");
      return;
    }
    const nowFollowing = !following;
    setFollowing(nowFollowing);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/${shop.id}/follow`, {
        method: nowFollowing ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        toast(nowFollowing ? `Now following ${shop.name}` : `Unfollowed ${shop.name}`, nowFollowing ? "success" : "info");
      } else {
        setFollowing(!nowFollowing);
        toast("Something went wrong. Please try again.", "error");
      }
    } catch {
      setFollowing(!nowFollowing);
      toast("Something went wrong. Please try again.", "error");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/shops/${shop.id}`;
    if (navigator.share) {
      navigator.share({ title: shop.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.055, ease: "easeOut" }}
      className={`group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border ${shop.isPremium ? "border-primary/30 hover:border-primary/60" : "border-gray-100 hover:border-gray-200"}`}
    >
      {/* cover */}
      <div className={`relative flex-shrink-0 overflow-hidden ${compact ? "h-14 sm:h-16" : "h-24 sm:h-28"}`}>
        {shop.coverImage ? (
          <img src={shop.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`bg-gradient-to-br ${grad} w-full h-full`}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 70%)" }} />
          </div>
        )}

        {/* follow button */}
        <button
          onClick={handleFollow}
          className={`absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full flex items-center justify-center transition-all border shadow-sm ${
            following
              ? "bg-white border-white text-primary"
              : "bg-black/20 hover:bg-black/30 border-white/20 text-white"
          }`}
          title={following ? "Unfollow" : "Follow"}
        >
          {following
            ? <FiCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
            : <FiUserPlus className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* avatar — overlaps cover */}
      <div className={`px-2 sm:px-3 relative z-10 flex items-end justify-between ${compact ? "-mt-4" : "-mt-5 px-3 sm:px-4"}`}>
        <div className={`rounded-full bg-white shadow-md ring-2 ${shop.isPremium ? "ring-primary/40" : "ring-white"} overflow-hidden flex items-center justify-center flex-shrink-0 ${compact ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"}`}>
          {shop.image ? (
            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${avatarBg} flex items-center justify-center`}>
              <span className="text-sm sm:text-base font-black text-white">{shop.name?.charAt(0) || "?"}</span>
            </div>
          )}
        </div>

        {/* share */}
        <button
          onClick={handleShare}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800 mb-1"
          title="Share"
        >
          {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiShare2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* body */}
      <div className={`flex flex-col flex-1 ${compact ? "px-2 pt-1.5 pb-2" : "px-3 sm:px-4 pt-2 pb-3 sm:pb-4"}`}>
        {/* name + badge */}
        <div className="flex items-center gap-1 mb-0.5">
          <p className={`font-bold text-gray-900 truncate leading-snug ${compact ? "text-[11px]" : "text-sm"}`}>{shop.name}</p>
          {shop.isPremium && (
            <Image
              src="/icons/verify.svg"
              alt="Premium"
              width={14}
              height={14}
              style={{
                width: 14, height: 14, flexShrink: 0,
                filter: "brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1500%) hue-rotate(199deg) brightness(101%) contrast(102%)",
              }}
            />
          )}
        </div>

        {/* location */}
        {!compact && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
            <FiMapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">
              {[shop.businessAddress?.city, shop.businessAddress?.state].filter(Boolean).join(", ") || shop.location || "Nigeria"}
            </span>
          </div>
        )}

        {/* description */}
        {!compact && (
          <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-3">
            {shop.description || "Visit this shop to explore their products and collections."}
          </p>
        )}

        {/* shop button */}
        <Link
          href={`/shops/${shop.id}`}
          className={`flex items-center justify-center gap-1 bg-gray-900 hover:bg-gray-700 rounded-lg text-white font-semibold transition-all ${compact ? "py-1.5 text-[10px] mt-1.5" : "py-2 sm:py-2.5 text-xs gap-1.5 rounded-xl mt-0"}`}
        >
          <FiShoppingBag className={compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
          {compact ? "Shop" : "Visit Shop"}
        </Link>
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 12;

/* ─── page ─── */
export default function ShopsPage() {
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [gridSize, setGridSize] = useState<"comfortable" | "compact">("comfortable");
  const [selectedState, setSelectedState] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(search.trim()), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedQ, selectedState]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Top sellers arc — always uses /vendor/top
  const { data: topVendors, loading: topLoading } = useApi<VendorProfile[]>("/vendor/top");

  // All shops grid — fetch all vendors with a high limit
  const allEndpoint = debouncedQ
    ? `/vendor/top?q=${encodeURIComponent(debouncedQ)}&limit=200`
    : "/vendor/top?limit=200";
  const { data: vendors, loading } = useApi<VendorProfile[]>(allEndpoint);

  const clearSearch = () => { setSearch(""); setDebouncedQ(""); setPage(1); };
  const isSearching = debouncedQ.length > 0;

  // Arc: weekly top vendors first (with userAvatar), fall back to all vendors to always fill 6
  const arcSellers = useMemo(() => {
    const sortFn = (a: VendorProfile, b: VendorProfile) => {
      if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
      return (b.rating ?? 0) - (a.rating ?? 0);
    };
    const primary = [...(topVendors || [])]
      .filter((v) => !!v.userAvatar)
      .sort(sortFn);
    if (primary.length >= 6) return primary.slice(0, 6);
    const primaryIds = new Set(primary.map((v) => v.id));
    const fallback = [...(vendors || [])]
      .filter((v) => !primaryIds.has(v.id) && !!(v.userAvatar || v.image))
      .sort(sortFn);
    return [...primary, ...fallback].slice(0, 6);
  }, [topVendors, vendors]);

  const allShops = useMemo(() => {
    const base = vendors || [];
    if (!selectedState) return base;
    // Normalize: lowercase, strip " State" suffix, strip " — Abuja" / "- abuja" variants
    const norm = (v: string) =>
      v.toLowerCase()
        .replace(/\s+state$/i, "")
        .replace(/\s*[—–-]+\s*\w+$/i, "")
        .trim();
    const needle = norm(selectedState);
    return base.filter((s) => {
      const raw = norm(s.businessAddress?.state || s.location || "");
      return raw === needle || raw.includes(needle) || needle.includes(raw);
    });
  }, [vendors, selectedState]);

  const totalPages = Math.ceil(allShops.length / PAGE_SIZE);
  const pageShops = allShops.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(p);
    setTimeout(() => {
      if (gridRef.current) {
        const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F7F6F3]">

        {/* ── Hero ── */}
        <section className="relative bg-[#FFD600] overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute top-8 right-16 w-56 h-56 rounded-full bg-yellow-400/50 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-8 w-40 h-40 rounded-full bg-amber-300/40 blur-2xl pointer-events-none" />
          {/* dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <div className="relative z-10 flex flex-col items-center pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 text-center gap-5 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3 sm:gap-4"
            >
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight">
                Discover<br />Amazing Shops
              </h1>
              <p className="text-gray-700/75 text-sm sm:text-base max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                Thousands of verified vendors. Safe escrow. Guaranteed delivery.
              </p>
            </motion.div>

            {/* search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="flex items-center bg-white rounded-full shadow-2xl shadow-black/15 p-1.5 gap-2">
                <div className="flex items-center gap-2 flex-1 pl-3 sm:pl-5 min-w-0">
                  <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search shops, vendors…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-0"
                  />
                  {search && (
                    <button onClick={clearSearch} className="p-1 text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                      <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
                <button className="bg-gray-900 hover:bg-gray-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-300 shrink-0 shadow-sm">
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust ticker */}
        {(() => {
          const single = 'Verified Vendors Only — We verify every vendor so you can shop with peace of mind.';
          const items = Array.from({ length: 12 }, () => single);
          return (
            <div className="overflow-hidden py-3 border-y border-white/20" style={{ background: '#d7004b' }}>
              <div
                style={{
                  display: 'flex',
                  width: 'max-content',
                  animation: 'ticker 120s linear infinite',
                }}
              >
                {[...items, ...items].map((text, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center shrink-0 text-white text-xs sm:text-sm font-semibold"
                    style={{ paddingLeft: '8rem', paddingRight: '8rem' }}
                  >
                    {text}
                    <span className="ml-12 text-white/30">✦</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Top Sellers arc ── */}
        <AnimatePresence>
  {!isSearching && (
    <motion.section
      initial={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-b border-gray-100"
      style={{ background: "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 pb-6">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Top Sellers</h2>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              This week
            </span>
          </div>
          <a
            href="#all-shops"
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            See all <FiArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* arc row — mirrors landing page category icons */}
        <div className="flex flex-wrap justify-center items-start gap-5 sm:gap-8 md:gap-14 px-4 sm:px-6 pb-14">
          {topLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 shrink-0 animate-pulse"
                  style={{ transform: `translateY(${isMobile ? 0 : (ARC_Y[i] ?? 0)}px)` }}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-md ring-2 ring-gray-100 p-2.5">
                    <div className="w-full h-full rounded-full bg-gray-100" />
                  </div>
                  <div className="w-14 h-2.5 bg-gray-100 rounded-full" />
                </div>
              ))
            : arcSellers.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: (isMobile ? 0 : (ARC_Y[i] ?? 0)) + 16 }}
                  animate={{ opacity: 1, y: isMobile ? 0 : (ARC_Y[i] ?? 0) }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
                  className="shrink-0"
                >
                  <Link href={`/shops/${vendor.id}`} className="group flex flex-col items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.12, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="relative"
                    >
                      {i === 0 && (
                        <div className="absolute inset-0 rounded-full bg-amber-300/40 blur-md scale-110 -z-10" />
                      )}

                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white overflow-hidden p-2.5
                        shadow-md group-hover:shadow-2xl group-hover:shadow-black/10
                        ring-2 transition-all duration-300
                        ${vendor.isPremium
                          ? "ring-primary group-hover:ring-primary"
                          : "ring-transparent group-hover:ring-gray-200"}`}>
                        {(vendor.userAvatar || vendor.image) ? (
                          <Image src={vendor.userAvatar || vendor.image} alt={vendor.name} width={96} height={96} className="w-full h-full object-cover rounded-full" style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <div className={`w-full h-full rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center`}>
                            <span className="text-xl sm:text-2xl font-black text-white select-none">
                              {vendor.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      {i === 0 && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base leading-none select-none">
                          👑
                        </span>
                      )}

                      {vendor.isPremium && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center">
                          <Image
                            src="/icons/verify.svg"
                            alt="Premium"
                            width={20}
                            height={20}
                            style={{
                              width: 20, height: 20,
                              filter: "brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1500%) hue-rotate(199deg) brightness(101%) contrast(102%)",
                            }}
                          />
                        </span>
                      )}
                    </motion.div>

                    <span className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-900 text-center max-w-[84px] sm:max-w-[96px] leading-tight transition-colors duration-200 truncate">
                      {vendor.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
        </div>

      </div>
    </motion.section>
  )}
</AnimatePresence>

        {/* ── All Shops grid ── */}
        <section id="all-shops" className="py-8 sm:py-10 px-4" ref={gridRef}>
          <div className="max-w-6xl mx-auto">
            {/* header row */}
            <div className="flex items-center justify-between mb-6">
              <motion.h2
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight"
              >
                {isSearching ? (
                  <span>
                    Results for <span className="text-yellow-500">&ldquo;{debouncedQ}&rdquo;</span>
                    {!loading && vendors && (
                      <span className="text-base font-normal text-gray-400 ml-2">({vendors.length})</span>
                    )}
                  </span>
                ) : (
                  <span className="mb-3">
                    {selectedState ? `Shops in ${selectedState}` : "All Shops"}
                    {allShops.length > 0 && !loading && (
                      <span className="text-base font-normal text-gray-400 ml-2">({allShops.length})</span>
                    )}
                  </span>
                )}
              </motion.h2>
              <div className="flex items-center gap-2">
                {isSearching && (
                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <FiX className="w-3.5 h-3.5" /> Clear
                  </button>
                )}

                {/* state filter */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      selectedState
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    <FiFilter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{selectedState || "Filter by State"}</span>
                    <span className="sm:hidden">{selectedState || "State"}</span>
                    <FiChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                  </button>

                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="max-h-72 overflow-y-auto py-1">
                        <button
                          onClick={() => { setSelectedState(""); setFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                            !selectedState ? "text-primary bg-primary/5" : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          All States
                        </button>
                        {NIGERIAN_STATES.map((state) => (
                          <button
                            key={state}
                            onClick={() => { setSelectedState(state); setFilterOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                              selectedState === state
                                ? "text-primary bg-primary/5 font-semibold"
                                : "text-gray-700 hover:bg-gray-50 font-medium"
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* grid size toggle */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setGridSize("comfortable")}
                    title="Comfortable"
                    className={`p-1.5 rounded-lg transition-all ${gridSize === "comfortable" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    <div className="grid grid-cols-2 gap-[2px] w-3.5 h-3.5">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-current rounded-[1px]" />)}
                    </div>
                  </button>
                  <button
                    onClick={() => setGridSize("compact")}
                    title="Compact"
                    className={`p-1.5 rounded-lg transition-all ${gridSize === "compact" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    <div className="grid grid-cols-3 gap-[2px] w-3.5 h-3.5">
                      {Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-current rounded-[1px]" />)}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* grid with AnimatePresence keyed to search query */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`grid gap-2 sm:gap-3 ${
                    gridSize === "compact"
                      ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  }`}
                >
                  {Array.from({ length: 8 }, (_, i) => <ShopSkeleton key={i} />)}
                </motion.div>
              ) : allShops.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-28 text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                    <FiShoppingBag className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-base font-bold text-gray-800 mb-1">
                    {isSearching ? "No shops found" : selectedState ? `No shops in ${selectedState}` : "No shops yet"}
                  </p>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs">
                    {isSearching
                      ? `Nothing matched "${debouncedQ}". Try something different.`
                      : selectedState
                      ? "Try a different state or browse all shops."
                      : "Check back soon — vendors are joining daily."}
                  </p>
                  {(isSearching || selectedState) && (
                    <button
                      onClick={() => { clearSearch(); setSelectedState(""); }}
                      className="bg-gray-900 text-white text-sm font-bold px-6 py-2.5 rounded-2xl hover:bg-gray-700 transition-colors"
                    >
                      Browse All Shops
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${debouncedQ}-${selectedState}-${page}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`grid gap-2 sm:gap-3 ${
                    gridSize === "compact"
                      ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  }`}
                >
                  {pageShops.map((shop, i) => <ShopCard key={shop.id} shop={shop} index={i} compact={gridSize === "compact"} />)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 sm:mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiArrowRight className="w-4 h-4 rotate-180" /> Previous
                </button>

                <span className="text-sm text-gray-500 font-medium">
                  Page <span className="text-gray-900 font-bold">{page}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
                </span>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}