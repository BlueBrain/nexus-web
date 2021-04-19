import { useNexusContext } from '@bbp/react-nexus';
import { Resource, View, SparqlView } from '@bbp/nexus-sdk';

import * as React from 'react';
import { Table, Button, Input, Space, Spin, Modal } from 'antd';
import '../styles/data-table.less';
import { useAccessDataForTable } from '../hooks/useAccessDataForTable';
import EditTableForm, { TableComponent } from '../components/EditTableForm';
import { useMutation } from 'react-query';

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
};

const DataTableContainer: React.FC<DataTableProps> = ({
  orgLabel,
  projectLabel,
  tableResourceId,
}) => {
  const [showEditForm, setShowEditForm] = React.useState<boolean>(false);
  const nexus = useNexusContext();

  const updateTable = (data: TableComponent) => {
    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id']),
      data._rev,
      data
    );
  };

  const changeTableResource = useMutation(updateTable, {
    onMutate: (data: TableResource) => {},
    onSuccess: data => {
      setShowEditForm(false);
    },
  });

  const tableData = useAccessDataForTable(
    orgLabel,
    projectLabel,
    tableResourceId,
    changeTableResource.data
  );

  const renderTitle = () => {
    const tableResource = tableData.result.data
      ?.tableResource as TableComponent;

    return (
      <div className="data-table-controls">
        <Space align="center" direction="horizontal" size="large">
          <Button
            onClick={() => {
              setShowEditForm(true);
            }}
            type="primary"
          >
            Edit Table
          </Button>
          {tableResource.enableSearch ? (
            <Input.Search
              placeholder="input search text"
              allowClear
              onSearch={value => {
                tableData.setSearchValue(value);
              }}
              style={{ width: '100%' }}
            ></Input.Search>
          ) : null}
          {tableResource.enableDownload ? (
            <Button onClick={tableData.downloadCSV} type="primary">
              Download CSV
            </Button>
          ) : null}
          {tableResource.enableSave ? (
            <Button onClick={tableData.addFromDataCart} type="primary">
              Add from DataCart
            </Button>
          ) : null}
          {tableResource.enableSave ? (
            <Button onClick={tableData.addToDataCart} type="primary">
              Add to DataCart
            </Button>
          ) : null}
        </Space>
      </div>
    );
  };

  return (
    <div>
      {tableData.result.isLoading ? (
        <Spin />
      ) : tableData.result.isSuccess ? (
        <>
          <Table
            bordered
            title={renderTitle}
            columns={tableData.result.data?.headerProperties}
            dataSource={tableData.result.data?.items}
            scroll={{ x: 1000 }}
            rowSelection={{
              type: 'checkbox',
              onChange: tableData.onSelect,
            }}
          />
          <Modal
            visible={showEditForm}
            footer={null}
            onCancel={() => setShowEditForm(false)}
            width={800}
            destroyOnClose={true}
          >
            <EditTableForm
              onSave={changeTableResource.mutate}
              onClose={() => setShowEditForm(false)}
              table={tableData.result.data.tableResource}
              busy={changeTableResource.isLoading}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
            />
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default DataTableContainer;
