import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import WorkspaceList from './WorkspaceListContainer';

type StudioContainerProps = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  workspaceId: string;
  dashboardId: string;
  studioResourceId: string;
};

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
}>;

const StudioContainer: React.FunctionComponent<StudioContainerProps> = ({
  orgLabel,
  projectLabel,
  studioId,
  workspaceId,
  dashboardId,
  studioResourceId,
}) => {
  const [
    studioResource,
    setStudioResource,
  ] = React.useState<StudioResource | null>(null);
  const [workspaceIds, setWorkspaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();
  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, studioId)
      .then(value => {
        if (value['@type'] === 'Studio') {
          const studioResource: StudioResource = value as StudioResource;
          setStudioResource(studioResource);
          const workspaceIds: string[] = studioResource['workspaces'];
          setWorkspaceIds(workspaceIds);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [orgLabel, projectLabel, studioId]);
  return (
    <>
      {studioResource ? (
        <div className="studio-view">
          <h1 className="title">{studioResource.label}</h1>
          {studioResource.description && (
            <p className="description">{studioResource.description}</p>
          )}
          <WorkspaceList
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workspaceIds={workspaceIds}
            workspaceId={workspaceId}
            dashboardId={dashboardId}
            studioResourceId={studioResourceId}
          />
        </div>
      ) : (
        <h4>The Resource is not a Studio</h4>
      )}
    </>
  );
};

export default StudioContainer;
