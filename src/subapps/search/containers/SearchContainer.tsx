import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Pagination, Table, Button, Checkbox, Result } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import useGlobalSearchData from '../hooks/useGlobalSearch';
import { SearchByPresetsCompact } from '../../../shared/organisms/SearchByPresets/SearchByPresets';
import useQueryString from '../../../shared/hooks/useQueryString';
import useSearchPagination, {
  useAdjustTableHeight,
  SearchPagination,
  ESMaxResultWindowSize,
} from '../hooks/useSearchPagination';
import ColumnsVisibilityConfig from '../components/ColumnsVisibilityConfig';
import FiltersConfig from '../components/FiltersConfig';
import SortConfigContainer from './SortConfigContainer';
import './SearchContainer.less';
import {
  TDataSource,
  TResourceTableData,
} from '../../../shared/molecules/MyDataTable/MyDataTable';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
} from '../../../shared/organisms/DataPanel/DataPanel';
import { uniq, uniqBy } from 'lodash';

type TRecord = {
  key: string;
  description: string;
  name: string;
  '@id': string;
  '@type': string;
  createdAt: string;
  updatedAt: string;
  _self: string[];
  project: {
    identifier: string;
    label: string;
  };
  [key: string]: any;
};

const SearchContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams] = useQueryString();
  const { query, layout } = queryParams;
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

  const paginationWithRowSelection = (
    page: number,
    pageSize?: number | undefined
  ) => {
    setSelectedRowKeys([]);
    handlePaginationChange(page, pageSize);
  };

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
    layout,
    onQuerySuccess,
    onSortOptionsChanged,
    nexus,
    setSelectedRowKeys
  );

  const clearAllCustomisation = () => {
    handlePaginationChange(1);
    resetAll();
  };

  const handleSelect = (record: TRecord, selected: any) => {
    const newRecord: TDataSource = {
      source: layout,
      key: record['@id'],
      createdAt: record.createdAt,
      description: record.description,
      name: record.name,
      project: record.project.identifier,
      updatedAt: record.updatedAt,
      type: record['@type'],
    };
    if (selected) {
      setSelectedRowKeys((keys: any) => [...keys, record.key]);
      const dataPanelLS: TResourceTableData = JSON.parse(
        localStorage.getItem(DATA_PANEL_STORAGE)!
      );
      let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
      let selectedRows = dataPanelLS?.selectedRows || [];
      selectedRowKeys = uniq([...selectedRowKeys, newRecord.key]);
      selectedRows = uniqBy([...selectedRows, newRecord], 'key');
      localStorage.setItem(
        DATA_PANEL_STORAGE,
        JSON.stringify({
          selectedRowKeys,
          selectedRows,
        })
      );
      window.dispatchEvent(
        new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
          detail: {
            datapanel: { selectedRowKeys, selectedRows },
          },
        })
      );
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
    columnWidth: 70,
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
          {/* {checked ? null : (
          )} */}
          <Checkbox className="row-select" checked={checked} />
          <span className="row-index">
            {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
          </span>
        </div>
      );
    },
  };

  return (
    <React.Fragment>
      {/* <Spin spinning={isLoading}> */}
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
        <div>
          {visibleColumns && data && (
            <>
              {config?.layouts && (
                <SearchByPresetsCompact
                  layouts={config?.layouts}
                  selectedLayout={selectedSearchLayout}
                  onChangeLayout={layoutName => {
                    handleChangeSearchLayout(layoutName);
                  }}
                />
              )}
              <div className="search-table-header">
                <div className="search-table-header__options">
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
                  <SortConfigContainer
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
                  onChange={paginationWithRowSelection}
                  locale={{ items_per_page: '' }}
                  showSizeChanger={true}
                  pageSizeOptions={pagination.pageSizeOptions}
                  showLessItems={true}
                  className="search-table-header__paginator"
                />
              </div>
              <div className="search-table">
                <Table
                  sticky
                  className="result-table"
                  loading={isLoading}
                  rowSelection={rowSelection}
                  rowClassName="search-table-row"
                  rowKey="key"
                  columns={visibleColumns}
                  dataSource={data}
                  pagination={false}
                  onRow={onRowClick}
                  scroll={{ x: true }}
                />
              </div>
            </>
          )}
        </div>
        // </TableHeightWrapper>
      )}
      {/* </Spin> */}
    </React.Fragment>
  );
};

export default SearchContainer;
