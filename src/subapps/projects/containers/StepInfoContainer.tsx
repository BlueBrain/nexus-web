import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, Button } from 'antd';
import { Resource } from '@bbp/nexus-sdk';

import { fetchChildrenForStep, fetchTopLevelSteps } from '../utils';
import { StepResource } from '../types';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import MarkdownEditorComponent from '../../../shared/components/MarkdownEditor';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';

const StepInfoContainer: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}> = ({ step, projectLabel, orgLabel, onUpdate }) => {
  const nexus = useNexusContext();
  const notification = useNotification();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [parentLabel, setParentLabel] = React.useState<string>();
  const [informedByIds, setInformedByIds] = React.useState<string[]>([]);
  const [originalPayload, setOriginalPayload] = React.useState<StepResource>();
  const [siblings, setSiblings] = React.useState<
    { name: string; '@id': string }[]
  >([]);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);

  React.useEffect(() => {
    nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id'])
    )
      .then(response => setOriginalPayload(response as StepResource))
      .catch(error =>
        notification.error({
          message: 'Failed to load original payload',
          description: parseNexusError(error),
        })
      );

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
        .catch(error =>
          notification.error({
            message: 'Failed to load parent activity',
            description: parseNexusError(error),
          })
        );
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

  const updateStepInfo = (data: any) => {
    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id']),
      step._rev,
      {
        ...originalPayload,
        ...data,
        '@type': fusionConfig.workflowStepType,
      }
    );
  };

  const updateStep = (data: any) => {
    updateStepInfo(data)
      .then(response => {
        onUpdate();
        setShowForm(false);
        notification.success({
          message: `Workflow Step ${data.name} updated successfully`,
        });
      })
      .catch(error =>
        notification.error({
          message: 'Failed to update Workflow Step',
          description: parseNexusError(error),
        })
      );
  };

  const saveDescription = (value: string) => {
    const data = {
      description: value,
    };

    updateStepInfo(data)
      .then(response => {
        onUpdate();
        setIsEditingDescription(false);
        notification.success({
          message: `Workflow Step ${step.name} updated successfully`,
        });
      })
      .catch(error =>
        notification.error({
          message: 'Failed to update description',
          description: parseNexusError(error),
        })
      );
  };

  return (
    <div>
      <Button onClick={() => setShowForm(true)}>Step Info</Button>
      <Drawer
        visible={showForm}
        destroyOnClose={true}
        onClose={() => setShowForm(false)}
        title={step.name}
        placement="right"
        closable
        width={600}
      >
        <div style={{ marginBottom: 40 }}>
          <h3>Description</h3>
          {isEditingDescription ? (
            <MarkdownEditorComponent
              resource={step as Resource}
              readOnly={false}
              loading={false}
              onSave={saveDescription}
              onCancel={() => setIsEditingDescription(false)}
              markdownViewer={MarkdownViewerContainer}
            />
          ) : (
            <MarkdownViewerContainer
              template={step.description || ''}
              data={step as Resource}
            />
          )}
          {!isEditingDescription && (
            <Button
              type="primary"
              onClick={() => setIsEditingDescription(!isEditingDescription)}
            >
              Edit Description
            </Button>
          )}
        </div>
        <div>
          <h3>Edit Workflow Step Information</h3>
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
            isFullForm
            hideDescription
          />
        </div>
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
