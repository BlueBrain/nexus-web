import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import TableHeightWrapper from '../components/TableHeightWrapper';
import { Table } from 'antd';
import useGlobalSearchData from '../hooks/useGlobalSearch';
import useQueryString from '../../../shared/hooks/useQueryString';
import useSearchPagination, {
  useAdjustTableHeight,
  SearchPagination,
  ESMaxResultWindowSize,
} from '../hooks/useSearchPagination';

const SearchContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams] = useQueryString();
  const { query } = queryParams;

  const onRowClick = (record: any): { onClick: () => void } => {
    return {
      onClick: () => {
        const projectLabel = record.project.label;
        const resourceId = encodeURIComponent(record['@id']);
        history.push(`/${projectLabel}/resources/${resourceId}`, {
          background: location,
        });
      },
    };
  };

  const {
    pagination,
    setPagination,
    handlePaginationChange,
    showTotal,
    onShowSizeChange,
  } = useSearchPagination(query, nexus);

  function updateRowsCallBack(
    sortedPageSizeOptionsWithoutPotentialDupes: string[],
    pagination: SearchPagination
  ) {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        pageSizeOptions: sortedPageSizeOptionsWithoutPotentialDupes,
        pageSize: pagination.pageSizeFixed
          ? prevPagination.pageSize
          : prevPagination.numRowsFitOnPage,
      };
    });
  }

  function updatePagination(numRows: number, lastPageOfResults: number) {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        numRowsFitOnPage: numRows,
        currentPage:
          prevPagination.currentPage > lastPageOfResults &&
          lastPageOfResults !== 0
            ? lastPageOfResults
            : prevPagination.currentPage,
      };
    });
  }

  const {
    wrapperHeightRef,
    resultTableHeightTestRef,
    wrapperDOMProps,
  } = useAdjustTableHeight(pagination, updatePagination, updateRowsCallBack);

  function onQuerySuccess(queryResponse: any) {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        isInitialized: true,
        totalNumberOfResults:
          queryResponse.hits.total.value > ESMaxResultWindowSize
            ? ESMaxResultWindowSize
            : queryResponse.hits.total.value,
        trueTotalNumberOfResults: queryResponse.hits.total.value,
      };
    });
  }

  const { columns, data } = useGlobalSearchData(
    query,
    pagination.currentPage,
    pagination.pageSize,
    onQuerySuccess,
    nexus
  );

  return (
    <TableHeightWrapper
      wrapperHeightRef={wrapperHeightRef}
      resultTableHeightTestRef={resultTableHeightTestRef}
      wrapperDOMProps={wrapperDOMProps}
    >
      {columns && data && (
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            showTotal,
            onShowSizeChange,
            total: pagination.totalNumberOfResults,
            pageSize: pagination.pageSize,
            current: pagination.currentPage,
            onChange: handlePaginationChange,
            position: ['topRight'],
            locale: { items_per_page: '' },
            showSizeChanger: true,
            pageSizeOptions: pagination.pageSizeOptions,
            showLessItems: true,
          }}
          rowKey="@id"
          onRow={onRowClick}
        ></Table>
      )}
    </TableHeightWrapper>
  );
};

export default SearchContainer;
