import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, List, Input, Alert } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  NexusClient,
  ResourceList,
  Resource,
  PaginatedList,
} from '@bbp/nexus-sdk';
import { match as pmatch } from 'ts-pattern';
import {
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import * as pluralize from 'pluralize';
import {
  getOrgAndProjectFromProjectId,
  makeStudioUri,
} from '../../shared/utils';
import { RootState } from '../../shared/store/reducers';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import DeprecatedIcon from '../../shared/components/Icons/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import { updateStudioModalVisibility } from '../../shared/store/actions/modals';
import {
  LoadMoreFooter,
  TSort,
} from '../OrganizationsListPage/OrganizationListPage';
import timeago from '../../utils/timeago';
import '../../shared/styles/route-layout.less';


const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const STUDIO_RESULTS_DEFAULT_SIZE = 1000;

interface TPageOptions {
  sort: TSort;
}
export type StudioItem = {
  id: string;
  label: string;
  description?: string;
  workspaces?: string[];
  projectLabel: string;
  orgLabel: string;
};
type TStudiosOptions = {
  from?: number;
  size: number;
  sort: TSort;
  query?: string;
};
type TStudioItem = {
  to: string;
  title: string;
  project: string;
  deprected: boolean;
  description?: string;
  datasets?: string;
  createdAt: Date;
  access?: string;
};
type TFetchStudiosListProps = TStudiosOptions & {
  nexus: NexusClient;
  after?: string;
  orgLabel?: string, 
  projectLabel?: string,
};
type TNewPaginationList = PaginatedList & { _next: string };
export const sortBackgroundColor = (sort: TSort, value: TSort) =>
  sort === value ? '#003A8C' : '#BFBFBF';
const fetchStudios = async ({
  nexus,
  query,
  sort,
  size,
  after,
  orgLabel, 
  projectLabel
}: TFetchStudiosListProps) => {
  try {
    const response = await nexus.Resource.list(orgLabel, projectLabel, {
      after,
      q: query,
      size: size ?? STUDIO_RESULTS_DEFAULT_SIZE,
      deprecated: false,
      type: DEFAULT_STUDIO_TYPE,
      // sort: `${sort === 'asc' ? '' : '-'}label`,
    });
    return response;
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch studios', { cause: error });
  }
};

const StudioItem = ({
  title,
  to,
  description,
  deprected,
  project,
  datasets,
  createdAt,
  access,
}: TStudioItem) => {
  return (
    <List.Item className="route-result-list_item" role="routeitem-studio">
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
            <div>Project</div>
            <div>{project}</div>
          </div>
          {/* <div className="statistics_item">
            <div>Access</div>
            <div>{access}</div>
          </div>
          <div className="statistics_item">
            <div>Datasets</div>
            <div>{datasets || ''}</div>
          </div> */}
          <div className="statistics_item">
            <div>Created</div>
            <div>{timeago(createdAt)}</div>
          </div>
        </div>
        <div className="redirection">
          <Link to={to}>
            Open Studio
            <RightSquareOutlined />
          </Link>
        </div>
      </div>
    </List.Item>
  );
};
export const useInfiniteStudiosQuery = ({
  nexus,
  query,
  sort,
  orgLabel, 
  projectLabel
}: {
  nexus: NexusClient;
  query: string;
  sort: TSort;
  orgLabel?: string, 
  projectLabel?: string,
}) => {
  return useInfiniteQuery({
    queryKey: ['fusion-studios', { query, sort, orgLabel, projectLabel }],
    queryFn: ({ pageParam = undefined }) =>
      fetchStudios({ nexus, query, sort, orgLabel, projectLabel, after: pageParam, size: 10 }),
    getNextPageParam: lastPage =>
      (lastPage as TNewPaginationList)._next
        ? new URL((lastPage as TNewPaginationList)._next).searchParams.get(
          'after'
        )
        : undefined,
  });
};
const FusionStudiosPage: React.FC = () => {
  const nexus = useNexusContext();
  const dispatch = useDispatch();
  const { orgLabel, projectLabel } = useParams<{
    orgLabel: string, 
    projectLabel: string,
  }>();
  const loadMoreRef = React.useRef(null);
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const userAuthenticated = Boolean(authenticated) && Boolean(token);
  const dataContainerRef = React.useRef<HTMLDivElement>(null);
  const [query, setQueryString] = React.useState<string>('');
  const handleQueryStringChange: React.ChangeEventHandler<HTMLInputElement> = e =>
    setQueryString(e.target.value.toLowerCase());
  const [{ sort }, setOptions] = React.useReducer(
    (previous: TPageOptions, newPartialState: Partial<TPageOptions>) => ({
      ...previous,
      ...newPartialState,
    }),
    { sort: 'asc' }
  );
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
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteStudiosQuery({ nexus, query, sort, orgLabel, projectLabel });

  const LoadMore = (
    <LoadMoreFooter
      {...{ hasNextPage, fetchNextPage }}
      loading={isFetchingNextPage || isFetching || isLoading}
      ref={loadMoreRef}
    />
  );
  const total =
    data && data.pages
      ? ((data?.pages?.[0] as ResourceList<{}>)?._total as number)
      : 0;
  const dataSource =
    data && data.pages
      ? data?.pages
        .map(page =>
          (page as ResourceList<{}>)?._results.map((item: Resource) => {
            const { projectLabel, orgLabel } = getOrgAndProjectFromProjectId(
              item._project
            )!;
            return {
              orgLabel,
              projectLabel,
              id: item['@id'],
              label: item.label,
              deprecated: item._deprecated,
              createdAt: item._createdAt,
              description: item.description,
              access: '',
            };
          })
        )
        .flat()
      : [];

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage,
  });

  return (
    <React.Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title="Studios"
          extra={total ? `Total of ${total} ${pluralize('Studio', total)}` : ''}
          alt="hippocampus"
          bg={require('../../shared/images/neocortex.png')}
          permissions={['resources/write']}
          {... (userAuthenticated ? {
            createLabel: "Create Studio",
            onCreateClick: () => dispatch(updateStudioModalVisibility(true))
          } : {})}
        />
        <div className="route-body">
          <div className="route-body-container">
            <div className="route-actions">
              <div className="action-search">
                <Input.Search
                  allowClear
                  autoFocus
                  value={query}
                  onChange={handleQueryStringChange}
                  placeholder="Search studio"
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
                      message="⛔️ Error loading the studios list"
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
                      renderItem={item => {
                        const { orgLabel, projectLabel, id } = item;
                        const to = makeStudioUri(orgLabel, projectLabel, id);
                        return (
                          <StudioItem
                            {...{
                              to,
                              project: projectLabel,
                              title: item.label,
                              deprected: item.deprecated,
                              createdAt: new Date(item.createdAt),
                              description: item.description,
                              access: '',
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
    </React.Fragment>
  );
};

export default FusionStudiosPage;
