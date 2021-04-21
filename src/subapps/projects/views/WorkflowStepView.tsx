import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import Breadcrumbs from '../components/Breadcrumbs';
import { displayError, successNotification } from '../components/Notifications';
import { Status } from '../components/StatusIcon';
import SingleStepContainer from '../containers/SingleStepContainer';
import StepInfoContainer from '../containers/StepInfoContainer';
import { fetchChildrenForStep } from '../utils';
import ActivityResourcesContainer from '../containers/ActivityResourcesContainer';
import InputsContainer from '../containers/InputsContainer';
import TableContainer from '../containers/TableContainer';

import './WorkflowStepView.less';

export type StepResource = Resource<{
  hasParent?: {
    '@id': string;
  };
  activityType?: string;
  name: string;
  _self: string;
  status: Status;
  description?: string;
  summary?: string;
  dueDate?: string;
  wasInformedBy?: {
    '@id': string;
  };
  used?: {
    '@id': string;
  };
  wasAssociatedWith?:
    | {
        '@id': string;
      }
    | {
        '@id': string;
      }[];
  contribution?: {
    agent: {
      '@id': string;
    };
  };
  positionX?: number;
  positionY?: number;
}>;

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
  const [step, setStep] = React.useState<StepResource>();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);
  const [siblings, setSiblings] = React.useState<
    { name: string; '@id': string }[]
  >([]);

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
  const waitAntReload = () => {
    const reloadTimer = setTimeout(() => {
      setRefreshSteps(!refreshSteps);
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

  return (
    <div className="workflow-step-view">
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReload}
        workflowStepLabel={step?.name}
        workflowStepSelfUrl={step?._self}
        siblings={siblings}
      />
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
              onUpdate={waitAntReload}
            />
          ))}
        {step && (
          <>
            <TableContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              stepId={step._self}
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
    </div>
  );
};

export default WorkflowStepView;
