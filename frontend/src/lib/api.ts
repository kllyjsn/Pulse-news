import type { NewsResponse, BriefingResponse, CategoryMap, ArticleContent } from "../types";

const BASE = import.meta.env.VITE_API_URL || "";

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export function fetchNews(category = "all", limit = 50, offset = 0, signal?: AbortSignal) {
  return fetchJson<NewsResponse>(
    `/api/news?category=${category}&limit=${limit}&offset=${offset}`,
    signal
  );
}

export function fetchFeatured(limit = 6, signal?: AbortSignal) {
  return fetchJson<NewsResponse>(`/api/news/featured?limit=${limit}`, signal);
}

export function fetchBriefing(category = "all", signal?: AbortSignal) {
  return fetchJson<BriefingResponse>(`/api/briefing?category=${category}`, signal);
}

export function fetchCategories() {
  return fetchJson<CategoryMap>("/api/categories");
}

export function fetchArticleContent(url: string, signal?: AbortSignal) {
  return fetchJson<ArticleContent>(
    `/api/article?url=${encodeURIComponent(url)}`,
    signal
  );
}
