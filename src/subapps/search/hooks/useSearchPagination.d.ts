import * as React from 'react';
export declare type SearchPagination = {
  numRowsFitOnPage: number;
  currentPage: number;
  totalNumberOfResults: number;
  trueTotalNumberOfResults: number;
  pageSize: number;
  pageSizeOptions: string[];
  pageSizeFixed: boolean;
  isInitialized: boolean;
};
export declare const ESMaxResultWindowSize = 10000;
export declare const defaultPageSizeOptions: number[];
declare function useSearchPagination(): {
  pagination: SearchPagination;
  setPagination: React.Dispatch<React.SetStateAction<SearchPagination>>;
  handlePaginationChange: (page: number, pageSize?: number | undefined) => void;
  onPageSizeOptionChanged: (current: any, size: any) => void;
  renderShowTotal: (total: number, range: [number, number]) => JSX.Element;
};
export declare function useAdjustTableHeight(
  pagination: SearchPagination,
  onTableHeightChanged: (numRows: number, lastPageOfResults: number) => void,
  onPageSizeOptionsChanged: (
    sortedPageSizeOptionsWithoutPotentialDupes: string[],
    pagination: SearchPagination
  ) => void
): {
  wrapperHeightRef: React.MutableRefObject<HTMLDivElement>;
  wrapperDOMProps: import('../../../shared/hooks/useMeasure').Bounds;
  resultTableHeightTestRef: React.MutableRefObject<HTMLDivElement>;
};
export default useSearchPagination;
