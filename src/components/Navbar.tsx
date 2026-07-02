"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiShoppingCart, FiMenu, FiX, FiChevronDown,
  FiPackage, FiBookOpen, FiMail, FiLogOut, FiUser, FiStar,
  FiShoppingBag, FiBox, FiAward,
} from "react-icons/fi";
import { useCart } from "@/lib/CartContext";

const mainLinks = [
  { label: "TheSpot",  href: "/thespot",  icon: null,          useLogo: true  },
  { label: "Shops",    href: "/shops",    icon: FiShoppingBag, useLogo: false },
  { label: "Products", href: "/products", icon: FiBox,         useLogo: false },
];

const moreLinks = [
  { label: "My Orders",      href: "/orders",     icon: FiPackage },
  { label: "Blog & Stories", href: "/blog",       icon: FiBookOpen },
  { label: "Ambassador",     href: "/ambassador-program", icon: FiStar },
  { label: "Contact Us",     href: "/contact",    icon: FiMail },
];

interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role?: string;
  affiliateCode?: string;
  isAffiliate?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [moreOpen, setMoreOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser]                 = useState<StoredUser | null>(null);
  const [hidden, setHidden]             = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const lastScrollY    = useRef(0);
  const closeTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount }  = useCart();

  useEffect(() => {
    const raw   = localStorage.getItem("vendorspot_user");
    const token = localStorage.getItem("vendorspot_token");
    if (raw && token) { try { setUser(JSON.parse(raw)); } catch {} }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 80);
      setScrolled(y > 60);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when sidebar is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("vendorspot_token");
    localStorage.removeItem("vendorspot_user");
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/home";
  };

  const openUserMenu  = () => { if (userMenuTimer.current) clearTimeout(userMenuTimer.current); setUserMenuOpen(true); };
  const closeUserMenu = () => { userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 120); };
  const openMore      = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMoreOpen(true); };
  const closeMore     = () => { closeTimer.current = setTimeout(() => setMoreOpen(false), 120); };

  const navLinkClass = (href: string) =>
    `px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out ${
      pathname === href
        ? "text-primary font-semibold bg-primary/8"
        : "text-gray-500 hover:text-dark hover:bg-gray-100/80"
    }`;

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <nav className={`w-full fixed top-0 pt-2 pb-2 sm:pt-3 sm:pb-5 z-40 transition-all duration-500 ease-[0.25,0.46,0.45,0.94] ${hidden ? "-translate-y-full" : "translate-y-0"} ${scrolled ? "backdrop-blur-lg shadow-sm" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between h-12 sm:h-16">

          {/* Logo */}
          <Link href="/home" className="shrink-0 bg-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-100 shadow-sm">
            <Image src="/VLogo.svg" alt="Vendorspot" width={120} height={20} className="h-4 sm:h-5 w-auto" style={{ width: "auto" }} priority />
          </Link>

          {/* Desktop nav pill */}
          <div className="hidden md:flex items-center gap-1 rounded-full px-2 py-1 border border-gray-100 bg-white shadow-sm">
            <Link href="/thespot"  className={navLinkClass("/thespot")}>TheSpot</Link>
            <Link href="/shops"    className={navLinkClass("/shops")}>Shops</Link>
            <Link href="/products" className={navLinkClass("/products")}>Products</Link>

            {/* More dropdown */}
            <div className="relative" onMouseEnter={openMore} onMouseLeave={closeMore}>
              <button
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-full text-gray-500 hover:text-dark hover:bg-gray-100/80 transition-all duration-300"
                onClick={() => setMoreOpen((v) => !v)}
              >
                More
                <FiChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden py-1.5 z-50"
                  onMouseEnter={openMore}
                  onMouseLeave={closeMore}
                >
                  {moreLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Desktop user / login */}
            {user ? (
              <div className="relative hidden md:block" onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
                <button
                  className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-full px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50 transition-all"
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-gray-100 text-dark">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate">{user.firstName || user.email}</span>
                  <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden py-1.5 z-50"
                    onMouseEnter={openUserMenu}
                    onMouseLeave={closeUserMenu}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-dark truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                      <FiPackage className="w-4 h-4 text-gray-400" /> My Orders
                    </Link>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                      <FiUser className="w-4 h-4 text-gray-400" /> My Account
                    </Link>
                    {user?.affiliateCode?.startsWith("AMB-") && (
                      <Link href="/ambassador-dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 transition-all">
                        <FiAward className="w-4 h-4" /> Ambassador Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all">
                      <FiLogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-full px-5 py-2 text-sm font-medium text-dark hover:bg-gray-100 hover:shadow-md transition-all"
              >
                <FiUser className="w-4 h-4" />
                Log In
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative overflow-visible p-2.5 bg-accent rounded-full hover:bg-accent-dark transition-all shadow-sm ring-2 ring-accent/30 hover:ring-accent/60">
              <FiShoppingCart className="w-5 h-5 text-dark" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 z-10 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm text-dark transition-all"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile sidebar ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={close}
            />

            {/* Sidebar panel */}
            <motion.aside
              key="sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link href="/home" onClick={close}>
                  <Image src="/VLogo.svg" alt="Vendorspot" width={110} height={18} className="h-4 w-auto" style={{ width: "auto" }} />
                </Link>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <FiX className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* User block */}
              {user ? (
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 border-b border-gray-100">
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <FiUser className="w-4 h-4" />
                    Log In
                  </Link>
                </div>
              )}

              {/* Nav links — scrollable middle */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Browse</p>
                {mainLinks.map(({ label, href, icon: Icon, useLogo }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={close}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active ? "bg-primary/8 text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-dark"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${active ? "bg-primary" : "bg-gray-100"}`}>
                        {useLogo ? (
                          <Image
                            src="/VLogo.svg"
                            alt="TheSpot"
                            width={20}
                            height={20}
                            className="w-5 h-auto object-contain"
                            style={{ width: "auto", filter: active ? "brightness(0) invert(1)" : "none" }}
                          />
                        ) : Icon ? (
                          <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-500"}`} />
                        ) : null}
                      </span>
                      {label}
                    </Link>
                  );
                })}

                <div className="pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">More</p>
                </div>
                {moreLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={close}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === href
                        ? "bg-primary/8 text-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-dark"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pathname === href ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Bottom — account actions */}
              {user && (
                <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                  <Link href="/account" onClick={close}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <FiUser className="w-4 h-4" />
                    </span>
                    My Account
                  </Link>
                  {user?.affiliateCode?.startsWith("AMB-") && (
                    <Link href="/ambassador-dashboard" onClick={close}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-all">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FiAward className="w-4 h-4" />
                      </span>
                      Ambassador Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { close(); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                  >
                    <span className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                      <FiLogOut className="w-4 h-4" />
                    </span>
                    Log Out
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
