import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import { isActivityResourceLink } from '../utils';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import ResourcesSearch from '../components/ResourcesSearch';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activityId: string;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, activityId, linkCodeToActivity }) => {
  const nexus = useNexusContext();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [search, setSearch] = React.useState<string>();
  const [typeFilter, setTypeFilter] = React.useState<string[]>();

  const fetchLinkedResources = () => {
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
            .map((link: ResourceLink) => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => setResources(response as Resource[]))
          .catch(error => displayError(error, 'An error occurred'));
      })
      .catch(error => displayError(error, 'An error occurred'));
  };

  React.useEffect(() => {
    fetchLinkedResources();
  }, [activityId, typeFilter, search]);

  const addCodeResource = (data: CodeResourceData) => {
    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.codeType,
      ...data,
    })
      .then(response => {
        linkCodeToActivity(response['@id']);
        //  wait for the code resource to be indexed
        const reloadTimer = setTimeout(() => {
          fetchLinkedResources();
          clearTimeout(reloadTimer);
        }, 3000);
      })
      .catch(error => displayError(error, 'Failed to save'));
  };

  return (
    <ResourcesPane linkCode={addCodeResource}>
      <ResourcesSearch
        onChangeType={setTypeFilter}
        onSearchByText={setSearch}
      />
      <ResourcesList
        resources={resources}
        projectLabel={projectLabel}
        orgLabel={orgLabel}
      />
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
