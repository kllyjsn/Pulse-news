import { useState, useEffect, useCallback, useRef } from "react";
import type { Article, BriefingResponse } from "../types";
import { fetchNews, fetchFeatured, fetchBriefing, fetchNewsMeta } from "../lib/api";
import type { NewsMeta } from "../lib/api";

const REFRESH_INTERVAL = 60_000;

export function useNews(category: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [meta, setMeta] = useState<NewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newArticleCount, setNewArticleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const load = useCallback(async (showLoading = true) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const isSaved = category === "saved";
      const fetchCat = isSaved ? "all" : category;

      const [newsRes, featuredRes, briefingRes, metaRes] = await Promise.allSettled([
        fetchNews(fetchCat, 100, 0, controller.signal),
        fetchFeatured(6, controller.signal),
        isSaved ? Promise.resolve(null) : fetchBriefing(fetchCat, controller.signal),
        fetchNewsMeta(fetchCat, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (newsRes.status === "fulfilled") {
        const newArticles = newsRes.value.articles;
        setArticles(newArticles);

        if (!showLoading && prevIdsRef.current.size > 0) {
          const newIds = newArticles.filter((a) => !prevIdsRef.current.has(a.id));
          if (newIds.length > 0) {
            setNewArticleCount((prev) => prev + newIds.length);
          }
        }
        prevIdsRef.current = new Set(newArticles.map((a) => a.id));
      }
      if (featuredRes.status === "fulfilled") {
        setFeatured(featuredRes.value.articles);
      }
      if (briefingRes.status === "fulfilled" && briefingRes.value) {
        setBriefing(briefingRes.value);
      }
      if (metaRes.status === "fulfilled") {
        setMeta(metaRes.value);
      }

      if (newsRes.status === "rejected" && featuredRes.status === "rejected" && briefingRes.status === "rejected") {
        setError("Failed to load news. Please check your connection and try again.");
      } else {
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [category]);

  useEffect(() => {
    setNewArticleCount(0);
    prevIdsRef.current = new Set();
    load(true);

    intervalRef.current = setInterval(() => load(false), REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      abortRef.current?.abort();
    };
  }, [load]);

  const dismissNewArticles = useCallback(() => setNewArticleCount(0), []);

  return {
    articles,
    featured,
    briefing,
    meta,
    loading,
    lastUpdated,
    error,
    newArticleCount,
    dismissNewArticles,
    refresh: () => load(false),
  };
}
