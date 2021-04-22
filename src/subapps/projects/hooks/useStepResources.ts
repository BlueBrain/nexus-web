import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';
import { StepResource } from '../types';

export const useActivityResources = (
  step: StepResource,
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
  }, [typeFilter, search, step]);

  const getLinkedResourcesIds = () => {
    let resources: string[] = [];

    if (step.used) {
      resources = Array.isArray(step.used)
        ? step.used.map(resource => resource['@id'])
        : [step.used['@id']];
    }

    if (step.contribution) {
      resources.push(step.contribution.agent['@id']);
    }

    if (step.wasAssociatedWith) {
      resources = Array.isArray(step.wasAssociatedWith)
        ? [
            ...resources,
            ...step.wasAssociatedWith.map(resource => resource['@id']),
          ]
        : [...resources, step.wasAssociatedWith['@id']];
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
                    query_string: {
                      query: `${search}*`,
                      default_field: '_original_source',
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
