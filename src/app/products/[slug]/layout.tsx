import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const product = data?.data ?? data;
    const image = product?.images?.[0] ?? "";
    const price = product?.price ? `₦${Number(product.price).toLocaleString()}` : "";

    return {
      title: `${product?.name ?? "Product"} — Vendorspot`,
      description: product?.description ?? `Buy ${product?.name} on Vendorspot. ${price}. Secure escrow payment. 100% refund guarantee.`,
      openGraph: {
        title: `${product?.name ?? "Product"} — Vendorspot`,
        description: `${price ? `${price} · ` : ""}Buy safely with escrow. 100% refund guarantee.`,
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        type: "website",
        siteName: "Vendorspot",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product?.name ?? "Product"} — Vendorspot`,
        description: `${price ? `${price} · ` : ""}Secure escrow payment on Vendorspot.`,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Product — Vendorspot" };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
