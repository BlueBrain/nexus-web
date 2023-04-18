import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';

export const dashboardResource = rest.get(
  deltaPath(
    `resources/copies/sscx/_/${encodeURIComponent(
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937'
    )}`
  ),
  (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/workflowStep/table-context',
      ],
      '@id':
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937',
      '@type': 'FusionTable',
      configuration: {
        '@type': 'text',
        enableFilter: true,
        enableSearch: true,
        enableSort: true,
        format: '',
        name: 's',
      },
      dataQuery:
        'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> \nSELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 20',
      description: 'fix sorting in sparql',
      enableDownload: true,
      enableInteractiveRows: true,
      enableSave: true,
      enableSearch: true,
      name: 'sparql_3345',
      resultsPerPage: 5,
      view: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2023-04-18T09:35:40.017Z',
      _createdBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
      _deprecated: false,
      _incoming:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937/incoming',
      _outgoing:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937/outgoing',
      _project: 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
      _rev: 1,
      _schemaProject:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
      _self:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937',
      _updatedAt: '2023-04-18T09:35:40.017Z',
      _updatedBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const dashboardVocabulary = rest.get(
  deltaPath(
    `/views/copies/sscx/${encodeURIComponent(
      'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex'
    )}`
  ),
  (_, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/sparql.json',
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
      ],
      '@id': 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
      '@type': ['SparqlView', 'View'],
      description: 'A Sparql view of all resources in the project.',
      includeDeprecated: true,
      includeMetadata: true,
      name: 'Default Sparql view',
      permission: 'views/query',
      resourceSchemas: [],
      resourceTypes: [],
      _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/views.json',
      _createdAt: '2022-03-31T13:03:51.298Z',
      _createdBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
      _deprecated: false,
      _incoming:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph/incoming',
      _indexingRev: 1,
      _outgoing:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph/outgoing',
      _project: 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
      _rev: 1,
      _self: 'https://dev.nise.bbp.epfl.ch/nexus/v1/views/copies/sscx/graph',
      _updatedAt: '2022-03-31T13:03:51.298Z',
      _updatedBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
      _uuid: '183a9aae-bc2e-4ee2-9b1a-cebd0e8f4be8',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const Original_Order_1_Sorted_2 = '42_VALUE';
export const Original_Order_2_Sorted_1 = '0_VALUE';
export const Original_Order_3_Sorted_3 = 'Malory_Archer';
export const Original_Order_4_Sorted_4 = 'STERLING_ARCHER';
export const Original_Order_5_Sorted_6 = 'Woodhouse';
export const Original_Order_6_Sorted_5 = 'sterling_archer';
export const Mock_Var = 'S';

export const sparqlViewSingleResult = rest.post(
  deltaPath('/views/copies/sscx/graph/sparql'),
  (req, res, ctx) => {
    const mockResponse = {
      head: {
        vars: ['self', 's'],
      },
      results: {
        bindings: [
          {
            s: {
              type: 'uri',
              value: Original_Order_1_Sorted_2,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F2dabb9c7-cac2-4f6a-9f34-348d55ac48be',
            },
          },
          {
            s: {
              type: 'uri',
              value: Original_Order_2_Sorted_1,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
            },
          },
          {
            s: {
              type: 'uri',
              value: Original_Order_3_Sorted_3,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F40d5b36d-78a0-4743-9de6-9741726a03c5',
            },
          },
          {
            s: {
              type: 'uri',
              value: Original_Order_4_Sorted_4,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F9261dd9b-7785-4b60-a2b5-d890957ddfb6',
            },
          },
          {
            s: {
              type: 'uri',
              value: Original_Order_5_Sorted_6,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fneuroshapes.org',
            },
          },
          {
            s: {
              type: 'uri',
              value: Original_Order_6_Sorted_5,
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fincf.github.io%2Fneuroshapes%2Fcontexts%2Fschema.json',
            },
          },
        ],
      },
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);
