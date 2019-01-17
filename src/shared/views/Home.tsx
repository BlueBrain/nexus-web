import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button, Icon } from 'antd';
import { Project } from '@bbp/nexus-sdk';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';
import { RootState } from '../store/reducers';
import { fetchProjects } from '../store/actions/nexus';
import {
  modifyProject,
  createProject,
  ProjectActions,
} from '../store/actions/project';
import ProjectList from '../components/Projects/ProjectList';
import Skeleton from '../components/Skeleton';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';

interface HomeProps {
  activeOrg: { label: string };
  projects: Project[];
  busy: boolean;
  match: any;
  fetchProjects(name: string): void;
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
  goTo(o: string, p: string): void;
}

const Home: React.FunctionComponent<HomeProps> = ({
  busy,
  projects,
  match,
  activeOrg,
  fetchProjects,
  goTo,
  createProject,
  modifyProject,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedProject, setSelectedProject] = React.useState<
    Project | undefined
  >(undefined);

  React.useEffect(
    () => {
      if (activeOrg.label !== match.params.org) {
        fetchProjects(match.params.org);
      }
    },
    [match.params.org]
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
          setSelectedProject(undefined);

          fetchProjects(match.params.org);
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
      <h1>Projects</h1>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        <Icon type="plus" />
      </Button>
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
            busy={formBusy}
          />
        )}
      </Drawer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeOrg: (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.org) || { label: '' },
  projects:
    state.nexus && state.nexus.activeOrg && state.nexus.activeOrg.projects
      ? state.nexus.activeOrg.projects.map(p => p)
      : [],
  busy:
    (state.nexus &&
      (state.nexus.orgsFetching || state.nexus.projectsFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProjects: (name: string) => dispatch(fetchProjects(name)),
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
