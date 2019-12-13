import * as React from 'react';
import { Button, Modal, notification } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import WorkspaceEditorForm from '../components/Studio/WorkspaceEditorForm';

const DEFAULT_WORKSPACE_TYPE = 'StudioWorkspace';

const DEFAULT_WORKSPACE_CONTEXT = 'https://bluebrainnexus.io/studio/context';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const AddWorkspaceContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  studio: StudioResource;
  onAddWorkspace?(): void;
}> = ({ orgLabel, projectLabel, studio, onAddWorkspace }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateWorkspaceResource = (label: string, description?: string) => ({
    label,
    description,
    '@context': DEFAULT_WORKSPACE_CONTEXT,
    '@type': DEFAULT_WORKSPACE_TYPE,
    dashboards: [],
  });

  const createWorkspaceResource = async (
    label: string,
    description?: string
  ) => {
    return await nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateWorkspaceResource(label, description)
    );
  };

  const updatedWorkspacesList = (newWorkspaceId: string) => {
    const workSpacelist = Array.isArray(studio.workspaces)
      ? studio.workspaces
      : [studio.workspaces];

    return [newWorkspaceId, ...workSpacelist];
  };

  const saveWorkspace = (label: string, description?: string) => {
    setShowModal(false);

    createWorkspaceResource(label, description)
      .then(async response => {
        const newWorkspaceId = response['@id'];

        await nexus.Resource.update(
          orgLabel,
          projectLabel,
          encodeURIComponent(studio['@id']),
          studio._rev,
          {
            ...studio,
            workspaces: updatedWorkspacesList(newWorkspaceId),
          }
        );
      })
      .then(response => {
        notification.success({
          message: 'Workspace was created successfully',
          duration: 2,
        });

        !!onAddWorkspace && onAddWorkspace();
      })
      .catch(error => {
        notification.error({
          message: 'An error occurred',
          description: error.reason || error.message,
          duration: 3,
        });
      });
  };

  return (
    <>
      <Button icon="plus" onClick={() => setShowModal(true)}>
        Add Workspace
      </Button>
      <Modal
        title="Create a new Workspace"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <WorkspaceEditorForm saveWorkspace={saveWorkspace} />
      </Modal>
    </>
  );
};

export default AddWorkspaceContainer;
