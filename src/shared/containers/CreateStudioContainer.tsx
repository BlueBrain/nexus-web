import * as React from 'react';
import { Button, Modal } from 'antd';

const CreateStudioContainer: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  const saveStudio = () => {
    // nothing here yet
    setShowModal(false);
    // save stuff and redirect to studio view
  }

  return (
    <div style={{margin: '20px 0 0'}}>
      <Button type="primary" block onClick={() => setShowModal(true)}>Create Studio</Button>
      <Modal
        title="Create Studio"
        visible={showModal}
        onOk={saveStudio}
        onCancel={() => setShowModal(!showModal)}
      >
        <div>Hello</div>
        <p>Create Studio Form goes here</p>
      </Modal>  
    </div>
  );
}

export default CreateStudioContainer;