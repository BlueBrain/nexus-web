import * as React from 'react';
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
    if (ref && ref.current) {
      ref.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (ref && ref.current) {
        ref.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [ref, isFetching]);

  const handleScroll = () => {
    if (!ref || !ref.current) {
      return;
    }
    if (
      !isFetching &&
      ref.current.offsetHeight + ref.current.scrollTop >=
        ref.current.scrollHeight * loadAtPercentRevealed &&
      currentTotal !== total
    ) {
      callback();
    }
  };

  return [{ ref }];
};

export default useInfiniteScroll;
