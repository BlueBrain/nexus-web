import { useNexusContext } from '@bbp/react-nexus';
import { Resource, View, SparqlView } from '@bbp/nexus-sdk';
import { useHistory, useLocation } from 'react-router-dom';
import * as React from 'react';
import {
  Tag,
  Table,
  Button,
  Input,
  Space,
  Spin,
  Modal,
  notification,
} from 'antd';
import '../styles/data-table.less';
import { useAccessDataForTable } from '../hooks/useAccessDataForTable';
import EditTableForm, { TableComponent } from '../components/EditTableForm';
import { useMutation } from 'react-query';
import { parseProjectUrl } from '../utils';

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
  const history = useHistory();
  const location = useLocation();

  const goToStudioResource = (selfUrl: string) => {
    nexus
      .httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        history.push(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`,
          { background: location }
        );
      })
      .catch(error => {
        notification.error({ message: `Resource ${self} could not be found` });
      });
  };

  const updateTable = async (data: TableComponent) => {
    const latest = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id'])
    )) as Resource;
    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id']),
      latest._rev,
      { ...latest, ...data }
    );
  };

  const changeTableResource = useMutation(updateTable, {
    onMutate: (data: TableResource) => {},
    onSuccess: data => {
      setShowEditForm(false);
    },
    onError: error => {
      notification.error({
        message: 'Failed to save table data',
      });
    },
  });

  const tableData = useAccessDataForTable(
    orgLabel,
    projectLabel,
    tableResourceId,
    changeTableResource.data
  );

  const renderTitle = () => {
    const tableResource = tableData.tableResult.data
      ?.tableResource as TableComponent;

    return (
      <div className="data-table-controls">
        <Space align="center" direction="horizontal" size="large">
          {tableResource.name}{' '}
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
      {tableData.tableResult.isError ? (
        tableData.tableResult.error.message
      ) : tableData.tableResult.isSuccess ? (
        <>
          <Table
            bordered
            rowClassName={'data-table-row'}
            title={renderTitle}
            columns={tableData.dataResult.data?.headerProperties}
            dataSource={tableData.dataResult.data?.items}
            scroll={{ x: 1000 }}
            onRow={data => ({
              onClick: event => {
                event.preventDefault();
                const self = data._self || data.self.value;
                goToStudioResource(self);
              },
            })}
            pagination={{
              pageSize:
                tableData.tableResult.data.tableResource['resultsPerPage'],
              responsive: true,
              showLessItems: true,
            }}
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
            {tableData.tableResult.isSuccess ? (
              <EditTableForm
                onSave={changeTableResource.mutate}
                onClose={() => setShowEditForm(false)}
                table={tableData.tableResult.data.tableResource}
                busy={changeTableResource.isLoading}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
              />
            ) : null}
          </Modal>
        </>
      ) : (
        <Spin></Spin>
      )}
    </div>
  );
};

export default DataTableContainer;
