import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { Resource } from '@bbp/nexus-sdk';
import {
  AggregatedBucket,
  AggregationsResult,
  NexusMultiFetchResponse,
} from 'subapps/dataExplorer/DataExplorerUtils';

export const getCompleteResources = (
  resources: Resource[] = defaultPartialResources
) => {
  return resources.map(res => ({ ...res, ...propertiesOnlyInSource }));
};

export const dataExplorerPageHandler = (
  partialResources: Resource[] = defaultPartialResources,
  total: number = 300
) => {
  return [
    rest.get(deltaPath(`/resources`), (req, res, ctx) => {
      if (req.url.searchParams.has('aggregations')) {
        return res(ctx.status(200), ctx.json(mockAggregationsResult()));
      }
      const passedType = req.url.searchParams.get('type');
      const mockResponse = {
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
          'https://bluebrain.github.io/nexus/contexts/search.json',
          'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
        ],
        _total: total,
        _results: passedType
          ? partialResources.filter(res => res['@type'] === passedType)
          : partialResources,
        _next:
          'https://bbp.epfl.ch/nexus/v1/resources?size=50&sort=@id&after=%5B1687269183553,%22https://bbp.epfl.ch/neurosciencegraph/data/31e22529-2c36-44f0-9158-193eb50526cd%22%5D',
      };
      return res(ctx.status(200), ctx.json(mockResponse));
    }),
    rest.post(deltaPath('/multi-fetch/resources'), async (req, res, ctx) => {
      const requestedIds: string[] = (((await req.json()) as any)?.resources).map(
        (res: { id: string }) => res.id
      );
      const response: NexusMultiFetchResponse = {
        format: 'compacted',
        resources: partialResources
          .filter(res => requestedIds.includes(res['@id']))
          .map(r => ({ value: { ...r, ...propertiesOnlyInSource } })),
      };
      return res(ctx.status(200), ctx.json(response));
    }),
  ];
};

export const graphAnalyticsTypeHandler = () => {
  return rest.get(
    deltaPath('/graph-analytics/:org/:project/properties/:type'),
    (req, res, ctx) => {
      const mockResponse = {
        '@context':
          'https://bluebrain.github.io/nexus/contexts/properties.json',
        '@id': 'http://schema.org/Dataset',
        _count: 50,
        _name: 'Dataset',
        _properties: [
          {
            '@id': 'https://neuroshapes.org/tag__apical',
            _count: 30,
            _name: 'author',
          },
          {
            '@id': 'https://neuroshapes.org/nr__reconstruction_type',
            _count: 30,
            _name: 'propertyAlwaysThere',
          },
          {
            '@id': 'https://neuroshapes.org/createdBy',
            _count: 30,
            _name: '_createdBy',
          },
          {
            '@id': 'https://neuroshapes.org/edition',
            _count: 30,
            _name: 'edition',
          },
        ],
      };
      return res(ctx.status(200), ctx.json(mockResponse));
    }
  );
};

const propertiesOnlyInSource = { userProperty1: { subUserProperty1: 'bar' } };

