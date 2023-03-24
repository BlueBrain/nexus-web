import React, { Fragment, useRef } from 'react'
import { useInfiniteQuery } from 'react-query'
import { Link, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient, ProjectList, ProjectResponseCommon } from '@bbp/nexus-sdk';
import { Avatar, Breadcrumb, Button, Card, List, Skeleton, Spin, Tag } from 'antd';
import { flatten } from 'lodash';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import './ProjectsView.less';

type Props = {}
type TProjectOptions = {
    from: number;
    size: number;
}
type TFetchProjectListProps = TProjectOptions & { nexus: NexusClient };
const fetchProjectsList = ({ nexus, size, from = 0 }: TFetchProjectListProps) => nexus.Project.list(undefined, {
    size,
    from,
});

function ProjectView({ }: Props) {
    const loadMoreRef = useRef(null);
    const location = useLocation();
    const nexus: NexusClient = useNexusContext();
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
        queryKey: 'fusion-projects',
        queryFn: ({ pageParam = 0 }) => fetchProjectsList({ nexus, from: pageParam, size: 10 }),
        //@ts-ignore
        getNextPageParam: (lastPage) => lastPage._next ? new URL(lastPage._next).searchParams.get('from') : undefined,
    });

    // useIntersectionObserver({
    //     target: loadMoreRef,
    //     onIntersect: fetchNextPage,
    //     enabled: !!hasNextPage,
    // });
    const loadMoreFooter = hasNextPage && (<Button
        className='projects-view-list-btn-infinitfetch'
        ref={loadMoreRef}
        loading={isFetching || isLoading}
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
    >
        {isFetchingNextPage && <span>Fetching</span>}
        {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
    </Button>)

    const dataSource: ProjectResponseCommon[] = flatten<ProjectResponseCommon>(
        // @ts-ignore
        data?.pages?.map((page: ProjectList) => page._results)
    );
    return (
        <div className='projects-view view-container'>
            <div className='projects-view-title'>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to={'/'}>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={location.pathname}>Projects List</Link>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <h2>Projects List</h2>
            </div>
            <div>
                {status === 'error' && <div className='projects-view-error'>⛔️ Error loading the organizations list</div>}
                {status === 'success' && <div className='projects-view-list'>
                    <Spin spinning={isLoading} >
                        <List
                            itemLayout="horizontal"
                            loadMore={loadMoreFooter}
                            dataSource={dataSource}
                            renderItem={item => {
                                const to = `/orgs/${item._organizationLabel}/${item._label}`;
                                const orgTo = `/orgs/${item._organizationLabel}`;
                                return (
                                    <List.Item className='projects-view-list-item' actions={[<Button type='link' href={to}>More</Button>]} >
                                        <List.Item.Meta
                                            avatar={<Avatar className='project-initial'>{item._label.substring(0, 2)}</Avatar>}
                                            title={
                                                <Fragment>
                                                    <Tag color="#003A8C">
                                                        <Link to={orgTo}>
                                                            {item._organizationLabel}
                                                        </Link>
                                                    </Tag>
                                                    <Link to={to} className='project-link'>{item._label}</Link>
                                                </Fragment>
                                            }
                                            description={item.description}
                                        />
                                    </List.Item>
                                )
                            }}
                        />
                    </Spin>
                </div>}
            </div>
        </div>
    )
}

export default ProjectView;