import { useNexusContext } from '@bbp/react-nexus';
import { Resource, View, SparqlView } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Table, Button, Input, Space, Spin } from 'antd';
import '../styles/data-table.less';
import { useAccessDataForTable } from '../hooks/useAccessDataForTable';

export type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};

export type TableResource = Resource<{
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;

type DataTableProps = {
  orgLabel: string;
  projectLabel: string;
  tableResourceId: string;
  editTableHandler: () => void;
};

const DataTableContainer: React.FC<DataTableProps> = ({
  orgLabel,
  projectLabel,
  tableResourceId,
  editTableHandler,
}) => {
  const query = useAccessDataForTable(orgLabel, projectLabel, tableResourceId);

  const renderTitle = () => {
    return (
      <div className="data-table-controls">
        <Space align="center" direction="horizontal" size="large">
          <Button onClick={editTableHandler} type="primary">
            Edit Table
          </Button>
          <Input.Search
            placeholder="input search text"
            allowClear
            onSearch={value => {
              query.setSearchValue(value);
            }}
            style={{ width: '100%' }}
          ></Input.Search>
          <Button onClick={query.downloadCSV} type="primary">
            Download CSV
          </Button>
          <Button onClick={query.addFromDataCart} type="primary">
            Add from DataCart
          </Button>
          <Button onClick={query.addToDataCart} type="primary">
            Add to DataCart
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <div>
      {query.result.isLoading ? (
        <Spin />
      ) : query.result.isSuccess ? (
        <Table
          title={renderTitle}
          columns={query.result.data?.headerProperties}
          dataSource={query.result.data?.items}
          rowSelection={{
            type: 'checkbox',
            onChange: query.onSelect,
          }}
        />
      ) : null}
    </div>
  );
};

export default DataTableContainer;
