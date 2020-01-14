import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty } from 'antd';

import EditStudio from '../components/Studio/EditStudio';
import StudioHeader from '../components/Studio/StudioHeader';

type StudioContainerProps = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  workspaceListComponent(workspaceComponentProps: {
    workspaceIds: string[];
    reloadWorkspaces: VoidFunction;
    studioResource: StudioResource;
  }): React.ReactElement;
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
  workspaceListComponent,
}) => {
  const [
    studioResource,
    setStudioResource,
  ] = React.useState<StudioResource | null>(null);
  const [workspaceIds, setWorkspaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();

  React.useEffect(() => {
    fetchAndSetupStudio();
  }, [orgLabel, projectLabel, studioId]);

  const fetchAndSetupStudio = async () => {
    nexus.Resource.get(orgLabel, projectLabel, studioId)
      .then(value => {
        const studioResource: StudioResource = value as StudioResource;
        setStudioResource(studioResource);
        const workspaceIds: string[] = studioResource['workspaces'];
        setWorkspaceIds(
          Array.isArray(workspaceIds) ? workspaceIds : [workspaceIds]
        );
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
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

  const reloadWorkspaces = () => {
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
          {workspaceListComponent({
            workspaceIds,
            reloadWorkspaces,
            studioResource,
          })}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
