import React from 'react';
import { orderBy } from 'lodash';
import { Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';
import { NexusClient } from '@bbp/nexus-sdk';
import { PromisePool } from '@supercharge/promise-pool';
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
    const response = await nexus.Resolver.list(orgLabel, projectLabel);
    const resolvers = response._results.map(item => ({
      // @ts-ignore
      type: item['@type'].filter(t => t !== 'Resolver'),
      priority: item.priority,
      id: item['@id'],
    }));
    const { results, errors } = await PromisePool
      .withConcurrency(4)
      .for(resolvers!)
      .process(async (res) => {
        const iResolver = await nexus.Resolver.get(orgLabel, projectLabel, encodeURIComponent(res.id));
        return {
          ...res,
          priority: iResolver.priority,
        };
      });
    const resultsOrdered = orderBy(results, ['priority'], ['asc']);
    return { 
      errors,
      results: resultsOrdered, 
    };
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not find resolvers', { cause: error });
  }
};
const ResolversSubView = (props: Props) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const createNewResolverHandler = () => {
    const queryURI = `/admin/${orgLabel}/${projectLabel}/create`;
    history.push(queryURI);
  };
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
      render: (_, record) => {
        const editURI = `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(`${record.id}`)}`;
        return (
          <Button type="link" htmlType="button" onClick={() => history.push(editURI)}>
            Edit
          </Button>
        )
      }
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
          dataSource={resolvers?.results}
          sticky={true}
          size="middle"
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ResolversSubView;
