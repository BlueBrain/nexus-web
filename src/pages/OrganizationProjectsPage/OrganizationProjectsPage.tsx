import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import { InputRef, Input, Spin, Alert, List } from 'antd';
import { capitalize } from 'lodash';
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
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { useDispatch, useSelector } from 'react-redux';
import pluralize from 'pluralize';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import { DATA_SET_TYPE } from '../ProjectsPage/ProjectsPage';
import {
  LoadMoreFooter,
  TSort,
} from '../OrganizationsListPage/OrganizationListPage';
import { RootState } from '../../shared/store/reducers';
import DeprecatedIcon from '../../shared/components/Icons/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import timeago from '../../utils//timeago';
import formatNumber from '../../utils/formatNumber';
import hippocampus from '../../shared/images/hippocampus.png';
import '../../shared/styles/route-layout.scss';

const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = true;

type TOrganizationOptions = {
  orgLabel: string;
};
type TProjectResponseCommonExtended = ProjectResponseCommon & {
  _markedForDeletion: boolean;
};
interface TPageOptions {
  sort: TSort;
}
type TOrganizationProjectsOptions = {
  orgLabel: string;
  query: string;
  size: number;
  from: number;
  sort?: string;
};
type TFetchOrganizationListProps = TOrganizationOptions & {
  nexus: NexusClient;
};
type TFetchOrganizationProjectsListProps = TOrganizationProjectsOptions & {
  nexus: NexusClient;
};
type TNewProjectList = ProjectList & { _next: string };
type TProjectItem = {
  title: string;
  to: string;
  description?: string;
  deprected: boolean;
  access?: string;
  createdAt: Date;
  updatedAt: Date;
  organization: string;
  nexus: NexusClient;
  toDelete: boolean;
};
const fetchOrganizationDetails = async ({
  nexus,
  orgLabel,
}: TFetchOrganizationListProps) => {
  try {
    return await nexus.Organization.get(orgLabel);
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch organization details', { cause: error });
  }
};
const fetchOrganizationProjectsList = async ({
  nexus,
  query,
  orgLabel,
  size,
  from,
  sort,
}: TFetchOrganizationProjectsListProps) => {
  try {
    return await nexus.Project.list(orgLabel, {
      size,
      from,
      label: query,
      deprecated: undefined,
      sort: `${sort === 'asc' ? '' : '-'}_label`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch organization projects list', {
      cause: error,
    });
  }
};

export const useInfiniteOrganizationProjectsQuery = ({
  nexus,
  orgLabel,
  query,
  sort,
  enabled,
}: {
  nexus: NexusClient;
  orgLabel?: string;
  query: string;
  sort: TSort;
  enabled: boolean;
}) => {
  return useInfiniteQuery({
    enabled,
    queryKey: ['fusion-projects', { query, sort }],
    queryFn: ({ pageParam = 0 }) =>
      fetchOrganizationProjectsList({
        nexus,
        query,
        orgLabel: orgLabel!,
        size: DEFAULT_PAGE_SIZE,
        from: pageParam,
      }),
    getNextPageParam: lastPage =>
      (lastPage as TNewProjectList)._next
        ? new URL((lastPage as TNewProjectList)._next).searchParams.get('from')
        : undefined,
  });
};

const ProjectItem = ({
  title,
  to,
  description,
  deprected,
  createdAt,
  updatedAt,
  access,
  organization,
  nexus,
  toDelete,
}: TProjectItem) => {
  const { data } = useQuery({
    queryKey: ['datesets', { orgLabel: organization, projectLabel: title }],
    queryFn: () =>
      nexus.Resource.list(organization, title, {
        type: DATA_SET_TYPE,
      }),
  });
  const datasets = data?._total;
  return (
    <List.Item className="route-result-list_item">
      <div
        className="route-result-list_item_wrapper"
        role="routeitem-org-project"
      >
        <div className="org">
          <Link to={to}>
            <h3>
              {toDelete && (
                <span style={{ verticalAlign: 'top', margin: '0 3px' }}>
                  <LoadingOutlined
                    style={{
                      fontSize: 12,
                      color: '#dc7943',
                      verticalAlign: 'middle',
                    }}
                  />
                </span>
              )}
              {title}
              {toDelete && (
                <span className="deletion-tag">Project being deleted</span>
              )}
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
            <div>{(datasets && formatNumber(datasets)) ?? '0'}</div>
          </div>
          <div className="statistics_item">
            <div>Last update</div>
            <div>{timeago(updatedAt)}</div>
          </div>
          <div className="statistics_item">
            <div>Created</div>
            <div>{timeago(createdAt)}</div>
          </div>
          <div className="statistics_item" />
        </div>
        <div className="redirection">
          <Link to={to}>
            View project
            <RightSquareOutlined />
          </Link>
        </div>
      </div>
    </List.Item>
  );
};

