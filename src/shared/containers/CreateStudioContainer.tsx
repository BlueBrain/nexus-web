import * as React from 'react';
import { Button, Modal } from 'antd';

const CreateStudioContainer = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div style={{margin: '20px 0 0'}}>
      <Button type="primary" block onClick={() => setShowModal(!showModal)}>Create Studio</Button>
      <Modal
        title="Create Studio"
        visible={showModal}
        onOk={() => console.log('ok')}
        onCancel={() => setShowModal(!showModal)}
      >
        <div>Hello</div>
        <p>Create Studio Form goes here</p>
      </Modal>  
    </div>
  );
}

export default CreateStudioContainer;