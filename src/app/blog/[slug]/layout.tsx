import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BASE_URL = "https://vendorspotng.com";

interface BlogPost {
  title: string;
  excerpt: string;
  author: string;
  category: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/blogs/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    const post: BlogPost = json.data?.blog ?? json.data ?? json;

    const title = `${post.title} — Vendorspot Blog`;
    const description = post.excerpt?.slice(0, 160) || `${post.title} — Read on the Vendorspot blog.`;
    const imageUrl = post.coverImage || `${BASE_URL}/VLogo.svg`;

    return {
      title,
      description,
      keywords: [
        post.category,
        "Vendorspot blog",
        "online shopping Nigeria",
        "buy and sell Nigeria",
        post.author,
        "e-commerce Nigeria",
        "Nigerian marketplace",
      ],
      authors: [{ name: post.author }],
      alternates: { canonical: `${BASE_URL}/blog/${slug}` },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/blog/${slug}`,
        type: "article",
        publishedTime: post.createdAt,
        authors: [post.author],
        images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
        siteName: "Vendorspot",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Blog Post — Vendorspot",
      description: "Read the latest tips, stories, and insights on the Vendorspot blog.",
      alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    };
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
