import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, BookOpen, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetchArticleContent } from "../lib/api";
import type { Article, ArticleContent } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#6366f1",
  ai: "#8b5cf6",
  business: "#0ea5e9",
  money: "#10b981",
  geopolitics: "#f59e0b",
};

interface ArticleReaderProps {
  article: Article | null;
  onClose: () => void;
}

export function ArticleReader({ article, onClose }: ArticleReaderProps) {
  const [content, setContent] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const progress = scrollHeight <= clientHeight ? 100 : Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    setReadProgress(progress);
  }, []);

  useEffect(() => {
    if (!article) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const controller = new AbortController();

    setLoading(true);
    setError(false);
    setContent(null);
    setReadProgress(0);

    fetchArticleContent(article.url, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setContent(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      document.body.style.overflow = "";
    };
  }, [article]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const color = article ? CATEGORY_COLORS[article.category] || "#6366f1" : "#6366f1";

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Reader panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[min(700px,90vw)] bg-surface overflow-hidden
              flex flex-col border-l border-border shadow-2xl shadow-black/50"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-2/50">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{ background: `${color}25`, color }}
                >
                  {article.category}
                </span>
                <span className="text-xs text-text-muted truncate">{article.source}</span>
                {article.published && (
                  <>
                    <span className="text-text-muted text-[8px] shrink-0">•</span>
                    <span className="text-xs text-text-muted shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-text-secondary hover:text-text-primary"
                  title="Open original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-text-secondary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reading progress bar */}
            {content && !loading && (
              <div className="h-0.5 bg-surface-3">
                <div
                  className="h-full bg-accent transition-all duration-150 ease-out"
                  style={{ width: `${readProgress}%` }}
                />
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
              {/* Hero image */}
              {(content?.image_url || article.image_url) && (
                <div className="relative h-56 sm:h-72 overflow-hidden">
                  <img
                    src={content?.image_url || article.image_url || ""}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                </div>
              )}

              <div className="px-6 sm:px-10 py-6 max-w-none">
                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-text-primary mb-4">
                  {content?.title || article.title}
                </h1>

                {/* Reading time */}
                {content && content.reading_time > 0 && (
                  <div className="flex items-center gap-3 mb-6 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {content.reading_time} min read
                    </span>
                    <span>•</span>
                    <span>{content.source}</span>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    <span className="text-sm text-text-muted">Extracting article content...</span>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="text-center py-12">
                    <p className="text-text-secondary mb-4">Could not extract article content.</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setError(false);
                          setLoading(true);
                          setContent(null);
                          fetchArticleContent(article.url)
                            .then(setContent)
                            .catch(() => setError(true))
                            .finally(() => setLoading(false));
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-3 text-text-primary text-sm font-medium hover:bg-surface-3/80 transition-colors border border-border"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry
                      </button>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Read on original site
                      </a>
                    </div>
                  </div>
                )}

                {/* Article content */}
                {content && !loading && !error && (
                  <article
                    className="prose prose-invert prose-lg max-w-none
                      prose-headings:font-serif prose-headings:text-text-primary prose-headings:font-semibold
                      prose-p:text-text-secondary prose-p:leading-relaxed prose-p:text-base
                      prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-text-primary
                      prose-img:rounded-xl prose-img:my-6
                      prose-blockquote:border-l-accent prose-blockquote:text-text-secondary prose-blockquote:italic
                      prose-li:text-text-secondary
                      prose-hr:border-border
                      [&_figure]:my-6 [&_figcaption]:text-sm [&_figcaption]:text-text-muted [&_figcaption]:mt-2
                    "
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                )}
              </div>

              {/* Footer with original link */}
              {content && !loading && (
                <div className="px-6 sm:px-10 py-6 mt-4 border-t border-border">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on {article.source}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
