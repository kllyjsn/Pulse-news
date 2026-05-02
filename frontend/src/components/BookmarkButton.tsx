import { Bookmark } from "lucide-react";
import { usePulseStore } from "../stores/useStore";

interface BookmarkButtonProps {
  articleId: string;
  size?: "sm" | "md";
}

export function BookmarkButton({ articleId, size = "sm" }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = usePulseStore();
  const saved = isBookmarked(articleId);

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnClass =
    size === "sm"
      ? "p-1.5 rounded-lg"
      : "p-2 rounded-lg";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark(articleId);
      }}
      className={`${btnClass} hover:bg-surface-3 transition-colors ${
        saved ? "text-accent" : "text-text-muted hover:text-text-primary"
      }`}
      title={saved ? "Remove bookmark" : "Save for later"}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
    >
      <Bookmark className={`${iconSize} ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
