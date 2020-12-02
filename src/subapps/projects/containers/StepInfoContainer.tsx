import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, Button } from 'antd';

import { displayError, successNotification } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import ActivityForm from '../components/WorkflowSteps/ActivityForm';
import fusionConfig from '../config';

const StepInfoContainer: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}> = ({ step, projectLabel, orgLabel, onUpdate }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [parentLabel, setParentLabel] = React.useState<string>();
  const [informedByLabel, setInfomedByLabel] = React.useState<string>();
  const [originalPayload, setOriginalPayload] = React.useState<StepResource>();

  React.useEffect(() => {
    nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id'])
    )
      .then(response => setOriginalPayload(response as StepResource))
      .catch(error => displayError(error, 'Failed to load original payload'));

    if (step.hasParent) {
      nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(step.hasParent['@id'])
      )
        .then(response => {
          const parent = response as StepResource;
          setParentLabel(parent.name);
        })
        .catch(error => displayError(error, 'Failed to load parent activity'));
    }

    if (step.wasInformedBy) {
      nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(step.wasInformedBy['@id'])
      )
        .then(response => {
          const inputStep = response as StepResource;
          setInfomedByLabel(inputStep.name);
        })
        .catch(error =>
          displayError(error, 'Failed to load parent Workflow Step')
        );
    }
  }, [step]);

  const updateStep = (data: any) => {
    nexus.Resource.update(orgLabel, projectLabel, step['@id'], step._rev, {
      ...originalPayload,
      ...data,
      '@type': fusionConfig.workflowStepType,
    })
      .then(response => {
        onUpdate();
        setShowForm(false);
        successNotification(`Workflow Step ${data.name} updated successfully`);
      })
      .catch(error => displayError(error, 'Failed to update Workflow Step'));
  };

  return (
    <div>
      <Button onClick={() => setShowForm(true)}>Step Info</Button>
      <Drawer
        visible={showForm}
        destroyOnClose={true}
        onClose={() => setShowForm(false)}
        title="Edit Workflow Step information (will be updated soon)"
        placement="right"
        closable
        width={600}
      >
        {/* TODO: update activity form to be step form  https://github.com/BlueBrain/nexus/issues/1814*/}
        <ActivityForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={updateStep}
          busy={busy}
          parentLabel={parentLabel}
          informedByLabel={informedByLabel}
          layout="vertical"
          activity={step}
        />
      </Drawer>
    </div>
  );
};

export default StepInfoContainer;
