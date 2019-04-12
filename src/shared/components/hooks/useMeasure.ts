import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export default function useMeasure() {
  const ref = React.useRef<HTMLElement>();
  const [bounds, set] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [ro] = React.useState(
    () =>
      new ResizeObserver(([entry]) => {
        console.log({ entry });
        return set(entry.contentRect);
      })
  );
  React.useEffect(() => {
    if (ref && ref.current) {
      ro.observe(ref.current);
      const { height, width, top, left } = ref.current.getBoundingClientRect();
      set({ height, width, top, left });
    }
    return ro.disconnect;
  }, [ref]);
  return [{ ref }, bounds];
}
