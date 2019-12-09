import * as React from 'react';
import { Button, Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import WorkspaceEditorForm from '../components/Studio/WorkspaceEditorForm';

const AddWorkspaceContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateWorkspaceResource = (label: string, description?: string) => ({
    // generateWorkspaceResource here
  });

  const createWorkspaceResource = async (label: string, description?: string) => {
    console.log('orgLabel', orgLabel);
    console.log('projectLabel', projectLabel);
    console.log('label', label);
    
    
    // return await nexus.Resource.create(
    //   // orgLabel,
    //   // projectLabel,
    //   // generateStudioResource(label, description),
    // );
  }

  const saveWorkspace = (label: string, description?: string) => {
    setShowModal(false);

    createWorkspaceResource(label, description).then(response => {      
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
