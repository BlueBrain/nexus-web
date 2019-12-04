import * as React from 'react';
import { Button, Modal } from 'antd';

import StudioEditorForm from '../components/Studio/StudioEditorForm';

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
        footer={null}
        onCancel={() => setShowModal(false)}
      >
        <StudioEditorForm />
      </Modal>  
    </div>
  );
}

export default CreateStudioContainer;