import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import ActivitiesBoard from '../components/Activities/ActivitiesBoard';
import Breadcrumbs from '../components/Breadcrumbs';
import { displayError } from '../components/Notifications';
import { Status } from '../components/StatusIcon';
import SingleActivityContainer from '../containers/SingleActivityContainer';
import ActivityInfoContainer from '../containers/ActivityInfoContainer';

import './ActivityView.less';

export type ActivityResource = Resource<{
  parent?: {
    '@id': string;
  };
  name: string;
  _self: string;
  status: Status;
  description?: string;
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

  const [activities, setActivities] = React.useState<any[]>([]);
  const [activity, setActivity] = React.useState<ActivityResource>();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  // switch to trigger activities list update
  const [refreshActivities, setRefreshActivities] = React.useState<boolean>(
    false
  );

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
  }, [refreshActivities]);

  const fetchChildren = () => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityId),
      'incoming'
    )
      .then(response => setActivities(response._results))
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
    const homeCrumb = {
      label: 'Project Home',
      url: `/projects/${orgLabel}/${projectLabel}`,
    };

    setBreadcrumbs([homeCrumb]);

    const fetchNext = (activity: ActivityResource, acc: BreadcrumbItem[]) => {
      if (activity.parent) {
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity.parent['@id'])
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
            setBreadcrumbs([homeCrumb, ...acc]);
          });
      } else {
        setBreadcrumbs([homeCrumb, ...acc]);
      }
    };

    fetchNext(activity, [activityToBreadcrumbItem(activity)]);
  };

  // TODO: find better sollution for this in future, for example, optimistic update
  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshActivities(!refreshActivities), 3500);

  return (
    <div className="activity-view">
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadActivities}
        activityLabel={activity && activity.name}
        activitySelfUrl={activity && activity._self}
      />
      <div className="activity-view__panel">
        <Breadcrumbs crumbs={breadcrumbs} />
        {activity && <ActivityInfoContainer activity={activity} />}
      </div>
      <ActivitiesBoard>
        {activities.map(subactivity => (
          <SingleActivityContainer
            key={`activity-${subactivity['@id']}`}
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            activityId={subactivity['@id']}
          />
        ))}
      </ActivitiesBoard>
    </div>
  );
};

export default ActivityView;
