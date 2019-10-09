import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button, Empty } from 'antd';
import { AccessControl } from '@bbp/react-nexus';
import { ProjectPayload, ProjectResponseCommon } from '@bbp/nexus-sdk';
import {
  Project,
  PaginatedList,
  PaginationSettings,
} from '@bbp/nexus-sdk-legacy';
import { RootState } from '../store/reducers';
import {
  modifyProject,
  createProject,
  deprecateProject,
  makeProjectPublic,
} from '../store/actions/project';
import ProjectList from '../containers/ProjectList';
import Skeleton from '../components/Skeleton';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import ListItem from '../components/List/Item';
import ProjectItem from '../components/Projects/ProjectItem';

interface ProjectsViewProps {
  activeOrg: { label: string; description?: string };
  paginatedProjects: PaginatedList<Project>;
  busy: boolean;
  match: any;
  fetchOrgData(orgLabel: string, paginationSettings?: PaginationSettings): void;
  createProject(
    orgLabel: string,
    projectLabel: string,
    payload: ProjectPayload
  ): Promise<Project>;
  modifyProject(
    orgLabel: string,
    projectLabel: string,
    rev: number,
    payload: ProjectPayload
  ): Promise<Project>;
  deprecateProject(
    orgLabel: string,
    projectLabel: string,
    rev: number
  ): Promise<void>;
  makeProjectPublic(orgLabel: string, projectLabel: string): Promise<void>;
  goTo(o: string, p: string): void;
}

const ProjectsView: React.FunctionComponent<ProjectsViewProps> = ({
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
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedProject, setSelectedProject] = React.useState<
    ProjectResponseCommon | undefined
  >(undefined);
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      (paginatedProjects.results.length === 0 && !busy)
    ) {
      fetchOrgData(match.params.org);
    }
  }, [match.path]);

  const saveAndCreate = (newProject: ProjectResponseCommon) => {
    setFormBusy(true);
    createProject(activeOrg.label, newProject._label, {
      base: newProject.base || undefined,
      vocab: newProject.vocab || undefined,
      description: newProject.description || '',
      apiMappings: newProject.apiMappings || undefined,
    })
      .then(
        () => {
          notification.success({
            message: 'Project created',
            duration: 2,
          });
          setFormBusy(false);
          goTo(activeOrg.label, newProject._label);
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

  const saveAndModify = (
    selectedProject: ProjectResponseCommon,
    newProject: ProjectResponseCommon
  ) => {
    setFormBusy(true);
    modifyProject(activeOrg.label, newProject._label, selectedProject._rev, {
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

  const saveAndDeprecate = (selectedProject: ProjectResponseCommon) => {
    setFormBusy(true);

    deprecateProject(
      selectedProject._organizationLabel,
      selectedProject._label,
      selectedProject._rev
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

  const makePublic = (selectedProject: ProjectResponseCommon) => {
    setFormBusy(true);
    makeProjectPublic(
      selectedProject._organizationLabel,
      selectedProject._label
    )
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
      <div style={{ flexGrow: 1, overflow: 'auto' }}>
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
                <ListItem
                  key={i['@id']}
                  onClick={() => goTo(i._organizationLabel, i._label)}
                  actions={[
                    <AccessControl
                      path={`/${i._organizationLabel}/${i._label}`}
                      permissions={['projects/write']}
                    >
                      <Button
                        className="edit-button"
                        size="small"
                        type="primary"
                        tabIndex={1}
                        onClick={(e: React.SyntheticEvent) => {
                          e.stopPropagation();
                          setSelectedProject(i);
                        }}
                      >
                        Edit
                      </Button>
                    </AccessControl>,
                  ]}
                >
                  <ProjectItem {...i} />
                </ListItem>
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
            onSubmit={(p: ProjectResponseCommon) => saveAndCreate(p)}
            busy={formBusy}
          />
        </Modal>
        <Drawer
          width={640}
          visible={!!(selectedProject && selectedProject._label)}
          onClose={() => setSelectedProject(undefined)}
          title={`Project: ${selectedProject && selectedProject._label}`}
        >
          {selectedProject && (
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
  createProject: (
    orgLabel: string,
    projectLabel: string,
    payload: ProjectPayload
  ) => dispatch(createProject(orgLabel, projectLabel, payload)),
  modifyProject: (
    orgLabel: string,
    projectLabel: string,
    rev: number,
    payload: ProjectPayload
  ) => dispatch(modifyProject(orgLabel, projectLabel, rev, payload)),
  deprecateProject: (orgLabel: string, projectLabel: string, rev: number) =>
    dispatch(deprecateProject(orgLabel, projectLabel, rev)),
  makeProjectPublic: (orgLabel: string, projectLabel: string) =>
    dispatch(makeProjectPublic(orgLabel, projectLabel)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsView);
