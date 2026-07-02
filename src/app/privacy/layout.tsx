import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — How We Protect Your Data",
  description:
    "Read Vendorspot's privacy policy to understand how we collect, use, and protect your personal data. Your privacy and security are our top priorities.",
  keywords: [
    "Vendorspot privacy policy",
    "data protection Nigeria",
    "privacy Nigeria",
    "personal data protection",
    "Vendorspot data policy",
    "user privacy Nigeria",
    "NDPR compliance Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Vendorspot",
    description: "How Vendorspot collects, uses, and protects your personal data.",
    url: "https://vendorspotng.com/privacy",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Privacy Policy" }],
  },
  robots: { index: false, follow: false },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
