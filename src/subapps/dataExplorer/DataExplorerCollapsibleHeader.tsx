import './styles.scss';

import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { throttle } from 'lodash';
import React, { ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { FilterIcon } from '../../shared/components/Icons/FilterIcon';

interface Props {
  children: ReactNode;
  onVisibilityChange: (offsetHeight: number) => void;
}

export const DataExplorerCollapsibleHeader: React.FC<Props> = ({
  children,
  onVisibilityChange,
}: Props) => {
  const [headerBottom, setHeaderBottom] = useState(0);
  const [headerOutOfViewport, setHeaderOutOfViewport] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const headerY =
      headerRef.current?.getBoundingClientRect().bottom ??
      FUSION_TITLEBAR_HEIGHT;
    setHeaderBottom(headerY);
    onVisibilityChange(headerY);
  }, []);

  useScrollPosition(
    (currentYPosition: number) => {
      const shouldHide = currentYPosition > headerBottom;
      if (shouldHide !== headerOutOfViewport) {
        toggleHeaderVisibility(shouldHide);
      }
      if (!headerOutOfViewport) {
        setHeaderExpanded(false);
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
      <div
        className="data-explorer-header"
        ref={headerRef}
        style={{
          display: !headerOutOfViewport || headerExpanded ? 'block' : 'none',
        }}
      >
        {children}
      </div>
      {headerOutOfViewport && (
        <>
          {headerExpanded ? (
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setHeaderExpanded(false);
                onVisibilityChange(FUSION_TITLEBAR_HEIGHT);
              }}
              shape="circle"
              className="toggle-header-buttons"
              aria-label="collapse-header"
              style={{ top: 60, left: 10 }}
            />
          ) : (
            <Button
              icon={<FilterIcon />}
              onClick={() => {
                setHeaderExpanded(true);
                onVisibilityChange(headerBottom);
              }}
              shape="circle"
              aria-label="expand-header"
              className="toggle-header-buttons"
            />
          )}
        </>
      )}
    </>
  );
};

export const FUSION_TITLEBAR_HEIGHT = 52; // height in pixels of the blue fixed header on every page of fusion.

const isBrowser = typeof window !== `undefined`;

export const getScrollYPosition = (): number => {
  if (!isBrowser) return 0;

  return window.scrollY;
};

export function useScrollPosition(
  effect: (currentYPosition: number) => void,
  waitMs: number,
  deps: React.DependencyList
) {
  const yPosition = useRef(getScrollYPosition());

  const callBack = () => {
    const currentPosition = getScrollYPosition();
    effect(currentPosition);
    yPosition.current = currentPosition;
  };

  useLayoutEffect(() => {
    const throttledCallback = throttle(callBack, waitMs, {
      leading: true,
    });
    window.addEventListener('scroll', throttledCallback);

    return () => {
      window.removeEventListener('scroll', throttledCallback);
    };
  }, deps);
}
