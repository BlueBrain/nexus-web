import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  Statistics,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Popover, Button } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';

import ViewStatisticsContainer from '../components/Views/ViewStatisticsProgress';
import ResourceListBoardContainer from '../../../shared/containers/ResourceListBoardContainer';
import ProjectTools from '../components/Projects/ProjectTools';
import { useAdminSubappContext } from '..';
import useNotification from '../../../shared/hooks/useNotification';
import ProjectToDeleteContainer from '../containers/ProjectToDeleteContainer';
import { RootState } from '../../../shared/store/reducers';

const ProjectView: React.FunctionComponent = () => {
  const notification = useNotification();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const subapp = useAdminSubappContext();
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
          <div className="list-board">
            <div className="wrapper">
              <ResourceListBoardContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                refreshLists={refreshLists}
              />
              <ProjectTools
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                onUpdate={() => {
                  setRefreshLists(!refreshLists);
                  // Statistics aren't immediately updated so pause polling briefly
                  pauseStatisticsPolling(5000);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;
