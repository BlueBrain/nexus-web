import * as React from 'react';
import { Button, Modal } from 'antd';

const AddDashboard: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button icon="plus" onClick={() => setShowModal(true)}>
        Add Dashboard
      </Button>
      <Modal
        title="Create a new Dashboard"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <p>Coming Soon!</p>
      </Modal>
    </>
  );
};

export default AddDashboard;
