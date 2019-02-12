import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button, Empty } from 'antd';
import { Project, PaginatedList, PaginationSettings } from '@bbp/nexus-sdk';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';
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
import Helmet from 'react-helmet';

const DISPLAY_PER_PAGE = 10;

interface HomeProps {
  activeOrg: { label: string; description?: string };
  paginatedProjects: PaginatedList<Project>;
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
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedProject, setSelectedProject] = React.useState<
    Project | undefined
  >(undefined);
  React.useEffect(
    () => {
      if (
        activeOrg.label !== match.params.org ||
        (paginatedProjects.results.length === 0 && !busy)
      ) {
        fetchOrgData(match.params.org);
      }
    },
    [match.path]
  );

  const saveAndCreate = (newProject: Project) => {
    setFormBusy(true);
    createProject(activeOrg.label, newProject.label, {
      base: newProject.base || undefined,
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
    <>
      <Helmet>
        <title>{activeOrg.label}</title>
        <meta name="description" content={activeOrg.description} />
      </Helmet>
      <h1 style={{ marginBottom: 0, marginRight: 8 }}>{activeOrg.label}</h1>
      {activeOrg.description && <p>{activeOrg.description}</p>}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ marginBottom: 0, marginRight: 8 }}>Projects</h2>
        <Button
          type="primary"
          onClick={() => setModalVisible(true)}
          icon="plus-square"
        >
          Create Project
        </Button>
      </div>
      {paginatedProjects.total === 0 ? (
        <Empty description="No projects" />
      ) : (
        <ProjectList
          projects={paginatedProjects.results}
          onProjectClick={(projectLabel: string) =>
            goTo(activeOrg.label, projectLabel)
          }
          onProjectEdit={(projectLabel: string) =>
            setSelectedProject(
              paginatedProjects.results.filter(p => p.label === projectLabel)[0]
            )
          }
          paginationSettings={{
            total: paginatedProjects.total,
            from: paginatedProjects.index,
            pageSize: DISPLAY_PER_PAGE,
          }}
          onPaginationChange={(pageNumber: number) =>
            fetchOrgData(match.params.org, {
              from: DISPLAY_PER_PAGE * pageNumber - DISPLAY_PER_PAGE,
              size: DISPLAY_PER_PAGE,
            })
          }
          busy={busy}
        />
      )}
      <Modal
        title="New Project"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        confirmLoading={formBusy}
        footer={null}
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
    </>
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
