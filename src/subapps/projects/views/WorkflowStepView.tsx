import './WorkflowStepView.scss';

import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Modal, Spin } from 'antd';
import * as React from 'react';
import { useRouteMatch } from 'react-router';

import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';
import { labelOf } from '../../../shared/utils';
import { useProjectsSubappContext } from '..';
import AddComponentButton from '../components/AddComponentButton';
import Breadcrumbs from '../components/Breadcrumbs';
import ProjectPanel from '../components/ProjectPanel';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import TableContainer from '../containers/DraggableTablesContainer';
import InputsContainer from '../containers/InputsContainer';
import NewTableContainer from '../containers/NewTableContainer';
import SingleStepContainer from '../containers/SingleStepContainer';
import StepInfoContainer from '../containers/StepInfoContainer';
import { WORKFLOW_STEP_CONTEXT } from '../fusionContext';
import { StepResource, WorkflowStepMetadata } from '../types';
import { fetchChildrenForStep, isTable } from '../utils';
import { makeActivityTable,makeInputTable } from '../utils/tableUtils';

type BreadcrumbItem = {
  label: string;
  url: string;
};

const WorkflowStepView: React.FC = () => {
  const nexus = useNexusContext();
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    stepId: string;
  }>(`/${subapp.namespace}/:orgLabel/:projectLabel/:stepId`);
  const notification = useNotification();

  const [steps, setSteps] = React.useState<StepResource[]>([]);
  const [tables, setTables] = React.useState<any[] | undefined>([]);
  const [step, setStep] = React.useState<StepResource>();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  // switch to trigger updates
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);
  const [refreshTables, setRefreshTables] = React.useState<boolean>(false);
  const [siblings, setSiblings] = React.useState<
    { name: string; '@id': string }[]
  >([]);
  const [showStepForm, setShowStepForm] = React.useState<boolean>(false);
  const [showNewTableForm, setShowNewTableForm] = React.useState<boolean>(
    false
  );
  const [showDataSetForm, setShowDataSetForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const projectLabel = match?.params.projectLabel || '';
  const orgLabel = match?.params.orgLabel || '';
  const stepId = match?.params.stepId || '';

  const setupStepView = async () => {
    await nexus.Resource.get(orgLabel, projectLabel, stepId)
      .then(response => {
        setStep(response as StepResource);
        fetchBreadcrumbs(
          orgLabel,
          projectLabel,
          response as StepResource,
          setBreadcrumbs
        );
      })
      .catch(error =>
        notification.error({
          message: 'Failed to load activity',
          description: parseNexusError(error),
        })
      );

    await fetchChildren(stepId);
  };

  React.useEffect(() => {
    setBusy(true);
    Promise.all([setupStepView(), fetchTables()]).then(() => {
      setBusy(false);
    });
  }, [stepId]);

  React.useEffect(() => {
    setBusy(true);
    (async () => {
      await setupStepView();
      setBusy(false);
    })();
  }, [refreshSteps]);

  React.useEffect(() => {
    setBusy(true);
    (async () => {
      await fetchTables();
      setBusy(false);
    })();
  }, [refreshTables]);

  const fetchTables = async () => {
    await nexus.Resource.links(orgLabel, projectLabel, stepId, 'incoming', {
      deprecated: false,
    })
      .then(response => {
        // There may be duplicates in the link.
        const uniq = [
          ...new Set(
            response._results
              .filter(link => isTable(link))
              .map(link => link['@id'])
          ),
        ];
        Promise.all(
          uniq.map(link => {
            return nexus.Resource.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(link)
            );
          })
        )
          .then(responses => {
            const allTables = responses as Resource[];
            setTables(allTables.filter(t => !t._deprecated));
          })
          .catch(error => {
            notification.error({
              message: 'Failed to load tables',
              description: parseNexusError(error),
            });
          });
      })
      .catch(error => {
        notification.error({
          message: 'Failed to load tables',
          description: parseNexusError(error),
        });
      });
  };

  const fetchChildren = async (stepId: string) => {
    const children = (await fetchChildrenForStep(
      nexus,
      orgLabel,
      projectLabel,
      stepId
    )) as StepResource[];
    setSteps(children);
    setSiblings(
      children.map(child => ({
        name: child.name,
        '@id': child._self,
      }))
    );
  };

  const stepToBreadcrumbItem = (step: StepResource) => ({
    label: step.name,
    url: `/workflow/${orgLabel}/${projectLabel}/${labelOf(step['@id'])}`,
  });

  const fetchBreadcrumbs = (
    orgLabel: string,
    projectLabel: string,
    step: StepResource,
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
  ) => {
    let crumbs = [];

    const homeCrumb = {
      label: 'Project Home',
      url: `/workflow/${orgLabel}/${projectLabel}`,
    };

    crumbs = [homeCrumb];

    const fetchNext = (step: StepResource, acc: BreadcrumbItem[]) => {
      if (step.hasParent) {
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(step.hasParent['@id'])
        )
          .then(response => {
            const activityResource = response as StepResource;
            // fetch parent of a parent recursively
            fetchNext(activityResource, [
              stepToBreadcrumbItem(activityResource),
              ...acc,
            ]);
          })
          .catch(error => {
            // stay silent and display breadcrumbs without parents that failed to load
            crumbs = [homeCrumb, ...acc];
          });
      } else {
        crumbs = [homeCrumb, ...acc];
        setBreadcrumbs(crumbs);
      }
    };

    fetchNext(step, [stepToBreadcrumbItem(step)]);
  };

  const reloadTables = () => {
    setRefreshTables(!refreshTables);
  };

  const reloadSteps = () => {
    setRefreshSteps(!refreshSteps);
  };

  const linkCodeToActivity = (codeResourceId: string) => {
    nexus.Resource.getSource(orgLabel, projectLabel, encodeURIComponent(stepId))
      .then(response => {
        const payload = response as StepResource;

        if (payload.wasAssociatedWith) {
          payload.wasAssociatedWith = Array.isArray(payload.wasAssociatedWith)
            ? [...payload.wasAssociatedWith, { '@id': codeResourceId }]
            : [payload.wasAssociatedWith, { '@id': codeResourceId }];
        } else {
          payload.wasAssociatedWith = { '@id': codeResourceId };
        }

        return (
          step &&
          nexus.Resource.update(orgLabel, projectLabel, stepId, step._rev, {
            ...payload,
          })
        );
      })
      .then(() =>
        notification.success({
          message: 'The code resource is added successfully',
        })
      )
      .catch(error =>
        notification.error({
          message: 'Failed to load original payload',
          description: parseNexusError(error),
        })
      );
  };

  const submitNewStep = (data: WorkflowStepMetadata) => {
    const { name } = data;

    if (step?._self) {
      data.hasParent = {
        '@id': step._self,
      };
    }

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      '@context': WORKFLOW_STEP_CONTEXT['@id'],
      ...data,
    })
      .then(() => {
        setShowStepForm(false);
        notification.success({
          message: `New step ${name} created successfully`,
        });
        reloadSteps();
      })
      .catch(error => {
        setShowStepForm(false);
        notification.error({
          message: 'An error occurred',
          description: parseNexusError(error),
        });
      });
  };

  const addNewTable = () => {
    reloadTables();
    setShowNewTableForm(false);
  };

  const addNewDataset = () => {
    // TODO: display Inputs in this view
    setShowDataSetForm(false);
    reloadSteps();
  };

  const addInputTable = async () => {
    if (step) {
      await makeInputTable(step['@id'], nexus, orgLabel, projectLabel);
      reloadTables();
    }
  };

  const addActivityTable = async () => {
    if (step) {
      await makeActivityTable(step['@id'], nexus, orgLabel, projectLabel);
      reloadTables();
    }
  };

  return (
    <Spin spinning={busy} tip="Please wait...">
      <div className="workflow-step-view">
        <AddComponentButton
          addNewStep={() => setShowStepForm(true)}
          addDataTable={() => setShowNewTableForm(true)}
          addDataset={() => setShowDataSetForm(true)}
          addInputTable={addInputTable}
          addActivityTable={addActivityTable}
        />
        <ProjectPanel orgLabel={orgLabel} projectLabel={projectLabel} />
        <div className="workflow-step-view__panel">
          <Breadcrumbs crumbs={breadcrumbs} />
          {step && (
            <StepInfoContainer
              step={step}
              projectLabel={projectLabel}
              orgLabel={orgLabel}
              onUpdate={reloadSteps}
            />
          )}
        </div>
        <StepsBoard>
          {steps &&
            steps.length > 0 &&
            steps.map(substep => (
              <SingleStepContainer
                key={`step-${substep['@id']}`}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                step={substep}
                onUpdate={reloadSteps}
                parentLabel={step?.name}
              />
            ))}
          {step && tables && (
            <>
              <TableContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                tables={tables}
                onDeprecate={reloadTables}
              />

              <Modal
                title="Add Data Set"
                open={showDataSetForm}
                onCancel={() => setShowDataSetForm(false)}
                footer={null}
                width={600}
              >
                <InputsContainer
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  stepId={step._self}
                  onCancel={() => setShowDataSetForm(false)}
                  onSuccess={addNewDataset}
                />
              </Modal>
            </>
          )}
        </StepsBoard>
        <Modal
          open={showStepForm}
          footer={null}
          onCancel={() => setShowStepForm(false)}
          width={800}
          destroyOnClose={true}
        >
          <WorkflowStepWithActivityForm
            title="Create New Step"
            onClickCancel={() => setShowStepForm(false)}
            onSubmit={submitNewStep}
            busy={false}
            siblings={siblings}
            activityList={[]}
            parentLabel={step?.name}
          />
        </Modal>
        <Modal
          open={showNewTableForm}
          footer={null}
          onCancel={() => setShowNewTableForm(false)}
          width={400}
          destroyOnClose={true}
        >
          <NewTableContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            parentId={step?._self}
            onClickClose={() => setShowNewTableForm(false)}
            onSuccess={addNewTable}
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default WorkflowStepView;
