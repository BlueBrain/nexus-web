import * as React from 'react';
import { match } from 'react-router';
import {
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { notification, Popover, Divider, Tooltip, Icon, Switch } from 'antd';
import { Link } from 'react-router-dom';

import ViewStatisticsContainer from '../components/Views/ViewStatisticsProgress';
import SideMenu from '../components/Menu/SideMenu';
import FileUploadContainer from '../containers/FileUploadContainer';
import ResourceFormContainer from '../containers/ResourceFormContainer';
import ResourceListBoardContainer from '../containers/ResourceListBoardContainer';

const ProjectView: React.FunctionComponent<{
  match: match<{ orgLabel: string; projectLabel: string }>;
}> = ({ match }) => {
  const nexus = useNexusContext();
  const {
    params: { orgLabel, projectLabel },
  } = match;

  const [{ project, busy, error }, setState] = React.useState<{
    project: ProjectResponseCommon | null;
    busy: boolean;
    error: Error | null;
  }>({
    project: null,
    busy: false,
    error: null,
  });

  const [menuVisible, setMenuVisible] = React.useState(true);
  const [refreshLists, setRefreshLists] = React.useState(false);

  const handleResourceCreated = () => {
    let totalEvents: number;

    const subscription = nexus.View.pollStatistics(
      orgLabel,
      projectLabel,
      DEFAULT_ELASTIC_SEARCH_VIEW_ID,
      { pollIntervalMs: 500 }
    ).subscribe(data => {
      if (!totalEvents) {
        totalEvents = data.totalEvents;         
      } else if (data.totalEvents !== totalEvents) {
        setRefreshLists(!refreshLists);
        subscription.unsubscribe();
      }
    });
  };

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
      }).catch(error => {
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
    },
    [orgLabel, projectLabel]
  );

  return (
    <div className="project-view">
      {!!project && (
        <>
          <div className="project-banner">
            <div className="label">
              <h1 className="name">
                <Link to="/">
                  <Tooltip title="Back to all organizations" placement="right">
                    <Icon type="home" />
                  </Tooltip>
                </Link>
                {' | '}
                <span>
                  <Link to={`/${orgLabel}`}>{orgLabel}</Link>
                  {' | '}
                </span>{' '}
                {project._label}
              </h1>
              <div style={{ marginLeft: 10 }}>
                <ViewStatisticsContainer
                  orgLabel={orgLabel}
                  projectLabel={project._label}
                  resourceId={DEFAULT_ELASTIC_SEARCH_VIEW_ID}
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
            <div className="actions">
              <Switch
                size="small"
                checked={menuVisible}
                onChange={setMenuVisible}
              ></Switch>
              <SideMenu
                visible={menuVisible}
                title="Resources"
                onClose={() => setMenuVisible(false)}
              >
                <p>
                  View resources in your project using pre-defined query-helper
                  lists.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <AccessControl
                    path={`/${orgLabel}/${projectLabel}`}
                    permissions={['resources/write']}
                  >
                    <ResourceFormContainer
                      orgLabel={orgLabel}
                      projectLabel={projectLabel}
                    />
                  </AccessControl>
                  <Link
                    to={`/${orgLabel}/${projectLabel}/nxv:defaultSparqlIndex/sparql`}
                  >
                    Sparql Query Editor
                  </Link>
                  <Link
                    to={`/${orgLabel}/${projectLabel}/nxv:defaultElasticSearchIndex/_search`}
                  >
                    ElasticSearch Query Editor
                  </Link>
                  <Link to={`/${orgLabel}/${projectLabel}/_settings/acls`}>
                    View Project's permissions
                  </Link>
                </div>
                <AccessControl
                  path={`/${orgLabel}/${projectLabel}`}
                  permissions={['files/write']}
                >
                  <Divider />
                  <FileUploadContainer
                    projectLabel={projectLabel}
<<<<<<< HEAD
                    orgLabel={orgLabel}
=======
                    onResourceCreated={handleResourceCreated}
>>>>>>> experimental please waiting for resoruce creation
                  />
                </AccessControl>
              </SideMenu>
            </div>
          </div>
          <ResourceListBoardContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
          />
        </>
      )}
    </div>
  );
};

export default ProjectView;
