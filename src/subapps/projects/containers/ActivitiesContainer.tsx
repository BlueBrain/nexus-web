import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';

import ActivitiesBoard from '../components/Activities/ActivitiesBoard';
import { Activity } from '../components/Activities/ActivityCard';

export const ACTIVITY_TYPE = 'FusionActivity';

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
      type: ACTIVITY_TYPE,
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

  if (activities.length === 0) return null;

  return <ActivitiesBoard activities={activities} />;
};

export default ActivitiesContainer;
