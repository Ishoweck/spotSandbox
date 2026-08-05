import { NextRequest, NextResponse } from "next/server";

const PIXEL_CODE = process.env.TIKTOK_EVENTS_PIXEL_ID ?? process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "";
const ACCESS_TOKEN = process.env.TIKTOK_EVENTS_API_TOKEN ?? "";
const EVENTS_API = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export async function POST(req: NextRequest) {
  if (!ACCESS_TOKEN || !PIXEL_CODE) {
    return NextResponse.json({ ok: false });
  }

  try {
    const body = await req.json();
    const { event, event_id, page_url, contents, value, currency, search_string } = body;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    const properties: Record<string, unknown> = { currency: currency ?? "NGN" };
    if (contents?.length) properties.contents = contents;
    if (value !== undefined) properties.value = value;
    if (search_string) properties.search_string = search_string;

    await fetch(EVENTS_API, {
      method: "POST",
      headers: {
        "Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pixel_code: PIXEL_CODE,
        event,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        user: { ip, user_agent: userAgent },
        page: { url: page_url },
        properties,
      }),
    });
  } catch {
    // fail silently — tracking should never break the app
  }

  return NextResponse.json({ ok: true });
}
