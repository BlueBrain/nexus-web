import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  Statistics,
} from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { Tabs, Popover, Empty } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';

import StoragesContainer from '../containers/StoragesContainer';
import ProjectStatsContainer from '../containers/ProjectStatsContainer';
import QuotasContainer from '../containers/QuotasContainer';
import ProjectForm from '../components/Projects/ProjectForm';
import ViewStatisticsContainer from '../components/Views/ViewStatisticsProgress';
import ResourceListBoardContainer from '../../../shared/containers/ResourceListBoardContainer';
import ACLsView from './ACLsView';
import QueryEditor from '../components/Projects/QueryEditor';
import { useAdminSubappContext } from '..';
import useNotification, {
  NexusError,
} from '../../../shared/hooks/useNotification';
import ProjectToDeleteContainer from '../containers/ProjectToDeleteContainer';
import { RootState } from '../../../shared/store/reducers';
import './ProjectView.less';
import ResourceCreateUploadContainer from '../../../shared/containers/ResourceCreateUploadContainer';
import { makeOrganizationUri } from '../../../shared/utils';

const ProjectView: React.FunctionComponent = () => {
  const notification = useNotification();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const subapp = useAdminSubappContext();
  const { TabPane } = Tabs;

  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const {
    params: { orgLabel, projectLabel },
  } = match;

  const tabFromPath = (path: string) => {
    const base = `/${subapp.namespace}/:orgLabel/:projectLabel/`;

    switch (path) {
      case `${base}`:
        return 'browse';

      case `${base}create`:
        return 'create_upload';

      case `${base}query/:viewId?`:
        return 'query';

      case `${base}statistics`:
        return 'stats';

      case `${base}settings`:
        return 'settings';
      case `${base}graph-analytics`:
        return 'graph-analytics';
    }
    return 'browse';
  };

  const pathFromTab = (tab: string | undefined) => {
    const base = `/${subapp.namespace}/${orgLabel}/${projectLabel}/`;

    switch (tab) {
      case 'browse':
        return `${base}`;

      case 'query':
        return `${base}query`;

      case 'create_upload':
        return `${base}create`;

      case 'stats':
        return `${base}statistics`;

      case 'settings':
        return `${base}settings`;
      case 'graph-analytics':
        return `${base}graph-analytics`;
    }
    return `${base}browse`;
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
  const [activeKey, setActiveKey] = React.useState<string>(
    tabFromPath(match.path)
  );

  const [statisticsPollingPaused, setStatisticsPollingPaused] = React.useState(
    false
  );
  const [deltaPlugins, setDeltaPlugins] = React.useState<{
    [key: string]: string;
  }>();

  const { apiEndpoint } = useSelector((state: RootState) => state.config);

  React.useEffect(() => {
    setActiveKey(tabFromPath(match.path));
  }, [match.path]);

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
  const saveAndModify = (newProject: ProjectResponseCommon) => {
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

  const deprecateProject = () => {
    if (!project) {
      return;
    }
    setFormBusy(true);
    nexus.Project.deprecate(orgLabel, projectLabel, project._rev)
      .then(() => {
        history.push(makeOrganizationUri(orgLabel));
        notification.success({
          message: 'Project deprecated',
        });
      })
      .catch((error: NexusError) => {
        notification.error({
          message: 'Error deprecating project',
          description: error.reason,
        });
      })
      .finally(() => {
        setFormBusy(false);
      });
  };

  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'studios' || activeKey === 'workflows') return;
    history.push(pathFromTab(activeKey));
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
          </div>
          {showDeletionBanner && (
            <ProjectToDeleteContainer
              orgLabel={orgLabel}
              projectLabel={project._label}
            />
          )}
          <div className="tabs-container">
            <Tabs onChange={handleTabChange} activeKey={activeKey}>
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
                <div style={{ flexGrow: 1 }}>
                  <QueryEditor
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                    onUpdate={() => {
                      setRefreshLists(!refreshLists);
                      // Statistics aren't immediately updated so pause polling briefly
                      pauseStatisticsPolling(5000);
                    }}
                  />
                </div>
              </TabPane>
              <TabPane tab="Create and Upload" key="create_upload">
                <AccessControl
                  path={`/${orgLabel}/${projectLabel}`}
                  permissions={['files/write']}
                  noAccessComponent={() => (
                    <Empty>
                      You don't have the access to create/upload. Please contact
                      the Administrator for access.
                    </Empty>
                  )}
                >
                  <ResourceCreateUploadContainer
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                  />
                </AccessControl>
              </TabPane>
              <TabPane tab="Statistics" key="stats">
                <AccessControl
                  key="quotas-access-control"
                  path={`/${orgLabel}/${projectLabel}`}
                  permissions={['test']}
                  noAccessComponent={() => (
                    <Empty>
                      You don't have read access to quotas. Please contact the
                      Administrator for access.
                    </Empty>
                  )}
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
                  <br />
                  <h3>Settings</h3>
                  <div style={{ flexGrow: 1 }}>
                    <ProjectForm
                      project={{
                        _label: project._label,
                        _rev: project._rev,
                        description: project.description || '',
                        base: project.base,
                        vocab: project.vocab,
                        apiMappings: project.apiMappings,
                      }}
                      onSubmit={(p: ProjectResponseCommon) => saveAndModify(p)}
                      onDeprecate={deprecateProject}
                      busy={formBusy}
                      mode="edit"
                    />
                  </div>
                  <br />
                  <ACLsView />
                  <br />
                </>
              </TabPane>
              {deltaPlugins && 'graph-analytics' in deltaPlugins && (
                <TabPane tab="Graph Analytics" key="graph-analytics">
                  <ProjectStatsContainer
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                  />
                </TabPane>
              )}
              <TabPane
                tab={
                  <span>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      to={`/studios/${orgLabel}/${projectLabel}/studios`}
                    >
                      <SelectOutlined /> Studios
                    </Link>
                  </span>
                }
                key="studios"
              ></TabPane>
              <TabPane
                tab={
                  <span>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      to={`/workflow/${orgLabel}/${projectLabel}`}
                    >
                      <SelectOutlined /> Workflows
                    </Link>
                  </span>
                }
                key="workflows"
              ></TabPane>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;
