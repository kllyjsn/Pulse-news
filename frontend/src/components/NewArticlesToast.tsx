import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface NewArticlesToastProps {
  count: number;
  onDismiss: () => void;
}

export function NewArticlesToast({ count, onDismiss }: NewArticlesToastProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
      <motion.button
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          onDismiss();
        }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-accent text-white text-sm font-medium shadow-lg shadow-accent/25
          hover:bg-accent/90 transition-colors cursor-pointer"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        {count} new {count === 1 ? "article" : "articles"}
      </motion.button>
      )}
    </AnimatePresence>
  );
}
