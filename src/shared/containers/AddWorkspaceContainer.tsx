import * as React from 'react';
import { Button, Modal } from 'antd';

import WorkspaceEditorForm from '../components/Studio/WorkspaceEditorForm';

const AddWorkspace: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

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
        <WorkspaceEditorForm />
      </Modal>
    </>
  );
};

export default AddWorkspace;
