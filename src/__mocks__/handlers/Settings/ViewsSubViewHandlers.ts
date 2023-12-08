import { deltaPath } from '__mocks__/handlers/handlers';
import { rest } from 'msw';

export const identitiesHandler = () => {
  return rest.get(deltaPath(`/identities`), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/identities.json',
      ],
      identities: [
        {
          '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/authenticated',
          '@type': 'Authenticated',
          realm: 'test',
        },
      ],
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });
};

export const aclsHandler = (orgLabel: string, projectLabel: string) => {
  return rest.get(deltaPath(`/acls/${orgLabel}/${projectLabel}`), (req, res, ctx) => {
    const mockResponse = {
      '@context': ['https://bluebrain.github.io/nexus/contexts/acls.json'],
      _total: 1,
      _results: [
        {
          '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/acls',
          '@type': 'AccessControlList',
          acl: [
            {
              identity: {
                '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/authenticated',
                '@type': 'Authenticated',
                realm: 'test',
              },
              permissions: [
                'realms/write',
                'files/write',
                'events/read',
                'organizations/write',
                'projects/delete',
                'projects/write',
                'views/write',
              ],
            },
            {
              identity: {
                '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/anonymous',
                '@type': 'Anonymous',
              },
              permissions: ['realms/read', 'permissions/read', 'version/read'],
            },
          ],
          _self: 'https://dev.nise.bbp.epfl.ch/nexus/v1/acls',
        },
      ],
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });
};

export const viewWithIndexingErrors =
  'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex';

export const viewWithNoIndexingErrors =
  'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex';

export const viewsHandler = (orgLabel: string, projectLabel: string) => {
  const baseViewObject = baseView(orgLabel, projectLabel);

  return rest.get(deltaPath(`/views/${orgLabel}/${projectLabel}`), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: 3,
      _results: [
        {
          '@id': viewWithNoIndexingErrors,
          '@type': ['ElasticSearchView', 'View'],
          name: 'Default Elasticsearch view',
          ...baseViewObject,
        },
        {
          '@id': 'https://bluebrain.github.io/nexus/vocabulary/searchView',
          '@type': ['View', 'CompositeView'],
          ...baseViewObject,
        },
        {
          '@id': viewWithIndexingErrors,
          '@type': ['View', 'SparqlView'],
          name: 'Default Sparql view',
          ...baseViewObject,
        },
      ],
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });
};

export const viewErrorsHandler = (orgLabel: string, projectLabel: string) => {
  return rest.get(
    deltaPath(`/views/${orgLabel}/${projectLabel}/:viewId/failures`),
    (req, res, ctx) => {
      const { viewId } = req.params;
      const decodedId = decodeURIComponent(viewId as string);

      const mockResponse = {
        '@context': ['https://bluebrain.github.io/nexus/contexts/error.json'],
        _total: decodedId === viewWithIndexingErrors ? 2 : 0,
        _results:
          decodedId === viewWithIndexingErrors
            ? [
                {
                  ...baseIndexingError(orgLabel, projectLabel, `${decodedId}-1`),
                  message: 'Mock Error 1',
                },
                {
                  ...baseIndexingError(orgLabel, projectLabel, `${decodedId}-2`),
                  message: 'Mock Error 2',
                },
              ]
            : [],
      };
      return res(ctx.status(200), ctx.json(mockResponse));
    }
  );
};

export const viewStatsHandler = (orgLabel: string, projectLabel: string) => {
  return rest.get(
    deltaPath(`/views/${orgLabel}/${projectLabel}/:viewId/statistics`),
    (req, res, ctx) => {
      const mockResponse = {
        '@context': 'https://bluebrain.github.io/nexus/contexts/statistics.json',
        '@type': 'ViewStatistics',
        delayInSeconds: 0,
        discardedEvents: 0,
        evaluatedEvents: 10489,
        failedEvents: 0,
        lastEventDateTime: '2023-08-24T13:53:01.884Z',
        lastProcessedEventDateTime: '2023-08-24T13:53:01.884Z',
        processedEvents: 10489,
        remainingEvents: 0,
        totalEvents: 10489,
      };
      return res(ctx.status(200), ctx.json(mockResponse));
    }
  );
};

const baseIndexingError = (orgLabel: string, projectLabel: string, id: string) => ({
  id,
  errorType: 'epfl.indexing.ElasticSearchSink.BulkUpdateException',
  message: 'Super dramatic error',
  offset: {
    '@type': 'At',
    value: 264934,
  },
  project: `${orgLabel}/${projectLabel}`,
  _rev: 1,
});

const baseView = (orgLabel: string, projectLabel: string) => ({
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/views.json',
  _createdAt: '2022-04-01T08:27:55.583Z',
  _createdBy:
    'https://test.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
  _deprecated: false,
  _incoming: `https://test.nise.bbp.epfl.ch/nexus/v1/views/${orgLabel}/${projectLabel}/graph/incoming`,
  _indexingRev: 1,
  _outgoing: `https://test.nise.bbp.epfl.ch/nexus/v1/views/${orgLabel}/${projectLabel}/graph/outgoing`,
  _project: `https://test.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/${projectLabel}`,
  _rev: 1,
  _self: `https://test.nise.bbp.epfl.ch/nexus/v1/views/${orgLabel}/${projectLabel}/graph`,
  _updatedAt: '2022-04-01T08:27:55.583Z',
  _updatedBy: `https://test.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa`,
  _uuid: 'b48c6970-2e20-4a39-9180-574b5c656965',
});
