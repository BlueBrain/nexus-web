import { Resource } from '@bbp/nexus-sdk';
import { Empty, Table, Tooltip } from 'antd';
import { ColumnType, TablePaginationConfig } from 'antd/lib/table';
import { isArray, isString, startCase } from 'lodash';
import React, { forwardRef } from 'react';
import { makeOrgProjectTuple } from '../../shared/molecules/MyDataTable/MyDataTable';
import isValidUrl from '../../utils/validUrl';
import { NoDataCell } from './NoDataCell';
import './styles.less';
import { DataExplorerConfiguration } from './DataExplorer';
import { useHistory, useLocation } from 'react-router-dom';
import { makeResourceUri, parseProjectUrl } from '../../shared/utils';
import { clsx } from 'clsx';
import { FUSION_TITLEBAR_HEIGHT } from './DataExplorerCollapsibleHeader';

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
}

type TColumnNameToConfig = Map<string, ColumnType<Resource>>;

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
    },
    ref
  ) => {
    const history = useHistory();
    const location = useLocation();

    const allowedTotal = total ? (total > 10000 ? 10000 : total) : undefined;

    const tablePaginationConfig: TablePaginationConfig = {
      pageSize,
      total: allowedTotal,
      pageSizeOptions: [10, 20, 50],
      position: ['bottomLeft'],
      defaultPageSize: 50,
      defaultCurrent: 0,
      current: offset / pageSize + 1,
      onChange: (page, _) =>
        updateTableConfiguration({ offset: (page - 1) * pageSize }),
      onShowSizeChange: (_, size) => {
        updateTableConfiguration({ pageSize: size, offset: 0 });
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
          columns={columnsConfig(columns, showEmptyDataCells)}
          dataSource={dataSource}
          rowKey={record => record._self}
          onRow={resource => ({
            onClick: _ => goToResource(resource),
            'data-testid': resource._self,
          })}
          loading={{ spinning: isLoading, indicator: <></> }}
          bordered={false}
          ref={ref}
          className={clsx(
            'data-explorer-table',
            tableOffsetFromTop === FUSION_TITLEBAR_HEIGHT &&
              'data-explorer-header-collapsed'
          )}
          rowClassName="data-explorer-row"
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText() {
              return isLoading ? <></> : <Empty />;
            },
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
  showEmptyDataCells: boolean
): ColumnType<Resource>[] => {
  const colNameToConfig = new Map(
    columnNames.length === 0 ? [] : initialTableConfig(showEmptyDataCells)
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

export const getColumnTitle = (colName: string) =>
  startCase(colName).toUpperCase();

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
      return JSON.stringify(a[colName] ?? '').localeCompare(
        JSON.stringify(b[colName] ?? '')
      );
    },
    render: text => {
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
    title: 'PROJECT',
    render: text => {
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
    title: 'TYPE',
    render: text => {
      let types = '';
      if (isArray(text)) {
        types = text
          .map(item => (isValidUrl(item) ? item.split('/').pop() : item))
          .join('\n');
      } else if (isString(text) && isValidUrl(text)) {
        types = text.split('/').pop() ?? '';
      } else {
        types = text;
      }
      return types ? (
        <Tooltip
          title={() => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>}
        >
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
