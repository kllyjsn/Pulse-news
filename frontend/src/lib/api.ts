import type { NewsResponse, BriefingResponse, CategoryMap } from "../types";

const BASE = import.meta.env.VITE_API_URL || "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export function fetchNews(category = "all", limit = 50, offset = 0) {
  return fetchJson<NewsResponse>(
    `/api/news?category=${category}&limit=${limit}&offset=${offset}`
  );
}

export function fetchFeatured(limit = 6) {
  return fetchJson<NewsResponse>(`/api/news/featured?limit=${limit}`);
}

export function fetchBriefing(category = "all") {
  return fetchJson<BriefingResponse>(`/api/briefing?category=${category}`);
}

export function fetchCategories() {
  return fetchJson<CategoryMap>("/api/categories");
}
