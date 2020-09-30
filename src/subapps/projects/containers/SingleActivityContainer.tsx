import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { displayError } from '../components/Notifications';

import ActivityCard from '../components/Activities/ActivityCard';
import { ActivityResource } from '../views/ActivityView';
import { isParentLink } from '../utils';

const SignleActivityContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  activityId: string;
}> = ({ projectLabel, orgLabel, activityId }) => {
  const nexus = useNexusContext();
  const [activity, setActivity] = React.useState<ActivityResource>();
  const [children, setChildren] = React.useState<any[]>([]);

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(activityId))
      .then(response => setActivity(response as ActivityResource))
      .catch(error => displayError(error, 'Failed to load the activity'));

    fetchChildren();
  }, []);

  const fetchChildren = () => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityId),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isParentLink(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setChildren(response);
          })
          .catch(error => displayError(error, 'Failed to load activities'))
      )
      .catch(error => displayError(error, 'Failed to load activities'));
  };

  if (!activity) return null;

  return (
    <ActivityCard
      activity={activity}
      subactivities={children}
      key={activity['@id']}
      projectLabel={projectLabel}
      orgLabel={orgLabel}
    />
  );
};

export default SignleActivityContainer;
