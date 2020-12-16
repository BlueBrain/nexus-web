import * as React from 'react';
import { Resource, Identity } from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { notification, Empty, message } from 'antd';
import { useHistory } from 'react-router';
import EditStudio from '../components/EditStudio';
import StudioHeader from '../components/StudioHeader';
import { StudioContext } from '../views/StudioView';
import WorkspaceList from '../containers/WorkspaceListContainer';
import { saveImage } from '../../../shared/containers/MarkdownEditorContainer';

const resourcesWritePermissionsWrapper = (
  child: React.ReactNode,
  permissionPath: string
) => {
  const permissions = ['resources/write'];
  return React.createElement(AccessControl, {
    permissions,
    path: permissionPath,
    children: [child],
  });
};

function getDestinationParam(): string {
  const destinationPath = encodeURIComponent(window.location.pathname.slice(1));
  return destinationPath ? `?destination=${destinationPath}` : '';
}

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
}>;

const StudioContainer: React.FunctionComponent = () => {
  const [
    studioResource,
    setStudioResource,
  ] = React.useState<StudioResource | null>(null);
  const [workspaceIds, setWorkspaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();
  const history = useHistory();
  const studioContext = React.useContext(StudioContext);
  const { orgLabel, projectLabel, studioId } = studioContext;

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
            ? "You don't have the permissions to view the studio"
            : 'Please login to view the studio';
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
    <EditStudio
      key={studioId}
      studio={studioResource}
      onSave={updateStudio}
      onSaveImage={saveImage(nexus, orgLabel, projectLabel)}
    />
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
          <WorkspaceList
            workspaceIds={workspaceIds}
            studioResource={studioResource}
            onListUpdate={reloadWorkspaces}
          />
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
