import { deltaPath } from '__mocks__/handlers/handlers';
import { rest } from 'msw';

export const dashboardResource = rest.get(
  deltaPath(
    `resources/bbp/agents/_/${encodeURIComponent(
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937'
    )}`
  ),
  (_, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/workflowStep/table-context',
      ],
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/8478b9ae-c50e-4178-8aae-16221f2c6937',
      '@type': 'FusionTable',
      configuration: [
        {
          '@type': 'text',
          enableFilter: false,
          enableSearch: false,
          enableSort: false,
          format: '',
          name: 'familyName',
        },
        {
          '@type': 'text',
          enableFilter: true,
          enableSearch: true,
          enableSort: true,
          format: '',
          name: 'givenName',
        },
        {
          '@type': 'text',
          enableFilter: false,
          enableSearch: false,
          enableSort: false,
          format: '',
          name: 'id',
        },
      ],
      dataQuery:
        'PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/> \nPREFIX sdo: <http://schema.org/>\nSELECT ?self ?givenName ?familyName ?id\nWHERE {\n  ?id a sdo:Person ; \n          nxv:self ?self ;\n          sdo:givenName ?givenName ;\n          sdo:familyName ?familyName .\n}\nLIMIT 100',
      description: '',
      enableDownload: true,
      enableInteractiveRows: true,
      enableSave: true,
      enableSearch: true,
      name: 'Person',
      resultsPerPage: 5,
      view: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2023-04-17T11:25:29.845Z',
      _createdBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/localuser',
      _deprecated: false,
      _incoming:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937/incoming',
      _outgoing:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937/outgoing',
      _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/bbp/agents',
      _rev: 5,
      _schemaProject:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/bbp/agents',
      _self:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937',
      _updatedAt: '2023-04-20T12:04:47.563Z',
      _updatedBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/localuser',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const dashboardVocabulary = rest.get(
  deltaPath(
    `/views/bbp/agents/${encodeURIComponent(
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
      _createdAt: '2020-09-14T16:23:43.529Z',
      _createdBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/alibou',
      _deprecated: false,
      _incoming:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/views/bbp/agents/graph/incoming',
      _indexingRev: 1,
      _outgoing:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/views/bbp/agents/graph/outgoing',
      _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/bbp/agents',
      _rev: 1,
      _self: 'https://staging.nise.bbp.epfl.ch/nexus/v1/views/bbp/agents/graph',
      _updatedAt: '2020-09-14T16:23:43.529Z',
      _updatedBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/alibou',
      _uuid: 'c9bf849d-7287-4a21-9d6d-4ddaa7c0d920',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const ORIGINAL_1_SORTED_2 = '42_VALUE';
export const ORIGINAL_2_SORTED_1 = '0_VALUE';
export const ORIGINAL_3_SORTED_3 = 'Malory';
export const ORIGINAL_4_SORTED_4 = 'Sterling';
export const ORIGINAL_5_SORTED_6 = 'Woodhouse';
export const ORIGINAL_6_SORTED_5 = 'sterling';

export const MOCK_VAR = 'Given Name';

export const sparqlViewSingleResult = rest.post(
  deltaPath(
    `/views/bbp/agents/${encodeURIComponent(
      'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex'
    )}/sparql`
  ),
  (req, res, ctx) => {
    const mockResponse = {
      head: {
        vars: ['self', 'givenName', 'familyName', 'id'],
      },
      results: {
        bindings: [
          {
            familyName: {
              type: 'literal',
              value: 'Kane',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_1_SORTED_2,
            },
            id: {
              type: 'uri',
              value:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/c3358e61-7650-4954-99b7-f7572cbf5d5e',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/persons%2Fc3358e61-7650-4954-99b7-f7572cbf5d5e',
            },
          },
          {
            familyName: {
              type: 'literal',
              value: 'Krieger',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_2_SORTED_1,
            },
            id: {
              type: 'uri',
              value:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/9aa9776b-ebbc-4d11-a856-409fe1781c92',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/persons%2F9aa9776b-ebbc-4d11-a856-409fe1781c92',
            },
          },
          {
            familyName: {
              type: 'literal',
              value: 'Archer',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_3_SORTED_3,
            },
            id: {
              type: 'uri',
              value: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/lorin',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/https:%2F%2Fbbp.epfl.ch%2Fnexus%2Fv1%2Frealms%2Fbbp%2Fusers%2Florin',
            },
          },
          {
            familyName: {
              type: 'literal',
              value: 'Archer',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_4_SORTED_4,
            },
            id: {
              type: 'uri',
              value:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/ab002140-78a3-4966-9caf-f930822904ba',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/datashapes:person/persons%2Fab002140-78a3-4966-9caf-f930822904ba',
            },
          },
          {
            familyName: {
              type: 'literal',
              value: 'Arthur',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_5_SORTED_6,
            },
            id: {
              type: 'uri',
              value:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/95e75e3e-6247-4bc2-a2f6-67b9ddb55543',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/datashapes:person/persons%2F95e75e3e-6247-4bc2-a2f6-67b9ddb55543',
            },
          },
          {
            familyName: {
              type: 'literal',
              value: 'Archer',
            },
            givenName: {
              type: 'literal',
              value: ORIGINAL_6_SORTED_5,
            },
            id: {
              type: 'uri',
              value:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/287b93c3-40f9-42d2-9d77-b16bc536eb8a',
            },
            self: {
              type: 'uri',
              value:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/persons%2F287b93c3-40f9-42d2-9d77-b16bc536eb8a',
            },
          },
        ],
      },
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const getMockStudioResource = (givenName: string, self: string) => ({
  familyName: {
    type: 'literal',
    value: 'Archer',
  },
  givenName: {
    type: 'literal',
    value: givenName,
  },
  id: {
    type: 'uri',
    value: self,
  },
  self: {
    type: 'uri',
    value: self,
  },
});

export const sparqlViewResultHandler = (
  studioRows: ReturnType<typeof getMockStudioResource>[]
) => {
  return rest.post(
    deltaPath(
      '/views/bbp/agents/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultSparqlIndex/sparql'
    ),
    (req, res, ctx) => {
      const mockResponse = {
        head: {
          vars: ['self', 'givenName', 'familyName', 'id'],
        },
        results: {
          bindings: [...studioRows],
        },
      };

      return res(ctx.status(200), ctx.json(mockResponse));
    }
  );
};

export const fetchResourceForDownload = rest.get(
  deltaPath(
    `/resources/bbp/agents/_/persons%2Fc3358e61-7650-4954-99b7-f7572cbf5d5g`
  ),
  (req, res, ctx) => {
    const self = req.url.pathname.slice(req.url.pathname.lastIndexOf('/') + 1);
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/workflowStep/table-context',
      ],
      '@id': `https://bbp.epfl.ch/neurosciencegraph/data/${self}`,
      '@type': 'Resource',
      _self: `https://localhost:3000/resources/bbp/agents/_/${self}`,
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);
