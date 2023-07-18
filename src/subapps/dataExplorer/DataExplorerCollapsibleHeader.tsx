import React, {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import './styles.less';

interface Props {
  children: ReactNode;
  onVisibilityChange: (offsetHeight: number) => void;
}

export const DataExplorerCollapsibleHeader: React.FC<Props> = ({
  children,
  onVisibilityChange,
}: Props) => {
  const [headerBottom, setHeaderBottom] = useState<number>(0);
  const [headerOutOfViewport, setHeaderOutOfViewport] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const headerY =
      headerRef.current?.getBoundingClientRect().bottom ??
      FUSION_TITLEBAR_HEIGHT;
    setHeaderBottom(headerY);
    onVisibilityChange(headerY);
  }, []);

  useScrollPosition(
    function(currentYPosition: number) {
      const shouldHide = currentYPosition > headerBottom;
      if (shouldHide !== headerOutOfViewport) {
        toggleHeaderVisibility(shouldHide);
      }
    },
    100, // throttle time in ms for scroll event
    [headerBottom, headerOutOfViewport]
  );

  const toggleHeaderVisibility = (shouldHide: boolean) => {
    setHeaderOutOfViewport(shouldHide);
    onVisibilityChange(shouldHide ? FUSION_TITLEBAR_HEIGHT : headerBottom);
  };

  return (
    <>
      {!headerOutOfViewport && (
        <div
          className="data-explorer-header"
          style={{ ...fixedHeaderStyles }}
          ref={headerRef}
        >
          {children}
        </div>
      )}
    </>
  );
};

export const FUSION_TITLEBAR_HEIGHT = 52; // height in pixels of the blue fixed header on every page of fusion.

// TODO: Move to styles.less
const fixedHeaderStyles: CSSProperties = {
  position: 'fixed',
  top: FUSION_TITLEBAR_HEIGHT,
  left: 0,
  width: '100vw',
  padding: '20px 52px',
  zIndex: 2,
};

const isBrowser = typeof window !== `undefined`;

const getScrollYPosition = (): number => {
  if (!isBrowser) return 0;

  return window.scrollY;
};

export function useScrollPosition(
  effect: (currentYPosition: number) => void,
  waitMs: number,
  deps: React.DependencyList
) {
  const yPosition = useRef(getScrollYPosition());

  let throttleTimeout: number | null = null;

  const callBack = () => {
    const currentPosition = getScrollYPosition();
    effect(currentPosition);
    yPosition.current = currentPosition;
    throttleTimeout = null;
  };

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (throttleTimeout === null) {
        throttleTimeout = window.setTimeout(callBack, waitMs);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, deps);
}
