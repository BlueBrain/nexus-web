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
  studio: StudioResource | null;
  onSave?(label: string): void;
}> = ({ studio, onSave }) => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button icon="edit" onClick={() => setShowModal(true)} />
      <Modal
        title="Edit Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <StudioEditorForm saveStudio={onSave} studio={studio} />
      </Modal>  
    </>
  );
}

export default EditStudio;