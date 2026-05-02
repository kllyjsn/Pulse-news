import { useCallback, useSyncExternalStore } from "react";

const STORE_KEY = "pulse-store";

interface PulseState {
  bookmarks: string[];
  readArticles: string[];
  readCount: number;
  lastSeenTimestamp: string | null;
}

const DEFAULT_STATE: PulseState = {
  bookmarks: [],
  readArticles: [],
  readCount: 0,
  lastSeenTimestamp: null,
};

function loadState(): PulseState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: PulseState) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let currentState = loadState();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return currentState;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(updater: (prev: PulseState) => PulseState) {
  currentState = updater(currentState);
  saveState(currentState);
  notify();
}

export function usePulseStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const toggleBookmark = useCallback((articleId: string) => {
    setState((prev) => {
      const has = prev.bookmarks.includes(articleId);
      return {
        ...prev,
        bookmarks: has
          ? prev.bookmarks.filter((id) => id !== articleId)
          : [...prev.bookmarks, articleId],
      };
    });
  }, []);

  const markRead = useCallback((articleId: string) => {
    setState((prev) => {
      if (prev.readArticles.includes(articleId)) return prev;
      return {
        ...prev,
        readArticles: [...prev.readArticles, articleId],
        readCount: prev.readCount + 1,
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (articleId: string) => state.bookmarks.includes(articleId),
    [state.bookmarks]
  );

  const isRead = useCallback(
    (articleId: string) => state.readArticles.includes(articleId),
    [state.readArticles]
  );

  const setLastSeen = useCallback((timestamp: string) => {
    setState((prev) => ({ ...prev, lastSeenTimestamp: timestamp }));
  }, []);

  return {
    bookmarks: state.bookmarks,
    readArticles: state.readArticles,
    readCount: state.readCount,
    lastSeenTimestamp: state.lastSeenTimestamp,
    toggleBookmark,
    markRead,
    isBookmarked,
    isRead,
    setLastSeen,
  };
}
