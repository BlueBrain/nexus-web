import React, { useState } from 'react';
import { isObject, orderBy } from 'lodash';
import { Table, Button, Row, Input, Col, notification, Alert } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { NexusClient } from '@bbp/nexus-sdk';
import { PromisePool } from '@supercharge/promise-pool';
import ReactJson from 'react-json-view';
import { easyValidURL } from '../../../../utils/validUrl';
import './styles.less';
import { Link } from 'react-router-dom';

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
    const { results, errors } = await PromisePool.withConcurrency(4)
      .for(resolvers!)
      .process(async res => {
        const iResolver = await nexus.Resolver.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(res.id)
        );
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
const fetchResourceByResolver = async ({
  nexus,
  resourceId,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
}) => {
  try {
    return await nexus.Resolver.getResource(
      orgLabel,
      projectLabel,
      '_',
      resourceId
    );
  } catch (error) {
    // @ts-ignore
    throw new Error(`Can not resolve the resources with ${resourceId}`, {
      cause: error,
    });
  }
};
const ResolversSubView = (props: Props) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [selectedResource, setSelctedResource] = useState<string>('');
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
  }>();
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const createNewResolverHandler = () => {
    const queryURI = `/orgs/${orgLabel}/${projectLabel}/create`;
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
        const editURI = `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
          `${record.id}`
        )}`;
        return (
          <Button
            type="link"
            htmlType="button"
            onClick={() => history.push(editURI)}
          >
            Edit
          </Button>
        );
      },
    },
  ];
  const { data: resolvers, status } = useQuery({
    queryKey: [`resolvers-${orgLabel}-${projectLabel}`],
    queryFn: () => fetchResolvers({ nexus, orgLabel, projectLabel }),
  });

  const {
    mutateAsync: resolveResourceByID,
    error,
    data,
    status: resolving,
  } = useMutation(fetchResourceByResolver);
  const handleSubmitResolve: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const resourceUri = data.get('resourceId') as string;
    const resourceId = easyValidURL(resourceUri)
      ? encodeURIComponent(resourceUri)
      : resourceUri;
    setSelctedResource(resourceId);
    resolveResourceByID(
      {
        nexus,
        orgLabel,
        projectLabel,
        resourceId,
      },
      {
        onError: error => {
          // @ts-ignore
          console.log('@@error', error.message);
          // @ts-ignore
          console.log('@@error', error.cause.message);
        },
      }
    );
  };
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
      <h2 style={{ marginTop: 20 }}>Resolve an ID</h2>
      <div className="settings-view-container">
        <form onSubmit={handleSubmitResolve} className="resolver-search-bar">
          <Input
            name="resourceId"
            allowClear
            placeholder="ID"
            // value={query}
            // onChange={handleQueryChange}
            role="search"
          />
          <Button
            type="ghost"
            htmlType="submit"
            loading={resolving === 'loading'}
          >
            Resolve
          </Button>
        </form>
        <div className="resolver-search-results">
          {resolving === 'success' && (
            <>
              <Alert
                type="success"
                message="Resource resolved successfully"
                description={<Button type='link' onClick={() => {
                  history.push(`/${orgLabel}/${projectLabel}/resources/${selectedResource}`, { background: location });
                }}>open resource</Button>}
                style={{ marginBottom: 10 }}
              />
              <ReactJson
                collapsed
                name={data!['@id']}
                src={data as object}
                enableClipboard={false}
                displayObjectSize={false}
                displayDataTypes={false}
              />
            </>
          )}
          {error && (
            <>
              <Alert
                type="error"
                // @ts-ignore
                message={error.message}
                // @ts-ignore
                description={error.cause.message}
                style={{ marginBottom: 10 }}
              />
              {// @ts-ignore
                isObject(error.cause) && (
                  <ReactJson
                    name="Error"
                    // @ts-ignore
                    src={error.cause}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                  />
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolversSubView;
