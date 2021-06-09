import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { useHistory, useLocation } from 'react-router-dom';
import * as React from 'react';
import {
  Tag,
  Table,
  Col,
  Row,
  Button,
  Typography,
  Input,
  Space,
  Spin,
  Modal,
  Popover,
  notification,
} from 'antd';
import {
  DownloadOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  EditOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';

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

const { Title } = Typography;

const DataTableContainer: React.FC<DataTableProps> = ({
  orgLabel,
  projectLabel,
  tableResourceId,
}) => {
  const [showEditForm, setShowEditForm] = React.useState<boolean>(false);
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
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

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Table',
      content: 'Are you sure?',
      onOk: deprecateTableResource.mutate,
    });
  };

  const deprecateTable = async () => {
    const latest = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(tableResourceId)
    )) as Resource;
    const deprecated = nexus.Resource.deprecate(
      orgLabel,
      projectLabel,
      encodeURIComponent(tableResourceId),
      latest._rev
    );
    return deprecated;
  };
  const deprecateTableResource = useMutation(deprecateTable, {
    onMutate: (data: TableResource) => {},
    onSuccess: data => {
      notification.success({
        message: 'Table deprecated',
        duration: 2,
      });
    },
    onError: error => {
      console.log('error');
      console.log(error);
      notification.error({
        message: 'Failed to delete table',
        duration: 1,
      });
    },
  });

  const latestResource = async (data: TableComponent) => {
    return (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id'])
    )) as Resource;
  };
  const updateTable = async (data: TableComponent) => {
    const latest = await latestResource(data);
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
    const content = (
      <div className="wrapper">
        <div>
          <Button
            block
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setShowEditForm(true);
            }}
          >
            Edit Table
          </Button>
        </div>
        {tableResource.enableSave ? (
          <div>
            <Button
              block
              icon={<ShoppingCartOutlined />}
              type="default"
              onClick={tableData.addFromDataCart}
            >
              Add From Cart
            </Button>
          </div>
        ) : null}
        {tableResource.enableDownload ? (
          <div>
            <Button
              block
              icon={<DownloadOutlined />}
              type="default"
              onClick={tableData.downloadCSV}
            >
              Download CSV
            </Button>
          </div>
        ) : null}
        {tableResource.enableSave ? (
          <div>
            <Button
              block
              icon={<ShoppingCartOutlined />}
              type="default"
              onClick={tableData.addToDataCart}
            >
              Add To Cart
            </Button>
          </div>
        ) : null}
        <div>
          <Button block icon={<DeleteOutlined />} onClick={confirmDeprecate}>
            Delete
          </Button>
        </div>
      </div>
    );
    const options = (
      <Popover
        style={{ background: 'none' }}
        placement="rightTop"
        content={content}
        trigger="click"
      >
        <Button shape="round" type="default" icon={<SmallDashOutlined />} />
      </Popover>
    );
    const search = (
      <Input.Search
        placeholder="input search text"
        allowClear
        onSearch={value => {
          tableData.setSearchValue(value);
        }}
        style={{ width: '100%' }}
      ></Input.Search>
    );
    return (
      <div>
        <Title level={4} className="tableTitle">
          {tableResource.name}
        </Title>
        <Row gutter={[16, 16]}>
          <Col flex="none"></Col>
          <Col flex="auto">{tableResource.enableSearch ? search : null}</Col>
          <Col flex="none">{options}</Col>
        </Row>
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
