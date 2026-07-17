import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/vendor/public/${slug}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const shop = data?.data?.vendor ?? data?.data ?? data;

    const name = shop?.businessName ?? "Shop";
    const description = shop?.businessDescription
      ?? `Shop from ${name} on Vendorspot. Verified vendor. Secure escrow payments. 100% refund guarantee.`;
    // Banner is landscape — ideal for OG. Fall back to logo.
    const image = shop?.businessBanner ?? shop?.businessLogo ?? "";

    return {
      title: `${name} — Vendorspot`,
      description,
      openGraph: {
        title: `${name} — Vendorspot`,
        description: `Verified vendor on Vendorspot · Secure escrow payments · 100% refund guarantee.`,
        images: image ? [{ url: image, width: 1200, height: 630, alt: name }] : [],
        type: "website",
        siteName: "Vendorspot",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} — Vendorspot`,
        description: `Verified shop on Vendorspot. Shop safely with escrow.`,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Shop — Vendorspot" };
  }
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
