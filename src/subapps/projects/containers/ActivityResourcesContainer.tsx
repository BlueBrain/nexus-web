import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import ResourcesSearch from '../components/ResourcesSearch';
import { ActivityResource } from '../views/ActivityView';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  activity: ActivityResource;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, activity, linkCodeToActivity }) => {
  const nexus = useNexusContext();

  const [resources, setResources] = React.useState<Resource[]>([]);
  const [search, setSearch] = React.useState<string>();
  const [typeFilter, setTypeFilter] = React.useState<string[]>();
  const [busy, setBusy] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchLinkedResources();
  }, [typeFilter, search, activity]);

  const getLinkedResourcesIds = () => {
    let resources: string[] = [];

    if (activity.used) {
      resources = Array.isArray(activity.used)
        ? activity.used.map(resource => resource['@id'])
        : [activity.used['@id']];
    }

    if (activity.contribution) {
      resources.push(activity.contribution.agent['@id']);
    }

    if (activity.wasAssociatedWith) {
      resources = Array.isArray(activity.wasAssociatedWith)
        ? [
            ...resources,
            ...activity.wasAssociatedWith.map(resource => resource['@id']),
          ]
        : [...resources, activity.wasAssociatedWith['@id']];
    }

    return resources;
  };

  const fetchLinkedResources = () => {
    setResources([]);
    const linkedResources = getLinkedResourcesIds();

    if (linkedResources.length > 0) {
      setBusy(true);

      const esQuery: any = {
        query: {
          bool: {
            must: [
              {
                term: { _deprecated: false },
              },
            ],
            minimum_should_match: 1,
            should: [
              ...linkedResources.map(resourceId => {
                const mustInclude: any = [
                  {
                    match: {
                      // TODO: create and use a proper context/vocab
                      '@id': `https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/${orgLabel}/${projectLabel}/_/${resourceId}`,
                    },
                  },
                ];

                if (search) {
                  mustInclude.push({
                    match_phrase: {
                      _original_source: search,
                    },
                  });
                }

                const shouldInclude: any = {};

                if (typeFilter && typeFilter.length) {
                  shouldInclude.minimum_should_match = 1;

                  shouldInclude.should = [];

                  typeFilter.forEach(filter => {
                    shouldInclude.should.push({
                      match: {
                        // TODO: create and use a proper context/vocab
                        '@type': `https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/${orgLabel}/${projectLabel}/${filter}`,
                      },
                    });
                  });
                }

                return {
                  bool: {
                    must: mustInclude,
                    ...shouldInclude,
                  },
                };
              }),
            ],
          },
        },
        size: 100,
      };

      nexus.View.elasticSearchQuery(
        orgLabel,
        projectLabel,
        DEFAULT_ELASTIC_SEARCH_VIEW_ID,
        esQuery
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
        .then(response => {
          setBusy(false);
          setResources(response as Resource[]);
        })
        .catch(error => {
          setBusy(false);
          displayError(error, 'An error occurred');
        });
    }
  };

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
