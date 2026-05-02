import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import type { Article } from "../types";

interface ShareButtonProps {
  article: Article;
  size?: "sm" | "md";
}

export function ShareButton({ article, size = "sm" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnClass =
    size === "sm"
      ? "p-1.5 rounded-lg"
      : "p-2 rounded-lg";

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(article.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [article]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className={`${btnClass} hover:bg-surface-3 transition-colors text-text-muted hover:text-text-primary`}
      title={copied ? "Copied!" : "Share"}
      aria-label={`Share article: ${article.title}`}
    >
      {copied ? (
        <Check className={`${iconSize} text-emerald-400`} />
      ) : (
        <Share2 className={iconSize} />
      )}
    </button>
  );
}