export const sourceResourceHandler = (
  partialResources: Resource[] = defaultPartialResources
) => {
  return rest.get(
    deltaPath(`/resources/:org/:project/_/:id`),
    (req, res, ctx) => {
      const { id } = req.params;
      const decodedId = decodeURIComponent(id as string);

      const partialResource = partialResources.find(
        resource => resource['@id'] === decodedId
      );
      if (partialResource) {
        return res(
          ctx.status(200),
          ctx.json({ ...partialResource, ...propertiesOnlyInSource })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(getMockResource(decodedId, { ...propertiesOnlyInSource }))
      );
    }
  );
};

export const filterByProjectHandler = (
  mockResources: Resource[] = defaultPartialResources
) => {
  return rest.get(deltaPath(`/resources/:org/:project`), (req, res, ctx) => {
    if (req.url.searchParams.has('aggregations')) {
      return res(
        ctx.status(200),
        ctx.json(
          mockAggregationsResult([
            getMockTypesBucket(
              'https://bluebrain.github.io/nexus/vocabulary/File'
            ),
            getMockTypesBucket('http://schema.org/StudioDashboard'),
            getMockTypesBucket('https://neuroshapes.org/NeuronMorphology'),
          ])
        )
      );
    }

    const { project } = req.params;

    const responseBody = project
      ? mockResources.filter(
          res =>
            res._project.slice(res._project.lastIndexOf('/') + 1) === project
        )
      : mockResources;
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: responseBody.length,
      _results: responseBody,
      _next:
        'https://bbp.epfl.ch/nexus/v1/resources?size=50&sort=@id&after=%5B1687269183553,%22https://bbp.epfl.ch/neurosciencegraph/data/31e22529-2c36-44f0-9158-193eb50526cd%22%5D',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });
};

export const elasticSearchQueryHandler = (resources: Resource[]) => {
  return rest.post(
    deltaPath('/graph-analytics/:org/:project/_search'),
    (req, res, ctx) => {
      const esResponse = {
        hits: {
          hits: resources.map(resource => ({
            _id: resource['@id'],
            _source: {
              '@id': resource['@id'],
              _project: resource._project,
            },
          })),
          max_score: 0,
          total: {
            value: 479,
          },
        },
      };
      return res(ctx.status(200), ctx.json(esResponse));
    }
  );
};

const mockAggregationsResult = (
  bucketForTypes: AggregatedBucket[] = defaultBucketForTypes
): AggregationsResult => {
  return {
    '@context': 'https://bluebrain.github.io/nexus/contexts/aggregations.json',
    total: 10,
    aggregations: {
      projects: {
        buckets: [
          getMockProjectBucket('something-brainy', 'bbp'),
          getMockProjectBucket('smarty', 'bbp'),
          getMockProjectBucket('unhcr', 'un'),
          getMockProjectBucket('unicef', 'un'),
          getMockProjectBucket('tellytubbies', 'bbc'),
        ],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
      },
      types: {
        buckets: bucketForTypes,
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
      },
    },
  };
};

export const getAggregationsHandler = () =>
  rest.get(deltaPath(`/resources?aggregations=true`), (req, res, ctx) => {
    const aggregationsResponse: AggregationsResult = {
      '@context':
        'https://bluebrain.github.io/nexus/contexts/aggregations.json',
      total: 10,
      aggregations: {
        projects: {
          buckets: [
            getMockProjectBucket('something-brainy', 'bbp'),
            getMockProjectBucket('smarty', 'bbp'),
            getMockProjectBucket('unhcr', 'un'),
            getMockProjectBucket('unicef', 'un'),
            getMockProjectBucket('tellytubbies', 'bbc'),
          ],
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
        },
        types: {
          buckets: [
            getMockProjectBucket('something-brainy', 'bbp'),
            getMockProjectBucket('smarty', 'bbp'),
            getMockProjectBucket('unhcr', 'un'),
            getMockProjectBucket('unicef', 'un'),
            getMockProjectBucket('tellytubbies', 'bbc'),
          ],
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
        },
      },
    };
    return res(ctx.status(200), ctx.json(aggregationsResponse));
  });

const getMockProjectBucket = (project: string, org: string = 'bbp') => {
  return {
    key: `https://bbp.epfl.ch/nexus/v1/projects/${org}/${project}`,
    doc_count: 10,
  };
};

const getMockTypesBucket = (type: string) => {
  return {
    doc_count: 98,
    key: type,
  };
};

const defaultBucketForTypes = [
  getMockTypesBucket('https://bluebrain.github.io/nexus/vocabulary/File'),
  getMockTypesBucket('http://schema.org/Dataset'),
  getMockTypesBucket('https://neuroshapes.org/NeuronMorphology'),
  getMockTypesBucket('https://bluebrain.github.io/nexus/vocabulary/View'),
  getMockTypesBucket(
    'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard'
  ),
];

export const getMockResource = (
  selfSuffix: string,
  extra: { [key: string]: any },
  project: string = 'hippocampus',
  type: string = 'https://bbp.epfl.ch/ontologies/core/bmo/SimulationCampaignConfiguration'
): Resource => ({
  ...extra,
  '@id': `https://bbp.epfl.ch/neurosciencegraph/data/${selfSuffix}`,
  '@type': type,
  _constrainedBy:
    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  propertyAlwaysThere:
    'Mock property in all test resources in DataExplorer spec',
  _createdAt: '2023-06-21T09:39:47.217Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
  _deprecated: false,
  _incoming: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}/incoming`,
  _outgoing: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}/outgoing`,
  _project: `https://bbp.epfl.ch/nexus/v1/projects/bbp/${project}`,
  _rev: 2,
  _self: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}`,
  _updatedAt: '2023-06-21T09:39:47.844Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
});

const defaultPartialResources: Resource[] = [
  getMockResource('self1', {}),
  getMockResource(
    'self2',
    { specialProperty: 'superSpecialValue' },
    'unhcr',
    'https://bluebrain.github.io/nexus/vocabulary/File'
  ),
  getMockResource('self3', { specialProperty: ['superSpecialValue'] }),
  getMockResource(
    'self4',
    { specialProperty: '' },
    'https://bluebrain.github.io/nexus/vocabulary/File'
  ),
  getMockResource('self5', { specialProperty: [] }),
  getMockResource('self6', {
    specialProperty: ['superSpecialValue', 'so'],
  }),
  getMockResource('self7', { specialProperty: { foo: 1, bar: 2 } }, 'unhcr'),
  getMockResource('self8', { specialProperty: null }),
  getMockResource(
    'self9',
    { specialProperty: {} },
    undefined,
    'https://bluebrain.github.io/nexus/vocabulary/File'
  ),
  getMockResource('self10', { specialProperty: undefined }),
];
