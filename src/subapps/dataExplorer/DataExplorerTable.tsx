import { Resource } from '@bbp/nexus-sdk';
import { Empty, Table, Tooltip } from 'antd';
import { ColumnType, TablePaginationConfig } from 'antd/lib/table';
import { isArray, isString, startCase } from 'lodash';
import React from 'react';
import { makeOrgProjectTuple } from '../../shared/molecules/MyDataTable/MyDataTable';
import isValidUrl from '../../utils/validUrl';
import { NoDataCell } from './NoDataCell';
import './styles.less';
import { DataExplorerConfiguration } from './DataExplorer';

interface TDataExplorerTable {
  isLoading: boolean;
  dataSource: Resource[];
  total?: number;
  pageSize: number;
  offset: number;
  updateTableConfiguration: React.Dispatch<Partial<DataExplorerConfiguration>>;
}

type TColumnNameToConfig = Map<string, ColumnType<Resource>>;

export const DataExplorerTable: React.FC<TDataExplorerTable> = ({
  isLoading,
  dataSource,
  total,
  pageSize,
  offset,
  updateTableConfiguration,
}: TDataExplorerTable) => {
  const allowedTotal = total ? (total > 10000 ? 10000 : total) : undefined;

  const tablePaginationConfig: TablePaginationConfig = {
    pageSize,
    total: allowedTotal,
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

  return (
    <>
      <Table<Resource>
        columns={dynamicColumnsForDataSource(dataSource)}
        dataSource={dataSource}
        rowKey={record => record._self}
        loading={isLoading}
        bordered={false}
        className="data-explorer-table"
        rowClassName="data-explorer-row"
        scroll={{ x: 'max-content', y: '100vh' }}
        locale={{
          emptyText() {
            return isLoading ? <></> : <Empty />;
          },
        }}
        pagination={tablePaginationConfig}
      />
    </>
  );
};

/**
 * For each resource in the resources array, it creates column configuration for all its keys (if the column config for that key does not already exist).
 */
const dynamicColumnsForDataSource = (
  resources: Resource[]
): ColumnType<Resource>[] => {
  const colNameToConfig = new Map(initialTableConfig());

  resources.forEach(resource => {
    const newResourceKeys = Object.keys(resource).filter(
      key => !colNameToConfig.has(key)
    );

    newResourceKeys.forEach(key => {
      colNameToConfig.set(key, { ...defaultColumnConfig(key) });
    });
  });

  return Array.from(colNameToConfig.values());
};

export const getColumnTitle = (colName: string) =>
  startCase(colName).toUpperCase();

const defaultColumnConfig = (colName: string): ColumnType<Resource> => {
  return {
    key: colName,
    title: getColumnTitle(colName),
    dataIndex: colName,
    className: `data-explorer-column data-explorer-column-${colName}`,
    sorter: false,
    render: text => {
      if (text === undefined || text === null) {
        return <NoDataCell />;
      }
      return <>{JSON.stringify(text)}</>;
    },
  };
};

const initialTableConfig = () => {
  const colNameToConfig: TColumnNameToConfig = new Map();
  const projectKey = '_project';
  const typeKey = '@type';

  const projectConfig: ColumnType<Resource> = {
    ...defaultColumnConfig(projectKey),
    title: 'PROJECT',
    render: text => {
      if (text) {
        const { org, project } = makeOrgProjectTuple(text);
        return `${org}/${project}`;
      }
      return <NoDataCell />;
    },
  };
  const typeConfig: ColumnType<Resource> = {
    ...defaultColumnConfig(typeKey),
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
        <NoDataCell />
      );
    },
  };

  colNameToConfig.set(projectKey, projectConfig);
  colNameToConfig.set(typeKey, typeConfig);

  return colNameToConfig;
};
