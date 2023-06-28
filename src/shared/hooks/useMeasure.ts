import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}
type TElement = HTMLDivElement | HTMLInputElement;

export default function useMeasure<T extends TElement>() {
  const ref = React.useRef<T>(null);
  const [bounds, set] = React.useState<Bounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
  });

  const [ro] = React.useState(
    // @ts-ignore
    new ResizeObserver(([entry]) => set(entry.contentRect as Bounds))
  );
  React.useEffect(() => {
    if (ref && ref.current) {
      ro.observe(ref.current);
      const {
        height,
        width,
        top,
        left,
        bottom,
        right,
      } = ref.current.getBoundingClientRect();
      set({ height, width, top, left, bottom, right });
    }
    return () => {
      if (ref && ref.current) {
        ro.unobserve(ref.current);
      }
      ro.disconnect();
    };
  }, [ref, ro]);

  return [{ ref }, bounds] as [{ ref: React.MutableRefObject<T> }, Bounds];
}
