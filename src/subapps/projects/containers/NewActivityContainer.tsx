import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActivityForm from '../components/WorkflowSteps/ActivityForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';

export type ActivityMetadata = {
  name: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
  hasParent?: {
    '@id': string;
  };
  wasInformedBy?: {
    '@id': string;
  };
};

const NewActivityContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onSuccess(): void;
  parentActivityLabel?: string;
  parentActivitySelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  orgLabel,
  projectLabel,
  onSuccess,
  parentActivityLabel,
  parentActivitySelfUrl,
  siblings,
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
      '@type': fusionConfig.workflowStepType,
      ...data,
    })
      .then(() => {
        onSuccess();
        setShowForm(false);
        setBusy(false);

        notification.success({
          message: `New step ${name} created successfully`,
          description: 'Updating workflow...',
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
        title="Add step"
      />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={1150}
        destroyOnClose={true}
      >
        {/* TODO: adapt form https://github.com/BlueBrain/nexus/issues/1814 */}
        <ActivityForm
          title="Create New Step (will be updated soon)"
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitActivity}
          busy={busy}
          parentLabel={parentActivityLabel}
          siblings={siblings}
        />
      </Modal>
    </>
  );
};

export default NewActivityContainer;
