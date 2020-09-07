import * as React from 'react';
import { Modal, notification } from 'antd';

import ActivityForm from '../components/ActivityForm';

import ActioButton from '../components/ActionButton';

const NewActivityContainer: React.FC<{}> = () => {
  const [showForm, setShowForm] = React.useState<boolean>(false);

  return (
    <div>
      <ActioButton
        icon="Add"
        onClick={() => setShowForm(true)}
        title="Add new activity"
      />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={1000}
        destroyOnClose={true}
      >
        <ActivityForm
        //   onClickCancel={handleCancel}
        //   onSubmit={submitProject}
        //   busy={busy}
        />
      </Modal>
    </div>
  );
};

export default NewActivityContainer;
