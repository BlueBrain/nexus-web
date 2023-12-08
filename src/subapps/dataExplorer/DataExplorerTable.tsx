import './styles.scss';

import { Resource } from '@bbp/nexus-sdk/es';
import { Empty, Table, Tooltip } from 'antd';
import { ColumnType, TablePaginationConfig } from 'antd/lib/table';
import { SelectionSelectFn } from 'antd/lib/table/interface';
import { clsx } from 'clsx';
import { isArray, isNil, isString, startCase } from 'lodash';
import React, { forwardRef, useEffect, useReducer } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  getLocalStorageSize,
  makeOrgProjectTuple,
  MAX_DATA_SELECTED_SIZE__IN_BYTES,
  MAX_LOCAL_STORAGE_ALLOWED_SIZE,
  notifyTotalSizeExeeced,
  TDataSource,
  TResourceTableData,
} from '../../shared/molecules/MyDataTable/MyDataTable';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
  DataPanelEvent,
} from '../../shared/organisms/DataPanel/DataPanel';
import { makeResourceUri, parseProjectUrl } from '../../shared/utils';
import { removeLocalStorageRows, toLocalStorageResources } from '../../shared/utils/datapanel';
import isValidUrl from '../../utils/validUrl';
import { DataExplorerConfiguration, updateSelectedFiltersCached } from './DataExplorer';
import { FUSION_TITLEBAR_HEIGHT } from './DataExplorerCollapsibleHeader';
import { NoDataCell } from './NoDataCell';

interface TDataExplorerTable {
  isLoading: boolean;
  dataSource: Resource[];
  total?: number;
  pageSize: number;
  offset: number;
  updateTableConfiguration: React.Dispatch<Partial<DataExplorerConfiguration>>;
  columns: string[];
  showEmptyDataCells: boolean;
  tableOffsetFromTop: number;
  typeFilterFocused: boolean;
}

type TDateExplorerTableData = {
  selectedRowKeys: React.Key[];
  selectedRows: TDataSource[];
};

