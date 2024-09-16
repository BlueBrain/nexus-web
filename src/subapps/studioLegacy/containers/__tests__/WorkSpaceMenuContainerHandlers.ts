import { deltaPath } from '__mocks__/handlers/handlers';
import { rest } from 'msw';

export const workspaceHandler = rest.get(
  deltaPath('/resources/org/project/_/w1'),
  (_, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/studio/context',
      ],
      '@id': 'w1',
      '@type': 'StudioWorkSpace',
      description: `A test work space`,
      label: `w1`,
      dashboards: [
        {
          dashboard: 'd1',
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);

export const dashboardHandler = rest.get(
  deltaPath('/resources/org/project/_/d1'),
  (_req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/studio/context',
      ],
      '@id': 'd1',
      '@type': 'StudioDashboard',
      description: `A test dashboard`,
      label: `d1`,
      dataTable: {
        '@id': 'dataTable1',
      },
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);

export const tableHandler = rest.get(
  deltaPath('/resources/org/project/_/dataTable1'),
  (_req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrainnexus.io/studio/context',
      ],
      '@id': 'dataTable1',
      '@type': 'FusionTable',
      description: `A test dataTable`,
      label: 'dataTable1',
      configuration: [
        {
          '@type': 'text',
          enableFilter: false,
          enableSearch: false,
          enableSort: false,
          format: '',
          name: 'o',
        },
        {
          '@type': 'text',
          enableFilter: false,
          enableSearch: false,
          enableSort: false,
          format: '',
          name: 'p',
        },
      ],
      dataQuery:
        'SELECT DISTINCT ?self ?p ?o \nWHERE {\n     ?self ?p ?o .\n}\nLIMIT 10',
      enableDownload: true,
      enableInteractiveRows: true,
      enableSave: true,
      enableSearch: true,
      name: 'Example',
      resultsPerPage: 5,
      view: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);

export const aclHandler = rest.get(
  deltaPath('/acls/org/project'),
  (_, res, ctx) => {
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
              permissions: ['resources/read'], // No write permission.
            },
          ],
          _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/acls.json',
          _createdAt: '2021-05-11T11:03:06.071Z',
          _createdBy: deltaPath('/v1/anonymous'),
          _deprecated: false,
          _path: '/org/project',
          _rev: 1,
          _self: deltaPath('/v1/acls/org1'),
          _updatedAt: '2021-05-11T11:03:06.071Z',
          _updatedBy: deltaPath('/v1/anonymous'),
        },
      ],
    };
    return res.once(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);
