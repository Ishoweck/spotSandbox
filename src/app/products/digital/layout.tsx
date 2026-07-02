import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Products — E-Books, Software & Courses",
  description:
    "Buy digital products instantly on Vendorspot. E-books, online courses, software licence keys, gift cards, and more — delivered instantly after payment from verified Nigerian sellers.",
  keywords: [
    "digital products Nigeria",
    "buy ebooks Nigeria",
    "buy software keys Nigeria",
    "buy online courses Nigeria",
    "digital downloads Nigeria",
    "instant delivery Nigeria",
    "software licences Nigeria",
    "buy gift cards Nigeria",
    "digital goods Nigeria",
    "Vendorspot digital",
    "downloadable products Nigeria",
    "buy digital Nigeria",
    "online courses Nigeria",
    "ebooks Nigeria",
    "software Nigeria",
    "digital marketplace Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products/digital",
  },
  openGraph: {
    title: "Digital Products — E-Books, Software & Courses | Vendorspot",
    description: "Buy e-books, courses, software keys, and more — delivered instantly from verified sellers.",
    url: "https://vendorspotng.com/products/digital",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Digital Products on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Products on Vendorspot Nigeria",
    description: "E-books, courses, software keys, gift cards — delivered instantly.",
  },
};

export default function DigitalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