type TColumnNameToConfig = Map<string, ColumnType<Resource>>;
const DATA_EXPLORER_NAMESPACE = 'data-explorer';
export const DataExplorerTable = forwardRef<HTMLDivElement, TDataExplorerTable>(
  (
    {
      isLoading,
      dataSource,
      columns,
      total,
      pageSize,
      offset,
      updateTableConfiguration,
      showEmptyDataCells,
      tableOffsetFromTop,
      typeFilterFocused,
    },
    ref
  ) => {
    const history = useHistory();
    const location = useLocation();
    const [{ selectedRowKeys }, updateTableData] = useReducer(
      (previous: TResourceTableData, partialData: Partial<TResourceTableData>) => ({
        ...previous,
        ...partialData,
      }),
      {
        selectedRowKeys: [],
        selectedRows: [],
      }
    );
    const allowedTotal = total ? (total > 10000 ? 10000 : total) : undefined;
    const tablePaginationConfig: TablePaginationConfig = {
      pageSize,
      total: allowedTotal,
      pageSizeOptions: [10, 20, 50],
      position: ['bottomLeft'],
      defaultPageSize: 50,
      defaultCurrent: 0,
      current: offset / pageSize + 1,
      onChange: (page, _) => {
        updateTableConfiguration({ offset: (page - 1) * pageSize });
        updateSelectedFiltersCached({ offset: (page - 1) * pageSize });
      },
      onShowSizeChange: (_, size) => {
        updateTableConfiguration({ pageSize: size, offset: 0 });
        updateSelectedFiltersCached({ pageSize: size, offset: 0 });
      },
      showQuickJumper: true,
      showSizeChanger: true,
    };

    const goToResource = (resource: Resource) => {
      const resourceId = resource['@id'] ?? resource._self;
      const [orgLabel, projectLabel] = parseProjectUrl(resource._project);

      history.push(makeResourceUri(orgLabel, projectLabel, resourceId), {
        background: location,
      });
    };
    const onSelectRowChange: SelectionSelectFn<Resource> = async (record, selected) => {
      const recordKey = record._self;
      const dataPanelLS: TDateExplorerTableData = JSON.parse(
        localStorage.getItem(DATA_PANEL_STORAGE)!
      );

      const localStorageRows = toLocalStorageResources(record, DATA_EXPLORER_NAMESPACE);
      let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
      let selectedRows = dataPanelLS?.selectedRows || [];

      if (selected) {
        selectedRowKeys = [...selectedRowKeys, recordKey];
        selectedRows = [...selectedRows, ...localStorageRows];
      } else {
        selectedRowKeys = selectedRowKeys.filter((t) => t !== recordKey);
        selectedRows = removeLocalStorageRows(selectedRows, [recordKey]);
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
    const onSelectAllChange = async (
      selected: boolean,
      tSelectedRows: Resource[],
      changeRows: Resource[]
    ) => {
      const dataPanelLS: TDateExplorerTableData = JSON.parse(
        localStorage.getItem(DATA_PANEL_STORAGE)!
      );
      let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
      let selectedRows = dataPanelLS?.selectedRows || [];

      if (selected) {
        const results = changeRows.map((row) =>
          toLocalStorageResources(row, DATA_EXPLORER_NAMESPACE)
        );
        selectedRows = [...selectedRows, ...results.flat()];
        selectedRowKeys = [...selectedRowKeys, ...changeRows.map((t) => t._self)];
      } else {
        const rowKeysToRemove = changeRows.map((r) => r._self);

        selectedRowKeys = selectedRowKeys.filter(
          (key) => !rowKeysToRemove.includes(key.toString())
        );
        selectedRows = removeLocalStorageRows(selectedRows, rowKeysToRemove);
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

    useEffect(() => {
      const dataLs = localStorage.getItem(DATA_PANEL_STORAGE);
      const dataLsObject: TResourceTableData = JSON.parse(dataLs as string);
      if (dataLs && dataLs.length) {
        updateTableData({
          selectedRows: dataLsObject.selectedRows,
          selectedRowKeys: dataLsObject.selectedRowKeys,
        });
      }
    }, []);
    useEffect(() => {
      const dataPanelEventListner = (event: DataPanelEvent<{ datapanel: TResourceTableData }>) => {
        updateTableData({
          selectedRows: event.detail?.datapanel.selectedRows,
          selectedRowKeys: event.detail?.datapanel.selectedRowKeys,
        });
      };
      window.addEventListener(DATA_PANEL_STORAGE_EVENT, dataPanelEventListner as EventListener);
      return () => {
        window.removeEventListener(
          DATA_PANEL_STORAGE_EVENT,
          dataPanelEventListner as EventListener
        );
      };
    }, []);
    const tableColumns = columnsConfig(columns, showEmptyDataCells, dataSource);
    return (
      <div
        style={{
          display: 'block',
          position: 'absolute',
          top: tableOffsetFromTop,
          left: 0,
          padding: '0 52px',
          background: '#f5f5f5',
          height: 'fit-content',
          minHeight: '100%',
        }}
      >
        <Table<Resource>
          ref={ref}
          columns={tableColumns}
          dataSource={dataSource}
          rowKey={(record) => record._self}
          onRow={(resource) => ({
            onClick: (_) => goToResource(resource),
            'data-testid': resource._self,
          })}
          loading={{ spinning: isLoading, indicator: <></> }}
          bordered={false}
          className={clsx(
            'data-explorer-table',
            tableOffsetFromTop === FUSION_TITLEBAR_HEIGHT && 'data-explorer-header-collapsed',
            typeFilterFocused && 'data-explorer-not-sticky'
          )}
          rowClassName="data-explorer-row"
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText() {
              return isLoading ? <></> : <Empty />;
            },
          }}
          rowSelection={{
            selectedRowKeys,
            onSelect: onSelectRowChange,
            onSelectAll: onSelectAllChange,
          }}
          pagination={tablePaginationConfig}
          sticky={{ offsetHeader: tableOffsetFromTop }}
        />
      </div>
    );
  }
);

/**
 * For each resource in the resources array, it creates column configuration for all its keys (if the column config for that key does not already exist).
 */
export const columnsConfig = (
  columnNames: string[],
  showEmptyDataCells: boolean,
  dataSource: Resource[]
): ColumnType<Resource>[] => {
  const colNameToConfig = new Map(
    dataSource.length === 0 ? [] : initialTableConfig(showEmptyDataCells)
  );

  for (const columnName of columnNames) {
    if (!colNameToConfig.has(columnName)) {
      colNameToConfig.set(columnName, {
        ...defaultColumnConfig(columnName, showEmptyDataCells),
      });
    }
  }

  return Array.from(colNameToConfig.values());
};

export const getColumnTitle = (colName: string) => startCase(colName);

const defaultColumnConfig = (
  colName: string,
  showEmptyDataCells: boolean
): ColumnType<Resource> => {
  return {
    key: colName,
    title: getColumnTitle(colName),
    dataIndex: colName,
    className: `data-explorer-column data-explorer-column-${colName}`,
    sorter: (a, b) => {
      return JSON.stringify(a[colName] ?? '').localeCompare(JSON.stringify(b[colName] ?? ''));
    },
    render: (text) => {
      if (text === undefined && showEmptyDataCells) {
        // Text will also be undefined if a certain resource does not have `colName` as its property
        return <NoDataCell />;
      }
      return <>{JSON.stringify(text)}</>;
    },
  };
};

const initialTableConfig = (showEmptyDataCells: boolean) => {
  const colNameToConfig: TColumnNameToConfig = new Map();
  const projectKey = '_project';
  const typeKey = '@type';

  const projectConfig: ColumnType<Resource> = {
    ...defaultColumnConfig(projectKey, showEmptyDataCells),
    title: '_project',
    render: (text) => {
      if (text) {
        const { org, project } = makeOrgProjectTuple(text);
        return `${org}/${project}`;
      }
      return showEmptyDataCells && <NoDataCell />;
    },
    sorter: (a, b) => {
      const tupleA = makeOrgProjectTuple(a[projectKey] ?? '');
      const tupleB = makeOrgProjectTuple(b[projectKey] ?? '');

      return (tupleA.project ?? '').localeCompare(tupleB.project);
    },
  };
  const typeConfig: ColumnType<Resource> = {
    ...defaultColumnConfig(typeKey, showEmptyDataCells),
    title: '@type',
    render: (text) => {
      let types = '';
      if (isArray(text)) {
        types = text.map((item) => (isValidUrl(item) ? item.split('/').pop() : item)).join('\n');
      } else if (isString(text) && isValidUrl(text)) {
        types = text.split('/').pop() ?? '';
      } else {
        types = text;
      }
      return types ? (
        <Tooltip title={() => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{types}</div>
        </Tooltip>
      ) : (
        showEmptyDataCells && <NoDataCell />
      );
    },
  };

  colNameToConfig.set(projectKey, projectConfig);
  colNameToConfig.set(typeKey, typeConfig);

  return colNameToConfig;
};
