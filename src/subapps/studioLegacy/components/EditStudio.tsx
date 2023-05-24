import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { SaveImageHandler } from 'react-mde';
import { Button, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import StudioEditorForm from './StudioEditorForm';

export type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const EditStudio: React.FC<{
  studio: StudioResource | null;
  onSave?(
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ): void;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({ studio, onSave, onSaveImage, markdownViewer }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleUpdate = (
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ) => {
    setShowModal(false);
    onSave && onSave(label, description, plugins);
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
        open={showModal}
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
