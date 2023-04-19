import * as React from 'react';
import { debounce } from 'lodash';
import useMeasure from '../../../shared/hooks/useMeasure';

export type SearchPagination = {
  numRowsFitOnPage: number;
  currentPage: number;
  totalNumberOfResults: number;
  trueTotalNumberOfResults: number;
  pageSize: number;
  pageSizeOptions: string[];
  pageSizeFixed: boolean;
  isInitialized: boolean;
};

/* ElasticSearch's index.max_result_window setting (default to 10k)
determines how far we can page into results */
export const ESMaxResultWindowSize = 10000;
export const defaultPageSizeOptions = [10, 20, 50, 100];

function useSearchPagination() {
  const defaultpagination: SearchPagination = {
    numRowsFitOnPage: 0,
    currentPage: 1,
    totalNumberOfResults: 0,
    trueTotalNumberOfResults: 0,
    pageSize: 0,
    pageSizeOptions: [] as string[],
    pageSizeFixed: false,
    isInitialized: false,
  };
  const [pagination, setPagination] = React.useState<SearchPagination>(
    defaultpagination
  );

  const handlePaginationChange = (
    page: number,
    pageSize?: number | undefined
  ) => {
    setPagination(prevPagination => {
      return {
        ...prevPagination,
        currentPage: page,
        pageSizeFixed: prevPagination.pageSizeFixed,
        pageSize: pageSize ? pageSize : prevPagination.pageSize,
      };
    });
  };

  const onPageSizeOptionChanged = React.useCallback(
    (current, size) => {
      if (defaultPageSizeOptions.includes(size)) {
        localStorage.setItem('searchPageSize', size.toString());
        setPagination(prevPagination => {
          return {
            ...prevPagination,
            pageSizeFixed: true,
          };
        });
      } else {
        localStorage.removeItem('searchPageSize');
        setPagination(prevPagination => {
          return {
            ...prevPagination,
            pageSizeFixed: false,
          };
        });
      }
    },
    [pagination]
  );

  const renderShowTotal = React.useCallback(
    (total: number, range: [number, number]) =>
      pagination.trueTotalNumberOfResults <= ESMaxResultWindowSize ? (
        <span>
          {total === 0 ? 'No' : total.toLocaleString('en-US')}
          {total === 1 ? 'result' : 'results'}
        </span>
      ) : (
        <span>{`${total.toLocaleString('en-US')} results`}</span>
      ),
    [pagination]
  );

  return {
    pagination,
    setPagination,
    handlePaginationChange,
    onPageSizeOptionChanged,
    renderShowTotal,
  };
}

export function useAdjustTableHeight(
  pagination: SearchPagination,
  onTableHeightChanged: (numRows: number, lastPageOfResults: number) => void,
  onPageSizeOptionsChanged: (
    sortedPageSizeOptionsWithoutPotentialDupes: string[],
    pagination: SearchPagination
  ) => void
) {
  const [{ ref: wrapperHeightRef }, wrapperDOMProps] = useMeasure();
  const [{ ref: resultTableHeightTestRef }] = useMeasure();
  const defaultNumberOfRows = 50;
  const calculateNumberOfTableRowsFitOnPage = () => {
    if (resultTableHeightTestRef.current) {
      // make our height tester table visible in the DOM to perform our calculations
      resultTableHeightTestRef.current.style.display = '';
      const heightTesterDivBottomPosition = wrapperHeightRef.current.getClientRects()[0]
        .bottom;
      const searchResultsTableBodyTopPosition = wrapperHeightRef.current
        .getElementsByTagName('tbody')[0]
        .getClientRects()[0].top;
      const searchResultsTableSingleRowHeight = wrapperHeightRef.current.getElementsByClassName(
        'ant-table-row'
      )[0].clientHeight;

      const totalTableRowsSpaceAvailable =
        heightTesterDivBottomPosition - searchResultsTableBodyTopPosition;
      const numRowsFitOnPage = Math.floor(
        totalTableRowsSpaceAvailable / searchResultsTableSingleRowHeight
      );

      // finished calculations, hide our height tester table
      resultTableHeightTestRef.current.style.display = 'None';

      return numRowsFitOnPage;
    }
    return defaultNumberOfRows;
  };

  const updateNumberOfRowsFitOnPage = () => {
    const numRows = calculateNumberOfTableRowsFitOnPage();

    if (numRows > 0) {
      const lastPageOfResults = Math.ceil(
        pagination.totalNumberOfResults / numRows
      );

      onTableHeightChanged(numRows, lastPageOfResults);
    }
  };

  /* height changes a few times when resizing a window so debounce */
  const debounceHeightChange = React.useRef(
    debounce(() => updateNumberOfRowsFitOnPage(), 300)
  ).current;

  React.useLayoutEffect(() => {
    debounceHeightChange();

    return () => {
      debounceHeightChange.cancel();
    };
  }, [wrapperDOMProps.height]);

  React.useEffect(() => {
    if (pagination.numRowsFitOnPage > 0) {
      const sortedPageSizeOptions = [pagination.numRowsFitOnPage]
        .concat(defaultPageSizeOptions)
        .sort((a, b) => a - b)
        .map(String);

      const sortedPageSizeOptionsWithoutPotentialDupes = [
        ...new Set(sortedPageSizeOptions),
      ];
      onPageSizeOptionsChanged(
        sortedPageSizeOptionsWithoutPotentialDupes,
        pagination
      );
    }
  }, [pagination.numRowsFitOnPage]);

  return {
    wrapperHeightRef,
    wrapperDOMProps,
    resultTableHeightTestRef,
  };
}

export default useSearchPagination;
