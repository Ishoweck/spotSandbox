import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Tips, Vendor Stories & E-Commerce Insights",
  description:
    "Read the Vendorspot blog for expert tips on buying safely online, vendor success stories, e-commerce guides, marketplace updates, and how to protect yourself from fraud in Nigeria.",
  keywords: [
    "Vendorspot blog",
    "online shopping tips Nigeria",
    "how to buy safely online Nigeria",
    "vendor tips Nigeria",
    "e-commerce Nigeria",
    "safe buying tips",
    "online fraud Nigeria",
    "Nigerian marketplace blog",
    "vendor success stories Nigeria",
    "buy and sell tips Nigeria",
    "escrow payment guide",
    "online business Nigeria",
    "how to sell online Nigeria",
    "digital commerce Nigeria",
    "safe payment Nigeria",
    "buyer protection Nigeria",
    "seller tips Nigeria",
    "marketplace news Nigeria",
    "Vendorspot updates",
    "Nigerian e-commerce blog",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/blog",
  },
  openGraph: {
    title: "Vendorspot Blog — Tips, Stories & E-Commerce Insights",
    description:
      "Expert tips, vendor stories, and insights to help you buy smarter and sell better on Nigeria's safest marketplace.",
    url: "https://vendorspotng.com/blog",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendorspot Blog — Tips & E-Commerce Insights",
    description: "Expert tips on buying safely, vendor stories, and marketplace insights for Nigeria.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
