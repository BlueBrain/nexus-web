import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty } from 'antd';

import WorkspaceList from './WorkspaceListContainer';
import EditStudio from '../components/Studio/EditStudio';
import StudioHeader from '../components/Studio/StudioHeader';

const STUDIO_TYPE = 'https://bluebrainnexus.io/studio/vocabulary/Studio';

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
        if (value['@type'] === STUDIO_TYPE) {
          const studioResource: StudioResource = value as StudioResource;
          setStudioResource(studioResource);
          const workspaceIds: string[] = studioResource['workspaces'];
          setWorkspaceIds(workspaceIds || []);
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
        }
      )
        .then(response => {
          notification.success({
            message: 'Studio was edited successfully',
            duration: 2,
          });
        })
        .catch(error => {
          notification.error({
            message: 'An error occurred',
            description: error.reason || error.message,
            duration: 3,
          });
        });
    }
  };

  return (
    <>
      {studioResource ? (
        <>
          <StudioHeader
            label={studioResource.label}
            description={studioResource.description}
          >
            <EditStudio studio={studioResource} onSave={updateStudio} />
          </StudioHeader>
          <WorkspaceList
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workspaceIds={workspaceIds}
            workspaceId={workspaceId}
            dashboardId={dashboardId}
            studioResourceId={studioResourceId}
            studioResource={studioResource}
          />
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
