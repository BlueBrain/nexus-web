import { rest } from 'msw';

export const handlers = [
  rest.get(
    'https://localhost:3000/resources/org/project/_/:Id',
    (req, res, ctx) => {
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
    }
  ),
  rest.get('https://localhost:3000/resources/org/project', (req, res, ctx) => {
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
  rest.get('https://localhost:3000/resources', (req, res, ctx) => {
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
          projectLabel: 'project',
          _project: '/org1/project1',
        },
        {
          '@id': 'id-2',
          label: 'test-label-2',
          _project: '/org/project',
        },
        {
          '@id': 'id-3',
          label: 'test-label-3',
          _project: '/org/project',
        },
        {
          '@id': 'id-4',
          label: 'test-label-4',
          _project: '/org/project',
        },
        {
          '@id': 'id-5',
          label: 'test-label-5',
          _project: '/org/project',
        },
        {
          '@id': 'id-6',
          label: 'test-label-6',
          _project: '/org/project',
        },
        {
          '@id': 'id-7',
          label: 'test-label-7',
          _project: '/org/project',
        },
        {
          '@id': 'id-8',
          label: 'test-label-8',
          _project: '/org/project',
        },
        {
          '@id': 'id-9',
          label: 'test-label-9',
          _project: '/org/project',
        },
        {
          '@id': 'id-10',
          label: 'test-label-10',
          _project: '/org/project',
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }),
];
