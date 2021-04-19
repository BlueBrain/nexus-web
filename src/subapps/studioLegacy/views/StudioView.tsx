import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import StudioContainer from '../containers/StudioContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

type StudioContextType = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  workspaceId?: string | undefined;
  dashboardId?: string | undefined;
};
type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
}>;

export const StudioContext = React.createContext<StudioContextType>({
  orgLabel: '',
  projectLabel: '',
  studioId: '',
});

const StudioView: React.FunctionComponent<{}> = () => {
  // @ts-ignore
  const { orgLabel, projectLabel, studioId } = useParams();
  const [queryParams, setQueryString] = useQueryString();
  const { workspaceId, dashboardId } = queryParams;
  const nexus = useNexusContext();
  const [
    studioResource,
    setStudioResource,
  ] = React.useState<StudioResource | null>(null);

  React.useEffect(() => {
    if (orgLabel && projectLabel && studioId) {
      nexus.Resource.get(orgLabel, projectLabel, studioId).then(
        (value: any) => {
          const studioResource: StudioResource = value as StudioResource;
          setStudioResource(studioResource);
        }
      );
    }
  }, []);

  const contextValue = {
    workspaceId,
    dashboardId,
    orgLabel: orgLabel as string,
    projectLabel: projectLabel as string,
    studioId: studioId as string,
  };

  return (
    <>
      <div
        className="project-banner no-bg"
        style={{
          marginBottom: 20,
        }}
      >
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
        <StudioContext.Provider value={contextValue}>
          <StudioContainer />
        </StudioContext.Provider>
      </div>
    </>
  );
};

export default StudioView;
