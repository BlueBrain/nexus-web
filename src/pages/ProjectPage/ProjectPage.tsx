import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  Statistics,
} from '@bbp/nexus-sdk/es';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { Tabs, Popover, Empty } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import { useJiraPlugin } from '../../shared/hooks/useJIRA';
import { RootState } from '../../shared/store/reducers';
import useNotification from '../../shared/hooks/useNotification';
import ResourceListBoardContainer from '../../shared/containers/ResourceListBoardContainer';
import ResourceCreateUploadContainer from '../../shared/containers/ResourceCreateUploadContainer';
import StoragesContainer from '../../subapps/admin/containers/StoragesContainer';
import QuotasContainer from '../../subapps/admin/containers/QuotasContainer';
import ProjectStatsContainer from '../../subapps/admin/containers/ProjectStatsContainer';
import ProjectToDeleteContainer from '../../subapps/admin/containers/ProjectToDeleteContainer';
import JiraPluginProjectContainer from '../../subapps/admin/containers/JiraContainer';
import SettingsContainer from '../../subapps/admin/containers/SettingsContainer';
import ViewStatisticsContainer from '../../subapps/admin/components/Views/ViewStatisticsProgress';
import QueryEditor from '../../subapps/admin/components/Projects/QueryEditor';

import './styles.scss';

const ProjectView: React.FunctionComponent = () => {
  const notification = useNotification();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const subapp = useOrganisationsSubappContext();

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
      case `${base}jira`:
        return 'jira';
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
      case 'jira':
        return `${base}jira`;
    }
    return `${base}browse`;
  };

  const [{ project }, setState] = React.useState<{
    project: ProjectResponseCommon | null;
    busy: boolean;
    error: Error | null;
  }>({
    project: null,
    busy: false,
    error: null,
  });

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
  }, [orgLabel, projectLabel, nexus]);

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
      .then(versions => setDeltaPlugins({ ...versions.plugins }));
  };

  const showDeletionBanner = deltaPlugins && 'project-deletion' in deltaPlugins;

  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'studios' || activeKey === 'workflows') return;
    history.push(pathFromTab(activeKey));
  };

  const {
    isUserInSupportedJiraRealm,
    jiraInaccessibleBecauseOfVPN,
  } = useJiraPlugin();

  return (
    <div className="project-view">
      {!!project && (
        <>
          <div className="project-banner">
            <div className="label">
              <h1 className="name">
                <span>
                  <Link to={`/orgs/${orgLabel}`}>{orgLabel}</Link>
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
            <Tabs
              className="project-tabs"
              onChange={handleTabChange}
              activeKey={activeKey}
              items={[
                {
                  key: 'browse',
                  label: 'Browse',
                  children: (
                    <div className="list-board">
                      <div className="wrapper">
                        <ResourceListBoardContainer
                          orgLabel={orgLabel}
                          projectLabel={projectLabel}
                          refreshLists={refreshLists}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'query',
                  label: 'Query',
                  children: (
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
                  ),
                },
                {
                  key: 'create_upload',
                  label: 'Create and Upload',
                  children: (
                    <AccessControl
                      path={`/${orgLabel}/${projectLabel}`}
                      permissions={['files/write']}
                      noAccessComponent={() => (
                        <Empty>
                          You don't have the access to create/upload. Please
                          contact the Administrator for access.
                        </Empty>
                      )}
                    >
                      <ResourceCreateUploadContainer
                        orgLabel={orgLabel}
                        projectLabel={projectLabel}
                      />
                    </AccessControl>
                  ),
                },
                {
                  key: 'stats',
                  label: 'Statistics',
                  children: (
                    <AccessControl
                      key="quotas-access-control"
                      path={`/${orgLabel}/${projectLabel}`}
                      permissions={['test']}
                      noAccessComponent={() => (
                        <Empty>
                          You don't have read access to quotas. Please contact
                          the Administrator for access.
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
                  ),
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  children: (
                    <SettingsContainer
                      project={{
                        _label: project._label,
                        _rev: project._rev,
                        description: project.description || '',
                        base: project.base,
                        vocab: project.vocab,
                        _deprecated: project._deprecated,
                      }}
                      apiMappings={project.apiMappings}
                      mode="edit"
                    />
                  ),
                },
                ...(deltaPlugins &&
                'jira' in deltaPlugins &&
                isUserInSupportedJiraRealm &&
                !jiraInaccessibleBecauseOfVPN
                  ? [
                      {
                        key: 'jira',
                        label: 'Jira',
                        children: (
                          <JiraPluginProjectContainer
                            orgLabel={orgLabel}
                            projectLabel={projectLabel}
                          />
                        ),
                      },
                    ]
                  : []),
                ...(deltaPlugins && 'graph-analytics' in deltaPlugins
                  ? [
                      {
                        key: 'graph-analytics',
                        label: 'Graph Analytics',
                        children: (
                          <ProjectStatsContainer
                            orgLabel={orgLabel}
                            projectLabel={projectLabel}
                          />
                        ),
                      },
                    ]
                  : []),
                {
                  key: 'studios',
                  label: (
                    <span>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        to={`/studios/${orgLabel}/${projectLabel}/studios`}
                      >
                        <SelectOutlined /> Studios
                      </Link>
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;
