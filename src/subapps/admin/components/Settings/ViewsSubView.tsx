import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Table, Button, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './SettingsView.less';

type Props = {};
type DataType = {
  key: string;
  name: string;
  type?: string;
  status: string;
};

const ViewsSubView = (props: Props) => {
  const nexus = useNexusContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const [loading, setLoading] = useState(false);
  const handleOnEdit = () => {};
  const handleOnQuery = () => {};
  const handleOnDelete = () => {};
  const createNewViewHandler = () => {};
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
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'actions',
      dataIndex: 'actions',
      title: 'Actions',
      align: 'center',
      render: text => (
        <div className="view-item-actions">
          <Button type="link" htmlType="button" onClick={handleOnEdit}>
            Edit
          </Button>
          <Button type="link" htmlType="button" onClick={handleOnQuery}>
            Query
          </Button>
          <Button type="link" htmlType="button" onClick={handleOnDelete}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // const data:  = viewsSample;
  const [data, setViewsData] = useState<DataType[]>();
  useEffect(() => {
    const loadViews = () => {
      setLoading(true);
      nexus.View.list(orgLabel, projectLabel, {})
        .then(response => {
          console.log('@@response', response);
          const result = response._results.map(item => ({
            key: item['@id'] as string,
            name: (item['@id'] as string).split('/').pop() as string,
            type: item['@type']?.[0],
            status: '100%',
          }));
          setViewsData(result);
          setLoading(false);
        })
        .catch(e => {
          setLoading(false);
          notification.error({
            message: 'Fetching views failed',
            description: e.message,
          });
        });
    };
    loadViews();
  }, []);

  return (
    <div className="settings-view settings-views-view">
      <h2>Views</h2>
      <div className="settings-view-container">
        <Button
          style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
          type="primary"
          disabled={false} // TODO: write premission to be enabled
          htmlType="button"
          onClick={createNewViewHandler}
        >
          Create View
        </Button>
        <Table
          loading={loading}
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

export default ViewsSubView;
