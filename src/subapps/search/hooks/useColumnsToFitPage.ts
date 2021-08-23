import * as React from 'react';

export default function useColumnsToFitPage(
  wrapperDOMProps: any,
  onUpdateColumnVisibilityFromPageSize: (columnCount: number) => void
) {
  const [prevWidth, setPrevWidth] = React.useState(0);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const calculateColumnsThatFit = () => {
    const tableDivContainer = tableRef.current;
    const maxTableWidth = tableDivContainer
      ?.closest('.height-test-wrapper')
      ?.getBoundingClientRect().width;

    const tableColumns = tableDivContainer?.getElementsByClassName(
      'ant-table-cell'
    );
    if (!tableColumns || !maxTableWidth) return 0;
    let columnCount = 0;
    let cumulativeColumnWidths = 0;

    while (columnCount < tableColumns.length) {
      cumulativeColumnWidths =
        cumulativeColumnWidths +
        tableColumns[columnCount].getBoundingClientRect().width;

      if (cumulativeColumnWidths > maxTableWidth) break;

      columnCount += 1;
    }

    return columnCount;
  };

  React.useEffect(() => {
    if (wrapperDOMProps.width <= prevWidth) return;
    const columnCount = calculateColumnsThatFit();
    setPrevWidth(wrapperDOMProps.width);
    onUpdateColumnVisibilityFromPageSize(columnCount);
  }, [wrapperDOMProps.width]);

  return {
    tableRef,
  };
}
