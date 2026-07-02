"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appStore";
import { useApi } from "@/lib/useApi";
import type { Category } from "@/lib/api";

const categoryDefs = [
  { name: "Fashion",          image: "/homepage-icons/fasion.png",    keywords: ["fashion", "clothing", "wear", "apparel"] },
  { name: "Groceries",        image: "/homepage-icons/groceries.png", keywords: ["groceries", "grocery", "food", "supermarket"] },
  { name: "Beauty",           image: "/homepage-icons/beauty.png",    keywords: ["beauty", "cosmetic", "skincare", "makeup"] },
  { name: "Gadgets",          image: "/homepage-icons/gadget.png",    keywords: ["gadget", "electronics", "tech", "electrical"] },
  { name: "Jewelry",          image: "/homepage-icons/Jewelry.png",   keywords: ["jewelry", "jewellery", "jewel", "accessories"] },
  { name: "Digital Products", image: "/homepage-icons/digitals.png",  keywords: ["digital", "ebook", "software", "course", "download"] },
];

const arcOffsets = [0, 28, 48, 48, 28, 0];

export default function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [navigating, setNavigating] = useState<string | null>(null);

  const { data: categoriesData } = useApi<{ categories: Category[] }>("/categories");
  const allCategories = categoriesData?.categories ?? null;

  const handleCategoryClick = (def: typeof categoryDefs[0]) => {
    setNavigating(def.name);
    if (allCategories) {
      const match = allCategories.find(c =>
        def.keywords.some(kw =>
          c.slug.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw)
        )
      );
      if (match) {
        router.push(`/products?category=${match.slug}`);
        return;
      }
    }
    // fallback: search by name
    router.push(`/products?q=${encodeURIComponent(def.name)}`);
  };

  return (
    <section
      className="relative overflow-hidden bg-primary"
      style={{ minHeight: "max(600px, 58vw)" }}
    >
      {/* Content in normal flow */}
      <div className="relative z-10 pt-30 sm:pt-33 lg:pt-36">

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-7 sm:mb-10 px-4 leading-tight"
        >
          What do you want to buy?
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-2xl mx-auto px-4 mb-12 sm:mb-16"
        >
          <div className="flex items-center bg-white rounded-full shadow-2xl p-1.5 gap-2">
            <div className="flex items-center gap-2 flex-1 pl-3 sm:pl-5 min-w-0">
              <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands, vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (window.location.href = `/products${search ? `?q=${encodeURIComponent(search)}` : ""}`)}
                className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0 bg-transparent"
              />
            </div>
            <Link
              href={`/products${search ? `?q=${encodeURIComponent(search)}` : ""}`}
              className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-300 shrink-0 shadow-sm"
            >
              Search
            </Link>
          </div>
        </motion.div>

        {/* Category icons — grid on mobile, U-arc on md+ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="px-6 sm:px-8 pb-16 sm:pb-20"
        >
          {/* Mobile: clean 3-column grid, no arc */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 md:hidden">
            {categoryDefs.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
              >
                <button onClick={() => handleCategoryClick(cat)} className="flex flex-col items-center gap-2 group w-full">
                  <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
                    <div className="w-20 h-20 rounded-full bg-white overflow-hidden p-2.5 shadow-md ring-2 ring-transparent transition-all duration-300 relative flex items-center justify-center">
                      {navigating === cat.name ? (
                        <FiLoader className="w-7 h-7 text-primary animate-spin" />
                      ) : (
                        <Image src={cat.image} alt={cat.name} width={80} height={80} className="w-full h-full object-contain" />
                      )}
                    </div>
                  </motion.div>
                  <span className="text-xs font-semibold text-white/75 text-center leading-tight">{cat.name}</span>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Desktop: single-row U-arc */}
          <div className="hidden md:flex justify-center items-start gap-8 lg:gap-14">
            {categoryDefs.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: arcOffsets[i] + 16 }}
                animate={{ opacity: 1, y: arcOffsets[i] }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.07 }}
                className="shrink-0"
              >
                <button onClick={() => handleCategoryClick(cat)} className="flex flex-col items-center gap-3 group">
                  <motion.div
                    whileHover={{ scale: 1.12, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  >
                    <div className="w-24 h-24 rounded-full bg-white overflow-hidden p-2.5
                      shadow-md group-hover:shadow-2xl group-hover:shadow-white/40
                      ring-2 ring-transparent group-hover:ring-white/50
                      transition-all duration-300 relative flex items-center justify-center">
                      {navigating === cat.name ? (
                        <FiLoader className="w-8 h-8 text-primary animate-spin" />
                      ) : (
                        <Image src={cat.image} alt={cat.name} width={96} height={96} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                  </motion.div>
                  <span className="text-sm font-semibold text-white/75 group-hover:text-white text-center leading-tight transition-all duration-300 group-hover:font-bold">
                    {cat.name}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* App download buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row justify-center items-stretch gap-3 sm:gap-4 px-6 pt-8 sm:pt-10 pb-14 sm:pb-20 max-w-md sm:max-w-none mx-auto w-full"
        >
          {[
            {
              label: "Download on Google Play",
              href: PLAY_STORE_URL,
              path: "M3.176 3.09a1.5 1.5 0 0 0-.176.713v16.394c0 .257.063.5.176.713L13.338 12 3.176 3.09zm1.054-.854L14.89 11.15l2.95-2.95L5.665 1.448a1.49 1.49 0 0 0-1.435-.212zM18.95 9.31l-3.06 3.06 3.06 3.06 2.56-1.37a1.5 1.5 0 0 0 0-2.72l-2.56-1.37-.56.34h.56zm-4.16 4.16L4.23 22.764a1.49 1.49 0 0 0 1.435-.212l12.175-6.752-3.05-2.33z",
            },
            {
              label: "Download on App Store",
              href: APP_STORE_URL,
              path: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
            },
          ].map(({ label, href, path }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-2xl px-6 py-3.5 transition-all duration-300 shadow-sm backdrop-blur-sm flex-1 sm:flex-none sm:min-w-52.5"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current shrink-0"><path d={path} /></svg>
              <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
