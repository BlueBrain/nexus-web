import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import TableHeightWrapper from '../components/TableHeightWrapper';
import { Spin, Pagination, Table, Button, Checkbox, Result } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import useGlobalSearchData, { FieldVisibility } from '../hooks/useGlobalSearch';
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
import SearchLayouts from '../components/Layouts';

const SearchContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams] = useQueryString();
  const { query } = queryParams;
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any>([]);

  const makeResourceUri = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(makeResourceUri(orgLabel, projectLabel, resourceId), {
      background: location,
    });
  };

  const onRowClick = (record: any): { onClick: () => void } => {
    return {
      onClick: () => {
        const [orgLabel, projectLabel] = record.project.label.split('/');
        const resourceId = encodeURIComponent(record['@id']);
        goToResource(orgLabel, projectLabel, resourceId);
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
    isLoading,
    searchError,
    columns,
    data,
    visibleColumns,
    filterState,
    dispatchFilter,
    sortState,
    removeSortOption,
    changeSortOption,
    resetAll,
    fieldsVisibilityState,
    dispatchFieldVisibility,
    config,
    handleChangeSearchLayout,
    selectedSearchLayout,
  } = useGlobalSearchData(
    query,
    pagination.currentPage,
    pagination.pageSize,
    onQuerySuccess,
    onSortOptionsChanged,
    nexus
  );

  function makeColumnsVisible(columnCount: number) {
    const columnVisibilities = columns?.map((el, ix) => {
      return {
        name: el.label,
        key: el.key,
        visible: ix < columnCount,
      };
    });
    dispatchFieldVisibility({
      type: 'initialize',
      payload: columnVisibilities as FieldVisibility[],
    });
  }

  const { tableRef, calculateNumberOfColumnsToFit } = useColumnsToFitPage(
    columnCount => {
      if (columns && !fieldsVisibilityState.isPersistent) {
        makeColumnsVisible(columnCount);
      }
    }
  );

  const clearAllCustomisation = () => {
    handlePaginationChange(1);
    resetAll();

    const numColumnsFit = calculateNumberOfColumnsToFit();
    makeColumnsVisible(numColumnsFit);
  };

  const handleSelect = (record: any, selected: any) => {
    if (selected) {
      console.log(record);
      setSelectedRowKeys((keys: any) => [...keys, record.key]);
    } else {
      setSelectedRowKeys((keys: any) => {
        const index = keys.indexOf(record.key);
        return [...keys.slice(0, index), ...keys.slice(index + 1)];
      });
    }
  };

  const toggleSelectAll = () => {
    setSelectedRowKeys((keys: any) =>
      keys.length === data.length ? [] : data.map((r: any) => r.key)
    );
  };

  const headerCheckbox = (
    <Checkbox
      checked={selectedRowKeys.length}
      indeterminate={
        selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
      }
      onChange={toggleSelectAll}
    />
  );

  const rowSelection = {
    selectedRowKeys,
    columnTitle: headerCheckbox,
    columnWidth: 50,
    renderCell: (checked: any, record: any, index: number, originNode: any) => {
      return (
        <div
          className="row-selection-checkbox"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect(record, !checked);
          }}
        >
          {checked ? null : <span className="row-index">{index + 1}</span>}
          <Checkbox className={checked ? '' : 'row-select'} checked={checked} />
        </div>
      );
    },
  };

  return (
    <Spin spinning={isLoading}>
      {searchError ? (
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
        >
          {searchError.message}
          {searchError.name}
          {searchError.stack}
        </Result>
      ) : (
        <TableHeightWrapper
          wrapperHeightRef={wrapperHeightRef}
          resultTableHeightTestRef={resultTableHeightTestRef}
          wrapperDOMProps={wrapperDOMProps}
        >
          {visibleColumns && data && (
            <>
              <div className="search-table-header">
                <div className="search-table-header__options">
                  {config?.layouts && (
                    <SearchLayouts
                      layouts={config?.layouts}
                      selectedLayout={selectedSearchLayout}
                      onChangeLayout={layoutName => {
                        handleChangeSearchLayout(layoutName);
                      }}
                    />
                  )}
                  <ColumnsVisibilityConfig
                    columnsVisibility={fieldsVisibilityState}
                    dispatchFieldVisibility={dispatchFieldVisibility}
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
                </div>
                <Pagination
                  disabled={pagination.totalNumberOfResults === 0}
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
              <div ref={tableRef} className="search-table">
                <Table
                  rowSelection={rowSelection}
                  tableLayout="fixed"
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
      )}
    </Spin>
  );
};

export default SearchContainer;
