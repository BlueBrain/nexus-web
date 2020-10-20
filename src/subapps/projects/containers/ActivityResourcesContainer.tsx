import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import { isActivityResourceLink } from '../utils';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import { ActivityResource } from '../views/ActivityView';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activityId: string;
  linkCodeToActivity: (codeResourceId: string) => void;
  childrenActivities: ActivityResource[];
}> = ({ orgLabel, projectLabel, activityId, linkCodeToActivity, childrenActivities }) => {
  const nexus = useNexusContext();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [childResources, setChildResources] = React.useState<Resource[]>([]);

  const fetchLinkedResources = (activityId: string, setData: (data: Resource[]) => void) =>
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
          .then(response => setData(response as Resource[]))
          .catch(error => displayError(error, 'An error occurred'));
      })
      .catch(error => displayError(error, 'An error occurred'));

  React.useEffect(() => {
    fetchLinkedResources(activityId, setResources);

    childrenActivities.forEach(child => {
      fetchLinkedResources(child['@id'], handleChildResources);
    })
  }, [activityId, childrenActivities]);

  const handleChildResources = (data: Resource[]) => {
    if (data && data.length > 0) {
      setChildResources([...childResources, ...data])
    }
  }

  const addCodeResource = (data: CodeResourceData) => {
    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.codeType,
      ...data,
    })
      .then(response => {
        linkCodeToActivity(response['@id']);
        //  wait for the code resource to be indexed
        const reloadTimer = setTimeout(() => {
          fetchLinkedResources(activityId, setResources);
          clearTimeout(reloadTimer);
        }, 3000);
      })
      .catch(error => displayError(error, 'Failed to save'));
  };

  const resourceList = [...resources, ...childResources];
  
  return (
    <ResourcesPane linkCode={addCodeResource}>
      {resources && (
        <ResourcesList
          resources={resourceList}
          projectLabel={projectLabel}
          orgLabel={orgLabel}
        />
      )}
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
