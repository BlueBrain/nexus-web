import * as React from 'react';
import { Button, Modal } from 'antd';

const AddWorkspace: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button className="studio-button" onClick={() => setShowModal(true)} icon="plus" />
      <Modal
        title="Create a new Workspace"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <p>Hello, I will be updated in the next PR!</p>
      </Modal>
    </>
  );
}

export default AddWorkspace;