import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Selling — Open Your Store in Minutes",
  description:
    "Become a vendor on Vendorspot and start selling your products online in minutes. Create your store, list products easily, and receive orders from buyers across Nigeria. Secure payments guaranteed.",
  keywords: [
    "sell online Nigeria",
    "become a vendor Nigeria",
    "open online store Nigeria",
    "start selling online Nigeria",
    "sell products Nigeria",
    "create online store Nigeria",
    "how to sell on Vendorspot",
    "vendor registration Nigeria",
    "online selling platform Nigeria",
    "sell from home Nigeria",
    "sell electronics Nigeria",
    "sell fashion online Nigeria",
    "Nigerian vendor platform",
    "online marketplace seller Nigeria",
    "sell anything Nigeria",
    "grow business online Nigeria",
    "Vendorspot seller",
    "Nigerian e-commerce seller",
    "earn money online Nigeria",
    "sell digital products Nigeria",
  ],
  alternates: {
    canonical: "https://vendorspotng.com/sell",
  },
  openGraph: {
    title: "Start Selling on Vendorspot — Open Your Store in Minutes",
    description:
      "Join thousands of vendors selling online in Nigeria. Create your store, list products, and start receiving orders today.",
    url: "https://vendorspotng.com/sell",
    type: "website",
    images: [{ url: "/VLogo.svg", width: 1200, height: 630, alt: "Sell on Vendorspot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Selling on Vendorspot Nigeria",
    description: "Open your store in minutes and reach buyers across Nigeria.",
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
