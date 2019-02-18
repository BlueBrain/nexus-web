import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import { Empty, Switch, Icon, Tooltip } from 'antd';
import Menu from '../components/Workspace/Menu';
import { createList, initializeProjectList } from '../store/actions/lists';
import { ListsByProjectState } from '../store/reducers/lists';
import { Project, Resource, ACL } from '@bbp/nexus-sdk';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
import { fetchAcls } from '../store/actions/auth';
import Toolbar from '../components/Toolbar/Toolbar';

interface ProjectViewProps {
  project: Project | null;
  error: Error | null;
  match: any;
  lists: ListsByProjectState;
  acls: ACL[];
  createList(orgProjectFilterKey: string): void;
  initialize(orgLabel: string, projectLabel: string): void;
  createResource(
    orgLabel: string,
    projectLabel: string,
    schemaId: string,
    payload: CreateResourcePayload
  ): Promise<Resource>;
  fetchProject(org: string, project: string): void;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  error,
  match,
  project,
  createList,
  createResource,
  initialize,
  lists,
  fetchProject,
  acls,
}) => {
  const projectLabel = project ? project.label : null;
  React.useEffect(
    () => {
      if (projectLabel !== match.params.project) {
        fetchProject(match.params.org, match.params.project);
      }
    },
    [match.params.project, match.params.org]
  );
  return (
    <div className="project">
      <Toolbar
        projectName={match.params.project}
        identities={acls
          .map(acl => acl.acl.map(i => i.identity))
          .reduce((flat, toBeFlatten) => flat.concat(toBeFlatten), [])}
        onNewMemberAdded={e => console.log(e)}
        onNewPermissionSelected={e => console.log(e)}
        onProjectNameChange={e => console.log(e)}
      />
      {!project && error && (
        <>
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>
            {match.params.project}
          </h1>
          <Empty
            style={{ marginTop: '22vh' }}
            description="There was a problem while loading this project!"
          />
        </>
      )}
      {!project && !error && (
        <>
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>
            {match.params.project}
          </h1>
          <Empty
            style={{ marginTop: '22vh' }}
            description="No project data found here..."
          />
        </>
      )}
      {project && (
        <>
          <div>
            <h1 style={{ marginBottom: 0, marginRight: 8 }}>
              {project.label}{' '}
              <Menu
                createResource={async (
                  schemaId: string,
                  payload: CreateResourcePayload
                ) =>
                  await createResource(
                    project.orgLabel,
                    project.label,
                    schemaId,
                    payload
                  )
                }
                project={project}
                createList={() => {
                  createList(project.orgLabel + project.label);
                }}
                render={(setVisible: () => void, visible: boolean) => (
                  <Tooltip
                    title={visible ? 'Close side-menu' : 'Open side-menu'}
                  >
                    <Switch
                      size="small"
                      checkedChildren={<Icon type="menu-fold" />}
                      unCheckedChildren={<Icon type="menu-unfold" />}
                      checked={visible}
                      onChange={() => setVisible()}
                    />
                  </Tooltip>
                )}
              />
            </h1>
            {project.description && <p>{project.description}</p>}{' '}
          </div>
          <Lists
            lists={lists}
            initialize={() => {
              initialize(project.orgLabel, project.label);
            }}
            project={project}
          />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  project:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data &&
      state.nexus.activeProject.data) ||
    null,
  error:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.error) ||
    null,
  lists: state.lists || {},
  acls:
    (state.auth.acls && state.auth.acls.data && state.auth.acls.data.results) ||
    [],
});
const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchProject: (orgLabel: string, projectLabel: string) => {
      dispatch(fetchOrg(orgLabel));
      dispatch(fetchAcls(`${orgLabel}/${projectLabel}`, { ancestors: true }));
      dispatch(fetchAndAssignProject(orgLabel, projectLabel));
    },
    createList: (orgProjectFilterKey: string) =>
      dispatch(createList(orgProjectFilterKey)),
    initialize: (orgLabel: string, projectLabel: string) =>
      dispatch(initializeProjectList(orgLabel, projectLabel)),
    createResource: async (
      orgLabel: string,
      projectLabel: string,
      schemaId: string,
      payload: CreateResourcePayload
    ) => await Resource.create(orgLabel, projectLabel, schemaId, payload),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
