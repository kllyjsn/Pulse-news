import { useEffect } from "react";
import type { CategoryKey } from "../types";

interface KeyboardShortcutsProps {
  onCategoryChange: (cat: CategoryKey) => void;
  onFocusSearch: () => void;
  onRefresh: () => void;
}

const CATEGORY_KEYS: Record<string, CategoryKey> = {
  "1": "all",
  "2": "tech",
  "3": "ai",
  "4": "business",
  "5": "money",
  "6": "geopolitics",
  "7": "saved",
};

export function KeyboardShortcuts({
  onCategoryChange,
  onFocusSearch,
  onRefresh,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch();
        return;
      }

      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onRefresh();
        return;
      }

      const cat = CATEGORY_KEYS[e.key];
      if (cat && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onCategoryChange(cat);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCategoryChange, onFocusSearch, onRefresh]);

  return null;
}
