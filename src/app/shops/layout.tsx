import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Verified Shops & Vendors in Nigeria",
  description:
    "Explore thousands of verified vendor shops on Vendorspot. Find trusted sellers across Lagos and Nigeria offering electronics, fashion, phones, and more. Safe buying with escrow protection.",
  keywords: [
    "verified vendors Nigeria",
    "online shops Nigeria",
    "trusted sellers Nigeria",
    "vendor shops Lagos",
    "Nigerian sellers",
    "buy from vendors Nigeria",
    "Vendorspot shops",
    "online stores Nigeria",
    "Nigerian vendor marketplace",
    "top sellers Nigeria",
    "premium vendors Nigeria",
    "follow shops Nigeria",
    "best shops Nigeria",
    "vendor directory Nigeria",
    "Nigerian business directory",
    "small businesses Nigeria",
    "Lagos vendors",
    "Abuja vendors",
    "verified sellers Nigeria",
    "trusted online shops Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/shops",
  },
  openGraph: {
    title: "Discover Verified Shops & Vendors in Nigeria | Vendorspot",
    description:
      "Explore thousands of verified vendor shops. Trusted sellers across Nigeria with safe escrow-protected purchases.",
    url: "https://vendorspotng.com/shops",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Shops" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Verified Shops & Vendors — Vendorspot Nigeria",
    description: "Thousands of verified vendor shops across Nigeria. Safe buying guaranteed.",
  },
};

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
