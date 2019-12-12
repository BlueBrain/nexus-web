import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Button, Modal, Tooltip } from 'antd';

import StudioEditorForm from './StudioEditorForm';

export type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: { '@id': string }[];
}>;

export type StudioResourceResponse = Resource & {
  label: StudioResource['label'];
  description?: StudioResource['description'];
  workspaces?: string[];
};

const EditStudio: React.FC<{
  studio: StudioResource | null;
  onSave?(label: string, desription?: string): void;
}> = ({ studio, onSave }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleUpdate = (label: string, desription?: string) => {
    setShowModal(false);
    onSave && onSave(label, desription);
  };

  return (
    <>
      <Tooltip placement="topLeft" title="Edit Studio" arrowPointAtCenter>
        <Button
          className="studio-button"
          icon="edit"
          onClick={() => setShowModal(true)}
        >
          Edit Studio
        </Button>
      </Tooltip>
      <Modal
        title="Edit Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <StudioEditorForm saveStudio={handleUpdate} studio={studio} />
      </Modal>
    </>
  );
};

export default EditStudio;
