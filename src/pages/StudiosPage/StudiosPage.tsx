import * as React from 'react';
import { useState, useRef, useReducer } from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, List, Input, Button, Alert } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { NexusClient, ResourceList, Resource } from '@bbp/nexus-sdk';
import { match as pmatch} from 'ts-pattern';
import { RightSquareOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { flatten } from 'lodash';
import {
  getOrgAndProjectFromProjectId,
  makeStudioUri,
} from '../../shared/utils';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import DeprecatedIcon from '../../shared/components/Icons/DepreactedIcon/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import timeago from '../../utils/timeago';
import '../../shared/styles/route-layout.less';


const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const STUDIO_RESULTS_DEFAULT_SIZE = 1000;

const TSort = ['asc', 'desc'] as const;
interface TPageOptions {
  sort: typeof TSort[number];
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
  from?: string;
  size: number;
  sort?: string;
  query?: string;
}
type TStudioItem = {
  to: string;
  title: string;
  project: string;
  deprected: boolean;
  description?: string;
  datasets?: string;
  createdAt: Date;
  access?: string;
}
type TFetchStudiosListProps = TStudiosOptions & { nexus: NexusClient };
export const sortBackgroundColor = (sort: string, value: string) => sort === value ? '#003A8C' : '#BFBFBF';
const fetchStudios = async (
  { nexus, query, sort, size, from, }:
    TFetchStudiosListProps
) => {
  try {
    const response = await nexus.Resource.list(undefined, undefined, {
      // @ts-ignore
      from,
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
}


const StudioItem = (
  { title, to, description, deprected, project, datasets, createdAt, access }:
  TStudioItem
) => {
  return (
      <List.Item className='route-result-list_item'>
          <div className='route-result-list_item_wrapper'>
              <div className='org'>
                  <Link to={to}>
                      <h3>{title} {deprected && <span className='depreacted-tag'><DeprecatedIcon /> deprecated</span>}</h3>
                  </Link>
                  <p>{description}</p>
              </div>
              <div className='statistics'>
                  <div className='statistics_item'>
                      <div>Project</div>
                      <div>{project}</div>
                  </div>
                  <div className='statistics_item'>
                      <div>Access</div>
                      <div>{access}</div>
                  </div>
                  <div className='statistics_item'>
                      <div>Datasets</div>
                      <div>{datasets || '2M'}</div>
                  </div>
                  <div className='statistics_item'>
                      <div>Created</div>
                      <div>{timeago(createdAt)}</div>
                  </div>
              </div>
              <div className='redirection'>
                  <Link to={to}>
                      Open Studio
                      <RightSquareOutlined />
                  </Link>
              </div>
          </div>
      </List.Item>
  )
}
const FusionStudiosPage: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const loadMoreRef = useRef(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const [studioList, setStudioList] = useState<StudioItem[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [query, setQueryString] = useState<string>('');
  const handleQueryStringChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setQueryString(e.target.value.toLowerCase());
  const [{ sort }, setOptions] = useReducer(
    // @ts-ignore
    (previous: TPageOptions, partialData: Partial<TPageOptions>) => ({
      ...previous,
      ...partialData
    }), {
    sort: TSort[0],
  });
  const handleUpdateSorting = (value: string) => {
    // @ts-ignore
    setOptions({ sort: value })
    if (dataContainerRef.current) {
      const containerTop = dataContainerRef.current.getBoundingClientRect().top;
      const topPosition = containerTop + window.pageYOffset - 80;
      window.scrollTo({
        top: topPosition,
        behavior: 'smooth',
      })
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
  } = useInfiniteQuery({
    queryKey: ['fusion-studios', { query, sort }],
    queryFn: ({ pageParam = undefined }) => fetchStudios({ nexus, query, sort, from: pageParam, size: 10 }),
    //@ts-ignore
    getNextPageParam: (lastPage) => lastPage._next ? new URL(lastPage._next).searchParams.get('after') : undefined
  });
  // @ts-ignore

  const loadMoreFooter = hasNextPage && (<Button
    className='infinitfetch-loader'
    ref={loadMoreRef}
    onClick={() => fetchNextPage()}
    disabled={!hasNextPage || isFetchingNextPage}
  >
    <Spin spinning={isFetchingNextPage || isFetching || isLoading} />
    {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
  </Button>)
  
  const dataSource = flatten(
    // @ts-ignore
    data?.pages.map((page: ResourceList<{}>) => page._results.map((item: Resource)=> {
      console.log('@@@item', item);
      const { projectLabel, orgLabel } = getOrgAndProjectFromProjectId(item._project)!;
      return {
        orgLabel,
        projectLabel,
        id: item['@id'],
        label: item.label,
        deprecated: item._deprecated,
        createdAt: item._createdAt,
        description: item.description,
        access: "",
      };
    }))
  );
  // @ts-ignore
  const _total = (data?.pages?.[0]?._total) as number;

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage,
  });
  return (
    <div className='main-route'>
      <PinnedMenu />
      <RouteHeader
        title='Studios'
        extra={_total ? `Total of ${_total} Studios` : ''}
        alt='hippocampus'
        bg={require('../../shared/images/studios-bg.png')}
        imgCss={{ width: '85.5%' }}
      />
      <div className='route-body'>
        <div className='route-body-container'>
          <div className='route-actions'>
            <div className='action-search'>
              <Input.Search
                allowClear
                value={query}
                onChange={handleQueryStringChange}
                placeholder='Search studios'
              />
            </div>
            <div className='action-sort'>
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
          <div className='route-data-container' ref={dataContainerRef}>
            {pmatch(status)
              .with('loading', () => <Spin spinning={true} />)
              .with('error', () => <div className='route-error'>
                <Alert
                  type='error'
                  message='⛔️ Error loading the studios list'
                  // @ts-ignore
                  description={error?.cause?.message}
                />
              </div>)
              .with('success', () => <div className='route-result-list'>
                <List
                  itemLayout="horizontal"
                  loadMore={loadMoreFooter}
                  dataSource={dataSource}
                  renderItem={(item) => {
                    const {orgLabel, projectLabel, id } = item;
                    const to = makeStudioUri( orgLabel, projectLabel, id );
                    return (
                      <StudioItem
                        {... {
                          to,
                          project: projectLabel,
                          title: item.label,
                          deprected: item.deprecated,
                          createdAt: new Date(item.createdAt),
                          description: item.description,
                          access: "",
                        }}
                      />
                    )
                  }}
                />
              </div>)
              .otherwise(() => <></>)
            }
          </div>
        </div>
      </div>
    </div>
    // <div className="view-container">
    //   <div className="global-studio-list">
    //     <div className={'studio-header'}>
    //       <h1>Studios</h1>
    //       <Input.Search
    //         className={'studio-search'}
    //         placeholder={'Type to filter'}
    //         value={query}
    //         onChange={handleQueryStringChange}
    //       ></Input.Search>
    //     </div>
    //     <div className={'studio-description'}>
    //       <p>
    //         You can see all the studios in Nexus projects where you have read
    //         access. The list is alphabetically sorted.
    //       </p>
    //     </div>

    //     {status === 'error' ? (
    //       <>A Error Occured</>
    //     ) : (
    //       <Spin
    //         spinning={status === 'loading'}
    //         size={'large'}
    //         style={{ display: 'flex' }}
    //         data-testid={'studio-spinner'}
    //       >
    //         <List
    //           pagination={{
    //             total: studioList.length,
    //             showTotal: total => ` ${total} results`,
    //             pageSize: 10,
    //           }}
    //           className={'studio-list'}
    //           dataSource={studioList}
    //           renderItem={item => {
    //             return (
    //               <List.Item
    //                 role="listitem"
    //                 onClick={() => {
    //                   const { orgLabel, projectLabel, id } = item;
    //                   const studioUri = makeStudioUri(
    //                     orgLabel,
    //                     projectLabel,
    //                     id
    //                   );
    //                   goToStudio(studioUri);
    //                 }}
    //                 className={'studio-list-item'}
    //               >
    //                 <div className={'studio'}>
    //                   {`${item.orgLabel}/${item.projectLabel}/`}
    //                   <span className={'studio-name'}>{item.label}</span>
    //                 </div>
    //               </List.Item>
    //             );
    //           }}
    //         ></List>
    //       </Spin>
    //     )}
    //   </div>
    // </div>
  );
};

export default FusionStudiosPage;
