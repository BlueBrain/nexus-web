import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { SaveImageHandler } from 'react-mde';
import { Button, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import StudioEditorForm from './StudioEditorForm';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const EditStudio: React.FC<{
  studio: StudioResource | null;
  onSave?(label: string, description?: string): void;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({ studio, onSave, onSaveImage, markdownViewer }) => {
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
        icon={<EditOutlined />}
        onClick={() => setShowModal(true)}
      >
        Edit Studio
      </Button>
      <Modal
        wrapClassName="studio-editor-wrapper"
        title="Edit Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
        width="50%"
        destroyOnClose={true}
      >
        <StudioEditorForm
          saveStudio={handleUpdate}
          studio={studio}
          onSaveImage={onSaveImage}
          markdownViewer={markdownViewer}
        />
      </Modal>
    </>
  );
};

export default EditStudio;
