import Icon, { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { debounce } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FilterIcon } from '../../shared/components/Icons/FilterIcon';

interface Props {
  children: ReactNode;
  onHidden: (offsetFromTop: number) => void;
}

export const FUSION_HEADER_HEIGHT = 52;

export const CollapsibleOnScroll: React.FC<Props> = ({
  children,
  onHidden,
}: Props) => {
  const [outOfViewport, setOutOfViewport] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [childrenHeight, setHeight] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  useScrollPosition(
    (currentYPosition: number) => {
      const childOffsetHeight = FUSION_HEADER_HEIGHT + childrenHeight;

      const shouldShow = currentYPosition > childOffsetHeight;
      if (shouldShow !== outOfViewport) setOutOfViewport(shouldShow);
    },
    100,
    [outOfViewport, childrenHeight]
  );

  useEffect(() => {
    if (ref.current) {
      const innerChildrenHeight = Array.from(ref.current.children).reduce(
        (acc, currentChild) => (acc = acc + currentChild.clientHeight),
        0
      );
      setHeight(innerChildrenHeight);
    }
  }, []);

  return (
    <>
      {outOfViewport &&
        (expanded ? (
          <Button
            style={{
              position: 'sticky',
              top: 150,
              zIndex: 20,
            }}
            shape="circle"
            icon={<CloseOutlined />}
            onClick={() => {
              setExpanded(false);
              onHidden(FUSION_HEADER_HEIGHT);
            }}
          ></Button>
        ) : (
          <Button
            style={{
              position: 'sticky',
              top: 150,
              zIndex: 20,
            }}
            shape="circle"
            icon={<FilterIcon />}
            onClick={() => {
              const childOffsetHeight = FUSION_HEADER_HEIGHT + childrenHeight;
              setExpanded(true);
              onHidden(childOffsetHeight);
            }}
          ></Button>
        ))}

      {(!outOfViewport || expanded) && (
        <div
          style={{
            position: expanded ? 'fixed' : 'relative',
            top: FUSION_HEADER_HEIGHT,
            left: 0,
            height: childrenHeight,
            zIndex: expanded ? 10 : 0,
          }}
          ref={ref}
        >
          {children}
        </div>
      )}
    </>
  );
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
