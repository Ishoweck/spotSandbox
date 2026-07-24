declare global {
  interface Window {
    ttq?: {
      track: (event: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => void;
      page: () => void;
      [key: string]: unknown;
    };
  }
}

export interface TikTokContent {
  content_id: string;
  content_name?: string;
  price?: number;
  quantity?: number;
  content_type?: string;
}

export interface TikTokEventData {
  contents?: TikTokContent[];
  value?: number;
  currency?: string;
  search_string?: string;
  num_items?: number;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ttqEvent(event: string, data?: TikTokEventData) {
  const eventId = genId();

  // Client-side pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(event, data as Record<string, unknown> | undefined, { event_id: eventId });
  }

  // Server-side Events API (fire-and-forget)
  fetch("/api/tiktok-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      event_id: eventId,
      page_url: typeof window !== "undefined" ? window.location.href : "",
      ...data,
    }),
  }).catch(() => {});
}
