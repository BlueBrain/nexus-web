import React from 'react';
import { Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useRouteMatch } from 'react-router';
import { NexusClient } from '@bbp/nexus-sdk';
import './SettingsView.less';

type Props = {};
type TDataType = {
  id: string;
  name?: string;
  type: string[];
  priority: number;
};

const fetchResolvers = async ({
  nexus,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
}) => {
  try {
    const resolvers = await nexus.Resolver.list(orgLabel, projectLabel);
    return resolvers._results.map(item => ({
      // @ts-ignore
      type: item['@type'].filter(t => t !== 'Resolver'),
      priority: item.priority,
      id: item['@id'],
    }));
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not find resolvers', { cause: error });
  }
};
const ResolversSubView = (props: Props) => {
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
  const createNewResolverHandler = () => {};
  const columns: ColumnsType<TDataType> = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      render: (text, record) => <span>{record.id.split('/').pop()}</span>,
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
      render: text => (
        <div>
          {text.map((item: string) => (
            <div>{item}</div>
          ))}
        </div>
      ),
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
        <Button disabled type="link" htmlType="button" onClick={handleOnEdit}>
          Edit
        </Button>
      ),
    },
  ];
  const { data: resolvers, status } = useQuery({
    queryKey: [`resolvers-${orgLabel}-${projectLabel}`],
    queryFn: () => fetchResolvers({ nexus, orgLabel, projectLabel }),
  });

  return (
    <div className="settings-view settings-resolvers-view">
      <h2>Resolvers</h2>
      <div className="settings-view-container">
        <Button
          style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
          type="primary"
          disabled={true} // TODO: write premission to be enabled
          htmlType="button"
          onClick={createNewResolverHandler}
        >
          Create Resolver
        </Button>
        <Table<TDataType>
          loading={status === 'loading'}
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          rowKey={r => r.id}
          dataSource={resolvers}
          sticky={true}
          size="middle"
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ResolversSubView;
