import { useEffect, useLayoutEffect, useRef } from "react";

interface UseInfiniteScrollTopProps {
  hasMore: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  itemCount: number;
}

export function useInfiniteScrollTop({
  hasMore,
  isFetchingNextPage,
  onLoadMore,
  itemCount,
}: UseInfiniteScrollTopProps) {
  const topRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    const node = topRef.current;
    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingNextPage) {
          previousScrollHeightRef.current =
            document.documentElement.scrollHeight;
          onLoadMore();
        }
      },
      { rootMargin: "200px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, onLoadMore]);

  useLayoutEffect(() => {
    if (previousScrollHeightRef.current === null) {
      return;
    }

    const delta =
      document.documentElement.scrollHeight - previousScrollHeightRef.current;
    if (delta > 0) {
      window.scrollBy(0, delta);
    }
    previousScrollHeightRef.current = null;
  }, [itemCount]);

  return { topRef };
}
