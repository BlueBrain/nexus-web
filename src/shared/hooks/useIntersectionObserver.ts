import React, { useEffect } from 'react';

type IntersectionObserver<T> = {
  root?: Element | Document | null | undefined;
  target: React.MutableRefObject<HTMLElement | null>;
  onIntersect: any;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
};
export default function useIntersectionObserver<T>({
  root,
  target,
  onIntersect,
  threshold = 1.0,
  rootMargin = '0px',
  enabled = true,
}: IntersectionObserver<T>) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => entry.isIntersecting && onIntersect()),
      {
        root: root,
        rootMargin,
        threshold,
      }
    );

    const el = target && target.current;

    if (!el) {
      return;
    }

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [target?.current, enabled]);
}
