import { MetadataRoute } from "next";

const BASE_URL = "https://vendorspotng.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE_URL}/shops`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/products/new-arrivals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/products/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/products/recommended`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/products/digital`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/how-to-buy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/refunds`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/ambassador-program`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    const [productsRes, shopsRes, blogsRes] = await Promise.allSettled([
      fetch(`${apiBase}/products?limit=200`, { next: { revalidate: 3600 } }),
      fetch(`${apiBase}/vendor/top?limit=200`, { next: { revalidate: 3600 } }),
      fetch(`${apiBase}/blogs?limit=200`, { next: { revalidate: 3600 } }),
    ]);

    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const { data } = await productsRes.value.json();
      const products = Array.isArray(data) ? data : data?.products ?? [];
      products.forEach((p: { _id?: string; id?: string; slug?: string; updatedAt?: string }) => {
        const identifier = p.slug || p._id || p.id;
        if (identifier) {
          dynamicPages.push({
            url: `${BASE_URL}/products/${identifier}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      });
    }

    if (shopsRes.status === "fulfilled" && shopsRes.value.ok) {
      const { data } = await shopsRes.value.json();
      const shops = Array.isArray(data) ? data : data?.vendors ?? [];
      shops.forEach((s: { _id?: string; id?: string; slug?: string; updatedAt?: string }) => {
        const identifier = s.slug || s._id || s.id;
        if (identifier) {
          dynamicPages.push({
            url: `${BASE_URL}/shops/${identifier}`,
            lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      });
    }

    if (blogsRes.status === "fulfilled" && blogsRes.value.ok) {
      const { data } = await blogsRes.value.json();
      const blogs = Array.isArray(data) ? data : data?.blogs ?? [];
      blogs.forEach((b: { slug?: string; updatedAt?: string }) => {
        if (b.slug) {
          dynamicPages.push({
            url: `${BASE_URL}/blog/${b.slug}`,
            lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      });
    }
  } catch {
    // API unavailable — return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
