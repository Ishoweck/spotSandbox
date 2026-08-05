"use client";

import { use, useState, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FiArrowLeft, FiClock, FiUser, FiArrowRight } from "react-icons/fi";
import { fadeUp } from "@/lib/motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Parses inline **bold** and _italic_ markers into React nodes
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|_([^_]+)_/g;
  let cur = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cur) parts.push(text.slice(cur, m.index));
    if (m[1] !== undefined) parts.push(<strong key={m.index}>{m[1]}</strong>);
    else if (m[2] !== undefined) parts.push(<em key={m.index}>{m[2]}</em>);
    cur = m.index + m[0].length;
  }
  if (cur < text.length) parts.push(text.slice(cur));
  if (parts.length === 0) return text;
  return <>{parts}</>;
}

// Converts plain-text blog content (blank-line paragraphs, **Heading**, - lists) to React nodes
function renderContent(raw: string): React.ReactNode[] {
  if (!raw) return [];
  return raw.split(/\n{2,}/).flatMap((block, bi): React.ReactNode[] => {
    const trimmed = block.trim();
    if (!trimmed) return [];
    const lines = trimmed.split("\n");

    // Block heading: entire block is **Heading**
    if (lines.length === 1 && /^\*\*[^*]+\*\*$/.test(trimmed)) {
      return [
        <h3 key={bi} className="text-base sm:text-lg font-bold text-dark mt-8 mb-3">
          {trimmed.slice(2, -2)}
        </h3>,
      ];
    }

    // Unordered list
    if (lines.every((l) => /^[-•*] /.test(l.trim()))) {
      return [
        <ul key={bi} className="list-disc pl-5 mb-4 space-y-1.5">
          {lines.map((l, li) => (
            <li key={li} className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {parseInline(l.trim().replace(/^[-•*] /, ""))}
            </li>
          ))}
        </ul>,
      ];
    }

    // Ordered list
    if (lines.every((l) => /^\d+\. /.test(l.trim()))) {
      return [
        <ol key={bi} className="list-decimal pl-5 mb-4 space-y-1.5">
          {lines.map((l, li) => (
            <li key={li} className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {parseInline(l.trim().replace(/^\d+\. /, ""))}
            </li>
          ))}
        </ol>,
      ];
    }

    // Regular paragraph — single newlines become <br />
    return [
      <p key={bi} className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
        {lines.map((l, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {parseInline(l)}
          </Fragment>
        ))}
      </p>,
    ];
  });
}

const CATEGORY_COLOR: Record<string, string> = {
  "Tips & Guides":  "bg-blue-500",
  "Vendor Stories": "bg-violet-500",
  "Updates":        "bg-pink-500",
  "Safety":         "bg-emerald-500",
};
function categoryColor(cat: string) { return CATEGORY_COLOR[cat] ?? "bg-gray-500"; }

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime?: string;
  coverImage?: string;
  createdAt: string;
  content?: string;
  body?: string[];
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/blogs/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        const p: BlogPost | null = json.data?.blog ?? json.data ?? null;
        if (!p) { setNotFound(true); return; }
        setPost(p);
        return fetch(`${API_BASE}/blogs?limit=10`)
          .then((r) => r.json())
          .then((all) => {
            const posts: BlogPost[] = all.data?.blogs ?? [];
            setRelated(posts.filter((x) => x.slug !== slug && x.category === p.category).slice(0, 2));
          });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen">
          <div className="bg-gray-200 animate-pulse h-64 w-full" />
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-100 animate-pulse rounded-full" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 mt-16 px-6 text-center">
          <p className="text-5xl">📭</p>
          <p className="text-xl font-bold text-dark">Post not found</p>
          <p className="text-gray-400 text-sm">This story may have been removed or the link is incorrect.</p>
          <Link href="/blog" className="mt-2 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const color = categoryColor(post.category);
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className={`${post.coverImage ? "bg-gray-900" : color} pt-24 sm:pt-32 pb-14 sm:pb-20 px-6 relative overflow-hidden`}>
          {post.coverImage ? (
            <>
              <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 60%)" }} />
          )}
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold mb-6 transition-colors">
                <FiArrowLeft className="w-3.5 h-3.5" /> Back to Blog
              </Link>
              <span className="block text-white/70 text-xs font-bold uppercase tracking-widest mb-3">{post.category}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-xs">
                <span className="flex items-center gap-1.5"><FiUser className="w-3.5 h-3.5" />{post.author}</span>
                {post.readTime && <span className="flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5" />{post.readTime}</span>}
                <span>{formattedDate}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 sm:py-16 px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm mb-12"
            >
              {post.excerpt && (
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed border-l-4 border-primary pl-4 mb-8 italic">
                  {post.excerpt}
                </p>
              )}

              {(post.content || (post.body && post.body.length > 0)) ? (
                <div>{renderContent(post.content ?? post.body!.join("\n\n"))}</div>
              ) : null}
            </motion.div>

            {/* Related posts */}
            {related.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-lg font-bold text-dark mb-5">More from {post.category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link key={r._id} href={`/blog/${r.slug}`}
                      className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className={`${r.coverImage ? "" : categoryColor(r.category)} h-28 flex items-center justify-center relative overflow-hidden`}>
                        {r.coverImage
                          ? <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover" />
                          : <span className="text-white/20 text-4xl font-black select-none">VS</span>}
                      </div>
                      <div className="p-4 bg-white flex-1 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{r.category}</span>
                        <h3 className="text-sm font-bold text-dark leading-snug group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary mt-auto">
                          Read <FiArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="mt-10 text-center">
              <Link href="/blog" className="inline-flex items-center gap-2 border border-gray-200 text-dark text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors">
                <FiArrowLeft className="w-4 h-4" /> All posts
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
