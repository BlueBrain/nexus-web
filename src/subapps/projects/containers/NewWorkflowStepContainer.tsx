import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';
import { isSubClass } from '../utils';

export type WorkflowStepMetadata = {
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

const NewWorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onSuccess(): void;
  parentStepLabel?: string;
  parentStepSelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  orgLabel,
  projectLabel,
  onSuccess,
  parentStepLabel,
  parentStepSelfUrl,
  siblings,
}) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [subClassesOfActivity, setSubClassesOfActivity] = React.useState<any[]>(
    []
  );

  const {
    datamodelsOrg,
    datamodelsProject,
    datamodelsActivityId,
  } = fusionConfig;

  const fetchSubClasses = (id: string, acc: string[]) => {
    nexus.Resource.links(
      datamodelsOrg,
      datamodelsProject,
      encodeURIComponent(id),
      'incoming'
    )
      .then((response: any) => {
        if (response._total > 0) {
          const links = response._results.filter((link: any) =>
            isSubClass(link)
          );

          const linksIds = links.map((link: any) => link['@id']);

          Promise.all(
            links.map((link: any) => {
              fetchSubClasses(link['@id'], [...linksIds, ...acc]);
            })
          );
        } else {
          setSubClassesOfActivity([...acc]);
        }
      })
      .catch(error => console.log('error', error));
  };

  React.useEffect(() => {
    fetchSubClasses(datamodelsActivityId, []);
  }, []);

  console.log('subClassesOfActivity', subClassesOfActivity);

  const submitNewStep = (data: WorkflowStepMetadata) => {
    setBusy(true);
    const { name } = data;

    if (parentStepSelfUrl) {
      data.hasParent = {
        '@id': parentStepSelfUrl,
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
          description: 'Updating Workflow...',
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
        <WorkflowStepWithActivityForm
          title="Create New Step"
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitNewStep}
          busy={busy}
          parentLabel={parentStepLabel}
          siblings={siblings}
        />
      </Modal>
    </>
  );
};

export default NewWorkflowStepContainer;
