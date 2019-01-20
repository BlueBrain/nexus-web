import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button } from 'antd';
import { Project } from '@bbp/nexus-sdk';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';
import { RootState } from '../store/reducers';
import { fetchProjects } from '../store/actions/nexus';
import {
  modifyProject,
  createProject,
  deprecateProject,
} from '../store/actions/project';
import ProjectList from '../components/Projects/ProjectList';
import Skeleton from '../components/Skeleton';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';
import { fetchOrg } from '../store/actions/nexus/activeOrg';

interface HomeProps {
  activeOrg: { label: string };
  projects: Project[];
  busy: boolean;
  match: any;
  fetchOrgData(orgLabel: string): void;
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
  goTo(o: string, p: string): void;
}

const Home: React.FunctionComponent<HomeProps> = ({
  busy,
  projects,
  match,
  activeOrg,
  fetchOrgData,
  goTo,
  createProject,
  modifyProject,
  deprecateProject,
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
        (projects.length === 0 && !busy)
      ) {
        fetchOrgData(match.params.org);
      }
    },
    [match.path]
  );

  const saveAndCreate = (newProject: Project) => {
    setFormBusy(true);
    createProject(activeOrg.label, newProject.label, {
      name: newProject.name,
      base: newProject.base || undefined,
      prefixMappings:
        newProject.prefixMappings.length === 0
          ? undefined
          : newProject.prefixMappings,
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
            message: 'Project NOT create',
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
    modifyProject(activeOrg.label, newProject.label, selectedProject.version, {
      name: newProject.name,
      base: newProject.base,
      prefixMappings: newProject.prefixMappings || [],
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
      selectedProject.version
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

          fetchProjects(match.params.org);
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
  if (projects.length === 0) {
    return <p>no projects</p>;
  }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ marginBottom: 0, marginRight: 8 }}>Projects</h1>
        <Button
          type="primary"
          onClick={() => setModalVisible(true)}
          icon="plus-square"
        />
      </div>
      <ProjectList
        projects={projects}
        onProjectClick={(projectLabel: string) =>
          goTo(activeOrg.label, projectLabel)
        }
        onProjectEdit={(projectLabel: string) =>
          setSelectedProject(projects.filter(p => p.label === projectLabel)[0])
        }
      />
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
        visible={!!(selectedProject && selectedProject.name)}
        onClose={() => setSelectedProject(undefined)}
      >
        {selectedProject && (
          <ProjectForm
            project={{
              name: selectedProject.name,
              label: selectedProject.label,
              base: selectedProject.base,
              prefixMappings: selectedProject.prefixMappings,
            }}
            onSubmit={(p: Project) => saveAndModify(selectedProject, p)}
            onDeprecate={() => saveAndDeprecate(selectedProject)}
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
  projects:
    state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.data &&
    state.nexus.activeOrg.data.projects
      ? state.nexus.activeOrg.data.projects.map(p => p)
      : [],
  busy:
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.isFetching) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrgData: (orgLabel: string) => dispatch(fetchOrg(orgLabel)),
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
