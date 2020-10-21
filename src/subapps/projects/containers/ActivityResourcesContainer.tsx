import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import { isActivityResourceLink } from '../utils';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activityId: string;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, activityId, linkCodeToActivity }) => {
  const nexus = useNexusContext();
  const [resources, setResources] = React.useState<Resource[]>([]);

  const fetchLinkedResources = (activityResourceId: string, setData: (data: Resource[]) => void) => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activityResourceId),
      'outgoing'
    )
      .then(response => {
        Promise.all(
          response._results
            .filter(link => isActivityResourceLink(link))
            .map((resource: any) => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(resource['@id'])
              );
            })
        )
          .then(response => setData(response as Resource[]))
          .catch(error => displayError(error, 'An error occurred'));
      })
      .catch(error => displayError(error, 'An error occurred'));
  }  

  React.useEffect(() => {
    fetchLinkedResources(activityId, setResources);
  }, [activityId]);

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
  
  return (
    <ResourcesPane linkCode={addCodeResource}>
      <ResourcesList
        resources={resources}
        projectLabel={projectLabel}
        orgLabel={orgLabel}
      />
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
