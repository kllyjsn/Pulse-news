import { motion } from "framer-motion";
import { Clock, ExternalLink, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#6366f1",
  ai: "#8b5cf6",
  business: "#0ea5e9",
  money: "#10b981",
  geopolitics: "#f59e0b",
};

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const color = CATEGORY_COLORS[article.category] || "#6366f1";

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.5), ease: "easeOut" }}
      className="group flex flex-col rounded-xl border border-border bg-surface-2/50 card-glow overflow-hidden"
    >
      {/* Image */}
      {article.image_url && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-2 to-transparent opacity-60" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
            style={{
              background: `${color}20`,
              color: color,
            }}
          >
            {article.source_icon}
          </span>
          <span className="text-xs text-text-muted font-medium truncate">{article.source}</span>
          <span className="text-text-muted text-[8px]">•</span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
            style={{
              background: `${color}15`,
              color: color,
            }}
          >
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-semibold text-base leading-snug text-text-primary group-hover:text-white transition-colors line-clamp-3 mb-2">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3 flex-1">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {article.published && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {article.reading_time} min
            </span>
          </div>
          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
            <ExternalLink className="w-3 h-3" />
            Read
          </span>
        </div>
      </div>
    </motion.a>
  );
}
