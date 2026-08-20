declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, data);
}
