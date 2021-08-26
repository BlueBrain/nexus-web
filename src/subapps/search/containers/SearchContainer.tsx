import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import TableHeightWrapper from '../components/TableHeightWrapper';
import { Pagination, Table, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import useGlobalSearchData from '../hooks/useGlobalSearch';
import useQueryString from '../../../shared/hooks/useQueryString';
import useSearchPagination, {
  useAdjustTableHeight,
  SearchPagination,
  ESMaxResultWindowSize,
} from '../hooks/useSearchPagination';
import ColumnsVisibilityConfig from '../components/ColumnsVisibilityConfig';
import './SearchContainer.less';
import useColumnsToFitPage from '../hooks/useColumnsToFitPage';
import FiltersConfig from '../components/FiltersConfig';
import SortConfig from '../components/SortConfig';

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
    renderShowTotal,
    onPageSizeOptionChanged,
  } = useSearchPagination();

  function onPageSizeOptionsChanged(
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

  function onTableHeightChanged(numRows: number, lastPageOfResults: number) {
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

  function onSortOptionsChanged() {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        currentPage: 1,
      };
    });
  }

  const {
    wrapperHeightRef,
    resultTableHeightTestRef,
    wrapperDOMProps,
  } = useAdjustTableHeight(
    pagination,
    onTableHeightChanged,
    onPageSizeOptionsChanged
  );

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

  const {
    columns,
    data,
    updateFieldsVisibility,
    updateAllColumnsToVisible,
    fieldsVisibility,
    setFieldsVisibility,
    visibleFieldsFromStorage,
    visibleColumns,
    filterState,
    dispatchFilter,
    sortState,
    removeSortOption,
    changeSortOption,
    resetColumns,
  } = useGlobalSearchData(
    query,
    pagination.currentPage,
    pagination.pageSize,
    onQuerySuccess,
    onSortOptionsChanged,
    nexus
  );

  function onUpdateColumnVisibilityFromPageSize(columnCount: number) {
    const columnVisibilities = columns?.map((el, ix) => {
      return {
        name: el.label,
        key: el.key,
        visible: ix < columnCount,
      };
    });

    columnVisibilities && setFieldsVisibility(columnVisibilities);
  }

  const clearAllFilters = () => {
    filterState.forEach(filter => {
      dispatchFilter({ type: 'remove', payload: filter });
    });
  };

  const clearAllCustomisation = () => {
    clearAllFilters();
    handlePaginationChange(1);
    resetColumns();
  };

  const { tableRef } = useColumnsToFitPage(
    wrapperDOMProps,
    columnCount =>
      !visibleFieldsFromStorage &&
      onUpdateColumnVisibilityFromPageSize(columnCount)
  );

  return (
    <TableHeightWrapper
      wrapperHeightRef={wrapperHeightRef}
      resultTableHeightTestRef={resultTableHeightTestRef}
      wrapperDOMProps={wrapperDOMProps}
    >
      {visibleColumns && data && (
        <>
          <div className="search-table-header">
            <div className="search-table-header__options">
              {
                <>
                  <ColumnsVisibilityConfig
                    columns={fieldsVisibility}
                    onSetAllColumnVisibile={updateAllColumnsToVisible}
                    onSetColumnVisibility={updateFieldsVisibility}
                  />
                  <FiltersConfig
                    filters={filterState}
                    columns={columns}
                    onRemoveFilter={filter =>
                      dispatchFilter({ type: 'remove', payload: filter })
                    }
                  />
                  <SortConfig
                    sortedFields={sortState}
                    onRemoveSort={sortToRemove =>
                      removeSortOption(sortToRemove)
                    }
                    onChangeSortDirection={sortToChange =>
                      changeSortOption(sortToChange)
                    }
                  />
                  <Button type="link" onClick={() => clearAllCustomisation()}>
                    <CloseCircleOutlined />
                    Reset
                  </Button>
                </>
              }
            </div>
            <Pagination
              showTotal={renderShowTotal}
              onShowSizeChange={onPageSizeOptionChanged}
              total={pagination.totalNumberOfResults}
              pageSize={pagination.pageSize}
              current={pagination.currentPage}
              onChange={handlePaginationChange}
              locale={{ items_per_page: '' }}
              showSizeChanger={true}
              pageSizeOptions={pagination.pageSizeOptions}
              showLessItems={true}
              className="search-table-header__paginator"
            />
          </div>
          <div ref={tableRef}>
            <Table
              rowKey="key"
              columns={visibleColumns}
              dataSource={data}
              pagination={false}
              onRow={onRowClick}
            />
          </div>
        </>
      )}
    </TableHeightWrapper>
  );
};

export default SearchContainer;
