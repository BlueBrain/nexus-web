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
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const headerY =
      headerRef.current?.getBoundingClientRect().bottom ??
      FUSION_TITLEBAR_HEIGHT;
    console.log('Calculated Height', headerY);
    onVisibilityChange(headerY);
  }, []);

  return (
    <>
      <div
        className="data-explorer-header"
        style={{ ...fixedHeaderStyles }}
        ref={headerRef}
      >
        {children}
      </div>
    </>
  );
};

export const FUSION_TITLEBAR_HEIGHT = 52; // height in pixels of the blue fixed header on every page of fusion.

const fixedHeaderStyles: CSSProperties = {
  position: 'fixed',
  top: FUSION_TITLEBAR_HEIGHT,
  left: 0,
  width: '100vw',
  padding: '20px 52px',
  zIndex: 2,
};
