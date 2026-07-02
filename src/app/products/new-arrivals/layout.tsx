import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals — Latest Products Just In",
  description:
    "Discover the latest products just added to Vendorspot. Fresh arrivals in electronics, fashion, phones, home goods, and more from verified vendors across Nigeria. New stock added daily.",
  keywords: [
    "new arrivals Nigeria",
    "latest products Nigeria",
    "new products online Nigeria",
    "new electronics Nigeria",
    "new fashion Nigeria",
    "fresh stock Nigeria",
    "latest gadgets Nigeria",
    "new phones Nigeria",
    "recently added products Nigeria",
    "Vendorspot new arrivals",
    "daily new products Nigeria",
    "hot new items Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products/new-arrivals",
  },
  openGraph: {
    title: "New Arrivals — Latest Products Just In | Vendorspot",
    description: "Fresh arrivals daily from verified vendors across Nigeria. Electronics, fashion, phones, and more.",
    url: "https://vendorspotng.com/products/new-arrivals",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "New Arrivals on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "New Arrivals on Vendorspot Nigeria",
    description: "Fresh products added daily from verified vendors across Nigeria.",
  },
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
