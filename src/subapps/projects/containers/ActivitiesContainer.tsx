import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';

import ActivitiesBoard from '../components/Activities/ActivitiesBoard';
import { Activity } from '../components/Activities/ActivityCard';
import fusionConfig from '../config';

type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};

const ActivitiesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  refresh: boolean;
}> = ({ orgLabel, projectLabel, refresh }) => {
  const nexus = useNexusContext();

  const [activities, setActivities] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.activityType,
    })
      .then(response => {
        fetchActivities(response._results);
      })
      .catch(error => displayError(error));
  }, [refresh]);

  const displayError = (error: NexusError) => {
    notification.error({
      message: 'An error occurred',
      description: error.message || error.reason || 'An unknown error occurred',
      duration: 3,
    });
  };

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
      .then(response => setActivities(response as Activity[]))
      .catch(error => displayError(error));
  };

  const topLevelActivities: Activity[] = activities.filter(
    activity => !activity.parent
  );

  const children: Activity[] = activities.filter(activity => !!activity.parent);

  const activitiesWithChildren = topLevelActivities.map(activity => {
    const subactivities = children.filter(
      subactivity =>
        subactivity.parent && subactivity.parent['@id'] === activity['@id']
    );

    return {
      ...activity,
      subactivities,
    };
  });

  if (activities.length === 0) return null;

  return (
    <ActivitiesBoard
      activities={activitiesWithChildren}
      orgLabel={orgLabel}
      projectLabel={projectLabel}
    />
  );
};

export default ActivitiesContainer;
