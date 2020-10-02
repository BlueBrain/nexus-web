import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import StudioContainer from '../containers/StudioContainer';
import WorkspaceList from '../containers/WorkspaceListContainer';
import DashboardList from '../containers/DashboardListContainer';
import useQueryString from '../../../shared/hooks/useQueryString';

type StudioContextType = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  workspaceId?: string|undefined,
  dashboardId?: string|undefined
}

export const StudioContext = React.createContext<StudioContextType>({
  orgLabel: '',
  projectLabel: '',
  studioId: ''
});

const StudioView: React.FunctionComponent<{}> = () => {
  const { orgLabel, projectLabel, studioId } = useParams();
  const [queryParams, setQueryString] = useQueryString();
  const { workspaceId, dashboardId } = queryParams;
  const contextValue = {
    workspaceId,
    dashboardId,
    orgLabel : orgLabel as string,
    projectLabel: projectLabel as string,
    studioId: studioId as string
  };

  


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
        <StudioContext.Provider value={contextValue} >
          {orgLabel && projectLabel && studioId && (
            <StudioContainer
            />
          )}
        </StudioContext.Provider>
      </div>
    </>
  );
};

export default StudioView;
