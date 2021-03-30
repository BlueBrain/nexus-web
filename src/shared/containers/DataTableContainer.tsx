import { useNexusContext } from '@bbp/react-nexus';
import { Resource, View, SparqlView } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Table, Button, Input, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import '../styles/data-table.less';
import { useSparQLQuery } from '../hooks/useSparQLQuery';
import { response } from 'express';

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

const useEsQuery = () => {
  return {};
};

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
  const nexus = useNexusContext();

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
            onSearch={() => {}}
            style={{ width: '100%' }}
          ></Input.Search>
          <Button onClick={editTableHandler} type="primary">
            Download CSV
          </Button>
          <Button onClick={editTableHandler} type="primary">
            Add from DataCart
          </Button>
          <Button onClick={editTableHandler} type="primary">
            Add to DataCart
          </Button>
        </Space>
      </div>
    );
  };

  const data = useSparQLQuery(nexus, orgLabel, projectLabel, tableResourceId);

  return (
    <>
      {data ? (
        <Table
          title={renderTitle}
          columns={data.headerProperties}
          dataSource={data.items}
        />
      ) : null}
    </>
  );
};

export default DataTableContainer;
