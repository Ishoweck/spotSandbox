"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { FiZap, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePagedApi } from "@/lib/useApi";
import type { Product } from "@/lib/api";
import { fadeUp, stagger } from "@/lib/motion";

const PAGE_SIZE = 20;

const digitalCategories = [
  { label: "E-Books",       emoji: "📚" },
  { label: "Courses",       emoji: "🎓" },
  { label: "Software Keys", emoji: "🔑" },
  { label: "Templates",     emoji: "🗂️" },
  { label: "Music & Audio", emoji: "🎵" },
  { label: "Design Assets", emoji: "🎨" },
];

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

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex flex-col items-center gap-3 mt-12">
      <p className="text-xs text-gray-400 font-medium tracking-wide">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:border-gray-300 hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <FiChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        <div className="flex items-center gap-0.5 mx-2">
          {visible.map((p, i) => {
            const prev = visible[i - 1];
            return (
              <span key={p} className="flex items-center">
                {prev && p - prev > 1 && (
                  <span className="w-8 flex items-center justify-center text-gray-300 text-sm select-none">···</span>
                )}
                <button
                  onClick={() => onChange(p)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all duration-200 ${
                    p === page
                      ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                      : "text-gray-400 hover:bg-gray-100 hover:text-dark"
                  }`}
                >
                  {p}
                </button>
              </span>
            );
          })}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:border-gray-300 hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DigitalProductsContent() {
  const [page, setPage] = useState(1);
  const { data: products, total, totalPages, loading } = usePagedApi<Product>(
    `/products?productType=digital&limit=${PAGE_SIZE}&page=${page}`
  );

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-16 px-6 text-center bg-dark">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(138,56,245,0.25) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,214,0,0.07) 0%, transparent 70%)", transform: "translate(-30%, 40%)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <FiZap className="w-3.5 h-3.5" /> Instant Delivery
            </motion.div>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Digital Products
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
              className="text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              E-books, courses, software keys, templates &amp; more — delivered to you instantly after purchase.
            </motion.p>
          </div>
        </section>

        {/* Category pills */}
        <section className="py-6 px-6 border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {digitalCategories.map(({ label, emoji }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-primary/8 border border-gray-100 hover:border-primary/20 text-dark hover:text-primary text-xs sm:text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                >
                  <span>{emoji}</span>{label}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Products grid */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 bg-gray-50 min-h-[60vh]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-1">
              <Link href="/products" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-400 hover:text-dark transition-colors">
                <FiArrowLeft className="w-3.5 h-3.5" /> All products
              </Link>
              {!loading && total > 0 && (
                <span className="text-xs text-gray-400">{total} items · Page {page} of {totalPages}</span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                variants={stagger}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                {loading
                  ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                      <div key={i} className="w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]">
                        <ProductSkeleton />
                      </div>
                    ))
                  : products?.map((product) => (
                      <motion.div key={product.id || product._id} variants={fadeUp} className="w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]">
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
              </motion.div>
            </AnimatePresence>

            {!loading && (!products || products.length === 0) && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-3xl">
                  📦
                </div>
                <p className="text-base font-bold text-dark mb-1">No digital products yet</p>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">Check back soon — vendors are listing digital products daily.</p>
                <Link href="/products" className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                  Browse All Products
                </Link>
              </motion.div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

export default function DigitalProductsPage() {
  return <Suspense><DigitalProductsContent /></Suspense>;
}
