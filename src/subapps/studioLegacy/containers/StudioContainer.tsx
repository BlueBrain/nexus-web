import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { Empty, message } from 'antd';
import { omitBy } from 'lodash';
import { useHistory } from 'react-router';

import EditStudio from '../components/EditStudio';
import StudioHeader from '../components/StudioHeader';
import StudioReactContext from '../contexts/StudioContext';
import WorkspaceMenuContainer from '../containers/WorkspaceMenuContainer';
import { saveImage } from '../../../shared/containers/MarkdownEditorContainer';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import { getDestinationParam } from '../../../shared/utils';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';

export const resourceWithoutMetadata = (
  studioResource: StudioResource | Resource
) => omitBy(studioResource, (_, key) => key.trim().startsWith('_'));

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

export type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
  plugins?: {
    customise: boolean;
    plugins: { key: string; expanded: boolean }[];
  };
}>;

const StudioContainer: React.FunctionComponent = () => {
  const [
    studioResource,
    setStudioResource,
  ] = React.useState<StudioResource | null>(null);
  const [workspaceIds, setWorkspaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();
  const history = useHistory();
  const studioContext = React.useContext(StudioReactContext);
  const { orgLabel, projectLabel, studioId } = studioContext;
  const notification = useNotification();

  React.useEffect(() => {
    fetchAndSetupStudio();
  }, [orgLabel, projectLabel, studioId]);

  const fetchAndSetupStudio = React.useCallback(() => {
    nexus.Resource.get(orgLabel, projectLabel, studioId)
      .then(value => {
        const studioResource: StudioResource = value as StudioResource;
        /* TODO: find a better solution to dealing with json-ld's arrays
         for singular objects when we actually expect type to be singular */
        if (
          Array.isArray(studioResource.plugins) &&
          studioResource.plugins.length > 0
        ) {
          studioResource.plugins = studioResource.plugins[0];
        } else {
          studioResource.plugins = undefined;
        }
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
              message: 'Access error',
              description: message,
            });
          });
        } else {
          notification.error({
            message: 'Failed to load the studio',
            description: parseNexusError(e),
          });
        }
      });
  }, [orgLabel, projectLabel, studioId]);

  const updateStudio = async (
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ) => {
    if (studioResource) {
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        studioId,
        studioResource._rev,
        {
          // remove the metadata from the payload, delta do full update
          // and not accept the metadata fields to be in the payload
          ...resourceWithoutMetadata(studioResource),
          label,
          description,
          plugins,
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
            description: parseNexusError(error),
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
        <div
          style={{
            minHeight: '800px',
          }}
        >
          <StudioHeader
            resource={studioResource}
            markdownViewer={MarkdownViewerContainer}
          >
            {resourcesWritePermissionsWrapper(
              editButton,
              `/${orgLabel}/${projectLabel}`
            )}
          </StudioHeader>
          <WorkspaceMenuContainer
            workspaceIds={workspaceIds}
            studioResource={studioResource}
            onListUpdate={fetchAndSetupStudio}
          />
        </div>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default StudioContainer;
