import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {  useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import { InputRef, Input, Spin, Alert, List, } from 'antd';
import {
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  NexusClient,
  ProjectList,
  ProjectResponseCommon,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { flatten } from 'lodash';
import { useDispatch } from 'react-redux';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import DeprecatedIcon from '../../shared/components/Icons/DepreactedIcon/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import timeago from '../../utils//timeago';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import { DATA_SET_TYPE } from '../ProjectsPage/ProjectsPage';
import formatNumber from '../../utils/formatNumber';

import '../../shared/styles/route-layout.less';

const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = false;

type NewOrg = {
  label: string;
  description?: string;
};

type Props = {};
type TOrganizationOptions = {
  orgLabel: string;
};
const TSort = ['asc', 'desc'] as const;
interface TPageOptions {
  sort: typeof TSort[number];
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
      deprecated: SHOULD_INCLUDE_DEPRECATED,
      sort: `${sort === 'asc' ? '' : '-'}_label`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch organization projects list', {
      cause: error,
    });
  }
};
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
            <div>{(datasets && formatNumber(datasets)) ?? '0'}</div>
          </div>
          <div className="statistics_item">
            <div>Your access</div>
            <div>{access}</div>
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
const OrganizationProjectsPage: React.FC<Props> = ({ }) => {
  const nexus = useNexusContext();
  const queryInputRef = useRef<InputRef>(null);
  const loadMoreRef = useRef(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [query, setQueryString] = useState<string>('');
  // const subapp = useAdminSubappContext();
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{ orgLabel: string }>(
    `/${subapp.namespace}/:orgLabel`
  );
  const orgLabel = match?.params.orgLabel;
  const [{ sort }, setOptions] = useReducer(
    // @ts-ignore
    (previous: TPageOptions, partialData: Partial<TPageOptions>) => ({
      ...previous,
      ...partialData,
    }),
    {
      sort: TSort[0],
    }
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
  } = useInfiniteQuery({
    enabled: !!orgLabel && !!organization?.['@id'],
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
  // @ts-ignore
  const total = data?.pages?.[0]?._total as number;
  const dataSource: ProjectResponseCommon[] = flatten(
    // @ts-ignore
    data?.pages.map(page => page._results)
  );
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
  const loadMoreFooter = hasNextPage && (
    <div
      className="infinitfetch-loader"
      ref={loadMoreRef}
      onClick={() => fetchNextPage()}
    >
      <Spin spinning={isFetchingNextPage || isFetching || isLoading} />
      <span>Loading more</span>
    </div>
  );
  return (
    <Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title="Projects"
          extra={total ? `Total of ${total} Projects` : ''}
          alt="hippocampus"
          bg={require('../../shared/images/projects-bg.png')}
          imgCss={{ width: '75.4%' }}
          createLabel="Create Project"
          onCreateClick={() => updateCreateModelVisibility(true)}
          permissions={['projects/create']}
        />
        <div className="route-body">
          <div className="route-body-container">
            <div className="route-actions">
              <div className="action-search">
                <Input.Search
                  allowClear
                  ref={queryInputRef}
                  value={query}
                  onChange={handleOnOrgSearch}
                  placeholder="Search Organisation"
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
                      loadMore={loadMoreFooter}
                      dataSource={dataSource}
                      renderItem={(item: ProjectResponseCommon) => {
                        const to = `/orgs/${item._organizationLabel}/${item._label}`;
                        return (
                          <ProjectItem
                            {...{
                              to,
                              nexus,
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
