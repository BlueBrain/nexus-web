export const DEFAULT_RESOURCE = {
  '@id': '', // optional
  '@type': [], // optional
};

export const DISK_STORAGE = {
  '@id': '', // optional
  '@type': 'DiskStorage',
  default: false,
  volume: '',
};

export const REMOTE_STORAGE = {
  '@id': '', // optional
  '@type': 'RemoteDiskStorage',
  default: false,
  folder: '',
};

export const SPARQL_VIEW = {
  '@id': '', // optional
  '@type': 'SparqlView',
  resourceSchemas: [],
  resourceTypes: [],
  includeMetadata: true,
  includeDeprecated: false,
};

export const ELASTIC_SEARCH_VIEW = {
  '@id': '', // optional
  '@type': 'ElasticSearchView',
  resourceSchemas: [],
  resourceTypes: [],
  sourceAsText: false,
  includeMetadata: true,
  includeDeprecated: false,
  mapping: {},
};

export const COMPOSITE_VIEW = {
  '@id': '', // optional
  '@type': ['CompositeView', 'Beta', 'View'],
  sources: [],
  projections: [],
  rebuildStrategy: '',
};

export const AGGREGATE_ES_VIEW = {
  '@id': '', // optional
  '@type': 'AggregateElasticSearchView',
  views: [{ project: '', viewId: '' }],
};

export const AGGREGATE_SPARQL_VIEW = {
  '@id': '', // optional
  '@type': 'AggregateSparqlView',
  views: [{ project: '', viewId: '' }],
};

export const IN_PROJECT = {
  '@id': '', // optional
  '@type': 'InProject',
  priority: 2,
};

export const CROSS_PROJECT = {
  '@id': '', // optional
  '@type': 'CrossProject',
  resourceTypes: [],
  projects: [],
  identities: [],
  priority: 2,
};

export const DEFAULT_RESOURCES: { [key: string]: any } = {
  DiskStorage: DISK_STORAGE,
  RemoteStorage: REMOTE_STORAGE,
  SparqlView: SPARQL_VIEW,
  ElasticSearchView: ELASTIC_SEARCH_VIEW,
  CompositeView: COMPOSITE_VIEW,
  AggregateSparqlView: AGGREGATE_SPARQL_VIEW,
  AggregateElasticSearchView: AGGREGATE_ES_VIEW,
  InProject: IN_PROJECT,
  CrossProject: CROSS_PROJECT,
  _: DEFAULT_RESOURCE,
};

export const RESOURCES_SCHEMA_URI: { [key: string]: string } = {
  Storage: 'https://bluebrain.github.io/nexus/schemas/storages.json',
  View: 'https://bluebrain.github.io/nexus/schemas/views.json',
  Resolver: 'https://bluebrain.github.io/nexus/schemas/resolvers.json',
  _: '_',
};

export const RESOURCES_TYPES_URLS: { [key: string]: string } = {
  DiskStorage:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-storages-api.html#local-disk-storage',
  RemoteDiskStorage:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-storages-api.html#remote-disk-storage',
  SparqlView: 'https://bluebrainnexus.io/docs/api/current/kg/kg-views-api.html#sparqlview',
  ElasticSearchView:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-views-api.html#elasticsearchview',
  AggregateSparqlView:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-views-api.html#aggregatesparqlview',
  AggregateElasticSearchView:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-views-api.html#aggregateelasticsearchview',
  InProject:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-resolvers-api.html#inproject-resolver',
  CrossProject:
    'https://bluebrainnexus.io/docs/api/current/kg/kg-resolvers-api.html#crossproject-resolver',
};
