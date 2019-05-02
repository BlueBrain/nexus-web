import * as React from 'react';
import { debounce } from '../../utils/debounce';
import { supportsPassive } from '../../utils/featureDetections';
import { isBrowser } from '../../utils';

// Watch an when a scrolling element reaches the bottom, then callback!
const useInfiniteScroll = (
  callback: VoidFunction,
  isFetching: boolean,
  loadAtPercentRevealed: number,
  currentTotal: number,
  total: number
) => {
  const ref = React.useRef<HTMLDivElement>(null);

  if (!isBrowser) {
    return [{ ref }];
  }

  React.useEffect(() => {
    const debounceMS = 100;
    const debouncedHandleScroll = debounce(
      handleScroll(currentTotal, total),
      debounceMS
    );
    if (ref && ref.current) {
      ref.current.addEventListener(
        'scroll',
        debouncedHandleScroll,
        supportsPassive ? { passive: true } : false
      );
    }
    return () => {
      if (ref && ref.current) {
        ref.current.removeEventListener('scroll', debouncedHandleScroll);
      }
    };
  }, [ref, isFetching, currentTotal]);

  const handleScroll = (currentTotal: number, total: number) => () => {
    if (!ref || !ref.current) {
      return;
    }
    if (
      !isFetching &&
      ref.current.offsetHeight + ref.current.scrollTop >=
        ref.current.scrollHeight * loadAtPercentRevealed &&
      currentTotal < total
    ) {
      callback();
    }
  };

  return [{ ref }];
};

export default useInfiniteScroll;
