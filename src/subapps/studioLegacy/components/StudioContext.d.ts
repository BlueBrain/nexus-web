declare const STUDIO_CONTEXT: {
  '@context': {
    '@base': string;
    '@vocab': string;
    label: {
      '@id': string;
    };
    name: {
      '@id': string;
    };
    description: {
      '@id': string;
    };
    workspaces: {
      '@id': string;
      '@container': string;
      '@type': string;
    };
    plugins: {
      '@id': string;
      '@container': string;
    };
    dashboards: {
      '@container': string;
    };
    dashboard: {
      '@id': string;
      '@type': string;
    };
    view: {
      '@id': string;
      '@type': string;
    };
  }[];
  '@id': string;
};
export default STUDIO_CONTEXT;
