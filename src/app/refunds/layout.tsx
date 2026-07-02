import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — 100% Buyer Protection",
  description:
    "Vendorspot's refund policy ensures 100% buyer protection. Learn how escrow payments protect your money, what qualifies for a refund, and how to request one if your order goes wrong.",
  keywords: [
    "Vendorspot refund policy",
    "buyer protection Nigeria",
    "online refund Nigeria",
    "escrow refund Nigeria",
    "money back guarantee Nigeria",
    "safe payment Nigeria",
    "return policy Nigeria",
    "refund request Nigeria",
    "online shopping refund Nigeria",
    "Vendorspot buyer protection",
    "dispute resolution Nigeria",
    "refund online marketplace Nigeria",
    "safe online purchase Nigeria",
    "guarantee delivery Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/refunds",
  },
  openGraph: {
    title: "Refund Policy — 100% Buyer Protection | Vendorspot",
    description:
      "100% buyer protection with escrow payments. Learn how to get a refund if your order goes wrong.",
    url: "https://vendorspotng.com/refunds",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Refund Policy" }],
  },
  twitter: {
    card: "summary",
    title: "Vendorspot Refund Policy — 100% Buyer Protection",
    description: "Your money is safe with escrow payments and guaranteed buyer protection.",
  },
};

export default function RefundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
