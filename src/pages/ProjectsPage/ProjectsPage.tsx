import React, { useReducer, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import {
  LoadingOutlined,
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  NexusClient,
  ProjectList,
  ProjectResponseCommon,
} from '@bbp/nexus-sdk';
import { Alert, Input, InputRef, List, Spin } from 'antd';
import { match as pmatch } from 'ts-pattern';
import * as pluralize from 'pluralize';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import {
  LoadMoreFooter,
  TSort,
} from '../OrganizationsListPage/OrganizationListPage';
import DeprecatedIcon from '../../shared/components/Icons/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import timeago from '../../utils/timeago';
import formatNumber from '../../utils/formatNumber';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import '../../shared/styles/route-layout.less';

type TProjectOptions = {
  from: number;
  size: number;
  sort?: string;
  query?: string;
};
type TFetchProjectListProps = TProjectOptions & { nexus: NexusClient };
type TNewProjectList = ProjectList & { _next: string };

const fetchProjectsList = async ({
  nexus,
  query,
  size,
  from = 0,
  sort,
}: TFetchProjectListProps) => {
  try {
    return await nexus.Project.list(undefined, {
      size,
      from,
      label: query,
      sort: `${sort === 'asc' ? '' : '-'}_label`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch projects list', { cause: error });
  }
};

export const DATA_SET_TYPE = 'http://schema.org/Dataset';
interface TPageOptions {
  sort: TSort;
}
type TProjectItem = {
  title: string;
  to: string;
  orgLabel: string;
  projectLabel: string;
  deprected: boolean;
  description?: string;
  datasets?: string;
  createdAt: Date;
  updatedAt: Date;
  access?: string;
  nexus: NexusClient;
};
const ProjectItem = ({
  title,
  to,
  description,
  deprected,
  createdAt,
  updatedAt,
  access,
  orgLabel,
  projectLabel,
  nexus,
}: TProjectItem) => {
  const { data } = useQuery({
    queryKey: ['datesets', { orgLabel, projectLabel }],
    queryFn: () =>
      nexus.Resource.list(orgLabel, projectLabel, {
        type: DATA_SET_TYPE,
      }),
  });
  const datasets = data?._total;
  return (
    <List.Item className="route-result-list_item" role="routeitem-project">
      <div className="route-result-list_item_wrapper">
        <div className="org">
          <Link to={to}>
            <h3>
              {title}{' '}
              {deprected && (
                <span className="depreacted-tag">
                  <DeprecatedIcon /> deprecated
                </span>
              )}
            </h3>
          </Link>
          <p>{description}</p>
        </div>
        <div className="statistics">
          <div className="statistics_item">
            <div>Datasets</div>
            <div>{(datasets && formatNumber(datasets)) || '0'}</div>
          </div>
          <div className="statistics_item">
            {/* <div>Your access</div>
            <div>{access || ''}</div> */}
          </div>
          <div className="statistics_item">
            <div>Created</div>
            <div>{timeago(createdAt)}</div>
          </div>
          <div className="statistics_item">
            <div>Last update</div>
            <div>{timeago(updatedAt)}</div>
          </div>
        </div>
        <div className="redirection">
          <Link to={to}>
            View organization projects
            <RightSquareOutlined />
          </Link>
        </div>
      </div>
    </List.Item>
  );
};

export const useInfiniteProjectsQuery = ({
  nexus,
  query,
  sort,
}: {
  nexus: NexusClient;
  query: string;
  sort: TSort;
}) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['fusion-projects', { query, sort }],
    queryFn: ({ pageParam = 0 }) =>
      fetchProjectsList({ nexus, query, sort, from: pageParam, size: 10 }),
    getNextPageParam: lastPage =>
      (lastPage as TNewProjectList)._next
        ? new URL((lastPage as TNewProjectList)._next).searchParams.get('from')
        : undefined,
  });
  return {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  };
};
const ProjectsPage: React.FC<{}> = ({}) => {
  const dispatch = useDispatch();
  const queryInputRef = useRef<InputRef>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const totalProjectsRef = useRef<number>(0);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const [query, setQueryString] = useState<string>('');
  const nexus: NexusClient = useNexusContext();
  const [{ sort }, setOptions] = useReducer(
    (previous: TPageOptions, newPartialState: Partial<TPageOptions>) => ({
      ...previous,
      ...newPartialState,
    }),
    { sort: 'asc' }
  );
  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
    });
  };
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteProjectsQuery({
    nexus,
    query,
    sort,
  });

  const total =
    data && data.pages ? ((data.pages[0] as ProjectList)?._total as number) : 0;
  const dataSource: ProjectResponseCommon[] =
    data && data.pages
      ? data.pages.map(page => (page as ProjectList)._results).flat()
      : [];
  if (!query) {
    totalProjectsRef.current = total;
  }
  const handleUpdateSorting = (value: string) => {
    setOptions({ sort: value as TSort });
    if (dataContainerRef.current) {
      const containerTop = dataContainerRef.current.getBoundingClientRect().top;
      const topPosition = containerTop + window.pageYOffset - 80;
      window.scrollTo({
        top: topPosition,
        behavior: 'smooth',
      });
    }
  };
  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = e =>
    setQueryString(e.target.value);

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage,
  });
  const LoadMore = (
    <LoadMoreFooter
      {...{ hasNextPage, fetchNextPage }}
      loading={isFetchingNextPage || isFetching || isLoading}
      ref={loadMoreRef}
    />
  );
  console.log('@@total', total);
  return (
    <div className="main-route">
      <PinnedMenu />
      <RouteHeader
        title="Projects"
        extra={
          total && !query ? (
            `Total of ${total} ${pluralize('Project', total)}`
          ) : total && query ? (
            `Filtering ${total} of ${totalProjectsRef.current}  ${pluralize(
              'Project',
              total
            )}`
          ) : isLoading ? (
            <LoadingOutlined />
          ) : (
            'No projects found'
          )
        }
        alt="hippocampus"
        bg={require('../../shared/images/hippocampus.png')}
        createLabel="Create Project"
        onCreateClick={() => updateCreateModelVisibility(true)}
        permissions={['projects/create']}
        path={['/']}
      />
      <div className="route-body">
        <div className="route-body-container">
          <div className="route-actions">
            <div className="action-search">
              <Input.Search
                allowClear
                autoFocus
                ref={queryInputRef}
                value={query}
                onChange={handleOnOrgSearch}
                placeholder="Search Project"
              />
            </div>
            <div className="action-sort">
              <span>Sort:</span>
              <SortAscendingOutlined
                style={{ backgroundColor: sortBackgroundColor(sort, 'asc') }}
                onClick={() => handleUpdateSorting('asc')}
              />
              <SortDescendingOutlined
                style={{ backgroundColor: sortBackgroundColor(sort, 'desc') }}
                onClick={() => handleUpdateSorting('desc')}
              />
            </div>
          </div>
          <div className="route-data-container" ref={dataContainerRef}>
            {pmatch(status)
              .with('loading', () => <Spin spinning={true} />)
              .with('error', () => (
                <div className="route-error">
                  <Alert
                    type="error"
                    message="⛔️ Error loading the projects list"
                    // @ts-ignore
                    description={error?.cause?.message}
                  />
                </div>
              ))
              .with('success', () => (
                <div className="route-result-list">
                  <List
                    itemLayout="horizontal"
                    loadMore={LoadMore}
                    dataSource={dataSource}
                    renderItem={(item: ProjectResponseCommon) => {
                      const to = `/orgs/${item._organizationLabel}/${item._label}`;
                      return (
                        <ProjectItem
                          {...{
                            to,
                            nexus,
                            projectLabel: item._label,
                            orgLabel: item._organizationLabel,
                            type: item['@type'],
                            title: item._label,
                            deprected: item._deprecated,
                            createdAt: new Date(item._createdAt),
                            updatedAt: new Date(item._updatedAt),
                            description: item.description,
                          }}
                        />
                      );
                    }}
                  />
                </div>
              ))
              .otherwise(() => (
                <></>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
