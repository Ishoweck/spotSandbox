"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { friendlyError } from "./errorMessage";
import { authFetch, getToken } from "./auth-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const LOCAL_KEY = "vendorspot_cart";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug?: string;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  variant?: string;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
}

interface CartContextValue {
  cart: Cart;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, snapshot?: Partial<CartProduct>, quantity?: number, variant?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
}

const emptyCart: Cart = { items: [], subtotal: 0, deliveryFee: 0, discount: 0, total: 0 };

const CartContext = createContext<CartContextValue>({
  cart: emptyCart,
  itemCount: 0,
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  applyCoupon: async () => ({ success: false, message: "" }),
});

function totals(items: CartItem[], discount = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { subtotal, deliveryFee: 0, discount, total: subtotal - discount };
}


export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(false);

  // Re-fetches the full cart from the server so totals/discounts are always server-authoritative
  const fetchBackend = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await authFetch(`${API_BASE}/cart`);
      const json = await res.json();
      if (json.success) {
        const c = json.data?.cart;
        const items: CartItem[] = c?.items || [];
        setCart({ items, couponCode: c?.couponCode, ...totals(items, c?.discount || 0) });
      }
    } catch {}
  }, []);

  // On mount: if the user is logged in, pull their server cart; otherwise hydrate from localStorage
  useEffect(() => {
    if (getToken()) {
      fetchBackend();
    } else {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) {
          const items: CartItem[] = JSON.parse(raw);
          setCart({ items, ...totals(items) });
        }
      } catch {}
    }
  }, [fetchBackend]);

  const addToCart = async (productId: string, snapshot?: Partial<CartProduct>, quantity = 1, variant?: string) => {
    setLoading(true);
    try {
      if (getToken()) {
        const res = await authFetch(`${API_BASE}/cart/add`, {
          method: "POST",
          body: JSON.stringify({ productId, quantity, variant }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(friendlyError(json.message || "Failed to add to cart", "Failed to add to cart"));
        await fetchBackend();
      } else {
        setCart((prev) => {
          // Guest cart: merge quantities for the same product+variant pair, or append new entry
          const existing = prev.items.find((i) => i.product._id === productId && i.variant === variant);
          const newItems = existing
            ? prev.items.map((i) => (i === existing ? { ...i, quantity: i.quantity + quantity } : i))
            : [
                ...prev.items,
                {
                  _id: `local_${Date.now()}`,
                  product: { _id: productId, name: snapshot?.name || "Product", price: snapshot?.price || 0, images: snapshot?.images || [], slug: snapshot?.slug },
                  quantity,
                  variant,
                  price: snapshot?.price || 0,
                },
              ];
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(newItems)); } catch {}
          return { ...prev, items: newItems, ...totals(newItems, prev.discount) };
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setLoading(true);
    try {
      if (getToken()) {
        await authFetch(`${API_BASE}/cart/items/${itemId}`, { method: "DELETE" });
        await fetchBackend();
      } else {
        setCart((prev) => {
          const newItems = prev.items.filter((i) => i._id !== itemId);
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(newItems)); } catch {}
          return { ...prev, items: newItems, ...totals(newItems, prev.discount) };
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(itemId);
    setLoading(true);
    try {
      if (getToken()) {
        await authFetch(`${API_BASE}/cart/items/${itemId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        });
        await fetchBackend();
      } else {
        setCart((prev) => {
          const newItems = prev.items.map((i) => (i._id === itemId ? { ...i, quantity } : i));
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(newItems)); } catch {}
          return { ...prev, items: newItems, ...totals(newItems, prev.discount) };
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      if (getToken()) await authFetch(`${API_BASE}/cart`, { method: "DELETE" });
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!getToken()) return { success: false, message: "Please log in to apply coupons." };
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/cart/coupon/apply`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchBackend();
        return { success: true, message: "Coupon applied!" };
      }
      return { success: false, message: json.message || "Invalid coupon code." };
    } catch {
      return { success: false, message: "Failed to apply coupon." };
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
