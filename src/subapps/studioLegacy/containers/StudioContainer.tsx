import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { notification, Empty, message } from 'antd';
import { useHistory } from 'react-router';
import EditStudio from '../components/EditStudio';
import StudioHeader from '../components/StudioHeader';
import { StudioContext } from '../views/StudioView';
import WorkspaceList from '../containers/WorkspaceListContainer';
import { saveImage } from '../../../shared/containers/MarkdownEditorContainer';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import { getDestinationParam } from '../../../shared/utils';

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

  const fetchAndSetupStudio = React.useCallback(() => {
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
          nexus.Identity.list().then(({ identities }) => {
            const user = identities.find(i => i['@type'] === 'User');

            if (!user) {
              history.push(`/login${getDestinationParam()}`);
            }

            const message = user
              ? "You don't have the permissions to view the studio"
              : 'Please login to view the studio';

            notification.error({
              key: 'access-error',
              message: 'Access error',
              description: message,
              duration: 4,
            });
          });
        } else {
          notification.error({
            key: 'fetch-error',
            message: 'Failed to load the studio',
            description: e.message || e.reason,
            duration: 4,
          });
        }
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

  const editButton = (
    <EditStudio
      key={studioId}
      studio={studioResource}
      onSave={updateStudio}
      onSaveImage={saveImage(nexus, orgLabel, projectLabel)}
      markdownViewer={MarkdownViewerContainer}
    />
  );
  return (
    <>
      {studioResource ? (
        <>
          <StudioHeader
            resource={studioResource}
            markdownViewer={MarkdownViewerContainer}
          >
            {resourcesWritePermissionsWrapper(
              editButton,
              `/${orgLabel}/${projectLabel}`
            )}
          </StudioHeader>
          <WorkspaceList
            workspaceIds={workspaceIds}
            studioResource={studioResource}
            onListUpdate={fetchAndSetupStudio}
          />
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
