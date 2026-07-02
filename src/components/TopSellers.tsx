"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import type { VendorProfile } from "@/lib/api";
import { fadeUp } from "@/lib/motion";
import Link from "next/link";
import Image from "next/image";
import { FiStar } from "react-icons/fi";

function Stars({ rating }: { rating: number | null | undefined }) {
  const value = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`w-3 h-3 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
      <span className="text-[11px] text-gray-400 ml-1">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

const sort = (a: VendorProfile, b: VendorProfile) => {
  if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
  return (b.rating ?? 0) - (a.rating ?? 0);
};

export default function TopSellers() {
  const { data: topVendors, loading: topLoading } = useApi<VendorProfile[]>("/vendor/top");
  const { data: allVendors, loading: allLoading } = useApi<VendorProfile[]>("/vendor/top?limit=200");

  const loading = topLoading || allLoading;

  const sellers = useMemo(() => {
    // Primary: weekly top vendors with a personal avatar
    const primary = [...(topVendors || [])]
      .filter((v) => !!v.userAvatar)
      .sort(sort);

    if (primary.length >= 6) return primary.slice(0, 6);

    // Fallback: fill remaining slots from all vendors (premium/top rated), skip already included
    const primaryIds = new Set(primary.map((v) => v.id));
    const fallback = [...(allVendors || [])]
      .filter((v) => !primaryIds.has(v.id) && !!(v.userAvatar || v.image))
      .sort(sort);

    return [...primary, ...fallback].slice(0, 6);
  }, [topVendors, allVendors]);

  const avatarSrc = (v: VendorProfile) => v.userAvatar || v.image;

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center mb-10 sm:mb-14"
        >
          <div className="flex items-center gap-2">
            <Image
              src="/icons/verify.svg"
              alt="Verified"
              width={24}
              height={24}
              style={{ filter: "brightness(0) saturate(100%) invert(14%) sepia(98%) saturate(3612%) hue-rotate(326deg) brightness(94%) contrast(102%)" }}
            />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark">Top Sellers</h2>
          </div>
        </motion.div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-6 sm:-mx-8">
          <div className="flex gap-5 px-6 sm:px-8 pb-2 w-max">
            {loading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2.5 animate-pulse shrink-0">
                    <div className="w-28 h-28 rounded-full bg-gray-100" />
                    <div className="w-20 h-3 bg-gray-100 rounded-full" />
                    <div className="w-16 h-2.5 bg-gray-100 rounded-full" />
                    <div className="w-16 h-2.5 bg-gray-100 rounded-full" />
                  </div>
                ))
              : sellers.map((vendor) => (
                  <Link key={vendor.id} href={`/shops/${vendor.id}`} className="group flex flex-col items-center shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -6 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="relative w-28 h-28"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.10)] group-hover:shadow-[0_10px_36px_rgba(0,0,0,0.16)] transition-shadow duration-300 ring-4 ring-white">
                        <Image src={avatarSrc(vendor)!} alt={vendor.name} width={112} height={112} className="w-full h-full object-cover" style={{ width: "100%", height: "100%" }} />
                      </div>
                      {vendor.isPremium && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center">
                          <Image src="/icons/verify.svg" alt="Premium" width={20} height={20} style={{ width: 20, height: 20, filter: "brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1500%) hue-rotate(199deg) brightness(101%) contrast(102%)" }} />
                        </span>
                      )}
                    </motion.div>
                    <div className="h-5 flex items-center justify-center w-28 mt-3">
                      <p className="text-xs font-bold text-gray-900 text-center w-full truncate leading-none">{vendor.name}</p>
                    </div>
                    <div className="h-4 flex items-center justify-center w-28 mt-1">
                      <p className="text-[10px] text-gray-400 text-center truncate w-full leading-none">{vendor.location || "Lagos, Nigeria"}</p>
                    </div>
                    <div className="h-5 flex items-center justify-center mt-1">
                      <Stars rating={vendor.rating} />
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>

        {/* Desktop: 6-col grid */}
        <div className="hidden md:grid grid-cols-6 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5 animate-pulse">
                  <div className="w-full aspect-square rounded-full bg-gray-100" />
                  <div className="w-3/4 h-3 bg-gray-100 rounded-full" />
                  <div className="w-2/3 h-2.5 bg-gray-100 rounded-full" />
                  <div className="w-2/3 h-2.5 bg-gray-100 rounded-full" />
                </div>
              ))
            : sellers.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/shops/${vendor.id}`} className="group flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -6 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="relative w-full aspect-square"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.10)] group-hover:shadow-[0_10px_36px_rgba(0,0,0,0.16)] transition-shadow duration-300 ring-4 ring-white">
                        <Image src={avatarSrc(vendor)!} alt={vendor.name} width={200} height={200} className="w-full h-full object-cover" style={{ width: "100%", height: "100%" }} />
                      </div>
                      {vendor.isPremium && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center">
                          <Image src="/icons/verify.svg" alt="Premium" width={20} height={20} style={{ width: 20, height: 20, filter: "brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1500%) hue-rotate(199deg) brightness(101%) contrast(102%)" }} />
                        </span>
                      )}
                    </motion.div>
                    <div className="h-5 flex items-center justify-center w-full mt-3">
                      <p className="text-sm font-bold text-gray-900 text-center w-full truncate leading-none">{vendor.name}</p>
                    </div>
                    <div className="h-4 flex items-center justify-center w-full mt-1">
                      <p className="text-xs text-gray-400 text-center truncate w-full leading-none">{vendor.location || "Lagos, Nigeria"}</p>
                    </div>
                    <div className="h-5 flex items-center justify-center mt-1">
                      <Stars rating={vendor.rating} />
                    </div>
                  </Link>
                </motion.div>
              ))
          }
        </div>

      </div>
    </section>
  );
}
