import { useState } from "react";
import { Zap, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Footer() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { keys: "/", desc: "Focus search" },
    { keys: "R", desc: "Refresh feed" },
    { keys: "1–7", desc: "Switch category" },
    { keys: "Esc", desc: "Close reader" },
  ];

  return (
    <footer className="border-t border-border mt-16 py-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Zap className="w-4 h-4 text-accent" aria-hidden="true" />
          <span className="font-semibold gradient-text">PULSE</span>
          <span>— Real-Time News Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowShortcuts((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Toggle keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Shortcuts
          </button>
          <p className="text-xs text-text-muted">
            Aggregated from public RSS feeds. Not affiliated with any news source.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Keyboard Shortcuts
                </span>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 rounded hover:bg-surface-3 text-text-muted"
                  aria-label="Close shortcuts"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {shortcuts.map((s) => (
                  <div key={s.keys} className="flex items-center gap-2 text-xs">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-text-secondary font-mono text-[10px]">
                      {s.keys}
                    </kbd>
                    <span className="text-text-muted">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
