import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { AIBriefing } from "./components/AIBriefing";
import { FeaturedGrid } from "./components/FeaturedGrid";
import { NewsGrid } from "./components/NewsGrid";
import { Footer } from "./components/Footer";
import { ArticleReader } from "./components/ArticleReader";
import { LiveTicker } from "./components/LiveTicker";
import { NewArticlesToast } from "./components/NewArticlesToast";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { useNews } from "./hooks/useNews";
import { usePulseStore } from "./stores/useStore";
import type { Article, CategoryKey } from "./types";

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    articles,
    featured,
    briefing,
    meta,
    loading,
    lastUpdated,
    error,
    newArticleCount,
    dismissNewArticles,
    refresh,
  } = useNews(category);

  const { bookmarks, readArticles, readCount, markRead } = usePulseStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category]);

  const handleArticleClick = useCallback(
    (article: Article) => {
      setSelectedArticle(article);
      markRead(article.id);
    },
    [markRead]
  );

  const handleCloseReader = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleCategoryChange = useCallback((cat: CategoryKey) => {
    setCategory(cat);
    setSearchQuery("");
  }, []);

  const breakingIds = useMemo(() => new Set(meta?.breaking_ids ?? []), [meta]);
  const trendingIds = useMemo(() => new Set(meta?.trending_ids ?? []), [meta]);
  const clusterCounts = useMemo(() => new Map(Object.entries(meta?.cluster_counts ?? {})), [meta]);

  const displayArticles = useMemo(() => {
    if (category === "saved") {
      return articles.filter((a) => bookmarks.includes(a.id));
    }
    return articles;
  }, [category, articles, bookmarks]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return displayArticles;
    const q = searchQuery.toLowerCase();
    return displayArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }, [displayArticles, searchQuery]);

  const showFeatured = category === "all" && !searchQuery;
  const featuredIds = useMemo(() => new Set(featured.map((a) => a.id)), [featured]);
  const gridArticles = useMemo(
    () => showFeatured ? filteredArticles.filter((a) => !featuredIds.has(a.id)) : filteredArticles,
    [filteredArticles, featuredIds, showFeatured]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <KeyboardShortcuts
        onCategoryChange={handleCategoryChange}
        onFocusSearch={handleFocusSearch}
        onRefresh={refresh}
      />

      <Header
        ref={searchInputRef}
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        loading={loading}
        savedCount={bookmarks.length}
        readCount={readCount}
      />

      {/* Live breaking ticker */}
      {category !== "saved" && (
        <LiveTicker articles={articles} onArticleClick={handleArticleClick} />
      )}

      {/* New articles toast */}
      <NewArticlesToast count={newArticleCount} onDismiss={dismissNewArticles} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8" role="main">
        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center" role="alert">
            <p className="text-text-secondary mb-3">{error}</p>
            <button
              onClick={() => refresh()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* AI Briefing — hide on saved tab */}
        {category !== "saved" && (
          <AIBriefing briefing={briefing} loading={loading} />
        )}

        {/* Featured stories — only show on "all" tab without search */}
        {showFeatured && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-accent" aria-hidden="true" />
              Top Stories
            </h2>
            <FeaturedGrid articles={featured} loading={loading} onArticleClick={handleArticleClick} />
          </section>
        )}

        {/* Saved empty state */}
        {category === "saved" && !loading && displayArticles.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <div className="text-4xl">📑</div>
            <p className="text-text-secondary text-lg font-medium">No saved articles yet</p>
            <p className="text-text-muted text-sm">
              Bookmark articles to read later — they'll appear here
            </p>
          </div>
        )}

        {/* News grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-accent" aria-hidden="true" />
              {category === "saved"
                ? "Saved Articles"
                : searchQuery
                  ? "Search Results"
                  : "Latest"}
            </h2>
            {!loading && (
              <span className="text-xs text-text-muted">
                {gridArticles.length} articles
              </span>
            )}
          </div>
          <NewsGrid
            articles={gridArticles}
            loading={loading}
            onArticleClick={handleArticleClick}
            readArticles={readArticles}
            breakingIds={breakingIds}
            trendingIds={trendingIds}
            clusterCounts={clusterCounts}
          />
        </section>
      </main>

      <Footer />

      {/* Article Reader */}
      <ArticleReader article={selectedArticle} onClose={handleCloseReader} />
    </div>
  );
}
