import { deltaPath } from '__mocks__/handlers/handlers';
import { rest } from 'msw';

export const infiniteProjectsHandler = rest.get(deltaPath('/projects'), (req, res, ctx) => {
  const { orgLabel } = req.params;
  const mockResponse = [
    {
      '@id': `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${orgLabel}/test1-pr1`,
      '@type': 'Project',
      apiMappings: [],
      base: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${orgLabel}/test1-pr1/`,
      vocab: `https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/${orgLabel}/test1-pr1/`,
      _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/projects.json',
      _createdAt: '2023-04-20T10:00:41.803Z',
      _createdBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
      _deprecated: false,
      _effectiveApiMappings: [
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
          _prefix: 'nxv',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
          _prefix: 'documents',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
          _prefix: 'defaultResolver',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
          _prefix: 'schema',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
          _prefix: 'resource',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
          _prefix: '_',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
          _prefix: 'view',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/storages.json',
          _prefix: 'storage',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
          _prefix: 'file',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/resolvers.json',
          _prefix: 'resolver',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
          _prefix: 'graph',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/archives.json',
          _prefix: 'archive',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
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
      _updatedBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
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
      _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/projects.json',
      _createdAt: '2023-04-20T09:27:43.752Z',
      _createdBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
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
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
          _prefix: 'documents',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
          _prefix: 'defaultResolver',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
          _prefix: 'schema',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
          _prefix: 'resource',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
          _prefix: '_',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
          _prefix: 'view',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/storages.json',
          _prefix: 'storage',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
          _prefix: 'file',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/resolvers.json',
          _prefix: 'resolver',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
          _prefix: 'graph',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/schemas/archives.json',
          _prefix: 'archive',
        },
        {
          _namespace: 'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
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
      _updatedBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah',
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
});

export const aclHandler = rest.get(deltaPath('/acls'), (req, res, ctx) => {
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
            permissions: ['acls/read', 'acls/write', 'resources/read', 'resources/write'],
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
});
