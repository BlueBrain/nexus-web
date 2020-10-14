import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import { isActivityResourceLink } from '../utils';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activityId: string;
}> = ({ orgLabel, projectLabel, activityId }) => {
  const nexus = useNexusContext();
  const [resources, setResources] = React.useState<Resource[]>();

  React.useEffect(() => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityId),
      'outgoing'
    )
      .then(response => {
        Promise.all(
          response._results
            .filter(link => isActivityResourceLink(link))
            .map((activity: any) => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(activity['@id'])
              );
            })
        )
          .then(response => setResources(response as Resource[]))
          .catch(error => displayError(error, 'An error occurred'));
      })
      .catch(error => displayError(error, 'An error occurred'));
  }, []);

  const addCodeResource = (data: any) => {
    console.log('data', data);
  };

  return (
    <ResourcesPane linkCode={addCodeResource}>
      {resources && (
        <ResourcesList
          resources={resources}
          projectLabel={projectLabel}
          orgLabel={orgLabel}
        />
      )}
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
