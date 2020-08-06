import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import StudioContainer from '../containers/StudioContainer';
import WorkspaceList from '../containers/WorkspaceListContainer';
import DashboardList from '../containers/DashboardListContainer';

const StudioView: React.FunctionComponent<{}> = () => {
  const { orgLabel, projectLabel, studioId } = useParams();

  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <Link to={`/admin/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/admin/${orgLabel}/${projectLabel}`}>
                {projectLabel}
              </Link>
            </span>
          </h1>
        </div>
      </div>
      <div className="studio-view">
        {orgLabel && projectLabel && studioId && (
          <StudioContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            studioId={studioId}
            workspaceListComponent={({
              workspaceIds,
              reloadWorkspaces,
              studioResource,
            }) => {
              return (
                <WorkspaceList
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  workspaceIds={workspaceIds}
                  studioResource={studioResource}
                  onListUpdate={reloadWorkspaces}
                  dashboardListComponent={({ dashboards, workspaceId }) => {
                    return (
                      <DashboardList
                        orgLabel={orgLabel}
                        projectLabel={projectLabel}
                        dashboards={dashboards}
                        workspaceId={workspaceId}
                        refreshList={reloadWorkspaces}
                      />
                    );
                  }}
                />
              );
            }}
          />
        )}
      </div>
    </>
  );
};

export default StudioView;
