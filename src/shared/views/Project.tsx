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
} from '@bbp/nexus-sdk-legacy';
import { CreateResourcePayload } from '@bbp/nexus-sdk-legacy/lib/Resource/types';
import { createFile } from '../store/actions/nexus/files';
import Status from '../components/Routing/Status';
import { RequestError } from '../store/actions/utils/errors';
import {
  HTTP_STATUSES,
  HTTP_STATUS_TYPE_KEYS,
} from '../store/actions/utils/statusCodes';
import { getDestinationParam } from '../utils';
import { push } from 'connected-react-router';
import QueryContainer from '../components/Workspace/Queries/QueriesContainer';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { CreateFileOptions } from '@bbp/nexus-sdk-legacy/lib/File/types';
import usePreviouslyVisited from '../components/hooks/usePreviouslyVisited';
import {
  ViewStatisticsProgressMini,
  ViewStatisticsContainer,
} from '../components/Views/ViewStatisticsProgress';

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
  makeFileLink: (nexusFile: NexusFile) => string;
  goToFile: (nexusFile: NexusFile) => void;
  createFile(file: File, options?: CreateFileOptions): Promise<NexusFile>;
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
  makeFileLink,
  goToFile,
}) => {
  const projectLabel = project ? project.label : null;
  const { setPreviouslyVisited } = usePreviouslyVisited('visitedProjects');
  React.useEffect(() => {
    if (projectLabel !== match.params.project) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.project, match.params.org]);

  if (project) {
    setPreviouslyVisited(project);
  }

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
            <div className="project-banner">
              <div className="label">
                <h1 className="name">
                  {' '}
                  {org && (
                    <span>
                      <a onClick={() => goToOrg(org.label)}>{org.label}</a> |{' '}
                    </span>
                  )}{' '}
                  {match.params.project.label}
                </h1>
              </div>
            </div>
            <Empty style={{ marginTop: '22vh' }} description={description}>
              {more}
            </Empty>
          </>
        )}
        {project && (
          <>
            <Helmet
              title={`${project.label} | ${org && `${org.label} | `} Nexus`}
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
                  {project.label}
                  {'  '}
                </h1>
                <div style={{ marginLeft: 10 }}>
                  <ViewStatisticsContainer
                    orgLabel={(org && org.label) || ''}
                    projectLabel={project.label}
                    resourceId="nxv:defaultElasticSearchIndex"
                  />
                </div>
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
                  makeFileLink={makeFileLink}
                  goToFile={goToFile}
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
    makeFileLink: (nexusFile: NexusFile) =>
      `${state.config.basePath}/${nexusFile.orgLabel}/${
        nexusFile.projectLabel
      }/resources/${encodeURIComponent(nexusFile.id)}`,
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
    createFile: (file: File, options?: CreateFileOptions) =>
      dispatch(createFile(file, options)),
    goToOrg: (orgLabel: string) =>
      dispatch(push(`/${orgLabel}`, { previousUrl: window.location.href })),
    goToFile: (nexusFile: NexusFile) =>
      dispatch(
        push(
          `/${nexusFile.orgLabel}/${
            nexusFile.projectLabel
          }/resources/${encodeURIComponent(nexusFile.id)}`
        )
      ),
    onLoginClick: () =>
      dispatch(
        push(`/login${getDestinationParam()}`, {
          previousUrl: window.location.href,
        })
      ),
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
