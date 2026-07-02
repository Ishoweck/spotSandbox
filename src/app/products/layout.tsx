import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Products — Electronics, Fashion, Phones & More",
  description:
    "Browse thousands of verified products on Vendorspot. Find electronics, fashion, phones, home goods, digital products, and more at the best prices in Nigeria. Safe escrow payments guaranteed.",
  keywords: [
    "buy products Nigeria",
    "online shopping Nigeria",
    "electronics Nigeria",
    "fashion Nigeria",
    "phones Nigeria",
    "home goods Nigeria",
    "digital products Nigeria",
    "cheap products Nigeria",
    "buy online Lagos",
    "verified products Nigeria",
    "new arrivals Nigeria",
    "deals Nigeria",
    "flash sales Nigeria",
    "Vendorspot products",
    "safe online shopping",
    "buy smartphones Nigeria",
    "buy laptops Nigeria",
    "buy clothes Nigeria",
    "Nigerian marketplace products",
    "affordable gadgets Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products",
  },
  openGraph: {
    title: "Shop Products — Electronics, Fashion, Phones & More | Vendorspot",
    description:
      "Browse thousands of verified products. Electronics, fashion, phones, home goods, and more at the best prices in Nigeria.",
    url: "https://vendorspotng.com/products",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Products" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Products — Vendorspot Nigeria",
    description: "Browse thousands of verified products at the best prices in Nigeria.",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
