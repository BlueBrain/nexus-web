import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

export const ACTIVITY_TYPE = 'FusionActivity';

const ActivitiesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [activities, setActivities] = React.useState<any[]>([]);

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
      .then(response => setActivities(response))
      .catch(error => console.log(error));
  };

  React.useEffect(() => {
    nexus.Resource.list(orgLabel, projectLabel, {
      type: ACTIVITY_TYPE,
    })
      .then(response => {
        fetchActivities(response._results);
      })
      .catch(error => console.log(error));
  }, []);

  if (activities.length === 0) return null;

  console.log('activites', activities);

  return (
    <div>
      {activities.map(activity => (
        <p></p>
      ))}
    </div>
  );
};

export default ActivitiesContainer;
