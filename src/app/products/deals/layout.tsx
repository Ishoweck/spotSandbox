import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals & Discounts — Best Prices in Nigeria",
  description:
    "Shop the best deals and discounts on Vendorspot. Flash sales, limited-time offers, and massive discounts on electronics, fashion, phones, and more from verified Nigerian vendors.",
  keywords: [
    "deals Nigeria",
    "discounts Nigeria",
    "flash sales Nigeria",
    "cheap products Nigeria",
    "sale Nigeria",
    "best prices Nigeria",
    "discount electronics Nigeria",
    "discount fashion Nigeria",
    "limited time offers Nigeria",
    "Vendorspot deals",
    "online sale Nigeria",
    "clearance sale Nigeria",
    "promo Nigeria",
    "cheap phones Nigeria",
    "discount gadgets Nigeria",
    "best deals online Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/products/deals",
  },
  openGraph: {
    title: "Deals & Discounts — Best Prices in Nigeria | Vendorspot",
    description: "Flash sales, discounts, and limited-time offers on electronics, fashion, phones, and more.",
    url: "https://vendorspotng.com/products/deals",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Deals on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deals & Discounts on Vendorspot Nigeria",
    description: "Flash sales and discounts on electronics, fashion, phones, and more.",
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
