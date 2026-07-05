"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom"; // used for search suggestions dropdown
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {
  FiSearch, FiArrowRight, FiX, FiZap, FiTrendingUp, FiSmartphone,
  FiShoppingBag, FiMonitor, FiHome, FiSliders, FiCheck,
} from "react-icons/fi";
import { useApi } from "@/lib/useApi";
import type { Product, Category } from "@/lib/api";
import { fadeUp, stagger } from "@/lib/motion";

const quickCategories = [
  { label: "Electronics", Icon: FiMonitor,     keywords: ["electronics"] },
  { label: "Fashion",     Icon: FiShoppingBag, keywords: ["fashion"] },
  { label: "Phones",      Icon: FiSmartphone,  keywords: ["mobile-phones"] },
  { label: "Home",        Icon: FiHome,         keywords: ["home-living"] },
  { label: "Deals",       Icon: FiZap,          href: "/products/deals" },
  { label: "Trending",    Icon: FiTrendingUp,   href: "/products/new-arrivals" },
];

const SORT_OPTIONS = [
  { value: "",           label: "Default" },
  { value: "newest",    label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc",label: "Price: High → Low" },
  { value: "rating",    label: "Top Rated" },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT — Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const fallbackProducts = Array.from({ length: 5 }, (_, i) => ({
  id: String(i), _id: String(i),
  name: "Sample Product", price: 45000, compareAtPrice: 56250, discountPercentage: 20,
  averageRating: 4.8, totalReviews: 120, images: [], slug: "",
  color: ["bg-red-100","bg-amber-100","bg-emerald-100","bg-sky-100","bg-violet-100"][i],
}));

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-100 h-40 sm:h-48" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, titleColor = "text-dark", badge, viewAllHref }: {
  title: string; icon?: string; titleColor?: string; badge?: string; viewAllHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 sm:mb-8 px-4">
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5 min-w-0"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg sm:text-xl">{icon}</span>}
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${titleColor} leading-tight`}>{title}</h2>
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full self-start">
            {badge}
          </span>
        )}
      </motion.div>
      {viewAllHref && (
        <Link href={viewAllHref} className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-400 hover:text-primary transition-colors group shrink-0 whitespace-nowrap mt-0.5">
          View All <FiArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

const FLEX_ITEM_CLASS: Record<number, string> = {
  2: "w-[calc(50%-6px)]",
  3: "w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)]",
  4: "w-[calc(50%-6px)] sm:w-[calc(25%-12px)]",
  5: "w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]",
};

function ProductSection({
  title, icon, titleColor = "text-dark", badge,
  products, loading, fallback, horizontal = false,
  cols = 5, displayLimit = 10, viewAllHref,
}: {
  title: string; icon?: string; titleColor?: string; badge?: string;
  products: Product[] | null; loading: boolean; fallback: typeof fallbackProducts;
  horizontal?: boolean; cols?: 2 | 3 | 4 | 5; displayLimit?: number; viewAllHref?: string;
}) {
  const raw = products && products.length > 0 ? products : loading ? [] : fallback;
  const items = raw.slice(0, displayLimit);

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title={title} icon={icon} titleColor={titleColor} badge={badge} viewAllHref={viewAllHref} />
        {horizontal ? (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex-shrink-0 w-40 sm:w-44"><ProductSkeleton /></div>
                ))
              : items.map((product, i) => (
                  <div key={product.id || product._id} className="flex-shrink-0 w-40 sm:w-44">
                    <ProductCard {...product} priority={i < 4} />
                  </div>
                ))}
          </div>
        ) : (
          <motion.div
            key={loading ? "loading" : "loaded"}
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-wrap gap-3 sm:gap-4 px-4"
          >
            {loading
              ? Array.from({ length: Math.min(displayLimit, 8) }, (_, i) => (
                  <div key={i} className={FLEX_ITEM_CLASS[cols]}><ProductSkeleton /></div>
                ))
              : items.map((product, i) => (
                  <motion.div key={product.id || product._id} variants={fadeUp} className={FLEX_ITEM_CLASS[cols]}>
                    <ProductCard {...product} priority={i < 6} />
                  </motion.div>
                ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ─── Inline Filter Panel ─── */
function FilterPanel({
  open,
  sortBy, setSortBy,
  activeCategory, setActiveCategory,
  activeState, setActiveState,
  categories,
  onClear, onApply,
}: {
  open: boolean;
  sortBy: string; setSortBy: (v: string) => void;
  activeCategory: string; setActiveCategory: (v: string) => void;
  activeState: string; setActiveState: (v: string) => void;
  categories: Category[] | null;
  onClear: () => void; onApply: () => void;
}) {
  const sortedCategories = useMemo(
    () => [...(categories || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  const selectCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white";
  const labelCls = "text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="filter-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 pb-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5">

              {/* Sort By — horizontal scrollable chips, works on all screens */}
              <div className="mb-5">
                <p className={labelCls}>Sort By</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                        sortBy === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {sortBy === opt.value && <FiCheck className="w-3 h-3" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category + State — side by side on sm+, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>Category</p>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">All Categories</option>
                    {sortedCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className={labelCls}>Vendor State</p>
                  <select
                    value={activeState}
                    onChange={(e) => setActiveState(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">All States</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={onClear}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={onApply}
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  const [search, setSearch] = useState(urlQuery);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSort, setDraftSort] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftState, setDraftState] = useState("");
  const [appliedSort, setAppliedSort] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [appliedState, setAppliedState] = useState("");

  const toggleFilter = () => {
    if (!filterOpen) {
      setDraftSort(appliedSort);
      setDraftCategory(appliedCategory);
      setDraftState(appliedState);
    }
    setFilterOpen(v => !v);
  };

  const applyFilters = () => {
    setAppliedSort(draftSort);
    setAppliedCategory(draftCategory);
    setAppliedState(draftState);
    setFilterOpen(false);
  };

  const openFilter = toggleFilter;

  useEffect(() => { setSearch(urlQuery); }, [urlQuery]);

  // Capture affiliate ref code
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      sessionStorage.setItem("affiliateCode", ref);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/affiliate/track/${ref}`).catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (!search.trim() || search.trim().length < 2) { setSuggestions([]); return; }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?q=${encodeURIComponent(search.trim())}`);
        const json = await res.json();
        const list = json.data?.suggestions;
        setSuggestions(Array.isArray(list) ? list.map((s: { name: string }) => s.name).slice(0, 6) : []);
      } catch { setSuggestions([]); }
    }, 280);
    return () => { if (suggestDebounce.current) clearTimeout(suggestDebounce.current); };
  }, [search]);

  useEffect(() => {
    if (showSuggestions && suggestions.length > 0 && searchWrapperRef.current) {
      setDropdownRect(searchWrapperRef.current.getBoundingClientRect());
    }
  }, [showSuggestions, suggestions]);

  const { data: allCategories } = useApi<Category[]>("/categories");
  const resolvedCategory = allCategories?.find(c => c.slug === categorySlug);
  const categoryId = resolvedCategory?._id ?? null;
  const { data: categoryProducts, loading: loadingCategory } = useApi<Product[]>(
    categoryId ? `/products/category/${categoryId}?limit=20` : null
  );

  const filterCategoryObj = allCategories?.find(c => c._id === appliedCategory);
  const filterCategoryId = filterCategoryObj?._id ?? null;

  const handleSearch = () => {
    const q = search.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/products");
  };

  const isFiltered = !!(urlQuery || categorySlug);
  const isCustomFiltered = !!(appliedSort || appliedCategory || appliedState) && !isFiltered;
  const appliedCount = [appliedSort, appliedCategory, appliedState].filter(Boolean).length;

  const searchEndpoint = urlQuery ? `/products/search?q=${encodeURIComponent(urlQuery)}&limit=20` : null;
  const { data: searchResults, loading: searchLoading } = useApi<Product[]>(searchEndpoint);

  const norm = (v: string) =>
    v.toLowerCase().replace(/\s+state$/i, "").replace(/\s*[—–-]+\s*\w+$/i, "").trim();

  const stateParam = appliedState ? `&state=${encodeURIComponent(appliedState)}` : "";

  const categoryFilterEndpoint = (isCustomFiltered && filterCategoryId)
    ? `/products?category=${filterCategoryId}&limit=60${stateParam}`
    : null;
  const { data: categoryFilterRaw, loading: loadingCatFilter } = useApi<Product[]>(categoryFilterEndpoint);

  const broadFilterEndpoint = (isCustomFiltered && !filterCategoryId)
    ? `/products?limit=80${stateParam}`
    : null;
  const { data: broadFilterRaw, loading: loadingBroadFilter } = useApi<Product[]>(broadFilterEndpoint);

  const loadingAll = loadingCatFilter || loadingBroadFilter;

  const filteredProducts = useMemo(() => {
    if (!isCustomFiltered) return null;
    const raw = filterCategoryId ? categoryFilterRaw : broadFilterRaw;
    if (!raw) return null;
    let list = [...raw];

    // Sort (client-side — state is filtered by the API)
    if (appliedSort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (appliedSort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (appliedSort === "rating") list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

    return list;
  }, [isCustomFiltered, filterCategoryId, categoryFilterRaw, broadFilterRaw, appliedSort]);

  const { data: newArrivals,   loading: loadingNew     } = useApi<Product[]>(isFiltered ? null : "/products/new-arrivals?limit=20");
  const { data: recommended,   loading: loadingRec     } = useApi<Product[]>(isFiltered ? null : "/products/recommended?limit=10");
  const { data: flashSales,    loading: loadingFlash   } = useApi<Product[]>(isFiltered ? null : "/products/flash-sales?limit=10");
  const { data: trending,      loading: loadingTrend   } = useApi<Product[]>(isFiltered ? null : "/products/trending?limit=10");
  const { data: digital,       loading: loadingDigital } = useApi<Product[]>(isFiltered ? null : "/products?productType=digital&limit=10");

  const clearApplied = () => { setAppliedSort(""); setAppliedCategory(""); setAppliedState(""); };
  const appliedSortLabel = SORT_OPTIONS.find(o => o.value === appliedSort)?.label ?? "Featured";

  return (
    <>
      <Navbar />

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 text-center"
          style={{ backgroundColor: "#8A38F5" }}>
          <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", transform: "translate(35%,-35%)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4"
            >
              Thousands of verified products
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 sm:mb-8"
            >
              Find your<br className="hidden sm:block" /> favourite item
            </motion.h1>

            {/* Search bar */}
            <motion.div
              ref={searchWrapperRef}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <div className={`flex items-center bg-white rounded-full shadow-2xl p-1.5 gap-2 transition-all duration-300 ${focused ? "ring-4 ring-white/30" : ""}`}>
                <div className="flex items-center gap-2 flex-1 pl-3 sm:pl-5 min-w-0">
                  <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products, brands…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); handleSearch(); } }}
                    onFocus={() => { setFocused(true); setShowSuggestions(true); }}
                    onBlur={() => { setFocused(false); setTimeout(() => setShowSuggestions(false), 150); }}
                    className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0"
                  />
                  {search && (
                    <button onClick={clearSearch} className="p-1 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-300 shrink-0 shadow-sm"
                >
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && dropdownRect && createPortal(
                <div
                  style={{ position: "fixed", top: dropdownRect.bottom + 8, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
                  className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => { setSearch(s); setShowSuggestions(false); router.push(`/products?q=${encodeURIComponent(s)}`); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </motion.div>

            {/* Quick category pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              {quickCategories.map(({ label, Icon, keywords, href }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (href) {
                      router.push(href);
                      return;
                    }
                    if (keywords && allCategories) {
                      const match = allCategories.find(c =>
                        keywords.some(kw =>
                          c.slug.toLowerCase().includes(kw) ||
                          c.name.toLowerCase().includes(kw)
                        )
                      );
                      if (match) {
                        router.push(`/products?category=${match.slug}`);
                        return;
                      }
                    }
                    // Fallback to text search
                    setSearch(label);
                    router.push(`/products?q=${encodeURIComponent(label)}`);
                  }}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust ticker */}
        {(() => {
          const single = 'What you see is what you get. If your order is significantly different, you\'re eligible for a refund.';
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

        <AnimatePresence mode="wait">
          {urlQuery ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}
            >
              <section className="py-10 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-dark">
                        Results for &ldquo;{urlQuery}&rdquo;
                      </h2>
                      {!searchLoading && searchResults && (
                        <p className="text-sm text-gray-400 mt-1">
                          {searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found
                        </p>
                      )}
                    </div>
                    <button onClick={clearSearch} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                      <FiX className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  {searchLoading ? (
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {Array.from({ length: 10 }, (_, i) => <div key={i} className={FLEX_ITEM_CLASS[5]}><ProductSkeleton /></div>)}
                    </div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                        <FiSearch className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-dark mb-2">No products found</p>
                      <p className="text-sm text-gray-400 mb-6 max-w-xs">Try a different keyword or browse popular categories below</p>
                      <button onClick={clearSearch} className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                        Browse All Products
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-wrap gap-3 sm:gap-4">
                      {searchResults.map((product) => (
                        <motion.div key={product.id || product._id} variants={fadeUp} className={FLEX_ITEM_CLASS[5]}>
                          <ProductCard {...product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </section>
            </motion.div>

          ) : categorySlug ? (
            <motion.div
              key="category-results"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}
            >
              <section className="py-10 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-dark capitalize">
                        {resolvedCategory?.name ?? categorySlug}
                      </h2>
                      {!loadingCategory && categoryProducts && (
                        <p className="text-sm text-gray-400 mt-1">
                          {categoryProducts.length} product{categoryProducts.length !== 1 ? "s" : ""} found
                        </p>
                      )}
                    </div>
                    <button onClick={() => router.push("/products")} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                      <FiX className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  {loadingCategory || (!categoryId && categorySlug) ? (
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {Array.from({ length: 10 }, (_, i) => <div key={i} className={FLEX_ITEM_CLASS[5]}><ProductSkeleton /></div>)}
                    </div>
                  ) : !categoryProducts || categoryProducts.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                        <FiSearch className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-dark mb-2">No products in this category</p>
                      <p className="text-sm text-gray-400 mb-6 max-w-xs">Check back later or browse all products</p>
                      <button onClick={() => router.push("/products")} className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                        Browse All Products
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-wrap gap-3 sm:gap-4">
                      {categoryProducts.map((product) => (
                        <motion.div key={product.id || product._id} variants={fadeUp} className={FLEX_ITEM_CLASS[5]}>
                          <ProductCard {...product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </section>
            </motion.div>

          ) : isCustomFiltered ? (
            /* ── Filtered results ── */
            <motion.div
              key={`filtered-${appliedSort}-${appliedCategory}-${appliedState}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              {/* Filter button row */}
              <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 flex items-center justify-end">
                <button
                  onClick={toggleFilter}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
                    filterOpen
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FiSliders className="w-4 h-4" />
                  Filter & Sort
                  {appliedCount > 0 && !filterOpen && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {appliedCount}
                    </span>
                  )}
                </button>
              </div>

              <FilterPanel
                open={filterOpen}
                sortBy={draftSort} setSortBy={setDraftSort}
                activeCategory={draftCategory} setActiveCategory={setDraftCategory}
                activeState={draftState} setActiveState={setDraftState}
                categories={allCategories ?? null}
                onClear={() => { setDraftSort(""); setDraftCategory(""); setDraftState(""); setAppliedSort(""); setAppliedCategory(""); setAppliedState(""); setFilterOpen(false); }}
                onApply={applyFilters}
              />

              <section className="py-6 px-4">
                <div className="max-w-7xl mx-auto">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-dark">
                        {filterCategoryObj ? filterCategoryObj.name : "All Products"}
                      </h2>
                      {!loadingAll && filteredProducts && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</span>
                          {appliedSort && <span className="text-gray-300">·</span>}
                          {appliedSort && <span>{appliedSortLabel}</span>}
                          {appliedState && <span className="text-gray-300">·</span>}
                          {appliedState && <span>{appliedState}</span>}
                        </p>
                      )}
                    </div>
                    <button onClick={clearApplied} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
                      <FiX className="w-3.5 h-3.5" /> Clear all
                    </button>
                  </div>

                  {loadingAll ? (
                    <div className="flex flex-wrap gap-5 sm:gap-7">
                      {Array.from({ length: 10 }, (_, i) => <div key={i} className={FLEX_ITEM_CLASS[5]}><ProductSkeleton /></div>)}
                    </div>
                  ) : !filteredProducts || filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                        <FiSliders className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-dark mb-2">No products match</p>
                      <p className="text-sm text-gray-400 mb-6 max-w-xs">Try adjusting your filters</p>
                      <button onClick={openFilter} className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                        Edit Filters
                      </button>
                    </div>
                  ) : (
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-wrap gap-5 sm:gap-7">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id || product._id} variants={fadeUp} className={FLEX_ITEM_CLASS[5]}>
                          <ProductCard {...product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </section>
            </motion.div>

          ) : (
            /* ── Default browse view ── */
            <motion.div
              key="browse"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            >
              {/* Filter button row */}
              <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 flex items-center justify-end">
                <button
                  onClick={toggleFilter}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
                    filterOpen
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FiSliders className="w-4 h-4" />
                  Filter & Sort
                  {appliedCount > 0 && !filterOpen && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {appliedCount}
                    </span>
                  )}
                </button>
              </div>

              <FilterPanel
                open={filterOpen}
                sortBy={draftSort} setSortBy={setDraftSort}
                activeCategory={draftCategory} setActiveCategory={setDraftCategory}
                activeState={draftState} setActiveState={setDraftState}
                categories={allCategories ?? null}
                onClear={() => { setDraftSort(""); setDraftCategory(""); setDraftState(""); setAppliedSort(""); setAppliedCategory(""); setAppliedState(""); setFilterOpen(false); }}
                onApply={applyFilters}
              />

              <ProductSection title="New Arrivals" icon="✨" products={newArrivals} loading={loadingNew} fallback={fallbackProducts} cols={5} displayLimit={20} viewAllHref="/products/new-arrivals" />
              <ProductSection title="Recommended for You" titleColor="text-primary" badge="Personalised" products={recommended} loading={loadingRec} fallback={fallbackProducts} horizontal displayLimit={10} viewAllHref="/products/recommended" />
              <ProductSection title="Deals &amp; Discounts" icon="⚡" badge="Limited Time" products={flashSales} loading={loadingFlash} fallback={fallbackProducts} cols={5} displayLimit={10} viewAllHref="/products/deals" />

              {/* Digital banner */}
              <section className="px-4 py-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-dark px-5 sm:px-8 md:px-12 py-8 sm:py-10 md:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(138,56,245,0.25) 0%, transparent 60%)" }} />
                  <div className="relative z-10">
                    <span className="text-accent text-xs font-bold tracking-widest uppercase mb-2 block">Instant Delivery</span>
                    <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 leading-tight">Digital Products</h3>
                    <p className="text-white/50 text-sm mb-4 sm:mb-6">E-books, courses, software keys &amp; more — delivered instantly.</p>
                    <Link href="/products/digital" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-dark text-sm font-bold rounded-xl px-5 py-2.5 transition-colors">
                      Browse Digital <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="relative z-10 hidden sm:flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl w-24 h-24 shrink-0">
                    <span className="text-4xl text-white/80 font-mono font-bold select-none">&lt;/&gt;</span>
                  </div>
                </motion.div>
              </section>

              <ProductSection title="Digital Products" products={digital} loading={loadingDigital} fallback={fallbackProducts} cols={5} displayLimit={10} viewAllHref="/products/digital" />
              <ProductSection title="Trending Now" icon="🔥" products={trending} loading={loadingTrend} fallback={fallbackProducts} cols={5} displayLimit={10} viewAllHref="/products/new-arrivals" />

              {/* View All section */}
              <section className="px-4 py-8 sm:py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-dark px-6 sm:px-12 py-12 sm:py-16 text-center"
                >
                  {/* subtle dot grid */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                  {/* faint pink accent glow */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(204,51,102,0.18) 0%, transparent 70%)" }} />
                  <div className="relative z-10">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Explore Everything</p>
                    <h3 className="text-white text-2xl sm:text-4xl font-extrabold mb-3 leading-tight">Browse All Products</h3>
                    <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                      Thousands of items across every category — sorted, filtered, and ready to shop.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link href="/products/new-arrivals" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold rounded-full px-6 py-3 hover:bg-primary-dark transition-colors shadow-lg">
                        New Arrivals <FiArrowRight className="w-4 h-4" />
                      </Link>
                      <Link href="/products/deals" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-bold rounded-full px-6 py-3 transition-colors">
                        Deals &amp; Discounts <FiZap className="w-4 h-4" />
                      </Link>
                      <Link href="/products/digital" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-bold rounded-full px-6 py-3 transition-colors">
                        Digital Products
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
