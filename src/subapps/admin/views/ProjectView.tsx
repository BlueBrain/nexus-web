import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  Statistics,
} from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { Tabs, Popover, Button, Divider } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';

import StoragesContainer from '../containers/StoragesContainer';
import QuotasContainer from '../containers/QuotasContainer';
import ProjectForm from '../components/Projects/ProjectForm';
import ViewStatisticsContainer from '../components/Views/ViewStatisticsProgress';
import ResourceListBoardContainer from '../../../shared/containers/ResourceListBoardContainer';
import FileUploadContainer from '../../../shared/containers/FileUploadContainer';
import ProjectTools from '../components/Projects/ProjectTools';
import QueryEditor from '../components/Projects/QueryEditor';
import { useAdminSubappContext } from '..';
import useNotification from '../../../shared/hooks/useNotification';
import ProjectToDeleteContainer from '../containers/ProjectToDeleteContainer';
import { RootState } from '../../../shared/store/reducers';
import './ProjectView.less';

const ProjectView: React.FunctionComponent = () => {
  const notification = useNotification();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const subapp = useAdminSubappContext();
  const { TabPane } = Tabs;
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );
  const {
    params: { orgLabel, projectLabel },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
    },
  };

  const [{ project, busy, error }, setState] = React.useState<{
    project: ProjectResponseCommon | null;
    busy: boolean;
    error: Error | null;
  }>({
    project: null,
    busy: false,
    error: null,
  });
  const [formBusy, setFormBusy] = React.useState<boolean>(false);

  const [refreshLists, setRefreshLists] = React.useState(false);
  const [statisticsPollingPaused, setStatisticsPollingPaused] = React.useState(
    false
  );
  const [deltaPlugins, setDeltaPlugins] = React.useState<{
    [key: string]: string;
  }>();

  const { apiEndpoint } = useSelector((state: RootState) => state.config);

  React.useEffect(() => {
    setState({
      project,
      error: null,
      busy: true,
    });
    nexus.Project.get(orgLabel, projectLabel)
      .then(response => {
        setState({
          project: response,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        notification.error({
          message: `Could not load project ${projectLabel}`,
          description: error.message,
        });
        setState({
          project,
          error,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel, nexus, setState]);

  const pauseStatisticsPolling = (durationInMs: number) => {
    setStatisticsPollingPaused(true);
    setTimeout(() => {
      (async () => {
        await fetchAndSetStatistics();
        setStatisticsPollingPaused(false);
      })();
    }, durationInMs);
  };

  React.useEffect(() => {
    /* if location has changed, check to see if we should refresh our
    resources and reset initial statistics state */
    const refresh =
      location.state && (location.state as { refresh?: boolean }).refresh;
    if (refresh) {
      // remove refresh from state
      history.replace(location.pathname, {});
      setRefreshLists(!refreshLists);
      // Statistics aren't immediately updated so pause polling briefly
      pauseStatisticsPolling(5000);
    }
  }, [location]);

  const [statistics, setStatistics] = React.useState<Statistics>();

  const fetchAndSetStatistics = async () => {
    const stats = ((await nexus.View.statistics(
      orgLabel,
      projectLabel,
      encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID)
    )) as unknown) as Statistics;
    setStatistics(stats);
  };

  React.useEffect(() => {
    fetchAndSetStatistics();
    fetchDeltaVersion();
  }, []);

  const fetchDeltaVersion = async () => {
    await nexus
      .httpGet({
        path: `${apiEndpoint}/version`,
        context: { as: 'json' },
      })
      .then(versions => setDeltaPlugins(versions.plugins))
      .catch(error => {
        // do nothing
      });
  };

  const showDeletionBanner = deltaPlugins && 'project-deletion' in deltaPlugins;
  const saveAndModify = (
    selectedProject: ProjectResponseCommon,
    newProject: ProjectResponseCommon
  ) => {
    if (!project) {
      return;
    }
    setFormBusy(true);
    nexus.Project.update(orgLabel, projectLabel, project._rev, {
      base: newProject.base,
      vocab: newProject.vocab,
      description: newProject.description,
      apiMappings: newProject.apiMappings || [],
    })
      .then(() => {
        notification.success({
          message: 'Project saved',
        });
        setFormBusy(false);
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };
  return (
    <div className="project-view">
      {!!project && (
        <>
          <div className="project-banner">
            <div className="label">
              <h1 className="name">
                <span>
                  <Link to={`/admin/${orgLabel}`}>{orgLabel}</Link>
                  {' | '}
                </span>{' '}
                {project._label}
                {'  '}
              </h1>
              <div style={{ marginLeft: 10 }}>
                {statistics && (
                  <ViewStatisticsContainer
                    orgLabel={orgLabel}
                    projectLabel={project._label}
                    resourceId={encodeURIComponent(
                      DEFAULT_ELASTIC_SEARCH_VIEW_ID
                    )}
                    onClickRefresh={() => {
                      fetchAndSetStatistics();
                      setRefreshLists(!refreshLists);
                    }}
                    statisticsOnMount={statistics}
                    paused={statisticsPollingPaused}
                  />
                )}
              </div>
              {!!project.description && (
                <Popover
                  title={project._label}
                  content={
                    <div style={{ width: 300 }}>{project.description}</div>
                  }
                >
                  <div className="description">{project.description}</div>
                </Popover>
              )}
            </div>
            <Button type="primary">
              <Link to={`/studios/${orgLabel}/${projectLabel}/studios`}>
                Manage Studios for this project
              </Link>
            </Button>
          </div>
          {showDeletionBanner && (
            <ProjectToDeleteContainer
              orgLabel={orgLabel}
              projectLabel={project._label}
            />
          )}
          <div className="tabs-container">
            <Tabs defaultActiveKey="browse">
              <TabPane tab="Browse" key="browse">
                <div className="list-board">
                  <div className="wrapper">
                    <ResourceListBoardContainer
                      orgLabel={orgLabel}
                      projectLabel={projectLabel}
                      refreshLists={refreshLists}
                    />
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Query" key="query">
                <QueryEditor
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  onUpdate={() => {
                    setRefreshLists(!refreshLists);
                    // Statistics aren't immediately updated so pause polling briefly
                    pauseStatisticsPolling(5000);
                  }}
                />
              </TabPane>
              <TabPane tab="Create and Upload" key="create_upload">
                <AccessControl
                  path={`/${orgLabel}/${projectLabel}`}
                  permissions={['files/write']}
                >
                  <Divider />
                  <FileUploadContainer
                    projectLabel={projectLabel}
                    orgLabel={orgLabel}
                  />
                </AccessControl>
              </TabPane>
              <TabPane tab="Statistics" key="stats">
                <AccessControl
                  key="quotas-access-control"
                  path={`/${orgLabel}/${projectLabel}`}
                  permissions={['quotas/read']}
                >
                  <QuotasContainer
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                  />
                  <StoragesContainer
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                  />
                </AccessControl>
              </TabPane>
              <TabPane tab="Settings" key="settings">
                <>
                  <h3>Project Settings</h3>
                  <br />
                  <ProjectForm
                    project={{
                      _label: project._label,
                      _rev: project._rev,
                      description: project.description || '',
                      base: project.base,
                      vocab: project.vocab,
                      apiMappings: project.apiMappings,
                    }}
                    onSubmit={(p: ProjectResponseCommon) =>
                      saveAndModify(project, p)
                    }
                    busy={formBusy}
                    mode="edit"
                  />
                  <br />
                </>
              </TabPane>
              <TabPane tab="Studios" key="studios"></TabPane>
              <TabPane tab="Workflows" key="workflows"></TabPane>
              <TabPane tab="Tools" key="2">
                <ProjectTools
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  onUpdate={() => {
                    setRefreshLists(!refreshLists);
                    // Statistics aren't immediately updated so pause polling briefly
                    pauseStatisticsPolling(5000);
                  }}
                />
              </TabPane>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;
