import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function useMeasure() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [bounds, set] = React.useState<Bounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [ro] = React.useState(
    new ResizeObserver(([entry]) => set(entry.contentRect))
  );
  React.useEffect(() => {
    if (ref && ref.current) {
      ro.observe(ref.current);
      const { height, width, top, left } = ref.current.getBoundingClientRect();
      set({ height, width, top, left });
    }
    return () => {
      if (ref && ref.current) {
        ro.unobserve(ref.current);
      }
      ro.disconnect();
    };
  }, [ref, ro]);

  return [{ ref }, bounds] as [
    { ref: React.MutableRefObject<HTMLDivElement> },
    Bounds
  ];
}
