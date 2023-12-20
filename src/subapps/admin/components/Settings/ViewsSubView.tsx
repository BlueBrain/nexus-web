import { MinusCircleTwoTone, PlusCircleTwoTone } from '@ant-design/icons';
import { NexusClient } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import * as Sentry from '@sentry/browser';
import { PromisePool } from '@supercharge/promise-pool';
import { Badge, Button, Col, Row, Table, Tooltip, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { isArray, isString, orderBy } from 'lodash';
import { useMutation, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';
import { RootState } from '../../../../shared/store/reducers';
import { getOrgAndProjectFromProjectId } from '../../../../shared/utils';
import {
  IndexingErrorResults,
  ViewIndexingErrors,
  fetchIndexingErrors,
} from './ViewIndexingErrors';
import './styles.less';

type SubView = {
  key: string;
  id: string;
  name: string;
  type?: string | string[];
  status: string;
  orgLabel: string;
  projectLabel: string;
  isAggregateView: boolean;
  indexingErrors: IndexingErrorResults;
};

const AggregateViews = ['AggregateElasticSearchView', 'AggregateSparqlView'];
const aggregateFilterPredicate = (type?: string | string[]) => {
  if (type) {
    if (isArray(type)) {
      return type.some(i => AggregateViews.includes(i));
    }
    return AggregateViews.includes(type);
  }
  return false;
};

const fetchViewsList = async ({
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
    const result: Omit<SubView, 'indexingErrors'>[] = views._results.map(
      item => {
        const { orgLabel, projectLabel } = getOrgAndProjectFromProjectId(
          item._project
        )!;
        return {
          orgLabel,
          projectLabel,
          id: item['@id'],
          key: item['@id'] as string,
          name: (item['@id'] as string).split('/').pop() as string,
          type: item['@type'],
          isAggregateView: aggregateFilterPredicate(item['@type']),
          status: '100%',
        };
      }
    );

    const { results, errors } = await PromisePool.withConcurrency(4)
      .for(result!)
      .process(async view => {
        if (!view.isAggregateView) {
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
            errors: [],
            status: percentage ? `${(percentage * 100).toFixed(0)}%` : '0%',
            indexingErrors: {
              '@context': [],
              _next: null,
              _total: 0,
              _results: [],
            },
          };
        }

        return {
          ...view,
          errors: [],
          status: 'N/A',
          indexingErrors: { _total: 0, _results: [] },
        };
      });

    return {
      errors,
      results: orderBy(results, ['isAggregateView', 'name'], ['asc', 'asc']),
    };
  } catch (error) {
    console.error('@@error', error);
    Sentry.captureException('Error loading and filtering the views', {
      extra: {
        orgLabel,
        projectLabel,
        error,
      },
    });
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
  try {
    return await nexus.httpDelete({
      path: `${apiEndpoint}/views/${orgLabel}/${projectLabel}/${encodeURIComponent(
        viewId
      )}/offset`,
    });
  } catch (error) {
    console.log('@@error', error);
    Sentry.captureException('Error restarting one view', {
      extra: {
        orgLabel,
        projectLabel,
        viewId,
        error,
      },
    });
  }
};

const restartIndexingAllViews = async ({
  nexus,
  apiEndpoint,
  views,
}: {
  nexus: NexusClient;
  views: SubView[];
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
    Sentry.captureException('Error restarting views', {
      extra: {
        views,
      },
    });
    // @ts-ignore
    throw new Error('Error captured when re-indexing the views', {
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
    queryFn: () => fetchViewsList({ nexus, orgLabel, projectLabel }),
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

  const fetchIndexingErrorsOnDemand = async ({
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
    try {
      // Fetch indexing errors for the specified view
      const indexingErrors = await fetchIndexingErrors({
        nexus,
        apiEndpoint,
        orgLabel,
        projectLabel,
        viewId,
      });

      return indexingErrors;
    } catch (error) {
      console.error('Error fetching indexing errors on demand', error);
      Sentry.captureException(error, {
        extra: {
          orgLabel,
          projectLabel,
          viewId,
          error,
        },
      });

      return {
        '@context': [],
        _next: null,
        _total: 0,
        _results: [],
      };
    }
  };

  const columns: ColumnsType<SubView> = [
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
      render: (text, record) => {
        if (isString(text)) {
          return <span>{text}</span>;
        }
        if (isArray(text)) {
          return text.map((type, ind) => (
            <div key={`${record.id}-type-${ind}`}>{type}</div>
          ));
        }
        return null;
      },
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
      render: (_, { id, key, orgLabel, projectLabel, isAggregateView }) => {
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
            {!isAggregateView && (
              <AccessControl
                permissions={['views/query', 'views/write']}
                path={[`${orgLabel}/${projectLabel}`]}
                noAccessComponent={() => (
                  <Tooltip title="You have no permissions to re-index this view">
                    <Button disabled type="link">
                      <span style={{ marginRight: 5 }}>Re-index</span>
                      <HasNoPermission />
                    </Button>
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
            )}
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
                <Tooltip
                  className="row-center"
                  title="You have no permissions to re-index the views"
                >
                  <Button
                    type="ghost"
                    disabled
                    style={{ margin: 0, marginTop: 20 }}
                  >
                    <span style={{ marginRight: 10 }}>Re-index All Views</span>
                    <HasNoPermission />
                  </Button>
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
                    // TODO Fix this type
                    // @ts-ignore
                    views: views?.results.filter(item => !item.isAggregateView),
                  });
                }}
              >
                Re-index All Views
              </Button>
            </AccessControl>
          </Col>
        </Row>

        <Table<SubView>
          loading={status === 'loading'}
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          // TODO Fix this type
          // @ts-ignore
          dataSource={views?.results}
          sticky={true}
          size="middle"
          pagination={false}
          rowKey={r => r.key}
          expandIcon={({ expanded, onExpand, record }) =>
            expanded ? (
              <MinusCircleTwoTone onClick={e => onExpand(record, e)} />
            ) : (
              <>
                <Badge
                  count={record.indexingErrors._total}
                  showZero={false}
                  size="small"
                ></Badge>
                <PlusCircleTwoTone
                  data-testid="Expand indexing errors"
                  onClick={async e => {
                    // Fetch indexing errors when expanding the row
                    // We do this on demand to avoid fetching all indexing errors for all views at once (which can be a lot)
                    record.indexingErrors = await fetchIndexingErrorsOnDemand({
                      nexus,
                      apiEndpoint,
                      orgLabel: record.orgLabel,
                      projectLabel: record.projectLabel,
                      viewId: record.id,
                    });
                    onExpand(record, e);
                  }}
                />
              </>
            )
          }
          expandedRowRender={(r: SubView) => {
            return (
              <ViewIndexingErrors
                key={r.id}
                indexingErrors={r.indexingErrors}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

export default ViewsSubView;
