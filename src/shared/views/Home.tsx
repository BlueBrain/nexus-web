import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button, Empty } from 'antd';
import { AccessControl } from '@bbp/react-nexus';
import {
  Project,
  PaginatedList,
  PaginationSettings,
} from '@bbp/nexus-sdk-legacy';
import { CreateProjectPayload } from '@bbp/nexus-sdk-legacy/lib/Project/types';
import { RootState } from '../store/reducers';
import {
  modifyProject,
  createProject,
  deprecateProject,
  makeProjectPublic,
} from '../store/actions/project';
import ProjectList from '../components/Projects/ProjectList';
import Skeleton from '../components/Skeleton';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import RecentlyVisited from '../components/RecentlyVisited';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import ProjectItem from '../components/Projects/ProjectItem';

interface HomeProps {
  activeOrg: { label: string; description?: string };
  paginatedProjects: PaginatedList<Project>;
  displayPerPage: number;
  busy: boolean;
  match: any;
  fetchOrgData(orgLabel: string, paginationSettings?: PaginationSettings): void;
  createProject(
    orgLabel: string,
    projectLabel: string,
    payload: CreateProjectPayload
  ): Promise<Project>;
  modifyProject(
    orgLabel: string,
    projectLabel: string,
    rev: number,
    payload: CreateProjectPayload
  ): Promise<Project>;
  deprecateProject(
    orgLabel: string,
    projectLabel: string,
    rev: number
  ): Promise<void>;
  makeProjectPublic(orgLabel: string, projectLabel: string): Promise<void>;
  goTo(o: string, p: string): void;
  goToProject(Project: Project): void;
}

const Home: React.FunctionComponent<HomeProps> = ({
  busy,
  paginatedProjects,
  match,
  activeOrg,
  fetchOrgData,
  goTo,
  createProject,
  modifyProject,
  deprecateProject,
  makeProjectPublic,
  displayPerPage,
  goToProject,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedProject, setSelectedProject] = React.useState<
    Project | undefined
  >(undefined);
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      (paginatedProjects.results.length === 0 && !busy)
    ) {
      fetchOrgData(match.params.org);
    }
  }, [match.path]);

  const saveAndCreate = (newProject: Project) => {
    setFormBusy(true);
    createProject(activeOrg.label, newProject.label, {
      base: newProject.base || undefined,
      vocab: newProject.vocab || undefined,
      description: newProject.description || '',
      apiMappings:
        newProject.apiMappings.length === 0
          ? undefined
          : newProject.apiMappings,
    })
      .then(
        () => {
          notification.success({
            message: 'Project created',
            duration: 2,
          });
          setFormBusy(false);
          goTo(activeOrg.label, newProject.label);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT created',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndModify = (selectedProject: Project, newProject: Project) => {
    setFormBusy(true);
    modifyProject(activeOrg.label, newProject.label, selectedProject.rev, {
      base: newProject.base,
      vocab: newProject.vocab,
      description: newProject.description,
      apiMappings: newProject.apiMappings || [],
    })
      .then(
        () => {
          notification.success({
            message: 'Project saved',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(undefined);

          fetchOrgData(match.params.org);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT saved',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndDeprecate = (selectedProject: Project) => {
    setFormBusy(true);

    deprecateProject(
      selectedProject.orgLabel,
      selectedProject.label,
      selectedProject.rev
    )
      .then(
        () => {
          notification.success({
            message: 'Project successfully deprecated',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(undefined);

          fetchOrgData(match.params.org);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT deprecated',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const makePublic = (selectedProject: Project) => {
    setFormBusy(true);
    makeProjectPublic(selectedProject.orgLabel, selectedProject.label)
      .then(
        () => {
          notification.success({
            message: 'Project is now publicly accessible',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(undefined);

          fetchOrgData(match.params.org);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT made public',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  if (busy) {
    return (
      <Skeleton
        itemNumber={5}
        active
        avatar
        paragraph={{
          rows: 1,
          width: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }

  return (
    <div className="projects-view view-container">
      <RecentlyVisited visitProject={goToProject} />
      <div style={{ flexGrow: 1 }}>
        <h1 style={{ marginBottom: 0, marginRight: 8 }}>{activeOrg.label}</h1>
        {activeOrg.description && <p>{activeOrg.description}</p>}
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}
        >
          <h2 style={{ marginBottom: 0, marginRight: 8 }}>Projects</h2>
          <AccessControl
            permissions={['projects/create']}
            path={`/${activeOrg.label}`}
          >
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              icon="plus-square"
            >
              Create Project
            </Button>
          </AccessControl>
        </div>
        {paginatedProjects.total === 0 ? (
          <Empty description="No projects" />
        ) : (
          <ProjectList orgLabel={activeOrg.label}>
            {({ items }: { items: ProjectResponseCommon[] }) =>
              items.map(i => (
                <ProjectItem label={i._label} orgLabel={i._organizationLabel} />
              ))
            }
          </ProjectList>
        )}
        <Modal
          title="New Project"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          confirmLoading={formBusy}
          footer={null}
          width={600}
        >
          <ProjectForm
            onSubmit={(p: Project) => saveAndCreate(p)}
            busy={formBusy}
          />
        </Modal>
        <Drawer
          width={640}
          visible={!!(selectedProject && selectedProject.label)}
          onClose={() => setSelectedProject(undefined)}
          title={`Project: ${selectedProject && selectedProject.label}`}
        >
          {selectedProject && (
            <ProjectForm
              project={{
                label: selectedProject.label,
                rev: selectedProject.rev,
                description: selectedProject.description || '',
                base: selectedProject.base,
                vocab: selectedProject.vocab,
                apiMappings: selectedProject.apiMappings,
              }}
              onSubmit={(p: Project) => saveAndModify(selectedProject, p)}
              onDeprecate={() => saveAndDeprecate(selectedProject)}
              onMakePublic={() => makePublic(selectedProject)}
              busy={formBusy}
              mode="edit"
            />
          )}
        </Drawer>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  displayPerPage: state.uiSettings.pageSizes.projectsListPageSize,
  activeOrg: (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.data &&
    state.nexus.activeOrg.data.org) || { label: '' },
  paginatedProjects: (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.data &&
    state.nexus.activeOrg.data.projects) || { results: [], total: 0, index: 0 },
  busy:
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.isFetching) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrgData: (orgLabel: string, paginationSettings?: PaginationSettings) =>
    dispatch(fetchOrg(orgLabel, paginationSettings)),
  goTo: (org: string, project: string) => dispatch(push(`/${org}/${project}`)),
  goToProject: (project: Project) =>
    dispatch(push(`/${project.orgLabel}/${project.label}`)),
  createProject: (
    orgLabel: string,
    projectLabel: string,
    payload: CreateProjectPayload
  ) => dispatch(createProject(orgLabel, projectLabel, payload)),
  modifyProject: (
    orgLabel: string,
    projectLabel: string,
    rev: number,
    payload: CreateProjectPayload
  ) => dispatch(modifyProject(orgLabel, projectLabel, rev, payload)),
  deprecateProject: (orgLabel: string, projectLabel: string, rev: number) =>
    dispatch(deprecateProject(orgLabel, projectLabel, rev)),
  makeProjectPublic: (orgLabel: string, projectLabel: string) =>
    dispatch(makeProjectPublic(orgLabel, projectLabel)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
