import * as React from 'react';
import { Badge, Button, Popover, Modal } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import { useRouteMatch } from 'react-router';
import NotififcationsPopover from '../components/NotificationsPopover';
import { useUnlinkedActivities } from '../hooks/useUnlinkedActivities';
import LinkActivityForm from '../components/LinkActivityForm';
import fusionConfig from '../config';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import { labelOf } from '../../../shared/utils';
import { WorkflowStepMetadata } from '../types';
import { WORKFLOW_STEP_CONTEXT } from '../fusionContext';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';

const ActivitiesLinkingContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const { unlinkedActivities, fetchUnlinkedActivities } = useUnlinkedActivities(
    orgLabel,
    projectLabel
  );
  const notification = useNotification();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    stepId: string;
  }>();
  const currentStepId = match.params.stepId;
  const [showLinkForm, setShowLinkForm] = React.useState<boolean>(false);
  const [showCreateStepForm, setshowCreateStepForm] = React.useState<boolean>(
    false
  );
  const [selectedActivity, setSelectedActivity] = React.useState<any>();
  const [steps, setSteps] = React.useState<any[]>([]);

  const [busy, setBusy] = React.useState<boolean>(false);
  const nexus = useNexusContext();

  const fetchSiblings = () => {
    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.workflowStepType,
      size: 99,
      deprecated: false,
    })
      .then(response => {
        fetchWorkflowSteps(response._results);
      })
      .catch(error => {
        notification.error({
          message: 'Failed to load the list of Workflow Steps',
          description: parseNexusError(error),
        });
      });
  };

  const fetchWorkflowSteps = (workFlowSteps: any) => {
    Promise.all(
      workFlowSteps.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    )
      .then(response => setSteps(response))
      .catch(error => {
        notification.error({
          message: 'Failed to fetch Activities',
          description: parseNexusError(error),
        });
      });
  };

  const onClickLinkActivity = (id: string) => {
    setSelectedActivity(
      unlinkedActivities.find(activity => activity.resourceId === id)
    );
    fetchSiblings();
    setShowLinkForm(true);
  };

  const updateWorkflowStep = (stepId: string, originalPayload: any) => {
    const updatedPayload = originalPayload;

    if (originalPayload[fusionConfig.activityWorkflowLink]) {
      updatedPayload[fusionConfig.activityWorkflowLink] = Array.isArray(
        originalPayload[fusionConfig.activityWorkflowLink]
      )
        ? [
            ...originalPayload[fusionConfig.activityWorkflowLink],
            {
              '@id': selectedActivity.resourceId,
            },
          ]
        : [
            originalPayload[fusionConfig.activityWorkflowLink],
            {
              '@id': selectedActivity.resourceId,
            },
          ];
    } else {
      updatedPayload[fusionConfig.activityWorkflowLink] = {
        '@id': selectedActivity.resourceId,
      };
    }

    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId),
      steps.find(step => step['@id'] === stepId)._rev,
      {
        ...updatedPayload,
      }
    );
  };

  const linkActivity = (stepId: string) => {
    setShowLinkForm(false);

    nexus.Resource.getSource(orgLabel, projectLabel, encodeURIComponent(stepId))
      .then(response => updateWorkflowStep(stepId, response))
      .then(() => {
        notification.success({
          message: 'The activity is linked successfully',
        });
        //  TODO: find a better solution
        const reloadTimer = setTimeout(() => {
          fetchUnlinkedActivities();
          clearTimeout(reloadTimer);
        }, 4000);
      })
      .catch(error =>
        notification.error({
          message: 'Oops! Something went wrong - the Activity was not linked',
          description: parseNexusError(error),
        })
      );
  };

  const addNew = (id: string) => {
    const selectedUnlinkedActivities = unlinkedActivities.find(
      activity => activity.resourceId === id
    );

    fetchSiblings();

    if (selectedUnlinkedActivities) {
      setSelectedActivity(selectedUnlinkedActivities);
      setshowCreateStepForm(true);
    }
  };

  const createNewStep = (data: WorkflowStepMetadata) => {
    setBusy(true);

    data['nxv:activities'] = [
      {
        '@id': selectedActivity.resourceId,
      },
    ];

    const { name } = data;

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      '@context': WORKFLOW_STEP_CONTEXT['@id'],
      hasParent: {
        '@id': currentStepId,
      },
      ...data,
    })
      .then(() => {
        setshowCreateStepForm(false);
        setBusy(false);
        notification.success({
          message: `New step ${name} created successfully`,
        });
      })
      .catch(error => {
        setshowCreateStepForm(false);
        setBusy(false);
        notification.error({
          message: 'An error occurred',
          description: parseNexusError(error),
        });
      });
  };

  const stepsList = steps.map(step => {
    const parentSteps: { id: string; name: string }[] = [];
    let stepTraversal = step;
    while (stepTraversal.hasParent) {
      stepTraversal = steps.find(
        step => step['@id'] === stepTraversal.hasParent['@id']
      );
      parentSteps.push({ id: stepTraversal['@id'], name: stepTraversal.name });
    }
    return {
      parentSteps,
      id: step['@id'],
      name: step.name,
    } as {
      id: string;
      name: string;
      parentSteps: { id: string; name: string }[];
    };
  });

  const defaultActivityType = () => {
    if (selectedActivity) {
      const types = Array.from(
        selectedActivity.resourceType as string[]
      ).map(type => labelOf(type));

      return types.find(type => type !== 'Activity');
    }

    return undefined;
  };

  const sibilings = React.useMemo(() => {
    return steps.map(s => ({ '@id': s._self, name: s.name }));
  }, [steps]);

  const currentStep = React.useMemo(() => {
    return steps.find(s => {
      return s['@id'].includes(currentStepId);
    });
  }, [steps, currentStepId]);

  return (
    <>
      <Popover
        placement="bottomRight"
        title={
          <h3
            style={{ marginTop: '7px' }}
          >{`${unlinkedActivities.length} detached activities`}</h3>
        }
        content={
          <NotififcationsPopover
            activities={unlinkedActivities}
            onClickLinkActivity={onClickLinkActivity}
            onClickNew={addNew}
          />
        }
        trigger="click"
      >
        <Badge count={unlinkedActivities.length}>
          <Button
            icon={<BellOutlined style={{ color: 'inherit' }} />}
            shape="circle"
            style={{ marginLeft: '7px' }}
          />
        </Badge>
      </Popover>
      <Modal
        maskClosable
        open={showLinkForm}
        footer={null}
        onCancel={() => setShowLinkForm(false)}
        width={600}
        destroyOnClose={true}
      >
        <LinkActivityForm
          activity={selectedActivity}
          stepsList={stepsList}
          onSubmit={linkActivity}
          onCancel={() => setShowLinkForm(false)}
        />
      </Modal>
      <Modal
        maskClosable
        open={showCreateStepForm}
        footer={null}
        onCancel={() => setshowCreateStepForm(false)}
        width={1200}
        destroyOnClose={true}
      >
        <WorkflowStepWithActivityForm
          title="Create new Workflow Step"
          onClickCancel={() => setshowCreateStepForm(false)}
          onSubmit={createNewStep}
          busy={false}
          parentLabel={currentStep ? currentStep.name : ''}
          siblings={sibilings}
          activityList={[]}
          defaultActivityType={defaultActivityType()}
          isFullForm
        />
      </Modal>
    </>
  );
};

export default ActivitiesLinkingContainer;
