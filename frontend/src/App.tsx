import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { AIBriefing } from "./components/AIBriefing";
import { FeaturedGrid } from "./components/FeaturedGrid";
import { NewsGrid } from "./components/NewsGrid";
import { Footer } from "./components/Footer";
import { useNews } from "./hooks/useNews";
import type { CategoryKey } from "./types";

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { articles, featured, briefing, loading, lastUpdated, refresh } = useNews(category);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  // Don't show featured articles in the grid
  const featuredIds = useMemo(() => new Set(featured.map((a) => a.id)), [featured]);
  const gridArticles = useMemo(
    () => filteredArticles.filter((a) => !featuredIds.has(a.id)),
    [filteredArticles, featuredIds]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeCategory={category}
        onCategoryChange={(cat) => {
          setCategory(cat);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* AI Briefing */}
        <AIBriefing briefing={briefing} loading={loading} />

        {/* Featured stories — only show on "all" tab without search */}
        {category === "all" && !searchQuery && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-accent" />
              Top Stories
            </h2>
            <FeaturedGrid articles={featured} loading={loading} />
          </section>
        )}

        {/* News grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-accent" />
              {searchQuery ? "Search Results" : "Latest"}
            </h2>
            {!loading && (
              <span className="text-xs text-text-muted">
                {gridArticles.length} articles
              </span>
            )}
          </div>
          <NewsGrid articles={gridArticles} loading={loading} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
