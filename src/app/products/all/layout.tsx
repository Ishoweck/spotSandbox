import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products — Browse the Full Catalog",
  description:
    "Browse every product on Vendorspot — electronics, fashion, phones, home goods, digital products and more from verified vendors across Nigeria.",
  keywords: [
    "all products Nigeria",
    "browse products Nigeria",
    "online marketplace Nigeria",
    "buy online Nigeria",
    "verified vendors Nigeria",
    "Vendorspot catalog",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products/all",
  },
  openGraph: {
    title: "All Products — Browse the Full Catalog | Vendorspot",
    description: "Browse every product from verified vendors across Nigeria — electronics, fashion, phones, home goods, and more.",
    url: "https://vendorspotng.com/products/all",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "All Products on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products on Vendorspot Nigeria",
    description: "Browse the full catalog from verified vendors across Nigeria.",
  },
};

export default function AllProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
