import React, { Fragment, useReducer, useRef, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { Link, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { RightSquareOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { NexusClient, ProjectList, ProjectResponseCommon } from '@bbp/nexus-sdk';
import { Alert, Avatar, Breadcrumb, Button, Card, Input, List, Skeleton, Spin, Tag } from 'antd';
import { flatten } from 'lodash';
import DeprecatedIcon from '../../shared/components/Icons/DepreactedIcon/DeprecatedIcon';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import timeago from '../../utils//timeago';
import './styles.less';

type Props = {}
type TProjectOptions = {
    from: number;
    size: number;
    sort?: string;
    query?: string;
}
type TFetchProjectListProps = TProjectOptions & { nexus: NexusClient };
const fetchProjectsList = async (
    { nexus, query, size, from = 0, sort }:
        TFetchProjectListProps
) => {
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
}

const TSort = ['asc', 'desc'] as const;
interface TPageOptions {
    sort: typeof TSort[number];
}
type TProjectItem = {
    title: string;
    to: string;
    deprected: boolean;
    description?: string;
    datasets?: string;
    createdAt: Date;
    updatedAt: Date;
    access?: string;
}
const ProjectItem = (
    { title, to, description, deprected, datasets, createdAt, updatedAt, access }:
        TProjectItem
) => {
    return (
        <List.Item className='route-result-list_item'>
            <div className='route-result-list_item_wrapper'>
                <div className='org'>
                    <Link to={to}>
                        <h3>{title} { deprected && <span className='depreacted-tag'><DeprecatedIcon/> deprecated</span> }</h3>
                    </Link>
                    <p>{description}</p>
                </div>
                <div className='statistics'>
                    <div className='statistics_item'>
                        <div>Datasets</div>
                        <div>{datasets || '2M'}</div>
                    </div>
                    <div className='statistics_item'>
                        <div>Your access</div>
                        <div>{access || 'Read Write'}</div>
                    </div>
                    <div className='statistics_item'>
                        <div>Created</div>
                        <div>{timeago(createdAt)}</div>
                    </div>
                    <div className='statistics_item'>
                        <div>Last update</div>
                        <div>{timeago(updatedAt)}</div>
                    </div>
                </div>
                <div className='redirection'>
                    <Link to={to}>
                        View organization projects
                        <RightSquareOutlined />
                    </Link>
                </div>
            </div>
        </List.Item>
    )
}

function ProjectView({ }: Props) {
    const queryInputRef = useRef<Input>(null);
    const loadMoreRef = useRef(null);
    const location = useLocation();
    const [query, setQueryString] = useState<string>('');
    const nexus: NexusClient = useNexusContext();
    const [{ sort }, setOptions] = useReducer(
        // @ts-ignore
        (previous: TPageOptions, partialData: Partial<TPageOptions>) => ({
            ...previous,
            ...partialData
        }), {
        sort: TSort[0],
    });
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
        queryFn: ({ pageParam = 0 }) => fetchProjectsList({ nexus, query, sort, from: pageParam, size: 10 }),
        //@ts-ignore
        getNextPageParam: (lastPage) => lastPage._next ? new URL(lastPage._next).searchParams.get('from') : undefined,
    });


    const loadMoreFooter = hasNextPage && (<Button
        className='projects-view-list-btn-infinitfetch'
        ref={loadMoreRef}
        loading={isFetching || isLoading}
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
    >
        <Spin spinning={isFetchingNextPage || isFetching || isLoading} />
        {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
    </Button>)

    const dataSource: ProjectResponseCommon[] = flatten<ProjectResponseCommon>(
        // @ts-ignore
        data?.pages?.map((page: ProjectList) => page._results)
    );

    // @ts-ignore
    const handleUpdateSorting = (value: string) => setOptions({ sort: value });
    const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => setQueryString(e.target.value);

    useIntersectionObserver({
        target: loadMoreRef,
        onIntersect: fetchNextPage,
        enabled: !!hasNextPage,
    });
    // @ts-ignore
    const _total = (data?.pages?.[0]?._total) as number;
    console.log('@@@dta', data);
    return (
        <div className='main-route'>
            <PinnedMenu />
            <RouteHeader
                title='Projects'
                extra={_total ? `Total of ${_total} Projects` : ''}
                alt='hippocampus'
                bg={require('../../shared/images/projects-bg.png')}
                imgCss={{ width: '83%' }}
            />
            <div className='route-body'>
                <div className='route-body-container'>
                    <div className='route-actions'>
                        <div className='action-search'>
                            <Input.Search
                                allowClear
                                ref={queryInputRef}
                                value={query}
                                onChange={handleOnOrgSearch}
                                placeholder='Search Project'
                            />
                        </div>
                        <div className='action-sort'>
                            <span>Sort:</span>
                            <SortAscendingOutlined
                                style={{ backgroundColor: sort === 'asc' ? '#003A8C' : '#BFBFBF' }}
                                onClick={() => handleUpdateSorting('asc')}
                            />
                            <SortDescendingOutlined
                                style={{ backgroundColor: sort === 'desc' ? '#003A8C' : '#BFBFBF' }}
                                onClick={() => handleUpdateSorting('desc')}
                            />
                        </div>
                    </div>
                    <div className='route-data-container'>
                        {status === 'error' && <div className='route-error'>
                            <Alert
                                message='⛔️ Error loading the projects list'
                                // @ts-ignore
                                description={error.message.reason}
                            />
                        </div>}
                        {status === 'success' && <div className='route-result-list'>
                            <Spin spinning={isLoading} >
                                <List
                                    itemLayout="horizontal"
                                    loadMore={loadMoreFooter}
                                    dataSource={dataSource}
                                    renderItem={(item: ProjectResponseCommon) => {
                                        const to = `/orgs/${item._organizationLabel}/${item._label}`;
                                        return (
                                            <ProjectItem
                                                {... { 
                                                    to, 
                                                    title: item._label, 
                                                    deprected: item._deprecated,
                                                    createdAt: new Date(item._createdAt),
                                                    updatedAt: new Date(item._updatedAt),
                                                    description: item.description, 
                                                 }}
                                            />
                                        )
                                    }}
                                />
                            </Spin>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        // <div className='projects-view view-container'>
        //     <div className='projects-view-title'>
        //         <Breadcrumb>
        //             <Breadcrumb.Item>
        //                 <Link to={'/'}>Home</Link>
        //             </Breadcrumb.Item>
        //             <Breadcrumb.Item>
        //                 <Link to={location.pathname}>Projects List</Link>
        //             </Breadcrumb.Item>
        //         </Breadcrumb>
        //         <h2>Projects List</h2>
        //     </div>
        //     <div>
        //         {status === 'error' && <div className='projects-view-error'>⛔️ Error loading the organizations list</div>}
        //         {status === 'success' && <div className='projects-view-list'>
        //             <Spin spinning={isLoading} >
        //                 <List
        //                     itemLayout="horizontal"
        //                     loadMore={loadMoreFooter}
        //                     dataSource={dataSource}
        //                     renderItem={item => {
        //                         const to = `/orgs/${item._organizationLabel}/${item._label}`;
        //                         const orgTo = `/orgs/${item._organizationLabel}`;
        //                         return (
        //                             <List.Item className='projects-view-list-item' actions={[<Button type='link' href={to}>More</Button>]} >
        //                                 <List.Item.Meta
        //                                     avatar={<Avatar className='project-initial'>{item._label.substring(0, 2)}</Avatar>}
        //                                     title={
        //                                         <Fragment>
        //                                             <Tag color="#003A8C">
        //                                                 <Link to={orgTo}>
        //                                                     {item._organizationLabel}
        //                                                 </Link>
        //                                             </Tag>
        //                                             <Link to={to} className='project-link'>{item._label}</Link>
        //                                         </Fragment>
        //                                     }
        //                                     description={item.description}
        //                                 />
        //                             </List.Item>
        //                         )
        //                     }}
        //                 />
        //             </Spin>
        //         </div>}
        //     </div>
        // </div>
    )
}

export default ProjectView;