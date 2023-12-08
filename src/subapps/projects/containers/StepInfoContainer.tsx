import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Drawer } from 'antd';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import MarkdownEditorComponent from '../../../shared/components/MarkdownEditor';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import useNotification, { parseNexusError } from '../../../shared/hooks/useNotification';
import { labelOf } from '../../../shared/utils';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import { StepResource } from '../types';
import { fetchChildrenForStep, fetchTablesForStep, fetchTopLevelSteps } from '../utils';

const StepInfoContainer: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}> = ({ step, projectLabel, orgLabel, onUpdate }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const notification = useNotification();
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [parentLabel, setParentLabel] = React.useState<string>();
  const [informedByIds, setInformedByIds] = React.useState<string[]>([]);
  const [originalPayload, setOriginalPayload] = React.useState<StepResource>();
  const [siblings, setSiblings] = React.useState<{ name: string; '@id': string }[]>([]);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);

  React.useEffect(() => {
    nexus.Resource.getSource(orgLabel, projectLabel, encodeURIComponent(step['@id']))
      .then((response) => setOriginalPayload(response as StepResource))
      .catch((error) =>
        notification.error({
          message: 'Failed to load original payload',
          description: parseNexusError(error),
        })
      );

    if (step.hasParent) {
      nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(step.hasParent['@id']))
        .then((response) => {
          const parent = response as StepResource;
          setParentLabel(parent.name);
        })
        .catch((error) =>
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
      const allSteps = (await fetchTopLevelSteps(nexus, orgLabel, projectLabel)) as StepResource[];
      siblingSet = allSteps.filter((step) => !step.hasParent);
    }

    setSiblings(
      siblingSet
        .filter((child) => {
          return child['@id'] !== step['@id'];
        })
        .map((child) => ({
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
      .then((response) => {
        onUpdate();
        setShowForm(false);
        notification.success({
          message: `Workflow Step ${data.name} updated successfully`,
        });
      })
      .catch((error) =>
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
      .then((response) => {
        onUpdate();
        setIsEditingDescription(false);
        notification.success({
          message: `Workflow Step ${step.name} updated successfully`,
        });
      })
      .catch((error) =>
        notification.error({
          message: 'Failed to update description',
          description: parseNexusError(error),
        })
      );
  };

  const fetchSubsteps = async (stepId: string) => {
    const children = (await fetchChildrenForStep(
      nexus,
      orgLabel,
      projectLabel,
      stepId
    )) as StepResource[];
    const grandchildren: StepResource[] = (
      await Promise.all(
        children.map(async (child) => {
          if (child['@id'] === stepId) return [];
          return (await fetchSubsteps(child['@id'])) as StepResource[];
        })
      )
    ).flat();

    return [...children, ...grandchildren];
  };

  const fetchNextSteps = async (step: StepResource) => {
    let siblings = [];
    if (step.hasParent) {
      siblings = (await fetchChildrenForStep(
        nexus,
        orgLabel,
        projectLabel,
        step['@id']
      )) as StepResource[];
    } else {
      siblings = (await fetchTopLevelSteps(nexus, orgLabel, projectLabel)) as StepResource[];
    }
    const nextSteps = siblings.filter((siblingStep) => {
      if (siblingStep.wasInformedBy) {
        if (Array.isArray(siblingStep.wasInformedBy)) {
          return siblingStep.wasInformedBy.find((informedBy) => informedBy['@id'] === step['@id']);
        }
        return siblingStep.wasInformedBy['@id'] === step['@id'];
      }
    });
    return nextSteps;
  };

  const deprecateSteps = async (steps: Resource[]) =>
    await Promise.all(
      steps.map((step) =>
        nexus.Resource.deprecate(orgLabel, projectLabel, encodeURIComponent(step['@id']), step._rev)
      )
    );

  const removePreviousStepLink = async (step: StepResource, previousStepIdToRemove: string) => {
    const originalPayload = await nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id'])
    );

    const originalWasInformedBy = (originalPayload as StepResource).wasInformedBy;
    let updatedWasInformedBy = [];

    if (originalWasInformedBy) {
      if (Array.isArray(originalWasInformedBy)) {
        updatedWasInformedBy = originalWasInformedBy.filter((informedBy: { '@id': string }) => {
          return informedBy['@id'] !== previousStepIdToRemove;
        });
      } else {
        if (originalWasInformedBy['@id'] === previousStepIdToRemove) {
          updatedWasInformedBy = [];
        }
      }
    }

    await nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id']),
      step._rev,
      {
        ...originalPayload,
        wasInformedBy: updatedWasInformedBy,
        '@type': fusionConfig.workflowStepType,
      }
    );
  };

  const deprecateStepAndDependents = async (step: StepResource) => {
    setBusy(true);
    try {
      const resultingStepsToDeprecate = [step, ...(await fetchSubsteps(step['@id']))];

      const tablesToDeprecate = (
        await Promise.all(
          resultingStepsToDeprecate
            .map(
              async (step) => await fetchTablesForStep(nexus, orgLabel, projectLabel, step['@id'])
            )
            .filter(async (tables) => (await tables).length > 0)
        )
      ).flat();

      await deprecateSteps(resultingStepsToDeprecate);

      tablesToDeprecate.map(async (table) => {
        await nexus.Resource.deprecate(
          orgLabel,
          projectLabel,
          encodeURIComponent(table['@id']),
          table._rev
        );
      });

      const nextSteps = await fetchNextSteps(step);
      nextSteps.map(async (nextStep) => {
        await removePreviousStepLink(nextStep, step['@id']);
      });

      setBusy(false);
      setShowForm(false);

      if (step.hasParent) {
        history.push(`/workflow/${orgLabel}/${projectLabel}/${labelOf(step.hasParent['@id'])}`);
      } else {
        history.push(`/workflow/${orgLabel}/${projectLabel}`);
      }

      notification.success({
        message: 'Workflow step successfully deprecated',
      });
    } catch (error) {
      setBusy(false);
      setShowForm(false);

      notification.error({
        message: 'Error occurred while deprecating workflow step',
      });
    }
  };

  return (
    <div>
      <Button onClick={() => setShowForm(true)}>Step Info</Button>
      <Drawer
        open={showForm}
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
            <MarkdownViewerContainer template={step.description || ''} data={step as Resource} />
          )}
          {!isEditingDescription && (
            <Button type="primary" onClick={() => setIsEditingDescription(!isEditingDescription)}>
              Edit Description
            </Button>
          )}
        </div>
        <div>
          <h3>Edit Workflow Step Information</h3>
          <WorkflowStepWithActivityForm
            onClickCancel={() => setShowForm(false)}
            onSubmit={updateStep}
            onDeprecate={() => deprecateStepAndDependents(step)}
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
      informedByIds = step.wasInformedBy.map((i) => {
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
