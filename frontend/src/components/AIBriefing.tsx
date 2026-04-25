import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { BriefingResponse } from "../types";

interface AIBriefingProps {
  briefing: BriefingResponse | null;
  loading: boolean;
}

export function AIBriefing({ briefing, loading }: AIBriefingProps) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 shimmer h-32" />
    );
  }

  if (!briefing || !briefing.briefing || briefing.briefing.includes("Configure PERPLEXITY")) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
        <div className="h-full w-full rounded-2xl bg-surface" />
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            AI Briefing
          </span>
        </div>
        <p className="text-text-primary text-sm sm:text-base leading-relaxed mb-4">
          {briefing.briefing}
        </p>
        <div className="flex flex-wrap gap-2">
          {briefing.key_themes.map((theme) => (
            <span
              key={theme}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-3 text-text-secondary
                border border-border"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
