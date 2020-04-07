import * as React from 'react';
import { Resource, Identity } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty, message } from 'antd';
import { useHistory } from 'react-router';
import EditStudio from '../components/Studio/EditStudio';
import StudioHeader from '../components/Studio/StudioHeader';
import { getDestinationParam } from '../utils';
import { resourcesWritePermissionsWrapper } from '../utils/permission';

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
  const history = useHistory();

  React.useEffect(() => {
    fetchAndSetupStudio();
  }, [orgLabel, projectLabel, studioId]);

  const [identities, setIdentities] = React.useState<Identity[]>([]);

  React.useEffect(() => {
    nexus.Identity.list().then(({ identities }) => {
      setIdentities(identities);
    });
  }, []); // Run only once.

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
        if (e['@type'] === 'AuthorizationFailed') {
          const user = identities.find(i => i['@type'] === 'User');
          const message = user
            ? "You don't have the permissions to view the resource"
            : 'Please login to view the resource';
          notification.error({
            message: 'Authentication error',
            description: message,
            duration: 4,
          });
          if (!user) {
            history.push(`/login${getDestinationParam()}`);
          }
        }
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

          message.success(
            <span>
              Studio <em>{label}</em> updated
            </span>
          );
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

  const editButton = (
    <EditStudio studio={studioResource} onSave={updateStudio} />
  );
  return (
    <>
      {studioResource ? (
        <>
          <StudioHeader
            label={studioResource.label}
            description={studioResource.description}
          >
            {resourcesWritePermissionsWrapper(
              editButton,
              `/${orgLabel}/${projectLabel}`
            )}
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
