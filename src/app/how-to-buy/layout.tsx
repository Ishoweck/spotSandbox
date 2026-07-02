import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Buy Safely — Step-by-Step Buying Guide",
  description:
    "Learn how to buy products safely on Vendorspot with escrow-protected payments. Step-by-step guide to finding products, placing orders, making secure payments, and receiving guaranteed delivery in Nigeria.",
  keywords: [
    "how to buy online Nigeria",
    "safe online buying Nigeria",
    "escrow payment guide Nigeria",
    "buy safely Vendorspot",
    "online buying guide Nigeria",
    "how to pay online Nigeria",
    "safe marketplace Nigeria",
    "buyer protection Nigeria",
    "how to shop online Nigeria",
    "secure payment Nigeria",
    "guaranteed delivery Nigeria",
    "Vendorspot buying guide",
    "online shopping guide Nigeria",
    "how escrow works Nigeria",
    "fraud-free shopping Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/how-to-buy",
  },
  openGraph: {
    title: "How to Buy Safely on Vendorspot — Step-by-Step Guide",
    description:
      "Learn how to buy with escrow-protected payments on Nigeria's safest marketplace.",
    url: "https://vendorspotng.com/how-to-buy",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "How to Buy on Vendorspot" }],
  },
  twitter: {
    card: "summary",
    title: "How to Buy Safely on Vendorspot",
    description: "Step-by-step guide to safe, escrow-protected online shopping in Nigeria.",
  },
};

export default function HowToBuyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
