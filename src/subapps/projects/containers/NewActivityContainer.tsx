import * as React from 'react';
import { Modal, notification } from 'antd';

import ActivityForm from '../components/ActivityForm';

import ActioButton from '../components/ActionButton';

import { Status } from '../components/StatusIcon';

export type ActivityMetadata = {
  name: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
};

const NewActivityContainer: React.FC<{}> = () => {
  const [showForm, setShowForm] = React.useState<boolean>(false);

  const submitActivity = (data: ActivityMetadata) => {
    console.log('hello!', data);
    setShowForm(false);
  };

  return (
    <>
      <ActioButton
        icon="Add"
        onClick={() => setShowForm(true)}
        title="Add new activity"
      />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={1150}
        destroyOnClose={true}
      >
        <ActivityForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitActivity}
          //   busy={busy}
        />
      </Modal>
    </>
  );
};

export default NewActivityContainer;
