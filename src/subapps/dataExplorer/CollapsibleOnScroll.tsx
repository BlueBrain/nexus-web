import Icon, { SettingOutlined } from '@ant-design/icons';
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
  const [hardVisible, setHardVisible] = useState<boolean>(false);
  const [childrenHeight, setHeight] = useState<number>(0);

  const ref = useRef<HTMLDivElement>(null);

  const [outOfViewport, setOutOfViewport] = useState(false);

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
      {outOfViewport && (
        <Button
          style={{
            position: 'sticky',
            top: 150,
            zIndex: 100,
          }}
          shape="circle"
          icon={<FilterIcon />}
          onClick={() => {
            const childOffsetHeight = FUSION_HEADER_HEIGHT + childrenHeight;
            console.log('Children heigh', childOffsetHeight, childrenHeight);
            setHardVisible(!hardVisible);
            onHidden(childOffsetHeight);
          }}
        ></Button>
      )}
      <div
        style={{
          position: hardVisible ? 'fixed' : 'relative',
          top: hardVisible ? 60 : 0,
          left: 0,
          width: '100vw',
          height: hardVisible || !outOfViewport ? childrenHeight : 0,
          zIndex: hardVisible ? 100 : 0,
        }}
      >
        <div ref={ref}>{children}</div>
      </div>
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
