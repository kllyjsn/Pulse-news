import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#6366f1",
  ai: "#8b5cf6",
  business: "#0ea5e9",
  money: "#10b981",
  geopolitics: "#f59e0b",
};

interface FeaturedGridProps {
  articles: Article[];
  loading: boolean;
  onArticleClick: (article: Article) => void;
}

function FeaturedCard({
  article,
  index,
  large,
  onClick,
}: {
  article: Article;
  index: number;
  large?: boolean;
  onClick: (article: Article) => void;
}) {
  const color = CATEGORY_COLORS[article.category] || "#6366f1";

  return (
    <motion.button
      onClick={() => onClick(article)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className={`group relative rounded-2xl overflow-hidden border border-border card-glow
        flex flex-col text-left cursor-pointer ${large ? "row-span-2" : ""}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${large ? "h-64 sm:h-full" : "h-40"}`}>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${color}22, ${color}08)`,
            }}
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: `${color}25`,
              color: color,
            }}
          >
            {article.category}
          </span>
          <span className="text-[10px] text-text-muted font-medium">{article.source}</span>
        </div>

        <h3
          className={`font-serif font-bold leading-tight text-text-primary group-hover:text-white transition-colors
            ${large ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}
        >
          {article.title}
        </h3>

        {large && (
          <p className="mt-2 text-sm text-text-secondary line-clamp-2">{article.summary}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
          {article.published && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
            </span>
          )}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent font-medium">
            Read →
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function FeaturedGrid({ articles, loading, onArticleClick }: FeaturedGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:row-span-2 shimmer rounded-2xl h-64 md:h-auto" />
        <div className="shimmer rounded-2xl h-48" />
        <div className="shimmer rounded-2xl h-48" />
      </div>
    );
  }

  if (articles.length === 0) return null;

  const [hero, ...rest] = articles;
  const side = rest.slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {hero && <FeaturedCard article={hero} index={0} large onClick={onArticleClick} />}
      {side.map((a, i) => (
        <FeaturedCard key={a.id} article={a} index={i + 1} onClick={onArticleClick} />
      ))}
    </div>
  );
}
