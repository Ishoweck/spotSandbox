import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { ToastProvider } from "@/components/Toast";
import SupportChat from "@/components/SupportChat";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://vendorspotng.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Vendorspot — Buy & Sell Anything Safely in Nigeria",
    template: "%s | Vendorspot",
  },
  description:
    "Vendorspot is Nigeria's safest online marketplace. Buy and sell electronics, fashion, phones, home goods, and digital products with escrow-protected payments and guaranteed delivery.",
  keywords: [
    "buy and sell Nigeria",
    "online marketplace Nigeria",
    "safe online shopping Nigeria",
    "escrow payment Nigeria",
    "buy electronics Nigeria",
    "sell products online Nigeria",
    "Nigerian e-commerce",
    "Vendorspot",
    "online vendors Nigeria",
    "buy phones Nigeria",
    "buy fashion Nigeria",
    "digital products Nigeria",
    "online market Lagos",
    "safe buying Nigeria",
    "verified vendors Nigeria",
    "buy and sell Lagos",
    "Nigerian marketplace",
    "online shopping Nigeria",
    "sell online Nigeria",
    "guaranteed delivery Nigeria",
    "escrow shopping",
    "buy gadgets Nigeria",
    "affordable shopping Nigeria",
    "new arrivals Nigeria",
    "flash sales Nigeria",
    "deals Nigeria",
    "Nigerian online store",
    "Vendorspot Nigeria",
    "vendor spot",
    "vendorspotng",
  ],
  authors: [{ name: "Vendorspot", url: BASE_URL }],
  creator: "Vendorspot",
  publisher: "Vendorspot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/VLogo.svg",
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "Vendorspot",
    title: "Vendorspot — Buy & Sell Anything Safely in Nigeria",
    description:
      "Nigeria's safest online marketplace. Escrow-protected payments, verified vendors, and guaranteed delivery on electronics, fashion, phones, and more.",
    images: [
      {
        url: "/VLogo.svg",
        width: 1200,
        height: 630,
        alt: "Vendorspot — Nigeria's Safest Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vendorsspot",
    creator: "@vendorsspot",
    title: "Vendorspot — Buy & Sell Anything Safely in Nigeria",
    description:
      "Nigeria's safest online marketplace. Escrow-protected payments, verified vendors, and guaranteed delivery.",
    images: ["/VLogo.svg"],
  },
  category: "e-commerce",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vendorspot",
  url: BASE_URL,
  logo: `${BASE_URL}/VLogo.svg`,
  sameAs: [
    "https://x.com/vendorsspot",
    "https://www.instagram.com/vendorsspot",
    "https://www.linkedin.com/company/vendorspot/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-704-588-2161",
    contactType: "customer service",
    email: "support@vendorspotng.com",
    areaServed: "NG",
    availableLanguage: "English",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vendorspot",
  url: BASE_URL,
  description: "Nigeria's safest online marketplace for buying and selling anything.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/products?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "";

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <GoogleAnalytics gaId={gaId} />
        <CartProvider>
          <ToastProvider>
            {children}
            <SupportChat />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
