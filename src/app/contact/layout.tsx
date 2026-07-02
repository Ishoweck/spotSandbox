import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get Help & Support",
  description:
    "Contact Vendorspot support for help with orders, payments, refunds, or vendor enquiries. Reach us by email, phone, or through our contact form. We reply within 24–48 hours.",
  keywords: [
    "Vendorspot contact",
    "Vendorspot support",
    "contact Vendorspot Nigeria",
    "online marketplace support Nigeria",
    "help with order Nigeria",
    "customer service Nigeria",
    "Vendorspot email",
    "Vendorspot phone number",
    "report problem Vendorspot",
    "refund help Nigeria",
    "payment help Nigeria",
    "vendor support Nigeria",
    "buyer support Nigeria",
    "Nigerian marketplace support",
    "contact online store Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/contact",
  },
  openGraph: {
    title: "Contact Vendorspot — Get Help & Support",
    description:
      "Contact our support team for help with orders, payments, refunds, or vendor enquiries. We reply within 24–48 hours.",
    url: "https://vendorspotng.com/contact",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Contact Vendorspot" }],
  },
  twitter: {
    card: "summary",
    title: "Contact Vendorspot Support",
    description: "Get help with orders, payments, and more. We reply within 24–48 hours.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
