import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActivityForm from '../components/Activities/ActivityForm';

import ActioButton from '../components/ActionButton';

import { Status } from '../components/StatusIcon';

const ACTIVITY_TYPE = 'FusionActivity';

export type ActivityMetadata = {
  name: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
};

const NewActivityContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const submitActivity = (data: ActivityMetadata) => {
    setBusy(true);
    const { name } = data;

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': ACTIVITY_TYPE,
      ...data,
    })
      .then(() => {
        setShowForm(false);

        notification.success({
          message: `Activity ${name} created successfully`,
        });
      })
      .catch(error => {
        setShowForm(false);

        notification.error({
          message: 'An error occurred',
          description:
            error.message || error.reason || 'An unknown error occurred',
          duration: 3,
        });
      });
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
        destroyOnClose
      >
        <ActivityForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitActivity}
          busy={busy}
        />
      </Modal>
    </>
  );
};

export default NewActivityContainer;
