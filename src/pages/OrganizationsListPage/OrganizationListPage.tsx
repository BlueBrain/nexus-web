import React, {
  Fragment,
  forwardRef,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Alert, Input, Spin, List, InputRef } from 'antd';
import {
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  NexusClient,
  OrganizationList,
  OrgResponseCommon,
} from '@bbp/nexus-sdk';
import { useDispatch } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import * as pluralize from 'pluralize';
import { Partial, flatten } from 'lodash';
import { match as pmatch } from 'ts-pattern';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import formatNumber from '../../utils/formatNumber';
import '../../shared/styles/route-layout.less';

const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = false;

type NewOrg = {
  label: string;
  description?: string;
};

type Props = {};
const TSort = ['asc', 'desc'] as const;
interface TPageOptions {
  sort: typeof TSort[number];
}
type TNewOrganizationList = OrganizationList & { _next: string };
type TOrganizationOptions = {
  from: number;
  size: number;
  query: string;
  sort: string;
};
type TFetchOrganizationListProps = TOrganizationOptions & {
  nexus: NexusClient;
};
const fetchOrganizationList = async ({
  nexus,
  size,
  query,
  from = 0,
  sort,
}: TFetchOrganizationListProps) => {
  try {
    return await nexus.Organization.list({
      from,
      size,
      label: query,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
      sort: `${sort === 'asc' ? '' : '-'}_label`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch organization list', { cause: error });
  }
};
export const useInfiniteOrganizationQuery = ({
  nexus,
  query,
  sort,
}: {
  nexus: NexusClient;
  query: string;
  sort: string;
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
    queryKey: ['organizations', { query, sort }],
    queryFn: ({ pageParam = 0 }) =>
      fetchOrganizationList({
        nexus,
        query,
        sort,
        from: pageParam,
        size: DEFAULT_PAGE_SIZE,
      }),
    getNextPageParam: lastPage =>
      (lastPage as TNewOrganizationList)._next
        ? new URL((lastPage as TNewOrganizationList)._next).searchParams.get(
            'from'
          )
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
const OrganizationItem = ({
  title,
  to,
  description,
  nexus,
}: {
  title: string;
  to: string;
  description?: string;
  nexus: NexusClient;
}) => {
  const { data } = useQuery({
    queryKey: ['organization-projects', { orgLabel: title }],
    queryFn: () => nexus.Project.list(title),
  });
  return (
    <List.Item className="route-result-list_item" role="routeitem-org">
      <div className="route-result-list_item_wrapper">
        <div className="org">
          <Link to={to}>
            <h3>{title}</h3>
          </Link>
          <p>{description}</p>
        </div>
        <div className="statistics">
          <div className="statistics_item">
            <div>Projects</div>
            <div>{(data?._total && formatNumber(data._total)) ?? '0'}</div>
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

export const LoadMoreFooter = forwardRef<
  HTMLDivElement,
  { hasNextPage?: boolean; loading: boolean; fetchNextPage(): void }
>(({ hasNextPage, loading, fetchNextPage }, ref) =>
  hasNextPage ? (
    <div
      className="infinitfetch-loader"
      ref={ref}
      onClick={() => fetchNextPage()}
    >
      <Spin spinning={loading} />
      <span>Loading more</span>
    </div>
  ) : null
);

const OrganizationListView: React.FC<Props> = ({}) => {
  const queryInputRef = useRef<InputRef>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const nexus: NexusClient = useNexusContext();
  const [query, setQueryString] = useState<string>('');

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
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteOrganizationQuery({
    nexus,
    query,
    sort,
  });
  // @ts-ignore
  const total = data?.pages?.[0]?._total as number;
  const dataSource: OrgResponseCommon[] = flatten<OrgResponseCommon>(
    // @ts-ignore
    data?.pages?.map((page: OrganizationList) => page._results)
  );
  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
    });
  };
  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = e =>
    setQueryString(e.target.value);
  const handleUpdateSorting = (value: string) => {
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
          title="Organizations"
          extra={
            total ? `Total of ${total} ${pluralize('Project', total)}` : ''
          }
          alt="sscx"
          bg={require('../../shared/images/sscx-by-layers-v3.png')}
          createLabel="Create Orgnanization"
          onCreateClick={() => updateCreateModelVisibility(true)}
          permissions={['organizations/create']}
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
                  placeholder="Search Organization"
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
              {pmatch(status)
                .with('loading', () => <Spin spinning={true} />)
                .with('error', () => (
                  <div className="route-error">
                    <Alert
                      type="error"
                      message="⛔️ Error loading the organizations list"
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
                      renderItem={(item: OrgResponseCommon) => {
                        const to = `/orgs/${item._label}/`;
                        return (
                          <OrganizationItem
                            {...{
                              to,
                              nexus,
                              title: item._label,
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
    </Fragment>
  );
};

export default OrganizationListView;
