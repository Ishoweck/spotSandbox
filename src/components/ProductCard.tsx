"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiStar, FiCheck, FiPackage } from "react-icons/fi";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/Toast";

interface ProductCardProps {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  oldPrice?: number;
  compareAtPrice?: number;
  discount?: number;
  discountPercentage?: number;
  rating?: number;
  averageRating?: number;
  reviews?: number;
  totalReviews?: number;
  color?: string;
  emoji?: string;
  images?: string[];
  slug?: string;
  priority?: boolean;
  [key: string]: unknown;
}

export default function ProductCard(props: ProductCardProps) {
  const { id, _id, name, price, slug, images, emoji, color = "bg-gray-100", priority = false } = props;

  // API returns different field names depending on which endpoint was hit
  const oldPrice = props.oldPrice || props.compareAtPrice || 0;
  const discount = props.discount || props.discountPercentage || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const rating = props.rating || props.averageRating || 0;
  const reviews = props.reviews || props.totalReviews || 0;
  const productImage = images && images.length > 0 ? images[0] : null;
  // Backend uses _id; some list responses also include id — prefer _id
  const productId = _id || id || "";
  const href = productId ? `/products/${productId}` : slug ? `/products/${slug}` : "#";

  const { addToCart } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(productId, { _id: productId, name, price, images: images || [], slug }, 1);
      setAdded(true);
      toast(`${name} added to cart`, "success");
      setTimeout(() => setAdded(false), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      toast(msg, "error");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22 }}
      className="h-full"
    >
      <Link
        href={href}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group block h-full"
      >
        <div className={`relative ${productImage ? "bg-gray-50" : color} h-36 sm:h-44 md:h-48 flex items-center justify-center overflow-hidden`}>
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              -{discount}%
            </span>
          )}
          <button
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10 transition-colors"
            onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
          >
            <FiHeart className={`w-3.5 h-3.5 transition-colors ${liked ? "text-primary fill-primary" : "text-gray-400"}`} />
          </button>
          {productImage ? (
            <Image
              src={productImage}
              alt={name}
              fill
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          ) : (
            <FiPackage className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
          )}
        </div>

        <div className="p-2.5 sm:p-3">
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <FiStar className="w-3 h-3 text-accent fill-accent" />
              <span className="text-[10px] sm:text-xs text-gray-500">{rating.toFixed(1)} ({reviews})</span>
            </div>
          )}
          <p className="text-xs sm:text-sm font-medium text-dark truncate mb-1.5 sm:mb-2 leading-tight">{name}</p>
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-dark">₦{price.toLocaleString()}</span>
              {oldPrice > 0 && oldPrice > price && (
                <span className="text-[10px] text-gray-400 line-through ml-1 hidden sm:inline">
                  ₦{oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                added ? "bg-green-500" : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {added ? <FiCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /> : <FiShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
