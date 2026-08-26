"use client";

import { useState, useEffect } from "react";
import { friendlyError } from "./errorMessage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Extracts the main array/object from the API response's `data` field.
 * The backend wraps responses like: { success, data: { products: [...], total, page } }
 * This finds the first array value inside `data` and returns it.
 */
function extractData(responseData: unknown): unknown {
  if (Array.isArray(responseData)) return responseData;
  if (responseData && typeof responseData === "object") {
    const obj = responseData as Record<string, unknown>;
    // Find the first array property (e.g. products, categories, vendors)
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value;
    }
  }
  return responseData;
}

export function usePagedApi<T>(endpoint: string | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(endpoint !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (endpoint === null) { setData(null); setLoading(false); return; }
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          const d = json.data as Record<string, unknown>;
          const meta = (json.meta || {}) as Record<string, unknown>;
          const arr = (Array.isArray(d) ? d : Object.values(d).find(v => Array.isArray(v))) as T[] || [];
          const total = (d.total as number) ?? (meta.total as number) ?? arr.length;
          const limit = (d.limit as number) ?? (meta.limit as number) ?? arr.length;
          const computedPages = limit > 0 ? Math.ceil(total / limit) : 1;
          setData(arr);
          setTotal(total);
          setTotalPages((meta.totalPages as number) || (d.totalPages as number) || computedPages || 1);
          setHasMore((d.hasMore as boolean) ?? (meta.hasNextPage as boolean) ?? false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(friendlyError(err, "Failed to load. Please try again."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint]);

  return { data, total, totalPages, hasMore, loading, error };
}

export function useApi<T>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(endpoint !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (endpoint === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevents stale setState calls when the component unmounts or the endpoint changes before the request finishes
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
if (!cancelled) {
          setData(extractData(json.data) as T);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [endpoint]);

  return { data, loading, error };
}
