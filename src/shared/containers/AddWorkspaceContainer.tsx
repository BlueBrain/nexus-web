import * as React from 'react';
import { Button, Modal, notification } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import WorkspaceEditorForm from '../components/Studio/WorkspaceEditorForm';

const DEFAULT_WORKSPACE_TYPE = 'StudioWorkspace';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const AddWorkspaceContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  studio: StudioResource;
}> = ({ orgLabel, projectLabel, studio }) => {
  console.log('studio', studio);
  
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateWorkspaceResource = (label: string, description?: string) => ({
    '@context': 'https://bluebrainnexus.io/studio/context',
    '@type': DEFAULT_WORKSPACE_TYPE,
    label: label,
    description: description,
    dashboards: [],
  });

  const createWorkspaceResource = async (label: string, description?: string) => {    
    return await nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateWorkspaceResource(label, description),
    );
  }

  const saveWorkspace = (label: string, description?: string) => {
    setShowModal(false);

    createWorkspaceResource(label, description).then(async response => {
      const newWorkspaceId = response['@id'];
      
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        studio['@id'],
        studio._rev,
        {
          workspaces: [newWorkspaceId, ...studio.workspaces || []],
        }
      )
    }).then(response => {  
      console.log('response', response);

      //we need to add workspaceId to studio workspaces
          
      notification.success({
        message: 'Workspace was created successfully',
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
