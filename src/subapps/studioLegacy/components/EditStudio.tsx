import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Button, Modal, Tooltip } from 'antd';

import StudioEditorForm from './StudioEditorForm';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const EditStudio: React.FC<{
  studio: StudioResource | null;
  onSave?(label: string, description?: string): void;
}> = ({ studio, onSave }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleUpdate = (label: string, description?: string) => {
    setShowModal(false);
    onSave && onSave(label, description);
  };

  return (
    <>
      <Button
        className="studio-button"
        type="link"
        onClick={() => setShowModal(true)}
      >
        Edit Studio
      </Button>
      <Modal
        title="Edit Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
        destroyOnClose={true}
      >
        <StudioEditorForm saveStudio={handleUpdate} studio={studio} />
      </Modal>
    </>
  );
};

export default EditStudio;
