import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { displayError } from '../components/Notifications';

import ActivityCard from '../components/Activities/ActivityCard';
import { ActivityResource } from '../views/ActivityView';
import { labelOf } from '../../../shared/utils';

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
      .catch(error => console.log('error'));

    fetchChildren();
  }, []);

  const isChild = (link: any) => {
    if (Array.isArray(link.paths)) {
      return (
        link.paths.filter((path: string) => labelOf(path) === 'hasParent')
          .length > 0
      );
    } else {
      return labelOf(link.paths) === 'hasParent';
    }
  };

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
            .filter(link => isChild(link))
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
