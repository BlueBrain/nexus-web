import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import { ActivityResource } from '../views/ActivityView';

export const useActivityResources = (
  activity: ActivityResource,
  orgLabel: string,
  projectLabel: string,
  typeFilter: string[] | undefined,
  search: string | undefined
) => {
  const nexus = useNexusContext();

  const [resources, setResources] = React.useState<Resource[]>([]);
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

  return {
    resources,
    busy,
    fetchLinkedResources,
  };
};
