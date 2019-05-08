import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import { Empty, Switch, Icon, Tooltip, Button, Popover } from 'antd';
import Menu from '../components/Workspace/Menu';
import {
  createList,
  initializeProjectList,
  makeOrgProjectFilterKey,
} from '../store/actions/lists';
import { List } from '../store/reducers/lists';
import Nexus, {
  Project,
  Resource,
  NexusFile,
  Organization,
} from '@bbp/nexus-sdk';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
import { createFile } from '../store/actions/nexus/files';
import Status from '../components/Routing/Status';
import { RequestError } from '../store/actions/utils/errors';
import {
  HTTP_STATUSES,
  HTTP_STATUS_TYPE_KEYS,
} from '../store/actions/utils/statusCodes';
import { push } from 'connected-react-router';
import QueryContainer from '../components/Workspace/Queries/QueriesContainer';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

interface ProjectViewProps {
  project: Project | null;
  org: Organization | null;
  error: RequestError | null;
  match: any;
  createList(orgProjectFilterKey: string): void;
  initialize(orgLabel: string, projectLabel: string): void;
  createResource(
    orgLabel: string,
    projectLabel: string,
    schemaId: string,
    payload: CreateResourcePayload
  ): Promise<Resource>;
  fetchProject(org: string, project: string): void;
  createFile(file: File): void;
  goToOrg(orgLabel: string): void;
  onLoginClick: VoidFunction;
  isFetching: boolean;
  authenticated: boolean;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  isFetching,
  error,
  match,
  project,
  org,
  createList,
  createResource,
  fetchProject,
  createFile,
  onLoginClick,
  authenticated,
  goToOrg,
}) => {
  const projectLabel = project ? project.label : null;
  React.useEffect(() => {
    if (projectLabel !== match.params.project) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.project, match.params.org]);

  let description;
  let more;
  if (error) {
    switch (error.code) {
      case HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.UNAUTHORIZED].code:
        description = <span>This project is protected.</span>;
        more = !authenticated && (
          <Button onClick={onLoginClick}>Try logging in?</Button>
        );
        break;
      case HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.FORBIDDEN].code:
        description = <span>Sorry, you don't have access to this project</span>;
        more = !authenticated && (
          <Button onClick={onLoginClick}>Try logging in?</Button>
        );
        break;
      case HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.NOT_FOUND].code:
        description = <span>This project doesn't exist</span>;
        break;
      default:
        description = (
          <span>There was a problem while loading this project!</span>
        );
    }
  }

  if (!project && !error && isFetching) {
    description = 'Loading project...';
  }

  return (
    <Status
      code={!!error ? error.code : HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.OK].code}
    >
      <div className="project-view">
        {!project && (
          <>
            <h1 style={{ marginBottom: 0, marginRight: 8 }}>
              {match.params.project}
            </h1>
            <Empty style={{ marginTop: '22vh' }} description={description}>
              {more}
            </Empty>
          </>
        )}
        {project && (
          <>
            <Helmet
              title={`${project.label} | ${org && `${org.label} | `} Nexus Web`}
              meta={[
                project.description
                  ? {
                      name: 'description',
                      content: project.description,
                    }
                  : {},
              ]}
            />
            <div className="project-banner">
              <div className="label">
                <h1 className="name">
                  {' '}
                  {org && (
                    <span>
                      <a onClick={() => goToOrg(org.label)}>{org.label}</a> |{' '}
                    </span>
                  )}{' '}
                  {project.label}{' '}
                </h1>
                {!!project.description && (
                  <Popover
                    title={project.label}
                    content={
                      <div style={{ width: 300 }}>{project.description}</div>
                    }
                  >
                    <div className="description">{project.description}</div>
                  </Popover>
                )}
              </div>
              <div className="actions">
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
                  onFileUpload={createFile}
                  createList={() => {
                    project &&
                      org &&
                      createList(makeOrgProjectFilterKey(org, project));
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
              </div>
            </div>
            {!!org && !!project && (
              <QueryContainer org={org} project={project} />
            )}
          </>
        )}
      </div>
    </Status>
  );
};

const mapStateToProps = (state: RootState) => {
  const orgData =
    state.nexus && state.nexus.activeOrg && state.nexus.activeOrg.data;
  const projectData =
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data) ||
    null;

  const orgLabel = (orgData && orgData.org.label) || '';
  const projectLabel = (projectData && projectData.label) || '';
  const activeListId =
    (state.lists &&
      Object.keys(state.lists).find(key => key === orgLabel + projectLabel)) ||
    '';

  return {
    environment: state.config.apiEndpoint,
    token: state.oidc && state.oidc.user && state.oidc.user.access_token,
    authenticated: !!state.oidc.user,
    project: projectData || null,
    org: (orgData && orgData.org) || null,
    isFetching:
      (state.nexus &&
        state.nexus.activeProject &&
        state.nexus.activeProject.isFetching) ||
      true,
    error:
      (state.nexus &&
        state.nexus.activeProject &&
        state.nexus.activeProject.error) ||
      null,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchProject: (orgLabel: string, projectLabel: string) => {
      dispatch(fetchOrg(orgLabel));
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
      payload: CreateResourcePayload,
      environment: string,
      token?: string
    ) => {
      const nexus = new Nexus({ environment, token });
      return await nexus.Resource.create(
        orgLabel,
        projectLabel,
        schemaId,
        payload
      );
    },
    createFile: async (file: File) => {
      dispatch(createFile(file));
    },
    goToOrg: (orgLabel: string) =>
      dispatch(push(`/${orgLabel}`, { previousUrl: window.location.href })),
    onLoginClick: () =>
      dispatch(push('/login', { previousUrl: window.location.href })),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    createResource: async (
      orgLabel: string,
      projectLabel: string,
      schemaId: string,
      payload: CreateResourcePayload
    ) => {
      const environment = stateProps.environment;
      const token = stateProps.token;
      return await dispatchProps.createResource(
        orgLabel,
        projectLabel,
        schemaId,
        payload,
        environment,
        token
      );
    },
  })
)(ProjectView);
