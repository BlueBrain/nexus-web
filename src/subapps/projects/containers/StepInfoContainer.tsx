import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, Button } from 'antd';
import { fetchChildrenForStep, fetchTopLevelSteps } from '../utils';
import { displayError, successNotification } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
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
  const [informedByIds, setInformedByIds] = React.useState<string[]>([]);
  const [originalPayload, setOriginalPayload] = React.useState<StepResource>();
  const [siblings, setSiblings] = React.useState<
    { name: string; '@id': string }[]
  >([]);

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

    setInformedByIds(parseWasInformedById(step));

    fetchChildren(step);
  }, [step]);

  const fetchChildren = async (step: StepResource) => {
    let siblingSet;
    if (step && step.hasParent) {
      siblingSet = (await fetchChildrenForStep(
        nexus,
        orgLabel,
        projectLabel,
        step.hasParent['@id']
      )) as StepResource[];
    } else {
      const allSteps = (await fetchTopLevelSteps(
        nexus,
        orgLabel,
        projectLabel
      )) as StepResource[];
      siblingSet = allSteps.filter(step => !step.hasParent);
    }

    setSiblings(
      siblingSet
        .filter(child => {
          return child['@id'] !== step['@id'];
        })
        .map(child => ({
          name: child.name,
          '@id': child._self,
        }))
    );
  };

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
        title="Edit Workflow Step information"
        placement="right"
        closable
        width={600}
      >
        <WorkflowStepWithActivityForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={updateStep}
          busy={busy}
          parentLabel={parentLabel}
          informedByIds={informedByIds}
          siblings={siblings}
          layout="vertical"
          workflowStep={step}
          activityList={[]}
          allowActivitySearch={false}
        />
      </Drawer>
    </div>
  );
};

export default StepInfoContainer;
/**
 *
 * @param step
 * Check wasInformedBy. Add full url Ids.
 */
function parseWasInformedById(step: StepResource) {
  let informedByIds: string[] = [];
  if (step.wasInformedBy) {
    if (Array.isArray(step.wasInformedBy)) {
      informedByIds = step.wasInformedBy.map(i => {
        const fullId = step._self.replace(step['@id'], i['@id']);
        return fullId;
      });
    } else {
      const fullId = step._self.replace(step['@id'], step.wasInformedBy['@id']);
      informedByIds = [fullId];
    }
  }
  return informedByIds;
}
