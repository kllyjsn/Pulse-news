import { forwardRef } from "react";
import { Search, Zap, RefreshCw, X, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CategoryKey } from "../types";

const CATEGORIES: { key: CategoryKey; label: string; color: string; icon?: typeof Bookmark }[] = [
  { key: "all", label: "All", color: "#e8eaf0" },
  { key: "tech", label: "Tech", color: "#6366f1" },
  { key: "ai", label: "AI", color: "#8b5cf6" },
  { key: "business", label: "Business", color: "#0ea5e9" },
  { key: "money", label: "Markets", color: "#10b981" },
  { key: "geopolitics", label: "World", color: "#f59e0b" },
  { key: "saved", label: "Saved", color: "#ec4899", icon: Bookmark },
];

interface HeaderProps {
  activeCategory: CategoryKey;
  onCategoryChange: (cat: CategoryKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading?: boolean;
  savedCount?: number;
  readCount?: number;
}

export const Header = forwardRef<HTMLInputElement, HeaderProps>(function Header(
  {
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    lastUpdated,
    onRefresh,
    loading,
    savedCount = 0,
    readCount = 0,
  },
  searchRef
) {
  return (
    <header className="sticky top-0 z-50 glass" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">PULSE</span>
            </span>
            <div className="flex items-center gap-1.5 ml-3 text-xs text-text-muted" aria-label="Live updates active">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-live" aria-hidden="true" />
              LIVE
            </div>
          </div>

          {/* Search + Last Updated */}
          <div className="flex items-center gap-3">
            {readCount > 0 && (
              <span className="hidden lg:block text-xs text-text-muted">
                {readCount} read today
              </span>
            )}
            {lastUpdated && (
              <span className="hidden sm:block text-xs text-text-muted">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-text-secondary hover:text-text-primary focus-ring"
              title="Refresh (R)"
              disabled={loading}
              aria-label="Refresh news"
            >
              <RefreshCw className={`w-4 h-4 transition-transform ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search... ( / )"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-48 sm:w-64 pl-9 ${searchQuery ? "pr-8" : "pr-3"} py-2 rounded-xl bg-surface-2 border border-border
                  text-sm text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                  transition-all`}
                aria-label="Search articles"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-3 transition-colors text-text-muted hover:text-text-primary"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <nav className="flex gap-1 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="News categories">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                role="tab"
                aria-selected={activeCategory === cat.key}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap focus-ring
                  ${
                    activeCategory === cat.key
                      ? "text-white"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-3"
                  }`}
              >
                {activeCategory === cat.key && (
                  <span
                    className="absolute inset-0 rounded-full opacity-90"
                    style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}88)` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {cat.label}
                  {cat.key === "saved" && savedCount > 0 && (
                    <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
});
