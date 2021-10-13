import * as React from 'react';

const defaultColumnWidth = 200;

export default function useColumnsToFitPage(
  onUpdateColumnVisibilityFromPageSize: (columnCount: number) => void
) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const calculateNumberOfColumnsToFit = () => {
    const tableDivContainer = tableRef.current;
    const maxTableWidth = tableDivContainer
      ?.closest('.height-test-wrapper')
      ?.getBoundingClientRect().width;
    if (!maxTableWidth) return 0;

    const columnCount = Math.floor(maxTableWidth / defaultColumnWidth);

    return columnCount;
  };

  React.useEffect(() => {
    const columnCount = calculateNumberOfColumnsToFit();
    onUpdateColumnVisibilityFromPageSize(columnCount);
  }, [tableRef.current]);

  return {
    tableRef,
    calculateNumberOfColumnsToFit,
  };
}
