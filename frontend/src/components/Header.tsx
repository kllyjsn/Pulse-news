import { Search, Zap, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CategoryKey } from "../types";

const CATEGORIES: { key: CategoryKey; label: string; color: string }[] = [
  { key: "all", label: "All", color: "#e8eaf0" },
  { key: "tech", label: "Tech", color: "#6366f1" },
  { key: "ai", label: "AI", color: "#8b5cf6" },
  { key: "business", label: "Business", color: "#0ea5e9" },
  { key: "money", label: "Markets", color: "#10b981" },
  { key: "geopolitics", label: "World", color: "#f59e0b" },
];

interface HeaderProps {
  activeCategory: CategoryKey;
  onCategoryChange: (cat: CategoryKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function Header({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  lastUpdated,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">PULSE</span>
            </span>
            <div className="flex items-center gap-1.5 ml-3 text-xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-live" />
              LIVE
            </div>
          </div>

          {/* Search + Last Updated */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:block text-xs text-text-muted">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-text-secondary hover:text-text-primary"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-surface-2 border border-border
                  text-sm text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                  transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <nav className="flex gap-1 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
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
              <span className="relative z-10">{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
