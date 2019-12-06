import * as React from 'react';
import { Button, Modal, Tooltip } from 'antd';

const AddWorkspace: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Tooltip placement="topLeft" title="Add Workspace" arrowPointAtCenter>
        <Button className="studio-button" onClick={() => setShowModal(true)} icon="plus" />
      </Tooltip>
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