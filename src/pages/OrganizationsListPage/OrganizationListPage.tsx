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
import clsx from 'clsx';
import {
  LoadingOutlined,
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  NexusClient,
  OrganizationList,
  OrgResponseCommon,
} from '@bbp/nexus-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import * as pluralize from 'pluralize';
import { match as pmatch } from 'ts-pattern';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import { RootState } from '../../shared/store/reducers';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import formatNumber from '../../utils/formatNumber';
import '../../shared/styles/route-layout.less';

const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = false;

export type TSort = 'asc' | 'desc' | undefined;
interface TPageOptions {
  sort: TSort;
}
type TNewOrganizationList = OrganizationList & { _next: string };
type TOrganizationOptions = {
  from: number;
  size: number;
  query: string;
  sort: TSort;
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
  sort: TSort;
}) => {
  return useInfiniteQuery({
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
            View organization
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
const OrganizationListView: React.FC<{}> = () => {
  const totalOrganizationRef = useRef<number>(0);
  const queryInputRef = useRef<InputRef>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const nexus: NexusClient = useNexusContext();
  const { layoutSettings } = useSelector((state: RootState) => state.config);
  const [query, setQueryString] = useState<string>('');
  const [{ sort }, setOptions] = useReducer(
    (previous: TPageOptions, newPartialState: Partial<TPageOptions>) => ({
      ...previous,
      ...newPartialState,
    }),
    { sort: 'asc' }
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
    isError,
  } = useInfiniteOrganizationQuery({
    nexus,
    query,
    sort,
  });
  const total =
    data && data.pages
      ? ((data.pages[0] as OrganizationList)?._total as number)
      : 0;
  if (!query.trim().length) {
    totalOrganizationRef.current = total;
  }
  const dataSource: OrgResponseCommon[] =
    data && data.pages
      ? data.pages.map(page => (page as OrganizationList)._results).flat()
      : [];
  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
    });
  };
  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = e =>
    setQueryString(e.target.value);
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
  const notDisplayActionHeader = !dataSource.length || isError;
  return (
    <Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title="Organizations"
          extra={
            total && !query ? (
              `Total of ${total} ${pluralize('Organization', total)}`
            ) : total && query ? (
              `Filtering ${total} of ${
                totalOrganizationRef.current
              }  ${pluralize('Organization', total)}`
            ) : isLoading ? (
              <LoadingOutlined />
            ) : (
              'No organizations found'
            )
          }
          alt="sscx"
          bg={
            layoutSettings.organizationImg ||
            require('../../shared/images/sscx-by-layers-v3.png')
          }
          createLabel="Create Organization"
          onCreateClick={() => updateCreateModelVisibility(true)}
          permissions={['organizations/create']}
          path={['/']}
        />
        <div className="route-body">
          <div className="route-body-container">
            <div
              className={clsx(
                'route-actions',
                notDisplayActionHeader && 'no-actions'
              )}
            >
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
