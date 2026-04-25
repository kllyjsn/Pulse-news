import { useState, useEffect, useCallback, useRef } from "react";
import type { Article, BriefingResponse } from "../types";
import { fetchNews, fetchFeatured, fetchBriefing } from "../lib/api";

const REFRESH_INTERVAL = 60_000;

export function useNews(category: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [newsRes, featuredRes, briefingRes] = await Promise.allSettled([
        fetchNews(category),
        fetchFeatured(6),
        fetchBriefing(category),
      ]);

      if (newsRes.status === "fulfilled") {
        setArticles(newsRes.value.articles);
      }
      if (featuredRes.status === "fulfilled") {
        setFeatured(featuredRes.value.articles);
      }
      if (briefingRes.status === "fulfilled") {
        setBriefing(briefingRes.value);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load(true);

    intervalRef.current = setInterval(() => load(false), REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  return { articles, featured, briefing, loading, lastUpdated, error, refresh: () => load(false) };
}
