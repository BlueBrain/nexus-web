import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActivityForm from '../components/Activities/ActivityForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import TemplateCard from '../components/Activities/TemplateCard';

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
  onSuccess(): void;
}> = ({ orgLabel, projectLabel, onSuccess }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [showTemplates, setShowTemplates] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const submitActivity = (data: ActivityMetadata) => {
    setBusy(true);
    const { name } = data;

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

        notification.error({
          message: 'An error occurred',
          description:
            error.message || error.reason || 'An unknown error occurred',
          duration: 3,
        });
      });
  };

  const templates = [
    {
      name: 'Single Cell Model',
      description: 'This is an example description',
      version: 1.0,
      updatedOn: '2020-09-10T09:40:58Z',
      totalContributors: 2,
      author: 'Author',
    },
    {
      name: 'Morphology Visualisation',
      description: 'This is an example description',
      version: 1.2,
      updatedOn: '2020-09-15T09:40:58Z',
      totalContributors: 1,
      author: 'Author',
    },
  ];

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
          busy={busy}
        />
      </Modal>
      <ActioButton
        icon="Add"
        onClick={() => setShowTemplates(true)}
        title="Add activities from template"
      />
      <Modal
        visible={showTemplates}
        footer={null}
        onCancel={() => setShowTemplates(false)}
        width={700}
        destroyOnClose={true}
      >
        <div>
          <h2>Select Template</h2>
          {templates.length &&
            templates.map(template => <TemplateCard template={template} />)}
        </div>
      </Modal>
    </>
  );
};

export default NewActivityContainer;
