import * as React from 'react';
import { Button, Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import StudioEditorForm from '../components/Studio/StudioEditorForm';

const CreateStudioContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  goToStudio?(studioId: string): void;
}> = ({ orgLabel, projectLabel, goToStudio }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateStudioResource = (label: string) => ({
    // FIX LATER: '@context': 'https://bluebrainnexus.io/studio/context',
    label,
    '@type': 'https://bluebrainnexus.io/studio/vocabulary/Studio',
  });

  const createStudioResource = async (label: string) => {
    return await nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateStudioResource(label),
    );
  }

  const saveStudio = (label: string) => {
    setShowModal(false);

    createStudioResource(label).then(response => {
      goToStudio && goToStudio(response['@id']);
      
      notification.success({
        message: 'Studio was created successfully',
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
    <div style={{margin: '20px 0 0'}}>
      <Button type="primary" block onClick={() => setShowModal(true)}>Create Studio</Button>
      <Modal
        title="Create Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <StudioEditorForm saveStudio={saveStudio} />
      </Modal>  
    </div>
  );
}

export default CreateStudioContainer;