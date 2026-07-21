import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const BASE_URL = "https://vendorspotng.com";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data?.data ?? data;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    const image = product?.images?.[0] ?? "";
    const price = product?.price ? `₦${Number(product.price).toLocaleString()}` : "";

    return {
      title: `${product?.name ?? "Product"} — Vendorspot`,
      description: product?.description ?? `Buy ${product?.name} on Vendorspot. ${price}. Secure escrow payment. 100% refund guarantee.`,
      alternates: {
        canonical: `${BASE_URL}/products/${product?.slug || id}`,
      },
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

export default async function ProductLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProduct(id);

  const productJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || product.name,
    image: product.images || [],
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: product.vendor?.name || "Vendorspot" },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug || id}`,
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviews > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews,
      },
    } : {}),
  } : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
