import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';

import WorkspaceList from './WorkspaceListContainer';
import AddWorkspace from '../components/Studio/AddWorkspace';
import EditStudio from '../components/Studio/EditStudio';

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

  const updateStudio = async (label: string, description?: string) => {
    if (studioResource) {
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        studioId,
        studioResource._rev,
        {
          label,
          description,
        },
      ).then(response => {
        notification.success({
          message: 'Studio was edited successfully',
          duration: 2,
        });
      }).catch(error => {
        notification.error({
          message: 'An error occurred',
          description: error.reason || error.message,
          duration: 3,
        });
      });
    }
  }

  return (
    <>
      {studioResource ? (
        <>
          <div className="title-container">
            <h1 className="title">
              {studioResource.label}
            </h1>
            <div>
              <EditStudio studio={studioResource} onSave={updateStudio} />
              <AddWorkspace />
            </div>
          </div>
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
        </>
      ) : (
        <h4>The Resource is not a Studio</h4>
      )}
    </>
  );
};

export default StudioContainer;
