import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './SettingsView.less';
import { useMutation, useQuery } from 'react-query';
import { NexusClient } from '@bbp/nexus-sdk';

type Props = {};
type DataType = {
  key: string;
  name: string;
  type?: string;
  status: string;
};

const fetchViewList = async ({
  nexus,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
}) => {
  try {
    const views = await nexus.View.list(orgLabel, projectLabel, {});
    const result = views._results.map(item => ({
      key: item['@id'] as string,
      name: (item['@id'] as string).split('/').pop() as string,
      type: item['@type']?.[0],
      status: '100%',
    }));
    return result;
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch views', { cause: error });
  }
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
          <Button disabled type="link" htmlType="button" onClick={handleOnEdit}>
            Edit
          </Button>
          <Button
            disabled
            type="link"
            htmlType="button"
            onClick={handleOnQuery}
          >
            Query
          </Button>
          <Button
            disabled
            type="link"
            htmlType="button"
            onClick={handleOnDelete}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
  const { data: views, status } = useQuery({
    queryKey: [`views-${orgLabel}-${projectLabel}`],
    queryFn: () => fetchViewList({ nexus, orgLabel, projectLabel }),
  });

  return (
    <div className="settings-view settings-views-view">
      <h2>Views</h2>
      <div className="settings-view-container">
        <Button
          style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
          type="primary"
          disabled={true} // TODO: write premission to be enabled
          htmlType="button"
          onClick={createNewViewHandler}
        >
          Create View
        </Button>
        <Table
          loading={status === 'loading'}
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          dataSource={views}
          sticky={true}
          size="middle"
          pagination={false}
          rowKey={r => r.key}
        />
      </div>
    </div>
  );
};

export default ViewsSubView;
