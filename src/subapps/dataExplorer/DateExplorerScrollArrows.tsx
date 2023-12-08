import { clsx } from 'clsx';
import React, { useEffect, useReducer, useRef } from 'react';

import LeftSpeedArrow, {
  LeftArrow,
} from '../../shared/components/Icons/LeftSpeedArrow';
import RightSpeedArrow, {
  RightArrow,
} from '../../shared/components/Icons/RightSpeedArrow';
import { TType } from '../../shared/molecules/TypeSelector/types';

type TArrowsDisplay = {
  returnToStart: boolean;
  goToEnd: boolean;
  columnsOffsetLeft: {
    name: string | null;
    offsetLeft: number;
    width: number;
  }[];
  lastColumnScrollToIndex: number;
  recalculateColumnsOffsetLeft: boolean;
};
type TDateExplorerScrollArrowsProps = {
  isLoading: boolean;
  container: HTMLDivElement | null;
  table: HTMLDivElement | null;
  orgAndProject: [string, string] | undefined;
  types: TType[] | undefined;
  showEmptyDataCells: boolean;
  showMetadataColumns: boolean;
};
const DateExplorerScrollArrows = ({
  container,
  table,
  isLoading,
  orgAndProject,
  types,
  showEmptyDataCells,
  showMetadataColumns,
}: TDateExplorerScrollArrowsProps) => {
  const [
    {
      goToEnd,
      returnToStart,
      columnsOffsetLeft,
      lastColumnScrollToIndex,
      recalculateColumnsOffsetLeft,
    },
    updateArrowsState,
  ] = useReducer(
    (previous: TArrowsDisplay, next: Partial<TArrowsDisplay>) => ({
      ...previous,
      ...next,
    }),
    {
      returnToStart: false,
      goToEnd: false,
      columnsOffsetLeft: [],
      lastColumnScrollToIndex: 0,
      recalculateColumnsOffsetLeft: false,
    }
  );

  const onLeftArrowClick = () => {
    window.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const onRightArrowClick = () => {
    const tableRect = table?.getBoundingClientRect();
    const tableWidth = tableRect?.width || 0;
    window.scrollTo({ left: tableWidth, behavior: 'smooth' });
  };
  const onLeftNormalArrowClick = () => {
    const previousElement = lastColumnScrollToIndex
      ? lastColumnScrollToIndex - 1
      : 0;
    const previousElementOffsetLeft = columnsOffsetLeft[previousElement];
    window.scrollTo({
      left: previousElementOffsetLeft.offsetLeft + 52,
      behavior: 'smooth',
    });
    updateArrowsState({ lastColumnScrollToIndex: previousElement });
  };
  const onRightNormalArrowClick = () => {
    const nextElement =
      lastColumnScrollToIndex + 1 <= columnsOffsetLeft.length
        ? lastColumnScrollToIndex + 1
        : columnsOffsetLeft.length - 1;
    const nextElementOffsetLeft = columnsOffsetLeft[nextElement];
    window.scrollTo({
      left: nextElementOffsetLeft.offsetLeft + 52,
      behavior: 'smooth',
    });
    updateArrowsState({ lastColumnScrollToIndex: nextElement });
  };

  useEffect(() => {
    const onScroll = (ev?: Event) => {
      const containerRect = container?.getBoundingClientRect();
      const tableRect = table?.getBoundingClientRect();
      const x = containerRect?.x || 0;
      const width = containerRect?.width || 0;
      const tableWidth = tableRect?.width || 0;
      updateArrowsState({ returnToStart: x < 0 });
      updateArrowsState({ goToEnd: tableWidth > width });
    };
    if (!isLoading) {
      onScroll();
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [container, table, isLoading]);

  useEffect(() => {
    if (!isLoading && table && !recalculateColumnsOffsetLeft) {
      const timeoutId = setTimeout(() => {
        const columns = document.querySelectorAll('th.data-explorer-column');
        updateArrowsState({
          columnsOffsetLeft: Array.from(columns).map(column => {
            return {
              name: (column as HTMLElement).getAttribute('aria-label'),
              offsetLeft: (column as HTMLElement).offsetLeft,
              width: (column as HTMLElement).offsetWidth,
            };
          }),
          recalculateColumnsOffsetLeft: true,
        });
        clearTimeout(timeoutId);
      }, 1000);
    }
  }, [isLoading, table, recalculateColumnsOffsetLeft]);

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    updateArrowsState({
      recalculateColumnsOffsetLeft: false,
      lastColumnScrollToIndex: 0,
    });
  }, [orgAndProject, types, showEmptyDataCells, showMetadataColumns]);

  const tableRect = table?.getBoundingClientRect();
  const hideRightArrows = tableRect
    ? tableRect.width + tableRect.x - window.innerWidth < 60
    : false;
  return isLoading ? (
    <></>
  ) : (
    <div className="data-explorer-speed-arrows">
      <div className="left">
        <div
          onClick={onLeftArrowClick}
          className={clsx('left-speed-arrow', {
            'right-speed-arrow--hidden': !returnToStart,
          })}
        >
          <LeftSpeedArrow />
        </div>
        <div
          onClick={onLeftNormalArrowClick}
          className={clsx('left-arrow', {
            'left-arrow--hidden': lastColumnScrollToIndex === 0,
          })}
        >
          <LeftArrow />
        </div>
      </div>
      <div className="right">
        <div
          onClick={onRightNormalArrowClick}
          className={clsx('right-arrow', {
            'right-arrow--hidden':
              lastColumnScrollToIndex === columnsOffsetLeft.length - 1 ||
              hideRightArrows,
          })}
        >
          <RightArrow />
        </div>
        <div
          onClick={onRightArrowClick}
          className={clsx('right-speed-arrow', {
            'right-speed-arrow--hidden': !goToEnd || hideRightArrows,
          })}
        >
          <RightSpeedArrow />
        </div>
      </div>
    </div>
  );
};

export default DateExplorerScrollArrows;
