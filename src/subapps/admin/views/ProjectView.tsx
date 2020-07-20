import * as React from 'react';
import { useRouteMatch } from 'react-router';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Popover } from 'antd';
import { Link } from 'react-router-dom';

import ViewStatisticsContainer from '../../../shared/components/Views/ViewStatisticsProgress';
import ResourceListBoardContainer from '../../../shared/containers/ResourceListBoardContainer';
import HomeIcon from '../../../shared/components/HomeIcon';
import StudioListContainer from '../../../shared/containers/StudioListContainer';
import ProjectTools from '../components/Projects/ProjectTools';
import { useAdminSubappContext } from '..';

const ProjectView: React.FunctionComponent = () => {
  const nexus = useNexusContext();
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

  console.log({ orgLabel, projectLabel });

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
  }, [orgLabel, projectLabel]);

  return (
    <div className="project-view">
      {!!project && (
        <>
          <div className="project-banner">
            <div className="label">
              <h1 className="name">
                <HomeIcon />
                {' | '}
                <span>
                  <Link to={`/${orgLabel}`}>{orgLabel}</Link>
                  {' | '}
                </span>{' '}
                {project._label}
                {'  '}
              </h1>
              <div style={{ marginLeft: 10 }}>
                <ViewStatisticsContainer
                  orgLabel={orgLabel}
                  projectLabel={project._label}
                  resourceId={DEFAULT_ELASTIC_SEARCH_VIEW_ID}
                  onClickRefresh={() => {
                    setRefreshLists(!refreshLists);
                  }}
                />
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
          <div className="list-board">
            <div className="wrapper">
              <ResourceListBoardContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                refreshLists={refreshLists}
              />
              <div className="studios-container">
                <h3>Studios</h3>
                <StudioListContainer
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                />
              </div>
              <ProjectTools orgLabel={orgLabel} projectLabel={projectLabel} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;
