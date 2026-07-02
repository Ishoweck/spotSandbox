import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recommended Products — Handpicked for You",
  description:
    "Explore handpicked recommended products on Vendorspot. Personalised suggestions based on popular trends and top-rated items from verified vendors across Nigeria.",
  keywords: [
    "recommended products Nigeria",
    "best products Nigeria",
    "top rated products Nigeria",
    "popular products Nigeria",
    "handpicked products Nigeria",
    "Vendorspot recommended",
    "personalised shopping Nigeria",
    "trending products Nigeria",
    "best sellers Nigeria",
    "top products Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products/recommended",
  },
  openGraph: {
    title: "Recommended Products — Handpicked for You | Vendorspot",
    description: "Personalised product recommendations from top-rated verified vendors across Nigeria.",
    url: "https://vendorspotng.com/products/recommended",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Recommended on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recommended Products — Vendorspot Nigeria",
    description: "Handpicked top-rated products from verified vendors across Nigeria.",
  },
};

export default function RecommendedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
