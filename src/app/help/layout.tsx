import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — FAQs & Answers",
  description:
    "Find answers to frequently asked questions about buying, selling, payments, refunds, and account management on Vendorspot — Nigeria's safest online marketplace.",
  keywords: [
    "Vendorspot help",
    "Vendorspot FAQ",
    "how to buy Vendorspot",
    "how to sell Vendorspot",
    "Vendorspot refund policy",
    "online marketplace FAQ Nigeria",
    "escrow payment FAQ",
    "safe buying FAQ",
    "how does Vendorspot work",
    "Vendorspot payment methods",
    "Nigeria online shopping help",
    "Vendorspot account help",
    "order help Nigeria",
    "payment FAQ Nigeria",
    "buyer guide Nigeria",
    "seller guide Nigeria",
    "Vendorspot guide",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/help",
  },
  openGraph: {
    title: "Help Center — FAQs & Answers | Vendorspot",
    description:
      "Answers to all your questions about buying, selling, payments, and refunds on Vendorspot.",
    url: "https://vendorspotng.com/help",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Vendorspot Help Center" }],
  },
  twitter: {
    card: "summary",
    title: "Vendorspot Help Center",
    description: "Find answers to FAQs about buying, selling, payments, and refunds.",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
