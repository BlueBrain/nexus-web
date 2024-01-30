import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { Resource } from '@bbp/nexus-sdk';

export const resourcesHandler = rest.get(
  deltaPath(`resources/bbp/agents`),
  (_, res, ctx) => {
    const mockResponse = {
      '@context': ['https://bluebrain.github.io/nexus/contexts/metadata.json'],
      _total: 3,
      _results: [
        getMockResource('1'),
        getMockResource('2'),
        getMockResource('3'),
      ],
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const searchHitsHandler = rest.post(
  deltaPath(
    '/views/bbp/agents/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultElasticSearchIndex/_search'
  ),
  (_, res, ctx) => {
    const filteredByDeprecation = {
      buckets: [getMockBucket('1'), getMockBucket('2'), getMockBucket('3')],
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
    };
    const mockResponse = {
      aggregations: {
        schemas: {
          doc_count: 3,
          filteredByDeprecation: { ...filteredByDeprecation },
        },
        types: {
          doc_count: 8,
          filteredByDeprecation: { ...filteredByDeprecation },
        },
      },
      hits: {
        hits: [
          getMockSearchHit('1'),
          getMockSearchHit('2'),
          getMockSearchHit('3'),
        ],
        max_score: 123,
        total: { relation: 'eq', value: 11 },
      },
      timed_out: false,
      took: 0,
      _shards: { failed: 0, skipped: 0, successful: 1, total: 1 },
    };

    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);

const getMockResource = (id: string, extra?: Partial<Resource>) => ({
  '@id': id,
  '@type': ['View'],
  description: 'Test description',
  name: 'Test name',
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/views.json',
  _createdAt: '2024-01-19T11:40:24.804553Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/mockuser',
  _deprecated: false,
  _incoming: 'test',
  _outgoing: 'test',
  _project: 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp/agents',
  _rev: 1,
  _self: id,
  _updatedAt: '2024-01-19T11:40:24.804553Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/mockuser',
  _uuid: id,
  ...extra,
});

const getMockSearchHit = (id: string, extra?: Partial<Resource>) => {
  const resource = getMockResource(id, extra);
  return {
    _id: id,
    _index: `delta_${id}`,
    _score: 123,
    _source: {
      ...resource,
      _original_source: JSON.stringify(resource),
    },
    _type: '_doc',
  };
};

const getMockBucket = (key: string, docCount: number = 1) => ({
  key,
  doc_count: docCount,
});
