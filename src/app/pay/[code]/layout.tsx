import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Link previews for WhatsApp / Instagram / X when a vendor shares /pay/<code>
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await fetch(`${API_BASE}/payment-links/public/${code}`, { next: { revalidate: 300 } });
    const json = await res.json();
    const d = json?.data;
    const vendor = d?.vendor?.businessName ?? "a Vendorspot vendor";
    const isProduct = d?.link?.type === "PRODUCT";
    const amount = isProduct ? d?.product?.price : d?.link?.amount;
    const price = amount ? ` · ₦${Number(amount).toLocaleString()}` : "";
    const title = isProduct
      ? `${d?.product?.name ?? d?.link?.title}${price} — ${vendor}`
      : `Pay ${vendor}${price} — Vendorspot`;
    const description = isProduct
      ? `Buy from ${vendor} securely. Your payment is held in escrow until you receive your order.`
      : `${d?.link?.title ?? "Payment"} · Pay ${vendor} securely with card, bank transfer or USSD.`;
    const image = (isProduct ? d?.product?.images?.[0] : undefined) ?? d?.vendor?.logo ?? "";

    return {
      title,
      description,
      robots: { index: false, follow: false },
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, alt: vendor }] : [],
        type: "website",
        siteName: "Vendorspot",
      },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    };
  } catch {
    return { title: "Pay — Vendorspot", robots: { index: false, follow: false } };
  }
}

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
