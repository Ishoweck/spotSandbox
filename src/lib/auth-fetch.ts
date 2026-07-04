const TOKEN_KEY = "vendorspot_token";
const USER_KEY  = "vendorspot_user";
const EXPIRED_FLAG = "vs_session_expired";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Call when a 401 is detected. Clears auth state and redirects to /login with an expired-session flag. */
export function handleTokenExpiry(): never {
  clearAuth();
  sessionStorage.setItem(EXPIRED_FLAG, "1");
  window.location.href = "/login";
  // unreachable, but satisfies TypeScript's `never` return type
  throw new Error("Session expired");
}

/** Reads and clears the session-expired flag. Returns true on first call after expiry. */
export function consumeExpiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  const flag = sessionStorage.getItem(EXPIRED_FLAG);
  if (flag) {
    sessionStorage.removeItem(EXPIRED_FLAG);
    return true;
  }
  return false;
}

/**
 * Drop-in replacement for `fetch` that:
 *  - Attaches the Bearer token automatically
 *  - Calls handleTokenExpiry() on 401 responses
 *  - Returns the raw Response so callers can still check res.ok / res.json()
 */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    handleTokenExpiry();
  }

  return res;
}
