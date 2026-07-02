import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — User Agreement",
  description:
    "Read Vendorspot's terms of service and user agreement. Understand the rules for buying, selling, and using our platform as a buyer or vendor in Nigeria.",
  keywords: [
    "Vendorspot terms of service",
    "user agreement Nigeria",
    "Vendorspot terms",
    "marketplace terms Nigeria",
    "buyer terms Nigeria",
    "vendor terms Nigeria",
    "Vendorspot rules",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/terms",
  },
  openGraph: {
    title: "Terms of Service | Vendorspot",
    description: "User agreement and terms for buying, selling, and using Vendorspot in Nigeria.",
    url: "https://vendorspotng.com/terms",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Terms" }],
  },
  robots: { index: false, follow: false },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
