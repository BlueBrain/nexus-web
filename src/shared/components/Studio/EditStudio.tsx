import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Button, Modal } from 'antd';

import StudioEditorForm from './StudioEditorForm';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const EditStudio: React.FC<{
  studio: StudioResource | null,
}> = ({ studio }) => {
  // we need to get studio somewhere
  const [showModal, setShowModal] = React.useState(false);
  console.log('studio', studio);
  

  const saveStudio = () => {
    // do something here
  }

  return (
    <>
      <Button icon="edit" onClick={() => setShowModal(true)} />
      <Modal
        title="Edit Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <StudioEditorForm saveStudio={saveStudio} />
      </Modal>  
    </>
  );
}

export default EditStudio;