import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-semibold gradient-text">PULSE</span>
          <span>— Real-Time News Intelligence</span>
        </div>
        <p className="text-xs text-text-muted">
          Aggregated from public RSS feeds. Not affiliated with any news source.
        </p>
      </div>
    </footer>
  );
}
