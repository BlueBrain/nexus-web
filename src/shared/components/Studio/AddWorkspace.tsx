import * as React from 'react';
import { Button, Modal } from 'antd';

const AddWorkspace: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)} icon="plus" />
      <Modal
        title="Create a new Workspace"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <p>Hello</p>
      </Modal>
    </>
  );
}

export default AddWorkspace;