export const DEFAULT_RESOURCE = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': [], // optional
};

export const DISK_STORAGE = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'DiskStorage',
  default: false,
  volume: '',
  readPermission: [], // optional
  writePermission: [], // optional
};

export const REMOTE_STORAGE = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'RemoteDiskStorage',
  default: false,
  endpoint: '',
  credentials: '', // optional
  readPermission: [], // optional
  writePermission: [], // optional
};

export const S3_STORAGE = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'S3Storage',
  default: false,
  bucket: '', // optional
  endpoint: '', // optional
  accessKey: '', // optional
  secretKey: '', // optional
};

export const SPARQL_VIEW = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'SparqlView',
  resourceSchemas: [],
  resourceTypes: [],
  resourceTag: '',
  includeMetadata: true,
  includeDeprecated: false,
};

export const ELASTIC_SEARCH_VIEW = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'ElasticSearchView',
  resourceSchemas: [],
  resourceTypes: [],
  resourceTag: '',
  includeMetadata: true,
  includeDeprecated: false,
  mapping: {},
};

export const AGGREGATE_VIEW = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'AggregateElasticSearchView',
  views: [{ project: '', viewId: '' }],
};

export const IN_PROJECT = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'InProject',
  priority: 0,
};

export const CROSS_PROJECT = {
  '@context': {}, // optional
  '@id': '', // optional
  '@type': 'CrossProject',
  resourceTypes: [],
  projects: [],
  identities: [],
  priority: 0,
};

export const DEFAULT_RESOURCES: { [key: string]: any } = {
  DiskStorage: DISK_STORAGE,
  RemoteStorage: REMOTE_STORAGE,
  S3Storage: S3_STORAGE,
  SparqlView: SPARQL_VIEW,
  ElasticSearchView: ELASTIC_SEARCH_VIEW,
  AggregateSparqlView: AGGREGATE_VIEW,
  AggregateElasticSearchView: AGGREGATE_VIEW,
  InProject: IN_PROJECT,
  CrossProject: CROSS_PROJECT,
  _: DEFAULT_RESOURCE,
};

export const RESOURCES_SCHEMA_URI: { [key: string]: string } = {
  Storage: 'https://bluebrain.github.io/nexus/schemas/storage.json',
  View: 'https://bluebrain.github.io/nexus/schemas/view.json',
  Resolver: 'https://bluebrain.github.io/nexus/schemas/resolver.json',
  _: '_',
};
