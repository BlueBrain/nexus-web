import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Pagination, Table, Button, Checkbox, Result } from 'antd';
import { useSelector } from 'react-redux';
import { CloseCircleOutlined } from '@ant-design/icons';
import { difference, differenceBy, has, union, uniq, uniqBy } from 'lodash';
import { clsx } from 'clsx';
import { TableRowSelection } from 'antd/lib/table/interface';
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
import {
  MAX_DATA_SELECTED_SIZE__IN_BYTES,
  MAX_LOCAL_STORAGE_ALLOWED_SIZE,
  TDataSource,
  TResourceTableData,
  getLocalStorageSize,
  notifyTotalSizeExeeced,
} from '../../../shared/molecules/MyDataTable/MyDataTable';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
  DataPanelEvent,
} from '../../../shared/organisms/DataPanel/DataPanel';
import { RootState } from '../../../shared/store/reducers';
import './SearchContainer.less';

type TRecord = {
  key: string;
  description: string;
  name: string;
  '@id': string;
  '@type': string;
  createdAt: string;
  updatedAt: string;
  _self: string;
  project: {
    identifier: string;
    label: string;
  };
  [key: string]: any;
};

const SearchContainer: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const filterMenuRef = React.useRef<HTMLDivElement>(null);
  const searchToolsMenuRef = React.useRef<HTMLDivElement>(null);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any>([]);
  const { currentResourceView } = useSelector(
    (state: RootState) => state.uiSettings
  );
  const [queryParams] = useQueryString();
  const { query, layout } = queryParams;
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
  const onPageSizeOptionsChanged = (
    sortedPageSizeOptionsWithoutPotentialDupes: string[],
    pagination: SearchPagination
  ) => {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        pageSizeOptions: sortedPageSizeOptionsWithoutPotentialDupes,
        pageSize: pagination.pageSizeFixed
          ? prevPagination.pageSize
          : prevPagination.numRowsFitOnPage,
      };
    });
  };
  const paginationWithRowSelection = (
    page: number,
    pageSize?: number | undefined
  ) => {
    handlePaginationChange(page, pageSize);
  };
  const onTableHeightChanged = (numRows: number, lastPageOfResults: number) => {
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
  };
  const onSortOptionsChanged = () => {
    setPagination((prevPagination: SearchPagination) => {
      return {
        ...prevPagination,
        currentPage: 1,
      };
    });
  };

  const clearAllCustomisation = () => {
    handlePaginationChange(1);
    resetAll();
  };
  const handleSelect = (record: TRecord, selected: any) => {
    const newRecord: TDataSource = {
      source: layout,
      key: record._self,
      _self: record._self,
      id: record['@id'],
      createdAt: record.createdAt,
      description: record.description,
      name: record.name ?? record['@id'] ?? record._self,
      project: record.project.identifier,
      updatedAt: record.updatedAt,
      type: record['@type'],
      distribution: has(record, 'distribution')
        ? {
            ...record.distribution,
            hasDistribution: has(record, 'distribution'),
          }
        : record['@type'] === 'File'
        ? {
            contentSize: record._bytes,
            encodingFormat: record._mediaType,
            label: record._filename,
            hasDistribution: has(record, 'distribution'),
          }
        : {
            contentSize: 0,
            encodingFormat: '',
            label: '',
            hasDistribution: false,
          },
    };
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    if (selected) {
      selectedRowKeys = uniq([...selectedRowKeys, newRecord.key]);
      selectedRows = uniqBy([...selectedRows, newRecord], 'key');
    } else {
      selectedRowKeys = selectedRowKeys.filter(t => t !== newRecord.key);
      selectedRows = selectedRows.filter(t => t.key !== newRecord.key);
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }
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
  };
  const onSelectAllChange = (
    selected: boolean,
    tSelectedRows: TRecord[],
    changeRows: TRecord[]
  ) => {
    const changeRowsFormatted = changeRows.map(record => ({
      source: layout,
      _self: record._self,
      id: record['@id'],
      key: record._self,
      createdAt: record.createdAt,
      description: record.description,
      name: record.name ?? record['@id'] ?? record._self,
      project: record.project.identifier,
      updatedAt: record.updatedAt,
      type: record['@type'],
      distribution: has(record, 'distribution')
        ? {
            ...record.distribution,
            hasDistribution: has(record, 'distribution'),
          }
        : record['@type'] === 'File'
        ? {
            contentSize: record._bytes,
            encodingFormat: record._mediaType,
            label: record._filename,
            hasDistribution: has(record, 'distribution'),
          }
        : {
            contentSize: 0,
            encodingFormat: '',
            label: '',
            hasDistribution: false,
          },
    }));
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    if (selected) {
      selectedRows = union(
        selectedRows,
        changeRowsFormatted.map(t => ({ ...t, source: layout }))
      );
      selectedRowKeys = union(
        selectedRowKeys,
        changeRowsFormatted.map(t => t.key)
      );
    } else {
      selectedRows = differenceBy(selectedRows, changeRowsFormatted, 'key');
      selectedRowKeys = difference(
        selectedRowKeys,
        changeRowsFormatted.map(t => t.key)
      );
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }
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
  };
  const rowSelection: TableRowSelection<TRecord> = {
    selectedRowKeys,
    onSelectAll: onSelectAllChange,
    columnWidth: 70,
    renderCell: (checked: any, record: any, index: number) => {
      const rowIndex =
        (pagination.currentPage - 1) * pagination.pageSize + index + 1;
      return (
        <div
          className="row-selection-checkbox"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect(record, !checked);
          }}
        >
          <Checkbox className="row-select" checked={checked} />
          <span className="row-index">{rowIndex}</span>
        </div>
      );
    },
  };

  useAdjustTableHeight(
    pagination,
    onTableHeightChanged,
    onPageSizeOptionsChanged
  );

  const onQuerySuccess = (queryResponse: any) => {
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
  };

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
  } = useGlobalSearchData({
    query,
    onSortOptionsChanged,
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    queryLayout: layout,
    onSuccess: onQuerySuccess,
  });
  React.useEffect(() => {
    const dataLs = localStorage.getItem(DATA_PANEL_STORAGE);
    const dataLsObject: TResourceTableData = JSON.parse(dataLs as string);
    if (dataLs && dataLs.length) {
      const selectedRows = dataLsObject.selectedRows.map(o => o.key);
      setSelectedRowKeys(selectedRows);
    }
  }, [layout, pagination]);

  React.useEffect(() => {
    const dataPanelEventListner = (
      event: DataPanelEvent<{ datapanel: TResourceTableData }>
    ) => {
      setSelectedRowKeys(
        event.detail?.datapanel.selectedRows.map(item => item.key)
      );
    };
    window.addEventListener(
      DATA_PANEL_STORAGE_EVENT,
      dataPanelEventListner as EventListener
    );
    return () => {
      window.removeEventListener(
        DATA_PANEL_STORAGE_EVENT,
        dataPanelEventListner as EventListener
      );
    };
  }, [layout]);

  if (searchError) {
    return (
      <Result status="500" title="500" subTitle="Sorry, something went wrong.">
        {searchError.message}
        {searchError.name}
        {searchError.stack}
      </Result>
    );
  }
  if (visibleColumns && data) {
    return (
      <React.Fragment>
        <div className="search-tools-menu" ref={searchToolsMenuRef}>
          {config?.layouts && (
            <SearchByPresetsCompact
              layouts={config?.layouts}
              selectedLayout={selectedSearchLayout}
              onChangeLayout={layoutName => {
                handleChangeSearchLayout(layoutName);
                setPagination(state => ({
                  ...state,
                  currentPage: 1,
                }));
              }}
            />
          )}
          <div className="search-table-header" ref={filterMenuRef}>
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
                onRemoveSort={sortToRemove => removeSortOption(sortToRemove)}
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
              showLessItems
              showSizeChanger
              disabled={pagination.totalNumberOfResults === 0}
              showTotal={renderShowTotal}
              onShowSizeChange={onPageSizeOptionChanged}
              total={pagination.totalNumberOfResults}
              pageSize={pagination.pageSize}
              current={pagination.currentPage}
              onChange={paginationWithRowSelection}
              locale={{ items_per_page: '' }}
              pageSizeOptions={pagination.pageSizeOptions}
              className="search-table-header__paginator"
            />
          </div>
        </div>
        <div className="search-table">
          <Table
            sticky={{
              offsetHeader: 50,
              getContainer: () => window,
            }}
            className="result-table"
            loading={isLoading}
            rowSelection={rowSelection}
            rowClassName={record =>
              clsx(
                'search-table-row',
                record._self === currentResourceView?._self &&
                  'ant-table-row-selected'
              )
            }
            rowKey="key"
            columns={visibleColumns}
            dataSource={data}
            pagination={false}
            onRow={onRowClick}
            scroll={{ x: true }}
          />
        </div>
      </React.Fragment>
    );
  }
  return null;
};

export default SearchContainer;
