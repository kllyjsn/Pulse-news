import { useRef, useEffect, useState, useCallback } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "../types";

interface NewsGridProps {
  articles: Article[];
  loading: boolean;
  onArticleClick: (article: Article) => void;
  readArticles?: string[];
  breakingIds?: Set<string>;
  trendingIds?: Set<string>;
  clusterCounts?: Map<string, number>;
}

const PAGE_SIZE = 20;

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <div className="shimmer h-40" />
          <div className="p-4 space-y-3 bg-surface-2/50 border border-border border-t-0 rounded-b-xl">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-5 w-full rounded" />
            <div className="shimmer h-5 w-3/4 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsGrid({
  articles,
  loading,
  onArticleClick,
  readArticles = [],
  breakingIds,
  trendingIds,
  clusterCounts,
}: NewsGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const readSet = new Set(readArticles);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [articles]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, articles.length));
      }
    },
    [articles.length]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  if (loading) return <LoadingSkeleton />;

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-text-secondary text-lg font-medium">No articles found</p>
        <p className="text-text-muted text-sm">Try a different search term or category</p>
      </div>
    );
  }

  const visible = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((article, i) => (
          <ArticleCard
            key={article.id}
            article={article}
            index={i}
            onClick={onArticleClick}
            isRead={readSet.has(article.id)}
            isBreaking={breakingIds?.has(article.id)}
            isTrending={trendingIds?.has(article.id)}
            clusterCount={clusterCounts?.get(article.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, articles.length))}
            className="px-6 py-2.5 rounded-xl bg-surface-2 border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            Load more ({articles.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}
