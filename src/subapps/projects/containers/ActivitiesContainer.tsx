import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import ActivitiesBoard from '../components/Activities/ActivitiesBoard';
import fusionConfig from '../config';
import { displayError } from '../components/Notifications';
import { ActivityResource } from '../views/ActivityView';
import ActivityCard from '../components/Activities/ActivityCard';
import ProjectPanel from '../components/ProjectPanel';

const ActivitiesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [activities, setActivities] = React.useState<ActivityResource[]>([]);
  // switch to trigger activities list update
  const [refreshActivities, setRefreshActivities] = React.useState<boolean>(
    false
  );

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshActivities(!refreshActivities), 3500);

  React.useEffect(() => {
    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.activityType,
      size: 200,
      deprecated: false,
    })
      .then(response => {
        fetchActivities(response._results);
      })
      .catch(error => displayError(error, 'An error occurred'));
  }, [refreshActivities]);

  const fetchActivities = (activities: any) => {
    Promise.all(
      activities.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    )
      .then(response => setActivities(response as ActivityResource[]))
      .catch(error => displayError(error, 'An error occurred'));
  };

  const topLevelActivities: ActivityResource[] = activities.filter(
    activity => !activity.hasParent
  );

  const children: ActivityResource[] = activities.filter(
    activity => !!activity.hasParent
  );

  const activitiesWithChildren = topLevelActivities.map(activity => {
    const subactivities = children.filter(
      subactivity =>
        subactivity.hasParent &&
        subactivity.hasParent['@id'] === activity['@id']
    );

    return {
      ...activity,
      subactivities,
    };
  });

  const siblings = topLevelActivities.map(sibling => ({
    name: sibling.name,
    '@id': sibling._self,
  }));

  return (
    <>
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadActivities}
        siblings={siblings}
      />
      <ActivitiesBoard>
        {activities &&
          activitiesWithChildren.map(activity => (
            <ActivityCard
              activity={activity}
              subactivities={activity.subactivities}
              key={activity['@id']}
              projectLabel={projectLabel}
              orgLabel={orgLabel}
            />
          ))}
      </ActivitiesBoard>
    </>
  );
};

export default ActivitiesContainer;
