import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  Button,
  Modal,
  Drawer,
  Input,
  Spin,
  Alert,
  Avatar,
  Breadcrumb,
  List,
  Tag,
} from 'antd';
import {
  PlusSquareOutlined,
  RightSquareOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  NexusClient,
  OrganizationList,
  OrgResponseCommon,
  ProjectList,
  ProjectResponseCommon,
} from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { flatten } from 'lodash';
import { useDispatch } from 'react-redux';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import { sortBackgroundColor } from '../StudiosPage/StudiosPage';
import DeprecatedIcon from '../../shared/components/Icons/DepreactedIcon/DeprecatedIcon';
import useNotification from '../../shared/hooks/useNotification';
import useIntersectionObserver from '../../shared/hooks/useIntersectionObserver';
import ProjectForm from '../../subapps/admin/components/Projects/ProjectForm';
import QuotasContainer from '../../subapps/admin/containers/QuotasContainer';
import StoragesContainer from '../../subapps/admin/containers/StoragesContainer';
import CreateProject from '../../shared/modals/CreateProject/CreateProject';
import PinnedMenu from '../../shared/PinnedMenu/PinnedMenu';
import RouteHeader from '../../shared/RouteHeader/RouteHeader';
import timeago from '../../utils//timeago';
import { ModalsActionsEnum } from '../../shared/store/actions/modals';

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
  datasets?: string;
  createdAt: Date;
  updatedAt: Date;
};
const ProjectItem = ({
  title,
  to,
  description,
  deprected,
  datasets,
  createdAt,
  updatedAt,
  access,
}: TProjectItem) => {
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
            <div>{datasets}</div>
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
const OrganizationProjectsPage: React.FC<Props> = ({}) => {
  const queryInputRef = useRef<Input>(null);
  const loadMoreRef = useRef(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const notification = useNotification();
  const [formBusy, setFormBusy] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const updateCreateModelVisibility = (payload?: boolean) => {
    dispatch({
      payload,
      type: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
    });
  };
  const [query, setQueryString] = useState<string>('');
  const [activeOrg, setActiveOrg] = useState<
    OrgResponseCommon | null | undefined
  >(null);
  const [
    selectedProject,
    setSelectedProject,
  ] = useState<ProjectResponseCommon | null>(null);

  const nexus = useNexusContext();
  const history = useHistory();
  // const subapp = useAdminSubappContext();
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{ orgLabel: string }>(
    `/${subapp.namespace}/:orgLabel`
  );
  const orgLabel = match?.params.orgLabel;
  const goTo = (org: string, project: string) =>
    history.push(`${org}/${project}`);
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

  const saveAndCreate = (newProject: ProjectResponseCommon) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.create(activeOrg._label, newProject._label, {
      base: newProject.base || undefined,
      vocab: newProject.vocab || undefined,
      description: newProject.description || '',
      apiMappings: newProject.apiMappings || undefined,
    })
      .then(() => {
        notification.success({
          message: 'Project created',
        });
        setFormBusy(false);
        goTo(activeOrg._label, newProject._label);
      })
      .catch(error => {
        setFormBusy(false);
        notification.error({
          message: 'Error creating project',
          description: error.reason || error.message,
        });
      });
  };

  const saveAndModify = (
    selectedProject: ProjectResponseCommon,
    newProject: ProjectResponseCommon
  ) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.update(
      activeOrg._label,
      newProject._label,
      selectedProject._rev,
      {
        base: newProject.base,
        vocab: newProject.vocab,
        description: newProject.description,
        apiMappings: newProject.apiMappings || [],
      }
    )
      .then(() => {
        notification.success({
          message: 'Project saved',
        });
        setFormBusy(false);
        setModalVisible(false);
        setSelectedProject(null);
        // TODO: reload porject
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  const saveAndDeprecate = (selectedProject: ProjectResponseCommon) => {
    setFormBusy(true);
    nexus.Project.deprecate(
      selectedProject._organizationLabel,
      selectedProject._label,
      selectedProject._rev
    )
      .then(
        () => {
          notification.success({
            message: 'Project successfully deprecated',
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(null);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT deprecated',
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

  const loadMoreFooter = hasNextPage && (
    <Button
      className="infinitfetch-loader"
      ref={loadMoreRef}
      onClick={() => fetchNextPage()}
      disabled={!hasNextPage || isFetchingNextPage}
    >
      <Spin spinning={isFetchingNextPage || isFetching || isLoading} />
      {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
    </Button>
  );
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
  // @ts-ignore
  const total = data?.pages?.[0]?._total as number;
  return (
    <Fragment>
      <div className="main-route">
        <PinnedMenu />
        <RouteHeader
          title="Projects"
          extra={total ? `Total of ${total} Projects` : ''}
          alt="hippocampus"
          bg={require('../../shared/images/projects-bg.png')}
          imgCss={{ width: '83%' }}
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
                  </Spin>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
    // <Fragment>
    //   <div className='org-projects-view view-container'>
    //     {status === 'loading' && <Spin/>}
    //     {status === 'error' && <div className='org-projects-view-error'>
    //         <Alert
    //           type="error"
    //           message="⛔️ Error loading the organizations details"
    //           description={JSON.stringify(organisationError, null, 2)}
    //         />
    //         </div>}
    //     {status === 'success' && organization && <div className='org-projects-view-container'>
    //       <Breadcrumb>
    //         <Breadcrumb.Item>
    //           <Link to={'/'}>Home</Link>
    //         </Breadcrumb.Item>
    //         <Breadcrumb.Item>
    //           <Link to='/orgs'>Organazation List</Link>
    //         </Breadcrumb.Item>
    //         <Breadcrumb.Item>
    //           <Link to={location.pathname}>{orgLabel}</Link>
    //         </Breadcrumb.Item>
    //       </Breadcrumb>
    //       <div className='org-projects-view-title'>
    //         <h2>{organization._label}</h2>
    //         <p>{organization.description}</p>
    //         <h3>Projects</h3>
    //       </div>
    //       <div className='org-projects-view-actions'>
    //         <Input.Search
    //           allowClear
    //           ref={queryInputRef}
    //           value={query}
    //           onChange={handleOnOrgSearch}
    //           placeholder='Search Organisation'
    //         />
    //         <AccessControl
    //           permissions={['projects/create']}
    //           path={`/${organization._label}`}
    //         >
    //           <Button className='org-projects-view-create-project' type="primary" onClick={() => setModalVisible(true)}>
    //             <PlusSquareOutlined
    //               type="plus-square"
    //               style={{ fontSize: '16px', color: 'white' }}
    //             />
    //             Create Project
    //           </Button>
    //         </AccessControl>
    //       </div>
    //       <div className='org-projects-view-list'>
    //         {projectStatus === 'error' && <div className='org-projects-view-error'>
    //             <Alert
    //               type="error"
    //               message="⛔️ Error loading the organizations projects list"
    //               description={JSON.stringify(projectError, null, 2)}
    //             />
    //           </div>}
    //         <Spin spinning={isLoading}>
    //         {/* {projectStatus === 'success' && */}
    //             <List
    //               itemLayout="horizontal"
    //               loadMore={loadMoreFooter}
    //               dataSource={dataSource}
    //               renderItem={item => {
    //                 const to = `/orgs/${item._organizationLabel}/${item._label}`;
    //                 return (
    //                   <List.Item
    //                     className='organizations-view-list-item'
    //                     actions={[
    //                       <Link to={to}>
    //                         <Button type='link'>More</Button>
    //                       </Link>
    //                     ]}
    //                   >
    //                     <List.Item.Meta
    //                       avatar={<Avatar className='organization-initial'>{item._label.substring(0, 2)}</Avatar>}
    //                       title={
    //                         <Fragment>
    //                           <Link to={to} className='organization-link'>{item._label}</Link>
    //                         </Fragment>
    //                       }
    //                       description={item.description}
    //                     />
    //                   </List.Item>
    //                 )
    //               }}
    //             />
    //           {/* } */}
    //         </Spin>
    //       </div>
    //     </div>}
    //   </div>
    //   <Modal
    //     title="New Project"
    //     visible={modalVisible}
    //     onCancel={() => setModalVisible(false)}
    //     confirmLoading={formBusy}
    //     footer={null}
    //     width={600}
    //   >
    //     <ProjectForm
    //       onSubmit={(p: ProjectResponseCommon) => saveAndCreate(p)}
    //       busy={formBusy}
    //     />
    //   </Modal>
    //   <Drawer
    //     width={750}
    //     visible={!!(selectedProject && selectedProject._label)}
    //     onClose={() => setSelectedProject(null)}
    //     title={`Project: ${selectedProject && selectedProject._label}`}
    //   >
    //     {selectedProject && (
    //       <>
    //         <AccessControl
    //           key="quotas-access-control"
    //           path={`/${selectedProject._organizationLabel}/${selectedProject._label}`}
    //           permissions={['quotas/read']}
    //         >
    //           <QuotasContainer
    //             orgLabel={selectedProject._organizationLabel}
    //             projectLabel={selectedProject._label}
    //           />
    //           <StoragesContainer
    //             orgLabel={selectedProject._organizationLabel}
    //             projectLabel={selectedProject._label}
    //           />
    //         </AccessControl>
    //         <h3>Project Settings</h3>
    //         <br />
    //         <ProjectForm
    //           project={{
    //             _label: selectedProject._label,
    //             _rev: selectedProject._rev,
    //             description: selectedProject.description || '',
    //             base: selectedProject.base,
    //             vocab: selectedProject.vocab,
    //             apiMappings: selectedProject.apiMappings,
    //           }}
    //           onSubmit={(p: ProjectResponseCommon) =>
    //             saveAndModify(selectedProject, p)
    //           }
    //           onDeprecate={() => saveAndDeprecate(selectedProject)}
    //           busy={formBusy}
    //           mode="edit"
    //         />
    //       </>
    //     )}
    //   </Drawer>
    // </Fragment>
  );
};

export default OrganizationProjectsPage;
