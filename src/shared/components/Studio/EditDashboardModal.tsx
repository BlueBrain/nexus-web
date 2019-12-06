import * as React from 'react';
import { Modal } from 'antd';

const EditDashboardModal: React.FC<{
  id: string;
  label?: string;
  description?: string;
}> = ({ id, label, description }) => {
  const [showModal, setShowModal] = React.useState(true);

  // Reset whenever dashboard changes b/c
  // all dashboards effectively share the same edit modal
  React.useEffect(() => {
    setShowModal(true);
  }, [id]);

  return (
    <Modal
      title={`Edit ${label || 'Dashboard'}`}
      visible={showModal}
      footer={null}
      onCancel={() => setShowModal(false)}
    >
      <p>Coming Soon!</p>
      <p>{description}</p>
    </Modal>
  );
};

export default EditDashboardModal;
