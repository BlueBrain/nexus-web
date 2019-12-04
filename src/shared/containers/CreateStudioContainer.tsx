import * as React from 'react';
import { Button, Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import StudioEditorForm from '../components/Studio/StudioEditorForm';

const CreateStudioContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateStudioResource = (label: string) => ({
    '@context': 'https://bluebrainnexus.io/studio/context',
    label,
    '@type': 'Studio',
  });

  const saveStudio = (label: string) => {
    setShowModal(false);

    nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateStudioResource(label),
    );
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