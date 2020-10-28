import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import ResourcesSearch from '../components/ResourcesSearch';
import { ActivityResource } from '../views/ActivityView';
import { useActivityResources } from '../hooks/useActivityResources';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activity: ActivityResource;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, activity, linkCodeToActivity }) => {
  const nexus = useNexusContext();

  const [search, setSearch] = React.useState<string>();
  const [typeFilter, setTypeFilter] = React.useState<string[]>();
  const { resources, busy, fetchLinkedResources } = useActivityResources(
    activity,
    orgLabel,
    projectLabel,
    typeFilter,
    search
  );

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
        busy={busy}
      />
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
