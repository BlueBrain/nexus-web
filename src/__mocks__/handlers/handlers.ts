import { rest } from 'msw';

const defaultMockDeltaAPIBasePath = 'https://localhost:3000';

export const deltaPath = (
  path?: string,
  mockDeltaAPIBasePath = defaultMockDeltaAPIBasePath
) => {
  if (!path) {
    return mockDeltaAPIBasePath;
  }
  return new URL(path, mockDeltaAPIBasePath).toString();
};
const STUDIO_TYPE = 'https://bluebrainnexus.io/studio/vocabulary/Studio';
export const handlers = [
  rest.post(
    deltaPath(
      '/views/org/project/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultElasticSearchIndex/_search'
    ),
    (req, res, ctx) => {
      if (
        req.body
          ?.toString()
          .includes('@type: https://bluebrain.github.io/nexus/vocabulary/View')
      ) {
        const mockResponse = {
          hits: {
            hits: [
              {
                _id:
                  'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
                _score: 8.229784,
                _source: {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                  '@type': [
                    'https://bluebrain.github.io/nexus/vocabulary/View',
                    'https://bluebrain.github.io/nexus/vocabulary/SparqlView',
                  ],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2021-04-01T11:39:02.988Z',
                  _createdBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _deprecated: false,
                  _incoming:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/graph/incoming',
                  _original_source:
                    '{"@id":"https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex","@type":["View","SparqlView"],"includeDeprecated":true,"includeMetadata":true}',
                  _outgoing:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/graph/outgoing',
                  _project:
                    'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                  _rev: 1,
                  _self:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/graph',
                  _updatedAt: '2021-04-01T11:39:02.988Z',
                  _updatedBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _uuid: '30a45385-12e3-46f1-a9ba-1246d7232e7e',
                },
                _type: '_doc',
              },
              {
                _id:
                  'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
                _score: 7.2831206,
                _source: {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                  '@type': [
                    'https://bluebrain.github.io/nexus/vocabulary/ElasticSearchView',
                    'https://bluebrain.github.io/nexus/vocabulary/View',
                  ],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2021-04-01T11:39:02.967Z',
                  _createdBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _deprecated: false,
                  _incoming:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/documents/incoming',
                  _original_source:
                    '{"@id":"https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex","@type":["ElasticSearchView","View"],"includeDeprecated":true,"includeMetadata":true,"mapping":{"properties":{"@type":{"type":"keyword","copy_to":"_all_fields"},"@id":{"type":"keyword","copy_to":"_all_fields"},"prefLabel":{"type":"text","fields":{"raw":{"type":"keyword"}},"copy_to":"_all_fields"},"label":{"type":"text","fields":{"raw":{"type":"keyword"}},"copy_to":"_all_fields"},"name":{"type":"text","fields":{"raw":{"type":"keyword"}},"copy_to":"_all_fields"},"_rev":{"type":"long","copy_to":"_all_fields"},"_deprecated":{"type":"boolean","copy_to":"_all_fields"},"_createdAt":{"type":"date","copy_to":"_all_fields"},"_updatedAt":{"type":"date","copy_to":"_all_fields"},"_createdBy":{"type":"keyword","copy_to":"_all_fields"},"_updatedBy":{"type":"keyword","copy_to":"_all_fields"},"_constrainedBy":{"type":"keyword","copy_to":"_all_fields"},"_project":{"type":"keyword","copy_to":"_all_fields"},"_self":{"type":"keyword","copy_to":"_all_fields"},"_incoming":{"type":"keyword","copy_to":"_all_fields"},"_outgoing":{"type":"keyword","copy_to":"_all_fields"},"_original_source":{"type":"text","analyzer":"nexus","copy_to":"_all_fields"},"_bytes":{"type":"long","copy_to":"_all_fields"},"_mediaType":{"type":"keyword","copy_to":"_all_fields"},"_location":{"type":"keyword","copy_to":"_all_fields"},"_filename":{"type":"keyword","copy_to":"_all_fields"},"_digest":{"type":"nested","properties":{"_algorithm":{"type":"keyword","copy_to":"_all_fields"},"_value":{"type":"keyword","copy_to":"_all_fields"}}},"_storage":{"type":"nested","properties":{"_rev":{"type":"long","copy_to":"_all_fields"},"@id":{"type":"keyword","copy_to":"_all_fields"}}},"_all_fields":{"type":"text","analyzer":"nexus"}},"dynamic":false},"sourceAsText":true}',
                  _outgoing:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/documents/outgoing',
                  _project:
                    'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                  _rev: 1,
                  _self:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/documents',
                  _updatedAt: '2021-04-01T11:39:02.967Z',
                  _updatedBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _uuid: 'f60444c2-c768-4e1b-bf5b-172def901f1b',
                },
                _type: '_doc',
              },
              {
                _id:
                  'https://bbp.epfl.ch/neurosciencegraph/data/c6b0a6d3-3c99-47a8-8cf9-83a71d89284f',
                _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
                _score: 7.2831206,
                _source: {
                  '@id':
                    'https://bbp.epfl.ch/neurosciencegraph/data/c6b0a6d3-3c99-47a8-8cf9-83a71d89284f',
                  '@type': [
                    'https://bluebrain.github.io/nexus/vocabulary/View',
                    'https://bluebrain.github.io/nexus/vocabulary/ElasticSearchView',
                  ],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-04-20T08:28:13.288Z',
                  _createdBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _deprecated: false,
                  _incoming:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/c6b0a6d3-3c99-47a8-8cf9-83a71d89284f/incoming',
                  _original_source:
                    '{"@type":["View","ElasticSearchView"],"https://schema.org/name":"ES-Test-2","sourceAsText":true,"includeMetadata":true,"includeDeprecated":false,"mapping":{}}',
                  _outgoing:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/c6b0a6d3-3c99-47a8-8cf9-83a71d89284f/outgoing',
                  _project:
                    'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                  _rev: 1,
                  _self:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/c6b0a6d3-3c99-47a8-8cf9-83a71d89284f',
                  _updatedAt: '2022-04-20T08:28:13.288Z',
                  _updatedBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _uuid: 'd6c9da14-6fa6-4c72-87d6-3e57c7982386',
                },
                _type: '_doc',
              },
              {
                _id:
                  'https://bbp.epfl.ch/neurosciencegraph/data/dbfa4190-d271-437d-ac06-c5566f073c5c',
                _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
                _score: 7.2831206,
                _source: {
                  '@id':
                    'https://bbp.epfl.ch/neurosciencegraph/data/dbfa4190-d271-437d-ac06-c5566f073c5c',
                  '@type': [
                    'https://bluebrain.github.io/nexus/vocabulary/View',
                    'https://bluebrain.github.io/nexus/vocabulary/ElasticSearchView',
                  ],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-04-20T08:24:45.325Z',
                  _createdBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _deprecated: false,
                  _incoming:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/dbfa4190-d271-437d-ac06-c5566f073c5c/incoming',
                  _original_source:
                    '{"name":"ES-Test","@type":"ElasticSearchView","sourceAsText":true,"includeMetadata":true,"includeDeprecated":false,"mapping":{}}',
                  _outgoing:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/dbfa4190-d271-437d-ac06-c5566f073c5c/outgoing',
                  _project:
                    'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                  _rev: 1,
                  _self:
                    'https://bbp.epfl.ch/nexus/v1/views/nise/kerrien/dbfa4190-d271-437d-ac06-c5566f073c5c',
                  _updatedAt: '2022-04-20T08:24:45.325Z',
                  _updatedBy:
                    'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                  _uuid: 'c0b3abfa-9682-4c14-90d3-4e9cb3d1b9d3',
                },
                _type: '_doc',
              },
            ],
            max_score: 8.229784,
            total: { relation: 'eq', value: 4 },
          },
          timed_out: false,
          took: 2,
          _shards: { failed: 0, skipped: 0, successful: 1, total: 1 },
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      }
      const mockResponse = {
        hits: {
          hits: [
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/8d65c507-06d1-4aa9-8b46-ea6a5cf07db5',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/8d65c507-06d1-4aa9-8b46-ea6a5cf07db5',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Dashboard',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:14:28.494Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/8d65c507-06d1-4aa9-8b46-ea6a5cf07db5/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/ee638ba5-5b7f-4ad7-9b78-8974dd12a904"},"label":"Dashboard","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/8d65c507-06d1-4aa9-8b46-ea6a5cf07db5/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/8d65c507-06d1-4aa9-8b46-ea6a5cf07db5',
                _updatedAt: '2022-04-19T13:14:28.494Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/c98044a9-cc83-4fc3-9be5-36882034151b',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/c98044a9-cc83-4fc3-9be5-36882034151b',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.224Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/c98044a9-cc83-4fc3-9be5-36882034151b/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/a52afba9-00a9-4d1b-868a-93ea9e98c0a0"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/c98044a9-cc83-4fc3-9be5-36882034151b/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/c98044a9-cc83-4fc3-9be5-36882034151b',
                _updatedAt: '2022-04-19T13:15:11.224Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/6390de40-9e7a-4517-a9b4-58eead72d917',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/6390de40-9e7a-4517-a9b4-58eead72d917',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.232Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/6390de40-9e7a-4517-a9b4-58eead72d917/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/d3785c5f-80a3-49c9-b46f-490be556de8c"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/6390de40-9e7a-4517-a9b4-58eead72d917/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/6390de40-9e7a-4517-a9b4-58eead72d917',
                _updatedAt: '2022-04-19T13:15:11.232Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/9493c938-c2ac-418f-bad4-b7bf66eb5cc6',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/9493c938-c2ac-418f-bad4-b7bf66eb5cc6',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.240Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/9493c938-c2ac-418f-bad4-b7bf66eb5cc6/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/597f41fc-a2f7-482e-ab3d-9a425327da11"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/9493c938-c2ac-418f-bad4-b7bf66eb5cc6/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/9493c938-c2ac-418f-bad4-b7bf66eb5cc6',
                _updatedAt: '2022-04-19T13:15:11.240Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/59884aa0-5422-4d7d-a510-3c078ce8e826',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/59884aa0-5422-4d7d-a510-3c078ce8e826',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.694Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/59884aa0-5422-4d7d-a510-3c078ce8e826/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/d4bff808-1d09-46c7-92ad-e80675fca3f4"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/59884aa0-5422-4d7d-a510-3c078ce8e826/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/59884aa0-5422-4d7d-a510-3c078ce8e826',
                _updatedAt: '2022-04-19T13:15:11.694Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/da31978b-8bbb-46f6-821e-0367fec0dc25',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/da31978b-8bbb-46f6-821e-0367fec0dc25',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.705Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/da31978b-8bbb-46f6-821e-0367fec0dc25/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/3a014676-7d58-45e0-b212-153020894382"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/da31978b-8bbb-46f6-821e-0367fec0dc25/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/da31978b-8bbb-46f6-821e-0367fec0dc25',
                _updatedAt: '2022-04-19T13:15:11.705Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/4a2e5069-c70a-4a35-900e-8ec22df83e3d',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/4a2e5069-c70a-4a35-900e-8ec22df83e3d',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:11.715Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4a2e5069-c70a-4a35-900e-8ec22df83e3d/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/58f96d30-d424-47e5-876b-61d8f55b6e80"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4a2e5069-c70a-4a35-900e-8ec22df83e3d/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4a2e5069-c70a-4a35-900e-8ec22df83e3d',
                _updatedAt: '2022-04-19T13:15:11.715Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/4ca299be-f184-4654-98ca-3cbd6f9ed92c',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/4ca299be-f184-4654-98ca-3cbd6f9ed92c',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:10.514Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4ca299be-f184-4654-98ca-3cbd6f9ed92c/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/6863f22d-c5ef-4f66-ae8e-473f9d6245a2"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4ca299be-f184-4654-98ca-3cbd6f9ed92c/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/4ca299be-f184-4654-98ca-3cbd6f9ed92c',
                _updatedAt: '2022-04-19T13:15:10.514Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/01fe874d-d1d3-4cec-a924-142dbf02a91f',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/01fe874d-d1d3-4cec-a924-142dbf02a91f',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Test',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:15:10.522Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/01fe874d-d1d3-4cec-a924-142dbf02a91f/incoming',
                _original_source:
                  '{"@type":"StudioDashboard","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/de32384e-ab35-466f-b10f-e8289d375148"},"label":"Test","dataQuery":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/01fe874d-d1d3-4cec-a924-142dbf02a91f/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 1,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/01fe874d-d1d3-4cec-a924-142dbf02a91f',
                _updatedAt: '2022-04-19T13:15:10.522Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/1b705706-346f-40b4-b937-dde7d6880cce',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/1b705706-346f-40b4-b937-dde7d6880cce',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Dashboard',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-04-19T13:14:26.973Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce/incoming',
                _original_source:
                  '{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/1b705706-346f-40b4-b937-dde7d6880cce","@type":"StudioDashboard","dataQuery":"","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/a6f13f38-ebb9-44cb-af45-0c728241395d"},"label":"Dashboard","_constrainedBy":"https://bluebrain.github.io/nexus/schemas/unconstrained.json","_createdAt":"2022-04-19T13:14:26.973Z","_createdBy":"https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien","_deprecated":false,"_incoming":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce/incoming","_outgoing":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce/outgoing","_project":"https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien","_rev":1,"_schemaProject":"https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien","_self":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce","_updatedAt":"2022-04-19T13:14:26.973Z","_updatedBy":"https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien","description":""}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 2,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/1b705706-346f-40b4-b937-dde7d6880cce',
                _updatedAt: '2022-05-31T06:46:30.913Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/neela',
              },
              _type: '_doc',
            },
            {
              _id:
                'https://bbp.epfl.ch/neurosciencegraph/data/5bf759dc-f602-4c2e-bb26-7e925809bc04',
              _index: 'delta_f60444c2-c768-4e1b-bf5b-172def901f1b_1',
              _score: 1.5929875,
              _source: {
                '@id':
                  'https://bbp.epfl.ch/neurosciencegraph/data/5bf759dc-f602-4c2e-bb26-7e925809bc04',
                '@type':
                  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard',
                label: 'Example',
                _constrainedBy:
                  'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                _createdAt: '2022-06-10T10:20:38.780Z',
                _createdBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
                _deprecated: false,
                _incoming:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04/incoming',
                _original_source:
                  '{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/5bf759dc-f602-4c2e-bb26-7e925809bc04","@type":"StudioDashboard","dataQuery":"","dataTable":{"@id":"https://bbp.epfl.ch/neurosciencegraph/data/889ca36c-18d7-419d-898b-14ba9618d3b4"},"description":"","label":"Example","_constrainedBy":"https://bluebrain.github.io/nexus/schemas/unconstrained.json","_createdAt":"2022-06-10T10:20:38.780Z","_createdBy":"https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien","_deprecated":false,"_incoming":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04/incoming","_outgoing":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04/outgoing","_project":"https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien","_rev":9,"_schemaProject":"https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien","_self":"https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04","_updatedAt":"2022-06-10T10:25:17.513Z","_updatedBy":"https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien"}',
                _outgoing:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04/outgoing',
                _project: 'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _rev: 10,
                _schemaProject:
                  'https://bbp.epfl.ch/nexus/v1/projects/nise/kerrien',
                _self:
                  'https://bbp.epfl.ch/nexus/v1/resources/nise/kerrien/_/5bf759dc-f602-4c2e-bb26-7e925809bc04',
                _updatedAt: '2022-06-10T10:26:48.415Z',
                _updatedBy:
                  'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kerrien',
              },
              _type: '_doc',
            },
          ],
          max_score: 1.5929875,
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
  ),
  rest.post(deltaPath('/views/org/project/graph/sparql'), (req, res, ctx) => {
    const mockResponse = {
      head: { vars: ['self', 'p', 'o'] },
      results: {
        bindings: [
          {
            o: { type: 'bnode', value: 't78' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien1'),
            },
          },
          {
            o: { type: 'bnode', value: 't87' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien2'),
            },
          },
          {
            o: { type: 'bnode', value: 't91' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien3'),
            },
          },
          {
            o: { type: 'bnode', value: 't97' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien4'),
            },
          },
          {
            o: { type: 'bnode', value: 't98' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien5'),
            },
          },
          {
            o: { type: 'bnode', value: 't100' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien6'),
            },
          },
          {
            o: { type: 'bnode', value: 't114' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien7'),
            },
          },
          {
            o: { type: 'bnode', value: 't120' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien8'),
            },
          },
          {
            o: { type: 'bnode', value: 't127' },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/apiMappings',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien9'),
            },
          },
          {
            o: {
              type: 'uri',
              value: 'https://bbp.epfl.ch/neurosciencegraph/data/',
            },
            p: {
              type: 'uri',
              value: 'https://bluebrain.github.io/nexus/vocabulary/base',
            },
            self: {
              type: 'uri',
              value: deltaPath('/nexus/v1/projects/nise/kerrien10'),
            },
          },
        ],
      },
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/views/org/project'), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: 5,
      _results: [
        {
          '@id':
            'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
          '@type': ['View', 'SparqlView'],
          _constrainedBy:
            'https://bluebrain.github.io/nexus/schemas/views.json',
          _createdAt: '2022-03-31T13:03:51.298Z',
          _createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _deprecated: false,
          _incoming:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph/incoming',
          _outgoing:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph/outgoing',
          _project:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
          _rev: 1,
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph',
          _updatedAt: '2022-03-31T13:03:51.298Z',
          _updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _uuid: '183a9aae-bc2e-4ee2-9b1a-cebd0e8f4be8',
        },
        {
          '@id':
            'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
          '@type': ['ElasticSearchView', 'View'],
          _constrainedBy:
            'https://bluebrain.github.io/nexus/schemas/views.json',
          _createdAt: '2022-03-31T13:03:51.309Z',
          _createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _deprecated: false,
          _incoming:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/documents/incoming',
          _outgoing:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/documents/outgoing',
          _project:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
          _rev: 1,
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/documents',
          _updatedAt: '2022-03-31T13:03:51.309Z',
          _updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _uuid: '697d166c-aafa-41b0-a15d-4e1459b021bc',
        },
        {
          '@id': 'https://bluebrain.github.io/nexus/vocabulary/searchView',
          '@type': ['View', 'CompositeView'],
          _constrainedBy:
            'https://bluebrain.github.io/nexus/schemas/views.json',
          _createdAt: '2022-03-31T13:03:51.340Z',
          _createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _deprecated: false,
          _incoming:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:searchView/incoming',
          _outgoing:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:searchView/outgoing',
          _project:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
          _rev: 1,
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:searchView',
          _updatedAt: '2022-03-31T13:03:51.340Z',
          _updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _uuid: '3f55028f-2dd8-431e-b3ff-9a9880d77ed9',
        },
        {
          '@id': 'https://bluebrain.github.io/nexus/vocabulary/my-tagged-view',
          '@type': ['View', 'ElasticSearchView'],
          _constrainedBy:
            'https://bluebrain.github.io/nexus/schemas/views.json',
          _createdAt: '2022-05-23T12:58:31.273Z',
          _createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          _deprecated: false,
          _incoming:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:my-tagged-view/incoming',
          _outgoing:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:my-tagged-view/outgoing',
          _project:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
          _rev: 1,
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/nxv:my-tagged-view',
          _updatedAt: '2022-05-23T12:58:31.273Z',
          _updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          _uuid: 'bfb02595-0bb0-4cf8-a85e-dbd74498e632',
        },
        {
          '@id':
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/3e804708-347c-40a1-903b-11d8bab2c35c',
          '@type': ['View', 'SparqlView'],
          _constrainedBy:
            'https://bluebrain.github.io/nexus/schemas/views.json',
          _createdAt: '2022-05-23T12:59:12.992Z',
          _createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          _deprecated: false,
          _incoming:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/3e804708-347c-40a1-903b-11d8bab2c35c/incoming',
          _outgoing:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/3e804708-347c-40a1-903b-11d8bab2c35c/outgoing',
          _project:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
          _rev: 1,
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/3e804708-347c-40a1-903b-11d8bab2c35c',
          _updatedAt: '2022-05-23T12:59:12.992Z',
          _updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          _uuid: '934c9d42-9536-418c-b5d2-c47c78ab709c',
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),

  rest.get(
    deltaPath(
      '/views/org/project/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultSparqlIndex'
    ),
    (req, res, ctx) => {
      const mockResponse = {
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/sparql.json',
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
        ],
        '@id':
          'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
        '@type': ['SparqlView', 'View'],
        includeDeprecated: true,
        includeMetadata: true,
        permission: 'views/query',
        resourceSchemas: [],
        resourceTypes: [],
        _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/views.json',
        _createdAt: '2021-04-01T11:39:02.988Z',
        _createdBy: deltaPath('/nexus/v1/realms/bbp/users/kerrien'),
        _deprecated: false,
        _incoming: deltaPath('/nexus/v1/views/nise/kerrien/graph/incoming'),
        _outgoing: deltaPath('/nexus/v1/views/nise/kerrien/graph/outgoing'),
        _project: deltaPath('/org/project'),
        _rev: 1,
        _self: deltaPath('/v1/views/org/project/graph'),
        _updatedAt: '2021-04-01T11:39:02.988Z',
        _updatedBy: deltaPath('/nexus/v1/realms/bbp/users/kerrien'),
        _uuid: '30a45385-12e3-46f1-a9ba-1246d7232e7e',
      };
      return res(
        // Respond with a 200 status code
        ctx.status(200),
        ctx.json(mockResponse)
      );
    }
  ),
  rest.get(deltaPath('/acls/org/project'), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/acls.json',
      ],
      _total: 1,
      _results: [
        {
          '@id': deltaPath('/v1/acls/org1'),
          '@type': 'AccessControlList',
          acl: [
            {
              identity: {
                '@id': deltaPath('/v1/realms/myrealm/groups/a-group'),
                '@type': 'Group',
                group: 'a-group',
                realm: 'myrealm',
              },
              permissions: ['projects/read'],
            },
            {
              identity: {
                '@id': deltaPath('/v1/realms/realm/groups/some-group'),
                '@type': 'Group',
                group: 'some-group',
                realm: 'realm',
              },
              permissions: ['projects/read', 'projects/write'],
            },
            {
              identity: {
                '@id': deltaPath('/v1/realms/local/users/localuser'),
                '@type': 'User',
                realm: 'local',
                subject: 'localuser',
              },
              permissions: [
                'acls/read',
                'acls/write',
                'resources/read',
                'resources/write',
              ],
            },
          ],
          _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/acls.json',
          _createdAt: '2021-05-11T11:03:06.071Z',
          _createdBy: deltaPath('/v1/anonymous'),
          _deprecated: false,
          _path: '/org1',
          _rev: 1,
          _self: deltaPath('/v1/acls/org1'),
          _updatedAt: '2021-05-11T11:03:06.071Z',
          _updatedBy: deltaPath('/v1/anonymous'),
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/resources/org/project/_/:Id'), (req, res, ctx) => {
    const { Id } = req.params;
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/studio/context',
      ],
      '@id': Id,
      '@type': 'Studio',
      description: `test description for ${Id}`,
      label: `label for ${Id}`,
      plugins: [
        {
          customise: true,
          plugins: [
            { expanded: false, key: 'video' },
            { expanded: false, key: 'preview' },
            { expanded: false, key: 'admin' },
            { expanded: false, key: 'circuit' },
            { expanded: false, key: 'image-collection-viewer' },
            { expanded: false, key: 'jira' },
            { expanded: false, key: 'markdown' },
          ],
        },
      ],
      workspaces: ['id-1', 'id-2', 'id-3', 'id-4'],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/resources/org/project'), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: 19,
      _results: [
        {
          '@id': 'id-1',
          label: 'test-label-1',
        },
        {
          '@id': 'id-2',
          label: 'test-label-2',
        },
        {
          '@id': 'id-3',
          label: 'test-label-3',
        },
        {
          '@id': 'id-4',
          label: 'test-label-4',
        },
        {
          '@id': 'id-5',
          label: 'test-label-5',
        },
        {
          '@id': 'id-6',
          label: 'test-label-6',
        },
        {
          '@id': 'id-7',
          label: 'test-label-7',
        },
        {
          '@id': 'id-8',
          label: 'test-label-8',
        },
        {
          '@id': 'id-9',
          label: 'test-label-9',
        },
        {
          '@id': 'id-10',
          label: 'test-label-10',
        },
      ],
    };

    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/resources'), (req, res, ctx) => {
    const type = req.url.searchParams.get('type');
    let results = [
      {
        '@id': 'id-1',
        label: 'test-label-1',
        projectLabel: 'project',
        _project: '/org1/project1',
        type: STUDIO_TYPE,
      },
      {
        '@id': 'id-2',
        label: 'test-label-2',
        _project: '/org/project',
        type: '',
      },
      {
        '@id': 'id-3',
        label: 'test-label-3',
        _project: '/org/project',
        type: '',
      },
      {
        '@id': 'id-4',
        label: 'test-label-4',
        _project: '/org/project',
        type: STUDIO_TYPE,
      },
      {
        '@id': 'id-5',
        label: 'test-label-5',
        _project: '/org/project',
        type: STUDIO_TYPE,
      },
      {
        '@id': 'id-6',
        label: 'test-label-6',
        _project: '/org/project',
        type: STUDIO_TYPE,
      },
      {
        '@id': 'id-7',
        label: 'test-label-7',
        _project: '/org/project',
        type: '',
      },
      {
        '@id': 'id-8',
        label: 'test-label-8',
        _project: '/org/project',
        type: '',
      },
      {
        '@id': 'id-9',
        label: 'test-label-9',
        _project: '/org/project',
        type: '',
      },
      {
        '@id': 'id-10',
        label: 'test-label-10',
        _project: '/org/project',
        type: STUDIO_TYPE,
      },
    ];
    results = results.filter(t => t.type === STUDIO_TYPE);
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: type ? 5 : 19,
      _results: results,
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/identities'), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/identities.json',
      ],
      identities: [
        {
          '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/anonymous',
          '@type': 'Anonymous',
        },
        {
          '@id':
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/authenticated',
          '@type': 'Authenticated',
          realm: 'local',
        },
        {
          '@id':
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          '@type': 'User',
          realm: 'local',
          subject: 'localuser',
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
  rest.get(deltaPath('/org/:label'), (req, res, ctx) => {
    const { label } = req.params;
    const mockResponse = [
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr1',
        '@type': 'Project',
        apiMappings: [],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr1/',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr1/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T10:00:41.803Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr1',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr1',
        _updatedAt: '2023-04-20T10:53:41.803Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: '932bc410-0149-4cb5-97cd-4048fb4b07d2',
      },
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr2',
        '@type': 'Project',
        apiMappings: [
          {
            namespace: 'https://neuroshapes.org/dash/',
            prefix: 'datashapes',
          },
        ],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr2/_/',
        description: 'test project 2',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr2/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://neuroshapes.org/dash/',
            _prefix: 'datashapes',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr2',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr2',
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
    ];
    return res(ctx.status(200), ctx.json(mockResponse));
  }),
  rest.get(deltaPath('/orgs'), (req, res, ctx) => {
    const mockResponse = [
      {
        '@id': 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/TEST1',
        '@type': 'Organization',
        description: '',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/organizations.json',
        _createdAt: '2022-06-24T07:52:52.146Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test1',
        _deprecated: false,
        _label: 'TEST1',
        _rev: 1,
        _self: 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/Analysis-Plugin',
        _updatedAt: '2023-04-20T07:52:52.146Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test1',
        _uuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
      },
      {
        '@id': 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/TEST2',
        '@type': 'Organization',
        description: '',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/organizations.json',
        _createdAt: '2022-06-24T07:52:52.146Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test2',
        _deprecated: false,
        _label: 'TEST2',
        _rev: 1,
        _self: 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/Analysis-Plugin',
        _updatedAt: '2023-04-20T07:52:52.146Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test2',
        _uuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
      },
      {
        '@id': 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/TEST3',
        '@type': 'Organization',
        description: '',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/organizations.json',
        _createdAt: '2022-06-24T07:52:52.146Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test3',
        _deprecated: false,
        _label: 'TEST3',
        _rev: 1,
        _self: 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/Analysis-Plugin',
        _updatedAt: '2023-04-20T07:52:52.146Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/test3',
        _uuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
          'https://bluebrain.github.io/nexus/contexts/search.json',
          'https://bluebrain.github.io/nexus/contexts/organizations.json',
        ],
        _results: mockResponse,
        _total: 3,
      })
    );
  }),
  rest.get(deltaPath('/projects/:orgLabel'), (req, res, ctx) => {
    const { orgLabel } = req.params;
    const mockResponse = [
      {
        '@id': `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/test1-pr1`,
        '@type': 'Project',
        apiMappings: [],
        base: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${orgLabel}/test1-pr1/`,
        vocab: `https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/${orgLabel}/test1-pr1/`,
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T10:00:41.803Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: orgLabel,
        _markedForDeletion: false,
        _organizationLabel: orgLabel,
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/test1-pr1`,
        _updatedAt: '2023-04-20T10:53:41.803Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: '932bc410-0149-4cb5-97cd-4048fb4b07d2',
      },
      {
        '@id': `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/test1-pr2`,
        '@type': 'Project',
        apiMappings: [
          {
            namespace: 'https://neuroshapes.org/dash/',
            prefix: 'datashapes',
          },
        ],
        base: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${orgLabel}/test1-pr2/_/`,
        description: 'test project 2',
        vocab: `https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/${orgLabel}/test1-pr2/`,
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://neuroshapes.org/dash/',
            _prefix: 'datashapes',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: orgLabel,
        _markedForDeletion: false,
        _organizationLabel: orgLabel,
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/test1-pr2`,
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
          'https://bluebrain.github.io/nexus/contexts/search.json',
          'https://bluebrain.github.io/nexus/contexts/projects.json',
        ],
        _results: mockResponse,
        _total: 2,
      })
    );
  }),
  rest.get(deltaPath('/projects'), (req, res, ctx) => {
    const mockResponse = [
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr1',
        '@type': 'Project',
        apiMappings: [],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr1/',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr1/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T10:00:41.803Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr1',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr1',
        _updatedAt: '2023-04-20T10:53:41.803Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: '932bc410-0149-4cb5-97cd-4048fb4b07d2',
      },
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr2',
        '@type': 'Project',
        apiMappings: [
          {
            namespace: 'https://neuroshapes.org/dash/',
            prefix: 'datashapes',
          },
        ],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr2/_/',
        description: 'test project 2',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr2/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://neuroshapes.org/dash/',
            _prefix: 'datashapes',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr2',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr2',
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr3',
        '@type': 'Project',
        apiMappings: [
          {
            namespace: 'https://neuroshapes.org/dash/',
            prefix: 'datashapes',
          },
        ],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr3/_/',
        description: 'test project 2',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr3/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://neuroshapes.org/dash/',
            _prefix: 'datashapes',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr3',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr3',
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
      {
        '@id':
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr4',
        '@type': 'Project',
        apiMappings: [
          {
            namespace: 'https://neuroshapes.org/dash/',
            prefix: 'datashapes',
          },
        ],
        base:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/test1/test1-pr4/_/',
        description: 'test project 2',
        vocab:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/test1/test1-pr4/',
        _constrainedBy:
          'https://bluebrain.github.io/nexus/schemas/projects.json',
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: 'https://neuroshapes.org/dash/',
            _prefix: 'datashapes',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
            _prefix: 'nxv',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
            _prefix: 'documents',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
            _prefix: 'defaultResolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
            _prefix: 'schema',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: 'resource',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _prefix: '_',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
            _prefix: 'view',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/storages.json',
            _prefix: 'storage',
          },
          {
            _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
            _prefix: 'file',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/resolvers.json',
            _prefix: 'resolver',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
            _prefix: 'graph',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/schemas/archives.json',
            _prefix: 'archive',
          },
          {
            _namespace:
              'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
            _prefix: 'defaultStorage',
          },
        ],
        _label: 'test1-pr4',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/test1/test1-pr4',
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy:
          'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
          'https://bluebrain.github.io/nexus/contexts/search.json',
          'https://bluebrain.github.io/nexus/contexts/projects.json',
        ],
        _results: mockResponse,
        _total: 4,
      })
    );
  }),
];
