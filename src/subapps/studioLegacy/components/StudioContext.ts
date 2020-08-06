const STUDIO_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/studio/',
      '@vocab': 'https://bluebrainnexus.io/studio/vocabulary/',
      label: {
        '@id': 'http://www.w3.org/2000/01/rdf-schema#label',
      },
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
      workspaces: {
        '@id': 'https://bluebrainnexus.io/studio/vocabulary/workspaces',
        '@container': '@set',
        '@type': '@id',
      },
      plugins: {
        '@id': 'https://bluebrainnexus.io/studio/vocabulary/plugins',
        '@container': '@set',
      },
      dashboards: { '@container': '@set' },
      dashboard: {
        '@id': 'https://bluebrainnexus.io/studio/vocabulary/dashboard',
        '@type': '@id',
      },
      view: {
        '@id': 'https://bluebrainnexus.io/studio/vocabulary/view',
        '@type': '@id',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/studio/context',
};

export default STUDIO_CONTEXT;
