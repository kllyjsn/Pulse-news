import { useEffect, useRef, useState, useMemo } from "react";
import { Zap } from "lucide-react";
import type { Article } from "../types";

interface LiveTickerProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export function LiveTicker({ articles, onArticleClick }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const breaking = useMemo(
    () =>
      articles
        .filter((a) => {
          if (!a.published) return false;
          const age = now - new Date(a.published).getTime();
          return age < 2 * 60 * 60 * 1000;
        })
        .slice(0, 12),
    [articles, now]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || paused || breaking.length === 0) return;

    let frame: number;
    let pos = 0;

    const step = () => {
      pos += 0.5;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [paused, breaking.length]);

  if (breaking.length === 0) return null;

  const doubled = [...breaking, ...breaking];

  return (
    <div
      className="relative border-b border-border bg-surface-2/80 backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider gap-1.5">
        <Zap className="w-3 h-3" />
        LIVE
      </div>
      <div
        ref={scrollRef}
        className="overflow-hidden whitespace-nowrap py-2 pl-20 scrollbar-none"
      >
        <div className="inline-flex gap-8">
          {doubled.map((a, i) => (
            <button
              key={`${a.id}-${i}`}
              onClick={() => onArticleClick(a)}
              className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
              <span className="font-medium">{a.source}</span>
              <span className="text-text-muted">—</span>
              <span className="max-w-[300px] truncate">{a.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-2 to-transparent pointer-events-none" />
    </div>
  );
}
