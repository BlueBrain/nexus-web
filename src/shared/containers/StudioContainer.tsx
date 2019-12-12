import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty } from 'antd';

import WorkspaceList from './WorkspaceListContainer';
import EditStudio, {
  StudioResource,
  StudioResourceResponse,
} from '../components/Studio/EditStudio';
import StudioHeader from '../components/Studio/StudioHeader';

type StudioContainerProps = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  workspaceId: string;
  dashboardId: string;
  studioResourceId: string;
};

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
  const [workspaceIds, setWorkspaceIds] = React.useState<{ '@id': string }[]>(
    []
  );
  const nexus = useNexusContext();

  React.useEffect(() => {
    fetchAndSetupStudio();
  }, [orgLabel, projectLabel, studioId]);

  const fetchAndSetupStudio = async () => {
    try {
      const response = await nexus.Resource.get<StudioResourceResponse>(
        orgLabel,
        projectLabel,
        studioId
      );

      const studioResourceFromStudioResourceResponse = {
        ...response,
        workspaces: (response.workspaces || []).map((id: string) => ({
          '@id': id,
        })),
      };

      setStudioResource(studioResourceFromStudioResourceResponse);
      setWorkspaceIds(studioResourceFromStudioResourceResponse.workspaces);
    } catch (error) {
      // TODO: show a meaningful error to the user.
    }
  };

  const updateStudio = async (label: string, description?: string) => {
    if (studioResource) {
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        studioId,
        studioResource._rev,
        {
          ...studioResource,
          label,
          description,
        }
      )
        .then(response => {
          fetchAndSetupStudio();

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

  const realoadWorkspaces = () => {
    fetchAndSetupStudio();
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
            onListUpdate={realoadWorkspaces}
          />
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
