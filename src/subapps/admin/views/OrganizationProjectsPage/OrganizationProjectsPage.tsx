import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query'
import { Button, Modal, Drawer, Input, Spin, Alert } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { NexusClient, OrganizationList, OrgResponseCommon, ProjectResponseCommon } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { Avatar, Breadcrumb, List, Tag } from 'antd';
import { flatten } from 'lodash';
import { useOrganisationsSubappContext } from '../..';
import useNotification from '../../../../shared/hooks/useNotification';
import useIntersectionObserver from '../../../../shared/hooks/useIntersectionObserver';
import ProjectForm from '../../components/Projects/ProjectForm';
import QuotasContainer from '../../containers/QuotasContainer';
import StoragesContainer from '../../containers/StoragesContainer';
import './styles.less';


const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = false;

type NewOrg = {
  label: string;
  description?: string;
};

type Props = {}
type TOrganizationOptions = {
  orgLabel: string;
}
type TOrganizationProjectsOptions = {
  orgLabel: string;
  query: string;
  size: number;
  from: number;
}
type TFetchOrganizationListProps = TOrganizationOptions & { nexus: NexusClient };
type TFetchOrganizationProjectsListProps = TOrganizationProjectsOptions & { nexus: NexusClient };

const fetchOrganizationDetails = ({ nexus, orgLabel }: TFetchOrganizationListProps) => nexus.Organization.get(orgLabel);
const fetchOrganizationProjectsList = ({ nexus, query, orgLabel, size, from }: TFetchOrganizationProjectsListProps) => nexus.Project.list(orgLabel, {
  size, from,
  label: query,
  deprecated: SHOULD_INCLUDE_DEPRECATED,
});


function ProjectsView({ }: Props) {
  const queryInputRef = useRef<Input>(null);
  const loadMoreRef = useRef(null);
  const location = useLocation();
  const notification = useNotification();
  const [formBusy, setFormBusy] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
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

  const { data: organization, status, error: organisationError } = useQuery({
    enabled: !!orgLabel,
    queryKey: ['organization/projects', { orgLabel }],
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

  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => setQueryString(e.target.value);
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
    queryKey: ['fusion-projects', { query }],
    queryFn: ({ pageParam = 0 }) => fetchOrganizationProjectsList({
      nexus, query,
      orgLabel: orgLabel!,
      size: DEFAULT_PAGE_SIZE,
      from: pageParam
    }),
    //@ts-ignore
    getNextPageParam: (lastPage) => lastPage._next ? new URL(lastPage._next).searchParams.get('from') : undefined,
  });

  useIntersectionObserver({
      target: loadMoreRef,
      onIntersect: fetchNextPage,
      enabled: !!hasNextPage,
  });
  const loadMoreFooter = hasNextPage && (<Button
    className='org-projects-view-list-btn-infinitfetch'
    ref={loadMoreRef}
    loading={isFetching || isLoading}
    onClick={() => fetchNextPage()}
    disabled={!hasNextPage || isFetchingNextPage}
  >
    {isFetchingNextPage && <span>Fetching</span>}
    {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
  </Button>)
  const dataSource: ProjectResponseCommon[] = flatten(
    //@ts-ignore
    data?.pages.map(page => page._results)
  );

  useEffect(() => {
    setQueryString("");
    if (queryInputRef.current) {
      queryInputRef.current.focus({
        cursor: 'end',
      });
    }
  }, []);
  return (
    <Fragment>
      <div className='org-projects-view view-container'>
        {status === 'loading' && <Spin/>}
        {status === 'error' && <div className='org-projects-view-error'>
            <Alert
              type="error"
              message="⛔️ Error loading the organizations details"
              description={JSON.stringify(organisationError, null, 2)}
            />
            </div>}
        {status === 'success' && organization && <div className='org-projects-view-container'>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to={'/'}>Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to='/orgs'>Organazation List</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={location.pathname}>{orgLabel}</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className='org-projects-view-title'>
            <h2>{organization._label}</h2>
            <p>{organization.description}</p>
            <h3>Projects</h3>
          </div>
          <div className='org-projects-view-actions'>
            <Input.Search
              allowClear
              ref={queryInputRef}
              value={query}
              onChange={handleOnOrgSearch}
              placeholder='Search Organisation'
            />
            <AccessControl
              permissions={['projects/create']}
              path={`/${organization._label}`}
            >
              <Button className='org-projects-view-create-project' type="primary" onClick={() => setModalVisible(true)}>
                <PlusSquareOutlined
                  type="plus-square"
                  style={{ fontSize: '16px', color: 'white' }}
                />
                Create Project
              </Button>
            </AccessControl>
          </div>
          <div className='org-projects-view-list'>
            {projectStatus === 'error' && <div className='org-projects-view-error'>
                <Alert
                  type="error"
                  message="⛔️ Error loading the organizations projects list"
                  description={JSON.stringify(projectError, null, 2)}
                />
              </div>}
            <Spin spinning={isLoading}>
            {/* {projectStatus === 'success' && */}
                <List
                  itemLayout="horizontal"
                  loadMore={loadMoreFooter}
                  dataSource={dataSource}
                  renderItem={item => {
                    const to = `/orgs/${item._organizationLabel}/${item._label}`;
                    return (
                      <List.Item
                        className='organizations-view-list-item'
                        actions={[
                          <Link to={to}>
                            <Button type='link'>More</Button>
                          </Link>
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
              {/* } */}
            </Spin>
          </div>
        </div>}
      </div>
      <Modal
        title="New Project"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        confirmLoading={formBusy}
        footer={null}
        width={600}
      >
        <ProjectForm
          onSubmit={(p: ProjectResponseCommon) => saveAndCreate(p)}
          busy={formBusy}
        />
      </Modal>
      <Drawer
        width={750}
        visible={!!(selectedProject && selectedProject._label)}
        onClose={() => setSelectedProject(null)}
        title={`Project: ${selectedProject && selectedProject._label}`}
      >
        {selectedProject && (
          <>
            <AccessControl
              key="quotas-access-control"
              path={`/${selectedProject._organizationLabel}/${selectedProject._label}`}
              permissions={['quotas/read']}
            >
              <QuotasContainer
                orgLabel={selectedProject._organizationLabel}
                projectLabel={selectedProject._label}
              />
              <StoragesContainer
                orgLabel={selectedProject._organizationLabel}
                projectLabel={selectedProject._label}
              />
            </AccessControl>
            <h3>Project Settings</h3>
            <br />
            <ProjectForm
              project={{
                _label: selectedProject._label,
                _rev: selectedProject._rev,
                description: selectedProject.description || '',
                base: selectedProject.base,
                vocab: selectedProject.vocab,
                apiMappings: selectedProject.apiMappings,
              }}
              onSubmit={(p: ProjectResponseCommon) =>
                saveAndModify(selectedProject, p)
              }
              onDeprecate={() => saveAndDeprecate(selectedProject)}
              busy={formBusy}
              mode="edit"
            />
          </>
        )}
      </Drawer>
    </Fragment>
  )
}

export default ProjectsView;