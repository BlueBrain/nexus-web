import React from 'react';
import { Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './SettingsView.less';

type Props = {};
type DataType = {
  key: string;
  name: string;
  type: string;
  priority: number;
};

const viewsSample: DataType[] = [
  {
    key: 'nxv:defaultElasticSearchView',
    name: 'defaultElasticSearchView',
    type: 'ElasticSearch',
    priority: 1,
  },
  {
    key: 'nxv:datatset',
    name: 'Dataset',
    type: 'ElasticSearch',
    priority: 3,
  },
  {
    key: 'nxv:defaultGlobalElasticSearchView',
    name: 'defaultGlobalElasticSearchView',
    type: 'ElasticSearch',
    priority: 0,
  },
  {
    key: 'nxv:defaultSparqlView',
    name: 'defaultSparqlView',
    type: 'Sparql',
    priority: 5,
  },
];

const ResolversSubView = (props: Props) => {
  const handleOnEdit = () => {};
  const createNewResolverHandler = () => {};
  const columns: ColumnsType<DataType> = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      render: text => <span>{text}</span>,
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
      render: text => <span>{text}</span>,
    },
    {
      key: 'priority',
      dataIndex: 'priority',
      title: 'Priority',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'actions',
      dataIndex: 'actions',
      title: 'Actions',
      align: 'center',
      render: text => (
        <Button type="link" htmlType="button" onClick={handleOnEdit}>
          Edit
        </Button>
      ),
    },
  ];

  const data: DataType[] = viewsSample;

  return (
    <div className="settings-view settings-resolvers-view">
      <h2>Resolvers</h2>
      <div className="settings-view-container">
        <Button
          style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
          type="primary"
          disabled={false} // TODO: write premission to be enabled
          htmlType="button"
          onClick={createNewResolverHandler}
        >
          Create Resolver
        </Button>
        <Table
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          dataSource={data}
          sticky={true}
          size="middle"
        />
      </div>
    </div>
  );
};

export default ResolversSubView;
