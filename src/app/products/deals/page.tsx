"use client";

import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { usePagedApi } from "@/lib/useApi";
import { fadeUp, stagger } from "@/lib/motion";
import type { Product } from "@/lib/api";

const PAGE_SIZE = 20;

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

function DealsContent() {
  const [page, setPage] = useState(1);
  const { data: products, total, totalPages, loading } = usePagedApi<Product>(
    `/products/flash-sales?limit=${PAGE_SIZE}&page=${page}`
  );

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8 pt-4">
            <Link href="/products" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
              <FiArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark">Deals &amp; Discounts ⚡</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">Limited Time</span>
              </div>
              {!loading && total > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">{total} products on sale · Page {page} of {totalPages}</p>
              )}
            </div>
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
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-bold text-dark mb-2">No deals right now</p>
              <p className="text-sm text-gray-400 mb-6">Check back soon for discounts and limited-time offers.</p>
              <Link href="/products" className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
                Browse All Products
              </Link>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function DealsPage() {
  return <Suspense><DealsContent /></Suspense>;
}
