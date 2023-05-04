import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { useMutation, useQuery } from 'react-query';
import { Table, Button, Row, Col, notification, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { NexusClient, Statistics } from '@bbp/nexus-sdk';
import { PromisePool } from '@supercharge/promise-pool';
import { useSelector } from 'react-redux';
import { getOrgAndProjectFromProjectId } from '../../../../shared/utils';
import { RootState } from '../../../../shared/store/reducers';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';
import './styles.less';

type TDataType = {
  key: string;
  id: string;
  name: string;
  type?: string;
  status: string;
  orgLabel: string;
  projectLabel: string;
};

const fetchViewsList = async ({
  nexus,
  orgLabel,
  projectLabel,
  apiRoot,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  apiRoot: string;
}) => {
  try {
    const views = await nexus.View.list(orgLabel, projectLabel, {});
    const result: TDataType[] = views._results.map(item => {
      const { orgLabel, projectLabel } = getOrgAndProjectFromProjectId(
        item._project
      )!;
      return {
        orgLabel,
        projectLabel,
        id: item['@id'],
        key: item['@id'] as string,
        name: (item['@id'] as string).split('/').pop() as string,
        type: item['@type']?.[0],
        status: '100%',
      };
    });
    const { results, errors } = await PromisePool.withConcurrency(4)
      .for(result!)
      .process(async view => {
        const iViewStats = await nexus.View.statistics(
          orgLabel,
          projectLabel,
          encodeURIComponent(view.key)
        );
        //  TODO: we should update the type in nexus-sdk! as the response is not the same from delta!
        // @ts-ignore
        const percentage = iViewStats.totalEvents
          ? // @ts-ignore
            iViewStats.processedEvents / iViewStats.totalEvents
          : 0;
        return {
          ...view,
          status: percentage ? `${(percentage * 100).toFixed(0)}%` : '0%',
        };
      });
    return {
      results,
      errors,
    };
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch views', { cause: error });
  }
};
const restartIndexOneView = async ({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  viewId,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
}) => {
  return await nexus.httpDelete({
    path: `${apiEndpoint}/views/${orgLabel}/${projectLabel}/${encodeURIComponent(
      viewId
    )}/offset`,
  });
};
const restartIndexingAllViews = async ({
  nexus,
  apiEndpoint,
  views,
}: {
  nexus: NexusClient;
  views: TDataType[];
  apiEndpoint: string;
}) => {
  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(views)
    .process(async ({ orgLabel, projectLabel, id: viewId }) => {
      await restartIndexOneView({
        nexus,
        apiEndpoint,
        orgLabel,
        projectLabel,
        viewId,
      });
    });
  if (errors.length) {
    // @ts-ignore
    throw new Error('Error captured when reindexing the views', {
      cause: errors,
    });
  }
  return results;
};

const ViewsSubView = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const createNewViewHandler = () => {
    const queryURI = `/orgs/${orgLabel}/${projectLabel}/create`;
    history.push(queryURI);
  };
  const { data: views, status } = useQuery({
    queryKey: [`views-${orgLabel}-${projectLabel}`],
    queryFn: () =>
      fetchViewsList({ nexus, orgLabel, projectLabel, apiRoot: apiEndpoint }),
    refetchInterval: 30 * 1000, // 30s
  });
  const { mutateAsync: handleReindexingOneView } = useMutation(
    restartIndexOneView
  );
  const { mutateAsync: handleReindexingAllViews, isLoading } = useMutation(
    restartIndexingAllViews,
    {
      onError: error => {
        notification.error({
          message: `Error when restarting indexing the views`,
          description: '',
        });
      },
    }
  );

  const columns: ColumnsType<TDataType> = [
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
      title: 'Indexation status',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'actions',
      dataIndex: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, { id, key, orgLabel, projectLabel }) => {
        const editURI = `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
          `${key}`
        )}`;
        const queryURI = `/orgs/${orgLabel}/${projectLabel}/query/${encodeURIComponent(
          `${key}`
        )}`;
        return (
          <div className="view-item-actions">
            <Button
              type="link"
              htmlType="button"
              onClick={() => history.push(editURI)}
            >
              Edit
            </Button>
            <Button
              type="link"
              htmlType="button"
              onClick={() => history.push(queryURI)}
            >
              Query
            </Button>
            <AccessControl
              permissions={['views/query', 'views/write']}
              path={[`${orgLabel}/${projectLabel}`]}
              noAccessComponent={() => (
                <Tooltip title="You have no permissions to re-index this view">
                  <HasNoPermission />
                </Tooltip>
              )}
            >
              <Button
                type="link"
                htmlType="button"
                onClick={() =>
                  handleReindexingOneView({
                    nexus,
                    apiEndpoint,
                    orgLabel,
                    projectLabel,
                    viewId: id,
                  })
                }
              >
                Re-index
              </Button>
            </AccessControl>
          </div>
        );
      },
    },
  ];

  return (
    <div className="settings-view settings-views-view">
      <h2>Views</h2>
      <div className="settings-view-container">
        <Row gutter={10}>
          <Col>
            <Button
              style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
              type="primary"
              htmlType="button"
              onClick={createNewViewHandler}
            >
              Create View
            </Button>
          </Col>
          <Col>
            <AccessControl
              permissions={['views/query', 'views/write']}
              path={[`${orgLabel}/${projectLabel}`]}
              noAccessComponent={() => (
                <Tooltip title="You have no permissions to re-index the views">
                  <HasNoPermission />
                </Tooltip>
              )}
            >
              <Button
                disabled={
                  isLoading ||
                  status === 'loading' ||
                  (status === 'success' && !Boolean(views?.results))
                }
                loading={isLoading}
                type="ghost"
                style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
                htmlType="button"
                onClick={() => {
                  handleReindexingAllViews({
                    nexus,
                    apiEndpoint,
                    views: views?.results || [],
                  });
                }}
              >
                Re-index All Views
              </Button>
            </AccessControl>
          </Col>
        </Row>

        <Table<TDataType>
          loading={status === 'loading'}
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          dataSource={views?.results}
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
