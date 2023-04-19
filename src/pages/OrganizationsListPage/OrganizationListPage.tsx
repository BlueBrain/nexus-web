import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { Alert, Input, Spin, List } from 'antd';
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
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { Partial, flatten } from 'lodash';
import { match as pmatch } from 'ts-pattern';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';
import useNotification from '../../shared/hooks/useNotification';
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
    <List.Item className="route-result-list_item">
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
const OrganizationListView: React.FC<Props> = ({}) => {
  const queryInputRef = useRef<Input>(null);
  const loadMoreRef = useRef(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const [formBusy, setFormBusy] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
    });
  };
  const [selectedOrg, setSelectedOrg] = useState<OrgResponseCommon | undefined>(
    undefined
  );
  const history = useHistory();
  const subapp = useOrganisationsSubappContext();
  const goTo = (org: string) => history.push(`/${subapp.namespace}/${org}`);
  const notification = useNotification();
  const nexus: NexusClient = useNexusContext();
  const [query, setQueryString] = useState<string>('');
  const queryClient = useQueryClient();

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

  const dataSource: OrgResponseCommon[] = flatten<OrgResponseCommon>(
    // @ts-ignore
    data?.pages?.map((page: OrganizationList) => page._results)
  );
  const saveAndModify = (selectedOrg: OrgResponseCommon, newOrg: NewOrg) => {
    setFormBusy(true);
    nexus.Organization.update(newOrg.label, selectedOrg._rev, {
      description: newOrg.description,
    })
      .then(
        () => {
          notification.success({
            message: 'Organization saved',
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
          queryClient.invalidateQueries({
            queryKey: ['fusion-projects', { query }],
          });
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT saved',
            description: action?.error?.message,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  const saveAndDeprecate = (selectedOrg: OrgResponseCommon) => {
    setFormBusy(true);

    nexus.Organization.deprecate(selectedOrg._label, selectedOrg._rev)
      .then(() => {
        notification.success({
          message: 'Organization deprecated',
        });
        setFormBusy(false);
        setModalVisible(false);
        setSelectedOrg(undefined);
        queryClient.invalidateQueries({
          queryKey: ['fusion-projects', { query }],
        });
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
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
  // @ts-ignore
  const total = data?.pages?.[0]?._total as number;
  return (
    <Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title="Organizations"
          extra={total ? `Total of ${total} Projects` : ''}
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
                  ref={queryInputRef}
                  value={query}
                  onChange={handleOnOrgSearch}
                  placeholder="Search Organisation"
                  className=""
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
                      loadMore={loadMoreFooter}
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
        {/* <div className='organizations-view view-container'>
			<Breadcrumb>
			<Breadcrumb.Item>
				<Link to={'/'}>Home</Link>
			</Breadcrumb.Item>
			<Breadcrumb.Item>
				<Link to={location.pathname}>Organisations List</Link>
			</Breadcrumb.Item>
			</Breadcrumb>
			<div className='organizations-view-title'>
			<h2>Organisations List</h2>
			</div>
			<div className='organizations-view-actions'>
			<Input.Search 
				allowClear
				ref={queryInputRef} 
				value={query} 
				onChange={handleOnOrgSearch}
				placeholder='Search Organisation'
			/>
			<AccessControl permissions={['organizations/create']} path="/">
				<Button className='organizations-view-create-org' type="primary" onClick={() => setModalVisible(true)}>
				<PlusSquareOutlined
					style={{ fontSize: '16px', color: 'white' }}
				/>
				Create Organization
				</Button>
			</AccessControl>
			</div>
			<Fragment>
			{status === 'error' && <div className='organizations-view-error'>⛔️ Error loading the organizations list</div>}
			{status === 'success' && <div className='organizations-view-list'>
				<Spin spinning={isLoading} >
				<List
					itemLayout="horizontal"
					loadMore={loadMoreFooter}
					dataSource={dataSource}
					renderItem={item => {
					const to = `/orgs/${item._label}/`;
					return (
						<List.Item
						className='organizations-view-list-item'
						actions={[
							<Link to={to}>
							<Button type='link'>More</Button>
							</Link>,
							<AccessControl
							key={`access-control-${item['@id']}`}
							path={`/${item._label}`}
							permissions={['organizations/write']}
							>
							<Button
								className="edit-button"
								type="primary"
								size="small"
								tabIndex={1}
								onClick={(e: React.SyntheticEvent) => {
								e.stopPropagation();
								setSelectedOrg(item);
								}}
							>
								Edit
							</Button>
							</AccessControl>
						]}
						>
						<List.Item.Meta
							avatar={<Avatar className='organization-initial'>{item._label.substring(0, 2)}</Avatar>}
							title={
							<Fragment>
								<Link to={to} className='organization-link'>{item._label}</Link>
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
			</Fragment>
		</div>
		<Modal
			title="New Organization"
			visible={modalVisible}
			onCancel={() => setModalVisible(false)}
			confirmLoading={formBusy}
			footer={null}
		>
			<OrgForm onSubmit={(o: NewOrg) => saveAndCreate(o)} busy={formBusy} />
		</Modal>
		<Drawer
			width={640}
			visible={!!(selectedOrg && selectedOrg._label)}
			onClose={() => setSelectedOrg(undefined)}
			title={selectedOrg && selectedOrg._label}
		>
			{selectedOrg && (
			<OrgForm
				org={{
				label: selectedOrg._label,
				description: selectedOrg.description,
				isDeprecated: selectedOrg._deprecated,
				}}
				onSubmit={(o: NewOrg) => saveAndModify(selectedOrg, o)}
				onDeprecate={() => saveAndDeprecate(selectedOrg)}
				busy={formBusy}
				mode="edit"
			/>
			)}
		</Drawer> */}
      </div>
    </Fragment>
  );
};

export default OrganizationListView;
