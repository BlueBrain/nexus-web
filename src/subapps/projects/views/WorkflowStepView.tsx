import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Modal } from 'antd';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import Breadcrumbs from '../components/Breadcrumbs';
import { displayError, successNotification } from '../components/Notifications';
import SingleStepContainer from '../containers/SingleStepContainer';
import StepInfoContainer from '../containers/StepInfoContainer';
import { fetchChildrenForStep, isTable } from '../utils';
import ActivityResourcesContainer from '../containers/ActivityResourcesContainer';
import InputsContainer from '../containers/InputsContainer';
import TableContainer from '../containers/DraggableTablesContainer';
import AddComponentButton from '../components/AddComponentButton';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import { StepResource, WorkflowStepMetadata } from '../types';
import NewTableContainer from '../containers/NewTableContainer';

import './WorkflowStepView.less';

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

  const projectLabel = match?.params.projectLabel || '';
  const orgLabel = match?.params.orgLabel || '';
  const stepId = match?.params.stepId || '';

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(stepId))
      .then(response => {
        setStep(response as StepResource);
        fetchBreadcrumbs(
          orgLabel,
          projectLabel,
          response as StepResource,
          setBreadcrumbs
        );
      })
      .catch(error => displayError(error, 'Failed to load activity'));

    fetchChildren(stepId);
  }, [refreshSteps, stepId]);

  React.useEffect(() => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isTable(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setTables(response);
          })
          .catch(error => {
            displayError(error, 'Failed to load tables');
          })
      )
      .catch(error => {
        displayError(error, 'Failed to load tables');
      });
  }, [refreshTables, stepId]);

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
    url: `/workflow/${orgLabel}/${projectLabel}/${step['@id']}`,
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

  // TODO: find better sollution for this in future, for example, optimistic update
  const waitAntReloadSteps = () => {
    const reloadTimer = setTimeout(() => {
      setRefreshSteps(!refreshSteps);
      clearTimeout(reloadTimer);
    }, 3500);
  };

  const waitAndReloadTables = () => {
    const reloadTimer = setTimeout(() => {
      setRefreshTables(!refreshTables);
      clearTimeout(reloadTimer);
    }, 3500);
  };

  const reload = () => {
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
        successNotification('The code resource is added successfully')
      )
      .catch(error => displayError(error, 'Failed to load original payload'));
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
      ...data,
    })
      .then(() => {
        setShowStepForm(false);
        successNotification(`New step ${name} created successfully`);
        waitAntReloadSteps();
      })
      .catch(error => {
        setShowStepForm(false);
        displayError(error, 'An error occurred');
      });
  };

  const addNewTable = () => {
    waitAndReloadTables();
    setShowNewTableForm(false);
  };

  return (
    <div className="workflow-step-view">
      <AddComponentButton
        addNewStep={() => setShowStepForm(true)}
        addDataTable={() => setShowNewTableForm(true)}
      />
      <ProjectPanel orgLabel={orgLabel} projectLabel={projectLabel} />
      <div className="workflow-step-view__panel">
        <Breadcrumbs crumbs={breadcrumbs} />
        {step && (
          <StepInfoContainer
            step={step}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onUpdate={reload}
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
              onUpdate={waitAntReloadSteps}
            />
          ))}
        {step && tables && (
          <>
            <TableContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              tables={tables}
            />
            {/* TODO: update activities and inputs tables */}
            {/*
           <ActivityResourcesContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              linkCodeToActivity={linkCodeToActivity}
              workflowStep={step}
            />
            <InputsContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              stepId={step._self}
            />
           */}
          </>
        )}
      </StepsBoard>
      <Modal
        visible={showStepForm}
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
        visible={showNewTableForm}
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
  );
};

export default WorkflowStepView;
