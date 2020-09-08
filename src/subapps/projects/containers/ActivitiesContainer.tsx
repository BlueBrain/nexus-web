import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

export const ACTIVITY_TYPE = 'FusionActivity';

const ActivitiesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [activities, setActivities] = React.useState<any[]>([]);

  const fetchActivities = async (activities: any) => {
    await Promise.all(
      activities.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    );
  };

  React.useEffect(() => {
    let activities;
    nexus.Resource.list(orgLabel, projectLabel, {
      type: ACTIVITY_TYPE,
    }).then(response => {
      activities = fetchActivities(response._results);

      console.log('activities', activities);
    });
  }, []);

  if (activities.length === 0) return null;

  return (
    <div>
      {activities.map(activity => (
        <p></p>
      ))}
    </div>
  );
};

export default ActivitiesContainer;
