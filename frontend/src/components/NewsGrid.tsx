import { ArticleCard } from "./ArticleCard";
import type { Article } from "../types";

interface NewsGridProps {
  articles: Article[];
  loading: boolean;
  onArticleClick: (article: Article) => void;
}

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

export function NewsGrid({ articles, loading, onArticleClick }: NewsGridProps) {
  if (loading) return <LoadingSkeleton />;

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">No articles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {articles.map((article, i) => (
        <ArticleCard key={article.id} article={article} index={i} onClick={onArticleClick} />
      ))}
    </div>
  );
}
