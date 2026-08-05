import { NextRequest, NextResponse } from "next/server";

const MONGO_ID_RE = /^[0-9a-f]{24}$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only act on /shops/<identifier> — ignore sub-paths
  const match = pathname.match(/^\/shops\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const identifier = match[1];
  if (!MONGO_ID_RE.test(identifier)) return NextResponse.next();

  // The URL contains a raw MongoDB ObjectID — try to resolve it to a slug
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
    const res = await fetch(`${apiBase}/vendor/public/${identifier}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const json = await res.json();
      const slug =
        json.data?.vendor?.slug ??
        json.data?.slug ??
        json.vendor?.slug ??
        null;

      if (slug && slug !== identifier) {
        const target = request.nextUrl.clone();
        target.pathname = `/shops/${slug}`;
        return NextResponse.redirect(target, { status: 301 });
      }
    }
  } catch {
    // Network error — fall through to the page (which will show not-found)
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/shops/:path*",
};
