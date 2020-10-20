import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import ActivitiesBoard from '../components/Activities/ActivitiesBoard';
import Breadcrumbs from '../components/Breadcrumbs';
import { displayError, successNotification } from '../components/Notifications';
import { Status } from '../components/StatusIcon';
import SingleActivityContainer from '../containers/SingleActivityContainer';
import ActivityInfoContainer from '../containers/ActivityInfoContainer';
import { isParentLink } from '../utils';
import ActivityResourcesContainer from '../containers/ActivityResourcesContainer';

import './ActivityView.less';

export type ActivityResource = Resource<{
  hasParent?: {
    '@id': string;
  };
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
}>;

type BreadcrumbItem = {
  label: string;
  url: string;
};

const ActivityView: React.FC = () => {
  const nexus = useNexusContext();
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    activityId: string;
  }>(`/${subapp.namespace}/:orgLabel/:projectLabel/:activityId`);

  const [activities, setActivities] = React.useState<ActivityResource[]>([]);
  const [activity, setActivity] = React.useState<ActivityResource>();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  // switch to trigger activities list update
  const [refreshActivities, setRefreshActivities] = React.useState<boolean>(
    false
  );
  const [siblings, setSiblings] = React.useState<
    { name: string; '@id': string }[]
  >([]);

  const projectLabel = match?.params.projectLabel || '';
  const orgLabel = match?.params.orgLabel || '';
  const activityId = match?.params.activityId || '';

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(activityId))
      .then(response => {
        setActivity(response as ActivityResource);
        fetchBreadcrumbs(
          orgLabel,
          projectLabel,
          response as ActivityResource,
          setBreadcrumbs
        );
      })
      .catch(error => displayError(error, 'Failed to load activity'));

    fetchChildren();
  }, [refreshActivities, activityId]);

  const fetchChildren = () => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityId),
      'incoming'
    )
      .then(response => {
        Promise.all(
          response._results
            .filter(link => isParentLink(link))
            .map(activity => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(activity['@id'])
              );
            })
        )
          .then(response => {
            const children = response as ActivityResource[];

            setActivities(children);
            setSiblings(
              children.map(child => ({ name: child.name, '@id': child._self }))
            );
          })
          .catch(error => displayError(error, 'Failed to load activities'));
      })
      .catch(error => displayError(error, 'Failed to load activities'));
  };

  const activityToBreadcrumbItem = (activity: ActivityResource) => ({
    label: activity.name,
    url: `/projects/${orgLabel}/${projectLabel}/${activity['@id']}`,
  });

  const fetchBreadcrumbs = (
    orgLabel: string,
    projectLabel: string,
    activity: ActivityResource,
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
  ) => {
    let crumbs = [];

    const homeCrumb = {
      label: 'Project Home',
      url: `/projects/${orgLabel}/${projectLabel}`,
    };

    crumbs = [homeCrumb];

    const fetchNext = (activity: ActivityResource, acc: BreadcrumbItem[]) => {
      if (activity.hasParent) {
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity.hasParent['@id'])
        )
          .then(response => {
            const activityResource = response as ActivityResource;
            // fetch parent of a parent recursively
            fetchNext(activityResource, [
              activityToBreadcrumbItem(activityResource),
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

    fetchNext(activity, [activityToBreadcrumbItem(activity)]);
  };

  // TODO: find better sollution for this in future, for example, optimistic update
  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshActivities(!refreshActivities), 3500);

  const reload = () => {
    setRefreshActivities(!refreshActivities);
  };

  const linkCodeToActivity = (codeResourceId: string) => {
    nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityId)
    )
      .then(response => {
        const payload = response as ActivityResource;

        if (payload.wasAssociatedWith) {
          payload.wasAssociatedWith = Array.isArray(payload.wasAssociatedWith)
            ? [...payload.wasAssociatedWith, { '@id': codeResourceId }]
            : [payload.wasAssociatedWith, { '@id': codeResourceId }];
        } else {
          payload.wasAssociatedWith = { '@id': codeResourceId };
        }

        return (
          activity &&
          nexus.Resource.update(
            orgLabel,
            projectLabel,
            activityId,
            activity._rev,
            {
              ...payload,
            }
          )
        );
      })
      .then(() =>
        successNotification('The code resource is added successfully')
      )
      .catch(error => displayError(error, 'Failed to load original payload'));
  };

  console.log('acts', activities);
  

  return (
    <div className="activity-view">
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadActivities}
        activityLabel={activity && activity.name}
        activitySelfUrl={activity && activity._self}
        siblings={siblings}
      />
      <div className="activity-view__panel">
        <Breadcrumbs crumbs={breadcrumbs} />
        {activity && (
          <ActivityInfoContainer
            activity={activity}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onUpdate={reload}
          />
        )}
      </div>
      <ActivitiesBoard>
        {activities.map(subactivity => (
          <SingleActivityContainer
            key={`activity-${subactivity['@id']}`}
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            activity={subactivity}
          />
        ))}
      </ActivitiesBoard>
      {activity && (
        <ActivityResourcesContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          linkCodeToActivity={linkCodeToActivity}
          activityId={activity && activity['@id']}
          childrenActivities={activities}
        />
      )}
    </div>
  );
};

export default ActivityView;
