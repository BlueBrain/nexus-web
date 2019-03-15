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
import { Project, Resource, NexusFile } from '@bbp/nexus-sdk';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
import { createFile } from '../store/actions/nexus/files';
import Status from '../components/Routing/Status';
import { RequestError } from '../store/actions/utils/errors';
import {
  HTTP_STATUSES,
  HTTP_STATUS_TYPE_KEYS,
} from '../store/actions/utils/statusCodes';

interface ProjectViewProps {
  project: Project | null;
  error: RequestError | null;
  match: any;
  lists: ListsByProjectState;
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
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
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
  createFile,
  getFilePreview,
}) => {
  const projectLabel = project ? project.label : null;
  React.useEffect(() => {
    if (projectLabel !== match.params.project) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.project, match.params.org]);
  return (
    <Status
      code={!!error ? error.code : HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.OK].code}
    >
      <div className="project">
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
                  onFileUpload={createFile}
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
              getFilePreview={getFilePreview}
            />
          </>
        )}
      </div>
    </Status>
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
});
const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    getFilePreview: (selfUrl: string) => NexusFile.getSelf(selfUrl, true),
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
      payload: CreateResourcePayload
    ) => await Resource.create(orgLabel, projectLabel, schemaId, payload),
    createFile: async (file: File) => {
      dispatch(createFile(file));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
