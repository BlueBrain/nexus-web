import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import {
  Resource,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import ResourcesSearch from '../components/ResourcesSearch';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activityId: string;
  linkCodeToActivity: (codeResourceId: string) => void;
  linkedResourceIds: string[];
}> = ({
  orgLabel,
  projectLabel,
  activityId,
  linkCodeToActivity,
  linkedResourceIds,
}) => {
  const nexus = useNexusContext();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [search, setSearch] = React.useState<string>();
  const [typeFilter, setTypeFilter] = React.useState<string[]>();

  const fetchLinkedResources = () => {
    const query = {
      query: {
        bool: {
          minimum_should_match: 1,
          should: linkedResourceIds.map(resourceId => ({
            match: {
              '@id': `https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/${orgLabel}/${projectLabel}/_/${resourceId}`,
            },
          })),
          must: [
            {
              term: { _deprecated: false },
            },
            {
              term: {
                '@type': `https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/${orgLabel}/${projectLabel}/Entity`,
              },
            },
          ],
        },
      },
      size: 100,
    };

    if (linkedResourceIds.length > 0) {
      nexus.View.elasticSearchQuery(
        orgLabel,
        projectLabel,
        DEFAULT_ELASTIC_SEARCH_VIEW_ID,
        query
      )
        .then(response => {
          return Promise.all(
            response.hits.hits.map((resource: any) => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(resource._source['@id'])
              );
            })
          );
        })
        .then(response => setResources(response as Resource[]))
        .catch(error => displayError(error, 'An error occurred'));
    }
  };

  React.useEffect(() => {
    fetchLinkedResources();
  }, [activityId, typeFilter, search, JSON.stringify(linkedResourceIds)]);

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
