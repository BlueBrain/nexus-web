import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActivityForm from '../components/Activities/ActivityForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import { displayError } from '../components/Notifications';

const ACTIVITY_TYPE = 'FusionActivity';

export type ActivityMetadata = {
  name: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
  hasParent?: {
    '@id': string;
  };
};

const NewActivityContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onSuccess(): void;
  parentActivityLabel?: string;
  parentActivitySelfUrl?: string;
}> = ({
  orgLabel,
  projectLabel,
  onSuccess,
  parentActivityLabel,
  parentActivitySelfUrl,
}) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const submitActivity = (data: ActivityMetadata) => {
    setBusy(true);
    const { name } = data;

    if (parentActivitySelfUrl) {
      data.hasParent = {
        '@id': parentActivitySelfUrl,
      };
    }

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': ACTIVITY_TYPE,
      ...data,
    })
      .then(() => {
        onSuccess();
        setShowForm(false);
        setBusy(false);

        notification.success({
          message: `Activity ${name} created successfully`,
          description: 'Updating activities...',
        });
      })
      .catch(error => {
        setShowForm(false);
        setBusy(false);
        displayError(error, 'An error occurred');
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
        destroyOnClose={true}
      >
        <ActivityForm
          title="Create New Activity"
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitActivity}
          busy={busy}
          parentLabel={parentActivityLabel}
        />
      </Modal>
    </>
  );
};

export default NewActivityContainer;