const OrganizationProjectsPage: React.FC<{}> = ({}) => {
  const dispatch = useDispatch();
  const nexus = useNexusContext();
  const queryInputRef = useRef<InputRef>(null);
  const loadMoreRef = useRef(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const totalProjectsRef = useRef<number>(0);
  const [query, setQueryString] = useState<string>('');
  const { layoutSettings } = useSelector((state: RootState) => state.config);
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{ orgLabel: string }>(
    `/${subapp.namespace}/:orgLabel`
  );
  const orgLabel = match?.params.orgLabel;
  const [{ sort }, setOptions] = useReducer(
    (previous: TPageOptions, newPartialState: Partial<TPageOptions>) => ({
      ...previous,
      ...newPartialState,
    }),
    { sort: 'asc' }
  );

  const { data: organization, error: organisationError } = useQuery({
    enabled: !!orgLabel,
    queryKey: ['organization-projects', { orgLabel, sort }],
    queryFn: () => fetchOrganizationDetails({ nexus, orgLabel: orgLabel! }),
  });

  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
    });
  };

  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = e =>
    setQueryString(e.target.value);
  const handleUpdateSorting = (value: string) => {
    // @ts-ignore
    setOptions({ sort: value });
    if (dataContainerRef.current) {
      const containerTop = dataContainerRef.current.getBoundingClientRect().top;
      const topPosition = containerTop + window.pageYOffset - 80;
      window.scrollTo({
        top: topPosition,
        behavior: 'smooth',
      });
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: projectStatus,
    error: projectError,
    isLoading,
    isFetching,
    isError,
  } = useInfiniteOrganizationProjectsQuery({
    nexus,
    orgLabel,
    query,
    sort,
    enabled: !!orgLabel && !!organization?.['@id'],
  });
  const total =
    data && data.pages ? ((data.pages[0] as ProjectList)?._total as number) : 0;
  const dataSource: TProjectResponseCommonExtended[] = (data && data.pages
    ? data.pages.map(page => (page as ProjectList)._results).flat()
    : []) as TProjectResponseCommonExtended[];
  if (!query.trim().length) {
    totalProjectsRef.current = total;
  }
  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage,
  });
  useEffect(() => {
    setQueryString('');
    if (queryInputRef.current) {
      queryInputRef.current.focus({
        cursor: 'end',
      });
    }
  }, []);
  const LoadMore = (
    <LoadMoreFooter
      {...{ hasNextPage, fetchNextPage }}
      loading={isFetchingNextPage || isFetching || isLoading}
      ref={loadMoreRef}
    />
  );
  return (
    <Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title={orgLabel ? capitalize(orgLabel) : 'Projects'}
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
          bg={layoutSettings.projectsImg || hippocampus}
          createLabel="Create Project"
          onCreateClick={() => updateCreateModelVisibility(true)}
          permissions={['projects/create']}
          path={[`/${orgLabel}`]}
          supTitle="Organization"
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
                  role="search"
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
              {projectError ||
                (organisationError && (
                  <div className="route-error">
                    <Alert
                      message="⛔️ Error loading the projects list"
                      description={
                        // @ts-ignore
                        organisationError?.cause?.message ||
                        // @ts-ignore
                        projectError?.cause?.message
                      }
                    />
                  </div>
                ))}
              {projectStatus === 'success' && (
                <div className="route-result-list">
                  <Spin spinning={isLoading}>
                    <List
                      itemLayout="horizontal"
                      loadMore={LoadMore}
                      dataSource={dataSource}
                      renderItem={(item: TProjectResponseCommonExtended) => {
                        const to = `/orgs/${item._organizationLabel}/${item._label}`;
                        return (
                          <ProjectItem
                            {...{
                              to,
                              nexus,
                              toDelete: item._markedForDeletion,
                              title: item._label,
                              organization: item._organizationLabel,
                              deprected: item._deprecated,
                              createdAt: new Date(item._createdAt),
                              updatedAt: new Date(item._updatedAt),
                              description: item.description,
                            }}
                          />
                        );
                      }}
                    />
                  </Spin>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default OrganizationProjectsPage;
