import { useState, useEffect } from 'react';
import { isBrowser } from '../../utils';

// Watch an when a scrolling element reaches the bottom, set isFetching to true!
const useInfiniteScroll = (ref: HTMLElement, callback: VoidFunction) => {
  const [isFetching, setIsFetching] = useState(false);
  if (!isBrowser) {
    return [isFetching, setIsFetching];
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    callback();
  }, [isFetching]);

  function handleScroll() {
    if (window.innerHeight + ref.scrollTop !== ref.offsetHeight || isFetching) {
      return;
    }
    setIsFetching(true);
  }

  return [isFetching, setIsFetching];
};

export default useInfiniteScroll;
